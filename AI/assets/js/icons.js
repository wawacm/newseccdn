/**
 * 现代化图标系统 - 高级质感科技感版本
 * 提供SVG图标的便捷使用方法，优化视觉效果
 */

class IconSystem {
    constructor() {
        this.iconsLoaded = false;
        this.enhancedIcons = true; // 启用增强视觉效果
        this.initializeSystem();
    }

    /**
     * 初始化图标系统
     */
    async initializeSystem() {
        this.injectIconStyles();
        await this.loadIcons();
        this.setupDynamicEffects();
    }

    /**
     * 注入图标相关样式
     */
    injectIconStyles() {
        const styles = `
            <style>
                .icon {
                    display: inline-block;
                    width: 1em;
                    height: 1em;
                    fill: currentColor;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    vertical-align: -0.125em;
                }
                
                .icon-enhanced {
                    filter: drop-shadow(0 0 6px rgba(0, 212, 255, 0.3));
                }
                
                .icon-glow {
                    filter: drop-shadow(0 0 12px rgba(0, 212, 255, 0.6));
                }
                
                .icon-pulse {
                    animation: iconPulse 2s ease-in-out infinite;
                }
                
                @keyframes iconPulse {
                    0%, 100% { 
                        filter: drop-shadow(0 0 6px rgba(0, 212, 255, 0.3));
                        transform: scale(1);
                    }
                    50% { 
                        filter: drop-shadow(0 0 12px rgba(0, 212, 255, 0.6));
                        transform: scale(1.05);
                    }
                }
                
                .icon-spin {
                    animation: iconSpin 1s linear infinite;
                }
                
                @keyframes iconSpin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                
                .icon-hover-glow:hover {
                    filter: drop-shadow(0 0 12px rgba(0, 212, 255, 0.6));
                    transform: scale(1.1);
                }
                
                .icon-interactive {
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                .icon-interactive:hover {
                    filter: drop-shadow(0 0 8px rgba(0, 212, 255, 0.5));
                    transform: scale(1.05);
                }
                
                .icon-interactive:active {
                    transform: scale(0.95);
                }
                
                /* 特殊图标样式 */
                .icon-robot {
                    background: linear-gradient(135deg, #00d4ff, #8b5cf6);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                
                .icon-user {
                    background: linear-gradient(135deg, #00d4ff, #0099cc);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                
                .icon-send {
                    background: linear-gradient(135deg, #00d4ff, #8b5cf6);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', styles);
    }

    /**
     * 加载SVG图标文件
     */
    async loadIcons() {
        try {
            const response = await fetch('assets/icons/icons.svg');
            const svgText = await response.text();

            // 创建一个隐藏的div来存放SVG图标
            const iconContainer = document.createElement('div');
            iconContainer.style.display = 'none';
            iconContainer.innerHTML = svgText;
            document.body.appendChild(iconContainer);

            this.iconsLoaded = true;
            this.replaceIcons();
        } catch (error) {
            console.warn('无法加载SVG图标，将使用Font Awesome作为后备方案:', error);
        }
    }

    /**
     * 创建SVG图标元素
     * @param {string} iconName - 图标名称（不包含icon-前缀）
     * @param {string} className - 额外的CSS类名
     * @param {Object} options - 配置选项
     * @returns {HTMLElement} SVG图标元素
     */
    createIcon(iconName, className = '', options = {}) {
        const {
            enhanced = this.enhancedIcons,
            interactive = false,
            glow = false,
            pulse = false,
            spin = false,
            size = '1em'
        } = options;

        // 如果没有加载SVG图标，使用Font Awesome作为后备
        if (!this.iconsLoaded) {
            return this.createFallbackIcon(iconName, className, options);
        }

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');

        // 基本类名
        let classes = [`icon`, `icon-${iconName}`];

        // 添加增强效果
        if (enhanced) classes.push('icon-enhanced');
        if (interactive) classes.push('icon-interactive');
        if (glow) classes.push('icon-glow');
        if (pulse) classes.push('icon-pulse');
        if (spin) classes.push('icon-spin');

        // 添加自定义类名
        if (className) classes.push(className);

        svg.setAttribute('class', classes.join(' '));
        svg.setAttribute('aria-hidden', 'true');
        svg.setAttribute('style', `width: ${size}; height: ${size};`);
        use.setAttribute('href', `#icon-${iconName}`);

        svg.appendChild(use);
        return svg;
    }

    /**
     * 创建后备图标（Font Awesome）
     */
    createFallbackIcon(iconName, className = '', options = {}) {
        const { interactive = false, size = '1em' } = options;

        const i = document.createElement('i');
        const faClass = this.getFontAwesomeClass(iconName);

        let classes = ['fas', faClass];
        if (interactive) classes.push('icon-interactive');
        if (className) classes.push(className);

        i.setAttribute('class', classes.join(' '));
        i.setAttribute('aria-hidden', 'true');
        i.setAttribute('style', `font-size: ${size};`);

        return i;
    }

    /**
     * 获取Font Awesome类名
     */
    getFontAwesomeClass(iconName) {
        const iconMap = {
            'user': 'fa-user',
            'user-circle': 'fa-user-circle',
            'lock': 'fa-lock',
            'email': 'fa-envelope',
            'send': 'fa-paper-plane',
            'robot': 'fa-robot',
            'plus': 'fa-plus',
            'settings': 'fa-cog',
            'logout': 'fa-sign-out-alt',
            'search': 'fa-search',
            'trash': 'fa-trash',
            'edit': 'fa-edit',
            'close': 'fa-times',
            'menu': 'fa-bars',
            'attach': 'fa-paperclip',
            'arrow-left': 'fa-arrow-left'
        };

        return iconMap[iconName] || 'fa-circle';
    }

