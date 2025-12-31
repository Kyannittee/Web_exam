// main.js - логика главной страницы

const Main = {
    // Инициализация главной страницы
    init: function() {
        this.loadContent();
        this.setupEventListeners();
    },
    
    // Загрузка контента
    loadContent: function() {
        const content = document.getElementById('main-content');
        if (content) {
            content.innerHTML = this.renderContent();
        }
    },
    
    // Рендер контента главной страницы
    renderContent: function() {
        return `
<!-- Блок описания школы -->
<section id="about-school" class="mb-5">
    <div class="row align-items-center">
        <div class="col-lg-6">
            <h1 class="display-5 fw-bold text-primary-dark mb-4">
                Добро пожаловать в ${Components.schoolName}
            </h1>
            <p class="lead mb-4">
                Добро пожаловать на сайт нашей языковой школы! Если вы 
                хотите подготовиться к экзаменам, начать свободно говорить
                на иностранном языке или с комфортом путешествовать, то вы
                попали в нужное место.
            </p>
            <div class="d-grid gap-2 d-md-flex justify-content-md-start">
                <a href="#courses" class="btn btn-accent btn-lg px-4 me-md-2">
                    Выбрать курс
                </a>
                <a href="#tutors" 
                   class="btn btn-outline-primary btn-lg px-4">
                    Найти репетитора
                </a>
            </div>
        </div>
        <div class="col-lg-6">
            <div class="p-5 text-center">
                <i class="bi bi-translate display-1 text-ocean-blue"></i>
                <h3 class="mt-3">Изучайте с удовольствием</h3>
                <p class="text-muted">
                    Более 10 языков • Опытные преподаватели • 1000+ студентов
                </p>
            </div>
        </div>
    </div>
</section>

<!-- Преимущества изучения языков -->
<section id="advantages" 
         class="py-5 bg-primary-light rounded-3 mb-5">
    <div class="container">
        <h2 class="text-center mb-5 text-primary-dark">
            Почему выбирают ${Components.schoolName}?
        </h2>
        
        <div class="row g-4">
            <!-- Преимущество 1-->
            <div class="col-md-4">
                <div class="card card-custom h-100 border-0 shadow-sm">
                    <div class="card-body text-center p-4">
                        <i class="bi bi-controller display-4 
                           text-accent-teal mb-3"></i>
                        <h4 class="card-title">Комфортное изучение</h4>
                        <p class="card-text">
                            Учим языкам через игры, фильмы, музыку и 
                            сериалы. Интерактивные квизы, ролевые игры и 
                            просмотр контента в оригинале.
                        </p>
                    </div>
                </div>
            </div>
            
            <!-- Преимущество 2-->
            <div class="col-md-4">
                <div class="card card-custom h-100 border-0 shadow-sm">
                    <div class="card-body text-center p-4">
                        <i class="bi bi-mortarboard display-4 
                           text-ocean-blue mb-3"></i>
                        <h4 class="card-title">Подготовка к экзаменам</h4>
                        <p class="card-text">
                            Подготовка к ЕГЭ, ОГЭ, IELTS, TOEFL, DELE и 
                            другим международным экзаменам. Преподаватели 
                            знакомы со всеми форматами.
                        </p>
                    </div>
                </div>
            </div>
            
            <!-- Преимущество 3 -->
            <div class="col-md-4">
                <div class="card card-custom h-100 border-0 shadow-sm">
                    <div class="card-body text-center p-4">
                        <i class="bi bi-heart display-4 
                           text-success mb-3"></i>
                        <h4 class="card-title">Дружная атмосфера</h4>
                        <p class="card-text">
                            Поддержка 24/7, ответы на вопросы в чатах, 
                            помощь с домашними заданиями. Мы создаем 
                            комфортную среду для обучения.
                        </p>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="row g-4 mt-3">
            <!-- Преимущество 4-->
            <div class="col-md-4">
                <div class="card card-custom h-100 border-0 shadow-sm">
                    <div class="card-body text-center p-4">
                        <i class="bi bi-airplane display-4 
                           text-warning mb-3"></i>
                        <h4 class="card-title">Опытные преподаватели</h4>
                        <p class="card-text">
                            Наши учителя жили и работали за границей, 
                            знают культуру и особенности общения. 
                            Опыт от 5 до 20 лет преподавания.
                        </p>
                    </div>
                </div>
            </div>
            
            <!-- Преимущество 5-->
            <div class="col-md-4">
                <div class="card card-custom h-100 border-0 shadow-sm">
                    <div class="card-body text-center p-4">
                        <i class="bi bi-award display-4 
                           text-danger mb-3"></i>
                        <h4 class="card-title">Получение ертификата</h4>
                        <p class="card-text">
                            По окончании курса вы получаете сертификат, 
                            подтверждающий уровень языка. 
                        </p>
                    </div>
                </div>
            </div>
            
            <!-- Преимущество 6-->
            <div class="col-md-4">
                <div class="card card-custom h-100 border-0 shadow-sm">
                    <div class="card-body text-center p-4">
                        <i class="bi bi-graph-up display-4 
                           text-info mb-3"></i>
                        <h4 class="card-title">Подходит для любого уровня</h4>
                        <p class="card-text">
                            Курсы для начинающих (А1) и продвинутых (С2). 
                            Индивидуальный план развития. Регулярное 
                            тестирование прогресса.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>
<!-- Блок курсов (заглушка пока) -->
<section id="courses" class="mb-5">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="text-primary-dark">Языковые курсы</h2>
        <span class="badge bg-accent-teal">Загружаем...</span>
    </div>
    <div class="alert alert-info">
        <i class="bi bi-info-circle me-2"></i>
        Список курсов загружается с сервера...
    </div>
</section>

<!-- Блок репетиторов (заглушка пока) -->
<section id="tutors" class="mb-5">
    <h2 class="text-primary-dark mb-4">Наши репетиторы</h2>
    <div class="alert alert-info">
        <i class="bi bi-info-circle me-2"></i>
        Список репетиторов загружается с сервера...
    </div>
</section>`;
    },

    
    // Настройка обработчиков событий
    setupEventListeners: function() {
        // Здесь будут обработчики для курсов, репетиторов и т.д.
        console.log('Main page initialized');
    }
};

// Делаем Main доступным глобально
window.Main = Main;