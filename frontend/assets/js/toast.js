class ToastManager {
    constructor() {
        this.createToastContainer();
    }

    createToastContainer() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10001;
            max-width: 350px;
        `;
        document.body.appendChild(container);
    }

    show(message, type = 'info', duration = 4000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const colors = {
            success: '#27ae60',
            error: '#e74c3c',
            warning: '#f39c12',
            info: '#3498db'
        };

        toast.style.cssText = `
            background: ${colors[type]};
            color: white;
            padding: 15px 20px;
            margin-bottom: 10px;
            border-radius: 4px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            transform: translateX(100%);
            transition: transform 0.3s ease;
            position: relative;
            cursor: pointer;
        `;

        toast.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <span>${message}</span>
                <span style="margin-left: 15px; font-size: 18px;">&times;</span>
            </div>
        `;

        const container = document.getElementById('toast-container');
        container.appendChild(toast);

        // Анимация появления
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 10);

        // Закрытие по клику
        toast.addEventListener('click', () => {
            this.remove(toast);
        });

        // Автоматическое закрытие
        setTimeout(() => {
            this.remove(toast);
        }, duration);
    }

    remove(toast) {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }

    success(message) {
        this.show(message, 'success');
    }

    error(message) {
        this.show(message, 'error');
    }

    warning(message) {
        this.show(message, 'warning');
    }

    info(message) {
        this.show(message, 'info');
    }
}

// Глобальный экземпляр
window.Toast = new ToastManager();