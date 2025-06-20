class ScheduleManager {
    async getSchedules() {
        return api.request('/schedule/get');
    }
    
    async createSchedule(data) {
        return api.request('/schedule/create', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
    
    // и т.д.
}