if(typeof AccessControl==='undefined'){class AccessControl{constructor(){this.isLoggedIn=false;this.anonymousCount=this.loadAnonymousCount();this.anonymousLimit=5;this.isApiDomain=false;this.isPublicDomain=false;this.user=null;this.modelPolicy=null;}
loadAnonymousCount(){try{const today=new Date().toDateString();const stored=localStorage.getItem('anonymous_count');if(stored){const data=JSON.parse(stored);if(data.date===today){console.log(`📊 加载今日匿名消息计数: ${data.count}`);return data.count||0;}}
console.log('📊 新的一天，重置匿名消息计数');this.saveAnonymousCount(0);return 0;}catch(error){console.error('加载匿名计数失败:',error);return 0;}}
saveAnonymousCount(count){try{const today=new Date().toDateString();localStorage.setItem('anonymous_count',JSON.stringify({date:today,count:count}));console.log(`💾 保存匿名消息计数: ${count}`);}catch(error){console.error('保存匿名计数失败:',error);}}
async checkAccess(){try{const response=await fetch('/api/auth/check-access');const data=await response.json();if(data.success){this.isLoggedIn=data.isLoggedIn;this.anonymousCount=data.count||0;this.anonymousLimit=data.limit||5;this.isApiDomain=data.isApiDomain||false;this.isPublicDomain=data.isPublicDomain||false;this.user=data.user;this.modelPolicy=data.model_policy||null;if(this.isApiDomain&&!this.isLoggedIn){return{allowed:false,requireLogin:true,message:'此API接口需要登录才能使用'};}
return{allowed:data.allowed,requireLogin:data.requireLogin||false,message:data.message||''};}
return{allowed:true,requireLogin:false,message:''};}catch(error){console.error('检查访问权限失败:',error);this.modelPolicy=null;return{allowed:true,requireLogin:false,message:''};}}
showAnonymousStatus(){if(this.isLoggedIn){return '';}
const remaining=this.anonymousLimit-this.anonymousCount;if(remaining<=0){return '已达到免费限制，请登录继续使用';}
return `剩余 ${remaining}/${this.anonymousLimit} 条免费消息`;}
canSendMessage(){if(this.isLoggedIn){return{allowed:true,message:''};}
if(this.isApiDomain){return{allowed:false,requireLogin:true,message:'此API接口需要登录才能使用'};}
if(this.anonymousCount>=this.anonymousLimit){return{allowed:false,requireLogin:true,message:`您已达到免费消息限制（${this.anonymousLimit}条），请登录以继续使用`};}
return{allowed:true,message:''};}
canUsePro(){if(!this.isLoggedIn){return{allowed:false,requireLogin:true,message:'需要登录才能使用Pro模型'};}
if(!this.user||!this.user.can_use_pro){return{allowed:false,requireLogin:false,message:'您没有Pro访问权限'};}
return{allowed:true,message:''};}
updateCount(count){this.anonymousCount=count;if(!this.isLoggedIn){this.saveAnonymousCount(count);}}
incrementCount(){this.anonymousCount++;if(!this.isLoggedIn){this.saveAnonymousCount(this.anonymousCount);}
console.log(`📈 匿名消息计数增加: ${this.anonymousCount}/${this.anonymousLimit}`);}
decrementCount(){if(this.anonymousCount>0){this.anonymousCount--;if(!this.isLoggedIn){this.saveAnonymousCount(this.anonymousCount);}
console.log(`📉 匿名消息计数回滚: ${this.anonymousCount}/${this.anonymousLimit}`);}}
showLoginPrompt(message){if(confirm(message+'\n\n是否现在登录？')){this.showLoginPage();}}
showLoginPage(){window.location.reload();}}
if(typeof window!=='undefined'&&typeof window.AccessControl==='undefined'){window.AccessControl=AccessControl;}}
const anonymousStorage={STORAGE_KEY:'wawa_anonymous_sessions',MAX_SESSIONS:10,getSessions(){try{const data=localStorage.getItem(this.STORAGE_KEY);if(data){const sessions=JSON.parse(data);return sessions.sort((a,b)=>new Date(b.updated_at||b.created_at)-new Date(a.updated_at||a.created_at));}}catch(e){console.error('读取会话失败:',e);}
return[];},saveSessions(sessions){try{localStorage.setItem(this.STORAGE_KEY,JSON.stringify(sessions));}catch(e){console.error('保存会话失败:',e);this.cleanupOldSessions();}},createSession(title='新对话'){const sessions=this.getSessions();const now=new Date().toISOString();const session={id:'anon_'+Date.now()+'_'+Math.random().toString(36).substr(2,9),title:title,icon_type:'chat',created_at:now,updated_at:now,messages:[]};sessions.unshift(session);while(sessions.length>this.MAX_SESSIONS){sessions.pop();}
this.saveSessions(sessions);return session;},getSession(sessionId){const sessions=this.getSessions();return sessions.find(s=>s.id===sessionId)||null;},getMessages(sessionId){const session=this.getSession(sessionId);return session?(session.messages||[]):[];},addMessage(sessionId,message){const sessions=this.getSessions();const session=sessions.find(s=>s.id===sessionId);if(session){if(!session.messages){session.messages=[];}
message.id=message.id||Date.now();message.created_at=message.created_at||new Date().toISOString();session.messages.push(message);session.updated_at=new Date().toISOString();this.saveSessions(sessions);}},updateSessionMeta(sessionId,title,iconType){const sessions=this.getSessions();const session=sessions.find(s=>s.id===sessionId);if(session){if(title)session.title=title;if(iconType)session.icon_type=iconType;session.updated_at=new Date().toISOString();this.saveSessions(sessions);}},updateSession(sessionId,data){const sessions=this.getSessions();const session=sessions.find(s=>s.id===sessionId);if(session){Object.assign(session,data);session.updated_at=new Date().toISOString();this.saveSessions(sessions);}},deleteSession(sessionId){const sessions=this.getSessions();const index=sessions.findIndex(s=>s.id===sessionId);if(index!==-1){sessions.splice(index,1);this.saveSessions(sessions);return true;}
return false;},cleanupOldSessions(){const sessions=this.getSessions();while(sessions.length>this.MAX_SESSIONS/2){sessions.pop();}
this.saveSessions(sessions);},clearAll(){localStorage.removeItem(this.STORAGE_KEY);},getStorageInfo(){const data=localStorage.getItem(this.STORAGE_KEY)||'';const sessions=this.getSessions();return{sessionsCount:sessions.length,totalMessages:sessions.reduce((sum,s)=>sum+(s.messages?.length||0),0),storageSize:new Blob([data]).size};}};if(typeof window!=='undefined'){window.anonymousStorage=anonymousStorage;}