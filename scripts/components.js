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
                    <a class="nav-link" href="#about">
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
    }
};

// Делаем Components доступным глобально
window.Components = Components;