// utils.js - вспомогательные функции

const Utils = {
    // Показ уведомления
    showNotification: function(message, type = 'info') {
        const area = document.getElementById('notification-area');
        if (!area) return;
        
        const id = 'notification-' + Date.now();
        const alertClass = {
            'success': 'alert-success',
            'error': 'alert-danger',
            'warning': 'alert-warning',
            'info': 'alert-info'
        }[type] || 'alert-info';
        
        const notification = document.createElement('div');
        notification.id = id;
        notification.className = `alert ${alertClass} ` +
            `alert-dismissible fade show`;
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" 
                    data-bs-dismiss="alert"></button>
        `;
        
        area.appendChild(notification);
        
        // Автоматическое скрытие через 5 секунд
        setTimeout(() => {
            if (document.getElementById(id)) {
                bootstrap.Alert.getOrCreateInstance(notification).close();
            }
        }, 5000);
    },
    
    // Форматирование даты
    formatDate: function(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU');
    },
    
    // Форматирование времени
    formatTime: function(timeString) {
        if (!timeString) return '';
        return timeString.substring(0, 5);
    },
    
    // Форматирование цены
    formatPrice: function(price) {
        if (!price) return '0';
        return price.toLocaleString('ru-RU');
    }
};

window.Utils = Utils;