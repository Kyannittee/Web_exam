// cabinet.js - логика личного кабинета

const Cabinet = {
    // Текущая страница пагинации
    currentPage: 1,
    itemsPerPage: 5,
    
    // Инициализация личного кабинета
    init: function() {
        console.log('Инициализация личного кабинета...');
        
        if (typeof Components !== 'undefined' && Components.init) {
            Components.init();
            console.log('Шапка и футер инициализированы');
        } else {
            console.error('Components не загружен или нет метода init!');
        }
        
        this.setupEventListeners();
        this.loadOrders();
    },
    
    // Загрузка заказов с API
    loadOrders: async function() {
        try {
            const orders = await Api.getOrders();
            
            if (orders.length === 0) {
                this.displayOrders([]);
                return;
            }
            
            // Загружаем дополнительную информацию для каждой заявки
            const formattedOrders = [];
            
            for (let i = 0; i < orders.length; i++) {
                const order = orders[i];
                let courseName = 'Неизвестный курс';
                let tutorName = 'Неизвестный репетитор';
                let itemName = '';
                
                // Загружаем информацию о курсе или репетиторе
                if (order.course_id) {
                    try {
                        const course = await Api.getCourse(order.course_id);
                        courseName = course.name || 'Курс #' + order.course_id;
                        itemName = courseName;
                        tutorName = course.teacher || 'Преподаватель';
                    } catch (error) {
                        console.warn('Не удалось загрузить курс:', error);
                        courseName = 'Курс #' + order.course_id;
                        itemName = courseName;
                    }
                } else if (order.tutor_id) {
                    try {
                        const tutor = await Api.getTutor(order.tutor_id);
                        tutorName = tutor.name 
                        || 'Репетитор #' + order.tutor_id;
                        itemName = tutorName;
                        courseName = 'Индивидуальные занятия';
                    } catch (error) {
                        console.warn('Не удалось загрузить репетитора:', error);
                        tutorName = 'Репетитор #' + order.tutor_id;
                        itemName = tutorName;
                    }
                }
                
                formattedOrders.push({
                    id: order.id,
                    courseName: itemName,
                    tutorName: tutorName,
                    dateStart: order.date_start,
                    timeStart: order.time_start ? order.time_start
                        .substring(0, 5) : '',
                    price: order.price || 0,
                    status: 'active',
                    orderData: order // Сохраняем исходные данные
                });
            }
            
            this.displayOrders(formattedOrders);
            
        } catch (error) {
            console.log('Ошибка загрузки заявок, используем демо-данные:'
                , error);
            this.displayOrders(this.getMockOrders());
        }
    },
    
    // Временные данные 
    getMockOrders: function() {
        return [
            {
                id: 1,
                courseName: 'Английский для начинающих',
                tutorName: 'Ирина Петровна',
                dateStart: '2025-02-15',
                timeStart: '18:00',
                price: 12000,
                status: 'active'
            },
            {
                id: 2,
                courseName: 'Испанский средний уровень',
                tutorName: 'Мария Гарсия',
                dateStart: '2025-03-01',
                timeStart: '14:00',
                price: 15000,
                status: 'pending'
            },
            {
                id: 3,
                courseName: 'Французский разговорный',
                tutorName: 'Пьер Дюпон',
                dateStart: '2025-02-20',
                timeStart: '10:00',
                price: 18000,
                status: 'completed'
            }
        ];
    },
    
    // Отображение заказов в таблице
    displayOrders: function(orders) {
        const tbody = document.getElementById('orders-body');
        const paginationContainer = document
            .getElementById('pagination-container');
        
        if (orders.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-5">
                        <i class="bi bi-inbox display-4 text-muted"></i>
                        <h5 class="mt-3">У вас пока нет заявок</h5>
                        <p class="text-muted">
                            Перейдите на главную страницу, 
                            чтобы оформить первую заявку
                        </p>
                        <a href="index.html" class="btn btn-accent mt-2">
                            <i class="bi bi-house me-1"></i>На главную
                        </a>
                    </td>
                </tr>
            `;
            paginationContainer.classList.add('d-none');
            return;
        }
        
        // Пагинация
        const totalPages = Math.ceil(orders.length / this.itemsPerPage);
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const paginatedOrders = orders.slice(startIndex, endIndex);
        
        // Заполняем таблицу
        tbody.innerHTML = paginatedOrders.map(order => `
            <tr>
                <td>${order.id}</td>
                <td>
                    <strong>${order.courseName}</strong><br>
                    <small class="text-muted">${order.tutorName}</small>
                </td>
                <td>${this.formatDate(order.dateStart)}</td>
                <td>${order.timeStart}</td>
                <td>
                    <span class="badge bg-success">
                        ${this.formatPrice(order.price)} ₽
                    </span>
                </td>
                <td>
                    <div class="btn-group btn-group-sm" role="group">
                        <button type="button" class="btn btn-outline-info" 
                                onclick="Cabinet.showOrderDetails(${order.id})"
                                data-bs-toggle="tooltip" title="Подробнее">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button type="button" class="btn btn-outline-warning"
                                onclick="Cabinet.editOrder(${order.id})"
                                data-bs-toggle="tooltip" title="Изменить">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button type="button" class="btn btn-outline-danger"
                                onclick="Cabinet.confirmDelete(${order.id})"
                                data-bs-toggle="tooltip" title="Удалить">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
        
        // Показываем пагинацию если нужно
        if (totalPages > 1) {
            this.renderPagination(totalPages);
            paginationContainer.classList.remove('d-none');
        } else {
            paginationContainer.classList.add('d-none');
        }
        
        // Инициализируем тултипы Bootstrap
        this.initTooltips();
    },
    
    // Форматирование даты
    formatDate: function(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU');
    },
    
    // Форматирование цены
    formatPrice: function(price) {
        if (!price) return '0';
        return price.toLocaleString('ru-RU');
    },
    
    // Рендер пагинации
    renderPagination: function(totalPages) {
        const pagination = document.getElementById('pagination');
        let html = '';
        
        // Кнопка "Назад"
        html += `
            <li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" 
                   onclick="Cabinet.changePage(${this.currentPage - 1})">
                    <i class="bi bi-chevron-left"></i>
                </a>
            </li>
        `;
        
        // Номера страниц
        for (let i = 1; i <= totalPages; i++) {
            html += `
                <li class="page-item ${this.currentPage === i ? 'active' : ''}">
                    <a class="page-link" href="#" 
                       onclick="Cabinet.changePage(${i})">${i}</a>
                </li>
            `;
        }
        
        // Кнопка "Вперед"
        html += `
            <li class="page-item ${this.currentPage === totalPages ? 
        'disabled' : ''}">
                <a class="page-link" href="#" 
                   onclick="Cabinet.changePage(${this.currentPage + 1})">
                    <i class="bi bi-chevron-right"></i>
                </a>
            </li>
        `;
        
        pagination.innerHTML = html;
    },
    
    // Смена страницы
    changePage: function(page) {
        if (page < 1) return;
        this.currentPage = page;
        this.loadOrders();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    
    // Инициализация тултипов
    initTooltips: function() {
        const tooltipTriggerList = [].slice.call(
            document.querySelectorAll('[data-bs-toggle="tooltip"]')
        );
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    },
    
    // Методы для кнопок (уже не заглушки)
    showOrderDetails: async function(orderId) {
        try {
            const order = await Api.getOrder(orderId);
            
            let itemInfo = '';
            if (order.course_id) {
                const course = await Api.getCourse(order.course_id);
                itemInfo = `<strong>Курс:</strong> 
                ${course.name || 'Курс #' + order.course_id}<br>
                        <strong>Преподаватель:</strong> 
                        ${course.teacher || 'Преподаватель'}`;
            } else {
                const tutor = await Api.getTutor(order.tutor_id);
                itemInfo = `<strong>Репетитор:</strong> 
                ${tutor.name || 'Репетитор #' + order.tutor_id}`;
            }
            
            // Форматируем цену 
            const formattedPrice = this.formatPrice(order.price || 0);
            const formattedDate = this.formatDate(order.date_start);
            const timeStart = order.time_start 
                ? order.time_start.substring(0, 5) : '';
            
            // Создаем модальное окно с деталями
            const modalHTML = `
                <div class="modal fade" id="orderDetailsModal" tabindex="-1">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">
                                Детали заявки #${orderId}</h5>
                                <button type="button" class="btn-close" 
                                data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                <div class="mb-3">
                                    ${itemInfo}
                                </div>
                                <div class="row">
                                    <div class="col-md-6">
                                        <p><strong>Дата начала:</strong>
                                        <br>${formattedDate}</p>
                                        <p><strong>Время:</strong>
                                        <br>${timeStart}</p>
                                    </div>
                                    <div class="col-md-6">
                                        <p><strong>Кол-во студентов:</strong>
                                        <br>${order.persons || 1}</p>
                                        <p><strong>Стоимость:</strong>
                                        <br>${formattedPrice} ₽</p>
                                    </div>
                                </div>
                                <div class="mt-3">
                                    <h6>Дополнительные опции:</h6>
                                    <ul class="list-unstyled">
                                        ${order.early_registration ?
        '<li>Ранняя регистрация (-10%)</li>' : ''}
                                        ${order.group_enrollment ? 
        '<li>Групповая запись (-15%)</li>' : ''}
                                        ${order.intensive_course ? 
        '<li>Интенсивный курс (+20%)</li>' : ''}
                                        ${order.supplementary ? 
        '<li>Доп. материалы</li>' : ''}
                                        ${order.personalized ? 
        '<li>Индивидуальные занятия</li>' : ''}
                                        ${!order.early_registration 
                                            && !order.group_enrollment 
                                            && !order.intensive_course && 
                                        !order.supplementary 
                                        && !order.personalized 
                                        && !order.excursions && 
                                        !order.interactive 
                                        && !order.assessment ? 
        '<li class="text-muted">Нет' +
                                        'дополнительных опций</li>' : ''}
                                    </ul>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" 
                                data-bs-dismiss="modal">Закрыть</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        
            // Добавляем модальное окно на страницу
            const modalsContainer = document.getElementById('modals-container');
            if (!modalsContainer) {
                const container = document.createElement('div');
                container.id = 'modals-container';
                document.body.appendChild(container);
            }
            
            // Удаляем предыдущее модальное окно если есть
            const existingModal = document.getElementById('orderDetailsModal');
            if (existingModal) {
                existingModal.remove();
            }
            
            modalsContainer.innerHTML += modalHTML;
            
            // Показываем модальное окно
            const modalElement = document.getElementById('orderDetailsModal');
            if (modalElement) {
                const modal = new bootstrap.Modal(modalElement);
                
                // Удаляем модальное окно при закрытии
                modalElement.addEventListener('hidden.bs.modal', function() {
                    setTimeout(() => {
                        if (modalElement && modalElement.parentNode) {
                            modalElement.parentNode.removeChild(modalElement);
                        }
                    }, 300);
                });
                
                modal.show();
            }
            
        } catch (error) {
            console.error('Ошибка загрузки деталей заявки:', error);
            Utils.showNotification('Не удалось' + 
                'загрузить детали заявки', 'error');
        }
    },
    
    editOrder: async function(orderId) {
        try {
            // Загружаем заявку
            const order = await Api.getOrder(orderId);
            
            // Загружаем информацию о курсе/репетиторе
            let item;
            let type;
            
            if (order.course_id) {
                item = await Api.getCourse(order.course_id);
                type = 'course';
            } else {
                item = await Api.getTutor(order.tutor_id);
                type = 'tutor';
            }
            
            // Добавляем исходные данные заявки к объекту
            item.orderData = order;
            
            // Открываем модальное окно через Order
            if (typeof Order !== 'undefined' && Order.openEditModal) {
                Order.openEditModal(orderId, item, type);
            } else {
                // Если Order не загружен, показываем простую форму
                this.showSimpleEditForm(orderId, order, item, type);
            }
            
        } catch (error) {
            console.error('Ошибка загрузки заявки для редактирования:', error);
            Utils.showNotification('Не удалось загрузить' + 
                'заявку для редактирования', 'error');
        }
    },
    
    confirmDelete: function(orderId) {
        if (typeof Order !== 'undefined') {
            Order.deleteOrderWithConfirmation(orderId);
        } else {
            var confirmMsg = 'Вы уверены, что хотите удалить ' +
                            'заявку #' + orderId + '?';
            
            if (confirm(confirmMsg)) {
                Api.deleteOrder(orderId)
                    .then(() => this.loadOrders())
                    .catch(error => {
                        Utils.showNotification(
                            'Ошибка удаления: ' + error.message, 
                            'error'
                        );
                    });
            }
        }
    },
    
    // Настройка обработчиков событий
    setupEventListeners: function() {
        console.log('Личный кабинет инициализирован');
    }
};

// Делаем Cabinet доступным глобально
window.Cabinet = Cabinet;