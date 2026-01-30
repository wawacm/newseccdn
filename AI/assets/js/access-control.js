class AccessControl{constructor(){this.isLoggedIn=false;this.anonymousCount=0;this.anonymousLimit=5;this.isApiDomain=false;this.isPublicDomain=false;this.user=null;}
async checkAccess(){try{const response=await fetch('/api/auth/check-access');const data=await response.json();if(data.success){this.isLoggedIn=data.isLoggedIn;this.anonymousCount=data.count||0;this.anonymousLimit=data.limit||5;this.isApiDomain=data.isApiDomain||false;this.isPublicDomain=data.isPublicDomain||false;this.user=data.user;if(this.isApiDomain&&!this.isLoggedIn){return{allowed:false,requireLogin:true,message:'此API接口需要登录才能使用'};}
return{allowed:data.allowed,requireLogin:data.requireLogin||false,message:data.message||''};}
return{allowed:true,requireLogin:false,message:''};}catch(error){console.error('检查访问权限失败:',error);return{allowed:true,requireLogin:false,message:''};}}
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
updateCount(count){this.anonymousCount=count;}
incrementCount(){this.anonymousCount++;}
decrementCount(){if(this.anonymousCount>0){this.anonymousCount--;}}
showLoginPrompt(message){if(confirm(message+'\n\n是否现在登录？')){this.showLoginPage();}}
showLoginPage(){window.location.reload();}}
window.AccessControl=AccessControl;