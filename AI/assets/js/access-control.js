/**
 * 访问控制和匿名用户管理
 */

// 避免重复声明
if (typeof AccessControl === 'undefined') {
class AccessControl {
    constructor() {
        this.isLoggedIn = false;
        this.anonymousCount = this.loadAnonymousCount();
        this.anonymousLimit = 5;
        this.isApiDomain = false;
        this.isPublicDomain = false;
        this.user = null;
    }
    
    /**
     * 从localStorage加载匿名用户计数
     */
    loadAnonymousCount() {
        try {
            const today = new Date().toDateString();
            const stored = localStorage.getItem('anonymous_count');
            if (stored) {
                const data = JSON.parse(stored);
                // 检查是否是今天的数据
                if (data.date === today) {
                    console.log(`📊 加载今日匿名消息计数: ${data.count}`);
                    return data.count || 0;
                }
            }
            // 新的一天，重置计数
            console.log('📊 新的一天，重置匿名消息计数');
            this.saveAnonymousCount(0);
            return 0;
        } catch (error) {
            console.error('加载匿名计数失败:', error);
            return 0;
        }
    }
    
    /**
     * 保存匿名用户计数到localStorage
     */
    saveAnonymousCount(count) {
        try {
            const today = new Date().toDateString();
            localStorage.setItem('anonymous_count', JSON.stringify({
                date: today,
                count: count
            }));
            console.log(`💾 保存匿名消息计数: ${count}`);
        } catch (error) {
            console.error('保存匿名计数失败:', error);
        }
    }
    
    /**
     * 检查访问权限
     */
    async checkAccess() {
        try {
            const response = await fetch('/api/auth/check-access');
            const data = await response.json();
            
            if (data.success) {
                this.isLoggedIn = data.isLoggedIn;
                this.anonymousCount = data.count || 0;
                this.anonymousLimit = data.limit || 5;
                this.isApiDomain = data.isApiDomain || false;
                this.isPublicDomain = data.isPublicDomain || false;
                this.user = data.user;
                
                // 如果是API域名且未登录，强制显示登录页面
                if (this.isApiDomain && !this.isLoggedIn) {
                    return {
                        allowed: false,
                        requireLogin: true,
                        message: '此API接口需要登录才能使用'
                    };
                }
                
                return {
                    allowed: data.allowed,
                    requireLogin: data.requireLogin || false,
                    message: data.message || ''
                };
            }
            
            return {
                allowed: true,
                requireLogin: false,
                message: ''
            };
        } catch (error) {
            console.error('检查访问权限失败:', error);
            return {
                allowed: true,
                requireLogin: false,
                message: ''
            };
        }
    }
    
    /**
     * 显示匿名用户状态
     */
    showAnonymousStatus() {
        if (this.isLoggedIn) {
            return '';
        }
        
        const remaining = this.anonymousLimit - this.anonymousCount;
        if (remaining <= 0) {
            return '已达到免费限制，请登录继续使用';
        }
        
        return `剩余 ${remaining}/${this.anonymousLimit} 条免费消息`;
    }
    
    /**
     * 检查是否可以发送消息
     */
    canSendMessage() {
        if (this.isLoggedIn) {
            return { allowed: true, message: '' };
        }
        
        if (this.isApiDomain) {
            return {
                allowed: false,
                requireLogin: true,
                message: '此API接口需要登录才能使用'
            };
        }
        
        if (this.anonymousCount >= this.anonymousLimit) {
            return {
                allowed: false,
                requireLogin: true,
                message: `您已达到免费消息限制（${this.anonymousLimit}条），请登录以继续使用`
            };
        }
        
        return { allowed: true, message: '' };
    }
    
    /**
     * 检查是否可以使用Pro模型
     */
    canUsePro() {
        if (!this.isLoggedIn) {
            return {
                allowed: false,
                requireLogin: true,
                message: '需要登录才能使用Pro模型'
            };
        }
        
        if (!this.user || !this.user.can_use_pro) {
            return {
                allowed: false,
                requireLogin: false,
                message: '您没有Pro访问权限'
            };
        }
        
        return { allowed: true, message: '' };
    }
    
    /**
     * 更新消息计数
     */
    updateCount(count) {
        this.anonymousCount = count;
        if (!this.isLoggedIn) {
            this.saveAnonymousCount(count);
        }
    }
    
    /**
     * 增加消息计数（用于发送消息前预先增加）
     */
    incrementCount() {
        this.anonymousCount++;
        if (!this.isLoggedIn) {
            this.saveAnonymousCount(this.anonymousCount);
        }
        console.log(`📈 匿名消息计数增加: ${this.anonymousCount}/${this.anonymousLimit}`);
    }
    
    /**
     * 减少消息计数（用于发送失败时回滚）
     */
    decrementCount() {
        if (this.anonymousCount > 0) {
            this.anonymousCount--;
            if (!this.isLoggedIn) {
                this.saveAnonymousCount(this.anonymousCount);
            }
            console.log(`📉 匿名消息计数回滚: ${this.anonymousCount}/${this.anonymousLimit}`);
        }
    }
    
    /**
     * 显示登录提示对话框
     */
    showLoginPrompt(message) {
        if (confirm(message + '\n\n是否现在登录？')) {
            // 显示登录页面
            this.showLoginPage();
        }
    }
    
    /**
     * 显示登录页面
     */
    showLoginPage() {
        // 这个方法会被app.js中的相应方法覆盖
        window.location.reload();
    }
}

// 导出为全局变量
if (typeof window !== 'undefined' && typeof window.AccessControl === 'undefined') {
    window.AccessControl = AccessControl;
}
} // 结束 if (typeof AccessControl === 'undefined')

