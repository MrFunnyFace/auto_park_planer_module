class Dashboard {
constructor() {
    this.refreshInterval = 60000; // Обновление каждую минуту
    this.refreshTimer = null;
    this.isLoading = false;
    this.realTimeUpdates = null;
    this.chartInstances = {};
    this.init();
}

async init() {
    try {
        console.log('Инициализация Dashboard...');
        
        // Проверяем авторизацию
        if (!this.checkAuth()) {
            return;
        }
        
        // Загружаем данные
        await this.loadDashboardData();
        
        // Запускаем автообновление
        this.startAutoRefresh();
        
        // Инициализируем обработчики событий
        this.initEventHandlers();
        
        console.log('Dashboard инициализирован успешно');
    } catch (error) {
        console.error('Ошибка инициализации панели:', error);
        this.showError('Ошибка загрузки панели управления: ' + error.message);
    }
}

checkAuth() {
    // Простая проверка авторизации - можете адаптировать под свою систему
    const user = sessionStorage.getItem('user') || localStorage.getItem('user');
    if (!user) {
        console.warn('Пользователь не авторизован');
        // Раскомментируйте если нужна авторизация
        // window.location.href = '/pages/auth/index.html';
        return false;
    }
    return true;
}

async loadDashboardData() {
    if (this.isLoading) return;
    
    try {
        this.isLoading = true;
        this.showLoading(true);
        
        // Выполняем запрос к API
        const response = await fetch('/api/dashboard/overview', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // Добавьте заголовки авторизации если нужно
                // 'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            this.updateDashboard(data.data);
            console.log('Данные dashboard успешно загружены');
        } else {
            throw new Error(data.message || 'Ошибка получения данных');
        }
        
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        this.showError('Не удалось загрузить данные панели: ' + error.message);
    } finally {
        this.isLoading = false;
        this.showLoading(false);
    }
}

updateDashboard(data) {
    try {
        this.updateCarsCard(data.cars);
        this.updateDriversCard(data.drivers);
        this.updateOrdersCard(data.orders);
        this.updateExpensesCard(data.expenses);
        this.updateRecentActivity(data.recentActivity);
        this.updateLastUpdated();
        this.checkForAlerts(data);
        
        console.log('Dashboard обновлен успешно');
    } catch (error) {
        console.error('Ошибка обновления dashboard:', error);
    }
}

updateCarsCard(carsData) {
    const cardBody = document.querySelector('.dashboard-grid .card:nth-child(1) .card-body');
    if (!cardBody) {
        console.warn('Карточка автомобилей не найдена');
        return;
    }

    const totalCars = carsData.total || 0;
    const inUse = carsData.inUse || 0;
    const maintenance = carsData.maintenance || 0;
    const repair = carsData.repair || 0;
    const available = carsData.available || 0;

    cardBody.innerHTML = `
        <div class="card-stat">
            <div>
                <div class="stat-value">${totalCars}</div>
                <div class="stat-label">Всего автомобилей</div>
            </div>
            <div class="stat-icon">🚗</div>
        </div>
        <div style="display: flex; gap: 1rem; margin-top: 1rem; flex-wrap: wrap;">
            <span class="status status-online" title="Автомобили в работе">${inUse} в работе</span>
            <span class="status status-warning" title="Автомобили на ТО">${maintenance} на ТО</span>
            <span class="status status-error" title="Автомобили в ремонте">${repair} в ремонте</span>
            <span class="status status-offline" title="Доступные автомобили">${available} доступно</span>
        </div>
        <div class="card-actions" style="margin-top: 1rem;">
            <button class="btn btn-sm" onclick="dashboard.showCardDetails(0)">Подробнее</button>
            <button class="btn btn-sm btn-primary" onclick="dashboard.navigateToModule('cars')">Управление</button>
        </div>
    `;
}

updateDriversCard(driversData) {
    const cardBody = document.querySelector('.dashboard-grid .card:nth-child(2) .card-body');
    if (!cardBody) {
        console.warn('Карточка водителей не найдена');
        return;
    }

    const total = driversData.total || 0;
    const allowed = driversData.allowed || 0;
    const notAllowed = driversData.notAllowed || 0;

    cardBody.innerHTML = `
        <div class="card-stat">
            <div>
                <div class="stat-value">${total}</div>
                <div class="stat-label">Активных водителей</div>
            </div>
            <div class="stat-icon">👤</div>
        </div>
        <div style="display: flex; gap: 1rem; margin-top: 1rem; flex-wrap: wrap;">
            <span class="status status-online" title="Допущенные к работе">${allowed} допущены</span>
            <span class="status status-error" title="Не допущенные к работе">${notAllowed} не допущены</span>
        </div>
        <div class="card-actions" style="margin-top: 1rem;">
            <button class="btn btn-sm" onclick="dashboard.showCardDetails(1)">Подробнее</button>
            <button class="btn btn-sm btn-primary" onclick="dashboard.navigateToModule('drivers')">Управление</button>
        </div>
    `;
}

updateOrdersCard(ordersData) {
    const cardBody = document.querySelector('.dashboard-grid .card:nth-child(3) .card-body');
    if (!cardBody) {
        console.warn('Карточка заказов не найдена');
        return;
    }

    const total = ordersData.total || 0;
    const completed = ordersData.completed || 0;
    // ИСПРАВЛЕНО: используем правильные ключи из API
    const inProgress = ordersData.inprogress || 0;
    const created = ordersData.createdtoday || 0;

    cardBody.innerHTML = `
        <div class="card-stat">
            <div>
                <div class="stat-value">${total}</div>
                <div class="stat-label">Заказов сегодня</div>
            </div>
            <div class="stat-icon">📋</div>
        </div>
        <div style="display: flex; gap: 1rem; margin-top: 1rem; flex-wrap: wrap;">
            <span class="status status-online" title="Выполненные заказы">${completed} выполнено</span>
            <span class="status status-warning" title="Заказы в работе">${inProgress} в работе</span>
            <span class="status status-info" title="Созданные заказы">${created} создано</span>
        </div>
        <div class="card-actions" style="margin-top: 1rem;">
            <button class="btn btn-sm" onclick="dashboard.showCardDetails(2)">Подробнее</button>
            <button class="btn btn-sm btn-primary" onclick="dashboard.navigateToModule('orders')">Управление</button>
        </div>
    `;
}

updateExpensesCard(expensesData) {
    const cardBody = document.querySelector('.dashboard-grid .card:nth-child(4) .card-body');
    if (!cardBody) {
        console.warn('Карточка расходов не найдена');
        return;
    }

    const total = expensesData.total || 0;
    const fuel = parseFloat(expensesData.fuel) || 0;
    const maintenance = parseFloat(expensesData.maintenance) || 0;
    const repair = parseFloat(expensesData.repair) || 0;
    const trend = expensesData.trend || '0%';

    cardBody.innerHTML = `
        <div class="card-stat">
            <div>
                <div class="stat-value">₽${this.formatNumber(total)}</div>
                <div class="stat-label">Общие расходы</div>
            </div>
            <div class="stat-icon">💰</div>
        </div>
        <div style="display: flex; gap: 1rem; margin-top: 1rem; flex-wrap: wrap;">
            <span class="status status-online" title="Расходы на топливо">Топливо: ₽${this.formatNumber(fuel)}</span>
            <span class="status status-warning" title="Расходы на ТО">ТО: ₽${this.formatNumber(maintenance)}</span>
            <span class="status status-error" title="Расходы на ремонт">Ремонт: ₽${this.formatNumber(repair)}</span>
        </div>
        <div style="margin-top: 1rem;">
            <small style="color: ${trend.includes('-') ? '#e74c3c' : '#27ae60'};">
                Тренд: ${trend}
            </small>
        </div>
        <div class="card-actions" style="margin-top: 1rem;">
            <button class="btn btn-sm" onclick="dashboard.showCardDetails(3)">Подробнее</button>
            <button class="btn btn-sm btn-primary" onclick="dashboard.navigateToModule('costs')">Управление</button>
        </div>
    `;
}

updateRecentActivity(activities) {
    const activityCard = document.querySelector('.card:last-child .card-body');
    if (!activityCard) {
        console.warn('Карточка последних событий не найдена');
        return;
    }

    if (!activities || activities.length === 0) {
        activityCard.innerHTML = '<div class="no-data">Нет недавних событий</div>';
        return;
    }

    const activitiesHTML = activities.map(activity => {
        const colorClass = this.getActivityColor(activity.type);
        const icon = this.getActivityIcon(activity.type);
        // ИСПРАВЛЕНО: используем created_at вместо time
        const time = new Date(activity.created_at).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        return `
            <div class="activity-item" style="
                padding: 1rem; 
                background: #f8f9fa; 
                border-radius: 4px; 
                border-left: 4px solid ${colorClass};
                display: flex;
                align-items: center;
                gap: 10px;
            ">
                <span style="font-size: 16px;">${icon}</span>
                <div style="flex: 1;">
                    <strong>${time}</strong> - ${activity.description}
                </div>
            </div>
        `;
    }).join('');

    activityCard.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 1rem;">
            ${activitiesHTML}
        </div>
        <div style="text-align: center; margin-top: 1rem;">
            <button class="btn btn-sm" onclick="dashboard.showAllActivity()">Показать все события</button>
        </div>
    `;
}

getActivityColor(type) {
    const colors = {
        'order': '#3498db',
        'car': '#1abc9c',
        'maintenance': '#f39c12',
        'driver': '#9b59b6',
        'fuel': '#1abc9c',
        'medical': '#34495e',
        'default': '#95a5a6'
    };
    return colors[type] || colors.default;
}

getActivityIcon(type) {
    const icons = {
        'order': '📋',
        'car': '🚗',
        'maintenance': '🔧',
        'driver': '👤',
        'fuel': '⛽',
        'medical': '🏥',
        'default': '📋'
    };
    return icons[type] || icons.default;
}

showLoading(show) {
    const loadingState = document.getElementById('loading-state');
    const dashboardContent = document.querySelector('.dashboard-content');
    
    if (show) {
        if (loadingState) loadingState.style.display = 'block';
        if (dashboardContent) dashboardContent.style.display = 'none';
    } else {
        if (loadingState) loadingState.style.display = 'none';
        if (dashboardContent) dashboardContent.style.display = 'block';
    }
}

showError(message) {
    this.showNotification(message, 'error');
}

showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const colors = {
        'info': '#3498db',
        'success': '#27ae60',
        'warning': '#f39c12',
        'error': '#e74c3c'
    };

    const icons = {
        'info': 'ℹ️',
        'success': '✅',
        'warning': '⚠️',
        'error': '❌'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type]};
        color: white;
        padding: 15px 20px;
        border-radius: 4px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        max-width: 400px;
        animation: slideIn 0.3s ease-out;
        margin-bottom: 10px;
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <span>${icons[type]}</span>
            <span style="flex: 1;">${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" style="
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                font-size: 18px;
                padding: 0;
                margin-left: 10px;
            ">×</button>
        </div>
    `;
    
    // Добавляем анимацию
    if (!document.querySelector('#notification-style')) {
        const style = document.createElement('style');
        style.id = 'notification-style';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Автоматически убираем через время
    const autoRemoveTime = type === 'error' ? 8000 : 5000;
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, autoRemoveTime);
}

updateLastUpdated() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
    });
    
    let lastUpdatedElement = document.querySelector('.last-updated');
    if (!lastUpdatedElement) {
        lastUpdatedElement = document.createElement('div');
        lastUpdatedElement.className = 'last-updated';
        lastUpdatedElement.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 5px 10px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 1000;
            transition: opacity 0.3s;
        `;
        document.body.appendChild(lastUpdatedElement);
    }
    
    lastUpdatedElement.textContent = `Обновлено: ${timeString}`;
    
    // Анимация обновления
    lastUpdatedElement.style.opacity = '1';
    setTimeout(() => {
        lastUpdatedElement.style.opacity = '0.7';
    }, 1000);
}

formatNumber(num) {
    return new Intl.NumberFormat('ru-RU').format(num);
}

checkForAlerts(data) {
    const alerts = [];
    
    // Проверяем критические состояния
    if (data.cars.repair > 0) {
        alerts.push({
            type: 'warning',
            message: `${data.cars.repair} автомобиль(ей) в ремонте`
        });
    }
    
    if (data.drivers.notAllowed > 0) {
        alerts.push({
            type: 'error',
            message: `${data.drivers.notAllowed} водитель(ей) не допущены к работе`
        });
    }
    
    // Показываем алерты
    alerts.forEach(alert => {
        this.showNotification(alert.message, alert.type);
    });
}

initEventHandlers() {
    // Обработчик для обновления данных
    document.addEventListener('keydown', (e) => {
        if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
            e.preventDefault();
            this.loadDashboardData();
        }
    });
}

navigateToModule(module, action = null) {
    const routes = {
        'cars': '/pages/cars/index.html',
        'drivers': '/pages/drivers/index.html',
        'orders': '/pages/orders/index.html',
        'costs': '/pages/costs/index.html',
    };

    let url = routes[module];
    if (url) {
        if (action) {
            url += `?action=${action}`;
        }
        window.location.href = url;
    } else {
        this.showError('Модуль не найден: ' + module);
    }
}

showCardDetails(cardIndex) {
    // Заглушка для детальной информации
    this.showNotification('Детальная информация будет доступна в следующих версиях', 'info');
}

showAllActivity() {
    // Заглушка для всех событий
    this.showNotification('Полная история событий будет доступна в следующих версиях', 'info');
}

startAutoRefresh() {
    this.stopAutoRefresh();
    
    this.refreshTimer = setInterval(() => {
        console.log('Автообновление dashboard...');
        this.loadDashboardData();
    }, this.refreshInterval);
    
    console.log(`Автообновление запущено (каждые ${this.refreshInterval/1000} сек)`);
}

stopAutoRefresh() {
    if (this.refreshTimer) {
        clearInterval(this.refreshTimer);
        this.refreshTimer = null;
        console.log('Автообновление остановлено');
    }
}

destroy() {
    this.stopAutoRefresh();
    
    // Удаляем элементы, созданные классом
    const elementsToRemove = [
        '.last-updated',
        '.notification'
    ];
    
    elementsToRemove.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => el.remove());
    });
    
    console.log('Dashboard уничтожен');
}
}

// Автоматическая инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
window.dashboard = new Dashboard();
});

// Обработка выгрузки страницы
window.addEventListener('beforeunload', () => {
if (window.dashboard) {
    window.dashboard.destroy();
}
});