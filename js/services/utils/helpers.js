// Utilidades generales
const helpers = {
    // Formatear fecha
    formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES');
    },

    // Formatear fecha y hora
    formatDateTime(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleString('es-ES');
    },

    // Mostrar alertas
    showAlert(message, type = 'info') {
        // Crear alerta de Bootstrap
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-custom alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        // Agregar al inicio del content-area
        const contentArea = document.querySelector('.content-area');
        contentArea.insertBefore(alertDiv, contentArea.firstChild);

        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    },

    // Validar email
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Validar teléfono
    isValidPhone(phone) {
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/;
        return phoneRegex.test(phone);
    },

    // Generar ID único
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // Capitalizar texto
    capitalize(text) {
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    },

    // Debounce para búsquedas
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

// Hacer disponibles globalmente
window.showAlert = helpers.showAlert;
window.formatDate = helpers.formatDate;
window.formatDateTime = helpers.formatDateTime;