    /**
     * 设置动态效果
     */
    setupDynamicEffects() {
        // 为机器人图标添加脉冲效果
        document.addEventListener('DOMContentLoaded', () => {
            const robotIcons = document.querySelectorAll('.icon-robot, .fa-robot');
            robotIcons.forEach(icon => {
                icon.classList.add('icon-pulse');
            });

            // 为发送按钮添加交互效果
            const sendButtons = document.querySelectorAll('.btn-send');
            sendButtons.forEach(btn => {
                const icon = btn.querySelector('.icon, i');
                if (icon) {
                    icon.classList.add('icon-interactive');
                }
            });

            // 为侧边栏按钮添加悬停效果
            const sidebarButtons = document.querySelectorAll('.sidebar .btn-icon');
            sidebarButtons.forEach(btn => {
                const icon = btn.querySelector('.icon, i');
                if (icon) {
                    icon.classList.add('icon-hover-glow');
                }
            });
        });
    }

    /**
     * 为元素添加动态效果
     */
    addEffect(element, effect) {
        const validEffects = ['glow', 'pulse', 'spin', 'hover-glow', 'interactive'];
        if (validEffects.includes(effect)) {
            element.classList.add(`icon-${effect}`);
        }
    }

    /**
     * 移除元素的动态效果
     */
    removeEffect(element, effect) {
        element.classList.remove(`icon-${effect}`);
    }

    /**
     * 获取图标HTML字符串
     * @param {string} iconName - 图标名称
     * @param {string} className - 额外的CSS类名
     * @returns {string} SVG图标的HTML字符串
     */
    getIconHTML(iconName, className = '') {
        return `<svg class="icon icon-${iconName} ${className}" aria-hidden="true">
            <use href="#icon-${iconName}"></use>
        </svg>`;
    }

    /**
     * 替换页面中的Font Awesome图标为SVG图标
     */
    replaceIcons() {
        if (!this.iconsLoaded) return;

        // 图标映射表：Font Awesome类名 -> SVG图标名
        const iconMap = {
            'fa-user': 'user',
            'fa-user-circle': 'user-circle',
            'fa-lock': 'lock',
            'fa-envelope': 'email',
            'fa-sign-in-alt': 'arrow-left',
            'fa-user-plus': 'user',
            'fa-plus': 'plus',
            'fa-cog': 'settings',
            'fa-sign-out-alt': 'logout',
            'fa-sync-alt': 'refresh',
            'fa-refresh': 'refresh',
            'fa-robot': 'robot',
            'fa-paperclip': 'attach',
            'fa-paper-plane': 'send',
            'fa-trash': 'trash',
            'fa-trash-alt': 'trash',
            'fa-download': 'download',
            'fa-times': 'close',
            'fa-arrow-left': 'arrow-left',
            'fa-chart-bar': 'dashboard',
            'fa-key': 'key',
            'fa-users': 'users',
            'fa-list-alt': 'logs',
            'fa-search': 'search',
            'fa-edit': 'edit',
            'fa-copy': 'copy',
            'fa-check': 'check',
            'fa-warning': 'warning',
            'fa-info': 'info',
            'fa-shield-alt': 'settings',
            'fa-menu': 'menu',
            'fa-ellipsis-v': 'more'
        };

        // 查找所有Font Awesome图标并替换
        Object.keys(iconMap).forEach(faClass => {
            const elements = document.querySelectorAll(`.${faClass}`);
            elements.forEach(element => {
                const svgIcon = this.createIcon(iconMap[faClass]);

                // 保留原有的类名（除了Font Awesome的类名）
                const classList = Array.from(element.classList).filter(cls =>
                    !cls.startsWith('fa') && cls !== 'fas' && cls !== 'far' && cls !== 'fab'
                );
                classList.forEach(cls => svgIcon.classList.add(cls));

                // 替换元素
                element.parentNode.replaceChild(svgIcon, element);
            });
        });
    }

    /**
     * 动态添加图标到指定元素
     * @param {HTMLElement} element - 目标元素
     * @param {string} iconName - 图标名称
     * @param {string} position - 位置：'before' 或 'after'
     */
    addIconToElement(element, iconName, position = 'before') {
        const icon = this.createIcon(iconName);

        if (position === 'before') {
            element.insertBefore(icon, element.firstChild);
        } else {
            element.appendChild(icon);
        }
    }

    /**
     * 更新元素的图标
     * @param {HTMLElement} element - 包含图标的元素
     * @param {string} newIconName - 新图标名称
     */
    updateIcon(element, newIconName) {
        const iconElement = element.querySelector('.icon');
        if (iconElement) {
            const newIcon = this.createIcon(newIconName);
            // 保留原有类名
            const classList = Array.from(iconElement.classList).filter(cls =>
                !cls.startsWith('icon-')
            );
            classList.forEach(cls => newIcon.classList.add(cls));

            iconElement.parentNode.replaceChild(newIcon, iconElement);
        }
    }
}

// 创建全局图标系统实例
window.iconSystem = new IconSystem();

// 提供便捷的全局函数
window.createIcon = (iconName, className = '') => {
    return window.iconSystem.createIcon(iconName, className);
};

window.getIconHTML = (iconName, className = '') => {
    return window.iconSystem.getIconHTML(iconName, className);
};

// 在DOM加载完成后替换图标
document.addEventListener('DOMContentLoaded', () => {
    // 延迟一点时间确保SVG加载完成
    setTimeout(() => {
        window.iconSystem.replaceIcons();
    }, 100);
});

// 导出图标系统类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IconSystem;
}