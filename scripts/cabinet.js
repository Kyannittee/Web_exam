// cabinet.js - логика личного кабинета

const Cabinet = {
    // Текущая страница пагинации
    currentPage: 1,
    itemsPerPage: 5,
    
    // Инициализация личного кабинета
    init: function() {
        this.setupEventListeners();
        this.loadOrders();
    },
    
    // Загрузка заказов с API
    loadOrders: async function() {
        try {
            const orders = await Api.getOrders();
            
            // Преобразуем данные API в наш формат
            const formattedOrders = orders.map(order => ({
                id: order.id,
                courseName: order.course_id ? 
                    `Курс #${order.course_id}` : 
                    `Репетитор #${order.tutor_id}`,
                tutorName: 'Загружается...', // Можно доп. запросом получить имя
                dateStart: order.date_start,
                timeStart: order.time_start,
                price: order.price,
                status: 'active'
            }));
            
            this.displayOrders(formattedOrders);
            
        } catch (error) {
            console.log('Используем демо-данные');
            this.displayOrders(this.getMockOrders());
        }
    },
    
    // Временные данные (потом заменим на реальные с API)
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
    
    // Методы для кнопок (заглушки)
    showOrderDetails: function(orderId) {
        Utils.showNotification(
            'Детали заявки #' + orderId, 
            'info'
        );
    },
    
    editOrder: function(orderId) {
        if (typeof Order !== 'undefined') {
            // Будет работать когда добавим метод
            Utils.showNotification(
                'Редактирование заявки #' + orderId, 
                'info'
            );
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