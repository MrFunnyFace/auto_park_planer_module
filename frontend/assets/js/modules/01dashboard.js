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
            
            // Подключаем real-time обновления
            this.initRealTimeUpdates();
            
            // Инициализируем обработчики событий
            this.initEventHandlers();
            
            // Инициализируем графики
            this.initCharts();
            
            console.log('Dashboard инициализирован успешно');
        } catch (error) {
            console.error('Ошибка инициализации панели:', error);
            this.showError('Ошибка загрузки панели управления: ' + error.message);
        }
    }

    checkAuth() {
        const user = sessionStorage.getItem('user');
        if (!user) {
            console.warn('Пользователь не авторизован');
            window.location.href = '/pages/auth/index.html';
            return false;
        }
        return JSON.parse(user);
    }

    async loadDashboardData() {
        if (this.isLoading) return;
        
        try {
            this.isLoading = true;
            this.showLoading(true);
            
            // Используем новый API клиент
            const data = await window.api.getDashboardData();
            
            if (data.success) {
                this.updateDashboard(data.data);
                console.log('Данные dashboard успешно загружены');
            } else {
                throw new Error(data.message || 'Ошибка получения данных');
            }
            
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            
            if (error.message.includes('авторизация')) {
                window.location.href = '/pages/auth/index.html';
                return;
            }
            
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
            this.updateCharts(data);
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
        const inProgress = ordersData.inProgress || 0;
        const created = ordersData.created || 0;

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
        const fuel = expensesData.fuel || 0;
        const maintenance = expensesData.maintenance || 0;
        const repair = expensesData.repair || 0;

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
                        <strong>${activity.time}</strong> - ${activity.description}
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
            'shift_start': '#3498db',
            'maintenance': '#f39c12',
            'order_completed': '#27ae60',
            'limit_exceeded': '#e74c3c',
            'repair': '#9b59b6',
            'fuel': '#1abc9c',
            'medical': '#34495e',
            'default': '#95a5a6'
        };
        return colors[type] || colors.default;
    }

    getActivityIcon(type) {
        const icons = {
            'shift_start': '🚀',
            'maintenance': '🔧',
            'order_completed': '✅',
            'limit_exceeded': '⚠️',
            'repair': '🔨',
            'fuel': '⛽',
            'medical': '🏥',
            'default': '📋'
        };
        return icons[type] || icons.default;
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

    showLoading(show) {
        let loader = document.querySelector('.dashboard-loader');
        
        if (show) {
            if (!loader) {
                loader = document.createElement('div');
                loader.className = 'dashboard-loader';
                loader.innerHTML = `
                    <div style="
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: rgba(255, 255, 255, 0.8);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 9999;
                    ">
                        <div style="
                            display: flex;
                            align-items: center;
                            gap: 10px;
                            padding: 20px;
                            background: white;
                            border-radius: 8px;
                            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                        ">
                            <div class="spinner" style="
                                border: 4px solid #f3f3f3;
                                border-top: 4px solid #3498db;
                                border-radius: 50%;
                                width: 20px;
                                height: 20px;
                                animation: spin 1s linear infinite;
                            "></div>
                            <span>Загрузка данных...</span>
                        </div>
                    </div>
                `;
                
                // Добавляем CSS анимацию
                if (!document.querySelector('#spinner-style')) {
                    const style = document.createElement('style');
                    style.id = 'spinner-style';
                    style.textContent = `
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    `;
                    document.head.appendChild(style);
                }
                
                document.body.appendChild(loader);
            }
            loader.style.display = 'flex';
        } else {
            if (loader) {
                loader.style.display = 'none';
            }
        }
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showWarning(message) {
        this.showNotification(message, 'warning');
    }

    showInfo(message) {
        this.showNotification(message, 'info');
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
        
        // Располагаем уведомления одно под другим
        const existingNotifications = document.querySelectorAll('.notification');
        let topOffset = 20;
        existingNotifications.forEach(notif => {
            topOffset += notif.offsetHeight + 10;
        });
        notification.style.top = topOffset + 'px';
        
        document.body.appendChild(notification);
        
        // Автоматически убираем через время
        const autoRemoveTime = type === 'error' ? 8000 : 5000;
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease-out';
                setTimeout(() => notification.remove(), 300);
            }
        }, autoRemoveTime);
    }

    initEventHandlers() {
        // Обработчик для кнопок быстрых действий
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const href = btn.getAttribute('href');
                this.handleQuickAction(href);
            });
        });

        // Обработчик для клика по карточкам
        document.querySelectorAll('.dashboard-grid .card').forEach((card, index) => {
            // Добавляем визуальную обратную связь
            card.style.cursor = 'pointer';
            card.style.transition = 'transform 0.2s, box-shadow 0.2s';
            
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-2px)';
                card.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
                card.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
            });
        });

        // Обработчик для обновления данных
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
                e.preventDefault();
                this.loadDashboardData();
            }
        });

        // // Обработчик для поиска
        // this.initSearchHandler();
    }

    // initSearchHandler() {
    //     let searchInput = document.querySelector('#global-search');
    //     if (!searchInput) {
    //         // Создаем поле поиска если его нет
    //         const header = document.querySelector('.header-content');
    //         if (header) {
    //             const searchContainer = document.createElement('div');
    //             searchContainer.innerHTML = `
    //                 <input type="text" id="global-search" placeholder="Поиск..." style="
    //                     padding: 8px 12px;
    //                     border: 1px solid #ddd;
    //                     border-radius: 4px;
    //                     width: 200px;
    //                 ">
    //             `;
    //             header.insertBefore(searchContainer, header.lastElementChild);
    //             searchInput = document.querySelector('#global-search');
    //         }
    //     }

    //     if (searchInput) {
    //         let searchTimeout;
    //         searchInput.addEventListener('input', (e) => {
    //             clearTimeout(searchTimeout);
    //             searchTimeout = setTimeout(() => {
    //                 this.performSearch(e.target.value);
    //             }, 300);
    //         });
    //     }
    // }

    // async performSearch(query) {
    //     if (query.length < 2) return;
        
    //     try {
    //         const results = await window.api.search(query);
    //         this.showSearchResults(results);
    //     } catch (error) {
    //         console.error('Ошибка поиска:', error);
    //     }
    // }

    // showSearchResults(results) {
    //     // Реализация показа результатов поиска
    //     console.log('Результаты поиска:', results);
    // }

    handleQuickAction(action) {
        console.log('Быстрое действие:', action);
        
        const actionMap = {
            '#schedule-new': () => this.navigateToModule('schedule', 'new'),
            '#order-new': () => this.navigateToModule('orders', 'new'),
            '#route-new': () => this.navigateToModule('routes', 'new'),
            '#report-costs': () => this.navigateToModule('costs', 'report'),
            '#limits-set': () => this.navigateToModule('limits', 'set'),
            '#analytics': () => this.navigateToModule('analytics')
        };

        const actionFunction = actionMap[action];
        if (actionFunction) {
            actionFunction();
        } else {
            this.showInfo('Функция будет реализована в следующих версиях');
        }
    }

    navigateToModule(module, action = null) {
        const routes = {
            'cars': '/pages/cars/index.html',
            'drivers': '/pages/drivers/index.html',
            'orders': '/pages/orders/index.html',
            'schedule': '/pages/schedule/index.html',
            'routes': '/pages/routes/index.html',
            'costs': '/pages/costs/index.html',
            'limits': '/pages/limits/index.html',
            'analytics': '/pages/analytics/index.html'
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

    async showCardDetails(cardIndex) {
        const cardTitles = ['Автомобили', 'Водители', 'Заказы', 'Расходы'];
        const apiMethods = [
            () => window.api.getCarsData(),
            () => window.api.getDriversData(),
            () => window.api.getOrdersData(),
            () => window.api.getExpensesData()
        ];
        
        if (cardIndex >= cardTitles.length) return;
        
        try {
            this.showLoading(true);
            
            const response = await apiMethods[cardIndex]();
            
            if (response.success) {
                this.showDetailModal(cardTitles[cardIndex], response.data);
            } else {
                throw new Error(response.message || 'Ошибка получения данных');
            }
            
        } catch (error) {
            console.error('Ошибка загрузки деталей:', error);
            this.showError('Не удалось загрузить детальную информацию: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    }

    showDetailModal(title, data) {
        const modal = document.createElement('div');
        modal.className = 'detail-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease-out;
        `;
        
        modal.innerHTML = `
            <div style="
                background: white;
                border-radius: 8px;
                padding: 20px;
                max-width: 90%;
                max-height: 90%;
                overflow-y: auto;
                position: relative;
                animation: scaleIn 0.3s ease-out;
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
                    <h2 style="margin: 0;">${title}</h2>
                    <button onclick="this.closest('.detail-modal').remove()" style="
                        background: none;
                        border: none;
                        font-size: 24px;
                        cursor: pointer;
                        color: #666;
                        padding: 0;
                        width: 30px;
                        height: 30px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    " onmouseover="this.style.background='#f0f0f0'" onmouseout="this.style.background='none'">×</button>
                </div>
                <div class="detail-content">
                    ${this.formatDetailData(data, title)}
                </div>
            </div>
        `;
        
        // Добавляем анимации
        if (!document.querySelector('#modal-style')) {
            const style = document.createElement('style');
            style.id = 'modal-style';
            style.textContent = `
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from { transform: scale(0.7); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(modal);
        
        // Закрытие по ESC
        const closeOnEsc = (e) => {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', closeOnEsc);
            }
        };
        document.addEventListener('keydown', closeOnEsc);
        
        // Закрытие по клику вне модального окна
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                document.removeEventListener('keydown', closeOnEsc);
            }
        });
    }

    formatDetailData(data, title) {
        if (!data || data.length === 0) {
            return '<div class="no-data" style="text-align: center; padding: 40px; color: #666;">Нет данных для отображения</div>';
        }

        let html = '<div style="overflow-x: auto;"><table style="width: 100%; border-collapse: collapse; font-size: 14px;">';
        
        switch (title) {
            case 'Автомобили':
                html += `
                    <tr style="background: #f8f9fa;">
                        <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Гос. номер</th>
                        <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Модель</th>
                        <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Статус</th>
                        <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Водитель</th>
                        <th style="padding: 12px; border: 1px solid #ddd; text-align: right;">Пробег</th>
                    </tr>
                `;
                data.forEach(item => {
                    const statusColor = this.getStatusColor(item.car_status);
                    html += `
                        <tr style="border-bottom: 1px solid #eee;">
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">${item.car_gosnomer || '-'}</td>
                            <td style="padding: 12px; border: 1px solid #ddd;">${item.car_model || '-'}</td>
                            <td style="padding: 12px; border: 1px solid #ddd;">
                                <span style="background: ${statusColor}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px;">
                                    ${item.car_status || '-'}
                                </span>
                            </td>
                            <td style="padding: 12px; border: 1px solid #ddd;">${item.driver_name || 'Не назначен'}</td>
                            <td style="padding: 12px; border: 1px solid #ddd; text-align: right;">${this.formatNumber(item.car_mileage || 0)} км</td>
                        </tr>
                    `;
                });
                break;
                
            case 'Водители':
                html += `
                    <tr style="background: #f8f9fa;">
                        <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Имя</th>
                        <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Категория</th>
                        <th style="padding: 12px; border: 1px solid #ddd; text-align: center;">Опыт</th>
                        <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Мед. статус</th>
                        <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Автомобиль</th>
                    </tr>
                `;
                data.forEach(item => {
                    const medStatusColor = item.med_status === 'Allowed' ? '#27ae60' : '#e74c3c';
                    html += `
                        <tr style="border-bottom: 1px solid #eee;">
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">${item.dr_name || '-'}</td>
                            <td style="padding: 12px; border: 1px solid #ddd;">${item.dr_category || '-'}</td>
                            <td style="padding: 12px; border: 1px solid #ddd; text-align: center;">${item.dr_experience || 0} лет</td>
                            <td style="padding: 12px; border: 1px solid #ddd;">
                                <span style="background: ${medStatusColor}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px;">
                                    ${item.med_status || '-'}
                                </span>
                            </td>
                            <td style="padding: 12px; border: 1px solid #ddd;">${item.assigned_car || 'Не назначен'}</td>
                        </tr>
                    `;
                });
                break;
                
            case 'Заказы':
                html += `
                    <tr style="background: #f8f9fa;">
                        <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Клиент</th>
                        <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Откуда</th>
                        <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Куда</th>
                        <th style="padding: 12px; border: 1px solid #ddd; text-align: center;">Время</th>
                        <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Статус</th>
                    </tr>
                `;
                data.forEach(item => {
                    const statusColor = this.getOrderStatusColor(item.ord_status);
                    html += `
                        <tr style="border-bottom: 1px solid #eee;">
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">${item.ord_client_name || '-'}</td>
                            <td style="padding: 12px; border: 1px solid #ddd; max-width: 200px; word-wrap: break-word;">${item.ord_pickup_address || '-'}</td>
                            <td style="padding: 12px; border: 1px solid #ddd; max-width: 200px; word-wrap: break-word;">${item.ord_delivery_address || '-'}</td>
                            <td style="padding: 12px; border: 1px solid #ddd; text-align: center;">${item.ord_scheduled_time || '-'}</td>
                            <td style="padding: 12px; border: 1px solid #ddd;">
                                <span style="background: ${statusColor}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px;">
                                    ${item.ord_status || '-'}
                                </span>
                            </td>
                        </tr>
                    `;
                });
                break;
                
            case 'Расходы':
                html += `
                    <tr style="background: #f8f9fa;">
                        <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Тип расхода</th>
                        <th style="padding: 12px; border: 1px solid #ddd; text-align: right;">Общая сумма</th>
                        <th style="padding: 12px; border: 1px solid #ddd; text-align: center;">Количество</th>
                        <th style="padding: 12px; border: 1px solid #ddd; text-align: right;">Средняя сумма</th>
                    </tr>
                `;
                data.forEach(item => {
                    const typeNames = {
                        'fuel': 'Топливо',
                        'maintenance': 'ТО',
                        'repair': 'Ремонт'
                    };
                    html += `
                        <tr style="border-bottom: 1px solid #eee;">
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">${typeNames[item.expense_type] || item.expense_type}</td>
                            <td style="padding: 12px; border: 1px solid #ddd; text-align: right; font-weight: bold;">₽${this.formatNumber(item.total_cost || 0)}</td>
                            <td style="padding: 12px; border: 1px solid #ddd; text-align: center;">${item.count || 0}</td>
                            <td style="padding: 12px; border: 1px solid #ddd; text-align: right;">₽${this.formatNumber(item.avg_cost || 0)}</td>
                        </tr>
                    `;
                });
                break;
        }
        
        html += '</table></div>';
        return html;
    }

    getStatusColor(status) {
        const colors = {
            'Available': '#27ae60',
            'In use': '#3498db',
            'Maintenance': '#f39c12',
            'Repair': '#e74c3c',
            'Out of service': '#95a5a6'
        };
        return colors[status] || '#95a5a6';
    }

    getOrderStatusColor(status) {
        const colors = {
            'Created': '#3498db',
            'In progress': '#f39c12',
            'Completed': '#27ae60',
            'Cancelled': '#e74c3c'
        };
        return colors[status] || '#95a5a6';
    }

    async showAllActivity() {
        try {
            const response = await window.api.getRecentActivity();
            if (response.success) {
                this.showDetailModal('Все события', response.data);
            }
        } catch (error) {
            this.showError('Ошибка загрузки событий: ' + error.message);
        }
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

    initCharts() {
        // Инициализация графиков (будет расширена при добавлении Chart.js)
        console.log('Инициализация графиков...');
    }

    updateCharts(data) {
        // Обновление графиков
        console.log('Обновление графиков...', data);
    }

    initRealTimeUpdates() {
        try {
            this.realTimeUpdates = window.api.subscribeToUpdates((data) => {
                console.log('Real-time update:', data);
                
                // Обновляем соответствующие части интерфейса
                if (data.type === 'dashboard') {
                    this.updateDashboard(data.data);
                } else if (data.type === 'notification') {
                    this.showNotification(data.message, data.level || 'info');
                }
            });
            
            console.log('Real-time обновления подключены');
        } catch (error) {
            console.warn('Не удалось подключить real-time обновления:', error);
        }
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
        
        // Отключаем real-time обновления
        if (this.realTimeUpdates) {
            this.realTimeUpdates.close();
            this.realTimeUpdates = null;
        }
        
        // Удаляем элементы, созданные классом
        const elementsToRemove = [
            '.last-updated',
            '.dashboard-loader',
            '.notification',
            '.detail-modal'
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
    // Ждем загрузки API клиента
    if (window.api) {
        window.dashboard = new Dashboard();
    } else {
        // Ждем загрузки API
        const checkApi = setInterval(() => {
            if (window.api) {
                clearInterval(checkApi);
                window.dashboard = new Dashboard();
            }
        }, 100);
    }
});

// Обработка выгрузки страницы
window.addEventListener('beforeunload', () => {
    if (window.dashboard) {
        window.dashboard.destroy();
    }
});