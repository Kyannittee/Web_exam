// components.js - переиспользуемые компоненты сайта

// Объект Components для хранения всех компонентов
const Components = {

    // Название школы
    schoolName: 'EasyLang',
    
    // Проверка активной страницы
    isActive: function(page) {
        if (window.location.pathname.includes(page)) {
            return 'active';
        }
        return '';
    },
    
    // Шапка сайта
    header: function() {
        const activeClass = this.isActive('index.html');
        const isCabinetPage = this.isActive('cabinet.html');
        
        // Если мы в личном кабинете, показываем упрощенное меню
        if (isCabinetPage) {
            return `
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary-dark">
        <div class="container">
            <a class="navbar-brand" href="index.html">
                <i class="bi bi-translate me-2"></i>
                <span class="fw-bold">${this.schoolName}</span>
            </a>
            
            <button class="navbar-toggler" type="button" 
                data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav me-auto">
                    <li class="nav-item">
                        <a class="nav-link" href="index.html">
                            <i class="bi bi-house me-1"></i> Главная
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link active" href="cabinet.html">
                            <i class="bi bi-person-circle 
                            me-1"></i> Личный кабинет
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>`;
        }
        
        // Для главной страницы - полное меню
        return `
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary-dark">
        <div class="container">
            <a class="navbar-brand" href="index.html">
                <i class="bi bi-translate me-2"></i>
                <span class="fw-bold">${this.schoolName}</span>
            </a>
            
            <button class="navbar-toggler" type="button" 
                data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav me-auto">
                    <li class="nav-item">
                        <a class="nav-link ${activeClass}" href="index.html">
                            Главная
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#courses">
                            Курсы
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#tutors">
                            Репетиторы
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#advantages">
                            О нас
                        </a>
                    </li>
                </ul>
                
                <div class="d-flex">
                    <a href="cabinet.html" class="btn btn-accent">
                        <i class="bi bi-person-circle me-1"></i> 
                        Личный кабинет
                    </a>
                </div>
            </div>
        </div>
    </nav>`;
    },
    
    // Футер сайта
    footer: function() {
        const schoolName = this.schoolName;
        const email = 'info@' + schoolName.toLowerCase() + '.ru';
        
        return `
<div class="container">
    <div class="row">
        <div class="col-md-4">
            <h5>${schoolName}</h5>
            <p>Изучайте языки продуктивно и приятно!</p>
        </div>
        <div class="col-md-4">
            <h5>Контакты</h5>
            <p>
                <i class="bi bi-telephone me-2"></i> 
                +7 (000) 000-00-00
            </p>
            <p>
                <i class="bi bi-envelope me-2"></i> 
                ${email}
            </p>
        </div>
        <div class="col-md-4">
            <h5>Соцсети</h5>
            <div class="social-links">
                <a href="#" class="text-white me-3">
                    <i class="bi bi-telegram"></i>
                </a>
                <a href="#" class="text-white">
                    <i class="bi bi-youtube"></i>
                </a>
            </div>
        </div>
    </div>
    <hr class="bg-white">
    <div class="text-center">
        <p>&copy; 2025 ${schoolName}. Все права защищены.</p>
    </div>
</div>`;
    },
    
    // Инициализация компонентов
    init: function() {
        const headerElement = document.getElementById('header');
        const footerElement = document.getElementById('footer');
        
        if (headerElement) {
            headerElement.innerHTML = this.header();
        }
        
        if (footerElement) {
            footerElement.innerHTML = this.footer();
        }
    },

    modalOrderForm: function(orderData, isEdit) {
    // Проверяем на null/undefined безопасно
        const data = orderData || {};
        const course = data.course || {};
        const tutor = data.tutor || {};
        
        const title = isEdit ? 'Редактирование заявки' : 'Оформление заявки';
        const buttonText = isEdit ? 'Сохранить изменения' : 'Отправить заявку';
        
        // Безопасно получаем значения
        const itemId = data.id || '';
        const courseId = course.id || '';
        const tutorId = tutor.id || '';
        const courseName = course.name || tutor.name || '';
        const teacherName = course.teacher || tutor.name || '';
        const persons = data.persons || 1;
        
        // Проверяем чекбоксы безопасно
        const supplementaryChecked = data.supplementary ? 'checked' : '';
        const personalizedChecked = data.personalized ? 'checked' : '';
        const excursionsChecked = data.excursions ? 'checked' : '';
        const interactiveChecked = data.interactive ? 'checked' : '';
        const assessmentChecked = data.assessment ? 'checked' : '';
        
        // Длительность курса
        const totalLength = course.total_length || 1;
        
        return `
        <div class="modal fade" id="orderModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${title}</h5>
                        <button type="button" class="btn-close" 
                        data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="orderForm">
                            <input type="hidden" id="orderId" value="${itemId}">
                            <input type="hidden" 
                            id="courseId" value="${courseId}">
                            <input type="hidden" 
                            id="tutorId" value="${tutorId}">
                            
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <label class="form-label">
                                    Название курса / Репетитор</label>
                                    <input type="text" 
                                    class="form-control" readonly 
                                        value="${courseName}">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">
                                    Преподаватель / Репетитор</label>
                                    <input type="text" 
                                    class="form-control" readonly 
                                        value="${teacherName}">
                                </div>
                            </div>
                            
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <label class="form-label">
                                    Дата начала *</label>
                                    <select class="form-select" 
                                    id="startDate" required>
                                        <option value="">Выберите дату</option>
                                        <!-- Будет заполнено через JS -->
                                    </select>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">
                                    Время занятия *</label>
                                    <select class="form-select" id="startTime" 
                                    required disabled>
                                        <option value="">
                                        Сначала выберите дату</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="row mb-3">
                                <div class="col-md-4">
                                    <label class="form-label">
                                    Продолжительность</label>
                                    <input type="text" 
                                    class="form-control" readonly 
                                        value="${totalLength} недель">
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label">
                                    Студентов в группе *</label>
                                    <input type="number" 
                                    class="form-control" id="persons" 
                                        min="1" max="20" value="
                                        ${persons}" required>
                                    <small class="text-muted">
                                    От 1 до 20 человек</small>
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label">
                                    Дата окончания</label>
                                    <input type="text" class="form-control" 
                                    id="endDate" readonly>
                                </div>
                            </div>
                            
                            <!-- Дополнительные опции -->
                            <div class="mb-4">
                                <label class="form-label">
                                Дополнительные опции:</label>
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="form-check mb-2">
                                            <input class="form-check-input" 
                                            type="checkbox" 
                                                id="supplementary" 
                                                ${supplementaryChecked}>
                                            <label class="form-check-label" 
                                            for="supplementary">
                                                Дополнительные учебные 
                                                материалы (+2000₽)
                                            </label>
                                        </div>
                                        <div class="form-check mb-2">
                                            <input class="form-check-input" 
                                            type="checkbox" 
                                                id="personalized" 
                                                ${personalizedChecked}>
                                            <label class="form-check-label" 
                                            for="personalized">
                                                Индивидуальные занятия 
                                                (+1500₽/неделю)
                                            </label>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-check mb-2">
                                            <input class="form-check-input" 
                                            type="checkbox" 
                                                id="excursions" 
                                                ${excursionsChecked}>
                                            <label class="form-check-label" 
                                            for="excursions">
                                                Культурные экскурсии (+25%)
                                            </label>
                                        </div>
                                        <div class="form-check mb-2">
                                            <input class="form-check-input" 
                                            type="checkbox" 
                                                id="interactive" 
                                                ${interactiveChecked}>
                                            <label class="form-check-label" 
                                            for="interactive">
                                                Интерактивная платформа (+50%)
                                            </label>
                                        </div>
                                        <div class="form-check mb-2">
                                            <input class="form-check-input" 
                                            type="checkbox" 
                                        id="assessment" ${assessmentChecked}>
                                            <label class="form-check-label" 
                                            for="assessment">
                                        Оценка уровня владения языком (+300₽)
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Расчет стоимости -->
                            <div class="alert alert-info">
                                <h6 class="mb-2">Расчет стоимости:</h6>
                                <div id="priceCalculation">
                                    <!-- Будет рассчитано через JS -->
                                </div>
                                <h4 class="mt-3 mb-0">
                                    Итого: <span id="totalPrice" 
                                    class="text-primary">0 ₽</span>
                                </h4>
                            </div>
                            
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" 
                                data-bs-dismiss="modal">Отмена</button>
                                <button type="submit" class=
                                "btn btn-accent">${buttonText}</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>`;
    }
};

// Делаем Components доступным глобально
window.Components = Components;