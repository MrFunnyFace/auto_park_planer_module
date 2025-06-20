document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('authForm');
    const alertContainer = document.getElementById('alertContainer');

    // Обработка формы авторизации
    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

        // Валидация
        if (!username || !password) {
            showAlert('Пожалуйста, заполните все поля', 'error');
            return;
        }

        if (!isValidEmail(username)) {
            showAlert('Пожалуйста, введите корректный email', 'error');
            return;
        }

        showAlert('Проверка учетных данных...', 'info');

        try {
            const response = await fetch('/api/auth/login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ username, password })
            });

            let result;
            try {
                result = await response.json();
            } catch (parseError) {
                console.error('Ошибка парсинга JSON:', parseError);
                throw new Error('Некорректный ответ сервера');
            }

            if (response.ok && result.success) {
                showAlert('Авторизация успешна! Перенаправление...', 'success');

                // Сохраняем данные пользователя в sessionStorage
                sessionStorage.setItem('user', JSON.stringify(result.user));

                setTimeout(() => {
                    window.location.href = '/pages/dashboard/index.html';
                }, 1500);
            } else {
                showAlert(result.message || 'Ошибка входа', 'error');
            }
        } catch (error) {
            console.error('Ошибка при запросе:', error);
            showAlert('Ошибка соединения с сервером: ' + error.message, 'error');
        }
    });

    function showAlert(message, type) {
        const alertClass = type === 'error' ? 'alert-error' :
                          type === 'success' ? 'alert-success' : 'alert-info';

        alertContainer.innerHTML = `
            <div class="alert ${alertClass}">${message}</div>
        `;

        if (type !== 'info') {
            setTimeout(() => alertContainer.innerHTML = '', 5000);
        }
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
});

// Функция для проверки авторизации (будет использоваться на других страницах)
function checkAuth() {
    const user = sessionStorage.getItem('user');
    if (!user) {
        window.location.href = '/pages/auth/index.html';
        return false;
    }
    return JSON.parse(user);
}

// Функция выхода
function logout() {
    fetch('/api/auth/logout.php', {
        method: 'POST',
        credentials: 'include'
    }).then(() => {
        sessionStorage.removeItem('user');
        window.location.href = '/pages/auth/index.html';
    });
}