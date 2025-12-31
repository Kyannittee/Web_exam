// main.js - логика главной страницы

const Main = {
    // Инициализация главной страницы
    init: function() {
        this.setupEventListeners();
        this.loadContent();
    },
    
    // Загрузка контента
    loadContent: async function() {
        const content = document.getElementById('main-content');
        if (content) {
            // Показываем заглушку
            content.innerHTML = this.renderLoading();
            
            try {
                // Загружаем данные с API
                const courses = await this.loadCourses();
                const tutors = await this.loadTutors();
                
                // Сохраняем курсы в свойство
                this.allCourses = courses;
                
                // Рендерим с реальными данными
                content.innerHTML = this.renderContent(tutors);
                
                // Инициализируем поиск после рендера
                this.setupSearchListeners();
                
            } catch (error) {
                // Если ошибка, показываем с демо-данными
                console.log('Используем демо-данные');
                this.allCourses = this.getMockCourses();
                content.innerHTML = this.renderContent(this.getMockTutors());
                this.setupSearchListeners();
            }
        }
    },

    // Загрузка курсов
    loadCourses: async function() {
        try {
            const courses = await Api.getCourses();
            console.log('Загружено курсов с API:', courses.length);
            return courses;
        } catch (error) {
            console.error('Ошибка загрузки курсов:', error);
            throw error; // Важно! Пробрасываем ошибку дальше
        }
    },
    
    // Загрузка репетиторов
    loadTutors: async function() {
        try {
            const tutors = await Api.getTutors();
            console.log('Загружено репетиторов с API:', tutors.length, tutors);
            return tutors;
        } catch (error) {
            console.error('Ошибка загрузки репетиторов:', error);
            // Возвращаем пустой массив вместо выброса ошибки
            return [];
        }
    },
    
    // Демо-курсы (если API не работает)
    getMockCourses: function() {
        return [
            {
                id: 1,
                name: 'Английский для начинающих',
                description: 'Курс для тех, кто только начинает' +
                'изучать английский',
                teacher: 'Ирина Петровна',
                level: 'Beginner',
                total_length: 8,
                week_length: 2,
                course_fee_per_hour: 500
            },
            // ... ещё курсы
        ];
    },
    
    // Демо-репетиторы
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
            // ... ещё репетиторы
        ];
    },
    
    // Рендер загрузки
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

    
    // Рендер реальных курсов
    renderCourses: function(courses) {
        if (!courses || courses.length === 0) {
            return `
            <div class="alert alert-warning">
                <i class="bi bi-exclamation-triangle me-2"></i>
                Курсы временно недоступны
            </div>
        `;
        }
        
        return `
        <div class="row g-4">
            ${courses.slice(0, 6).map(course => {
        // Выносим логику описания
        let description = 'Описание отсутствует';
                
        if (course.description) {
            if (course.description.length > 100) {
                description = course.description
                    .substring(0, 100) + '...';
            } else {
                description = course.description;
            }
        }
                
        return `
                <div class="col-md-6 col-lg-4">
                    <div class="card card-custom h-100">
                        <div class="card-body">
                            <h5 class="card-title text-primary-dark">
                                ${course.name}
                            </h5>
                            <p class="card-text text-muted">
                                ${description}
                            </p>
                            <div class="mt-3">
                                <span class="badge bg-info me-2">
                                    ${course.level}
                                </span>
                                <span class="badge bg-secondary">
                                    ${course.week_length} ч/нед
                                </span>
                            </div>
                            <div class="mt-3">
                                <p class="mb-1">
                                    <i class="bi bi-person me-1"></i>
                                    ${course.teacher}
                                </p>
                                <p class="mb-0">
                                    <i class="bi bi-cash me-1"></i>
                                    ${course.course_fee_per_hour} ₽/час
                                </p>
                            </div>
                        </div>
                        <div class="card-footer bg-transparent border-top-0">
                            <button class="btn btn-accent w-100" 
                                    onclick="Main.showCourseModal(` +
                                    `${course.id})">
                                <i class="bi bi-info-circle me-1"></i>
                                Подробнее
                            </button>
                        </div>
                    </div>
                </div>
                `;
    }).join('')}
        </div>
    `;
    },

    // Рендер реальных репетиторов
    renderTutors: function(tutors) {
        console.log('renderTutors вызван с:', tutors.length, 'репетиторами');
        
        if (!tutors || tutors.length === 0) {
            return `
            <div class="alert alert-warning">
                <i class="bi bi-exclamation-triangle me-2"></i>
                Репетиторы временно недоступны
            </div>
        `;
        }
    
        return `
        <div class="table-responsive">
            <table class="table table-hover">
                <thead class="table-light">
                    <tr>
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
        // Выносим languages в переменную
        const languages = (tutor.languages_offered || [])
            .join(', ');
                        
        return `
                        <tr>
                            <td>
                                <strong>${tutor.name}</strong>
                            </td>
                            <td>${tutor.work_experience} лет</td>
                            <td>${languages}</td>
                            <td>
                                <span class="badge bg-info">
                                    ${tutor.language_level}
                                </span>
                            </td>
                            <td>
                                ${tutor.price_per_hour} ₽/час
                            </td>
                            <td>
                                <button class="btn btn-sm btn-outline-primary"
                                        onclick="Main.showTutorModal(` +
                                        `${tutor.id})">
                                    <i class="bi bi-eye"></i>
                                </button>
                            </td>
                        </tr>
                        `;
    }).join('')}
                </tbody>
            </table>
        </div>
    `;
    },

    getPaginatedCourses: function() {
        // Пока возвращаем все курсы, пагинацию сделаем позже
        if (!this.allCourses || this.allCourses.length === 0) {
            return [];
        }
        return this.allCourses;
    },

    // Рендер контента главной страницы
    renderContent: function(tutors = []) {
        // Проверяем что allCourses инициализирован
        const coursesCount = this.allCourses ? this.allCourses.length : 0;
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
<!-- ПОИСК КУРСОВ-->
        <section id="courses-search" class="mb-4">
            ${this.renderSearchForm()}
        </section>
        
<!-- Блок курсов -->
<section id="courses" class="mb-5">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2 class="text-primary-dark">Языковые курсы</h2>
                <span class="badge bg-accent-teal" id="courses-count">
                    ${this.allCourses.length} курсов
                </span>
            </div>
            <div id="courses-container">
                ${this.renderCourses(this.getPaginatedCourses())}
            </div>
            <!-- Пагинация добавится позже -->
        </section>

<!-- Блок репетиторов -->
<section id="tutors" class="mb-5">
            <h2 class="text-primary-dark mb-4">Наши репетиторы</h2>
            ${this.renderTutors(tutors)}
        </section>`;
    },

    // Рендер формы поиска
    renderSearchForm: function() {
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
                                   placeholder="Введите название курса...">
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
                                <option value="Beginner">
                                    Начальный
                                </option>
                                <option value="Intermediate">
                                    Средний
                                </option>
                                <option value="Advanced">
                                    Продвинутый
                                </option>
                            </select>
                        </div>
                    </div>
                    <div class="col-md-2">
                        <button type="button" 
                                class="btn btn-outline-secondary w-100"
                                id="reset-search-btn">
                            <i class="bi bi-x-circle"></i> Сбросить
                        </button>
                    </div>
                </div>
                <div class="mt-2 text-muted small">
                    <i class="bi bi-info-circle me-1"></i>
                    Курсы фильтруются в реальном времени
                </div>
            </div>
        </div>
    `;
    },
    // Фильтрация курсов
    filterCourses: function() {
        const searchInput = document.getElementById('course-search-input');
        const levelSelect = document.getElementById('course-level-select');
        
        if (!searchInput || !levelSelect || !this.allCourses) {
            return this.allCourses || [];
        }
        
        const searchTerm = searchInput.value.toLowerCase().trim();
        const selectedLevel = levelSelect.value;
        
        return this.allCourses.filter(course => {
            // Фильтр по названию
            const matchesSearch = searchTerm === '' || 
                course.name.toLowerCase().includes(searchTerm) ||
                (course.description && 
                course.description.toLowerCase().includes(searchTerm));
            
            // Фильтр по уровню
            const matchesLevel = selectedLevel === '' || 
                course.level === selectedLevel;
            
            return matchesSearch && matchesLevel;
        });
    },

    // Обновление отображения курсов
    updateCoursesDisplay: function() {
        const filteredCourses = this.filterCourses();
        const coursesContainer = document.getElementById('courses-container');
        const coursesCount = document.getElementById('courses-count');
    
        if (coursesContainer) {
            coursesContainer.innerHTML = this.renderCourses(filteredCourses);
        }
        
        if (coursesCount) {
            coursesCount.textContent = `${filteredCourses.length} курсов`;
            // Меняем цвет если ничего не найдено
            if (filteredCourses.length === 0) {
                coursesCount.className = 'badge bg-danger';
            } else {
                coursesCount.className = 'badge bg-accent-teal';
            }
        }
    },

    // Заглушки для модальных окон (пока)
    showCourseModal: function(courseId) {
        alert('Информация о курсе #' + courseId + 
            '\n(будет модальное окно)');
    },

    showTutorModal: function(tutorId) {
        alert('Информация о репетиторе #' + tutorId + 
            '\n(будет модальное окно)');
    },
    
    // Настройка обработчиков событий
    setupEventListeners: function() {
        console.log('Main page initialized');
    
        // Ждем немного чтобы DOM обновился
        setTimeout(() => {
            this.setupSearchListeners();
        }, 100);
    },

    // Настройка обработчиков поиска
    setupSearchListeners: function() {
        const searchInput = document.getElementById('course-search-input');
        const levelSelect = document.getElementById('course-level-select');
        const resetBtn = document.getElementById('reset-search-btn');
        
        if (searchInput) {
            // Поиск при вводе текста
            searchInput.addEventListener('input', () => {
                this.updateCoursesDisplay();
            });
            
            // Поиск при изменении уровня
            if (levelSelect) {
                levelSelect.addEventListener('change', () => {
                    this.updateCoursesDisplay();
                });
            }
            
            // Сброс поиска
            if (resetBtn) {
                resetBtn.addEventListener('click', () => {
                    searchInput.value = '';
                    if (levelSelect) levelSelect.value = '';
                    this.updateCoursesDisplay();
                });
            }
        }
    },
};

// Делаем Main доступным глобально
window.Main = Main;