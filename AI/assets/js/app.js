/**
 *  AI 聊天应用前端逻辑
 */

class GeminiChatApp {
    constructor() {
        this.currentUser = null;
        this.currentSession = null;
        this.attachments = [];
        this.isLoading = false;

        this.init();
    }

    init() {
        this.bindEvents();
        this.checkAuth();
        this.autoResizeTextarea();
        this.initMobileFeatures();
        this.initPasteAndDrop(); // 初始化粘贴和拖拽功能
        this.initNotification(); // 初始化通知系统
        this.initLoginStatusCheck(); // 初始化登录状态定期检查
        this.initThinkingButton(); // 初始化思考按钮状态

        // 紧急关闭侧边栏的快捷键（临时解决方案）
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const sidebar = document.querySelector('.sidebar');
                if (sidebar && sidebar.classList.contains('mobile-open')) {
                    this.forceCloseSidebar();
                    // console.log('✅ ESC键关闭侧边栏');
                }
            }
        });

        // 清理任何存在的紧急按钮
        const existingBtn = document.getElementById('emergencyCloseBtn');
        if (existingBtn) {
            existingBtn.remove();
            // console.log('✅ 已清理紧急关闭按钮');
        }
    }

    // 初始化通知系统
    initNotification() {
        const notificationClose = document.getElementById('notificationClose');
        if (notificationClose) {
            notificationClose.addEventListener('click', () => this.hideNotification());
        }
    }

    // 初始化登录状态定期检查
    initLoginStatusCheck() {
        // 每5分钟检查一次登录状态
        setInterval(async () => {
            // 只有在用户已登录且不在登录页面时才检查
            if (this.currentUser && !document.getElementById('loginPage').classList.contains('active')) {
                try {
                    const response = await this.apiCall('/auth/user');
                    if (!response.success) {
                        // 登录已过期
                        this.handleLoginExpired();
                    }
                } catch (error) {
                    // 如果请求失败，可能是网络问题，不处理登录过期
                    console.log('登录状态检查失败:', error.message);
                }
            }
        }, 5 * 60 * 1000); // 5分钟
    }

    // 切换移动端侧边栏
    toggleMobileSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.getElementById('sidebarOverlay');

        if (!sidebar) return;

        // 创建遮罩层（如果不存在）
        if (!overlay) {
            const newOverlay = document.createElement('div');
            newOverlay.id = 'sidebarOverlay';
            newOverlay.className = 'sidebar-overlay';
            newOverlay.addEventListener('click', () => this.closeMobileSidebar());
            document.body.appendChild(newOverlay);
        }

        // 切换侧边栏状态
        if (sidebar.classList.contains('mobile-open')) {
            this.closeMobileSidebar();
        } else {
            sidebar.classList.add('mobile-open');
            document.getElementById('sidebarOverlay').classList.add('active');
            document.body.style.overflow = 'hidden'; // 防止背景滚动
        }
    }

    // 关闭移动端侧边栏
    closeMobileSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.getElementById('sidebarOverlay');

        if (sidebar) {
            sidebar.classList.remove('mobile-open');
        }
        if (overlay) {
            overlay.classList.remove('active');
        }
        document.body.style.overflow = ''; // 恢复滚动
    }

    // 绑定事件
    bindEvents() {
        // 登录相关
        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('registerForm').addEventListener('submit', (e) => this.handleRegister(e));
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchAuthTab(e));
        });

        // 聊天相关
        document.getElementById('newChatBtn').addEventListener('click', () => this.createNewSession());
        document.getElementById('sendBtn').addEventListener('click', () => this.sendMessage());
        document.getElementById('messageInput').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                // 检查是否正在加载中，如果是则不发送
                if (!this.isLoading) {
                    this.sendMessage();
                } else {
                    this.showNotification('WaWa AI正在回复中...请稍等', 'warning');
                }
            }
        });
        document.getElementById('messageInput').addEventListener('input', () => this.updateSendButton());

        // 移动端输入法自适应
        this.initMobileInputAdaptation();

        // 登录页面输入法自适应
        this.initLoginInputAdaptation();

        // 编辑标题按钮
        document.getElementById('editTitleBtn').addEventListener('click', () => this.editSessionTitle());

        // 文件上传
        document.getElementById('attachBtn').addEventListener('click', () => {
            document.getElementById('fileInput').click();
        });
        document.getElementById('fileInput').addEventListener('change', (e) => this.handleFileUpload(e));
        
        // 思考功能切换
        document.getElementById('thinkingToggle').addEventListener('change', (e) => {
            this.handleThinkingToggle(e);
        });

        // 管理员相关
        document.getElementById('settingsBtn').addEventListener('click', () => this.showAdminPanel());
        document.getElementById('backToChatBtn').addEventListener('click', () => this.showChatPage());
        document.querySelectorAll('.admin-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchAdminTab(e));
        });

        // 管理员功能按钮
        document.getElementById('addApiKeyBtn').addEventListener('click', () => this.showAddApiKeyModal());
        document.getElementById('addUserBtn').addEventListener('click', () => this.showAddUserModal());

        // 清空日志按钮
        const clearLogsBtn = document.getElementById('clearLogsBtn');
        if (clearLogsBtn) {
            clearLogsBtn.addEventListener('click', () => this.clearLogs());
        }

        // 会话管理模态框事件
        const closeSessionModal = document.getElementById('closeSessionModal');
        const closeSessionModalBtn = document.getElementById('closeSessionModalBtn');
        if (closeSessionModal) {
            closeSessionModal.addEventListener('click', () => {
                document.getElementById('sessionDetailModal').style.display = 'none';
            });
        }
        if (closeSessionModalBtn) {
            closeSessionModalBtn.addEventListener('click', () => {
                document.getElementById('sessionDetailModal').style.display = 'none';
            });
        }

        // 会话管理分页事件
        const prevSessionsPageBtn = document.getElementById('prevSessionsPage');
        const nextSessionsPageBtn = document.getElementById('nextSessionsPage');
        if (prevSessionsPageBtn) {
            prevSessionsPageBtn.addEventListener('click', () => this.changeSessionsPage(-1));
        }
        if (nextSessionsPageBtn) {
            nextSessionsPageBtn.addEventListener('click', () => this.changeSessionsPage(1));
        }

        // 会话管理搜索事件
        const sessionSearchInput = document.getElementById('sessionSearchInput');
        if (sessionSearchInput) {
            sessionSearchInput.addEventListener('input', (e) => this.searchSessionsAdmin(e.target.value));
        }

        // 会话管理刷新事件
        const refreshSessionsBtn = document.getElementById('refreshSessionsBtn');
        if (refreshSessionsBtn) {
            refreshSessionsBtn.addEventListener('click', () => this.loadSessionsAdmin());
        }

        // 其他
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
        document.getElementById('searchInput').addEventListener('input', (e) => this.searchSessions(e.target.value));

        // 模型选择器变化事件 - 更新显示
        document.getElementById('modelSelect').addEventListener('change', (e) => this.updateModelDisplay(e));

        // 语音通话按钮
        const voiceCallBtn = document.getElementById('voiceCallBtn');
        if (voiceCallBtn) {
            voiceCallBtn.addEventListener('click', () => this.showDevelopmentNotice('语音通话'));
        }

        // 视频通话按钮
        const videoCallBtn = document.getElementById('videoCallBtn');
        if (videoCallBtn) {
            videoCallBtn.addEventListener('click', () => this.showDevelopmentNotice('视频通话'));
        }

        // 更多选项按钮 - 移动端显示侧边栏
        const moreOptionsBtn = document.getElementById('moreOptionsBtn');
        if (moreOptionsBtn) {
            moreOptionsBtn.addEventListener('click', () => this.toggleMobileSidebar());
        }

        // 移动端关闭按钮（如果存在）
        const mobileCloseBtn = document.getElementById('mobileCloseBtn');
        if (mobileCloseBtn) {
            mobileCloseBtn.addEventListener('click', () => this.forceCloseSidebar());
        }

        // 模态框
        document.querySelector('.close').addEventListener('click', () => this.closeModal());
        document.getElementById('notificationClose').addEventListener('click', () => this.hideNotification());

        // 点击模态框外部关闭
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('modal');
            if (e.target === modal) {
                this.closeModal();
            }
        });
    }

    // 初始化移动端功能
    initMobileFeatures() {
        // 检测移动设备
        this.isMobile = window.innerWidth <= 768;
        // console.log('初始化移动端功能，当前窗口宽度:', window.innerWidth, '是否移动端:', this.isMobile);

        // 监听窗口大小变化
        window.addEventListener('resize', () => {
            const wasMobile = this.isMobile;
            this.isMobile = window.innerWidth <= 768;
            // console.log('窗口大小变化，新宽度:', window.innerWidth, '是否移动端:', this.isMobile);

            if (wasMobile !== this.isMobile) {
                this.handleMobileToggle();
            }
        });

        // 移动端侧边栏切换 - 无论是否移动端都先设置，让用户能测试
        this.setupMobileSidebar();

        // 触摸事件优化
        this.setupTouchOptimizations();
    }

    // 设置移动端侧边栏
    setupMobileSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const mainChat = document.querySelector('.main-chat');
        const chatHeader = document.querySelector('.chat-header');
        const modelSelector = document.querySelector('.model-selector');

        // 移除旧的按钮（如果存在）
        const oldBtn = document.getElementById('mobileSidebarToggle');
        if (oldBtn) {
            oldBtn.remove();
        }

        // 创建侧边栏切换按钮
        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'mobileSidebarToggle';
        toggleBtn.className = 'btn-icon';
        toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
        toggleBtn.style.cssText = `
            width: auto;
            height: auto;
            padding: 8px 12px;
            margin-right: 10px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            background: transparent;
            color: var(--text-primary);
            border: none;
        `;

        // 将按钮添加到chat-header的开头
        if (chatHeader) {
            const chatTitle = chatHeader.querySelector('.chat-title');
            chatHeader.insertBefore(toggleBtn, chatTitle);
        }

        // 使用原生DOM方法绑定点击事件
        const toggleBtnElement = document.getElementById('mobileSidebarToggle');
        if (toggleBtnElement) {
            toggleBtnElement.addEventListener('click', (e) => {
                e.preventDefault(); // 阻止默认行为
                e.stopPropagation(); // 阻止事件冒泡
                e.stopImmediatePropagation(); // 阻止立即传播
                // console.log('点击切换按钮 - 阻止所有传播');

                // 使用 setTimeout 确保在下一个事件循环中执行
                setTimeout(() => {
                    this.toggleMobileSidebar();
                }, 0);
            });
        }

        // 添加全局点击事件监听器，用于点击侧边栏外部关闭侧边栏
        this.setupOutsideClickListener();

        // 防止侧边栏内点击冒泡
        if (sidebar) {
            sidebar.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }
    }

    // 切换移动端侧边栏
    toggleMobileSidebar() {
        // console.log('toggleMobileSidebar被调用');
        const sidebar = document.querySelector('.sidebar');
        const toggleBtn = document.getElementById('mobileSidebarToggle');

        // console.log('切换方法 - 侧边栏元素:', sidebar);

        if (sidebar) {
            // 等待当前事件循环完成后再检查状态
            setTimeout(() => {
                // 使用多重检测方式确定当前状态
                const actualClasses = sidebar.getAttribute('class') || '';
                const domHasMobileOpen = actualClasses.includes('mobile-open');
                const jsHasMobileOpen = sidebar.classList.contains('mobile-open');

                // 检查计算样式作为最终判断
                const computedStyle = window.getComputedStyle(sidebar);
                const isVisuallyOpen = computedStyle.transform &&
                    (computedStyle.transform.includes('translateY(0') ||
                        computedStyle.transform === 'matrix(1, 0, 0, 1, 0, 0)') &&
                    computedStyle.opacity === '1';

                // console.log('实际DOM类名:', actualClasses);
                // console.log('DOM包含mobile-open:', domHasMobileOpen);
                // console.log('JS检测mobile-open:', jsHasMobileOpen);
                // console.log('视觉上是否打开:', isVisuallyOpen);

                // 综合判断：任何一个检测显示打开状态，都认为需要关闭
                const shouldClose = domHasMobileOpen || jsHasMobileOpen || isVisuallyOpen;

                if (shouldClose) {
                    // 彻底关闭侧边栏
                    // console.log('✅ 关闭侧边栏');
                    sidebar.classList.remove('mobile-open');
                    // 强制清理className
                    sidebar.className = sidebar.className.replace(/mobile-open/g, '').replace(/\s+/g, ' ').trim();
                    // 清理样式
                    sidebar.style.transform = '';
                    sidebar.style.opacity = '';
                    sidebar.style.visibility = '';

                    if (toggleBtn) {
                        toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
                    }
                    // console.log('关闭后最终类名:', sidebar.getAttribute('class'));
                } else {
                    // 打开侧边栏
                    // console.log('✅ 打开侧边栏');
                    // 确保类名干净
                    sidebar.className = 'sidebar mobile-open';

                    if (toggleBtn) {
                        toggleBtn.innerHTML = '<i class="fas fa-times"></i>';
                    }

                    // 确保侧边栏在移动端正确显示
                    sidebar.style.transform = 'translateY(0)';
                    sidebar.style.opacity = '1';
                    sidebar.style.visibility = 'visible';

                    // console.log('打开后最终类名:', sidebar.getAttribute('class'));
                }
            }, 5); // 很短的延迟，让DOM状态稳定
        }
    }

    // 打开移动端侧边栏
    openMobileSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const toggleBtn = document.getElementById('mobileSidebarToggle');

        if (sidebar) {
            sidebar.classList.add('mobile-open');
            // console.log('✅ 打开侧边栏，classList:', Array.from(sidebar.classList));
        }
        if (toggleBtn) {
            toggleBtn.innerHTML = '<i class="fas fa-times"></i>';
        }
    }

    // 关闭移动端侧边栏
    closeMobileSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const toggleBtn = document.getElementById('mobileSidebarToggle');

        // console.log('关闭方法被调用 - 侧边栏元素:', sidebar);

        if (sidebar) {
            // 强制移除 mobile-open 类
            sidebar.classList.remove('mobile-open');
            // console.log('✅ 已移除 mobile-open 类，当前类名:', sidebar.className);
            // console.log('✅ classList:', Array.from(sidebar.classList));

            if (toggleBtn) {
                toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
                // console.log('✅ 已更改按钮图标为汉堡菜单');
            }
        } else {
            // console.log('❌ 侧边栏不存在');
        }
    }

    // 强制关闭侧边栏方法
    forceCloseSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const toggleBtn = document.getElementById('mobileSidebarToggle');

        if (sidebar) {
            // 彻底清理所有状态
            sidebar.classList.remove('mobile-open');
            sidebar.className = 'sidebar'; // 直接设置为基础类名

            // 清理所有样式
            sidebar.style.transform = '';
            sidebar.style.opacity = '';
            sidebar.style.visibility = '';

            // console.log('✅ 强制关闭侧边栏，最终类名:', sidebar.getAttribute('class'));
        }

        if (toggleBtn) {
            toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
        }
    }

    // 添加紧急关闭按钮到侧边栏
    addEmergencyCloseButton() {
        // 移除旧的紧急关闭按钮
        const oldEmergencyBtn = document.getElementById('emergencyCloseBtn');
        if (oldEmergencyBtn) {
            oldEmergencyBtn.remove();
        }

        // 创建紧急关闭按钮
        const emergencyBtn = document.createElement('button');
        emergencyBtn.id = 'emergencyCloseBtn';
        emergencyBtn.innerHTML = '✕ 关闭侧边栏';
        emergencyBtn.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            z-index: 9999;
            background: #ff4444;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            font-weight: bold;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            display: none;
        `;

        emergencyBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.forceCloseSidebar();
        });

        document.body.appendChild(emergencyBtn);

        // 当侧边栏打开时显示紧急按钮
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            const observer = new MutationObserver(() => {
                if (sidebar.classList.contains('mobile-open')) {
                    emergencyBtn.style.display = 'block';
                } else {
                    emergencyBtn.style.display = 'none';
                }
            });
            observer.observe(sidebar, { attributes: true });
        }
    }

    // 设置点击外部区域关闭侧边栏的监听器
    setupOutsideClickListener() {
        // 移除旧的监听器（如果存在）
        if (this.outsideClickHandler) {
            document.removeEventListener('click', this.outsideClickHandler, true);
        }

        // 创建简化的点击处理函数
        this.outsideClickHandler = (e) => {
            const sidebar = document.querySelector('.sidebar');
            const toggleBtn = document.getElementById('mobileSidebarToggle');

            if (sidebar) {
                // 使用DOM实际状态检测
                const actualClasses = sidebar.getAttribute('class') || '';
                const domHasMobileOpen = actualClasses.includes('mobile-open');

                if (domHasMobileOpen) {
                    // 检查点击是否在侧边栏内部或切换按钮上
                    let clickedInside = false;

                    // 检查是否点击在侧边栏内
                    if (sidebar.contains(e.target)) {
                        clickedInside = true;
                    }

                    // 检查是否点击在切换按钮上（更精确的检查）
                    if (toggleBtn) {
                        if (toggleBtn.contains(e.target) || toggleBtn === e.target) {
                            clickedInside = true;
                        }
                        // 检查是否点击在按钮内的 i 标签上
                        const icon = toggleBtn.querySelector('i');
                        if (icon && (icon.contains(e.target) || icon === e.target)) {
                            clickedInside = true;
                        }
                    }

                    // console.log('点击外部检查 - 点击在内部:', clickedInside, '目标:', e.target);

                    // 如果点击在外部，关闭侧边栏
                    if (!clickedInside) {
                        // console.log('✅ 点击外部，关闭侧边栏');
                        this.forceCloseSidebar();
                    }
                }
            }
        };

        // 添加全局点击监听器
        document.addEventListener('click', this.outsideClickHandler, true);
        // console.log('✅ 已添加简化的全局点击监听器');
    }

    // 处理移动端切换
    handleMobileToggle() {
        const sidebar = document.querySelector('.sidebar');

        if (this.isMobile) {
            // 重新设置移动端侧边栏，确保按钮被正确创建
            this.setupMobileSidebar();
        } else {
            // 移除移动端按钮
            const toggleBtn = document.getElementById('mobileSidebarToggle');
            if (toggleBtn) {
                toggleBtn.remove();
            }
            if (sidebar) {
                sidebar.classList.remove('mobile-open');
            }
            // 移除全局点击监听器
            if (this.outsideClickHandler) {
                document.removeEventListener('click', this.outsideClickHandler, true);
                this.outsideClickHandler = null;
            }
        }
    }

    // 触摸事件优化
    setupTouchOptimizations() {
        // 防止双击缩放
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, false);

        // 侧边栏滑动手势
        if (this.isMobile) {
            let startX = 0;
            let startY = 0;
            let currentX = 0;
            let currentY = 0;

            document.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
            });

            document.addEventListener('touchmove', (e) => {
                if (!startX || !startY) return;

                currentX = e.touches[0].clientX;
                currentY = e.touches[0].clientY;

                const diffX = startX - currentX;
                const diffY = startY - currentY;

                // 水平滑动大于垂直滑动时处理
                if (Math.abs(diffX) > Math.abs(diffY)) {
                    const sidebar = document.querySelector('.sidebar');

                    // 从右向左滑动且距离足够时打开侧边栏
                    if (diffX < -50 && startX < 50) {
                        this.openMobileSidebar();
                    }
                    // 从左向右滑动且侧边栏开启时关闭
                    else if (diffX > 50 && sidebar && sidebar.classList.contains('mobile-open')) {
                        this.closeMobileSidebar();
                    }
                }
            });

            document.addEventListener('touchend', () => {
                startX = 0;
                startY = 0;
                currentX = 0;
                currentY = 0;
            });
        }
    }

    // 检查认证状态
    async checkAuth() {
        try {
            const response = await this.apiCall('/auth/user');
            if (response.success) {
                this.currentUser = response.user;
                this.showChatPage();
                this.loadSessions();
            } else {
                this.showLoginPage();
            }
        } catch (error) {
            this.showLoginPage();
        }
    }

    // API调用
    async apiCall(endpoint, options = {}) {
        const url = `api${endpoint}`;
        
        // 根据不同的请求类型设置不同的超时时间
        const isChatMessage = endpoint === '/chat/messages' && options.method === 'POST';
        const isImageGen = endpoint === '/generate-image';
        const timeout = isChatMessage || isImageGen ? 120000 : 15000; // 聊天和图片生成120秒，其他15秒
        
        const config = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            },
            credentials: 'same-origin', // 确保发送session cookie
            ...options
        };

        if (config.body && typeof config.body === 'object') {
            config.body = JSON.stringify(config.body);
        }

        // 创建超时控制器
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        config.signal = controller.signal;

        try {
            const response = await fetch(url, config);
            clearTimeout(timeoutId);
            
            // 检查是否是401未授权响应（登录过期）
            if (response.status === 401) {
                console.log('检测到登录过期，自动跳转到登录页面');
                this.handleLoginExpired();
                throw new Error('登录已过期，请重新登录');
            }
            
            // 检查是否是503服务不可用
            if (response.status === 503) {
                throw new Error('服务器繁忙，请稍后重试');
            }
            
            // 检查是否是504网关超时
            if (response.status === 504) {
                throw new Error('请求超时，服务器响应过慢，请稍后重试');
            }
            
            // 检查响应内容类型
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('非JSON响应:', text);
                
                // 如果响应是空的或被截断，尝试重新加载消息
                if (isChatMessage && text.trim() === '') {
                    console.warn('响应为空，可能被截断，尝试重新加载消息...');
                    // 延迟1秒后重新加载，让服务器完成处理
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    throw new Error('响应为空，请刷新页面查看消息');
                }
                
                throw new Error('服务器返回了非JSON格式的响应');
            }
            
            let data;
            try {
                data = await response.json();
            } catch (error) {
                console.error('JSON解析失败:', error);
                
                // 对于聊天消息，提示用户刷新
                if (isChatMessage) {
                    throw new Error('响应解析失败，消息可能已保存，请刷新页面查看');
                }
                
                throw new Error('响应不是有效的JSON格式');
            }

            if (!response.ok) {
                throw new Error(data.error || '请求失败');
            }

            return data;
        } catch (error) {
            clearTimeout(timeoutId);
            
            // 处理超时错误
            if (error.name === 'AbortError') {
                throw new Error(`请求超时（${timeout/1000}秒），服务器响应过慢，请稍后重试`);
            }
            
            // 处理网络错误
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                throw new Error('网络连接失败，请检查网络后重试');
            }
            
            throw error;
        }
    }

    // 处理登录过期
    handleLoginExpired() {
        // 清空用户数据
        this.currentUser = null;
        this.currentSession = null;
        this.attachments = [];
        this.isLoading = false;
        
        // 清空所有UI状态
        this.clearUserData();
        this.resetAllUIElements();
        
        // 显示登录过期通知
        this.showNotification('登录已过期，请重新登录', 'warning');
        
        // 延迟跳转到登录页面，让用户看到通知
        setTimeout(() => {
            this.showLoginPage();
        }, 1500);
    }

    // 显示通知
    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        const text = document.getElementById('notificationText');

        // 防止元素不存在导致错误
        if (!notification || !text) {
            console.warn('Notification elements not found');
            return;
        }

        text.textContent = message;
        notification.className = `notification ${type}`;

        // 强制重绘以触发动画
        notification.offsetHeight;

        // 显示通知
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        // 自动隐藏通知
        clearTimeout(this.notificationTimeout);
        this.notificationTimeout = setTimeout(() => {
            this.hideNotification();
        }, 4000);
    }

    hideNotification() {
        const notification = document.getElementById('notification');
        if (notification) {
            notification.classList.remove('show');
        }
    }

    // 显示/隐藏页面
    showPage(pageId) {
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById(pageId).classList.add('active');
    }

    showLoginPage() {
        this.showPage('loginPage');
    }

    showChatPage() {
        this.showPage('chatPage');
        if (this.currentUser) {
            document.getElementById('currentUsername').textContent = this.currentUser.username;

            // 显示/隐藏管理员按钮
            const settingsBtn = document.getElementById('settingsBtn');
            if (this.currentUser.is_admin) {
                settingsBtn.style.display = 'flex';
            } else {
                settingsBtn.style.display = 'none';
            }

            // 检查Pro权限，控制模型选择器
            this.updateModelSelector();

            // 重置聊天界面状态，确保新用户看到干净的界面
            this.resetChatInterface();
        }
    }

    // 重置聊天界面状态
    resetChatInterface() {
        // 重置当前会话
        this.currentSession = null;

        // 重置聊天标题
        const currentSessionTitle = document.getElementById('currentSessionTitle');
        if (currentSessionTitle) {
            currentSessionTitle.textContent = 'AI智能助手';
        }

        // 隐藏编辑按钮
        const editTitleBtn = document.getElementById('editTitleBtn');
        if (editTitleBtn) {
            editTitleBtn.style.display = 'none';
        }

        // 显示欢迎消息
        this.showWelcomeMessage();

        // 清空输入框
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            messageInput.value = '';
            messageInput.disabled = false;
            messageInput.placeholder = '输入您的消息... (支持 Ctrl+V 粘贴图片)';
            messageInput.style.pointerEvents = 'auto';
        }

        // 重置发送按钮
        const sendBtn = document.getElementById('sendBtn');
        if (sendBtn) {
            sendBtn.disabled = true;
            sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';
        }

        // 重置附件按钮
        const attachBtn = document.getElementById('attachBtn');
        if (attachBtn) {
            attachBtn.disabled = false;
        }

        // 清空附件
        this.attachments = [];
        this.updateAttachmentPreview();

        // 重置加载状态
        this.isLoading = false;

        // 移除所有思考状态消息
        this.removeThinkingMessage();
    }

    updateModelSelector() {
        const modelSelect = document.getElementById('modelSelect');
        const proOption = modelSelect.querySelector('option[value="gemini-2.5-pro"]');

        if (this.currentUser && !this.currentUser.can_use_pro) {
            // 用户没有Pro权限，禁用Pro选项
            proOption.disabled = true;
            proOption.textContent = 'Wawa&Gemini Pro(需要Pro权限)';

            // 如果当前选择的是Pro模型，自动切换到Flash
            if (modelSelect.value === 'gemini-2.5-pro') {
                modelSelect.value = 'gemini-2.5-flash';
            }
        } else {
            // 用户有Pro权限，启用Pro选项
            proOption.disabled = false;
            proOption.textContent = 'Wawa&Gemini Pro';
        }
    }

    showAdminPanel() {
        if (!this.currentUser || !this.currentUser.is_admin) {
            this.showNotification('权限不足', 'error');
            return;
        }
        this.showPage('adminPage');
        this.loadAdminData();
    }

    // 认证相关
    switchAuthTab(e) {
        const tab = e.target.dataset.tab;

        // 切换标签按钮状态
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        e.target.classList.add('active');

        // 切换表单
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });
        document.getElementById(`${tab}Form`).classList.add('active');
    }

    async handleLogin(e) {
        e.preventDefault();

        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        if (!username || !password) {
            this.showNotification('请填写用户名和密码', 'error');
            return;
        }

        try {
            const response = await this.apiCall('/auth/login', {
                method: 'POST',
                body: { username, password }
            });

            if (response.success) {
                this.currentUser = response.user;

                // 先清空所有旧数据，防止用户间数据混乱
                this.clearUserData();

                // 显示登录成功消息
                this.showNotification('登录成功', 'success');
                
                // 如果有上次登录时间，延迟显示
                if (response.last_login_time) {
                    setTimeout(() => {
                        const lastLoginTime = this.formatLastLoginTime(response.last_login_time);
                        this.showNotification(`上次登录时间：${lastLoginTime}`, 'info', 5000);
                    }, 1500);
                }
                
                this.showChatPage();

                // 延迟一点时间加载会话，确保界面已经清空
                setTimeout(() => {
                    this.loadSessions();
                }, 100);
            } else {
                this.showNotification(response.message, 'error');
            }
        } catch (error) {
            this.showNotification(error.message, 'error');
        }
    }

    // 清空用户数据（提取为独立方法以便复用）
    clearUserData() {
        // 清空会话相关数据
        this.currentSession = null;
        this.attachments = [];
        this.isLoading = false;

        // 强制清空会话列表
        const sessionList = document.getElementById('sessionList');
        if (sessionList) {
            sessionList.innerHTML = '';
            // console.log('✅ 已清空会话列表');
        }

        // 清空聊天消息区域
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            chatMessages.innerHTML = '';
        }

        // 移除所有临时会话项
        document.querySelectorAll('[data-is-temp="true"]').forEach(item => {
            item.remove();
        });

        // 移除所有思考状态消息
        this.removeThinkingMessage();

        console.log('✅ 用户数据已清空');
    }

    async handleRegister(e) {
        e.preventDefault();

        const username = document.getElementById('registerUsername').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (!username || !password) {
            this.showNotification('请填写用户名和密码', 'error');
            return;
        }

        if (password !== confirmPassword) {
            this.showNotification('两次输入的密码不一致', 'error');
            return;
        }

        try {
            const response = await this.apiCall('/auth/register', {
                method: 'POST',
                body: { username, email, password }
            });

            if (response.success) {
                this.showNotification('注册成功，请登录', 'success');
                // 切换到登录标签
                document.querySelector('.tab-btn[data-tab="login"]').click();
                // 清空注册表单
                document.getElementById('registerForm').reset();
            } else {
                this.showNotification(response.message, 'error');
            }
        } catch (error) {
            this.showNotification(error.message, 'error');
        }
    }

    async logout() {
        try {
            await this.apiCall('/auth/logout');

            // 使用统一的清空方法
            this.clearUserData();

            // 清空用户信息
            this.currentUser = null;

            // 重置所有UI元素状态
            this.resetAllUIElements();

            this.showNotification('已退出登录', 'success');
            this.showLoginPage();
        } catch (error) {
            this.showNotification(error.message, 'error');
        }
    }

    // 重置所有UI元素状态
    resetAllUIElements() {
        // 重置模型选择器
        const modelSelect = document.getElementById('modelSelect');
        if (modelSelect) {
            modelSelect.value = 'gemini-2.5-flash';
        }

        // 清空附件预览
        this.updateAttachmentPreview();

        // 关闭移动端侧边栏（如果开启的话）
        this.closeMobileSidebar();

        console.log('✅ 所有UI元素已重置');
    }

    // 显示开发中提示
    showDevelopmentNotice(featureName) {
        this.showNotification(`🚧 ${featureName}功能正在开发中，敬请期待！`, 'info');
    }

    // 更新模型显示
    updateModelDisplay(e) {
        const modelValue = e.target.value;
        const modelDisplayElement = document.getElementById('currentModelDisplay');

        if (modelDisplayElement) {
            // 根据选择的模型更新显示文本
            const modelNames = {
                'gemini-2.5-flash': 'Wawa&Gemin',
                'gemini-2.5-pro': 'Wawa&Gemin(Pro)'
            };

            modelDisplayElement.textContent = modelNames[modelValue] || 'Wawa&Gemin';
        }
    }

    // 只更新会话列表，不重新选择当前会话（用于移动端）
    async updateSessionListOnly() {
        try {
            const timestamp = Date.now();
            const response = await this.apiCall(`/chat/sessions?_t=${timestamp}`);
            if (response.success) {
                this.renderSessions(response.sessions || []);
            }
        } catch (error) {
            console.error('❌ 更新会话列表失败:', error);
        }
    }

    // 只高亮当前会话，不重新加载消息（用于大屏手机）
    highlightCurrentSession(sessionId) {
        // 高亮当前会话
        document.querySelectorAll('.session-item').forEach(item => {
            item.classList.remove('active');
        });
        const currentItem = document.querySelector(`[data-session-id="${sessionId}"]`);
        if (currentItem) {
            currentItem.classList.add('active');
        }
        
        // 移动端自动关闭侧边栏
        this.closeMobileSidebar();
        if (this.isMobile) {
            this.closeMobileSidebar();
        }
    }

    // 会话管理
    async loadSessions() {
        // console.log('🔄 开始加载会话列表...');
        try {
            // 添加时间戳参数防止缓存
            const timestamp = Date.now();
            const response = await this.apiCall(`/chat/sessions?_t=${timestamp}`);
            if (response.success) {
                // console.log('✅ 获得会话数据:', response.sessions?.length || 0, '个会话');
                // console.log('📋 会话详情:', response.sessions);
                this.renderSessions(response.sessions || []);
            } else {
                console.error('❌ 加载会话失败:', response.error);
                this.showNotification('加载会话失败', 'error');
            }
        } catch (error) {
            console.error('❌ 加载会话异常:', error);
            this.showNotification('加载会话失败', 'error');
        }
    }

    renderSessions(sessions) {
        // console.log('🎨 渲染会话列表:', sessions?.length || 0, '个会话');
        const sessionList = document.getElementById('sessionList');

        // 强制清空列表
        sessionList.innerHTML = '';

        if (!sessions || sessions.length === 0) {
            // console.log('💭 无会话数据，显示空列表');
            return;
        }

        sessions.forEach((session, index) => {
            // console.log(`➕ 添加会话 ${index + 1}:`, session.title);
            const sessionItem = document.createElement('div');
            sessionItem.className = 'session-item';
            sessionItem.dataset.sessionId = session.id;

            // 检查是否是当前选中的会话
            if (this.currentSession && this.currentSession.id == session.id) {
                sessionItem.classList.add('active');
            }

            // 添加点击事件
            sessionItem.addEventListener('click', () => this.selectSession(session));

            sessionItem.innerHTML = `
                <div class="session-item-title">${session.title}</div>
                <div class="session-item-preview">${this.sanitizePreviewText(session.last_message || '暂无消息')}</div>
                <div class="session-item-actions">
                    <button class="session-delete-btn" onclick="event.stopPropagation(); app.deleteSession(${session.id});" title="删除">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;

            sessionList.appendChild(sessionItem);
        });

        // console.log('✅ 会话列表渲染完成');
    }

    async createNewSession() {
        // 立即创建临时会话对象并更新UI
        const tempSession = {
            id: 'temp-' + Date.now(), // 临时ID
            title: '新对话',
            messages: [],
            isTemp: true // 标记为临时会话
        };

        // 立即更新UI
        this.selectSession(tempSession);
        this.addTempSessionToList(tempSession);

        try {
            const response = await this.apiCall('/chat/sessions', {
                method: 'POST',
                body: { title: '新对话' }
            });

            if (response.success) {
                // 更新为真实ID
                const realSession = {
                    id: response.session_id,
                    title: response.title,
                    messages: []
                };

                this.currentSession = realSession;
                
                // 更新会话标题显示
                document.getElementById('currentSessionTitle').textContent = realSession.title;
                
                // 移除临时会话项
                this.removeTempSessionFromList(tempSession.id);
                
                // 添加真实会话到列表（不触发selectSession，避免消息丢失）
                await this.updateSessionListOnly();
                
                // 只更新高亮状态，不重新加载消息
                this.highlightCurrentSession(realSession.id);
            } else {
                // 如果创建失败，移除临时会话
                this.removeTempSessionFromList(tempSession.id);
                this.showNotification('创建会话失败: ' + (response.message || ''), 'error');
            }
        } catch (error) {
            // 如果创建失败，移除临时会话
            this.removeTempSessionFromList(tempSession.id);
            this.showNotification('创建会话失败', 'error');
        }
    }

    // 添加临时会话到列表
    addTempSessionToList(session) {
        const sessionList = document.getElementById('sessionList');
        const sessionItem = document.createElement('div');
        sessionItem.className = 'session-item active';
        sessionItem.dataset.sessionId = session.id;
        sessionItem.dataset.isTemp = 'true';

        sessionItem.innerHTML = `
            <div class="session-item-title">${session.title}</div>
            <div class="session-item-preview">正在创建...</div>
            <div class="session-item-actions">
                <div class="session-loading">
                    <i class="fas fa-spinner fa-spin"></i>
                </div>
            </div>
        `;

        // 添加到列表顶部
        sessionList.insertBefore(sessionItem, sessionList.firstChild);

        // 移除其他会话的active状态
        document.querySelectorAll('.session-item').forEach(item => {
            if (item !== sessionItem) {
                item.classList.remove('active');
            }
        });
    }

    // 移除临时会话
    removeTempSessionFromList(sessionId) {
        const sessionItem = document.querySelector(`[data-session-id="${sessionId}"]`);
        if (sessionItem && sessionItem.dataset.isTemp === 'true') {
            sessionItem.remove();
        }
    }

    async selectSession(session) {
        // ⚠️ 重要：在更新 currentSession 之前先保存旧的 session id
        const previousSessionId = this.currentSession ? this.currentSession.id : null;
        
        // 在移动端，如果点击的是同一个会话且已有消息，直接返回
        if (this.isMobile && previousSessionId === session.id) {
            const chatMessages = document.getElementById('chatMessages');
            const hasMessages = chatMessages.querySelectorAll('.message:not(.welcome-message)').length > 0;
            
            if (hasMessages) {
                // 关闭侧边栏即可
                this.closeMobileSidebar();
                return;
            }
        }
        
        // 更新当前会话
        this.currentSession = session;

        // 更新UI
        document.getElementById('currentSessionTitle').textContent = session.title;
        document.getElementById('editTitleBtn').style.display = 'flex';

        // 高亮当前会话
        document.querySelectorAll('.session-item').forEach(item => {
            item.classList.remove('active');
        });
        const currentItem = document.querySelector(`[data-session-id="${session.id}"]`);
        if (currentItem) {
            currentItem.classList.add('active');
        }

        // 移动端自动关闭侧边栏
        this.closeMobileSidebar();

        // 检查是否是临时会话，临时会话不需要加载消息
        if (session.isTemp) {
            return;
        }
        
        // 显示加载中提示
        this.showLoadingMessages();
        
        // 加载消息
        await this.loadMessages(session.id);
    }

    // 编辑会话标题
    async editSessionTitle() {
        if (!this.currentSession) {
            this.showNotification('请先选择一个会话', 'error');
            return;
        }

        const currentTitle = this.currentSession.title;
        const newTitle = prompt('请输入新的会话标题:', currentTitle);

        if (newTitle && newTitle.trim() !== '' && newTitle !== currentTitle) {
            try {
                const response = await this.apiCall(`/chat/session`, {
                    method: 'PUT',
                    body: {
                        session_id: this.currentSession.id,
                        title: newTitle.trim()
                    }
                });

                if (response.success) {
                    // 更新当前会话标题
                    this.currentSession.title = newTitle.trim();
                    document.getElementById('currentSessionTitle').textContent = newTitle.trim();

                    // 重新加载会话列表以显示更新
                    this.loadSessions();

                    this.showNotification('会话标题已更新', 'success');
                } else {
                    this.showNotification(response.message || '更新标题失败', 'error');
                }
            } catch (error) {
                this.showNotification('更新标题失败: ' + error.message, 'error');
            }
        }
    }

    async loadMessages(sessionId) {
        try {
            const response = await this.apiCall(`/chat/messages?session_id=${sessionId}`);
            if (response.success) {
                this.renderMessages(response.messages);
            } else {
                // 如果加载失败，显示欢迎消息
                this.showWelcomeMessage();
            }
        } catch (error) {
            this.showNotification('加载消息失败', 'error');
            // 加载失败时也显示欢迎消息
            this.showWelcomeMessage();
        }
    }

    renderMessages(messages) {
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.innerHTML = '';

        // 如果没有消息，显示欢迎消息
        if (!messages || messages.length === 0) {
            this.showWelcomeMessage();
            return;
        }

        messages.forEach(message => {
            this.addMessageToUI(message);
        });

        this.scrollToBottom();

        // 渲染数学公式
        setTimeout(() => {
            this.renderMathFormulas();
        }, 10);
    }

    // 显示欢迎消息
    showWelcomeMessage() {
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.innerHTML = `
            <div class="welcome-message">
                <div class="welcome-icon">
                    <i class="fas fa-robot"></i>
                </div>
                <h3>欢迎使用 WawaCloud AI 聊天助手</h3>
                <p>我是娃娃团队旗下基于googleGemini训练开发的Ai助手</p>
                <p>我可以帮助您解答问题、分析图片、处理文档等。开始新对话吧！</p>
                <div class="feature-list">
                    <div class="feature-item">
                        <i class="fas fa-image"></i>
                        <span>图片分析</span>
                    </div>
                    <div class="feature-item">
                        <i class="fas fa-palette"></i>
                        <span>AI绘图(开发中)</span>
                    </div>
                    <div class="feature-item">
                        <i class="fas fa-brain"></i>
                        <span>智能推理</span>
                    </div>
                    <div class="feature-item">
                        <i class="fas fa-file-alt"></i>
                        <span>文档处理</span>
                    </div>
                </div>

            </div>
        `;
    }
	/**
	                <div style="margin-top: 20px; padding: 15px; background: rgba(99, 102, 241, 0.1); border-radius: 8px; border-left: 3px solid #6366f1;">
                    <p style="margin: 0; font-size: 14px; color: #6366f1;">
                        <i class="fas fa-lightbulb"></i> <strong>AI绘图功能：</strong>使用命令 
                        <code style="background: rgba(99, 102, 241, 0.2); padding: 2px 6px; border-radius: 4px;">/image 描述</code> 
                        或 
                        <code style="background: rgba(99, 102, 241, 0.2); padding: 2px 6px; border-radius: 4px;">/图片 描述</code>
                        <br>
                        <span style="font-size: 12px; opacity: 0.8;">例如：/image a cute cat 或 /图片 一只可爱的猫</span>
                    </p>
                </div>
	**/

    // 显示加载中消息
    showLoadingMessages() {
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.innerHTML = `
            <div class="welcome-message">
                <div class="welcome-icon">
                    <i class="fas fa-spinner fa-spin"></i>
                </div>
                <h3>加载消息中...</h3>
                <p>正在获取历史对话内容</p>
            </div>
        `;
    }

    addMessageToUI(message) {
        const chatMessages = document.getElementById('chatMessages');
        
        // 如果存在欢迎消息，先移除它
        const welcomeMessage = chatMessages.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.remove();
        }
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.role}`;

        const avatar = message.role === 'user' ?
            '<i class="fas fa-user"></i>' :
            '<i class="fas fa-robot"></i>';

        // 构建附件显示
        let attachmentHtml = '';
        if (message.attachments && message.attachments.length > 0) {
            attachmentHtml = '<div class="message-attachments">';
            message.attachments.forEach((attachment, index) => {
                const icon = this.getFileIcon(attachment.category);
                const isImage = attachment.category === 'images';
                const attachmentId = `attachment-${Date.now()}-${index}`;

                // 如果是图片，添加缩略图预览和点击预览功能
                if (isImage) {
                    attachmentHtml += `
                        <div class="image-attachment-container">
                            <div class="attachment-item image-attachment" data-image-url="${attachment.url}" onclick="app.showImagePreview('${attachment.url}', '${attachment.name}')">
                                <i class="${icon}"></i>
                                <span class="attachment-name">${attachment.name}</span>
                                <i class="fas fa-search-plus preview-icon"></i>
                            </div>
                            <img class="image-thumbnail" src="${attachment.url}" alt="${attachment.name}" onclick="app.showImagePreview('${attachment.url}', '${attachment.name}')" onerror="this.style.display='none'">
                        </div>
                    `;
                } else {
                    attachmentHtml += `
                        <div class="attachment-item">
                            <i class="${icon}"></i>
                            <span>${attachment.name}</span>
                        </div>
                    `;
                }
            });
            attachmentHtml += '</div>';
        }

        // 检查消息内容是否包含HTML标签（如图片生成）
        const isHtmlContent = message.content.includes('<div class="generated-image">') || 
                             message.content.includes('<img src="data:') ||
                             message.content.includes('<div class="') ||
                             message.content.includes('<img ') ||
                             message.content.includes('<p class="') ||
                             message.content.includes('<span class="');
        
        const messageContent = isHtmlContent ? message.content : this.formatMessageText(message.content);
        
        messageDiv.innerHTML = `
            <div class="message-avatar">${avatar}</div>
            <div class="message-content">
                ${attachmentHtml}
                <div class="message-bubble">
                    <div class="message-text">${messageContent}</div>
                    <div class="message-time">${this.formatTime(message.created_at)}</div>
                </div>
            </div>
        `;

        chatMessages.appendChild(messageDiv);

        // 渲染数学公式
        setTimeout(() => {
            this.renderMathFormulas();
        }, 10);
    }

    formatMessageText(text) {
        // 首先处理代码块（```）
        text = this.processCodeBlocks(text);

        // 处理数学公式
        text = this.processMathFormulas(text);

        // 然后处理其他Markdown语法
        text = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');

        return text;
    }

    // 处理数学公式
    processMathFormulas(text) {
        // 先处理行内数学公式 $...$ （但不包括 $$...$$）
        text = text.replace(/(?<!\$)\$(?!\$)([^$\n]+?)\$(?!\$)/g, (match, formula) => {
            const mathId = 'math-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
            return '<span class="math-formula inline" id="' + mathId + '" data-formula="' + this.escapeHtml(formula) + '">$' + this.escapeHtml(formula) + '$</span>';
        });

        // 处理块级数学公式 $$...$$
        text = text.replace(/\$\$([\s\S]*?)\$\$/g, (match, formula) => {
            const mathId = 'math-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
            return '<div class="math-formula display" id="' + mathId + '" data-formula="' + this.escapeHtml(formula.trim()) + '">$$' + this.escapeHtml(formula.trim()) + '$$</div>';
        });

        return text;
    }

    // 渲染数学公式
    renderMathFormulas() {
        // 找到所有待渲染的数学公式
        const mathElements = document.querySelectorAll('.math-formula[data-formula]');

        mathElements.forEach(element => {
            const formula = element.getAttribute('data-formula');
            const isDisplay = element.classList.contains('display');

            try {
                // 使用 KaTeX 渲染公式
                if (window.katex) {
                    katex.render(formula, element, {
                        displayMode: isDisplay,
                        throwOnError: false,
                        strict: false,
                        trust: false
                    });

                    // 清除 data-formula 属性，防止重复渲染
                    element.removeAttribute('data-formula');
                }
            } catch (error) {
                // 如果渲染失败，保持原始文本
                console.warn('数学公式渲染失败:', error);
            }
        });
    }

    // 处理代码块
    processCodeBlocks(text) {
        // 匹配 ```语言\n代码\n``` 格式的代码块
        const codeBlockRegex = /```([a-zA-Z]*)(\r?\n)?([\s\S]*?)```/g;

        return text.replace(codeBlockRegex, (match, language, newline, code) => {
            // 去除首尾空白行
            code = code.trim();

            // HTML转义防止XSS攻击
            const escapedCode = this.escapeHtml(code);

            // 生成唯一ID
            const blockId = 'code-block-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);

            // 返回安全的代码块HTML
            return '<div class="code-block-container" data-language="' + (language || 'text') + '">' +
                '<div class="code-block-header">' +
                '<span class="code-language">' + (language || 'Text') + '</span>' +
                '<div class="code-actions">' +
                '<button class="code-action-btn" onclick="app.copyCodeBlock(\'' + blockId + '\')" title="复制代码">' +
                '<i class="fas fa-copy"></i>' +
                '</button>' +
                '<button class="code-action-btn" onclick="app.editCodeBlock(\'' + blockId + '\', \'' + (language || 'text') + '\')" title="编辑代码">' +
                '<i class="fas fa-edit"></i>' +
                '</button>' +
                '<button class="code-action-btn" onclick="app.fullscreenCodeBlock(\'' + blockId + '\')" title="全屏查看">' +
                '<i class="fas fa-expand"></i>' +
                '</button>' +
                '</div>' +
                '</div>' +
                '<pre class="code-block" id="' + blockId + '"><code>' + escapedCode + '</code></pre>' +
                '</div>';
        });
    }

    // HTML转义函数
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, function (m) { return map[m]; });
    }

    // 净化预览文本 - 移除代码块和HTML标签，只保留纯文本
    sanitizePreviewText(text) {
        if (!text || typeof text !== 'string') {
            return '暂无消息';
        }

        // 移除代码块 ```language\n代码\n```
        text = text.replace(/```[\s\S]*?```/g, '[代码块]');

        // 移除行内代码 `代码`
        text = text.replace(/`[^`]*`/g, '[代码]');

        // 移除HTML标签
        text = text.replace(/<[^>]*>/g, '');

        // 移除多余的换行和空白
        text = text.replace(/\s+/g, ' ').trim();

        // 限制长度
        if (text.length > 50) {
            text = text.substring(0, 50) + '...';
        }

        return text || '暂无消息';
    }

    // 复制代码块
    copyCodeBlock(blockId) {
        const codeBlock = document.getElementById(blockId);
        if (codeBlock) {
            const code = codeBlock.textContent;
            navigator.clipboard.writeText(code).then(() => {
                this.showNotification('代码已复制到剪贴板', 'success');
            }).catch(() => {
                // 备用复制方法
                const textArea = document.createElement('textarea');
                textArea.value = code;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                this.showNotification('代码已复制到剪贴板', 'success');
            });
        }
    }

    // 编辑代码块
    editCodeBlock(blockId, language) {
        const codeBlock = document.getElementById(blockId);
        if (codeBlock) {
            const code = codeBlock.textContent;
            this.showCodeEditor(code, language, blockId);
        }
    }

    // 全屏查看代码块
    fullscreenCodeBlock(blockId) {
        const codeBlock = document.getElementById(blockId);
        if (codeBlock) {
            const code = codeBlock.textContent;
            const language = codeBlock.closest('.code-block-container').dataset.language;
            this.showFullscreenCode(code, language);
        }
    }

    // 显示代码编辑器
    showCodeEditor(code, language, blockId) {
        // 创建模态框
        const modal = document.createElement('div');
        modal.className = 'code-editor-modal';
        modal.innerHTML =
            '<div class="code-editor-overlay" onclick="this.parentElement.remove()"></div>' +
            '<div class="code-editor-container">' +
            '<div class="code-editor-header">' +
            '<h3>编辑代码 - ' + language.toUpperCase() + '</h3>' +
            '<button class="close-btn" onclick="this.closest(\'.code-editor-modal\').remove()">' +
            '<i class="fas fa-times"></i>' +
            '</button>' +
            '</div>' +
            '<div class="code-editor-body">' +
            '<textarea class="code-editor-textarea" placeholder="在此编辑代码...">' + this.escapeHtml(code) + '</textarea>' +
            '</div>' +
            '<div class="code-editor-actions">' +
            '<button class="btn btn-secondary" onclick="this.closest(\'.code-editor-modal\').remove()">取消</button>' +
            '<button class="btn btn-primary" onclick="app.saveCodeEdit(\'' + blockId + '\', this)">保存</button>' +
            '<button class="btn btn-success" onclick="app.copyFromEditor(this)">复制</button>' +
            '</div>' +
            '</div>';

        document.body.appendChild(modal);

        // 聚焦到文本框
        setTimeout(() => {
            const textarea = modal.querySelector('.code-editor-textarea');
            textarea.focus();
        }, 100);
    }

    // 显示全屏代码
    showFullscreenCode(code, language) {
        const modal = document.createElement('div');
        modal.className = 'code-fullscreen-modal';
        modal.innerHTML =
            '<div class="code-fullscreen-overlay" onclick="this.parentElement.remove()"></div>' +
            '<div class="code-fullscreen-container">' +
            '<div class="code-fullscreen-header">' +
            '<h3>' + language.toUpperCase() + ' 代码</h3>' +
            '<div class="code-fullscreen-actions">' +
            '<button class="code-action-btn" onclick="app.copyFromFullscreen(this)" title="复制代码">' +
            '<i class="fas fa-copy"></i> 复制' +
            '</button>' +
            '<button class="close-btn" onclick="this.closest(\'.code-fullscreen-modal\').remove()" title="关闭">' +
            '<i class="fas fa-times"></i>' +
            '</button>' +
            '</div>' +
            '</div>' +
            '<div class="code-fullscreen-body">' +
            '<pre class="code-fullscreen-block"><code>' + this.escapeHtml(code) + '</code></pre>' +
            '</div>' +
            '</div>';

        document.body.appendChild(modal);
    }

    // 保存代码编辑
    saveCodeEdit(blockId, button) {
        const modal = button.closest('.code-editor-modal');
        const textarea = modal.querySelector('.code-editor-textarea');
        const newCode = textarea.value;

        // 更新原代码块
        const codeBlock = document.getElementById(blockId);
        if (codeBlock) {
            codeBlock.textContent = newCode;
        }

        modal.remove();
        this.showNotification('代码已更新', 'success');
    }

    // 从编辑器复制
    copyFromEditor(button) {
        const textarea = button.closest('.code-editor-modal').querySelector('.code-editor-textarea');
        const code = textarea.value;

        navigator.clipboard.writeText(code).then(() => {
            this.showNotification('代码已复制到剪贴板', 'success');
        }).catch(() => {
            textarea.select();
            document.execCommand('copy');
            this.showNotification('代码已复制到剪贴板', 'success');
        });
    }

    // 从全屏模式复制
    copyFromFullscreen(button) {
        const codeBlock = button.closest('.code-fullscreen-modal').querySelector('.code-fullscreen-block');
        const code = codeBlock.textContent;

        navigator.clipboard.writeText(code).then(() => {
            this.showNotification('代码已复制到剪贴板', 'success');
        }).catch(() => {
            const textArea = document.createElement('textarea');
            textArea.value = code;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showNotification('代码已复制到剪贴板', 'success');
        });
    }

    // 发送消息
    async sendMessage() {
        if (this.isLoading) return;

        // 立即设置加载状态并禁用发送按钮，防止重复点击
        this.isLoading = true;
        this.updateSendButton();
        this.disableUserInput(true);

        const messageInput = document.getElementById('messageInput');
        const message = messageInput.value.trim();

        if (!message && this.attachments.length === 0) {
            this.showNotification('请输入消息内容', 'error');
            this.isLoading = false;
            this.updateSendButton();
            this.disableUserInput(false);
            return;
        }

        // 检查是否是图片生成命令
        if (message.startsWith('/image ') || message.startsWith('/图片 ')) {
            const prompt = message.replace(/^\/(image|图片)\s+/, '').trim();
            if (!prompt) {
                this.showNotification('请输入图片描述，例如：/image 一只可爱的猫', 'error');
                this.isLoading = false;
                this.updateSendButton();
                this.disableUserInput(false);
                return;
            }
            await this.generateImage(prompt);
            this.isLoading = false;
            this.updateSendButton();
            this.disableUserInput(false);
            return;
        }
        
        // 智能提示：检测用户可能想要生成图片
        const imageKeywords = ['画', '绘', '生成图片', '画个', '画一', '画张', '生成一张', '给我画', '帮我画', 
                               'draw', 'paint', 'generate image', 'create image', 'make a picture'];
        const lowerMessage = message.toLowerCase();
        const wantsImage = imageKeywords.some(keyword => 
            lowerMessage.includes(keyword) || message.includes(keyword)
        );
        
        if (wantsImage && !message.startsWith('/')) {
            // 检测到可能想生成图片，但没有使用命令
            // 提取可能的描述内容
            let possiblePrompt = message;
            // 移除常见的请求词
            possiblePrompt = possiblePrompt.replace(/^(请|帮我|给我|能不能|可以|可否)*(画|绘|生成|创建)*(一个|一张|个|张)*/, '').trim();
            
            if (possiblePrompt) {
                // 自动调用图片生成功能
                this.showNotification('🎨 正在为您生成图片...', 'info', 3000);
                await this.generateImage(possiblePrompt);
                this.isLoading = false;
                this.updateSendButton();
                this.disableUserInput(false);
                return; // 直接返回，不继续执行常规聊天
            }
        }
        
        // 检查图片总大小
        if (this.attachments.length > 0) {
            // 计算所有附件的总大小
            let totalSize = 0;
            const imageAttachments = this.attachments.filter(att => 
                att.category === 'images' || ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(att.path.split('.').pop().toLowerCase())
            );
            
            for (const attachment of imageAttachments) {
                if (attachment.size) {
                    totalSize += attachment.size;
                }
            }
            
            const totalSizeMB = totalSize / (1024 * 1024);
            
            // 如果图片总大小超过10MB，拒绝发送
            if (totalSizeMB > 10) {
                this.showNotification(
                    `❌ 图片过大（${totalSizeMB.toFixed(2)}MB），请到 https://tool.wawacm.com/pic.html 压缩后再上传！`,
                    'error',
                    8000
                );
                this.isLoading = false;
                this.updateSendButton();
                this.disableUserInput(false);
                return;
            }
            
            // 如果图片总大小超过5MB，警告用户
            if (totalSizeMB > 5) {
                this.showNotification(
                    `⚠️ 图片较大（${totalSizeMB.toFixed(2)}MB），可能会造成上传缓慢`,
                    'warning',
                    5000
                );
            }
        }

        if (!this.currentSession) {
            // 创建新会话
            await this.createNewSession();
            if (!this.currentSession) {
                this.isLoading = false;
                this.updateSendButton();
                this.disableUserInput(false);
                return;
            }
        }

        let thinkingMessageId = null; // 在try外部定义
        
        try {
            const model = document.getElementById('modelSelect').value;

            // 检查Pro权限
            if (model === 'gemini-2.5-pro' && this.currentUser && !this.currentUser.can_use_pro) {
                this.showNotification('您没有Pro访问权限，无法使用Pro模型', 'error');
                this.isLoading = false;
                this.updateSendButton();
                this.disableUserInput(false);
                return;
            }

            // 立即添加用户消息到UI（这会自动移除欢迎消息）
            this.addMessageToUI({
                role: 'user',
                content: message,
                attachments: this.attachments.length > 0 ? [...this.attachments] : undefined,
                created_at: new Date().toISOString()
            });

            // 立即添加AI思考状态消息
            thinkingMessageId = this.addThinkingMessage();

            // 清空输入
            const userAttachments = [...this.attachments]; // 保存附件引用
            messageInput.value = '';
            this.attachments = [];
            this.updateAttachmentPreview();
            this.scrollToBottom();

            // 检查是否启用思考功能（仅对Flash模型生效）
            const thinkingToggle = document.getElementById('thinkingToggle');
            const enableThinking = thinkingToggle && thinkingToggle.checked;

            const response = await this.apiCall('/chat/messages', {
                method: 'POST',
                body: {
                    session_id: this.currentSession.id,
                    message: message,
                    model: model,
                    attachments: userAttachments,
                    enable_thinking: enableThinking  // 添加思考开关参数
                }
            });

            // 移除思考状态消息
            this.removeThinkingMessage(thinkingMessageId);

            if (response.success) {
                // 添加AI回复
                this.addMessageToUI({
                    role: 'assistant',
                    content: response.content,
                    created_at: new Date().toISOString()
                });

                this.scrollToBottom();

                // 更新会话列表（延迟执行，避免影响当前消息显示）
                // 根据屏幕尺寸调整延迟时间
                let delay = 100;
                if (this.isMobile) {
                    const screenHeight = window.innerHeight;
                    if (screenHeight >= 900) {
                        // 大屏手机 (如 430*932) - 完全避免更新会话列表，防止消息丢失
                        // 不更新会话列表，保持消息稳定
                        return;
                    } else if (screenHeight >= 800) {
                        // 中等偏大屏幕 (如 393*852) - 完全避免更新会话列表，防止消息丢失
                        // 不更新会话列表，保持消息稳定
                        return;
                    } else if (screenHeight >= 700) {
                        // 中等屏幕 - 延长延迟时间，确保消息已保存
                        delay = 2000;
                    } else {
                        // 小屏手机 - 延长延迟时间，确保消息已保存
                        delay = 1500;
                    }
                }
                
                setTimeout(() => {
                    // 在移动端，只更新会话列表，不重新选择当前会话
                    if (this.isMobile) {
                        this.updateSessionListOnly();
                    } else {
                        this.loadSessions();
                    }
                }, delay);

                // 检查上下文警告
                if (response.context_warning) {
                    const estimatedTokens = response.estimated_tokens || 0;
                    const formattedTokens = estimatedTokens.toLocaleString();
                    this.showNotification(
                        `⚠️ 上下文较长（约${formattedTokens} tokens），建议开启新对话以获得更好的回复质量。`,
                        'warning'
                    );
                }
            } else {
                // 检查是否是上下文过长错误
                if (response.context_too_long) {
                    const estimatedTokens = response.estimated_tokens || 0;
                    const limit = response.limit || 0;
                    const formattedTokens = estimatedTokens.toLocaleString();
                    const formattedLimit = limit.toLocaleString();

                    this.showNotification(
                        `❌ ${response.error}
当前: ${formattedTokens} tokens
限制: ${formattedLimit} tokens

点击左上角"+"号创建新对话`,
                        'error'
                    );
                } else if (response.is_thinking) {
                    // 后端检测到正在思考，提示用户
                    this.showNotification('⏳ ' + response.error, 'warning');
                } else {
                    this.showNotification(response.error, 'error');
                }
            }
        } catch (error) {
            this.showNotification(error.message, 'error');
            
            // 如果错误提示需要刷新，自动重新加载消息
            if (error.message.includes('刷新页面查看')) {
                console.log('检测到响应丢失，自动重新加载最新消息...');
                setTimeout(async () => {
                    try {
                        await this.loadMessages(this.currentSession.id);
                        this.showNotification('✅ 消息已自动加载', 'success', 2000);
                    } catch (reloadError) {
                        console.error('重新加载消息失败:', reloadError);
                    }
                }, 1500);
            }
        } finally {
            // 确保移除思考状态消息（如果存在）
            if (thinkingMessageId) {
                this.removeThinkingMessage(thinkingMessageId);
            }
            this.isLoading = false;
            this.updateSendButton();
            this.disableUserInput(false);
        }
    }

    updateSendButton() {
        const sendBtn = document.getElementById('sendBtn');
        const messageInput = document.getElementById('messageInput');
        const hasContent = messageInput.value.trim() || this.attachments.length > 0;

        sendBtn.disabled = this.isLoading || !hasContent;

        if (this.isLoading) {
            sendBtn.innerHTML = '<div class="loading"></div>';
        } else {
            sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';
        }
    }

    // 禁用/启用用户输入
    disableUserInput(disabled) {
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.getElementById('sendBtn');
        const attachBtn = document.getElementById('attachBtn');

        if (disabled) {
            messageInput.disabled = true;
            messageInput.placeholder = '模型正在思考中，请稍等...';
            sendBtn.disabled = true;
            attachBtn.disabled = true;

            // 阻止Enter键发送
            messageInput.style.pointerEvents = 'none';
        } else {
            messageInput.disabled = false;
            messageInput.placeholder = '输入您的消息... (支持 Ctrl+V 粘贴图片)';
            sendBtn.disabled = false;
            attachBtn.disabled = false;

            // 恢复Enter键发送
            messageInput.style.pointerEvents = 'auto';

            // 重新聚焦输入框
            setTimeout(() => {
                messageInput.focus();
            }, 100);
        }
    }

    // 添加AI思考状态消息（带渐进式超时提示）
    addThinkingMessage() {
        const chatMessages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message assistant thinking-message';

        const thinkingId = 'thinking-' + Date.now();
        messageDiv.id = thinkingId;

        messageDiv.innerHTML = `
            <div class="message-avatar"><i class="fas fa-robot"></i></div>
            <div class="message-content">
                <div class="message-bubble">
                    <div class="message-text">
                        <div class="thinking-animation">
                            <span class="thinking-text">正在思考...</span>
                            <span class="thinking-dots">
                                <span class="dot">.</span>
                                <span class="dot">.</span>
                                <span class="dot">.</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        chatMessages.appendChild(messageDiv);
        this.scrollToBottom();

        // 渐进式超时提示
        const thinkingTextElement = messageDiv.querySelector('.thinking-text');
        
        // 10秒后的提示
        const timer1 = setTimeout(() => {
            if (document.getElementById(thinkingId)) {
                thinkingTextElement.textContent = '我还在思考中，请稍等...';
                this.scrollToBottom();
            }
        }, 10000);

        // 20秒后的提示
        const timer2 = setTimeout(() => {
            if (document.getElementById(thinkingId)) {
                thinkingTextElement.textContent = '当前问题有点复杂，请稍等...';
                this.scrollToBottom();
            }
        }, 20000);

        // 30秒后的提示
        const timer3 = setTimeout(() => {
            if (document.getElementById(thinkingId)) {
                thinkingTextElement.textContent = '由于网络问题，我卡了，请刷新并且尝试重新提问，抱歉!';
                thinkingTextElement.style.color = '#ef4444';
                this.scrollToBottom();
            }
        }, 30000);

        // 将定时器保存到消息元素上，方便后续清除
        messageDiv.thinkingTimers = [timer1, timer2, timer3];

        return thinkingId;
    }

    // 移除AI思考状态消息
    removeThinkingMessage(thinkingId = null) {
        if (thinkingId) {
            const thinkingElement = document.getElementById(thinkingId);
            if (thinkingElement) {
                // 清除所有定时器
                if (thinkingElement.thinkingTimers) {
                    thinkingElement.thinkingTimers.forEach(timer => clearTimeout(timer));
                }
                thinkingElement.remove();
            }
        } else {
            // 移除所有思考状态消息
            const thinkingMessages = document.querySelectorAll('.thinking-message');
            thinkingMessages.forEach(msg => {
                // 清除定时器
                if (msg.thinkingTimers) {
                    msg.thinkingTimers.forEach(timer => clearTimeout(timer));
                }
                msg.remove();
            });
        }
    }

    // 初始化思考按钮状态
    initThinkingButton() {
        const checkbox = document.getElementById('thinkingToggle');
        const label = document.getElementById('thinkingToggleLabel');
        
        if (checkbox && label) {
            // 默认状态：未选中（关闭思考功能）
            checkbox.checked = false;
            label.classList.remove('checked');
        }
    }

    // 处理思考功能切换
    handleThinkingToggle(e) {
        const checkbox = e.target;
        const label = checkbox.closest('.thinking-toggle-label');
        
        if (checkbox.checked) {
            label.classList.add('checked');
            this.showNotification('✨ 已启用深度思考功能，回答质量将更高但可能需要更多时间', 'success', 3000);
        } else {
            label.classList.remove('checked');
            this.showNotification('⚡ 已关闭深度思考功能，将使用快速响应模式', 'info', 2000);
        }
    }

    // 文件上传
    async compressImageIfNeeded(file) {
        const TWO_MB = 2 * 1024 * 1024;
        try {
            const name = file.name || 'image';
            const ext = name.split('.').pop().toLowerCase();
            const isImage = (file.type && file.type.startsWith('image/')) || ['jpg','jpeg','png','gif','webp','heic','heif'].includes(ext);
            if (!isImage || file.size <= TWO_MB) {
                return file;
            }

            // HEIC/HEIF 转换
            if ((file.type && (file.type.includes('heic') || file.type.includes('heif'))) || ext === 'heic' || ext === 'heif') {
                if (window.heic2any) {
                    try {
                        const converted = await window.heic2any({ blob: file, toType: 'image/jpeg', quality: 0.8 });
                        const jpegBlob = Array.isArray(converted) ? converted[0] : converted;
                        return new File([jpegBlob], name.replace(/\.[^\.]+$/, '.jpg'), { type: 'image/jpeg' });
                    } catch (e) {
                        console.warn('HEIC转换失败，使用原文件', e);
                    }
                } else {
                    console.warn('HEIC转换库未加载，使用原文件');
                }
            }

            // 使用 Canvas 智能压缩
            const dataUrl = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });

            const img = await new Promise((resolve, reject) => {
                const image = new Image();
                image.onload = () => resolve(image);
                image.onerror = reject;
                image.src = dataUrl;
            });

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // 获取原始尺寸
            let w = img.naturalWidth || img.width;
            let h = img.naturalHeight || img.height;
            
            // 计算压缩比例 - 根据文件大小智能调整
            let scale = 1;
            const fileSizeMB = file.size / (1024 * 1024);
            
            if (fileSizeMB > 8) {
                scale = 0.5; // 8MB以上，压缩到50%
            } else if (fileSizeMB > 5) {
                scale = 0.6; // 5-8MB，压缩到60%
            } else if (fileSizeMB > 3) {
                scale = 0.7; // 3-5MB，压缩到70%
            } else {
                scale = 0.8; // 2-3MB，压缩到80%
            }
            
            // 应用压缩比例
            const newW = Math.floor(w * scale);
            const newH = Math.floor(h * scale);
            
            canvas.width = newW;
            canvas.height = newH;

            // PNG 可能有透明，先铺白底避免黑底
            const isPng = (file.type === 'image/png') || ext === 'png';
            if (isPng) {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, newW, newH);
            }

            // 绘制压缩后的图片
            ctx.drawImage(img, 0, 0, newW, newH);

            // 根据文件大小调整JPEG质量
            let quality = 0.8;
            if (fileSizeMB > 8) {
                quality = 0.6; // 大文件用更低质量
            } else if (fileSizeMB > 5) {
                quality = 0.7;
            }

            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', quality));
            if (!blob) {
                return file;
            }

            // 检查压缩效果，如果压缩后文件更大，返回原文件
            if (blob.size >= file.size) {
                console.info('压缩后文件更大，使用原文件', { 
                    originalBytes: file.size, 
                    compressedBytes: blob.size,
                    originalName: name 
                });
                return file;
            }

            const newName = name.replace(/\.[^\.]+$/, '.jpg');
            const newFile = new File([blob], newName, { type: 'image/jpeg' });
            console.info('压缩完成', { 
                originalBytes: file.size, 
                compressedBytes: newFile.size, 
                compressionRatio: ((file.size - newFile.size) / file.size * 100).toFixed(1) + '%',
                originalSize: `${(file.size / (1024 * 1024)).toFixed(2)}MB`,
                compressedSize: `${(newFile.size / (1024 * 1024)).toFixed(2)}MB`,
                originalName: name, 
                newName,
                scale: `${(scale * 100).toFixed(0)}%`,
                quality: quality
            });
            return newFile;
        } catch (err) {
            console.warn('压缩失败，使用原文件', err);
            return file;
        }
    }

    // 更新发送按钮为进度状态
    setUploadProgress(percent) {
        const sendBtn = document.getElementById('sendBtn');
        if (!sendBtn) return;
        if (percent === null || percent === undefined) {
            sendBtn.classList.remove('uploading');
            sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';
            return;
        }
        sendBtn.classList.add('uploading');
        const pct = Math.max(0, Math.min(100, Math.round(percent)));
        sendBtn.innerHTML = `<span class="progress-text">${pct}%</span>`;
    }

    // S4 直传上传（POST Policy）带进度
    async uploadToS4(file, category = 'images') {
        console.group('S4直传');
        console.debug('准备上传文件', { name: file.name, type: file.type, size: file.size, category });
        const presignPayload = {
            filename: file.name || 'upload.jpg',
            content_type: file.type || 'application/octet-stream',
            category
        };
        console.debug('请求预签名 payload', presignPayload);
        const presign = await this.apiCall('/s4/presign', {
            method: 'POST',
            body: presignPayload
        });
        console.debug('预签名返回', presign);
        if (!presign || !presign.success) {
            console.error('S4 预签名失败', presign);
            console.groupEnd('S4直传');
            throw new Error((presign && presign.error) || 'S4 预签名失败');
        }
        const formData = new FormData();
        Object.entries(presign.fields).forEach(([k, v]) => formData.append(k, v));
        formData.append('file', file);
        console.debug('POST 目标', presign.url);
        console.debug('POST 字段', presign.fields);
        
        // 使用XHR以获取上传进度
        const respStatus = await new Promise((resolve, reject) => {
            try {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', presign.url, true);
                xhr.onload = () => {
                    resolve({ status: xhr.status, ok: xhr.status === 201 || (xhr.status >= 200 && xhr.status < 300), text: xhr.responseText });
                };
                xhr.onerror = () => reject(new Error('S4 网络错误'));
                xhr.upload.onprogress = (e) => {
                    if (e.lengthComputable) {
                        const percent = (e.loaded / e.total) * 100;
                        this.setUploadProgress(percent);
                    }
                };
                xhr.send(formData);
            } catch (err) {
                reject(err);
            }
        });
        console.debug('S4 响应状态', respStatus.status, respStatus.ok);
        console.debug('S4 响应文本', (respStatus.text || '').slice(0, 500));
        // 重置进度
        this.setUploadProgress(null);
        
        if (!respStatus.ok) {
            console.error('S4 上传失败', { status: respStatus.status, ok: respStatus.ok });
            console.groupEnd('S4直传');
            throw new Error('S4 上传失败');
        }
        const publicUrl = presign.public_url_cdn || presign.public_url_hosted || presign.public_url;
        const att = {
            name: file.name,
            path: null,
            url: publicUrl,
            size: file.size,
            type: file.type || 'image/jpeg',
            category,
            source: 's4',
            key: presign.key,
            bucket: presign.bucket
        };
        console.info('S4 上传成功，附件对象', att);
        console.groupEnd('S4直传');
        return att;
    }

    async handleFileUpload(e) {
        const files = Array.from(e.target.files);

        for (const file of files) {
            try {
                // 检查文件大小（10MB限制）
                const maxSize = 10 * 1024 * 1024; // 10MB
                if (file.size > maxSize) {
                    this.showNotification(`文件 "${file.name}" 过大，最大支持 10MB`, 'error');
                    continue;
                }

                // 检查文件类型
                const allowedTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif', 'pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt', 'rtf', 'mp4', 'avi', 'mov'];
                const extension = file.name.split('.').pop().toLowerCase();
                if (!allowedTypes.includes(extension)) {
                    this.showNotification(`不支持的文件类型: ${extension}`, 'error');
                    continue;
                }

                const uploadFile = ((file.type && file.type.startsWith('image/')) || ['jpg','jpeg','png','gif','webp','heic','heif'].includes(extension))
                    ? await this.compressImageIfNeeded(file)
                    : file;

                try {
                    const imageExts = ['jpg','jpeg','png','gif','webp','heic','heif'];
                    const videoExts = ['mp4','avi','mov','wmv','flv'];
                    const docExts = ['pdf','doc','docx','ppt','pptx','txt','rtf'];
                    const isImageType = ((uploadFile.type && uploadFile.type.startsWith('image/')) || imageExts.includes(extension));
                    const category = isImageType ? 'images' : (videoExts.includes(extension) ? 'videos' : 'documents');

                    const attachment = await this.uploadToS4(uploadFile, category);
                    console.info('选择文件：S4上传成功', attachment);
                    this.attachments.push(attachment);
                    console.table(this.attachments);
                    this.updateAttachmentPreview();
                    this.showNotification(`✅ 文件已上传到 OSS`, 'success');
                } catch (err) {
                    console.error('选择文件：S4上传失败，回退到本地', err);
                    // 回退到本地上传
                    const formData = new FormData();
                    formData.append('file', uploadFile);
                    try {
                        const response = await fetch('api/upload', { method: 'POST', body: formData });
                        const result = await response.json();
                        if (result.success) {
                            const localAttachment = { ...result.file, source: 'local' };
                            console.info('选择文件：回退本地上传成功', localAttachment);
                            this.attachments.push(localAttachment);
                            console.table(this.attachments);
                            this.updateAttachmentPreview();
                            this.showNotification(`✅ 文件上传成功`, 'success');
                        } else {
                            console.error('选择文件：回退本地上传失败', result);
                            this.showNotification(`❌ 文件上传失败: ${result.message || result.error}`, 'error');
                        }
                    } catch (e2) {
                        this.showNotification(`❌ 文件上传失败: ${e2.message}`, 'error');
                    }
                }
            } catch (error) {
                this.showNotification(`文件上传失败: ${error.message}`, 'error');
            }
        }

        // 清空文件输入
        e.target.value = '';
    }

    updateAttachmentPreview() {
        const preview = document.getElementById('attachmentPreview');

        if (this.attachments.length === 0) {
            preview.style.display = 'none';
            preview.innerHTML = '';
            return;
        }

        preview.style.display = 'flex';
        preview.innerHTML = '';

        this.attachments.forEach((attachment, index) => {
            const item = document.createElement('div');
            const isImage = attachment.category === 'images';
            item.className = isImage ? 'attachment-item image-attachment-preview' : 'attachment-item';

            const icon = this.getFileIcon(attachment.category);

            // 如果是图片，添加点击预览功能
            if (isImage) {
                item.innerHTML = `
                    <i class="${icon}"></i>
                    <span class="attachment-name" onclick="app.showImagePreview('${attachment.url}', '${attachment.name}')" style="cursor: pointer;">${attachment.name}</span>
                    <i class="fas fa-eye preview-icon-small" onclick="app.showImagePreview('${attachment.url}', '${attachment.name}')" style="cursor: pointer;" title="预览图片"></i>
                    <button class="attachment-remove" onclick="app.removeAttachment(${index})">&times;</button>
                `;
            } else {
                item.innerHTML = `
                    <i class="${icon}"></i>
                    <span>${attachment.name}</span>
                    <button class="attachment-remove" onclick="app.removeAttachment(${index})">&times;</button>
                `;
            }

            preview.appendChild(item);
        });

        this.updateSendButton();
    }

    async removeAttachment(index) {
        const attachment = this.attachments[index];
        // 如果是S4来源，优先删除OSS对象
        if (attachment && attachment.source === 's4' && attachment.key) {
            try {
                const resp = await this.apiCall('/s4/delete', {
                    method: 'POST',
                    body: { key: attachment.key }
                });
                if (resp && resp.success) {
                    this.showNotification('✅ 已从OSS删除该文件', 'success');
                } else {
                    this.showNotification(`⚠️ OSS删除失败：${resp.error || '未知错误'}`, 'warning');
                }
            } catch (err) {
                this.showNotification(`❌ OSS删除失败：${err.message}`, 'error');
            }
        }
        // 从前端列表移除
        this.attachments.splice(index, 1);
        this.updateAttachmentPreview();
        this.updateSendButton();
    }

    getFileIcon(category) {
        const icons = {
            'images': 'fas fa-image',
            'videos': 'fas fa-video',
            'documents': 'fas fa-file-alt'
        };
        return icons[category] || 'fas fa-file';
    }

    // 搜索会话
    async searchSessions(keyword) {
        if (!keyword.trim()) {
            this.loadSessions();
            return;
        }

        try {
            const response = await this.apiCall(`/chat/search?keyword=${encodeURIComponent(keyword)}`);
            if (response.success) {
                // 根据搜索结果过滤会话
                const sessions = response.messages.reduce((acc, message) => {
                    const existingSession = acc.find(s => s.id === message.session_id);
                    if (!existingSession) {
                        acc.push({
                            id: message.session_id,
                            title: message.session_title,
                            last_message: message.content,
                            updated_at: message.created_at
                        });
                    }
                    return acc;
                }, []);

                this.renderSessions(sessions);
            }
        } catch (error) {
            this.showNotification('搜索失败', 'error');
        }
    }

    // 管理员功能
    switchAdminTab(e) {
        const tab = e.target.dataset.tab;

        // 切换标签按钮状态
        document.querySelectorAll('.admin-tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        e.target.classList.add('active');

        // 切换内容
        document.querySelectorAll('.admin-tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tab}Tab`).classList.add('active');

        // 加载对应数据
        this.loadAdminTabData(tab);
    }

    async loadAdminData() {
        await this.loadAdminTabData('dashboard');
    }

    async loadAdminTabData(tab) {
        switch (tab) {
            case 'dashboard':
                await this.loadDashboardStats();
                break;
            case 'api-keys':
                await this.loadApiKeys();
                break;
            case 'users':
                await this.loadUsers();
                break;
            case 'sessions':
                await this.loadSessionsAdmin();
                break;
            case 'settings':
                await this.loadSystemSettings();
                break;
            case 'logs':
                await this.loadLogs();
                break;
        }
    }

    async loadDashboardStats() {
        try {
            const response = await this.apiCall('/admin/stats');
            if (response.success) {
                const stats = response.stats;
                document.getElementById('totalUsers').textContent = stats.total_users || 0;
                document.getElementById('totalCalls').textContent = stats.total_calls || 0;
                document.getElementById('todayCalls').textContent = stats.today_calls || 0;
                document.getElementById('avgResponseTime').textContent =
                    stats.avg_response_time ? `${Math.round(stats.avg_response_time * 1000)}ms` : '0ms';
            }
        } catch (error) {
            this.showNotification('加载统计数据失败', 'error');
        }
    }

    async loadApiKeys() {
        try {
            const response = await this.apiCall('/admin/api-keys');
            if (response.success) {
                this.renderApiKeys(response.api_keys);
            }
        } catch (error) {
            this.showNotification('加载API密钥失败', 'error');
        }
    }

    renderApiKeys(apiKeys) {
        const tbody = document.querySelector('#apiKeysTable tbody');
        tbody.innerHTML = '';

        apiKeys.forEach(key => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${key.name}</td>
                <td>${key.api_key.substring(0, 20)}...</td>
                <td><span class="status-badge ${key.is_active ? 'active' : 'inactive'}">${key.is_active ? '启用' : '禁用'}</span></td>
                <td>${key.pro_rate_limit || 10}/分钟</td>
                <td>${key.usage_count || 0}</td>
                <td>${key.last_used ? this.formatTime(key.last_used) : '从未使用'}</td>
                <td>
                    <button class="btn-icon" onclick="app.editApiKey(${key.id})" title="编辑">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" onclick="app.deleteApiKey(${key.id})" title="删除">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    async loadUsers() {
        try {
            const response = await this.apiCall('/admin/users');
            if (response.success) {
                this.renderUsers(response.users);
            }
        } catch (error) {
            this.showNotification('加载用户列表失败', 'error');
        }
    }

    renderUsers(users) {
        const tbody = document.querySelector('#usersTable tbody');
        tbody.innerHTML = '';

        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.username}</td>
                <td>${user.email || '未设置'}</td>
                <td><span class="status-badge ${user.is_admin ? 'active' : 'inactive'}">${user.is_admin ? '是' : '否'}</span></td>
                <td><span class="status-badge ${user.can_use_pro ? 'active' : 'inactive'}">${user.can_use_pro ? '是' : '否'}</span></td>
                <td>${this.formatTime(user.created_at)}</td>
                <td>
                    <button class="btn-icon" onclick="app.editUser(${user.id})" title="编辑用户">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" onclick="app.toggleUserAdmin(${user.id})" title="切换管理员状态">
                        <i class="fas fa-user-shield"></i>
                    </button>
                    <button class="btn-icon" onclick="app.toggleUserPro(${user.id})" title="切换Pro访问权限">
                        <i class="fas fa-star"></i>
                    </button>
                    <button class="btn-icon" onclick="app.deleteUser(${user.id})" title="删除用户">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    async loadLogs() {
        try {
            const response = await this.apiCall('/admin/logs');
            if (response.success) {
                this.renderLogs(response.logs);
            }
        } catch (error) {
            this.showNotification('加载日志失败', 'error');
        }
    }

    renderLogs(logs) {
        const tbody = document.querySelector('#logsTable tbody');
        tbody.innerHTML = '';

        if (!logs || logs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px; color: var(--text-muted);">暂无调用日志</td></tr>';
            return;
        }

        logs.forEach(log => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${this.formatTime(log.created_at)}</td>
                <td>${log.api_key_name || '未知密钥'}</td>
                <td>${log.username || '未知用户'}</td>
                <td>${log.model}</td>
                <td>${log.total_tokens || 0}</td>
                <td>${Math.round(log.response_time * 1000)}ms</td>
                <td><span class="badge ${log.status === 'success' ? 'success' : 'error'}">${log.status === 'success' ? '成功' : '失败'}</span></td>
            `;
            tbody.appendChild(row);
        });
    }

    async clearLogs() {
        if (!confirm('确定要清空所有 API 调用日志吗？此操作不可恢复！')) {
            return;
        }

        try {
            const response = await this.apiCall('/admin/logs', {
                method: 'DELETE'
            });

            if (response.success) {
                this.showNotification('日志已清空', 'success');
                await this.loadLogs();
            } else {
                this.showNotification(response.message || '清空日志失败', 'error');
            }
        } catch (error) {
            this.showNotification('清空日志失败: ' + error.message, 'error');
        }
    }

    // 管理员会话管理
    async loadSessionsAdmin() {
        // 重置分页状态
        this.sessionsPagination = { currentPage: 1, limit: 20, offset: 0 };
        this.sessionsSearchKeyword = '';
        await this.loadSessionsAdminWithPagination();
    }

    renderSessionsAdmin(sessions) {
        const tbody = document.querySelector('#sessionsTable tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        sessions.forEach(session => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${session.id}</td>
                <td>${session.username || '未知用户'}</td>
                <td>${session.title || '无标题'}</td>
                <td>${session.message_count || 0}</td>
                <td>${session.last_message ? this.truncateText(session.last_message, 50) : '无消息'}</td>
                <td>${this.formatTime(session.created_at)}</td>
                <td>${this.formatTime(session.updated_at)}</td>
                <td>
                    <button class="btn-small btn-primary" onclick="app.showSessionDetail(${session.id})">
                        <i class="fas fa-eye"></i> 查看
                    </button>
                    <button class="btn-small btn-danger" onclick="app.deleteSessionAdmin(${session.id})">
                        <i class="fas fa-trash"></i> 删除
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    updateSessionsPagination(total, limit, offset) {
        const currentPage = Math.floor(offset / limit) + 1;
        const totalPages = Math.ceil(total / limit);
        
        // 更新分页状态
        if (this.sessionsPagination) {
            this.sessionsPagination.currentPage = currentPage;
            this.sessionsPagination.totalPages = totalPages;
        }
        
        const pageInfo = document.getElementById('sessionsPageInfo');
        const prevBtn = document.getElementById('prevSessionsPage');
        const nextBtn = document.getElementById('nextSessionsPage');
        
        if (pageInfo) {
            pageInfo.textContent = `第 ${currentPage} 页，共 ${totalPages} 页`;
        }
        
        if (prevBtn) {
            prevBtn.disabled = currentPage <= 1;
        }
        
        if (nextBtn) {
            nextBtn.disabled = currentPage >= totalPages;
        }
    }

    async showSessionDetail(sessionId) {
        try {
            const response = await this.apiCall(`/admin/session?session_id=${sessionId}`);
            if (response.success) {
                this.displaySessionDetail(response.session, response.messages);
            } else {
                this.showNotification('获取会话详情失败', 'error');
            }
        } catch (error) {
            this.showNotification('获取会话详情失败: ' + error.message, 'error');
        }
    }

    displaySessionDetail(session, messages) {
        // 填充会话信息
        document.getElementById('modalSessionId').textContent = session.id;
        document.getElementById('modalSessionUser').textContent = session.username || '未知用户';
        document.getElementById('modalSessionTitle').textContent = session.title || '无标题';
        document.getElementById('modalSessionMessageCount').textContent = messages.length;
        document.getElementById('modalSessionCreated').textContent = this.formatTime(session.created_at);

        // 填充消息列表
        const messagesList = document.getElementById('modalMessagesList');
        messagesList.innerHTML = '';

        messages.forEach(message => {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message-item ${message.role}`;
            
            const roleText = message.role === 'user' ? '用户' : 'AI';
            const timeText = this.formatTime(message.created_at);
            
            messageDiv.innerHTML = `
                <div class="message-header">
                    <span class="message-role">${roleText}</span>
                    <span class="message-time">${timeText}</span>
                </div>
                <div class="message-content">${this.formatMessageContent(message.content)}</div>
            `;
            
            messagesList.appendChild(messageDiv);
        });

        // 设置删除按钮事件
        const deleteBtn = document.getElementById('deleteSessionBtn');
        deleteBtn.onclick = () => this.deleteSessionAdmin(session.id);

        // 显示模态框
        document.getElementById('sessionDetailModal').style.display = 'flex';
    }

    async deleteSessionAdmin(sessionId) {
        if (!confirm('确定要删除这个会话吗？此操作不可恢复！')) {
            return;
        }

        try {
            const response = await this.apiCall(`/admin/session?session_id=${sessionId}`, {
                method: 'DELETE'
            });

            if (response.success) {
                this.showNotification('会话删除成功', 'success');
                // 关闭模态框
                document.getElementById('sessionDetailModal').style.display = 'none';
                // 刷新会话列表
                await this.loadSessionsAdmin();
            } else {
                this.showNotification(response.error || '删除会话失败', 'error');
            }
        } catch (error) {
            this.showNotification('删除会话失败: ' + error.message, 'error');
        }
    }

    truncateText(text, maxLength) {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    formatMessageContent(content) {
        if (!content) return '';
        // 简单的HTML转义
        return content.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
    }

    // 格式化上次登录时间
    formatLastLoginTime(lastLoginTime) {
        if (!lastLoginTime) return '首次登录';
        
        try {
            const lastLogin = new Date(lastLoginTime);
            const now = new Date();
            const diff = now - lastLogin;
            
            // 如果是未来时间或无效时间
            if (isNaN(lastLogin.getTime()) || diff < 0) {
                return '首次登录';
            }
            
            // 计算时间差
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor(diff / (1000 * 60));
            
            if (days > 0) {
                return `${days}天前 (${lastLogin.toLocaleString('zh-CN')})`;
            } else if (hours > 0) {
                return `${hours}小时前 (${lastLogin.toLocaleString('zh-CN')})`;
            } else if (minutes > 0) {
                return `${minutes}分钟前 (${lastLogin.toLocaleString('zh-CN')})`;
            } else {
                return '刚刚 (本次登录)';
            }
        } catch (error) {
            console.warn('格式化登录时间失败:', error);
            return '首次登录';
        }
    }

    // 会话管理分页和搜索
    changeSessionsPage(direction) {
        if (!this.sessionsPagination) {
            this.sessionsPagination = { currentPage: 1, limit: 20, offset: 0 };
        }
        
        const newOffset = this.sessionsPagination.offset + (direction * this.sessionsPagination.limit);
        if (newOffset >= 0) {
            this.sessionsPagination.offset = newOffset;
            this.loadSessionsAdminWithPagination();
        }
    }

    async loadSessionsAdminWithPagination() {
        try {
            const params = new URLSearchParams({
                limit: this.sessionsPagination.limit,
                offset: this.sessionsPagination.offset
            });
            
            if (this.sessionsSearchKeyword) {
                params.append('search', this.sessionsSearchKeyword);
            }
            
            const response = await this.apiCall(`/admin/sessions?${params}`);
            if (response.success) {
                this.renderSessionsAdmin(response.sessions);
                this.updateSessionsPagination(response.total, response.limit, response.offset);
            } else {
                this.showNotification('加载会话列表失败', 'error');
            }
        } catch (error) {
            this.showNotification('加载会话列表失败: ' + error.message, 'error');
        }
    }

    async searchSessionsAdmin(keyword) {
        this.sessionsSearchKeyword = keyword;
        this.sessionsPagination = { currentPage: 1, limit: 20, offset: 0 };
        await this.loadSessionsAdminWithPagination();
    }

    // 工具函数
    formatTime(timestamp) {
        // 处理时间戳的兼容性，支持字符串和数字类型
        let date;

        if (typeof timestamp === 'string') {
            // 如果是字符串，先尝试直接解析
            date = new Date(timestamp);
            // 如果解析失败，尝试将其作为数字解析
            if (isNaN(date.getTime())) {
                const numTimestamp = parseInt(timestamp);
                if (!isNaN(numTimestamp)) {
                    // 判断是秒还是毫秒
                    date = new Date(numTimestamp < 10000000000 ? numTimestamp * 1000 : numTimestamp);
                } else {
                    console.warn('时间戳格式无效:', timestamp);
                    return '时间无效';
                }
            }
        } else if (typeof timestamp === 'number') {
            // 判断是秒还是毫秒级时间戳
            date = new Date(timestamp < 10000000000 ? timestamp * 1000 : timestamp);
        } else {
            console.warn('时间戳类型无效:', typeof timestamp, timestamp);
            return '时间无效';
        }

        // 检查日期是否有效
        if (isNaN(date.getTime())) {
            console.warn('解析后的日期无效:', timestamp);
            return '时间无效';
        }

        const now = new Date();
        const diff = now - date;

        // 针对时区问题，如果时间差为负数（未来时间），则可能是时区偏差
        if (diff < 0) {
            // 如果是未来时间，可能是时区问题，尝试重新计算
            // 如果时间差在1小时内，可能是时区偏差，按正常时间处理
            if (Math.abs(diff) < 3600000) { // 1小时内
                const absDiff = Math.abs(diff);
                if (absDiff < 60000) { // 1分钟内
                    return '刚刚';
                } else if (absDiff < 3600000) { // 1小时内
                    return `${Math.floor(absDiff / 60000)}分钟前`;
                }
            }
            // 如果时间差太大，可能是数据错误，显示具体时间
            return date.toLocaleString('zh-CN');
        }

        if (diff < 60000) { // 1分钟内
            return '刚刚';
        } else if (diff < 3600000) { // 1小时内
            return `${Math.floor(diff / 60000)}分钟前`;
        } else if (diff < 86400000) { // 24小时内
            return `${Math.floor(diff / 3600000)}小时前`;
        } else {
            return date.toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    }

    scrollToBottom() {
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // 自动调整文本框高度
    autoResizeTextarea() {
        const textarea = document.getElementById('messageInput');
        textarea.addEventListener('input', function () {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 120) + 'px';
        });
    }

    // 初始化粘贴和拖拽功能
    initPasteAndDrop() {
        const chatMessages = document.getElementById('chatMessages');
        const messageInput = document.getElementById('messageInput');
        const inputWrapper = document.querySelector('.input-wrapper');
        const chatInputContainer = document.querySelector('.chat-input-container');

        // 粘贴事件监听（在输入框中粘贴图片）
        messageInput.addEventListener('paste', (e) => this.handlePaste(e));

        // 也可以在聊天区域粘贴
        chatMessages.addEventListener('paste', (e) => this.handlePaste(e));

        // 拖拽事件监听
        const dropZones = [chatMessages, chatInputContainer, inputWrapper];

        dropZones.forEach(zone => {
            // 阻止默认拖拽行为
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                zone.addEventListener(eventName, (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                }, false);
            });

            // 拖拽进入时的视觉反馈
            zone.addEventListener('dragenter', (e) => {
                zone.classList.add('drag-over');
            });

            zone.addEventListener('dragover', (e) => {
                zone.classList.add('drag-over');
            });

            // 拖拽离开时移除视觉反馈
            zone.addEventListener('dragleave', (e) => {
                // 检查是否真的离开了区域
                if (e.target === zone) {
                    zone.classList.remove('drag-over');
                }
            });

            // 放置文件
            zone.addEventListener('drop', (e) => {
                zone.classList.remove('drag-over');
                this.handleDrop(e);
            });
        });

        // 全局阻止拖拽到浏览器窗口打开文件
        window.addEventListener('dragover', (e) => {
            e.preventDefault();
        }, false);

        window.addEventListener('drop', (e) => {
            e.preventDefault();
        }, false);
    }

    // 处理粘贴事件
    handlePaste(e) {
        const items = e.clipboardData?.items;
        if (!items) return;

        let hasImage = false;

        for (let i = 0; i < items.length; i++) {
            const item = items[i];

            // 检查是否是图片
            if (item.type.indexOf('image') !== -1) {
                hasImage = true;
                e.preventDefault();

                const blob = item.getAsFile();
                if (blob) {
                    this.uploadPastedImage(blob);
                }
                break;
            }
        }

        if (hasImage) {
            this.showNotification('📋 正在上传粘贴的图片...', 'info');
        }
    }

    // 处理拖拽放置事件
    handleDrop(e) {
        const files = e.dataTransfer?.files;
        if (!files || files.length === 0) return;

        this.showNotification(`📤 正在上传 ${files.length} 个文件...`, 'info');

        // 处理多个文件
        Array.from(files).forEach(file => {
            this.uploadDroppedFile(file);
        });
    }

    // 上传粘贴的图片
    async uploadPastedImage(blob) {
        // 创建一个唯一的文件名
        const timestamp = new Date().getTime();
        const fileName = `pasted-image-${timestamp}.png`;

        // 将 Blob 转换为 File 对象
        const file = new File([blob], fileName, { type: blob.type });

        // 检查文件大小
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            this.showNotification('❌ 图片过大，最大支持 10MB', 'error');
            return;
        }

        const uploadFile = await this.compressImageIfNeeded(file);

        try {
            const attachment = await this.uploadToS4(uploadFile, 'images');
            console.info('粘贴图片：S4上传成功', attachment);
            this.attachments.push(attachment);
            console.table(this.attachments);
            this.updateAttachmentPreview();
            this.showNotification(`✅ 图片已上传到 OSS`, 'success');
        } catch (err) {
            const formData = new FormData();
            formData.append('file', uploadFile);
            try {
                const response = await fetch('api/upload', {
                    method: 'POST',
                    body: formData
                });
                const result = await response.json();
                if (result.success) {
                    const localAttachment = { ...result.file, source: 'local' };
                    console.info('粘贴图片：回退本地上传成功', localAttachment);
                    this.attachments.push(localAttachment);
                    console.table(this.attachments);
                    this.updateAttachmentPreview();
                    this.showNotification(`✅ 图片上传成功`, 'success');
                } else {
                    console.error('粘贴图片：回退本地上传失败', result);
                    this.showNotification(`❌ 图片上传失败: ${result.message || result.error}`, 'error');
                }
            } catch (error) {
                console.error('粘贴图片：本地上传异常', error);
                this.showNotification(`❌ 图片上传失败: ${error.message}`, 'error');
            }
        }
    }

    // 上传拖拽的文件
    async uploadDroppedFile(file) {
        // 检查文件大小
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            this.showNotification(`❌ 文件 "${file.name}" 过大，最大支持 10MB`, 'error');
            return;
        }

        // 检查文件类型
        const allowedTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif', 'pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt', 'rtf', 'mp4', 'avi', 'mov'];
        const extension = file.name.split('.').pop().toLowerCase();
        if (!allowedTypes.includes(extension)) {
            this.showNotification(`❌ 不支持的文件类型: ${extension}`, 'error');
            return;
        }

        const uploadFile = ((file.type && file.type.startsWith('image/')) || ['jpg','jpeg','png','gif','webp','heic','heif'].includes(extension))
            ? await this.compressImageIfNeeded(file)
            : file;
        try {
            const imageExts = ['jpg','jpeg','png','gif','webp','heic','heif'];
            const videoExts = ['mp4','avi','mov','wmv','flv'];
            const docExts = ['pdf','doc','docx','ppt','pptx','txt','rtf'];
            const isImageType = ((uploadFile.type && uploadFile.type.startsWith('image/')) || imageExts.includes(extension));
            const category = isImageType ? 'images' : (videoExts.includes(extension) ? 'videos' : 'documents');

            const attachment = await this.uploadToS4(uploadFile, category);
            console.info('拖拽文件：S4上传成功', attachment);
            this.attachments.push(attachment);
            console.table(this.attachments);
            this.updateAttachmentPreview();
            this.showNotification(`✅ 文件已上传到 OSS`, 'success');
        } catch (error) {
            console.error('拖拽文件：S4上传失败，回退到本地', error);
            // 回退到本地上传
            const formData = new FormData();
            formData.append('file', uploadFile);
            try {
                const response = await fetch('api/upload', { method: 'POST', body: formData });
                const result = await response.json();
                if (result.success) {
                    const localAttachment = { ...result.file, source: 'local' };
                    console.info('拖拽文件：回退本地上传成功', localAttachment);
                    this.attachments.push(localAttachment);
                    console.table(this.attachments);
                    this.updateAttachmentPreview();
                    this.showNotification(`✅ 文件上传成功`, 'success');
                } else {
                    this.showNotification(`❌ 文件上传失败: ${result.message || result.error}`, 'error');
                }
            } catch (e2) {
                this.showNotification(`❌ 文件上传失败: ${e2.message}`, 'error');
            }
        }
    }

    // 模态框
    showModal(content) {
        document.getElementById('modalBody').innerHTML = content;
        document.getElementById('modal').style.display = 'block';
    }

    closeModal() {
        document.getElementById('modal').style.display = 'none';
    }

    // API密钥管理
    async editApiKey(id) {
        try {
            // 获取所有API密钥，找到要编辑的那个
            const response = await this.apiCall('/admin/api-keys');
            if (response.success) {
                const apiKey = response.api_keys.find(key => key.id == id);
                if (apiKey) {
                    this.showEditApiKeyModal(apiKey);
                } else {
                    this.showNotification('API密钥不存在', 'error');
                }
            }
        } catch (error) {
            this.showNotification('获取API密钥信息失败', 'error');
        }
    }

    showEditApiKeyModal(apiKey) {
        const modalContent = `
            <h3>编辑API密钥</h3>
            <form id="editApiKeyForm">
                <div class="form-group">
                    <label for="editApiKeyName">名称:</label>
                    <input type="text" id="editApiKeyName" value="${apiKey.name}" required>
                </div>
                <div class="form-group">
                    <label for="editApiKeyValue">API密钥:</label>
                    <input type="text" id="editApiKeyValue" value="${apiKey.api_key}" required>
                </div>
                <div class="form-group">
                    <label for="editApiKeyProLimit">Pro限制 (每分钟):</label>
                    <input type="number" id="editApiKeyProLimit" value="${apiKey.pro_rate_limit || 10}" min="1" max="100" required>
                </div>
                <div class="checkbox-group">
                    <label>
                        <input type="checkbox" id="editApiKeyActive" ${apiKey.is_active ? 'checked' : ''}>
                        启用此API密钥
                    </label>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn-primary">更新</button>
                    <button type="button" class="btn-secondary" onclick="app.closeModal()">取消</button>
                </div>
            </form>
        `;

        this.showModal(modalContent);

        document.getElementById('editApiKeyForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateApiKey(apiKey.id);
        });
    }

    async updateApiKey(id) {
        const name = document.getElementById('editApiKeyName').value.trim();
        const apiKey = document.getElementById('editApiKeyValue').value.trim();
        const proLimit = parseInt(document.getElementById('editApiKeyProLimit').value);
        const isActive = document.getElementById('editApiKeyActive').checked;

        if (!name || !apiKey) {
            this.showNotification('请填写所有必填字段', 'error');
            return;
        }

        try {
            const response = await this.apiCall('/admin/api-keys', {
                method: 'PUT',
                body: {
                    id: id,
                    name: name,
                    api_key: apiKey,
                    pro_rate_limit: proLimit,
                    is_active: isActive ? 1 : 0
                }
            });

            if (response.success) {
                this.showNotification('API密钥更新成功', 'success');
                this.closeModal();
                this.loadApiKeys();
            } else {
                this.showNotification(response.message, 'error');
            }
        } catch (error) {
            this.showNotification(error.message, 'error');
        }
    }

    async deleteApiKey(id) {
        if (!confirm('确定要删除这个API密钥吗？')) return;

        try {
            const response = await this.apiCall('/admin/api-keys', {
                method: 'DELETE',
                body: { id }
            });

            if (response.success) {
                this.showNotification('API密钥删除成功', 'success');
                this.loadApiKeys();
            } else {
                this.showNotification(response.message, 'error');
            }
        } catch (error) {
            this.showNotification(error.message, 'error');
        }
    }

    // 用户管理
    async toggleUserAdmin(userId) {
        try {
            const response = await this.apiCall('/admin/user/toggle-admin', {
                method: 'POST',
                body: { user_id: userId }
            });

            if (response.success) {
                this.showNotification('用户状态更新成功', 'success');
                this.loadUsers();
            } else {
                this.showNotification(response.message, 'error');
            }
        } catch (error) {
            this.showNotification(error.message, 'error');
        }
    }

    async deleteUser(userId) {
        if (!confirm('确定要删除这个用户吗？')) return;

        try {
            const response = await this.apiCall('/admin/users', {
                method: 'DELETE',
                body: { user_id: userId }
            });

            if (response.success) {
                this.showNotification('用户删除成功', 'success');
                this.loadUsers();
            } else {
                this.showNotification(response.message, 'error');
            }
        } catch (error) {
            this.showNotification(error.message, 'error');
        }
    }

    // 系统设置管理
    async loadSystemSettings() {
        try {
            const response = await this.apiCall('/admin/settings');
            if (response.success) {
                this.renderSystemSettings(response.settings);
            }
        } catch (error) {
            this.showNotification('加载系统设置失败', 'error');
        }
    }

    renderSystemSettings(settings) {
        const registrationToggle = document.getElementById('registrationToggle');
        const defaultProToggle = document.getElementById('defaultProToggle');

        // 设置开关状态
        registrationToggle.checked = settings.registration_enabled === '1';
        defaultProToggle.checked = settings.default_pro_access === '1';

        // 绑定事件
        registrationToggle.onchange = () => this.updateRegistrationSetting(registrationToggle.checked);
        defaultProToggle.onchange = () => this.updateDefaultProSetting(defaultProToggle.checked);
    }

    async updateRegistrationSetting(enabled) {
        try {
            const response = await this.apiCall('/admin/settings/registration', {
                method: 'POST',
                body: { enabled }
            });

            if (response.success) {
                this.showNotification('注册设置更新成功', 'success');
            } else {
                this.showNotification(response.message, 'error');
            }
        } catch (error) {
            this.showNotification(error.message, 'error');
        }
    }

    async updateDefaultProSetting(enabled) {
        try {
            const response = await this.apiCall('/admin/settings', {
                method: 'POST',
                body: {
                    setting_key: 'default_pro_access',
                    setting_value: enabled ? '1' : '0',
                    description: '新用户默认Pro访问权限'
                }
            });

            if (response.success) {
                this.showNotification('默认Pro设置更新成功', 'success');
            } else {
                this.showNotification(response.message, 'error');
            }
        } catch (error) {
            this.showNotification(error.message, 'error');
        }
    }

    // 用户管理增强功能
    async editUser(userId) {
        try {
            const response = await this.apiCall('/admin/users');
            if (response.success) {
                const user = response.users.find(u => u.id === userId);
                if (user) {
                    this.showEditUserModal(user);
                }
            }
        } catch (error) {
            this.showNotification('获取用户信息失败', 'error');
        }
    }

    showEditUserModal(user) {
        const modalContent = `
            <h2>编辑用户</h2>
            <form id="editUserForm">
                <div class="form-group">
                    <label for="editUsername">用户名</label>
                    <input type="text" id="editUsername" value="${user.username}" required>
                </div>
                <div class="form-group">
                    <label for="editEmail">邮箱</label>
                    <input type="email" id="editEmail" value="${user.email || ''}">
                </div>
                <div class="form-group">
                    <label for="editPassword">新密码（留空则不修改）</label>
                    <input type="password" id="editPassword">
                </div>
                <div class="checkbox-group">
                    <input type="checkbox" id="editIsAdmin" ${user.is_admin ? 'checked' : ''}>
                    <label for="editIsAdmin">管理员权限</label>
                </div>
                <div class="checkbox-group">
                    <input type="checkbox" id="editCanUsePro" ${user.can_use_pro ? 'checked' : ''}>
                    <label for="editCanUsePro">Pro访问权限</label>
                </div>
                <div style="margin-top: 20px; text-align: right;">
                    <button type="button" class="btn-secondary" onclick="app.closeModal()">取消</button>
                    <button type="submit" class="btn-primary">保存</button>
                </div>
            </form>
        `;

        this.showModal(modalContent);

        document.getElementById('editUserForm').onsubmit = (e) => {
            e.preventDefault();
            this.updateUser(user.id);
        };
    }

    async updateUser(userId) {
        const username = document.getElementById('editUsername').value;
        const email = document.getElementById('editEmail').value;
        const password = document.getElementById('editPassword').value;
        const isAdmin = document.getElementById('editIsAdmin').checked;
        const canUsePro = document.getElementById('editCanUsePro').checked;

        try {
            const body = {
                user_id: userId,
                username,
                email,
                is_admin: isAdmin,
                can_use_pro: canUsePro
            };

            if (password) {
                body.password = password;
            }

            const response = await this.apiCall('/admin/user/update', {
                method: 'POST',
                body
            });

            if (response.success) {
                this.showNotification('用户更新成功', 'success');
                this.closeModal();
                this.loadUsers();
            } else {
                this.showNotification(response.message, 'error');
            }
        } catch (error) {
            this.showNotification(error.message, 'error');
        }
    }

    async toggleUserPro(userId) {
        try {
            const response = await this.apiCall('/admin/user/toggle-pro', {
                method: 'POST',
                body: { user_id: userId }
            });

            if (response.success) {
                this.showNotification('Pro访问权限更新成功', 'success');
                this.loadUsers();
            } else {
                this.showNotification(response.message, 'error');
            }
        } catch (error) {
            this.showNotification(error.message, 'error');
        }
    }

    showAddUserModal() {
        const modalContent = `
            <h2>添加用户</h2>
            <form id="addUserForm">
                <div class="form-group">
                    <label for="newUsername">用户名</label>
                    <input type="text" id="newUsername" required>
                </div>
                <div class="form-group">
                    <label for="newEmail">邮箱</label>
                    <input type="email" id="newEmail">
                </div>
                <div class="form-group">
                    <label for="newPassword">密码</label>
                    <input type="password" id="newPassword" required>
                </div>
                <div class="checkbox-group">
                    <input type="checkbox" id="newIsAdmin">
                    <label for="newIsAdmin">管理员权限</label>
                </div>
                <div class="checkbox-group">
                    <input type="checkbox" id="newCanUsePro">
                    <label for="newCanUsePro">Pro访问权限</label>
                </div>
                <div style="margin-top: 20px; text-align: right;">
                    <button type="button" class="btn-secondary" onclick="app.closeModal()">取消</button>
                    <button type="submit" class="btn-primary">创建</button>
                </div>
            </form>
        `;

        this.showModal(modalContent);

        document.getElementById('addUserForm').onsubmit = (e) => {
            e.preventDefault();
            this.createUser();
        };
    }

    async createUser() {
        const username = document.getElementById('newUsername').value;
        const email = document.getElementById('newEmail').value;
        const password = document.getElementById('newPassword').value;
        const isAdmin = document.getElementById('newIsAdmin').checked;
        const canUsePro = document.getElementById('newCanUsePro').checked;

        try {
            const response = await this.apiCall('/admin/user/create', {
                method: 'POST',
                body: {
                    username,
                    email,
                    password,
                    is_admin: isAdmin,
                    can_use_pro: canUsePro
                }
            });

            if (response.success) {
                this.showNotification('用户创建成功', 'success');
                this.closeModal();
                this.loadUsers();
            } else {
                this.showNotification(response.message, 'error');
            }
        } catch (error) {
            this.showNotification(error.message, 'error');
        }
    }

    // API密钥管理增强功能
    showAddApiKeyModal() {
        const modalContent = `
            <h2>添加API密钥</h2>
            <form id="addApiKeyForm">
                <div class="form-group">
                    <label for="newKeyName">密钥名称</label>
                    <input type="text" id="newKeyName" required>
                </div>
                <div class="form-group">
                    <label for="newApiKey">API密钥</label>
                    <input type="text" id="newApiKey" required>
                </div>
                <div class="form-group">
                    <label for="newKeyProLimit">Pro限制 (每分钟)</label>
                    <input type="number" id="newKeyProLimit" value="10" min="1" max="100" required>
                </div>
                <div class="checkbox-group">
                    <label>
                        <input type="checkbox" id="newKeyActive" checked>
                        启用此API密钥
                    </label>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-secondary" onclick="app.closeModal()">取消</button>
                    <button type="submit" class="btn-primary">添加</button>
                </div>
            </form>
        `;

        this.showModal(modalContent);

        document.getElementById('addApiKeyForm').onsubmit = (e) => {
            e.preventDefault();
            this.createApiKey();
        };
    }

    async createApiKey() {
        const name = document.getElementById('newKeyName').value.trim();
        const apiKey = document.getElementById('newApiKey').value.trim();
        const proLimit = parseInt(document.getElementById('newKeyProLimit').value);
        const isActive = document.getElementById('newKeyActive').checked;

        if (!name || !apiKey) {
            this.showNotification('请填写所有必填字段', 'error');
            return;
        }

        try {
            const response = await this.apiCall('/admin/api-keys', {
                method: 'POST',
                body: {
                    name,
                    api_key: apiKey,
                    pro_rate_limit: proLimit,
                    is_active: isActive ? 1 : 0
                }
            });

            if (response.success) {
                this.showNotification('API密钥添加成功', 'success');
                this.closeModal();
                this.loadApiKeys();
            } else {
                this.showNotification(response.message, 'error');
            }
        } catch (error) {
            this.showNotification(error.message, 'error');
        }
    }

    // 显示图片预览
    showImagePreview(imageUrl, imageName) {
        // 创建或获取预览模态框
        let previewModal = document.getElementById('imagePreviewModal');

        if (!previewModal) {
            // 如果不存在，创建模态框
            previewModal = document.createElement('div');
            previewModal.id = 'imagePreviewModal';
            previewModal.className = 'image-preview-modal';
            previewModal.innerHTML = `
                <div class="image-preview-overlay" onclick="app.closeImagePreview()"></div>
                <div class="image-preview-container">
                    <button class="image-preview-close" onclick="app.closeImagePreview()">
                        <i class="fas fa-times"></i>
                    </button>
                    <div class="image-preview-content">
                        <img id="previewImage" src="" alt="">
                        <div class="image-preview-info">
                            <i class="fas fa-image"></i>
                            <span id="previewImageName"></span>
                        </div>
                    </div>
                    <div class="image-preview-actions">
                        <a id="downloadImageBtn" href="" download="" class="btn-icon" title="下载图片">
                            <i class="fas fa-download"></i>
                        </a>
                    </div>
                </div>
            `;
            document.body.appendChild(previewModal);

            // 添加 ESC 键关闭
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && previewModal.classList.contains('active')) {
                    this.closeImagePreview();
                }
            });
        }

        // 更新图片信息
        const previewImage = document.getElementById('previewImage');
        const previewImageName = document.getElementById('previewImageName');
        const downloadBtn = document.getElementById('downloadImageBtn');

        previewImage.src = imageUrl;
        previewImage.alt = imageName;
        previewImageName.textContent = imageName;
        downloadBtn.href = imageUrl;
        downloadBtn.download = imageName;

        // 显示模态框
        previewModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // 防止背景滚动

        // 添加淡入动画
        setTimeout(() => {
            previewModal.classList.add('loaded');
        }, 10);
    }

    // 关闭图片预览
    closeImagePreview() {
        const previewModal = document.getElementById('imagePreviewModal');
        if (previewModal) {
            previewModal.classList.remove('loaded');
            setTimeout(() => {
                previewModal.classList.remove('active');
                document.body.style.overflow = ''; // 恢复滚动
            }, 300);
        }
    }

    // 删除聊天会话
    async deleteSession(sessionId) {
        if (!confirm('确定要删除这个对话吗？删除后无法恢复。')) {
            return;
        }

        // 立即从列表中移除会话项
        const sessionItem = document.querySelector(`[data-session-id="${sessionId}"]`);
        if (sessionItem) {
            sessionItem.style.opacity = '0.5';
            sessionItem.style.pointerEvents = 'none';

            // 添加加载状态
            const actionsDiv = sessionItem.querySelector('.session-item-actions');
            if (actionsDiv) {
                actionsDiv.innerHTML = '<div class="session-loading"><i class="fas fa-spinner fa-spin"></i></div>';
            }
        }

        // 如果删除的是当前选中的会话，立即清空聊天区域
        if (this.currentSession && this.currentSession.id == sessionId) {
            this.currentSession = null;
            document.getElementById('currentSessionTitle').textContent = '选择或创建新对话';
            document.getElementById('editTitleBtn').style.display = 'none';
            document.getElementById('chatMessages').innerHTML = `
                <div class="welcome-message">
                    <div class="welcome-icon">
                        <i class="fas fa-robot"></i>
                    </div>
                    <h3>欢迎使用 WawaCloud AI 聊天助手</h3>
                    <p>我是娃娃团队旗下基于googleGemini训练开发的Ai助手</p>
                    <p>我可以帮助您解答问题、分析图片、处理文档等。开始新对话吧！</p>
                    <div class="feature-list">
                        <div class="feature-item">
                            <i class="fas fa-image"></i>
                            <span>图片分析</span>
                        </div>
                        <div class="feature-item">
                            <i class="fas fa-search"></i>
                            <span>网络搜索</span>
                        </div>
                        <div class="feature-item">
                            <i class="fas fa-brain"></i>
                            <span>智能推理</span>
                        </div>
                        <div class="feature-item">
                            <i class="fas fa-file-alt"></i>
                            <span>文档处理</span>
                        </div>
                    </div>
                </div>
            `;
        }

        try {
            const response = await this.apiCall('/chat/sessions', {
                method: 'DELETE',
                body: { session_id: sessionId }
            });

            if (response.success) {
                this.showNotification('对话删除成功', 'success');

                // 从列表中移除会话项
                if (sessionItem) {
                    sessionItem.style.transform = 'translateX(-100%)';
                    setTimeout(() => {
                        sessionItem.remove();
                    }, 300);
                }
            } else {
                // 删除失败，恢复项目状态
                if (sessionItem) {
                    sessionItem.style.opacity = '1';
                    sessionItem.style.pointerEvents = 'auto';
                    const actionsDiv = sessionItem.querySelector('.session-item-actions');
                    if (actionsDiv) {
                        actionsDiv.innerHTML = `
                            <button class="session-delete-btn" onclick="event.stopPropagation(); app.deleteSession(${sessionId});" title="删除">
                                <i class="fas fa-trash"></i>
                            </button>
                        `;
                    }
                }
                this.showNotification(response.message || '删除失败', 'error');
            }
        } catch (error) {
            // 删除失败，恢复项目状态
            if (sessionItem) {
                sessionItem.style.opacity = '1';
                sessionItem.style.pointerEvents = 'auto';
                const actionsDiv = sessionItem.querySelector('.session-item-actions');
                if (actionsDiv) {
                    actionsDiv.innerHTML = `
                        <button class="session-delete-btn" onclick="event.stopPropagation(); app.deleteSession(${sessionId});" title="删除">
                            <i class="fas fa-trash"></i>
                        </button>
                    `;
                }
            }
            this.showNotification('删除对话失败', 'error');
        }
    }

    // 显示管理员个人资料修改模态框
    showAdminProfileModal() {
        const content = `
            <div class="modal-header">
                <h3>修改个人资料</h3>
                <button class="modal-close" onclick="app.closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                <form id="adminProfileForm" onsubmit="app.updateAdminProfile(event)">
                    <div class="form-group">
                        <label for="adminUsername">用户名</label>
                        <input type="text" id="adminUsername" value="${this.currentUser.username}" required>
                    </div>
                    <div class="form-group">
                        <label for="adminCurrentPassword">当前密码</label>
                        <input type="password" id="adminCurrentPassword" required>
                    </div>
                    <div class="form-group">
                        <label for="adminNewPassword">新密码（留空则不修改）</label>
                        <input type="password" id="adminNewPassword">
                    </div>
                    <div class="form-group">
                        <label for="adminConfirmPassword">确认新密码</label>
                        <input type="password" id="adminConfirmPassword">
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="app.closeModal()">取消</button>
                        <button type="submit" class="btn btn-primary">保存</button>
                    </div>
                </form>
            </div>
        `;
        this.showModal(content);
    }

    // 更新管理员个人资料
    async updateAdminProfile(e) {
        e.preventDefault();

        const username = document.getElementById('adminUsername').value.trim();
        const currentPassword = document.getElementById('adminCurrentPassword').value;
        const newPassword = document.getElementById('adminNewPassword').value;
        const confirmPassword = document.getElementById('adminConfirmPassword').value;

        if (!username || !currentPassword) {
            this.showNotification('请填写用户名和当前密码', 'error');
            return;
        }

        if (newPassword && newPassword !== confirmPassword) {
            this.showNotification('新密码和确认密码不匹配', 'error');
            return;
        }

        try {
            const response = await this.apiCall('/admin/profile/update', {
                method: 'POST',
                body: {
                    username,
                    current_password: currentPassword,
                    new_password: newPassword || null
                }
            });

            if (response.success) {
                this.showNotification('个人资料更新成功', 'success');
                this.closeModal();
                // 更新当前用户信息
                this.currentUser.username = username;
            } else {
                this.showNotification(response.message, 'error');
            }
        } catch (error) {
            this.showNotification('更新个人资料失败', 'error');
        }
    }

    // 移动端输入法自适应
    initMobileInputAdaptation() {
        const messageInput = document.getElementById('messageInput');
        const chatInputContainer = document.querySelector('.chat-input-container');
        const chatMessages = document.getElementById('chatMessages');

        if (!messageInput || !chatInputContainer || !chatMessages) return;

        // 检测是否为移动设备
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
            window.innerWidth <= 768;

        if (!isMobile) return;

        let isKeyboardOpen = false;
        let originalViewportHeight = window.innerHeight;
        let adaptTimeout = null;
        let blurTimeout = null;
        let isSendingMessage = false;

        // 根据屏幕尺寸调整阈值和延迟
        const getAdaptationConfig = () => {
            const screenHeight = window.innerHeight;
            if (screenHeight >= 900) {
                // 大屏手机 (如 430*932)
                return {
                    heightThreshold: 200,
                    adaptDelay: 150,
                    blurDelay: 500,
                    focusDelay: 400
                };
            } else if (screenHeight >= 700) {
                // 中等屏幕
                return {
                    heightThreshold: 150,
                    adaptDelay: 100,
                    blurDelay: 300,
                    focusDelay: 300
                };
            } else {
                // 小屏手机
                return {
                    heightThreshold: 100,
                    adaptDelay: 50,
                    blurDelay: 200,
                    focusDelay: 200
                };
            }
        };

        // 监听视口高度变化（输入法弹出/收起）
        const handleViewportChange = () => {
            // 清除之前的定时器
            if (adaptTimeout) {
                clearTimeout(adaptTimeout);
            }
            
            const config = getAdaptationConfig();
            
            // 延迟执行，避免频繁调用
            adaptTimeout = setTimeout(() => {
                const currentHeight = window.innerHeight;
                const heightDifference = originalViewportHeight - currentHeight;

                // 如果高度减少超过阈值，认为输入法已弹出
                if (heightDifference > config.heightThreshold) {
                    if (!isKeyboardOpen) {
                        isKeyboardOpen = true;
                        this.adaptToKeyboard(true);
                    }
                } else {
                    if (isKeyboardOpen) {
                        isKeyboardOpen = false;
                        this.adaptToKeyboard(false);
                    }
                }
            }, config.adaptDelay);
        };

        // 监听输入框焦点事件
        messageInput.addEventListener('focus', () => {
            const config = getAdaptationConfig();
            // 延迟执行，等待输入法完全弹出
            setTimeout(() => {
                handleViewportChange();
            }, config.focusDelay);
        });

        messageInput.addEventListener('blur', () => {
            // 清除之前的blur定时器
            if (blurTimeout) {
                clearTimeout(blurTimeout);
            }
            
            const config = getAdaptationConfig();
            
            // 延迟执行，避免在发送消息时立即触发
            blurTimeout = setTimeout(() => {
                // 如果正在发送消息，延迟更长时间
                if (isSendingMessage) {
                    setTimeout(() => {
                        isKeyboardOpen = false;
                        this.adaptToKeyboard(false);
                    }, 1000);
                } else {
                    isKeyboardOpen = false;
                    this.adaptToKeyboard(false);
                }
            }, config.blurDelay);
        });

        // 监听发送按钮点击，标记正在发送消息
        const sendBtn = document.getElementById('sendBtn');
        if (sendBtn) {
            sendBtn.addEventListener('click', () => {
                isSendingMessage = true;
                // 2秒后重置状态
                setTimeout(() => {
                    isSendingMessage = false;
                }, 2000);
            });
        }

        // 监听Enter键，标记正在发送消息
        messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                isSendingMessage = true;
                // 2秒后重置状态
                setTimeout(() => {
                    isSendingMessage = false;
                }, 2000);
            }
        });

        // 监听窗口大小变化
        window.addEventListener('resize', handleViewportChange);

        // 监听视口变化（更精确的检测）
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', handleViewportChange);
        }
    }

    // 适配输入法弹出/收起
    adaptToKeyboard(isOpen) {
        const chatInputContainer = document.querySelector('.chat-input-container');
        const chatMessages = document.getElementById('chatMessages');
        const mainChat = document.querySelector('.main-chat');
        const chatHeader = document.querySelector('.chat-header-new');

        if (!chatInputContainer || !chatMessages || !mainChat) return;

        // 根据屏幕尺寸调整适配参数
        const screenHeight = window.innerHeight;
        const isLargeScreen = screenHeight >= 900;
        
        if (isOpen) {
            // 输入法弹出时的适配
            chatInputContainer.style.position = 'fixed';
            chatInputContainer.style.bottom = '0';
            chatInputContainer.style.left = '0';
            chatInputContainer.style.right = '0';
            chatInputContainer.style.zIndex = '1000';

            // 调整聊天消息区域的底部间距（根据屏幕尺寸调整）
            const inputHeight = chatInputContainer.offsetHeight;
            const extraSpace = isLargeScreen ? 60 : 40; // 大屏手机需要更多空间
            chatMessages.style.paddingBottom = `calc(${inputHeight + extraSpace}px + env(safe-area-inset-bottom))`;

            // 确保主聊天区域高度固定，防止页面变大
            mainChat.style.height = '100vh';
            mainChat.style.maxHeight = '100vh';
            mainChat.style.overflow = 'hidden';

            // 确保头部可见
            if (chatHeader) {
                chatHeader.style.position = 'sticky';
                chatHeader.style.top = '0';
                chatHeader.style.zIndex = '10';
                chatHeader.style.flexShrink = '0';
            }

            // 滚动到底部，确保最新消息可见（大屏手机延迟更长）
            const scrollDelay = isLargeScreen ? 200 : 100;
            setTimeout(() => {
                this.scrollToBottom();
            }, scrollDelay);

        } else {
            // 输入法收起时的恢复 - 使用更温和的方式
            // 先保存当前滚动位置
            const currentScrollTop = chatMessages.scrollTop;
            
            // 逐步恢复样式，避免突然变化
            chatInputContainer.style.position = '';
            chatInputContainer.style.bottom = '';
            chatInputContainer.style.left = '';
            chatInputContainer.style.right = '';
            chatInputContainer.style.zIndex = '';

            // 恢复聊天消息区域的底部间距
            chatMessages.style.paddingBottom = '';
            
            // 确保消息区域保持稳定，避免重新渲染
            chatMessages.style.minHeight = 'auto';
            
            // 在大屏手机上，添加额外的稳定性措施
            if (isLargeScreen) {
                chatMessages.style.transition = 'none';
                // 强制重排，确保样式生效
                chatMessages.offsetHeight;
                chatMessages.style.transition = '';
            }

            // 恢复主聊天区域
            mainChat.style.height = '';
            mainChat.style.maxHeight = '';
            mainChat.style.overflow = '';

            // 恢复头部样式
            if (chatHeader) {
                chatHeader.style.position = '';
                chatHeader.style.top = '';
                chatHeader.style.zIndex = '';
                chatHeader.style.flexShrink = '';
            }

            // 恢复滚动位置，避免消息跳动
            setTimeout(() => {
                chatMessages.scrollTop = currentScrollTop;
            }, 50);

            // 防止页面缩放
            this.preventPageZoom();
        }
    }

    // 防止页面缩放
    preventPageZoom() {
        // 重置视口缩放
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
        }

        // 强制重置页面大小
        setTimeout(() => {
            document.body.style.zoom = '1';
            document.documentElement.style.zoom = '1';
        }, 100);
    }

    // 登录页面输入法自适应
    initLoginInputAdaptation() {
        const loginInputs = document.querySelectorAll('#loginUsername, #loginPassword, #registerUsername, #registerEmail, #registerPassword, #registerConfirmPassword');
        const loginContainer = document.querySelector('.login-container');
        const loginBox = document.querySelector('.login-box');

        if (!loginInputs.length || !loginContainer || !loginBox) return;

        // 检测是否为移动设备
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
            window.innerWidth <= 768;

        if (!isMobile) return;

        let isKeyboardOpen = false;
        let originalViewportHeight = window.innerHeight;

        // 监听视口高度变化（输入法弹出/收起）
        const handleViewportChange = () => {
            const currentHeight = window.innerHeight;
            const heightDifference = originalViewportHeight - currentHeight;

            // 如果高度减少超过150px，认为输入法已弹出
            if (heightDifference > 150) {
                if (!isKeyboardOpen) {
                    isKeyboardOpen = true;
                    this.adaptLoginToKeyboard(true, loginContainer, loginBox);
                }
            } else {
                if (isKeyboardOpen) {
                    isKeyboardOpen = false;
                    this.adaptLoginToKeyboard(false, loginContainer, loginBox);
                }
            }
        };

        // 为所有登录输入框添加事件监听
        loginInputs.forEach(input => {
            input.addEventListener('focus', () => {
                // 延迟执行，等待输入法完全弹出
                setTimeout(() => {
                    handleViewportChange();
                }, 300);
            });

            input.addEventListener('blur', () => {
                isKeyboardOpen = false;
                this.adaptLoginToKeyboard(false, loginContainer, loginBox);
            });
        });

        // 监听窗口大小变化
        window.addEventListener('resize', handleViewportChange);

        // 监听视口变化（更精确的检测）
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', handleViewportChange);
        }
    }

    // 适配登录页面输入法弹出/收起
    adaptLoginToKeyboard(isOpen, loginContainer, loginBox) {
        if (!loginContainer || !loginBox) return;

        if (isOpen) {
            // 输入法弹出时的适配
            loginContainer.style.position = 'fixed';
            loginContainer.style.top = '0';
            loginContainer.style.left = '0';
            loginContainer.style.right = '0';
            loginContainer.style.bottom = '0';
            loginContainer.style.height = '100vh';
            loginContainer.style.maxHeight = '100vh';
            loginContainer.style.overflow = 'hidden';

            // 调整登录框
            loginBox.style.maxHeight = 'calc(100vh - 40px)';
            loginBox.style.overflowY = 'auto';
            loginBox.style.webkitOverflowScrolling = 'touch';

            // 滚动到当前输入框
            setTimeout(() => {
                const activeElement = document.activeElement;
                if (activeElement && activeElement.tagName === 'INPUT') {
                    activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);

        } else {
            // 输入法收起时的恢复
            loginContainer.style.position = '';
            loginContainer.style.top = '';
            loginContainer.style.left = '';
            loginContainer.style.right = '';
            loginContainer.style.bottom = '';
            loginContainer.style.height = '';
            loginContainer.style.maxHeight = '';
            loginContainer.style.overflow = '';

            // 恢复登录框
            loginBox.style.maxHeight = '';
            loginBox.style.overflowY = '';
            loginBox.style.webkitOverflowScrolling = '';

            // 防止页面缩放
            this.preventPageZoom();
        }
    }
    
    // 生成图片
    async generateImage(prompt) {
        if (!this.currentSession) {
            await this.createNewSession();
            if (!this.currentSession) return;
        }
        
        this.isLoading = true;
        this.updateSendButton();
        this.disableUserInput(true);
        
        try {
            // 添加用户请求到UI
            this.addMessageToUI({
                role: 'user',
                content: `🎨 生成图片：${prompt}`,
                created_at: new Date().toISOString()
            });
            
            // 清空输入
            const messageInput = document.getElementById('messageInput');
            messageInput.value = '';
            
            // 添加思考消息
            const thinkingMessageId = this.addThinkingMessage();
            this.scrollToBottom();
            
            // 调用图片生成API
            const response = await this.apiCall('/generate-image', {
                method: 'POST',
                body: {
                    prompt: prompt,
                    session_id: this.currentSession.id
                }
            });
            
            // 移除思考消息
            this.removeThinkingMessage(thinkingMessageId);
            
            if (response.success) {
                // 调试信息
                console.log('🎨 图片生成成功:', {
                    hasImage: !!response.image,
                    hasText: !!response.text,
                    imageLength: response.image ? response.image.length : 0,
                    textLength: response.text ? response.text.length : 0,
                    mimeType: response.mimeType,
                    responseTime: response.response_time
                });
                
                // 构建消息内容
                let messageContent = '';
                
                // 如果有文字内容，先添加文字
                if (response.text) {
                    messageContent += this.formatMessageText(response.text);
                }
                
                // 如果有图片数据，添加图片
                if (response.image) {
                    const imageHtml = `
                        <div class="generated-image">
                            <img src="data:${response.mimeType || 'image/png'};base64,${response.image}" alt="${prompt}" />
                            <p class="image-prompt">提示词：${prompt}</p>
                            <p class="image-time">生成时间：${response.response_time.toFixed(2)}秒</p>
                        </div>
                    `;
                    messageContent += imageHtml;
                }
                
                // 如果既没有文字也没有图片，显示错误
                if (!response.text && !response.image) {
                    this.showNotification('图片生成失败：没有返回内容', 'error');
                    return;
                }
                
                this.addMessageToUI({
                    role: 'assistant',
                    content: messageContent,
                    created_at: new Date().toISOString()
                });
                
                this.scrollToBottom();
                
                // 根据返回内容类型显示不同的成功消息
                if (response.text && response.image) {
                    this.showNotification('文字和图片生成成功！', 'success');
                } else if (response.text) {
                    this.showNotification('文字生成成功！', 'success');
                } else if (response.image) {
                    this.showNotification('图片生成成功！', 'success');
                }
                
                // 更新会话列表
                setTimeout(() => {
                    if (this.isMobile) {
                        this.updateSessionListOnly();
                    } else {
                        this.loadSessions();
                    }
                }, 1000);
            } else {//图片生成失败：' + response.error, 'error
                this.showNotification('正在开发生成图片功能中，请勿使用');
            }
        } catch (error) {//图片生成失败：' + error.message, 'error
            this.showNotification('正在开发生成图片功能中，请勿使用');
            this.removeThinkingMessage(thinkingMessageId);
        } finally {
            this.isLoading = false;
            this.updateSendButton();
            this.disableUserInput(false);
        }
    }
}

// 初始化应用
const app = new GeminiChatApp();
