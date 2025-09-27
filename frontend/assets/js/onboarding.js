class OnboardingManager {
    constructor() {
        this.steps = [
            {
                target: '.dashboard-grid .card:nth-child(1)',
                title: 'Статистика автомобилей',
                content: 'Здесь отображается общая информация о вашем автопарке: количество автомобилей, их статус и текущая загрузка.',
                position: 'bottom'
            },
            {
                target: '.dashboard-grid .card:nth-child(2)',
                title: 'Информация о водителях',
                content: 'В этой карточке показано количество водителей и их текущий статус допуска к работе.',
                position: 'bottom'
            },
            {
                target: '.quick-actions',
                title: 'Быстрые действия',
                content: 'Используйте эти кнопки для быстрого доступа к основным функциям: создание расписаний, заказов и маршрутов.',
                position: 'top'
            },
            {
                target: '#navigation-container',
                title: 'Главное меню',
                content: 'Навигационное меню позволяет переключаться между различными разделами системы управления автопарком.',
                position: 'bottom'
            },
            {
                target: '.card:last-child',
                title: 'Последние события',
                content: 'Здесь отображаются последние действия в системе: изменения в расписании, новые заказы и важные уведомления.',
                position: 'top'
            }
        ];
        this.currentStep = 0;
        this.isActive = false;
    }

    start() {
        if (this.shouldShowOnboarding()) {
            this.isActive = true;
            this.showStep(0);
        }
    }

    shouldShowOnboarding() {
        return !localStorage.getItem('onboarding-completed');
    }

    showStep(stepIndex) {
        if (stepIndex >= this.steps.length) {
            this.complete();
            return;
        }

        this.currentStep = stepIndex;
        const step = this.steps[stepIndex];
        const targetElement = document.querySelector(step.target);

        if (!targetElement) {
            this.nextStep();
            return;
        }

        this.createOverlay();
        this.highlightElement(targetElement);
        this.showTooltip(targetElement, step);
    }

    createOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'onboarding-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 9998;
        `;
        document.body.appendChild(overlay);
    }

    highlightElement(element) {
        const rect = element.getBoundingClientRect();
        const highlight = document.createElement('div');
        highlight.id = 'onboarding-highlight';
        highlight.style.cssText = `
            position: fixed;
            top: ${rect.top - 10}px;
            left: ${rect.left - 10}px;
            width: ${rect.width + 20}px;
            height: ${rect.height + 20}px;
            border: 3px solid #3498db;
            border-radius: 8px;
            z-index: 9999;
            pointer-events: none;
            box-shadow: 0 0 0 4px rgba(52, 152, 219, 0.3);
        `;
        document.body.appendChild(highlight);
    }

    showTooltip(element, step) {
        const tooltip = document.createElement('div');
        tooltip.id = 'onboarding-tooltip';
        tooltip.innerHTML = `
            <div style="margin-bottom: 15px;">
                <h3 style="margin: 0 0 10px 0; color: #2c3e50;">${step.title}</h3>
                <p style="margin: 0; line-height: 1.5; color: #666;">${step.content}</p>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="font-size: 14px; color: #666;">
                    Шаг ${this.currentStep + 1} из ${this.steps.length}
                </div>
                <div>
                    ${this.currentStep > 0 ? '<button id="onboarding-prev" style="margin-right: 10px; padding: 8px 16px; border: 1px solid #ddd; background: white; border-radius: 4px; cursor: pointer;">Назад</button>' : ''}
                    <button id="onboarding-next" style="padding: 8px 16px; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        ${this.currentStep === this.steps.length - 1 ? 'Завершить' : 'Далее'}
                    </button>
                    <button id="onboarding-skip" style="margin-left: 10px; padding: 8px 16px; border: none; background: transparent; color: #666; cursor: pointer; text-decoration: underline;">Пропустить</button>
                </div>
            </div>
        `;

        tooltip.style.cssText = `
            position: fixed;
            background: white;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            z-index: 10000;
            max-width: 350px;
            min-width: 300px;
        `;

        document.body.appendChild(tooltip);
        this.positionTooltip(tooltip, element, step.position);
        this.bindTooltipEvents();
    }

    positionTooltip(tooltip, element, position) {
        const rect = element.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();

        let top, left;

        if (position === 'top') {
            top = rect.top - tooltipRect.height - 15;
            left = rect.left + (rect.width - tooltipRect.width) / 2;
        } else { // bottom
            top = rect.bottom + 15;
            left = rect.left + (rect.width - tooltipRect.width) / 2;
        }

        // Убеждаемся, что тултип не выходит за границы экрана
        if (left < 10) left = 10;
        if (left + tooltipRect.width > window.innerWidth - 10) {
            left = window.innerWidth - tooltipRect.width - 10;
        }

        tooltip.style.top = top + 'px';
        tooltip.style.left = left + 'px';
    }

    bindTooltipEvents() {
        const nextBtn = document.getElementById('onboarding-next');
        const prevBtn = document.getElementById('onboarding-prev');
        const skipBtn = document.getElementById('onboarding-skip');

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextStep());
        }
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.prevStep());
        }
        if (skipBtn) {
            skipBtn.addEventListener('click', () => this.complete());
        }
    }

    nextStep() {
        this.cleanup();
        this.showStep(this.currentStep + 1);
    }

    prevStep() {
        this.cleanup();
        this.showStep(this.currentStep - 1);
    }

    cleanup() {
        const overlay = document.getElementById('onboarding-overlay');
        const highlight = document.getElementById('onboarding-highlight');
        const tooltip = document.getElementById('onboarding-tooltip');

        if (overlay) overlay.remove();
        if (highlight) highlight.remove();
        if (tooltip) tooltip.remove();
    }

    complete() {
        this.cleanup();
        localStorage.setItem('onboarding-completed', 'true');
        this.isActive = false;
        Toast.success('Добро пожаловать в систему управления автопарком!');
    }
}

// Автоматический запуск онбординга
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const onboarding = new OnboardingManager();
        onboarding.start();
    }, 1000);
});