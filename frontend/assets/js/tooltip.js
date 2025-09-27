class TooltipManager {
    constructor() {
        this.init();
    }

    init() {
        this.createTooltipContainer();
        this.bindEvents();
    }

    createTooltipContainer() {
        const tooltip = document.createElement('div');
        tooltip.id = 'tooltip';
        tooltip.className = 'tooltip';
        tooltip.style.cssText = `
            position: absolute;
            background: #333;
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 14px;
            z-index: 10000;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease;
            max-width: 250px;
        `;
        document.body.appendChild(tooltip);
    }

    bindEvents() {
        document.addEventListener('mouseover', (e) => {
            if (e.target.hasAttribute('data-tooltip')) {
                this.showTooltip(e.target, e.target.getAttribute('data-tooltip'));
            }
        });

        document.addEventListener('mouseout', (e) => {
            if (e.target.hasAttribute('data-tooltip')) {
                this.hideTooltip();
            }
        });

        document.addEventListener('mousemove', (e) => {
            this.updateTooltipPosition(e);
        });
    }

    showTooltip(element, text) {
        const tooltip = document.getElementById('tooltip');
        tooltip.textContent = text;
        tooltip.style.opacity = '1';
    }

    hideTooltip() {
        const tooltip = document.getElementById('tooltip');
        tooltip.style.opacity = '0';
    }

    updateTooltipPosition(e) {
        const tooltip = document.getElementById('tooltip');
        if (tooltip.style.opacity === '1') {
            tooltip.style.left = e.pageX + 10 + 'px';
            tooltip.style.top = e.pageY - 30 + 'px';
        }
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    new TooltipManager();
});