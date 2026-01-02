

const Main = {
    
    allCourses: [],
    currentCoursePage: 1,
    coursesPerPage: 5,
    filteredCourses: [],
    allTutors: [],
    filteredTutors: [],
    selectedTutorId: null,
    
    // Параметры поиска репетиторов
    tutorSearchParams: {
        language: '',
        level: '',
        experience: ''
    },

    
    init: function() {
        console.log('Main page initialized');
        this.setupEventListeners();
        this.loadContent();
    },
    
    setupEventListeners: function() {
        console.log('Настройка обработчиков событий');
        
        // Инициализация Bootstrap компонентов при загрузке DOM
        document.addEventListener('DOMContentLoaded', () => {
            // Инициализация тултипов
            const tooltipTriggerList = [].slice.call(
                document.querySelectorAll('[data-bs-toggle="tooltip"]')
            );
            tooltipTriggerList.map(function (tooltipTriggerEl) {
                return new bootstrap.Tooltip(tooltipTriggerEl);
            });
        });
        
        // Плавная прокрутка к якорям
        document.addEventListener('click', (e) => {
            const anchor = e.target.closest('a[href^="#"]');
            if (anchor) {
                e.preventDefault();
                const targetId = anchor.getAttribute('href').substring(1);
                if (targetId) {
                    this.scrollToElement(targetId);
                }
            }
        });
    },

    
    loadContent: async function() {
        const content = document.getElementById('main-content');
        if (!content) return;
        
        content.innerHTML = this.renderLoading();
        
        try {
            const [courses, tutors] = await Promise.all([
                this.loadCourses(),
                this.loadTutors()
            ]);
            
            this.allCourses = courses || [];
            this.allTutors = tutors || [];
            
            console.log(`Загружено: ${this.allCourses.length} 
                курсов, ${this.allTutors.length} репетиторов`);
            
            // Сброс всех фильтров
            this.resetAllFilters();
            
            content.innerHTML = this.renderContent();
            
            // Инициализация отображения
            this.updateCoursesDisplay();
            this.updateTutorsDisplay();
            this.setupSearchListeners();
            this.setupTutorSearchListeners();
            
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            console.log('Используем демо-данные');
            
            this.allCourses = this.getMockCourses();
            this.allTutors = this.getMockTutors();
            this.resetAllFilters();
            
            content.innerHTML = this.renderContent();
            this.updateCoursesDisplay();
            this.updateTutorsDisplay();
            this.setupSearchListeners();
            this.setupTutorSearchListeners();
        }
    },
    
    loadCourses: async function() {
        try {
            const courses = await Api.getCourses();
            console.log('Загружено курсов с API:', courses.length);
            return courses;
        } catch (error) {
            console.error('Ошибка загрузки курсов:', error);
            throw error;
        }
    },
    
    loadTutors: async function() {
        try {
            const tutors = await Api.getTutors();
            console.log('Загружено репетиторов с API:', tutors.length);
            return tutors;
        } catch (error) {
            console.error('Ошибка загрузки репетиторов:', error);
            return [];
        }
    },
    
    getMockCourses: function() {
        return [
            {
                id: 1,
                name: 'Английский для начинающих',
                description: 'Курс для тех, кто только начинает' + 
                'изучать английский язык с нуля',
                teacher: 'Ирина Петровна',
                level: 'Beginner',
                total_length: 8,
                week_length: 2,
                course_fee_per_hour: 500
            },
            {
                id: 2,
                name: 'Разговорный английский',
                description: 'Улучшите свои навыки общения на английском языке',
                teacher: 'Александр Сергеевич',
                level: 'Intermediate',
                total_length: 12,
                week_length: 3,
                course_fee_per_hour: 700
            },
            {
                id: 3,
                name: 'Испанский язык с нуля',
                description: 'Изучение основ испанского языка',
                teacher: 'Мария Гарсия',
                level: 'Beginner',
                total_length: 10,
                week_length: 2,
                course_fee_per_hour: 600
            },
            {
                id: 4,
                name: 'Немецкий для продолжающих',
                description: 'Курс для тех, кто уже' + 
                'имеет базовые знания немецкого',
                teacher: 'Томас Мюллер',
                level: 'Intermediate',
                total_length: 12,
                week_length: 3,
                course_fee_per_hour: 650
            },
            {
                id: 5,
                name: 'Французский язык',
                description: 'Изучение французского языка с нуля',
                teacher: 'Софи Мартен',
                level: 'Beginner',
                total_length: 10,
                week_length: 2,
                course_fee_per_hour: 700
            },
            {
                id: 6,
                name: 'Английский для бизнеса',
                description: 'Деловой английский для работы и переговоров',
                teacher: 'Джон Смит',
                level: 'Advanced',
                total_length: 16,
                week_length: 4,
                course_fee_per_hour: 900
            }
        ];
    },
    
    getMockTutors: function() {
        return [
            {
                id: 1,
                name: 'Мария Иванова',
                work_experience: 5,
                languages_spoken: ['Русский', 'Английский'],
                languages_offered: ['Английский'],
                language_level: 'Advanced',
                price_per_hour: 800
            },
            {
                id: 2,
                name: 'Иван Петров',
                work_experience: 3,
                languages_spoken: ['Русский', 'Английский', 'Немецкий'],
                languages_offered: ['Английский', 'Немецкий'],
                language_level: 'Intermediate',
                price_per_hour: 700
            },
            {
                id: 3,
                name: 'Анна Сидорова',
                work_experience: 7,
                languages_spoken: ['Русский', 'Испанский'],
                languages_offered: ['Испанский'],
                language_level: 'Advanced',
                price_per_hour: 900
            },
            {
                id: 4,
                name: 'Михаил Козлов',
                work_experience: 10,
                languages_spoken: ['Русский', 'Английский', 'Французский'],
                languages_offered: ['Английский', 'Французский'],
                language_level: 'Advanced',
                price_per_hour: 1000
            },
            {
                id: 5,
                name: 'Елена Новикова',
                work_experience: 4,
                languages_spoken: ['Русский', 'Английский'],
                languages_offered: ['Английский'],
                language_level: 'Intermediate',
                price_per_hour: 750
            },
            {
                id: 6,
                name: 'Дмитрий Волков',
                work_experience: 6,
                languages_spoken: ['Русский', 'Немецкий'],
                languages_offered: ['Немецкий'],
                language_level: 'Advanced',
                price_per_hour: 850
            }
        ];
    },

    
    renderLoading: function() {
        return `
            <div class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Загрузка...</span>
                </div>
                <p class="mt-3">Загружаем курсы и репетиторов...</p>
            </div>
        `;
    },
    
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
                    попали в нужное место. Дружный коллектив, замечательные 
                    преподаватели и уютная атмосфера ждут вас.
                </p>
                <div class="d-grid gap-2 d-md-flex justify-content-md-start">
                    <a href="#courses" class="btn btn-accent 
                    btn-lg px-4 me-md-2">
                        Выбрать курс
                    </a>
                    <a href="#tutors" class="btn btn-outline-primary 
                    btn-lg px-4">
                        Найти репетитора
                    </a>
                </div>
            </div>
            <div class="col-lg-6">
                <div class="p-5 text-center">
                    <i class="bi bi-translate display-1 text-ocean-blue"></i>
                    <h3 class="mt-3">Изучайте с удовольствием</h3>
                    <p class="text-muted">
                        Более 5 языков • Опытные преподаватели • 1000+ студентов
                    </p>
                </div>
            </div>
        </div>
    </section>

        <!-- Преимущества изучения языков -->
    <section id="why-languages" class="py-5 mb-5">
        <div class="container">
            <h2 class="text-center mb-5 text-primary-dark">
                Зачем учить иностранные языки?
            </h2>
            
            <div class="row g-4">
                <!-- Преимущество 1 - Путешествия -->
                <div class="col-md-4">
                    <div class="card card-custom h-100 border-0 shadow-sm">
                        <div class="card-body text-center p-4">
                            <i class="bi bi-globe display-4 
                            text-ocean-blue mb-3"></i>
                            <h4 class="card-title">Свободные путешествия</h4>
                            <p class="card-text">
                                Вы сможете легко и свободно путешестовать, 
                                не чувствуя ограничений и заводя новых друзей
                            </p>
                        </div>
                    </div>
                </div>
                
                <!-- Преимущество 2 - Карьера -->
                <div class="col-md-4">
                    <div class="card card-custom h-100 border-0 shadow-sm">
                        <div class="card-body text-center p-4">
                            <i class="bi bi-briefcase display-4 
                            text-accent-teal mb-3"></i>
                            <h4 class="card-title">Карьерные возможности</h4>
                            <p class="card-text">
                                Вы получите возможность работать заграницей, 
                                с иностранными коллегами и читать 
                                профессиональную литературу
                            </p>
                        </div>
                    </div>
                </div>
                
                <!-- Преимущество 3 - Культура -->
                <div class="col-md-4">
                    <div class="card card-custom h-100 border-0 shadow-sm">
                        <div class="card-body text-center p-4">
                            <i class="bi bi-film display-4 text-info mb-3"></i>
                            <h4 class="card-title">Мир в оригинале</h4>
                            <p class="card-text">
                                Вы сможете смотреть фильмы и читать 
                                игры в оригинале. Понимать шутки и не 
                                дожидаться официального перевода
                            </p>
                        </div>
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
                                знакомы со всеми форматах.
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
                            <h4 class="card-title">Получение сертификата</h4>
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

    <!-- Поиск курсов -->
    <section id="courses-search" class="mb-4">
        ${this.renderCoursesSearchForm()}
    </section>
            
    <!-- Блок курсов -->
    <section id="courses" class="mb-5">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="text-primary-dark">Наши курсы</h2>
            <span class="badge bg-accent-teal" id="courses-count">
                ${this.allCourses.length} курсов
            </span>
        </div>
        <div id="courses-container">
            <!-- Курсы загружаются динамически -->
        </div>
    </section>

    <!-- Поиск репетиторов -->
    <section id="tutors-search" class="mb-4">
        ${this.renderTutorsSearchForm()}
    </section>

    <!-- Блок репетиторов -->
    <section id="tutors" class="mb-5">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="text-primary-dark">Наши репетиторы</h2>
            <span class="badge bg-info" id="tutors-count">
                ${this.allTutors.length} репетиторов
            </span>
        </div>
        <div id="tutors-container">
            <!-- Репетиторы загружаются динамически -->
        </div>
    </section>`;
    },
    
    renderCoursesSearchForm: function() {
        return `
        <div class="card mb-4 border-primary">
            <div class="card-body">
                <h5 class="card-title text-primary-dark mb-3">
                    <i class="bi bi-search me-2"></i>Поиск курсов
                </h5>
                <div class="row g-3">
                    <div class="col-md-6">
                        <div class="input-group">
                            <span class="input-group-text">
                                <i class="bi bi-text-paragraph"></i>
                            </span>
                            <input type="text" 
                                   class="form-control" 
                                   id="course-search-input"
                                   placeholder="Название курса...">
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="input-group">
                            <span class="input-group-text">
                                <i class="bi bi-filter"></i>
                            </span>
                            <select class="form-select" 
                            id="course-level-select">
                                <option value="">Все уровни</option>
                                <option value="Beginner">Начальный</option>
                                <option value="Intermediate">Средний</option>
                                <option value="Advanced">Продвинутый</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-md-2">
                        <button type="button" 
                                class="btn btn-outline-secondary w-100"
                                id="reset-courses-search-btn">
                            <i class="bi bi-x-circle"></i> Сбросить
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
    },
    
    renderTutorsSearchForm: function() {
        // Получаем уникальные языки из всех репетиторов
        const allLanguages = [...new Set(
            this.allTutors.flatMap(tutor => tutor.languages_offered || [])
        )].sort();
        
        return `
        <div class="card mb-4 border-info">
            <div class="card-body">
                <h5 class="card-title text-primary-dark mb-3">
                    <i class="bi bi-search me-2"></i>Поиск репетиторов
                </h5>
                <div class="row g-3">
                    <div class="col-md-4">
                        <div class="input-group">
                            <span class="input-group-text">
                                <i class="bi bi-translate"></i>
                            </span>
                            <select class="form-select" 
                            id="tutor-language-select">
                                <option value="">Все языки</option>
                                ${allLanguages.map(lang => 
        `<option value="${lang}">${lang}</option>`
    ).join('')}
                            </select>
                        </div>
                    </div>
                    
                    <div class="col-md-3">
                        <div class="input-group">
                            <span class="input-group-text">
                                <i class="bi bi-bar-chart"></i>
                            </span>
                            <select class="form-select" id="tutor-level-select">
                                <option value="">Все уровни</option>
                                <option value="Beginner">Начальный</option>
                                <option value="Intermediate">Средний</option>
                                <option value="Advanced">Продвинутый</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="col-md-3">
                        <div class="input-group">
                            <span class="input-group-text">
                                <i class="bi bi-clock-history"></i>
                            </span>
                            <select class="form-select" 
                            id="tutor-experience-select">
                                <option value="">Любой опыт</option>
                                <option value="1">1+ лет</option>
                                <option value="3">3+ лет</option>
                                <option value="5">5+ лет</option>
                                <option value="10">10+ лет</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="col-md-2">
                        <button type="button" 
                                class="btn btn-outline-secondary w-100"
                                id="reset-tutors-search-btn">
                            <i class="bi bi-x-circle"></i> Сбросить
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
    },
    
    renderCourses: function(courses) {
        if (!courses || courses.length === 0) {
            return `
            <div class="alert alert-info">
                <i class="bi bi-info-circle me-2"></i>
                Курсы не найдены. Попробуйте изменить параметры поиска.
            </div>
            `;
        }
        
        return `
        <div class="row g-4">
            ${courses.map(course => `
            <div class="col-md-6 col-lg-4">
                <div class="card card-custom h-100 shadow-sm">
                    <div class="card-body">
                        <h5 class="card-title text-primary-dark">
                            ${course.name || 'Без названия'}
                        </h5>
                        
                        <p class="card-text text-muted mb-3">
                            ${course.description || 'Описание отсутствует'}
                        </p>
                        
                        <div class="mb-3">
                            <div class="d-flex justify-content-between 
                            text-muted small mb-1">
                                <span>Уровень:</span>
                                <span class="badge bg-info">
                                    ${course.level || 'Не указан'}
                                </span>
                            </div>
                            <div class="d-flex justify-content-between 
                            text-muted small mb-1">
                                <span>Длительность:</span>
                                <span>${course.total_length || 0} недель</span>
                            </div>
                            <div class="d-flex justify-content-between 
                            text-muted small">
                                <span>Стоимость:</span>
                                <span class="text-success fw-bold">
                                    ${(course.course_fee_per_hour || 0)
        .toLocaleString('ru-RU')} ₽/час
                                </span>
                            </div>
                        </div>
                        
                        <div class="mt-3">
                            <div class="d-grid gap-2">
                                <button class="btn btn-accent"
                                        onclick="Main.orderCourse(${course.id})"
                                        data-bs-toggle="tooltip"
                                        title="Записаться на курс">
                                    <i class="bi bi-calendar-check me-2"></i>
                                    Записаться
                                </button>
                                <button class="btn btn-outline-primary"
                                        onclick="Main
                                        .showCourseDetails(${course.id})"
                                        data-bs-toggle="tooltip"
                                        title="Подробная информация">
                                    <i class="bi bi-info-circle me-1"></i>
                                    Подробнее
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            `).join('')}
        </div>
        <div class="mt-4" id="courses-pagination">
            ${this.renderPagination()}
        </div>`;
    },
    
    renderTutors: function(tutors) {
        if (!tutors || tutors.length === 0) {
            return `
            <div class="alert alert-warning">
                <i class="bi bi-exclamation-triangle me-2"></i>
                Репетиторы не найдены по выбранным критериям
            </div>
            `;
        }
        const avatarMap = {
            1: 'images/teacher1.jpg',
            2: 'images/teacher2.jpg',
            3: 'images/teacher3.jpg',
            4: 'images/teacher4.jpg',
            5: 'images/teacher5.jpg',
            6: 'images/teacher6.jpg',
            7: 'images/teacher7.jpg',
            8: 'images/teacher8.jpg',
            9: 'images/teacher9.jpg',
            
        };
        return `
        <div class="table-responsive">
            <table class="table table-hover">
                <thead class="table-light">
                    <tr>
                        <th class="table-avatar-cell">Фото</th>
                        <th>Имя</th>
                        <th>Опыт</th>
                        <th>Языки</th>
                        <th>Уровень</th>
                        <th>Стоимость</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    ${tutors.map(tutor => {
        const isSelected = this.selectedTutorId === tutor.id;
        const rowClass = isSelected ? 'table-primary' : '';
                        
        let avatarHTML = '';
        if (avatarMap[tutor.id]) {
        // Есть фото в маппинге
            avatarHTML = `
                <img src="${avatarMap[tutor.id]}" 
                    alt="${tutor.name || 'Репетитор'}"
                    class="teacher-avatar"
                    title="${tutor.name || 'Репетитор'}">
            `;
        } else {
            // Нет фото - показываем инициалы
            const initials = (tutor.name || 'РП')
                .split(' ')
                .map(word => word[0])
                .join('')
                .toUpperCase()
                .substring(0, 2);
                            
            avatarHTML = `
                <div class="avatar-placeholder" 
                    title="${tutor.name || 'Репетитор'}">
                    ${initials}
                </div>
            `;
        }

        // Безопасно получаем данные
        let languages = 'Не указаны';
        if (tutor.languages_offered && Array.isArray(tutor.languages_offered)) {
            languages = tutor.languages_offered.join(', ');
        }
                        
        let experience = tutor.work_experience || 0;
        let level = tutor.language_level || 'Не указан';
        let price = tutor.price_per_hour || 0;
                        
        return `
                        <tr class="${rowClass}">
                        <td class="table-avatar-cell">
                            ${avatarHTML}
                        </td>
                        <td>
                            <strong>${tutor.name || 'Без имени'}</strong>
                            ${isSelected ? 
        '<span class="badge bg-success ms-2">Выбран</span>' : 
        ''}
                        </td>
                        <td>${experience} ${this
    .getExperienceWord(experience)}</td>
                        <td>${languages}</td>
                        <td>
                            <span class="badge bg-info">${level}</span>
                        </td>
                        <td>${price.toLocaleString('ru-RU')} ₽/час</td>
                        <td>
                            <div class="btn-group btn-group-sm" role="group">
                                <button class="btn btn-accent"
                                        onclick="Main.selectTutor(${tutor.id})"
                                        data-bs-toggle="tooltip" 
                                        title="Выбрать репетитора">
                                    <i class="bi bi-check-circle"></i>
                                </button>
                                <button class="btn btn-outline-primary"
                                        onclick=
                                        "Main.showTutorDetails(${tutor.id})"
                                        data-bs-toggle="tooltip" 
                                        title="Подробнее">
                                    <i class="bi bi-eye"></i>
                                </button>
                                <button class="btn btn-success"
                                        onclick="Main.orderTutor(${tutor.id})"
                                        data-bs-toggle="tooltip" 
                                        title="Записаться к репетитору">
                                    <i class="bi bi-calendar-plus"></i>
                                </button>
                            </div>
                        </td>
                    </tr>`;
    }).join('')}
                </tbody>
            </table>
        </div>`;
    },
    
    renderPagination: function() {
        const courses = this.filteredCourses.length > 0 ? 
            this.filteredCourses : this.allCourses;
        
        if (!courses || courses.length <= this.coursesPerPage) {
            return '';
        }
        
        const totalPages = Math.ceil(courses.length / this.coursesPerPage);
        
        let html = `
            <nav aria-label="Навигация по страницам курсов">
                <ul class="pagination justify-content-center">
                    <li class="page-item ${this.currentCoursePage === 
                        
                        1 ? 'disabled' : ''}">
                        <a class="page-link" href="#" data-page="prev">
                            <i class="bi bi-chevron-left"></i>
                        </a>
                    </li>
        `;
        
        for (let i = 1; i <= totalPages; i++) {
            html += `
                <li class="page-item ${this.currentCoursePage === 
                    
                    i ? 'active' : ''}">
                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                </li>
            `;
        }
        
        html += `
                    <li class="page-item ${this.currentCoursePage 
                        === totalPages ? 'disabled' : ''}">
                        <a class="page-link" href="#" data-page="next">
                            <i class="bi bi-chevron-right"></i>
                        </a>
                    </li>
                </ul>
            </nav>
        `;
        
        return html;
    },


    filterCourses: function() {
        const searchInput = document.getElementById('course-search-input');
        const levelSelect = document.getElementById('course-level-select');
        
        if (!searchInput || !levelSelect || !this.allCourses) {
            this.filteredCourses = this.allCourses || [];
            return this.filteredCourses;
        }
        
        const searchTerm = searchInput.value.toLowerCase().trim();
        const selectedLevel = levelSelect.value;
        
        this.filteredCourses = this.allCourses.filter(course => {
            const matchesSearch = searchTerm === '' || 
                course.name.toLowerCase().includes(searchTerm) ||
                (course.description && 
                 course.description.toLowerCase().includes(searchTerm));
            
            const matchesLevel = selectedLevel === '' || 
                course.level === selectedLevel;
            
            return matchesSearch && matchesLevel;
        });
        
        return this.filteredCourses;
    },
    
    filterTutors: function() {
        const languageSelect = document.getElementById('tutor-language-select');
        const levelSelect = document.getElementById('tutor-level-select');
        const experienceSelect = 
        document.getElementById('tutor-experience-select');
        
        if (!languageSelect || !levelSelect || 
            !experienceSelect || !this.allTutors) {
            this.filteredTutors = this.allTutors || [];
            return this.filteredTutors;
        }
        
        const selectedLanguage = languageSelect.value.toLowerCase();
        const selectedLevel = levelSelect.value;
        const selectedExperience = experienceSelect.value;
        
        this.filteredTutors = this.allTutors.filter(tutor => {
            // Фильтр по языку
            const matchesLanguage = !selectedLanguage || 
                (tutor.languages_offered && 
                 tutor.languages_offered.some(lang => 
                     lang.toLowerCase().includes(selectedLanguage) ||
                    selectedLanguage.includes(lang.toLowerCase())
                 ));
            
            // Фильтр по уровню
            const matchesLevel = !selectedLevel || 
                (tutor.language_level && 
                 tutor.language_level.toLowerCase() === 
                 selectedLevel.toLowerCase());
            
            // Фильтр по опыту
            const matchesExperience = !selectedExperience || 
                (tutor.work_experience && 
                 tutor.work_experience >= parseInt(selectedExperience));
            
            return matchesLanguage && matchesLevel && matchesExperience;
        });
        
        return this.filteredTutors;
    },

    
    updateCoursesDisplay: function() {
        const filteredCourses = this.filterCourses();
        const paginatedCourses = this.getPaginatedCourses();
        
        const coursesContainer = document.getElementById('courses-container');
        const coursesCount = document.getElementById('courses-count');
        
        if (coursesContainer) {
            coursesContainer.innerHTML = this.renderCourses(paginatedCourses);
        }
        
        if (coursesCount) {
            const totalCourses = filteredCourses.length > 0 ? 
                filteredCourses.length : this.allCourses.length;
            coursesCount.textContent = `${totalCourses} курсов`;
        }
        
        // Настраиваем обработчики пагинации
        this.setupPaginationListeners();
    },
    
    updateTutorsDisplay: function() {
        const tutorsToShow = this.filterTutors();
        
        const tutorsContainer = document.getElementById('tutors-container');
        const tutorsCount = document.getElementById('tutors-count');
        
        if (tutorsContainer) {
            tutorsContainer.innerHTML = this.renderTutors(tutorsToShow);
        }
        
        if (tutorsCount) {
            tutorsCount.textContent = `${tutorsToShow.length} репетиторов`;
            tutorsCount.className = `badge ${tutorsToShow.length === 
                0 ? 'bg-danger' : 'bg-info'}`;
        }
    },

    
    getPaginatedCourses: function() {
        const courses = this.filteredCourses.length > 0 ? 
            this.filteredCourses : this.allCourses;
        
        if (!courses || courses.length === 0) {
            return [];
        }
        
        const startIndex = (this.currentCoursePage - 1) * this.coursesPerPage;
        const endIndex = startIndex + this.coursesPerPage;
        return courses.slice(startIndex, endIndex);
    },
    
    getExperienceWord: function(years) {
        if (years === 1) return 'год';
        if (years >= 2 && years <= 4) return 'года';
        return 'лет';
    },
    
    scrollToElement: function(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            window.scrollTo({
                top: element.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    },

    
    selectTutor: function(tutorId) {
        if (this.selectedTutorId === tutorId) {
            this.selectedTutorId = null;
            if (typeof Utils !== 'undefined') {
                Utils.showNotification('Выбор репетитора отменен', 'info');
            }
        } else {
            this.selectedTutorId = tutorId;
            
            const tutor = this.allTutors.find(t => t.id === tutorId);
            if (tutor && typeof Utils !== 'undefined') {
                Utils.showNotification(`Выбран репетитор: 
                    ${tutor.name}`, 'success');
            }
        }
        
        this.updateTutorsDisplay();
    },
    
    setupSearchListeners: function() {
        const searchInput = document.getElementById('course-search-input');
        const levelSelect = document.getElementById('course-level-select');
        const resetBtn = document.getElementById('reset-courses-search-btn');
        
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.currentCoursePage = 1;
                this.updateCoursesDisplay();
            });
            
            if (levelSelect) {
                levelSelect.addEventListener('change', () => {
                    this.currentCoursePage = 1;
                    this.updateCoursesDisplay();
                });
            }
            
            if (resetBtn) {
                resetBtn.addEventListener('click', () => {
                    searchInput.value = '';
                    if (levelSelect) levelSelect.value = '';
                    this.currentCoursePage = 1;
                    this.updateCoursesDisplay();
                    if (typeof Utils !== 'undefined') {
                        Utils.showNotification('Фильтры курсов сброшены', 
                            'info');
                    }
                });
            }
        }
    },
    
    setupTutorSearchListeners: function() {
        const languageSelect = document.getElementById('tutor-language-select');
        const levelSelect = document.getElementById('tutor-level-select');
        const experienceSelect = document
            .getElementById('tutor-experience-select');
        const resetBtn = document
            .getElementById('reset-tutors-search-btn');
        
        if (languageSelect) {
            languageSelect.addEventListener('change', () => {
                this.updateTutorsDisplay();
            });
        }
        
        if (levelSelect) {
            levelSelect.addEventListener('change', () => {
                this.updateTutorsDisplay();
            });
        }
        
        if (experienceSelect) {
            experienceSelect.addEventListener('change', () => {
                this.updateTutorsDisplay();
            });
        }
        
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                languageSelect.value = '';
                levelSelect.value = '';
                experienceSelect.value = '';
                this.selectedTutorId = null;
                this.updateTutorsDisplay();
                if (typeof Utils !== 'undefined') {
                    Utils
                        .showNotification('Фильтры репетиторов сброшены', 
                            'info');
                }
            });
        }
    },
    
    setupPaginationListeners: function() {
        const paginationLinks = document
            .querySelectorAll('#courses-pagination .page-link');
        
        paginationLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                const page = e.target.closest('a').dataset.page;
                const courses = this.filteredCourses.length > 0 ? 
                    this.filteredCourses : this.allCourses;
                const totalPages = Math.ceil(courses.length 
                    / this.coursesPerPage);
                
                if (page === 'prev' && this.currentCoursePage > 1) {
                    this.currentCoursePage--;
                    this.updateCoursesDisplay();
                    this.scrollToElement('courses');
                } else if (page === 'next' && this.currentCoursePage 
                    < totalPages) {
                    this.currentCoursePage++;
                    this.updateCoursesDisplay();
                    this.scrollToElement('courses');
                } else if (!isNaN(page)) {
                    const newPage = parseInt(page);
                    if (newPage >= 1 && newPage <= totalPages) {
                        this.currentCoursePage = newPage;
                        this.updateCoursesDisplay();
                        this.scrollToElement('courses');
                    }
                }
            });
        });
    },

    
    resetAllFilters: function() {
        this.selectedTutorId = null;
        this.filteredTutors = [];
        this.filteredCourses = [];
        this.currentCoursePage = 1;
        
        // Сброс параметров поиска репетиторов
        this.tutorSearchParams = {
            language: '',
            level: '',
            experience: ''
        };
        
        console.log('Все фильтры сброшены');
    },

    
    showCourseDetails: function(courseId) {
        const course = this.allCourses.find(c => c.id == courseId);
        if (course) {
            alert(`Информация о курсе:\n\n
                Название: ${course.name}\n
                Уровень: ${course.level}\n
                Описание: ${course.description}\n
                Длительность: ${course.total_length} недель\n
                Стоимость: ${course.course_fee_per_hour} ₽/час`);
        }
    },
    
    showTutorDetails: async function(tutorId) {
        try {
            const tutor = await Api.getTutor(tutorId);
            
            if (!tutor) {
                alert('Репетитор не найден');
                return;
            }
            
            const avatarMap = {
                1: 'images/teacher1.jpg',
                2: 'images/teacher2.jpg',
                3: 'images/teacher3.jpg',
                4: 'images/teacher4.jpg',
                5: 'images/teacher5.jpg',
                6: 'images/teacher6.jpg'
            };
            const avatar = avatarMap[tutor.id] 
            || `https://i.pravatar.cc/150?img=${tutor.id}`;
            
            // Создаем HTML для модального окна
            const modalHTML = `
            <div class="modal fade" id="tutorDetailsModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Профиль репетитора</h5>
                            <button type="button" class="btn-close" 
                            data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="text-center mb-4">
                                <img src="${avatar}" 
                                    alt="${tutor.name}"
                                    class="rounded-circle mb-3"
                                    style="width: 120px; height: 120px; 
                                    object-fit: cover; border: 
                                    4px solid #dee2e6;">
                                <h4>${tutor.name || 'Без имени'}</h4>
                                <span class="badge bg-info fs-6">
                                    ${tutor.language_level || 'Не указан'}
                                </span>
                            </div>
                            
                            <div class="row">
                                <div class="col-md-6">
                                    <h6><i class="bi bi-clock-history 
                                    me-2"></i>Опыт работы</h6>
                                    <p class="mb-3">${tutor.work_experience 
                                        || 0} ${this.getExperienceWord(tutor
    .work_experience || 0)}</p>
                                    
                                    <h6><i class="bi bi-currency-dollar
                                     me-2"></i>Стоимость</h6>
                                    <p class="mb-3"><strong>
                                    ${(tutor.price_per_hour 
                                        || 0).toLocaleString('ru-RU')} 
                                        ₽/час</strong></p>
                                </div>
                                <div class="col-md-6">
                                    <h6><i class="bi bi-translate 
                                    me-2"></i>Преподает языки</h6>
                                    <p class="mb-3">
                                        ${(tutor.languages_offered 
                                            && Array.isArray(tutor
                                                .languages_offered)) ? 
        tutor.languages_offered.map(function(lang) {
            return `<span class="badge bg-primary me-1 mb-1">${lang}</span>`;
        }).join('') : 
        'Не указаны'
}
                                    </p>
                                    
                                    <h6><i class="bi bi-chat-dots 
                                    me-2"></i>Владеет языками</h6>
                                    <p class="mb-0">
                                        ${(tutor.languages_spoken 
                                            && Array.isArray(tutor
                                                .languages_spoken)) ? 
        tutor.languages_spoken.map(function(lang) {
            return `<span class="badge bg-secondary me-1 mb-1">${lang}</span>`;
        }).join('') : 
        'Не указаны'
}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" 
                            data-bs-dismiss="modal">Закрыть</button>
                            <button type="button" class="btn btn-accent" 
                            onclick="Main.orderTutor(${tutor.id})">
                                <i class="bi bi-calendar-plus 
                                me-1"></i>Записаться
                            </button>
                        </div>
                    </div>
                </div>
            </div>`;
            
            // Добавляем модальное окно на страницу
            var modalsContainer = document.getElementById('modals-container');
            if (!modalsContainer) {
                modalsContainer = document.createElement('div');
                modalsContainer.id = 'modals-container';
                document.body.appendChild(modalsContainer);
            }
            
            // Удаляем предыдущее модальное окно если есть
            var existingModal = document.getElementById('tutorDetailsModal');
            if (existingModal) {
                existingModal.remove();
            }
            
            modalsContainer.innerHTML += modalHTML;
            
            // Показываем модальное окно
            var modalElement = document.getElementById('tutorDetailsModal');
            if (modalElement) {
                var modal = new bootstrap.Modal(modalElement);
                
                // Удаляем модальное окно при закрытии
                modalElement.addEventListener('hidden.bs.modal', function() {
                    setTimeout(function() {
                        if (modalElement && modalElement.parentNode) {
                            modalElement.parentNode.removeChild(modalElement);
                        }
                    }, 300);
                });
                
                modal.show();
            }
            
        } catch (error) {
            console.error('Ошибка загрузки репетитора:', error);
            
            // Fallback на старый alert если что-то пошло не так
            var tutor = this.allTutors
                .find(function(t) {
                    return t.id == tutorId; 
                });
            if (tutor) {
                alert('Информация о репетиторе:\n\n👤 Имя: ' + tutor.name + 
                    '\n Опыт: ' + tutor.work_experience + ' лет' +
                    '\n Языки: ' + 
                    (tutor.languages_offered ? tutor.languages_offered
                        .join(', ') : 'Не указаны') +
                    '\n Уровень: ' + tutor.language_level +
                    '\n Стоимость: ' + tutor.price_per_hour + ' ₽/час');
            }
        }
    },
    
    orderCourse: async function(courseId) {
        console.log('=== Запись на курс ===');
        console.log('ID курса:', courseId);
        
        try {
            // Загружаем полные данные курса
            const course = await Api.getCourse(courseId);
            
            console.log('Полные данные курса из API:', course);
            console.log('start_dates:', course.start_dates);
            
            // Проверяем, что start_dates есть
            if (!course.start_dates || !Array.isArray(course.start_dates)) {
                console.error('ОШИБКА: start_dates отсутствует или не массив!');
                course.start_dates = []; // fallback
            }
            
            if (typeof Order !== 'undefined') {
                // Передаём данные курса
                Order.openCreateModal(course, 'course');
            } else {
                console.error('Order не загружен!');
            }
            
        } catch (error) {
            console.error('Ошибка загрузки курса:', error);
        }
    },
    
    orderTutor: function(tutorId) {
        const tutor = this.allTutors.find(t => t.id == tutorId);
        if (tutor && typeof Order !== 'undefined') {
            Order.openCreateModal(tutor, 'tutor');
        } else if (tutor) {
            alert(`Запись к репетитору "${tutor.name}"\n\n
                Временно недоступно. Скоро добавим возможность записи онлайн!`);
        }
    }
};

// Делаем Main доступным глобально
window.Main = Main;