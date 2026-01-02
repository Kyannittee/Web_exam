// order.js - логика оформления заявок и расчетов

const Order = {
    selectedItem: null,
    itemType: null,
    
    init: function() {
        this.setupEventListeners();
    },
    
    openCreateModal: function(item, type) {
        console.log('=== открываем модальное окно ==='); 
        console.log('Тип:', type);
        console.log('Данные:', item);
        this.selectedItem = item;
        this.itemType = type || 'course';
        
        var modalsContainer = document.getElementById('modals-container');
        if (!modalsContainer) {
            modalsContainer = document.createElement('div');
            modalsContainer.id = 'modals-container';
            document.body.appendChild(modalsContainer);
        }
        
        var modalData = {
            id: item.id ? parseInt(item.id.toString().trim()) : 0,
            course: type === 'course' ? {
                id: item.id,
                name: item.name || '',
                teacher: item.teacher || '',
                total_length: item.total_length || 1,
                week_length: item.week_length || 1,
                course_fee_per_hour: item.course_fee_per_hour || 0,
                start_dates: item.start_dates || [] 
            } : null,
            tutor: type === 'tutor' ? {
                id: item.id,
                name: item.name || '',
                price_per_hour: item.price_per_hour || 0
            } : null
        };
        
        console.log('Modal data подготовлено:', modalData); 
        var modalHTML = Components.modalOrderForm(modalData, false);
        modalsContainer.innerHTML += modalHTML;
        
        var modalElement = document.getElementById('orderModal');
        if (modalElement) {
            var modal = new bootstrap.Modal(modalElement);
            modal.show();
            this.initForm();
        }
    },
    
    initForm: function() {
        if (!this.selectedItem) return;
        
        this.populateStartDates();
        this.setupFormListeners();
        this.calculatePrice();
    },
    
    populateStartDates: function() {
        // Для курсов: даты из API (start_dates)
        // Для репетиторов: API не предоставляет расписание, 
        // генерируем ближайшие 30 дней для примера
        console.log('=== заполняем даты ===');
        console.log('Тип элемента:', this.itemType);
        console.log('Выбранный элемент:', this.selectedItem);
        
        // Безопасная проверка
        if (this.itemType === 'course') {
            console.log('start_dates:', 
                this.selectedItem ? this.selectedItem.
                    start_dates : 'undefined');
            
            // Проверяем длину безопасно
            var startDatesLength = 0;
            if (this.selectedItem && 
                this.selectedItem.start_dates && 
                Array.isArray(this.selectedItem.start_dates)) {
                startDatesLength = this.selectedItem.start_dates.length;
            }
            console.log('Длина массива start_dates:', startDatesLength);
        } else {
            console.log('Это репетитор, у него нет start_dates');
        }
        
        var dateSelect = document.getElementById('startDate');
        if (!dateSelect) {
            console.error('dateSelect не найден!');
            return;
        }
        
        dateSelect.innerHTML = '<option value="">Выберите дату</option>';
        
        // для курсов используем start_dates
        if (this.itemType === 'course' && 
            this.selectedItem && 
            this.selectedItem.start_dates && 
            Array.isArray(this.selectedItem.start_dates)) {
            
            var uniqueDates = [];
            var datesMap = {};
            
            for (var i = 0; i < this.selectedItem.start_dates.length; i++) {
                var dateStr = this.selectedItem.start_dates[i];
                if (dateStr) {
                    var datePart = dateStr.split('T')[0];
                    if (!datesMap[datePart]) {
                        datesMap[datePart] = true;
                        uniqueDates.push(datePart);
                    }
                }
            }
            
            for (var j = 0; j < uniqueDates.length; j++) {
                var date = uniqueDates[j];
                var dateObj = new Date(date);
                var formattedDate = dateObj.toLocaleDateString('ru-RU');
                dateSelect.innerHTML += 
                    '<option value="' + date + '">' + 
                    formattedDate + '</option>';
            }
        } else {
            // Для репетиторов или если нет start_dates - генерируем даты
            var today = new Date();
            for (var k = 1; k <= 30; k++) {
                var date = new Date(today);
                date.setDate(today.getDate() + k);
                var dateStr = date.toISOString().split('T')[0];
                var formattedDate = date.toLocaleDateString('ru-RU');
                
                dateSelect.innerHTML += 
                    '<option value="' + dateStr + '">' + 
                    formattedDate + '</option>';
            }
        }
    },
    
    setupFormListeners: function() {
        var self = this;
        var form = document.getElementById('orderForm');
        var dateSelect = document.getElementById('startDate');
        var personsInput = document.getElementById('persons');
        
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                self.submitOrder();
            });
        }
        
        if (dateSelect) {
            dateSelect.addEventListener('change', function(e) {
                self.updateTimeSlots(e.target.value);
                self.calculatePrice();
            });
        }
        
        if (personsInput) {
            personsInput.addEventListener('input', function() {
                self.calculatePrice();
            });
        }
        
        var checkboxes = [
            'supplementary', 
            'personalized', 
            'excursions', 
            'interactive',
            'assessment'
        ];
        
        for (var i = 0; i < checkboxes.length; i++) {
            var checkbox = document.getElementById(checkboxes[i]);
            if (checkbox) {
                checkbox.addEventListener('change', function() {
                    self.calculatePrice();
                });
            }
        }
        
        var modal = document.getElementById('orderModal');
        if (modal) {
            modal.addEventListener('hidden.bs.modal', function() {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
            });
        }
    },
    
    updateTimeSlots: function(dateStr) {
        var timeSelect = document.getElementById('startTime');
        if (!timeSelect) return;
        
        timeSelect.innerHTML = '<option value="">Выберите время</option>';
        timeSelect.disabled = true;
        
        if (!dateStr) return;
        
        if (this.itemType === 'course' && this.selectedItem.start_dates) {
            var timesForDate = [];
            var timesMap = {};
            
            for (var i = 0; i < this.selectedItem.start_dates.length; i++) {
                var fullDate = this.selectedItem.start_dates[i];
                if (fullDate && fullDate.startsWith(dateStr)) {
                    var time = fullDate.split('T')[1];
                    if (time) {
                        time = time.substring(0, 5);
                        if (!timesMap[time]) {
                            timesMap[time] = true;
                            timesForDate.push(time);
                        }
                    }
                }
            }
            
            for (var j = 0; j < timesForDate.length; j++) {
                var time = timesForDate[j];
                var hour = parseInt(time.split(':')[0]);
                var minutes = time.split(':')[1];
                var timeLabel = time;
                
                if (this.selectedItem.week_length) {
                    var endHour = hour + this.selectedItem.week_length;
                    timeLabel += ' - ' + endHour + ':' + minutes;
                }
                
                timeSelect.innerHTML += 
                    '<option value="' + time + '">' + 
                    timeLabel + '</option>';
            }
            
            timeSelect.disabled = false;
        } else {
            var timeSlots = [
                '09:00', '10:00', '11:00', '12:00', '14:00',
                '15:00', '16:00', '17:00', '18:00', '19:00'
            ];
            
            for (var k = 0; k < timeSlots.length; k++) {
                var time = timeSlots[k];
                timeSelect.innerHTML += 
                    '<option value="' + time + '">' + time + '</option>';
            }
            
            timeSelect.disabled = false;
        }
        
        this.updateEndDate(dateStr);
    },
    
    updateEndDate: function(startDateStr) {
        var endDateInput = document.getElementById('endDate');
        if (!startDateStr || !endDateInput) return;
        
        var startDate = new Date(startDateStr);
        var duration = this.itemType === 'course' ? 
            (this.selectedItem.total_length || 1) : 1;
        
        if (this.itemType === 'course') {
            var endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + (duration * 7));
            endDateInput.value = endDate.toLocaleDateString('ru-RU');
        } else {
            endDateInput.value = startDate.toLocaleDateString('ru-RU');
        }
    },
    
    calculatePrice: function() {
        if (!this.selectedItem) return 0;
        
        // Получаем данные из формы
        var personsInput = document.getElementById('persons');
        var dateSelect = document.getElementById('startDate');
        var timeSelect = document.getElementById('startTime');
        
        if (!personsInput || !dateSelect || !timeSelect) return 0;
        
        var personsValue = personsInput.value;
        var persons = parseInt(personsValue) || 1;
        if (persons < 1) persons = 1;
        if (persons > 20) persons = 20;
        
        // 1. базовая стоимость
        var basePricePerHour = this.itemType === 'course' ? 
            (this.selectedItem.course_fee_per_hour || 0) : 
            (this.selectedItem.price_per_hour || 0);
        
        // 2. продолжительность
        var totalLength = this.selectedItem.total_length || 1;
        var weekLength = this.selectedItem.week_length || 1;
        var durationHours = this.itemType === 'course' ? 
            totalLength * weekLength : 1;
        
        // 3. временные наценки
        var dateStr = dateSelect.value;
        var timeStr = timeSelect.value;
        
        var weekendMultiplier = 1;
        if (dateStr) {
            var date = new Date(dateStr);
            var dayOfWeek = date.getDay();
            if (dayOfWeek === 0 || dayOfWeek === 6) {
                weekendMultiplier = 1.5;
            }
        }
        
        var morningSurcharge = 0;
        var eveningSurcharge = 0;
        if (timeStr) {
            var hour = parseInt(timeStr.split(':')[0]);
            if (hour >= 9 && hour < 12) {
                morningSurcharge = 400;
            }
            if (hour >= 18 && hour < 20) {
                eveningSurcharge = 1000;
            }
        }
        
        // 4. основная формула
        var baseCost = basePricePerHour * durationHours;
        var timeAdjustedCost = (baseCost * weekendMultiplier) + 
                            morningSurcharge + eveningSurcharge;
        
        // 5. процентные множители
        var percentageMultiplier = 1.0;
        
        // Автоматические опции
        var earlyRegistration = this.checkEarlyRegistration(dateStr);
        var groupEnrollment = persons >= 5;
        var intensiveCourse = this.itemType === 'course' && weekLength >= 5;
        
        if (earlyRegistration) percentageMultiplier -= 0.10;
        if (groupEnrollment) percentageMultiplier -= 0.15;
        if (intensiveCourse) percentageMultiplier += 0.20;
        
        // Пользовательские чекбоксы
        var supplementaryEl = document.getElementById('supplementary');
        var personalizedEl = document.getElementById('personalized');
        var excursionsEl = document.getElementById('excursions');
        var interactiveEl = document.getElementById('interactive');
        var assessmentEl = document.getElementById('assessment');
        
        var supplementary = supplementaryEl && supplementaryEl.checked;
        var personalized = personalizedEl && personalizedEl.checked;
        var excursions = excursionsEl && excursionsEl.checked;
        var interactive = interactiveEl && interactiveEl.checked;
        var assessment = assessmentEl && assessmentEl.checked;
        
        if (excursions) percentageMultiplier += 0.25;
        if (interactive) percentageMultiplier += 0.50;
        
        // 6. фикс. доплаты
        var fixedAdditions = 0;
        if (supplementary) fixedAdditions += 2000;
        if (personalized && this.itemType === 'course') {
            fixedAdditions += 1500 * totalLength;
        }
        if (assessment) fixedAdditions += 300;
        
        // 7. итог для одного
        var costPerPerson = 
        (timeAdjustedCost * percentageMultiplier) + fixedAdditions;
        
        // 8. умножение на количество
        var totalCost = Math.round(costPerPerson * persons);
        
        // Обновляем отображение
        this.updatePriceDisplay({
            basePricePerHour: basePricePerHour,
            durationHours: durationHours,
            persons: persons,
            weekendMultiplier: weekendMultiplier,
            morningSurcharge: morningSurcharge,
            eveningSurcharge: eveningSurcharge,
            earlyRegistration: earlyRegistration,
            groupEnrollment: groupEnrollment,
            intensiveCourse: intensiveCourse,
            supplementary: supplementary,
            personalized: personalized,
            excursions: excursions,
            interactive: interactive,
            totalCost: totalCost
        });
        
        return totalCost;
    },
    
    checkEarlyRegistration: function(dateStr) {
        if (!dateStr) return false;
        
        var courseDate = new Date(dateStr);
        var today = new Date();
        var monthLater = new Date(today);
        monthLater.setMonth(today.getMonth() + 1);
        
        return courseDate > monthLater;
    },
    
    updatePriceDisplay: function(data) {
        var calculationDiv = document.getElementById('priceCalculation');
        var totalPriceSpan = document.getElementById('totalPrice');
        
        if (!calculationDiv || !totalPriceSpan) return;
        
        var html = '';
        
        html += '<div class="small mb-1">';
        html += '<span class="badge bg-info me-1">Базовый тариф:</span>';
        html += data.basePricePerHour + ' ₽/час × ';
        html += data.durationHours + ' час = ';
        html += (data.basePricePerHour * data.durationHours) + ' ₽';
        html += '</div>';
        
        if (data.weekendMultiplier > 1) {
            html += '<div class="small mb-1 text-warning">';
            html += '×' + data.weekendMultiplier + ' (выходной день)';
            html += '</div>';
        }
        
        if (data.morningSurcharge > 0) {
            html += '<div class="small mb-1">';
            html += '+' + data.morningSurcharge + ' ₽ (утреннее время)';
            html += '</div>';
        }
        
        if (data.eveningSurcharge > 0) {
            html += '<div class="small mb-1">';
            html += '+' + data.eveningSurcharge + ' ₽ (вечернее время)';
            html += '</div>';
        }
        
        var appliedOptions = [];
        if (data.earlyRegistration) {
            appliedOptions.push('Ранняя регистрация (-10%)');
        }
        if (data.groupEnrollment) {
            appliedOptions.push('Групповая запись (-15%)');
        }
        if (data.intensiveCourse) {
            appliedOptions.push('Интенсивный курс (+20%)');
        }
        if (data.supplementary) {
            appliedOptions.push('Доп. материалы (+2000₽)');
        }
        if (data.personalized) {
            appliedOptions.push('Индивидуальные занятия');
        }
        if (data.excursions) {
            appliedOptions.push('Экскурсии (+25%)');
        }
        if (data.interactive) {
            appliedOptions.push('Интерактивная платформа (+50%)');
        }
        
        if (appliedOptions.length > 0) {
            html += '<div class="small mb-2">';
            html += '<strong>Примененные опции:</strong><br>';
            for (var i = 0; i < appliedOptions.length; i++) {
                html += '• ' + appliedOptions[i] + '<br>';
            }
            html += '</div>';
        }
        
        html += '<div class="small">';
        html += '<span class="badge bg-success me-1">Студентов:</span>';
        html += '× ' + data.persons;
        html += '</div>';
        
        calculationDiv.innerHTML = html;
        totalPriceSpan.textContent = data.totalCost.toLocaleString() + ' ₽';
    },
    
    submitOrder: function() {
        var self = this;
        
        if (!this.selectedItem) {
            Utils.showNotification('Не выбран курс или репетитор', 'error');
            return;
        }
        
        var startDateEl = document.getElementById('startDate');
        var startTimeEl = document.getElementById('startTime');
        var personsEl = document.getElementById('persons');
        
        if (!startDateEl || !startTimeEl || !personsEl) {
            Utils.showNotification('Заполните все поля', 'error');
            return;
        }
        
        if (!startDateEl.value || !startTimeEl.value) {
            Utils.showNotification('Выберите дату и время', 'error');
            return;
        }
        
        var supplementaryEl = document.getElementById('supplementary');
        var personalizedEl = document.getElementById('personalized');
        var excursionsEl = document.getElementById('excursions');
        var interactiveEl = document.getElementById('interactive');
        var assessmentEl = document.getElementById('assessment');
        
        var formData = {
            date_start: startDateEl.value,
            time_start: startTimeEl.value,
            persons: parseInt(personsEl.value) || 1,
            duration: this.itemType === 'course' ? 
                ((this.selectedItem.total_length || 1) * 
                (this.selectedItem.week_length || 1)) : 1,
            price: this.calculatePrice(),
            early_registration: this.checkEarlyRegistration(startDateEl.value),
            group_enrollment: parseInt(personsEl.value) >= 5,
            intensive_course: this.itemType === 'course' && 
                        (this.selectedItem.week_length || 0) >= 5,
            supplementary: supplementaryEl ? 
                supplementaryEl.checked : false,
            personalized: personalizedEl ? 
                personalizedEl.checked : false,
            excursions: excursionsEl ? 
                excursionsEl.checked : false,
            interactive: interactiveEl ? 
                interactiveEl.checked : false,
            assessment: assessmentEl ? 
                assessmentEl.checked : false, 
        };
        
        if (this.itemType === 'course') {
            formData.course_id = this.selectedItem.id;
        } else {
            formData.tutor_id = this.selectedItem.id;
        }
        
        Api.createOrder(formData)
            .then(function(result) {
                var modal = bootstrap.Modal.getInstance(
                    document.getElementById('orderModal')
                );
                if (modal) modal.hide();
                
                if (typeof Cabinet !== 'undefined' && Cabinet.loadOrders) {
                    Cabinet.loadOrders();
                }
                
                Utils.showNotification('Заявка создана!', 'success');
            })
            .catch(function(error) {
                console.error('Ошибка создания заявки:', error);
                var errorMsg = error.message || 'Неизвестная ошибка';
                Utils.showNotification('Ошибка: ' + errorMsg, 'error');
            });
    },
    
    deleteOrderWithConfirmation: function(orderId) {
        var modalHTML = 
            '<div class="modal fade" id="deleteModal" tabindex="-1">' +
            '    <div class="modal-dialog">' +
            '        <div class="modal-content">' +
            '            <div class="modal-header">' +
            '                <h5 class="modal-title">' + 
            '                   Подтверждение удаления</h5>' +
            '                <button type="button" class="btn-close"' +
            '                    data-bs-dismiss="modal"></button>' +
            '            </div>' +
            '            <div class="modal-body">' +
            '                <p>Вы уверены, что хотите удалить заявку #' + 
            orderId + '?</p>' +
            '                <p class="text-muted small">' +
            '                    Это действие нельзя отменить.' +
            '                </p>' +
            '            </div>' +
            '            <div class="modal-footer">' +
            '                <button type="button" class="btn btn-secondary"' +
            '                    data-bs-dismiss="modal">Нет</button>' +
            '                <button type="button" class="btn btn-danger"' +
            '                    id="confirmDeleteBtn">Да, удалить</button>' +
            '            </div>' +
            '        </div>' +
            '    </div>' +
            '</div>';
        
        var modalsContainer = document.getElementById('modals-container');
        if (!modalsContainer) {
            modalsContainer = document.createElement('div');
            modalsContainer.id = 'modals-container';
            document.body.appendChild(modalsContainer);
        }
        
        modalsContainer.innerHTML += modalHTML;
        
        var modal = new bootstrap.Modal(
            document.getElementById('deleteModal')
        );
        modal.show();
        
        var self = this;
        document.getElementById('confirmDeleteBtn').onclick = function() {
            Api.deleteOrder(orderId)
                .then(function() {
                    modal.hide();
                    
                    if (typeof Cabinet !== 'undefined' && Cabinet.loadOrders) {
                        Cabinet.loadOrders();
                    }
                    
                    Utils.showNotification('Заявка удалена', 'success');
                    
                    var deleteModal = document.getElementById('deleteModal');
                    if (deleteModal && deleteModal.parentNode) {
                        deleteModal.parentNode.removeChild(deleteModal);
                    }
                })
                .catch(function(error) {
                    console.error('Ошибка удаления:', error);
                    var errorMsg = error.message || 'Неизвестная ошибка';
                    Utils.showNotification('Ошибка: ' + errorMsg, 'error');
                });
        };
        
        var deleteModal = document.getElementById('deleteModal');
        if (deleteModal) {
            deleteModal.addEventListener('hidden.bs.modal', function() {
                if (deleteModal && deleteModal.parentNode) {
                    deleteModal.parentNode.removeChild(deleteModal);
                }
            });
        }
    },
    
    openEditModal: async function(orderId, item, type) {
        try {
            // Закрываем и удаляем все предыдущие модальные окна
            const existingModal = document.getElementById('orderModal');
            if (existingModal) {
                const modalInstance = bootstrap.Modal.
                    getInstance(existingModal);
                if (modalInstance) modalInstance.hide();
                existingModal.remove();
            }
            
            // Загружаем полные данные заявки если не переданы
            if (!item || !item.orderData) {
                const order = await Api.getOrder(orderId);
                if (type === 'course' && order.course_id) {
                    item = await Api.getCourse(order.course_id);
                } else if (order.tutor_id) {
                    item = await Api.getTutor(order.tutor_id);
                }
                item.orderData = order;
            }
            
            this.selectedItem = item;
            this.itemType = type;
            
            // Создаем безопасную копию данных без функций
            const orderData = {
                id: item.orderData.id,
                date_start: item.orderData.date_start,
                time_start: item.orderData.time_start,
                persons: item.orderData.persons || 1,
                price: item.orderData.price || 0,
                supplementary: item.orderData.supplementary || false,
                personalized: item.orderData.personalized || false,
                excursions: item.orderData.excursions || false,
                interactive: item.orderData.interactive || false,
                early_registration: item.orderData.early_registration || false,
                group_enrollment: item.orderData.group_enrollment || false,
                intensive_course: item.orderData.intensive_course || false
            };
            
            // Добавляем информацию о курсе/репетиторе
            if (type === 'course') {
                orderData.courseName = item.name || 'Курс';
                orderData.tutorName = item.teacher || 'Преподаватель';
                orderData.course_fee_per_hour = item.course_fee_per_hour || 0;
                orderData.total_length = item.total_length || 1;
                orderData.week_length = item.week_length || 1;
            } else {
                orderData.tutorName = item.name || 'Репетитор';
                orderData.price_per_hour = item.price_per_hour || 0;
            }
            
            // Создаем модальное окно
            const modalsContainer = document.getElementById('modals-container');
            if (!modalsContainer) {
                const container = document.createElement('div');
                container.id = 'modals-container';
                document.body.appendChild(container);
            }
            
            const modalHTML = Components.modalOrderForm(orderData, true);
            document.getElementById('modals-container').innerHTML += modalHTML;
            
            // Показываем модальное окно
            const modalElement = document.getElementById('orderModal');
            if (modalElement) {
                const modal = new bootstrap.Modal(modalElement);
                
                // Обработчик закрытия модального окна
                modalElement.addEventListener('hidden.bs.modal', function() {
                    if (modalElement.parentNode) {
                        modalElement.parentNode.removeChild(modalElement);
                    }
                    self.selectedItem = null;
                    self.itemType = null;
                });
                
                modal.show();
                
                // Заполняем форму данными
                this.initForm();
                this.fillFormWithOrderData(orderData);
                
                
                // Меняем обработчик submit на обновление
                const form = document.getElementById('orderForm');
                if (form) {
                    // Удаляем все предыдущие обработчики
                    const newForm = form.cloneNode(true);
                    form.parentNode.replaceChild(newForm, form);
                    
                    // Добавляем новый обработчик
                    newForm.addEventListener('submit', (e) => {
                        e.preventDefault();
                        this.updateOrder(orderId);
                    });
                    
                    // Добавляем скрытое поле с ID заявки
                    const orderIdInput = document.createElement('input');
                    orderIdInput.type = 'hidden';
                    orderIdInput.name = 'order_id';
                    orderIdInput.value = orderId;
                    orderIdInput.id = 'orderId';
                    newForm.appendChild(orderIdInput);
                }
            }
            
        } catch (error) {
            console.error('Ошибка открытия формы редактирования:', error);
            Utils.showNotification('Не удалось открыть форму редактирования'
                , 'error');
        }
    },

    // Заполнение формы данными заявки
    fillFormWithOrderData: function(order) {
        const self = this;
        
        // Устанавливаем количество человек
        const personsInput = document.getElementById('persons');
        if (personsInput) personsInput.value = order.persons || 1;
        
        // Устанавливаем дату
        const dateSelect = document.getElementById('startDate');
        if (dateSelect && order.date_start) {
            dateSelect.value = order.date_start;
            
            // Обновляем временные слоты
            this.updateTimeSlots(order.date_start);
            
            // Устанавливаем время после загрузки слотов
            setTimeout(() => {
                const timeSelect = document.getElementById('startTime');
                if (timeSelect && order.time_start) {
                    const timeValue = order.time_start.substring(0, 5);
                    timeSelect.value = timeValue;
                    
                    // Прокручиваем к выбранному времени
                    for (let i = 0; i < timeSelect.options.length; i++) {
                        if (timeSelect.options[i].value === timeValue) {
                            timeSelect.selectedIndex = i;
                            break;
                        }
                    }
                }
            }, 300); // Увеличиваем задержку для гарантированной загрузки
        }
        
        // Устанавливаем чекбоксы
        const checkboxes = ['supplementary', 'personalized',
            'excursions', 'interactive', 'assessment'];
        checkboxes.forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox) {
                checkbox.checked = order[id] || false;
            }
        });
        
        // Пересчитываем стоимость
        setTimeout(() => {
            self.calculatePrice();
            
            // Обновляем отображение итоговой стоимости
            const totalPriceSpan = document.getElementById('totalPrice');
            if (totalPriceSpan && order.price) {
                totalPriceSpan.textContent = 
                Cabinet.formatPrice(order.price) + ' ₽';
            }
        }, 400);
    },

    setupPriceCalculationListeners: function() {
        var self = this;
        
        // Элементы формы
        var dateSelect = document.getElementById('startDate');
        var timeSelect = document.getElementById('startTime');
        var personsInput = document.getElementById('persons');
        
        // Слушаем изменения даты
        if (dateSelect) {
            dateSelect.addEventListener('change', function() {
                self.calculatePrice();
            });
        }
        
        // Слушаем изменения времени
        if (timeSelect) {
            timeSelect.addEventListener('change', function() {
                self.calculatePrice();
            });
        }
        
        // Слушаем изменения количества человек
        if (personsInput) {
            personsInput.addEventListener('input', function() {
                self.calculatePrice();
            });
        }
        
        // Все чекбоксы опций
        var checkboxes = ['supplementary', 'personalized', 'excursions', 
            'interactive', 'assessment'];
        
        checkboxes.forEach(function(checkboxId) {
            var checkbox = document.getElementById(checkboxId);
            if (checkbox) {
                checkbox.addEventListener('change', function() {
                    self.calculatePrice();
                });
            }
        });
    },
    
    // Обновление заявки
    updateOrder: async function(orderId) {
        if (!this.selectedItem) {
            Utils.showNotification('Ошибка: не выбран курс или репетитор'
                , 'error');
            return;
        }
        
        // Собираем данные формы
        const startDateEl = document.getElementById('startDate');
        const startTimeEl = document.getElementById('startTime');
        const personsEl = document.getElementById('persons');
        
        if (!startDateEl || !startTimeEl || !personsEl) {
            Utils.showNotification('Заполните все поля', 'error');
            return;
        }
        
        if (!startDateEl.value || !startTimeEl.value) {
            Utils.showNotification('Выберите дату и время', 'error');
            return;
        }
        
        const supplementaryEl = document.getElementById('supplementary');
        const personalizedEl = document.getElementById('personalized');
        const excursionsEl = document.getElementById('excursions');
        const interactiveEl = document.getElementById('interactive');
        const assessmentEl = document.getElementById('assessment');
        
        // Собираем обновляемые поля
        const formData = {
            date_start: startDateEl.value,
            time_start: startTimeEl.value,
            persons: parseInt(personsEl.value) || 1,
            price: this.calculatePrice(),
            early_registration: this.checkEarlyRegistration(startDateEl.value),
            group_enrollment: parseInt(personsEl.value) >= 5,
            intensive_course: this.itemType === 'course' && 
                        (this.selectedItem.week_length || 0) >= 5,
            supplementary: supplementaryEl ? supplementaryEl.checked : false,
            personalized: personalizedEl ? personalizedEl.checked : false,
            excursions: excursionsEl ? excursionsEl.checked : false,
            assessment: false,
            interactive: interactiveEl ? interactiveEl.checked : false,
            assessment: assessmentEl ? assessmentEl.checked : false,
        };
        
        console.log('Обновляем заявку #' + orderId, formData);
        
        try {
            // Используем updateOrder (PUT)
            await Api.updateOrder(orderId, formData);
            
            // Закрываем модальное окно
            const modalElement = document.getElementById('orderModal');
            if (modalElement) {
                const modal = bootstrap.Modal.getInstance(modalElement);
                if (modal) modal.hide();
            }
            
            // Обновляем личный кабинет
            if (typeof Cabinet !== 'undefined' && Cabinet.loadOrders) {
                Cabinet.loadOrders();
            }
            
            Utils.showNotification('Заявка успешно обновлена!', 'success');
            
        } catch (error) {
            console.error('Ошибка обновления заявки:', error);
            const errorMsg = error.message || 'Неизвестная ошибка';
            Utils.showNotification('Ошибка: ' + errorMsg, 'error');
        }
    },

    setupEventListeners: function() {
        console.log('Order system initialized');
    }
};

window.Order = Order;