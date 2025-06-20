// Конфигурация маршрутов
const routes = {
    'dashboard': '/pages/dashboard/index.html',
    'schedule': '/pages/schedule/index.html',
    'planning': '/pages/planning/index.html',
    'costs': '/pages/costs/index.html',
    'routes': '/pages/routes/index.html',
    'analytics': '/pages/analytics/index.html',
    'limits': '/pages/limits/index.html'
};

// Функция инициализации навигации
function initNavigation() {
    // Проверяем авторизацию на всех страниях кроме страницы входа
    if (!window.location.pathname.includes('/auth/')) {
        checkAuth();
    }

    // Находим все навигационные ссылки
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            const href = this.getAttribute('href');
            const route = href.replace('#', '');
            
            // Проверяем, существует ли маршрут
            if (routes[route]) {
                navigateTo(route);
            } else {
                console.warn('Маршрут не найден:', route);
            }
        });
    });

    // Устанавливаем активный пункт меню на основе текущей страницы
    setActiveNavItem();
}

// Функция навигации
function navigateTo(route) {
    if (routes[route]) {
        // Сохраняем текущий маршрут
        sessionStorage.setItem('currentRoute', route);
        
        // Переходим на страницу
        window.location.href = routes[route];
    }
}

// Функция установки активного пункта меню
function setActiveNavItem() {
    const currentPath = window.location.pathname;
    const navItems = document.querySelectorAll('.nav-item');
    
    // Сначала убираем активный класс у всех пунктов
    navItems.forEach(item => item.classList.remove('active'));
    
    // Определяем текущий раздел на основе пути
    let currentSection = 'dashboard'; // по умолчанию
    
    if (currentPath.includes('/schedule/')) currentSection = 'schedule';
    else if (currentPath.includes('/planning/')) currentSection = 'planning';
    else if (currentPath.includes('/costs/')) currentSection = 'costs';
    else if (currentPath.includes('/routes/')) currentSection = 'routes';
    else if (currentPath.includes('/analytics/')) currentSection = 'analytics';
    else if (currentPath.includes('/limits/')) currentSection = 'limits';
    
    // Устанавливаем активный класс для соответствующего пункта
    const activeItem = document.querySelector(`[href="#${currentSection}"]`);
    if (activeItem) {
        activeItem.classList.add('active');
    }
}

function setActiveButtonItem() {
    const currentPath = window.location.pathname;
    const logoutButton = document.getElementById('logout_button');
    
    // Добавляем обработчик клика
    logoutButton.addEventListener('click', logout);
}



// Функция проверки авторизации (используется на всех страницах)
function checkAuth() {
    const user = sessionStorage.getItem('user');
    if (!user) {
        window.location.href = '/pages/auth/index.html';
        return false;
    }
    return JSON.parse(user);
}

// Функция создания навигационного меню (для динамического создания)
function createNavigation(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const navHTML = `
        <nav class="nav">
            <div class="nav-content">
                <a href="#dashboard" class="nav-item">Главная</a>
                <a href="#schedule" class="nav-item">График работы</a>
                <a href="#planning" class="nav-item">Планирование ресурсов</a>
                <a href="#costs" class="nav-item">Экономика автопарка</a>
                <a href="#routes" class="nav-item">Маршруты</a>
                <a href="#analytics" class="nav-item">Эффективность</a>
                <a href="#limits" class="nav-item">Лимиты</a>
            </div>
        </nav>
    `;
    
    container.innerHTML = navHTML;
}

// Функция выхода (используется на всех страницах)
function logout() {
    if (confirm('Вы уверены, что хотите выйти?')) {
        fetch('/api/auth/logout.php', {
            method: 'POST',
            credentials: 'include'
        }).then(() => {
            sessionStorage.removeItem('user');
            sessionStorage.removeItem('currentRoute');
            window.location.href = '/pages/auth/index.html';
        }).catch(() => {
            // Даже если запрос на сервер не удался, очищаем локальные данные
            sessionStorage.removeItem('user');
            sessionStorage.removeItem('currentRoute');
            window.location.href = '/pages/auth/index.html';
        });
    }
}



// Функция получения информации о пользователе
function getCurrentUser() {
    const user = sessionStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

// Функция проверки роли пользователя
function hasRole(requiredRole) {
    const user = getCurrentUser();
    if (!user) return false;

    // Новая иерархия ролей
    const roleHierarchy = {
        'Mechanic': 1,
        'Doctor': 2,
        'Dispatcher': 3,
        'Scheduler': 4,
        'Admin': 5
    };

    const userRoleLevel = roleHierarchy[user.role] || 0;
    const requiredRoleLevel = roleHierarchy[requiredRole] || 0;

    return userRoleLevel >= requiredRoleLevel;
}

// Функция отображения информации о пользователе в шапке
function displayUserInfo() {
    const user = getCurrentUser();
    const userInfoElement = document.getElementById('user-info');
    
    if (user && userInfoElement) {
        userInfoElement.innerHTML = `
            <span>${user.name}</span>
            <span style="margin-left: 1rem;">${user.role}</span>
            ${user.role === 'Admin' ? '<button id="admin_button">Админка</button>' : ''}
            <button id="logout_button">Выход</button>
        `;

        // Назначить событие на кнопку "Админка", если она есть
        const adminBtn = document.getElementById('admin_button');
        if (adminBtn) {
            adminBtn.addEventListener('click', () => {
                window.location.href = '/pages/admin/admin.html';
            });
        }
    }
}

// Автоматическая инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    displayUserInfo();
    checkAuth();
});

// Вызываем функцию при загрузке страницы
document.addEventListener('DOMContentLoaded', setActiveButtonItem);

// Функции для работы с историей браузера
window.addEventListener('popstate', function(event) {
    setActiveNavItem();
});

// Экспортируем функции для использования в других скриптах
window.Navigation = {
    init: initNavigation,
    navigateTo: navigateTo,
    setActive: setActiveNavItem,
    checkAuth: checkAuth,
    logout: logout,
    getCurrentUser: getCurrentUser,
    hasRole: hasRole,
    displayUserInfo: displayUserInfo,
    createNavigation: createNavigation
};