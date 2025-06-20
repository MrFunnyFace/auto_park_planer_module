class ApiClient {
    constructor() {
        this.baseUrl = 'http://localhost:8080/api';
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        // Добавляем токен авторизации если есть
        const user = this.getCurrentUser();
        if (user && user.token) {
            config.headers['Authorization'] = `Bearer ${user.token}`;
        }

        try {
            const response = await fetch(url, config);
            
            // Проверяем на ошибки авторизации
            if (response.status === 401) {
                this.handleUnauthorized();
                throw new Error('Требуется авторизация');
            }

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
            }
            
            return data;
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    getCurrentUser() {
        const user = sessionStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }

    handleUnauthorized() {
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('currentRoute');
        window.location.href = '/pages/auth/index.html';
    }

    // ============ МЕТОДЫ АВТОРИЗАЦИИ ============
    async login(credentials) {
        const response = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
        
        if (response.success && response.data.user) {
            sessionStorage.setItem('user', JSON.stringify(response.data.user));
        }
        
        return response;
    }

    async logout() {
        try {
            await this.request('/auth/logout', { method: 'POST' });
        } catch (error) {
            console.warn('Logout request failed:', error);
        } finally {
            sessionStorage.removeItem('user');
            sessionStorage.removeItem('currentRoute');
            window.location.href = '/pages/auth/index.html';
        }
    }

    async register(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    // ============ DASHBOARD ============
    // async getDashboardData() {
    //     return this.request('/API/dashboard.php?action=getDashboardData');
    // }

    // async getCarsData() {
    //     return this.request('/API/dashboard.php?action=getCars');
    // }

    // async getDriversData() {
    //     return this.request('/API/dashboard.php?action=getDrivers');
    // }

    // async getOrdersData() {
    //     return this.request('/API/dashboard.php?action=getOrders');
    // }

    // async getExpensesData() {
    //     return this.request('/API/dashboard.php?action=getExpenses');
    // }

    // async getRecentActivity() {
    //     return this.request('/API/dashboard.php?action=getRecentActivity');
    // }

    // ============ DASHBOARD ============
    async getDashboardData() {
        return this.request('/dashboard/overview');
    }

    async getCarsData() {
        return this.request('/dashboard/cars');
    }

    async getDriversData() {
        return this.request('/dashboard/drivers');
    }

    async getOrdersData() {
        return this.request('/dashboard/orders');
    }

    async getExpensesData() {
        return this.request('/dashboard/expenses');
    }

    async getRecentActivity() {
        return this.request('/dashboard/activity');
    }

    // ============ АВТОМОБИЛИ ============
    async getCars(filters = {}) {
        const queryParams = new URLSearchParams(filters).toString();
        return this.request(`/modules/cars.php?action=getCars&${queryParams}`);
    }

    async getCarById(carId) {
        return this.request(`/modules/cars.php?action=getCarById&id=${carId}`);
    }

    async createCar(carData) {
        return this.request('/modules/cars.php?action=createCar', {
            method: 'POST',
            body: JSON.stringify(carData)
        });
    }

    async updateCar(carId, carData) {
        return this.request('/modules/cars.php?action=updateCar', {
            method: 'POST',
            body: JSON.stringify({ id: carId, ...carData })
        });
    }

    async updateCarStatus(carId, status) {
        return this.request('/modules/cars.php?action=updateStatus', {
            method: 'POST',
            body: JSON.stringify({ carId, status })
        });
    }

    async assignDriverToCar(carId, driverId) {
        return this.request('/modules/cars.php?action=assignDriver', {
            method: 'POST',
            body: JSON.stringify({ carId, driverId })
        });
    }

    // ============ ВОДИТЕЛИ ============
    async getDrivers(filters = {}) {
        const queryParams = new URLSearchParams(filters).toString();
        return this.request(`/modules/drivers.php?action=getDrivers&${queryParams}`);
    }

    async getDriverById(driverId) {
        return this.request(`/modules/drivers.php?action=getDriverById&id=${driverId}`);
    }

    async createDriver(driverData) {
        return this.request('/modules/drivers.php?action=createDriver', {
            method: 'POST',
            body: JSON.stringify(driverData)
        });
    }

    async updateDriver(driverId, driverData) {
        return this.request('/modules/drivers.php?action=updateDriver', {
            method: 'POST',
            body: JSON.stringify({ id: driverId, ...driverData })
        });
    }

    async getDriverMedicalHistory(driverId) {
        return this.request(`/modules/medical.php?action=getDriverHistory&driverId=${driverId}`);
    }

    // ============ МЕДИЦИНСКИЕ ОСМОТРЫ ============
    async getMedicalRecords(filters = {}) {
        const queryParams = new URLSearchParams(filters).toString();
        return this.request(`/modules/medical.php?action=getRecords&${queryParams}`);
    }

    async createMedicalRecord(medicalData) {
        return this.request('/modules/medical.php?action=createRecord', {
            method: 'POST',
            body: JSON.stringify(medicalData)
        });
    }

    async updateMedicalRecord(recordId, medicalData) {
        return this.request('/modules/medical.php?action=updateRecord', {
            method: 'POST',
            body: JSON.stringify({ id: recordId, ...medicalData })
        });
    }

    // ============ ЗАКАЗЫ ============
    async getOrders(filters = {}) {
        const queryParams = new URLSearchParams(filters).toString();
        return this.request(`/modules/orders.php?action=getOrders&${queryParams}`);
    }

    async getOrderById(orderId) {
        return this.request(`/modules/orders.php?action=getOrderById&id=${orderId}`);
    }

    async createOrder(orderData) {
        return this.request('/modules/orders.php?action=createOrder', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
    }

    async updateOrder(orderId, orderData) {
        return this.request('/modules/orders.php?action=updateOrder', {
            method: 'POST',
            body: JSON.stringify({ id: orderId, ...orderData })
        });
    }

    async updateOrderStatus(orderId, status) {
        return this.request('/modules/orders.php?action=updateStatus', {
            method: 'POST',
            body: JSON.stringify({ orderId, status })
        });
    }

    async assignOrderToDriver(orderId, driverId, carId) {
        return this.request('/modules/orders.php?action=assign', {
            method: 'POST',
            body: JSON.stringify({ orderId, driverId, carId })
        });
    }

    // ============ ПУТЕВЫЕ ЛИСТЫ ============
    async getTravelSheets(filters = {}) {
        const queryParams = new URLSearchParams(filters).toString();
        return this.request(`/modules/travel_sheets.php?action=getTravelSheets&${queryParams}`);
    }

    async createTravelSheet(travelSheetData) {
        return this.request('/modules/travel_sheets.php?action=create', {
            method: 'POST',
            body: JSON.stringify(travelSheetData)
        });
    }

    async closeTravelSheet(travelSheetId, returnData) {
        return this.request('/modules/travel_sheets.php?action=close', {
            method: 'POST',
            body: JSON.stringify({ id: travelSheetId, ...returnData })
        });
    }

    // ============ ТЕХНИЧЕСКОЕ ОБСЛУЖИВАНИЕ ============
    async getMaintenanceRecords(filters = {}) {
        const queryParams = new URLSearchParams(filters).toString();
        return this.request(`/modules/maintenance.php?action=getRecords&${queryParams}`);
    }

    async scheduleMaintenance(maintenanceData) {
        return this.request('/modules/maintenance.php?action=schedule', {
            method: 'POST',
            body: JSON.stringify(maintenanceData)
        });
    }

    async updateMaintenanceStatus(maintenanceId, status, notes = '') {
        return this.request('/modules/maintenance.php?action=updateStatus', {
            method: 'POST',
            body: JSON.stringify({ maintenanceId, status, notes })
        });
    }

    async completeMaintenance(maintenanceId, completionData) {
        return this.request('/modules/maintenance.php?action=complete', {
            method: 'POST',
            body: JSON.stringify({ id: maintenanceId, ...completionData })
        });
    }

    // ============ РЕМОНТ ============
    async getRepairRecords(filters = {}) {
        const queryParams = new URLSearchParams(filters).toString();
        return this.request(`/modules/repairs.php?action=getRecords&${queryParams}`);
    }

    async createRepairRecord(repairData) {
        return this.request('/modules/repairs.php?action=create', {
            method: 'POST',
            body: JSON.stringify(repairData)
        });
    }

    async updateRepairStatus(repairId, status) {
        return this.request('/modules/repairs.php?action=updateStatus', {
            method: 'POST',
            body: JSON.stringify({ repairId, status })
        });
    }

    async completeRepair(repairId, completionData) {
        return this.request('/modules/repairs.php?action=complete', {
            method: 'POST',
            body: JSON.stringify({ id: repairId, ...completionData })
        });
    }

    // ============ РАСХОД ТОПЛИВА ============
    async getFuelConsumption(filters = {}) {
        const queryParams = new URLSearchParams(filters).toString();
        return this.request(`/modules/fuel.php?action=getConsumption&${queryParams}`);
    }

    async addFuelConsumption(fuelData) {
        return this.request('/modules/fuel.php?action=add', {
            method: 'POST',
            body: JSON.stringify(fuelData)
        });
    }

    async getFuelStats(carId, period = 'month') {
        return this.request(`/modules/fuel.php?action=getStats&carId=${carId}&period=${period}`);
    }

    // ============ МАРШРУТЫ ============
    async getRoutes(filters = {}) {
        const queryParams = new URLSearchParams(filters).toString();
        return this.request(`/modules/routes.php?action=getRoutes&${queryParams}`);
    }

    async getRouteById(routeId) {
        return this.request(`/modules/routes.php?action=getRouteById&id=${routeId}`);
    }

    async createRoute(routeData) {
        return this.request('/modules/routes.php?action=create', {
            method: 'POST',
            body: JSON.stringify(routeData)
        });
    }

    async updateRoute(routeId, routeData) {
        return this.request('/modules/routes.php?action=update', {
            method: 'POST',
            body: JSON.stringify({ id: routeId, ...routeData })
        });
    }

    async calculateRoute(startAddress, endAddress, waypoints = []) {
        return this.request('/modules/routes.php?action=calculate', {
            method: 'POST',
            body: JSON.stringify({ startAddress, endAddress, waypoints })
        });
    }

    // ============ ЛИМИТЫ ============
    async getLimits(filters = {}) {
        const queryParams = new URLSearchParams(filters).toString();
        return this.request(`/modules/limits.php?action=getLimits&${queryParams}`);
    }

    async createLimit(limitData) {
        return this.request('/modules/limits.php?action=create', {
            method: 'POST',
            body: JSON.stringify(limitData)
        });
    }

    async updateLimit(limitId, limitData) {
        return this.request('/modules/limits.php?action=update', {
            method: 'POST',
            body: JSON.stringify({ id: limitId, ...limitData })
        });
    }

    async checkLimits(entityType, entityId) {
        return this.request(`/modules/limits.php?action=check&entityType=${entityType}&entityId=${entityId}`);
    }

    async getLimitViolations() {
        return this.request('/modules/limits.php?action=getViolations');
    }

    // ============ АНАЛИТИКА ============
    async getAnalytics(type, period = 'month', filters = {}) {
        const queryParams = new URLSearchParams({ type, period, ...filters }).toString();
        return this.request(`/modules/analytics.php?${queryParams}`);
    }

    async getEfficiencyReport(period = 'month') {
        return this.request(`/modules/analytics.php?action=efficiency&period=${period}`);
    }

    async getCostAnalysis(period = 'month') {
        return this.request(`/modules/analytics.php?action=costs&period=${period}`);
    }

    async getUsageStatistics(period = 'month') {
        return this.request(`/modules/analytics.php?action=usage&period=${period}`);
    }

    // ============ ОТЧЕТЫ ============
    async generateReport(reportType, parameters = {}) {
        return this.request('/modules/reports.php?action=generate', {
            method: 'POST',
            body: JSON.stringify({ reportType, parameters })
        });
    }

    async getReportList() {
        return this.request('/modules/reports.php?action=getList');
    }

    async downloadReport(reportId) {
        // Для загрузки файлов используем обычный fetch без JSON парсинга
        const user = this.getCurrentUser();
        const headers = { 'Content-Type': 'application/json' };
        if (user && user.token) {
            headers['Authorization'] = `Bearer ${user.token}`;
        }

        const response = await fetch(`${this.baseUrl}/modules/reports.php?action=download&id=${reportId}`, {
            method: 'GET',
            headers,
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Ошибка загрузки отчета');
        }

        return response.blob();
    }

    // ============ ПЛАНИРОВАНИЕ ============
    async getSchedule(date, entityType = 'all') {
        return this.request(`/modules/schedule.php?action=getSchedule&date=${date}&entityType=${entityType}`);
    }

    async createScheduleItem(scheduleData) {
        return this.request('/modules/schedule.php?action=create', {
            method: 'POST',
            body: JSON.stringify(scheduleData)
        });
    }

    async updateScheduleItem(itemId, scheduleData) {
        return this.request('/modules/schedule.php?action=update', {
            method: 'POST',
            body: JSON.stringify({ id: itemId, ...scheduleData })
        });
    }

    async deleteScheduleItem(itemId) {
        return this.request('/modules/schedule.php?action=delete', {
            method: 'POST',
            body: JSON.stringify({ id: itemId })
        });
    }

    // ============ УТИЛИТЫ ============
    async uploadFile(file, module, entityId = null) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('module', module);
        if (entityId) {
            formData.append('entityId', entityId);
        }

        const user = this.getCurrentUser();
        const headers = {};
        if (user && user.token) {
            headers['Authorization'] = `Bearer ${user.token}`;
        }

        const response = await fetch(`${this.baseUrl}/upload.php`, {
            method: 'POST',
            headers,
            body: formData,
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Ошибка загрузки файла');
        }

        return response.json();
    }

    async getSystemLogs(filters = {}) {
        const queryParams = new URLSearchParams(filters).toString();
        return this.request(`/modules/logs.php?action=getLogs&${queryParams}`);
    }

    async getNotifications() {
        return this.request('/modules/notifications.php?action=getNotifications');
    }

    async markNotificationAsRead(notificationId) {
        return this.request('/modules/notifications.php?action=markAsRead', {
            method: 'POST',
            body: JSON.stringify({ id: notificationId })
        });
    }

    // ============ ПОИСК ============
    async search(query, types = ['cars', 'drivers', 'orders']) {
        return this.request('/modules/search.php', {
            method: 'POST',
            body: JSON.stringify({ query, types })
        });
    }

    // ============ СТАТИСТИКА В РЕАЛЬНОМ ВРЕМЕНИ ============
    async getRealTimeStats() {
        return this.request('/modules/realtime.php?action=getStats');
    }

    async subscribeToUpdates(callback) {
        // WebSocket или Server-Sent Events для real-time обновлений
        const eventSource = new EventSource(`${this.baseUrl}/modules/realtime.php?action=subscribe`);
        
        eventSource.onmessage = function(event) {
            const data = JSON.parse(event.data);
            callback(data);
        };

        eventSource.onerror = function(error) {
            console.error('EventSource failed:', error);
        };

        return eventSource;
    }
}

// Глобальный экземпляр
window.api = new ApiClient();