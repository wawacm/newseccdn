/**
 * 匿名用户本地存储管理
 * 使用LocalStorage保存匿名用户的会话和消息
 */

class AnonymousStorage {
    constructor() {
        this.SESSIONS_KEY = 'anonymous_sessions';
        this.MESSAGES_PREFIX = 'anonymous_messages_';
        this.CURRENT_SESSION_KEY = 'anonymous_current_session';
    }
    
    /**
     * 检查是否为匿名用户
     */
    isAnonymous() {
        return !this.getCurrentUser();
    }
    
    /**
     * 获取当前用户（从app中获取）
     */
    getCurrentUser() {
        if (typeof app !== 'undefined' && app.currentUser) {
            return app.currentUser;
        }
        return null;
    }
    
    /**
     * 生成唯一会话ID
     */
    generateSessionId() {
        return 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    /**
     * 获取所有会话
     */
    getSessions() {
        if (!this.isAnonymous()) return [];
        
        try {
            const sessionsJson = localStorage.getItem(this.SESSIONS_KEY);
            if (!sessionsJson) return [];
            
            const sessions = JSON.parse(sessionsJson);
            // 按更新时间倒序排序
            return sessions.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        } catch (error) {
            console.error('获取本地会话失败:', error);
            return [];
        }
    }
    
    /**
     * 创建新会话
     */
    createSession(title = '新对话') {
        if (!this.isAnonymous()) return null;
        
        const session = {
            id: this.generateSessionId(),
            title: title,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            message_count: 0
        };
        
        const sessions = this.getSessions();
        sessions.unshift(session);
        
        try {
            localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(sessions));
            localStorage.setItem(this.CURRENT_SESSION_KEY, session.id);
            console.log('✅ 创建本地会话成功:', session.id);
            return session;
        } catch (error) {
            console.error('❌ 创建本地会话失败:', error);
            return null;
        }
    }
    
    /**
     * 获取会话详情
     */
    getSession(sessionId) {
        if (!this.isAnonymous()) return null;
        
        const sessions = this.getSessions();
        return sessions.find(s => s.id === sessionId);
    }
    
    /**
     * 更新会话
     */
    updateSession(sessionId, updates) {
        if (!this.isAnonymous()) return false;
        
        const sessions = this.getSessions();
        const index = sessions.findIndex(s => s.id === sessionId);
        
        if (index === -1) return false;
        
        sessions[index] = {
            ...sessions[index],
            ...updates,
            updated_at: new Date().toISOString()
        };
        
        try {
            localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(sessions));
            return true;
        } catch (error) {
            console.error('更新本地会话失败:', error);
            return false;
        }
    }
    
    /**
     * 删除会话
     */
    deleteSession(sessionId) {
        if (!this.isAnonymous()) return false;
        
        let sessions = this.getSessions();
        sessions = sessions.filter(s => s.id !== sessionId);
        
        try {
            localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(sessions));
            // 删除消息
            localStorage.removeItem(this.MESSAGES_PREFIX + sessionId);
            
            // 如果删除的是当前会话，清除当前会话标记
            const currentSessionId = localStorage.getItem(this.CURRENT_SESSION_KEY);
            if (currentSessionId === sessionId) {
                localStorage.removeItem(this.CURRENT_SESSION_KEY);
            }
            
            return true;
        } catch (error) {
            console.error('删除本地会话失败:', error);
            return false;
        }
    }
    
    /**
     * 获取会话的所有消息
     */
    getMessages(sessionId) {
        if (!this.isAnonymous()) return [];
        
        try {
            const messagesJson = localStorage.getItem(this.MESSAGES_PREFIX + sessionId);
            if (!messagesJson) return [];
            
            return JSON.parse(messagesJson);
        } catch (error) {
            console.error('获取本地消息失败:', error);
            return [];
        }
    }
    
    /**
     * 添加消息
     */
    addMessage(sessionId, message) {
        if (!this.isAnonymous()) return false;
        
        const messages = this.getMessages(sessionId);
        
        // 添加时间戳（如果没有）
        if (!message.created_at) {
            message.created_at = new Date().toISOString();
        }
        
        // 添加唯一ID（如果没有）
        if (!message.id) {
            message.id = 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }
        
        messages.push(message);
        
        try {
            // 保存消息
            localStorage.setItem(this.MESSAGES_PREFIX + sessionId, JSON.stringify(messages));
            
            // 更新会话的消息数和最后消息
            this.updateSession(sessionId, {
                message_count: messages.length,
                last_message: message.content ? message.content.substring(0, 100) : ''
            });
            
            return true;
        } catch (error) {
            console.error('保存本地消息失败:', error);
            
            // 如果LocalStorage满了，尝试清理旧消息
            if (error.name === 'QuotaExceededError') {
                console.warn('⚠️ LocalStorage空间不足，尝试清理...');
                this.cleanupOldMessages();
                // 重试一次
                try {
                    localStorage.setItem(this.MESSAGES_PREFIX + sessionId, JSON.stringify(messages));
                    return true;
                } catch (retryError) {
                    console.error('重试保存失败:', retryError);
                    return false;
                }
            }
            
            return false;
        }
    }
    
    /**
     * 清理旧消息（保留最近的会话）
     */
    cleanupOldMessages() {
        const sessions = this.getSessions();
        
        // 只保留最近10个会话的消息
        if (sessions.length > 10) {
            const sessionsToDelete = sessions.slice(10);
            sessionsToDelete.forEach(session => {
                localStorage.removeItem(this.MESSAGES_PREFIX + session.id);
            });
            
            // 更新会话列表
            const sessionsToKeep = sessions.slice(0, 10);
            localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(sessionsToKeep));
            
            console.log(`🧹 清理了 ${sessionsToDelete.length} 个旧会话`);
        }
    }
    
    /**
     * 清除所有本地数据
     */
    clearAll() {
        if (!this.isAnonymous()) return;
        
        const sessions = this.getSessions();
        sessions.forEach(session => {
            localStorage.removeItem(this.MESSAGES_PREFIX + session.id);
        });
        
        localStorage.removeItem(this.SESSIONS_KEY);
        localStorage.removeItem(this.CURRENT_SESSION_KEY);
        
        console.log('🧹 已清除所有本地会话数据');
    }
    
    /**
     * 获取当前会话ID
     */
    getCurrentSessionId() {
        if (!this.isAnonymous()) return null;
        return localStorage.getItem(this.CURRENT_SESSION_KEY);
    }
    
    /**
     * 设置当前会话ID
     */
    setCurrentSessionId(sessionId) {
        if (!this.isAnonymous()) return;
        localStorage.setItem(this.CURRENT_SESSION_KEY, sessionId);
    }
    
    /**
     * 获取存储使用情况
     */
    getStorageInfo() {
        let totalSize = 0;
        let sessionCount = 0;
        let messageCount = 0;
        
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                totalSize += localStorage[key].length + key.length;
                
                if (key === this.SESSIONS_KEY) {
                    const sessions = JSON.parse(localStorage[key]);
                    sessionCount = sessions.length;
                } else if (key.startsWith(this.MESSAGES_PREFIX)) {
                    const messages = JSON.parse(localStorage[key]);
                    messageCount += messages.length;
                }
            }
        }
        
        return {
            totalSize: totalSize,
            totalSizeKB: (totalSize / 1024).toFixed(2),
            sessionCount: sessionCount,
            messageCount: messageCount,
            percentUsed: ((totalSize / (5 * 1024 * 1024)) * 100).toFixed(2) // 假设限制为5MB
        };
    }
}

// 创建全局实例
const anonymousStorage = new AnonymousStorage();

