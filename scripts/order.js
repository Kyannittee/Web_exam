// order.js - логика оформления заявок и расчетов

const Order = {
    selectedItem: null,
    itemType: null,
    
    init: function() {
        this.setupEventListeners();
    },
    
    openCreateModal: function(item, type) {
        this.selectedItem = item;
        this.itemType = type || 'course';
        
        var modalsContainer = document.getElementById('modals-container');
        if (!modalsContainer) {
            modalsContainer = document.createElement('div');
            modalsContainer.id = 'modals-container';
            document.body.appendChild(modalsContainer);
        }
        
        var modalData = {
            course: type === 'course' ? item : null,
            tutor: type === 'tutor' ? item : null
        };
        
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
        var dateSelect = document.getElementById('startDate');
        if (!dateSelect) return;
        
        dateSelect.innerHTML = '<option value="">Выберите дату</option>';
        
        if (this.itemType === 'course' && this.selectedItem.start_dates) {
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
            'interactive'
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
        
        var personsInput = document.getElementById('persons');
        var dateSelect = document.getElementById('startDate');
        var timeSelect = document.getElementById('startTime');
        
        if (!personsInput || !dateSelect || !timeSelect) return 0;
        
        var personsValue = personsInput.value;
        var persons = parseInt(personsValue) || 1;
        if (persons < 1) persons = 1;
        if (persons > 20) persons = 20;
        
        var basePricePerHour = this.itemType === 'course' ? 
            (this.selectedItem.course_fee_per_hour || 0) : 
            (this.selectedItem.price_per_hour || 0);
        
        var totalLength = this.selectedItem.total_length || 1;
        var weekLength = this.selectedItem.week_length || 1;
        var durationHours = this.itemType === 'course' ? 
            totalLength * weekLength : 1;
        
        var dateStr = dateSelect.value;
        var timeStr = timeSelect.value;
        
        var baseCost = basePricePerHour * durationHours;
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
        
        var costPerPerson = (baseCost * weekendMultiplier) + 
                           morningSurcharge + eveningSurcharge;
        
        var supplementaryEl = document.getElementById('supplementary');
        var personalizedEl = document.getElementById('personalized');
        var excursionsEl = document.getElementById('excursions');
        var interactiveEl = document.getElementById('interactive');
        
        var supplementary = supplementaryEl && supplementaryEl.checked;
        var personalized = personalizedEl && personalizedEl.checked;
        var excursions = excursionsEl && excursionsEl.checked;
        var interactive = interactiveEl && interactiveEl.checked;
        
        var earlyRegistration = this.checkEarlyRegistration(dateStr);
        var groupEnrollment = persons >= 5;
        var intensiveCourse = this.itemType === 'course' && 
                              weekLength >= 5;
        
        if (supplementary) {
            costPerPerson += 2000;
        }
        
        if (personalized && this.itemType === 'course') {
            costPerPerson += 1500 * totalLength;
        }
        
        if (excursions) {
            costPerPerson *= 1.25;
        }
        
        if (interactive) {
            costPerPerson *= 1.5;
        }
        
        if (intensiveCourse) {
            costPerPerson *= 1.2;
        }
        
        if (earlyRegistration) {
            costPerPerson *= 0.9;
        }
        
        if (groupEnrollment) {
            costPerPerson *= 0.85;
        }
        
        var totalCost = Math.round(costPerPerson * persons);
        
        this.updatePriceDisplay({
            basePricePerHour: basePricePerHour,
            durationHours: durationHours,
            persons: persons,
            weekendMultiplier: weekendMultiplier,
            morningSurcharge: morningSurcharge,
            eveningSurcharge: eveningSurcharge,
            supplementary: supplementary,
            personalized: personalized,
            excursions: excursions,
            interactive: interactive,
            earlyRegistration: earlyRegistration,
            groupEnrollment: groupEnrollment,
            intensiveCourse: intensiveCourse,
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
        
        var formData = {
            date_start: startDateEl.value,
            time_start: startTimeEl.value,
            persons: parseInt(personsEl.value) || 1,
            duration: this.itemType === 'course' ? 
                ((this.selectedItem.total_length || 1) * 
                 (this.selectedItem.week_length || 1)) : 1,
            price: this.calculatePrice(),
            early_registration: this.checkEarlyRegistration(
                startDateEl.value
            ),
            group_enrollment: parseInt(personsEl.value) >= 5,
            intensive_course: this.itemType === 'course' && 
                           (this.selectedItem.week_length || 0) >= 5,
            supplementary: supplementaryEl ? 
                supplementaryEl.checked : false,
            personalized: personalizedEl ? 
                personalizedEl.checked : false,
            excursions: excursionsEl ? 
                excursionsEl.checked : false,
            assessment: false,
            interactive: interactiveEl ? 
                interactiveEl.checked : false
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
    
    setupEventListeners: function() {
        console.log('Order system initialized');
    }
};

window.Order = Order;