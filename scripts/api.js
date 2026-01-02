// api.js - работа с API языковой школы

const Api = {
    // Базовый URL API 
    baseUrl: 'http://exam-api-courses.std-900.ist.mospolytech.ru',
    
    // API key
    apiKey: 'ecaca6c4-5c79-478d-93ec-9dd4b70763ce', 
    
    // Общая функция для запросов
    makeRequest: async function(endpoint, method = 'GET', data = null) {
        const url = `${this.baseUrl}${endpoint}?api_key=${this.apiKey}`;
        
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        if (data) {
            options.body = JSON.stringify(data);
        }
        
        try {
            const response = await fetch(url, options);
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 
                    `Ошибка ${response.status}`);
            }
            
            return await response.json();
            
        } catch (error) {
            console.error(`Ошибка API (${endpoint}):`, error);
            
            throw error;
        }
    },
    
    // Получение курсов
    getCourses: async function() {
        return await this.makeRequest('/api/courses');
    },
    
    // Получение репетиторов
    getTutors: async function() {
        return await this.makeRequest('/api/tutors');
    },
    
    // Получение заявок пользователя
    getOrders: async function() {
        return await this.makeRequest('/api/orders');
    },
    
    // Получение информации о курсе
    getCourse: async function(courseId) {
        return await this.makeRequest(`/api/courses/${courseId}`);
    },
    
    // Получение информации о репетиторе
    getTutor: async function(tutorId) {
        return await this.makeRequest(`/api/tutors/${tutorId}`);
    },
    
    // Создание новой заявки
    createOrder: async function(orderData) {
        const result = await this.makeRequest(
            '/api/orders', 
            'POST', 
            orderData
        );
        
        return result;
    },
    
    // Обновление заявки
    updateOrder: async function(orderId, orderData) {
        const result = await this.makeRequest(
            `/api/orders/${orderId}`, 
            'PUT', 
            orderData
        );
        
        return result;
    },
    
    // Удаление заявки
    deleteOrder: async function(orderId) {
        const result = await this.makeRequest(
            `/api/orders/${orderId}`, 
            'DELETE'
        );
        
    },
    
    // Получение заявки по ID
    getOrder: async function(orderId) {
        return await this.makeRequest(`/api/orders/${orderId}`);
    }
};

// Делаем Api доступным глобально
window.Api = Api;