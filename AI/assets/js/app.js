class WAWAAIApp{constructor(){this.currentUser=null;this.currentSession=null;this.attachments=[];this.isLoading=false;this.searchAutoEnabled=false;this.batchSelectMode=false;this.selectedSessions=new Set();this.longPressTimer=null;this.sessionsOffset=0;this.sessionsLimit=20;this.sessionsHasMore=true;this.sessionsLoading=false;this.allSessions=[];this.messagesOffset=0;this.messagesLimit=10;this.messagesHasMore=true;this.messagesLoading=false;this.allMessages=[];this.accessControl=new AccessControl();this.init();}
async init(){if(window.IS_ADMIN_PAGE){this.initNotification();return;}
await this.accessControl.checkAccess();this.bindEvents();this.checkAuth();this.autoResizeTextarea();this.initMobileFeatures();this.initPasteAndDrop();this.initNotification();this.initLoginStatusCheck();this.initSearchButton();this.initImagePreview();this.initScrollPagination();document.addEventListener('keydown',(e)=>{if(e.key==='Escape'){const sidebar=document.querySelector('.sidebar');if(sidebar&&sidebar.classList.contains('mobile-open')){this.forceCloseSidebar();}}});const existingBtn=document.getElementById('emergencyCloseBtn');if(existingBtn){existingBtn.remove();}}
initNotification(){const notificationClose=document.getElementById('notificationClose');if(notificationClose){notificationClose.addEventListener('click',()=>this.hideNotification());}}
initLoginStatusCheck(){setInterval(async()=>{if(this.currentUser&&!document.getElementById('loginPage').classList.contains('active')){try{const response=await this.apiCall('/auth/user');if(!response.success){this.handleLoginExpired();}}catch(error){}}},5*60*1000);}
toggleMobileSidebar(){const sidebar=document.querySelector('.sidebar');const overlay=document.getElementById('sidebarOverlay');if(!sidebar)return;if(!overlay){const newOverlay=document.createElement('div');newOverlay.id='sidebarOverlay';newOverlay.className='sidebar-overlay';newOverlay.addEventListener('click',()=>this.closeMobileSidebar());document.body.appendChild(newOverlay);}
if(sidebar.classList.contains('mobile-open')){this.closeMobileSidebar();}else{sidebar.classList.add('mobile-open');document.getElementById('sidebarOverlay').classList.add('active');document.body.style.overflow='hidden';}}
closeMobileSidebar(){const sidebar=document.querySelector('.sidebar');const overlay=document.getElementById('sidebarOverlay');if(sidebar){sidebar.classList.remove('mobile-open');}
if(overlay){overlay.classList.remove('active');}
document.body.style.overflow='';}
bindEvents(){const loginForm=document.getElementById('loginForm');const registerForm=document.getElementById('registerForm');if(loginForm){loginForm.addEventListener('submit',(e)=>this.handleLogin(e));}
if(registerForm){registerForm.addEventListener('submit',(e)=>this.handleRegister(e));}
document.querySelectorAll('.tab-btn').forEach(btn=>{btn.addEventListener('click',(e)=>this.switchAuthTab(e));});document.getElementById('newChatBtn').addEventListener('click',()=>this.createNewSession());document.getElementById('sendBtn').addEventListener('click',()=>this.sendMessage());document.getElementById('messageInput').addEventListener('keydown',(e)=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();if(!this.isLoading){this.sendMessage();}else{this.showNotification('WaWa AI正在回复中...请稍等','warning');}}});document.getElementById('messageInput').addEventListener('input',()=>this.updateSendButton());this.initMobileInputAdaptation();this.initLoginInputAdaptation();document.getElementById('editTitleBtn').addEventListener('click',()=>this.editSessionTitle());document.getElementById('attachBtn').addEventListener('click',()=>{document.getElementById('fileInput').click();});document.getElementById('fileInput').addEventListener('change',(e)=>this.handleFileUpload(e));document.getElementById('searchToggle').addEventListener('change',(e)=>{this.handleSearchToggle(e);});const modelSelector=document.getElementById('modelSelector');if(modelSelector){modelSelector.addEventListener('change',(e)=>{this.handleModelChange(e);});}
const settingsBtn=document.getElementById('settingsBtn');if(settingsBtn){settingsBtn.addEventListener('click',()=>{window.location.href='cmofwawa.php';});}
const closeSessionModal=document.getElementById('closeSessionModal');const closeSessionModalBtn=document.getElementById('closeSessionModalBtn');if(closeSessionModal){closeSessionModal.addEventListener('click',()=>{document.getElementById('sessionDetailModal').style.display='none';});}
if(closeSessionModalBtn){closeSessionModalBtn.addEventListener('click',()=>{document.getElementById('sessionDetailModal').style.display='none';});}
const logoutBtn=document.getElementById('logoutBtn');if(logoutBtn){logoutBtn.addEventListener('click',()=>this.logout());}
const searchInput=document.getElementById('searchInput');if(searchInput){searchInput.addEventListener('input',(e)=>this.searchSessions(e.target.value));}
const modelSelect=document.getElementById('modelSelect');if(modelSelect){modelSelect.addEventListener('change',(e)=>this.updateModelDisplay(e));}
const moreOptionsBtn=document.getElementById('moreOptionsBtn');if(moreOptionsBtn){moreOptionsBtn.addEventListener('click',()=>this.toggleMobileSidebar());}
const mobileCloseBtn=document.getElementById('mobileCloseBtn');if(mobileCloseBtn){mobileCloseBtn.addEventListener('click',()=>this.forceCloseSidebar());}
const modalCloseBtn=document.querySelector('.close');if(modalCloseBtn){modalCloseBtn.addEventListener('click',()=>this.closeModal());}
const notificationCloseBtn=document.getElementById('notificationClose');if(notificationCloseBtn){notificationCloseBtn.addEventListener('click',()=>this.hideNotification());}
window.addEventListener('click',(e)=>{const modal=document.getElementById('modal');if(e.target===modal){this.closeModal();}});}
initMobileFeatures(){this.isMobile=window.innerWidth<=768;const messageInput=document.getElementById('messageInput');if(messageInput){messageInput.placeholder=this.isMobile?'输入您的消息...':'输入您的消息... (支持 Ctrl+V 粘贴图片)';}
window.addEventListener('resize',()=>{const wasMobile=this.isMobile;this.isMobile=window.innerWidth<=768;if(wasMobile!==this.isMobile){this.handleMobileToggle();const messageInput=document.getElementById('messageInput');if(messageInput&&!messageInput.disabled){messageInput.placeholder=this.isMobile?'输入您的消息...':'输入您的消息... (支持 Ctrl+V 粘贴图片)';}}});this.setupTouchOptimizations();this.initInputActionsToggle();this.initCustomDropdown();this.initParticles();this.lazyLoadLibraries();}
initInputActionsToggle(){const inputActionsToggle=document.getElementById('inputActionsToggle');const inputActions=document.getElementById('inputActions');if(!inputActionsToggle||!inputActions)return;inputActionsToggle.addEventListener('click',()=>{inputActionsToggle.classList.toggle('active');inputActions.classList.toggle('mobile-open');});document.addEventListener('click',(e)=>{if(window.innerWidth>768)return;if(!inputActionsToggle.contains(e.target)&&!inputActions.contains(e.target)){inputActionsToggle.classList.remove('active');inputActions.classList.remove('mobile-open');}});}
initCustomDropdown(){const dropdownSelected=document.getElementById('dropdownSelected');const dropdownOptions=document.getElementById('dropdownOptions');const modelSelect=document.getElementById('modelSelect');const currentModelDisplay=document.getElementById('currentModelDisplay');if(!dropdownSelected||!dropdownOptions)return;dropdownSelected.addEventListener('click',(e)=>{e.stopPropagation();dropdownSelected.classList.toggle('open');dropdownOptions.classList.toggle('open');});dropdownOptions.querySelectorAll('.dropdown-option').forEach(option=>{option.addEventListener('click',(e)=>{e.stopPropagation();const value=option.dataset.value;const text=option.textContent.split(' (')[0];dropdownSelected.querySelector('span').textContent=text;if(currentModelDisplay){currentModelDisplay.textContent=text;}
dropdownOptions.querySelectorAll('.dropdown-option').forEach(opt=>opt.classList.remove('selected'));option.classList.add('selected');if(modelSelect){modelSelect.value=value;modelSelect.dispatchEvent(new Event('change'));}
dropdownSelected.classList.remove('open');dropdownOptions.classList.remove('open');});});document.addEventListener('click',(e)=>{if(!e.target.closest('.custom-dropdown')){dropdownSelected.classList.remove('open');dropdownOptions.classList.remove('open');}});}
initParticles(){const container=document.getElementById('particlesBg');if(!container)return;const colors=['#FF6B9D','#FECA57','#48DBFB','#FF9FF3','#00FF88'];for(let i=0;i<12;i++){const particle=document.createElement('div');particle.className='particle';particle.style.left=Math.random()*100+'%';particle.style.top=Math.random()*100+'%';particle.style.width=(Math.random()*16+6)+'px';particle.style.height=particle.style.width;particle.style.backgroundColor=colors[Math.floor(Math.random()*colors.length)];particle.style.animationDelay=Math.random()*5+'s';particle.style.animationDuration=(Math.random()*10+10)+'s';container.appendChild(particle);}}
lazyLoadLibraries(){const useChinaCDN=window.IS_CHINA_CDN;const katexCSS=document.createElement('link');katexCSS.rel='stylesheet';katexCSS.href=useChinaCDN?'https://cdn.staticfile.net/KaTeX/0.16.8/katex.min.css':'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css';document.head.appendChild(katexCSS);setTimeout(()=>{const katexJS=document.createElement('script');katexJS.src=useChinaCDN?'https://cdn.staticfile.net/KaTeX/0.16.8/katex.min.js':'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js';katexJS.onload=()=>{const autoRenderJS=document.createElement('script');autoRenderJS.src=useChinaCDN?'https://cdn.staticfile.net/KaTeX/0.16.8/contrib/auto-render.min.js':'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js';document.head.appendChild(autoRenderJS);};document.head.appendChild(katexJS);const heicJS=document.createElement('script');heicJS.src=useChinaCDN?'https://cdn.staticfile.net/heic2any/0.0.4/heic2any.min.js':'https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js';document.head.appendChild(heicJS);},1000);}
toggleMobileSidebar(){const sidebar=document.querySelector('.sidebar');if(sidebar){if(sidebar.classList.contains('mobile-open')){sidebar.classList.remove('mobile-open');}else{sidebar.classList.add('mobile-open');}}}
openMobileSidebar(){const sidebar=document.querySelector('.sidebar');if(sidebar){sidebar.classList.add('mobile-open');}}
closeMobileSidebar(){const sidebar=document.querySelector('.sidebar');if(sidebar){sidebar.classList.remove('mobile-open');}}
forceCloseSidebar(){const sidebar=document.querySelector('.sidebar');if(sidebar){sidebar.classList.remove('mobile-open');sidebar.className='sidebar';sidebar.style.transform='';sidebar.style.opacity='';sidebar.style.visibility='';}}
addEmergencyCloseButton(){const oldEmergencyBtn=document.getElementById('emergencyCloseBtn');if(oldEmergencyBtn){oldEmergencyBtn.remove();}
const emergencyBtn=document.createElement('button');emergencyBtn.id='emergencyCloseBtn';emergencyBtn.innerHTML='✕ 关闭侧边栏';emergencyBtn.style.cssText=`
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
        `;emergencyBtn.addEventListener('click',(e)=>{e.stopPropagation();this.forceCloseSidebar();});document.body.appendChild(emergencyBtn);const sidebar=document.querySelector('.sidebar');if(sidebar){const observer=new MutationObserver(()=>{if(sidebar.classList.contains('mobile-open')){emergencyBtn.style.display='block';}else{emergencyBtn.style.display='none';}});observer.observe(sidebar,{attributes:true});}}
handleMobileToggle(){const sidebar=document.querySelector('.sidebar');if(!this.isMobile&&sidebar){sidebar.classList.remove('mobile-open');}}
setupTouchOptimizations(){let lastTouchEnd=0;document.addEventListener('touchend',(e)=>{const now=(new Date()).getTime();if(now-lastTouchEnd<=300){e.preventDefault();}
lastTouchEnd=now;},false);if(this.isMobile){let startX=0;let startY=0;let currentX=0;let currentY=0;document.addEventListener('touchstart',(e)=>{startX=e.touches[0].clientX;startY=e.touches[0].clientY;});document.addEventListener('touchmove',(e)=>{if(!startX||!startY)return;currentX=e.touches[0].clientX;currentY=e.touches[0].clientY;const diffX=startX-currentX;const diffY=startY-currentY;if(Math.abs(diffX)>Math.abs(diffY)){const sidebar=document.querySelector('.sidebar');if(diffX<-50&&startX<50){this.openMobileSidebar();}
else if(diffX>50&&sidebar&&sidebar.classList.contains('mobile-open')){this.closeMobileSidebar();}}});document.addEventListener('touchend',()=>{startX=0;startY=0;currentX=0;currentY=0;});}}
async checkAuth(){if(this.accessControl&&!this.accessControl.isLoggedIn&&this.accessControl.isPublicDomain&&!this.accessControl.isApiDomain){this.currentUser=null;this.showChatPage();return;}
try{const response=await this.apiCall('/auth/user');if(response.success){this.currentUser=response.user;this.showChatPage();this.loadSessions();}else{if(this.accessControl&&this.accessControl.isPublicDomain&&!this.accessControl.isApiDomain){this.currentUser=null;this.showChatPage();}else{this.showLoginPage();}}}catch(error){if(this.accessControl&&this.accessControl.isPublicDomain&&!this.accessControl.isApiDomain){this.currentUser=null;this.showChatPage();}else{this.showLoginPage();}}}
async apiCall(endpoint,options={}){const url=`api${endpoint}`;const isChatMessage=endpoint==='/chat/messages'&&options.method==='POST';const isImageGen=['/generate-image','/kolors','/wawaimage'].includes(endpoint);const timeout=isChatMessage||isImageGen?180000:15000;const config={method:'GET',headers:{'Content-Type':'application/json','Cache-Control':'no-cache, no-store, must-revalidate','Pragma':'no-cache','Expires':'0'},credentials:'same-origin',...options};if(config.body&&typeof config.body==='object'){config.body=JSON.stringify(config.body);}
const controller=new AbortController();const timeoutId=setTimeout(()=>controller.abort(),timeout);config.signal=controller.signal;try{const response=await fetch(url,config);clearTimeout(timeoutId);if(response.status===401){const isUploadRequest=endpoint==='/s4/presign'||endpoint==='/upload';const isDeleteRequest=endpoint==='/s4/delete';const isAnonymousPublicDomain=this.accessControl&&this.accessControl.isPublicDomain&&!this.accessControl.isApiDomain&&!this.currentUser;if((isUploadRequest||isDeleteRequest)&&isAnonymousPublicDomain){}else{this.handleLoginExpired();}
throw new Error('登录已过期，请重新登录');}
if(response.status===503){throw new Error('服务器繁忙，请稍后重试');}
if(response.status===504){throw new Error('请求超时，服务器响应过慢，请稍后重试');}
const contentType=response.headers.get('content-type');if(!contentType||!contentType.includes('application/json')){const text=await response.text();if(isChatMessage&&text.trim()===''){await new Promise(resolve=>setTimeout(resolve,1000));throw new Error('响应为空，请刷新页面查看消息');}
throw new Error('服务器返回了非JSON格式的响应');}
let data;try{data=await response.json();}catch(error){if(isChatMessage){throw new Error('响应解析失败，消息可能已保存，请刷新页面查看');}
throw new Error('响应不是有效的JSON格式');}
if(!response.ok){throw new Error(data.error||'请求失败');}
return data;}catch(error){clearTimeout(timeoutId);if(error.name==='AbortError'){throw new Error(`请求超时（${timeout/1000}秒），服务器响应过慢，请稍后重试`);}
if(error.message.includes('Failed to fetch')||error.message.includes('NetworkError')){throw new Error('网络连接失败，请检查网络后重试');}
throw error;}}
handleLoginExpired(){if(this.accessControl&&this.accessControl.isPublicDomain&&!this.accessControl.isApiDomain&&!this.currentUser){return;}
this.currentUser=null;this.currentSession=null;this.attachments=[];this.isLoading=false;this.clearUserData();this.resetAllUIElements();this.showNotification('登录已过期，请重新登录','warning');setTimeout(()=>{this.showLoginPage();},1500);}
showNotification(message,type='info'){const notification=document.getElementById('notification');const text=document.getElementById('notificationText');if(!notification||!text){return;}
text.textContent=message;notification.className=`notification ${type}`;notification.offsetHeight;setTimeout(()=>{notification.classList.add('show');},10);clearTimeout(this.notificationTimeout);this.notificationTimeout=setTimeout(()=>{this.hideNotification();},4000);}
hideNotification(){const notification=document.getElementById('notification');if(notification){notification.classList.remove('show');}}
showPage(pageId){document.querySelectorAll('.page').forEach(page=>{page.classList.remove('active');});document.getElementById(pageId).classList.add('active');}
showLoginPage(){window.location.href='login.php';}
showChatPage(){this.showPage('chatPage');const settingsBtn=document.getElementById('settingsBtn');if(this.currentUser){document.getElementById('currentUsername').textContent=this.currentUser.username;if(this.currentUser.is_admin){settingsBtn.style.display='flex';}else{settingsBtn.style.display='none';}
this.updateModelSelector();this.resetChatInterface();}else{document.getElementById('currentUsername').textContent='游客';if(settingsBtn){settingsBtn.style.display='none';}
this.updateModelSelector();}}
resetChatInterface(){this.currentSession=null;const currentSessionTitle=document.getElementById('currentSessionTitle');if(currentSessionTitle){currentSessionTitle.textContent='AI智能助手';}
const editTitleBtn=document.getElementById('editTitleBtn');if(editTitleBtn){editTitleBtn.style.display='none';}
this.showWelcomeMessage();const messageInput=document.getElementById('messageInput');if(messageInput){messageInput.value='';messageInput.disabled=false;messageInput.placeholder=this.isMobile?'输入您的消息...':'输入您的消息... (支持 Ctrl+V 粘贴图片)';messageInput.style.pointerEvents='auto';}
const sendBtn=document.getElementById('sendBtn');if(sendBtn){sendBtn.disabled=true;sendBtn.innerHTML='<i class="fas fa-paper-plane"></i>';}
const attachBtn=document.getElementById('attachBtn');if(attachBtn){attachBtn.disabled=false;}
this.attachments=[];this.updateAttachmentPreview();this.isLoading=false;this.removeThinkingMessage();}
updateModelSelector(){const modelSelect=document.getElementById('modelSelect');}
switchAuthTab(e){const tab=e.target.dataset.tab;document.querySelectorAll('.tab-btn').forEach(btn=>{btn.classList.remove('active');});e.target.classList.add('active');document.querySelectorAll('.auth-form').forEach(form=>{form.classList.remove('active');});document.getElementById(`${tab}Form`).classList.add('active');}
async handleLogin(e){e.preventDefault();const username=document.getElementById('loginUsername').value;const password=document.getElementById('loginPassword').value;if(!username||!password){this.showNotification('请填写用户名和密码','error');return;}
try{const response=await this.apiCall('/auth/login',{method:'POST',body:{username,password}});if(response.success){this.currentUser=response.user;this.clearUserData();this.showNotification('登录成功','success');if(response.last_login_time){setTimeout(()=>{const lastLoginTime=this.formatLastLoginTime(response.last_login_time);this.showNotification(`上次登录时间：${lastLoginTime}`,'info',5000);},1500);}
this.showChatPage();setTimeout(()=>{this.loadSessions();},100);}else{this.showNotification(response.message,'error');}}catch(error){this.showNotification(error.message,'error');}}
clearUserData(){this.currentSession=null;this.attachments=[];this.isLoading=false;const sessionList=document.getElementById('sessionList');if(sessionList){sessionList.innerHTML='';}
const chatMessages=document.getElementById('chatMessages');if(chatMessages){chatMessages.innerHTML='';}
document.querySelectorAll('[data-is-temp="true"]').forEach(item=>{item.remove();});this.removeThinkingMessage();}
async handleRegister(e){e.preventDefault();const username=document.getElementById('registerUsername').value;const email=document.getElementById('registerEmail').value;const password=document.getElementById('registerPassword').value;const confirmPassword=document.getElementById('confirmPassword').value;if(!username||!password){this.showNotification('请填写用户名和密码','error');return;}
if(password!==confirmPassword){this.showNotification('两次输入的密码不一致','error');return;}
try{const response=await this.apiCall('/auth/register',{method:'POST',body:{username,email,password}});if(response.success){this.showNotification('注册成功，请登录','success');document.querySelector('.tab-btn[data-tab="login"]').click();document.getElementById('registerForm').reset();}else{this.showNotification(response.message,'error');}}catch(error){this.showNotification(error.message,'error');}}
async logout(){try{await this.apiCall('/auth/logout');this.clearUserData();this.currentUser=null;this.resetAllUIElements();this.showNotification('已退出登录','success');this.showLoginPage();}catch(error){this.showNotification(error.message,'error');}}
resetAllUIElements(){const modelSelect=document.getElementById('modelSelect');if(modelSelect){modelSelect.value='wawa-ai-auto';}
this.updateAttachmentPreview();this.closeMobileSidebar();}
showDevelopmentNotice(featureName){this.showNotification(`🚧 ${featureName}功能正在开发中，敬请期待！`,'info');}
updateModelDisplay(e){const modelValue=e.target.value;const modelDisplayElement=document.getElementById('currentModelDisplay');if(modelDisplayElement){const modelNames={'wawa-ai-auto':'Wawa AI Auto'};modelDisplayElement.textContent=modelNames[modelValue]||'Wawa&Gemin';}}
async updateSessionListOnly(){try{const timestamp=Date.now();const response=await this.apiCall(`/chat/sessions?_t=${timestamp}`);if(response.success){this.renderSessions(response.sessions||[]);}}catch(error){}}
highlightCurrentSession(sessionId){document.querySelectorAll('.session-item').forEach(item=>{item.classList.remove('active');});const currentItem=document.querySelector(`[data-session-id="${sessionId}"]`);if(currentItem){currentItem.classList.add('active');}
this.closeMobileSidebar();if(this.isMobile){this.closeMobileSidebar();}}
async loadSessions(reset=true){if(reset){this.sessionsOffset=0;this.sessionsHasMore=true;this.allSessions=[];}
if(!this.currentUser&&typeof anonymousStorage!=='undefined'){const sessions=anonymousStorage.getSessions();this.allSessions=sessions;this.sessionsHasMore=false;this.renderSessions(sessions);return;}
try{this.sessionsLoading=true;const timestamp=Date.now();const response=await this.apiCall(`/chat/sessions?limit=${this.sessionsLimit}&offset=${this.sessionsOffset}&_t=${timestamp}`);if(response.success){const newSessions=response.sessions||[];this.sessionsHasMore=newSessions.length>=this.sessionsLimit;if(reset){this.allSessions=newSessions;}else{this.allSessions=[...this.allSessions,...newSessions];}
this.sessionsOffset+=newSessions.length;this.renderSessions(this.allSessions);}else{if(this.currentUser){this.showNotification('加载会话失败','error');}}}catch(error){if(this.currentUser){this.showNotification('加载会话失败','error');}}finally{this.sessionsLoading=false;}}
async loadMoreSessions(){if(this.sessionsLoading||!this.sessionsHasMore)return;const sessionList=document.getElementById('sessionList');const loadingIndicator=document.createElement('div');loadingIndicator.className='sessions-loading-more';loadingIndicator.innerHTML='<i class="fas fa-spinner fa-spin"></i> 加载中...';sessionList.appendChild(loadingIndicator);await this.loadSessions(false);loadingIndicator.remove();}
renderSessions(sessions){const sessionList=document.getElementById('sessionList');sessionList.innerHTML='';const oldBatchBar=document.querySelector('.batch-delete-bar');if(oldBatchBar)oldBatchBar.remove();if(!sessions||sessions.length===0){return;}
const iconConfig={'chat':{icon:'💬',color:'session-icon-purple'},'image':{icon:'🎨',color:'session-icon-cyan'},'search':{icon:'🌐',color:'session-icon-yellow'},'smart':{icon:'💡',color:'session-icon-pink'}};sessions.forEach((session,index)=>{const sessionItem=document.createElement('div');sessionItem.className='session-item';if(this.batchSelectMode){sessionItem.classList.add('batch-mode');}
sessionItem.dataset.sessionId=session.id;const isCurrentSession=this.currentSession&&this.currentSession.id==session.id;const displayTitle=isCurrentSession&&this.currentSession.title?this.currentSession.title:session.title;const displayIconType=isCurrentSession&&this.currentSession.icon_type?this.currentSession.icon_type:(session.icon_type||'chat');sessionItem.title=this.sanitizePreviewText(session.last_message||displayTitle);if(isCurrentSession){sessionItem.classList.add('active');}
if(this.selectedSessions.has(session.id)){sessionItem.classList.add('batch-selected');}
const config=iconConfig[displayIconType]||iconConfig['chat'];const icon=config.icon;const iconColor=config.color;const previewText=this.sanitizePreviewText(session.last_message||'暂无消息');const timeDisplay=this.formatSessionTime(session.updated_at||session.created_at);const isChecked=this.selectedSessions.has(session.id);sessionItem.innerHTML=`
                <div class="session-checkbox" data-session-id="${session.id}">
                    <i class="fas ${isChecked?'fa-check-circle':'fa-circle'}"></i>
                </div>
                <div class="session-icon ${iconColor}">${icon}</div>
                <div class="session-info">
                    <span class="session-title">${displayTitle}</span>
                    <span class="session-time">${timeDisplay}</span>
                </div>
                <button class="session-menu-btn" data-session-id="${session.id}">
                    <i class="fas fa-ellipsis-h"></i>
                </button>
                <!-- 会话菜单下拉框 -->
                <div class="session-dropdown" id="sessionDropdown${session.id}">
                    <div class="session-dropdown-item" data-action="rename" data-session-id="${session.id}">
                        <i class="fas fa-edit"></i>
                        <span>更名</span>
                    </div>
                    <div class="session-dropdown-item session-dropdown-danger" data-action="delete" data-session-id="${session.id}">
                        <i class="fas fa-trash"></i>
                        <span>删除</span>
                    </div>
                </div>
                <!-- 会话预览提示 -->
                <div class="session-preview">
                    <div class="session-preview-content">${previewText}</div>
                </div>
            `;this.addLongPressEvent(sessionItem,session);sessionItem.addEventListener('click',(e)=>{if(e.target.closest('.session-checkbox')){this.toggleSessionSelection(session.id);return;}
if(this.batchSelectMode){this.toggleSessionSelection(session.id);return;}
if(!e.target.closest('.session-menu-btn')&&!e.target.closest('.session-dropdown')){this.selectSession(session);}});sessionList.appendChild(sessionItem);});this.bindSessionMenuEvents();if(this.batchSelectMode){this.showBatchDeleteBar();}}
addLongPressEvent(element,session){let longPressTimer=null;const longPressDuration=500;const startPress=(e)=>{if(e.target.closest('.session-menu-btn')||e.target.closest('.session-dropdown')){return;}
longPressTimer=setTimeout(()=>{this.enterBatchSelectMode();this.toggleSessionSelection(session.id);if(navigator.vibrate){navigator.vibrate(50);}},longPressDuration);};const cancelPress=()=>{if(longPressTimer){clearTimeout(longPressTimer);longPressTimer=null;}};element.addEventListener('mousedown',startPress);element.addEventListener('mouseup',cancelPress);element.addEventListener('mouseleave',cancelPress);element.addEventListener('touchstart',startPress,{passive:true});element.addEventListener('touchend',cancelPress);element.addEventListener('touchcancel',cancelPress);element.addEventListener('touchmove',cancelPress);}
enterBatchSelectMode(){if(this.batchSelectMode)return;this.batchSelectMode=true;this.selectedSessions.clear();document.querySelectorAll('.session-item').forEach(item=>{item.classList.add('batch-mode');});this.showBatchDeleteBar();}
exitBatchSelectMode(){this.batchSelectMode=false;this.selectedSessions.clear();document.querySelectorAll('.session-item').forEach(item=>{item.classList.remove('batch-mode','batch-selected');const checkbox=item.querySelector('.session-checkbox');if(checkbox){checkbox.innerHTML='<i class="fas fa-circle"></i>';}});this.hideBatchDeleteBar();}
toggleSessionSelection(sessionId){const sessionItem=document.querySelector(`.session-item[data-session-id="${sessionId}"]`);const checkbox=sessionItem?.querySelector('.session-checkbox');if(this.selectedSessions.has(sessionId)){this.selectedSessions.delete(sessionId);sessionItem?.classList.remove('batch-selected');if(checkbox){checkbox.innerHTML='<i class="fas fa-circle"></i>';}}else{this.selectedSessions.add(sessionId);sessionItem?.classList.add('batch-selected');if(checkbox){checkbox.innerHTML='<i class="fas fa-check-circle"></i>';}}
this.updateBatchDeleteBar();}
showBatchDeleteBar(){let bar=document.querySelector('.batch-delete-bar');if(bar)bar.remove();bar=document.createElement('div');bar.className='batch-delete-bar';bar.innerHTML=`
            <button class="batch-cancel-btn" title="取消">
                <i class="fas fa-times"></i>
                <span>取消</span>
            </button>
            <span class="batch-count">已选择 0 个会话</span>
            <button class="batch-delete-btn" title="删除所选" disabled>
                <i class="fas fa-trash"></i>
                <span>删除</span>
            </button>
        `;const sidebar=document.querySelector('.sidebar');if(sidebar){sidebar.appendChild(bar);}
bar.querySelector('.batch-cancel-btn').addEventListener('click',()=>{this.exitBatchSelectMode();});bar.querySelector('.batch-delete-btn').addEventListener('click',()=>{this.batchDeleteSessions();});}
hideBatchDeleteBar(){const bar=document.querySelector('.batch-delete-bar');if(bar){bar.classList.add('hiding');setTimeout(()=>bar.remove(),300);}}
updateBatchDeleteBar(){const bar=document.querySelector('.batch-delete-bar');if(!bar)return;const count=this.selectedSessions.size;bar.querySelector('.batch-count').textContent=`已选择 ${count} 个会话`;const deleteBtn=bar.querySelector('.batch-delete-btn');deleteBtn.disabled=count===0;}
async batchDeleteSessions(){const count=this.selectedSessions.size;if(count===0)return;if(!confirm(`确定要删除选中的 ${count} 个会话吗？此操作不可恢复。`)){return;}
const sessionIds=Array.from(this.selectedSessions);let successCount=0;let failCount=0;const deleteBtn=document.querySelector('.batch-delete-btn');if(deleteBtn){deleteBtn.disabled=true;deleteBtn.innerHTML='<i class="fas fa-spinner fa-spin"></i><span>删除中...</span>';}
for(const sessionId of sessionIds){try{const response=await this.apiCall('/chat/sessions',{method:'DELETE',body:{session_id:sessionId}});if(response.success){successCount++;const sessionItem=document.querySelector(`.session-item[data-session-id="${sessionId}"]`);if(sessionItem){sessionItem.remove();}
if(this.currentSession&&this.currentSession.id==sessionId){this.currentSession=null;document.getElementById('currentSessionTitle').textContent='选择或创建新对话';document.getElementById('editTitleBtn').style.display='none';this.showWelcomeMessage();}}else{failCount++;}}catch(error){failCount++;}}
this.exitBatchSelectMode();if(failCount===0){this.showNotification(`成功删除 ${successCount} 个会话`,'success');}else{this.showNotification(`删除完成：成功 ${successCount} 个，失败 ${failCount} 个`,'warning');}}
formatSessionTime(dateStr){if(!dateStr)return '';const date=new Date(dateStr);const now=new Date();const diffMs=now-date;const diffDays=Math.floor(diffMs/(1000*60*60*24));if(diffDays===0){return `今天 ${date.getHours().toString().padStart(2,'0')}:${date.getMinutes().toString().padStart(2,'0')}`;}else if(diffDays===1){return '昨天';}else if(diffDays<7){return `${diffDays}天前`;}else{return `${date.getMonth()+1}/${date.getDate()}`;}}
async updateSessionMetaIfNeeded(message,model,response,searchChecked){if(!this.currentSession){return;}
const currentTitle=this.currentSession.title;if(currentTitle&&currentTitle!=='新对话'&&currentTitle!=='New Chat'){return;}
let iconType='chat';const actualModel=response.routed_model||response.model||model;if(actualModel&&(actualModel.includes('wawa-image')||actualModel.includes('kolors')||actualModel.includes('flux'))){iconType='image';}
else if(searchChecked){iconType='search';}
else if(response.is_auto_routed&&response.route_info&&response.route_info.score>=5){iconType='smart';}
let newTitle=message.trim();if(newTitle.length>50){newTitle=newTitle.substring(0,50)+'...';}
newTitle=newTitle.replace(/[\r\n]+/g,' ');this.currentSession.title=newTitle;this.currentSession.icon_type=iconType;const titleEl=document.getElementById('currentSessionTitle');if(titleEl){titleEl.textContent=newTitle;}
const sessionItem=document.querySelector(`.session-item[data-session-id="${this.currentSession.id}"]`);if(sessionItem){const titleEl=sessionItem.querySelector('.session-title');if(titleEl)titleEl.textContent=newTitle;const iconEl=sessionItem.querySelector('.session-icon');if(iconEl){const iconConfig={'chat':{icon:'💬',color:'session-icon-purple'},'image':{icon:'🎨',color:'session-icon-cyan'},'search':{icon:'🌐',color:'session-icon-yellow'},'smart':{icon:'💡',color:'session-icon-pink'}};const config=iconConfig[iconType]||iconConfig['chat'];iconEl.textContent=config.icon;iconEl.className='session-icon '+config.color;}}
if(this.currentUser){try{await this.apiCall('/chat/session/meta',{method:'POST',body:{session_id:this.currentSession.id,title:newTitle,icon_type:iconType}});}catch(e){console.warn('更新会话元信息失败:',e);}}else if(typeof anonymousStorage!=='undefined'){anonymousStorage.updateSessionMeta(this.currentSession.id,newTitle,iconType);}}
bindSessionMenuEvents(){document.querySelectorAll('.session-menu-btn').forEach(btn=>{btn.addEventListener('click',(e)=>{e.stopPropagation();const sessionId=btn.dataset.sessionId;const dropdown=document.getElementById('sessionDropdown'+sessionId);const sessionItem=btn.closest('.session-item');document.querySelectorAll('.session-dropdown.open').forEach(d=>{if(d!==dropdown){d.classList.remove('open');d.closest('.session-item').classList.remove('dropdown-open');}});const isOpen=dropdown.classList.toggle('open');if(isOpen){sessionItem.classList.add('dropdown-open');}else{sessionItem.classList.remove('dropdown-open');}});});document.querySelectorAll('.session-dropdown-item').forEach(item=>{item.addEventListener('click',async(e)=>{e.stopPropagation();const action=item.dataset.action;const sessionId=item.dataset.sessionId;const sessionItem=item.closest('.session-item');const sessionTitle=sessionItem.querySelector('.session-title').textContent;item.closest('.session-dropdown').classList.remove('open');sessionItem.classList.remove('dropdown-open');switch(action){case 'rename':const newName=prompt('输入新名称:',sessionTitle);if(newName&&newName.trim()!==''){await this.renameSession(sessionId,newName.trim());}
break;case 'delete':if(confirm('确定删除会话 "'+sessionTitle+'"?')){await this.deleteSession(sessionId);}
break;}});});document.addEventListener('click',(e)=>{if(!e.target.closest('.session-menu-btn')&&!e.target.closest('.session-dropdown')){document.querySelectorAll('.session-dropdown.open').forEach(d=>{d.classList.remove('open');const sessionItem=d.closest('.session-item');if(sessionItem)sessionItem.classList.remove('dropdown-open');});}});}
async renameSession(sessionId,newTitle){try{const response=await this.apiCall(`/chat/sessions/${sessionId}`,{method:'PUT',body:{title:newTitle}});if(response.success){const sessionItem=document.querySelector(`[data-session-id="${sessionId}"]`);if(sessionItem){sessionItem.querySelector('.session-title').textContent=newTitle;}
if(this.currentSession&&this.currentSession.id==sessionId){this.currentSession.title=newTitle;document.getElementById('currentSessionTitle').textContent=newTitle;}
this.showNotification('会话已重命名','success');}else{this.showNotification('重命名失败: '+(response.message||''),'error');}}catch(error){this.showNotification('重命名失败','error');}}
async createNewSession(){if(!this.currentUser&&typeof anonymousStorage!=='undefined'){const session=anonymousStorage.createSession('新对话');if(session){this.currentSession=session;this.currentSession.messages=[];document.getElementById('currentSessionTitle').textContent=session.title;const chatMessages=document.getElementById('chatMessages');if(chatMessages){chatMessages.innerHTML='';}
this.showWelcomeMessage();this.loadSessions();return;}else{this.showNotification('创建会话失败','error');return;}}
const tempSession={id:'temp-'+Date.now(),title:'新对话',messages:[],isTemp:true};this.selectSession(tempSession);this.addTempSessionToList(tempSession);const chatMessages=document.getElementById('chatMessages');if(chatMessages){chatMessages.innerHTML='';}
this.showWelcomeMessage();try{const response=await this.apiCall('/chat/sessions',{method:'POST',body:{title:'新对话'}});if(response.success){const realSession={id:response.session_id,title:response.title,messages:[]};this.currentSession=realSession;document.getElementById('currentSessionTitle').textContent=realSession.title;this.removeTempSessionFromList(tempSession.id);await this.updateSessionListOnly();this.highlightCurrentSession(realSession.id);}else{this.removeTempSessionFromList(tempSession.id);this.showNotification('创建会话失败: '+(response.message||''),'error');}}catch(error){this.removeTempSessionFromList(tempSession.id);this.showNotification('创建会话失败','error');}}
addTempSessionToList(session){const sessionList=document.getElementById('sessionList');const sessionItem=document.createElement('div');sessionItem.className='session-item active';sessionItem.dataset.sessionId=session.id;sessionItem.dataset.isTemp='true';sessionItem.title=session.title;sessionItem.innerHTML=`
            <div class="session-icon session-icon-purple">✨</div>
            <div class="session-info">
                <span class="session-title">${session.title}</span>
                <span class="session-time">刚刚</span>
            </div>
            <div class="session-loading">
                <i class="fas fa-spinner fa-spin"></i>
            </div>
            <!-- 会话预览提示 -->
            <div class="session-preview">
                <div class="session-preview-content">正在创建...</div>
            </div>
        `;sessionList.insertBefore(sessionItem,sessionList.firstChild);document.querySelectorAll('.session-item').forEach(item=>{if(item!==sessionItem){item.classList.remove('active');}});}
removeTempSessionFromList(sessionId){const sessionItem=document.querySelector(`[data-session-id="${sessionId}"]`);if(sessionItem&&sessionItem.dataset.isTemp==='true'){sessionItem.remove();}}
async selectSession(session){const previousSessionId=this.currentSession?this.currentSession.id:null;if(this.isMobile&&previousSessionId===session.id){const chatMessages=document.getElementById('chatMessages');const hasMessages=chatMessages.querySelectorAll('.message:not(.welcome-message)').length>0;if(hasMessages){this.closeMobileSidebar();return;}}
this.currentSession=session;document.getElementById('currentSessionTitle').textContent=session.title;document.getElementById('editTitleBtn').style.display='flex';document.querySelectorAll('.session-item').forEach(item=>{item.classList.remove('active');});const currentItem=document.querySelector(`[data-session-id="${session.id}"]`);if(currentItem){currentItem.classList.add('active');}
this.closeMobileSidebar();if(session.isTemp){return;}
this.showLoadingMessages();await this.loadMessages(session.id);}
async editSessionTitle(){if(!this.currentSession){this.showNotification('请先选择一个会话','error');return;}
const currentTitle=this.currentSession.title;const newTitle=prompt('请输入新的会话标题:',currentTitle);if(newTitle&&newTitle.trim()!==''&&newTitle!==currentTitle){try{const response=await this.apiCall(`/chat/session`,{method:'PUT',body:{session_id:this.currentSession.id,title:newTitle.trim()}});if(response.success){this.currentSession.title=newTitle.trim();document.getElementById('currentSessionTitle').textContent=newTitle.trim();this.loadSessions();this.showNotification('会话标题已更新','success');}else{this.showNotification(response.message||'更新标题失败','error');}}catch(error){this.showNotification('更新标题失败: '+error.message,'error');}}}
async loadMessages(sessionId,reset=true){if(reset){this.messagesOffset=0;this.messagesHasMore=true;this.allMessages=[];}
if(!this.currentUser&&typeof anonymousStorage!=='undefined'){const messages=anonymousStorage.getMessages(sessionId);this.allMessages=messages;this.messagesHasMore=false;if(messages.length>0){this.renderMessages(messages);}else{this.showWelcomeMessage();}
return;}
try{this.messagesLoading=true;const response=await this.apiCall(`/chat/messages?session_id=${sessionId}&limit=${this.messagesLimit}&offset=${this.messagesOffset}`);if(response.success){const newMessages=response.messages||[];this.messagesHasMore=newMessages.length>=this.messagesLimit;if(reset){this.allMessages=newMessages;}else{this.allMessages=[...newMessages,...this.allMessages];}
this.messagesOffset+=newMessages.length;if(this.allMessages.length>0){this.renderMessages(this.allMessages,!reset);}else{this.showWelcomeMessage();}}else{if(reset){this.showWelcomeMessage();}}}catch(error){if(this.currentUser){this.showNotification('加载消息失败','error');}
if(reset){this.showWelcomeMessage();}}finally{this.messagesLoading=false;}}
async loadMoreMessages(){if(this.messagesLoading||!this.messagesHasMore||!this.currentSession)return;const chatMessages=document.getElementById('chatMessages');const previousScrollHeight=chatMessages.scrollHeight;const loadingIndicator=document.createElement('div');loadingIndicator.className='messages-loading-more';loadingIndicator.innerHTML='<i class="fas fa-spinner fa-spin"></i> 加载历史消息...';chatMessages.insertBefore(loadingIndicator,chatMessages.firstChild);await this.loadMessages(this.currentSession.id,false);if(loadingIndicator.parentNode){loadingIndicator.remove();}
const newScrollHeight=chatMessages.scrollHeight;chatMessages.scrollTop=newScrollHeight-previousScrollHeight;}
renderMessages(messages,isPrepend=false){const chatMessages=document.getElementById('chatMessages');if(!isPrepend){chatMessages.innerHTML='';}
if(!messages||messages.length===0){this.showWelcomeMessage();return;}
if(this.messagesHasMore&&!isPrepend){const loadMoreHint=document.createElement('div');loadMoreHint.className='load-more-hint';loadMoreHint.innerHTML='<i class="fas fa-arrow-up"></i> 向上滚动加载更多历史消息';chatMessages.appendChild(loadMoreHint);}
if(isPrepend){chatMessages.innerHTML='';if(this.messagesHasMore){const loadMoreHint=document.createElement('div');loadMoreHint.className='load-more-hint';loadMoreHint.innerHTML='<i class="fas fa-arrow-up"></i> 向上滚动加载更多历史消息';chatMessages.appendChild(loadMoreHint);}}
messages.forEach(message=>{this.addMessageToUI(message);});if(!isPrepend){this.scrollToBottom();}
setTimeout(()=>{this.renderMathFormulas();},10);}
showWelcomeMessage(){const chatMessages=document.getElementById('chatMessages');chatMessages.innerHTML=`
            <div class="welcome-message" id="welcomeMessage">
                <div class="welcome-avatar">
                    <img src="https://image-1.wawacm.com/1769759354449-j2301gsk.png" alt="AI Avatar"
                        onerror="this.style.display='none'; this.parentElement.innerHTML='';">
                </div>
                <h3 class="welcome-title">娃娃AI_wawacm</h3>
                <p class="welcome-subtitle">
                    嘿！我是你的智能AI助手，融合了全球顶尖大模型！<br>
                    问我任何问题，我会用最炫的方式帮你解答！💥
                </p>

                <!-- 功能卡片 -->
                <div class="feature-grid">
                    <div class="feature-card feature-pink">
                        <i class="fas fa-image"></i>
                        <span>图片分析</span>
                    </div>
                    <div class="feature-card feature-cyan">
                        <i class="fas fa-search"></i>
                        <span>网络搜索</span>
                    </div>
                    <div class="feature-card feature-yellow">
                        <i class="fas fa-brain"></i>
                        <span>智能推理</span>
                    </div>
                    <div class="feature-card feature-purple">
                        <i class="fas fa-file-alt"></i>
                        <span>文档处理</span>
                    </div>
                </div>
            </div>
        `;}
showLoadingMessages(){const chatMessages=document.getElementById('chatMessages');chatMessages.innerHTML=`
            <div class="welcome-message" id="welcomeMessage">
                <div class="welcome-avatar">
                    <i class="fas fa-spinner fa-spin" style="font-size: 48px; color: var(--neon-pink, #ff6b9d);"></i>
                </div>
                <h3 class="welcome-title">加载消息中...</h3>
                <p class="welcome-subtitle">正在获取历史对话内容 ✨</p>
            </div>
        `;}
addMessageToUI(message){const chatMessages=document.getElementById('chatMessages');const welcomeMessage=chatMessages.querySelector('.welcome-message');if(welcomeMessage){welcomeMessage.remove();}
const messageDiv=document.createElement('div');messageDiv.className=`message ${message.role==='user'?'user':'ai'}`;const avatarHtml=message.role==='user'?`<div class="message-avatar avatar-user">
                <i class="fas fa-user"></i>
            </div>`:`<div class="message-avatar avatar-ai">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 8V4H8"></path>
                    <rect width="16" height="12" x="4" y="8" rx="2"></rect>
                    <path d="M2 14h2"></path>
                    <path d="M20 14h2"></path>
                    <path d="M15 13v2"></path>
                    <path d="M9 13v2"></path>
                </svg>
            </div>`;let attachmentHtml='';if(message.attachments&&message.attachments.length>0){attachmentHtml='<div class="message-attachments">';message.attachments.forEach((attachment,index)=>{const icon=this.getFileIcon(attachment.category);const isImage=attachment.category==='images';const attachmentId=`attachment-${Date.now()}-${index}`;if(isImage){attachmentHtml+=`
                        <div class="image-attachment-container">
                            <div class="attachment-item image-attachment" data-image-url="${attachment.url}" onclick="app.showImagePreview('${attachment.url}', '${attachment.name}')">
                                <i class="${icon}"></i>
                                <span class="attachment-name">${attachment.name}</span>
                                <i class="fas fa-search-plus preview-icon"></i>
                            </div>
                            <img class="image-thumbnail" src="${attachment.url}" alt="${attachment.name}" onclick="app.showImagePreview('${attachment.url}', '${attachment.name}')" onerror="this.style.display='none'">
                        </div>
                    `;}else{attachmentHtml+=`
                        <div class="attachment-item">
                            <i class="${icon}"></i>
                            <span>${attachment.name}</span>
                        </div>
                    `;}});attachmentHtml+='</div>';}
let thinkingHtml='';if(message.role==='assistant'&&message.thinking_content&&message.has_thinking){const thinkingId=`thinking-${Date.now()}-${Math.random().toString(36).substr(2,9)}`;thinkingHtml=`
                <div class="thinking-section" id="${thinkingId}">
                    <div class="thinking-header" onclick="app.toggleThinkingContent('${thinkingId}')">
                        <i class="fas fa-brain thinking-icon"></i>
                        <span class="thinking-label">AI 思考过程</span>
                        <i class="fas fa-chevron-down thinking-toggle"></i>
                    </div>
                    <div class="thinking-body" style="display: none;">
                        <div class="thinking-text">${this.escapeHtml(message.thinking_content)}</div>
                    </div>
                </div>
            `;}
const isHtmlContent=message.content.includes('<div class="generated-image">')||message.content.includes('<img src="data:')||message.content.includes('<div class="')||message.content.includes('<img ')||message.content.includes('<p class="')||message.content.includes('<span class="');const messageContent=isHtmlContent?message.content:this.formatMessageText(message.content);let proxyBadge='';if(message.role==='assistant'&&message.is_proxy){proxyBadge='<span class="proxy-badge" title="通过代理服务器响应"><i class="fas fa-server"></i></span>';}
const bubbleClass=message.role==='user'?'bubble-user':'bubble-ai';messageDiv.innerHTML=`
            ${avatarHtml}
            <div class="message-bubble ${bubbleClass}">
                ${attachmentHtml}
                ${thinkingHtml}
                ${messageContent}
            </div>
        `;chatMessages.appendChild(messageDiv);setTimeout(()=>{this.renderMathFormulas();},10);}
formatMessageText(text){text=this.processCodeBlocks(text);text=this.processMathFormulas(text);let imgCount=0;let lastText='';while(text.includes('![')&&text.includes('](')){if(text===lastText)break;lastText=text;const imgStartIdx=text.indexOf('![');const altEndIdx=text.indexOf('](',imgStartIdx);if(altEndIdx===-1)break;let parenCount=1;let srcEndIdx=altEndIdx+2;let foundClosingParen=false;const maxSearchLen=Math.min(text.length,srcEndIdx+500000);while(srcEndIdx<maxSearchLen){if(text[srcEndIdx]==='(')parenCount++;else if(text[srcEndIdx]===')')parenCount--;srcEndIdx++;if(parenCount===0){foundClosingParen=true;break;}}
if(!foundClosingParen){text=text.substring(0,imgStartIdx)+'&#33;['+text.substring(imgStartIdx+2);continue;}
const alt=text.substring(imgStartIdx+2,altEndIdx);const src=text.substring(altEndIdx+2,srcEndIdx-1);imgCount++;const imageHtml=`<div class="generated-image"><img src="${src}" alt="${alt||'Generated Image'}" /><p class="image-prompt">AI生成图片</p></div>`;text=text.substring(0,imgStartIdx)+imageHtml+text.substring(srcEndIdx);}
text=text.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\*(.*?)\*/g,'<em>$1</em>').replace(/`(.*?)`/g,'<code>$1</code>').replace(/\n/g,'<br>');return text;}
processMathFormulas(text){text=text.replace(/\\\[([\s\S]*?)\\\]/g,(match,formula)=>{const mathId='math-'+Date.now()+'-'+Math.random().toString(36).substr(2,9);return '<div class="math-formula display" id="'+mathId+'" data-formula="'+this.escapeHtml(formula.trim())+'">$$'+this.escapeHtml(formula.trim())+'$$</div>';});text=text.replace(/\\\(([\s\S]*?)\\\)/g,(match,formula)=>{const mathId='math-'+Date.now()+'-'+Math.random().toString(36).substr(2,9);return '<span class="math-formula inline" id="'+mathId+'" data-formula="'+this.escapeHtml(formula)+'">$'+this.escapeHtml(formula)+'$</span>';});text=text.replace(/(?<!\$)\$(?!\$)([^$\n]+?)\$(?!\$)/g,(match,formula)=>{const mathId='math-'+Date.now()+'-'+Math.random().toString(36).substr(2,9);return '<span class="math-formula inline" id="'+mathId+'" data-formula="'+this.escapeHtml(formula)+'">$'+this.escapeHtml(formula)+'$</span>';});text=text.replace(/\$\$([\s\S]*?)\$\$/g,(match,formula)=>{const mathId='math-'+Date.now()+'-'+Math.random().toString(36).substr(2,9);return '<div class="math-formula display" id="'+mathId+'" data-formula="'+this.escapeHtml(formula.trim())+'">$$'+this.escapeHtml(formula.trim())+'$$</div>';});return text;}
renderMathFormulas(){const mathElements=document.querySelectorAll('.math-formula[data-formula]');mathElements.forEach(element=>{let formula=element.getAttribute('data-formula');formula=this.unescapeHtml(formula);const isDisplay=element.classList.contains('display');try{if(window.katex){katex.render(formula,element,{displayMode:isDisplay,throwOnError:false,strict:false,trust:false});element.removeAttribute('data-formula');}}catch(error){}});}
unescapeHtml(text){const map={'&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&#039;':"'"};return text.replace(/&amp;|&lt;|&gt;|&quot;|&#039;/g,function(m){return map[m];});}
processCodeBlocks(text){const codeBlockRegex=/```([a-zA-Z]*)(\r?\n)?([\s\S]*?)```/g;return text.replace(codeBlockRegex,(match,language,newline,code)=>{code=code.trim();const escapedCode=this.escapeHtml(code);const blockId='code-block-'+Date.now()+'-'+Math.random().toString(36).substr(2,9);return '<div class="code-block-container" data-language="'+(language||'text')+'">'+
'<div class="code-block-header">'+
'<span class="code-language">'+(language||'Text')+'</span>'+
'<div class="code-actions">'+
'<button class="code-action-btn" onclick="app.copyCodeBlock(\''+blockId+'\')" title="复制代码">'+
'<i class="fas fa-copy"></i>'+
'</button>'+
'<button class="code-action-btn" onclick="app.editCodeBlock(\''+blockId+'\', \''+(language||'text')+'\')" title="编辑代码">'+
'<i class="fas fa-edit"></i>'+
'</button>'+
'<button class="code-action-btn" onclick="app.fullscreenCodeBlock(\''+blockId+'\')" title="全屏查看">'+
'<i class="fas fa-expand"></i>'+
'</button>'+
'</div>'+
'</div>'+
'<pre class="code-block" id="'+blockId+'"><code>'+escapedCode+'</code></pre>'+
'</div>';});}
escapeHtml(text){const map={'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'};return text.replace(/[&<>"']/g,function(m){return map[m];});}
sanitizePreviewText(text){if(!text||typeof text!=='string'){return '暂无消息';}
text=text.replace(/```[\s\S]*?```/g,'[代码块]');text=text.replace(/`[^`]*`/g,'[代码]');text=text.replace(/<[^>]*>/g,'');text=text.replace(/\s+/g,' ').trim();if(text.length>50){text=text.substring(0,50)+'...';}
return text||'暂无消息';}
copyCodeBlock(blockId){const codeBlock=document.getElementById(blockId);if(codeBlock){const code=codeBlock.textContent;if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(code).then(()=>{this.showNotification('代码已复制到剪贴板','success');}).catch(()=>{this.fallbackCopyText(code);});}else{this.fallbackCopyText(code);}}}
fallbackCopyText(text){const textArea=document.createElement('textarea');textArea.value=text;textArea.style.position='fixed';textArea.style.left='-9999px';textArea.style.top='0';document.body.appendChild(textArea);textArea.focus();textArea.select();try{document.execCommand('copy');this.showNotification('代码已复制到剪贴板','success');}catch(err){this.showNotification('复制失败，请手动复制','error');}
document.body.removeChild(textArea);}
editCodeBlock(blockId,language){const codeBlock=document.getElementById(blockId);if(codeBlock){const code=codeBlock.textContent;this.showCodeEditor(code,language,blockId);}}
fullscreenCodeBlock(blockId){const codeBlock=document.getElementById(blockId);if(codeBlock){const code=codeBlock.textContent;const language=codeBlock.closest('.code-block-container').dataset.language;this.showFullscreenCode(code,language);}}
showCodeEditor(code,language,blockId){const modal=document.createElement('div');modal.className='code-editor-modal';modal.innerHTML='<div class="code-editor-overlay" onclick="this.parentElement.remove()"></div>'+
'<div class="code-editor-container">'+
'<div class="code-editor-header">'+
'<h3>编辑代码 - '+language.toUpperCase()+'</h3>'+
'<button class="close-btn" onclick="this.closest(\'.code-editor-modal\').remove()">'+
'<i class="fas fa-times"></i>'+
'</button>'+
'</div>'+
'<div class="code-editor-body">'+
'<textarea class="code-editor-textarea" placeholder="在此编辑代码...">'+this.escapeHtml(code)+'</textarea>'+
'</div>'+
'<div class="code-editor-actions">'+
'<button class="btn btn-secondary" onclick="this.closest(\'.code-editor-modal\').remove()">取消</button>'+
'<button class="btn btn-primary" onclick="app.saveCodeEdit(\''+blockId+'\', this)">保存</button>'+
'<button class="btn btn-success" onclick="app.copyFromEditor(this)">复制</button>'+
'</div>'+
'</div>';document.body.appendChild(modal);setTimeout(()=>{const textarea=modal.querySelector('.code-editor-textarea');textarea.focus();},100);}
showFullscreenCode(code,language){const modal=document.createElement('div');modal.className='code-fullscreen-modal';modal.innerHTML='<div class="code-fullscreen-overlay" onclick="this.parentElement.remove()"></div>'+
'<div class="code-fullscreen-container">'+
'<div class="code-fullscreen-header">'+
'<h3>'+language.toUpperCase()+' 代码</h3>'+
'<div class="code-fullscreen-actions">'+
'<button class="code-action-btn" onclick="app.copyFromFullscreen(this)" title="复制代码">'+
'<i class="fas fa-copy"></i> 复制'+
'</button>'+
'<button class="close-btn" onclick="this.closest(\'.code-fullscreen-modal\').remove()" title="关闭">'+
'<i class="fas fa-times"></i>'+
'</button>'+
'</div>'+
'</div>'+
'<div class="code-fullscreen-body">'+
'<pre class="code-fullscreen-block"><code>'+this.escapeHtml(code)+'</code></pre>'+
'</div>'+
'</div>';document.body.appendChild(modal);}
saveCodeEdit(blockId,button){const modal=button.closest('.code-editor-modal');const textarea=modal.querySelector('.code-editor-textarea');const newCode=textarea.value;const codeBlock=document.getElementById(blockId);if(codeBlock){codeBlock.textContent=newCode;}
modal.remove();this.showNotification('代码已更新','success');}
copyFromEditor(button){const textarea=button.closest('.code-editor-modal').querySelector('.code-editor-textarea');const code=textarea.value;navigator.clipboard.writeText(code).then(()=>{this.showNotification('代码已复制到剪贴板','success');}).catch(()=>{textarea.select();document.execCommand('copy');this.showNotification('代码已复制到剪贴板','success');});}
copyFromFullscreen(button){const codeBlock=button.closest('.code-fullscreen-modal').querySelector('.code-fullscreen-block');const code=codeBlock.textContent;navigator.clipboard.writeText(code).then(()=>{this.showNotification('代码已复制到剪贴板','success');}).catch(()=>{const textArea=document.createElement('textarea');textArea.value=code;document.body.appendChild(textArea);textArea.select();document.execCommand('copy');document.body.removeChild(textArea);this.showNotification('代码已复制到剪贴板','success');});}
async sendMessage(){if(this.isLoading)return;this.isLoading=true;this.updateSendButton();this.disableUserInput(true);const messageInput=document.getElementById('messageInput');const message=messageInput.value.trim();if(!message&&this.attachments.length===0){this.showNotification('请输入消息内容','error');this.isLoading=false;this.updateSendButton();this.disableUserInput(false);return;}
if(!this.currentUser&&this.accessControl&&this.accessControl.isPublicDomain){const modelSelector=document.getElementById('modelSelector');const selectedModel=modelSelector?modelSelector.value:'flash';if(selectedModel==='pro'){this.showNotification('⚠️ 使用Pro模型需要登录，请先登录账号！','warning');this.isLoading=false;this.updateSendButton();this.disableUserInput(false);setTimeout(()=>{this.showLoginPage();},2000);return;}
const checkResult=this.accessControl.canSendMessage();if(!checkResult.allowed){this.showNotification(`⚠️ ${checkResult.message}`,'warning',5000);this.isLoading=false;this.updateSendButton();this.disableUserInput(false);setTimeout(()=>{this.showLoginPage();},2000);return;}
this.accessControl.incrementCount();}
if(this.attachments.length>0){let totalSize=0;const imageAttachments=this.attachments.filter(att=>att.category==='images'||['jpg','jpeg','png','gif','webp'].includes(att.path.split('.').pop().toLowerCase()));for(const attachment of imageAttachments){if(attachment.size){totalSize+=attachment.size;}}
const totalSizeMB=totalSize/(1024*1024);if(totalSizeMB>10){this.showNotification(`❌ 图片过大（${totalSizeMB.toFixed(2)}MB），请到 https://tool.wawacm.com/pic.html 压缩后再上传！`,'error',8000);this.isLoading=false;this.updateSendButton();this.disableUserInput(false);return;}
if(totalSizeMB>5){this.showNotification(`⚠️ 图片较大（${totalSizeMB.toFixed(2)}MB），可能会造成上传缓慢`,'warning',5000);}}
if(!this.currentSession){await this.createNewSession();if(!this.currentSession){this.isLoading=false;this.updateSendButton();this.disableUserInput(false);return;}}
let thinkingMessageId=null;let messageSendSuccess=false;try{const model=document.getElementById('modelSelect').value;if(model==='wawa-image-1'||model==='wawaimage'||model==='wawa-image-2'||model==='wawa-image-3'){await this.generateImage(message);this.isLoading=false;this.updateSendButton();this.disableUserInput(false);return;}
const userMessage={role:'user',content:message,attachments:this.attachments.length>0?[...this.attachments]:undefined,created_at:new Date().toISOString()};this.addMessageToUI(userMessage);this.allMessages.push(userMessage);if(!this.currentUser&&typeof anonymousStorage!=='undefined'&&this.currentSession){anonymousStorage.addMessage(this.currentSession.id,userMessage);}
thinkingMessageId=this.addThinkingMessage();const userAttachments=[...this.attachments];messageInput.value='';this.attachments=[];this.updateAttachmentPreview();this.scrollToBottom();const searchToggle=document.getElementById('searchToggle');const searchChecked=searchToggle&&searchToggle.checked;const isManualSearch=searchChecked&&!this.searchAutoEnabled;const enableSearch=isManualSearch;const useStream=isManualSearch;let response;if(useStream){response=await this.sendMessageStream(this.currentSession.id,message,'wawa-ai-pro',userAttachments,true,thinkingMessageId,enableSearch);}else{response=await this.apiCall('/chat/messages',{method:'POST',body:{session_id:this.currentSession.id,message:message,model:model,attachments:userAttachments,enable_search:enableSearch}});if(response.switch_to_stream){this.showNotification(response.message||'正在切换到深度思考模式...','info');if(response.auto_enable_search){const searchToggle=document.getElementById('searchToggle');const searchLabel=document.getElementById('searchToggleLabel');if(searchToggle&&!searchToggle.checked){searchToggle.checked=true;if(searchLabel){searchLabel.classList.add('checked');}
this.searchAutoEnabled=true;this.showNotification('🌐 智能检测: 已自动启用联网搜索，为您获取最新信息','success',4000);}}else{if(this.searchAutoEnabled){const searchToggle=document.getElementById('searchToggle');const searchLabel=document.getElementById('searchToggleLabel');if(searchToggle&&searchToggle.checked){searchToggle.checked=false;if(searchLabel){searchLabel.classList.remove('checked');}}
this.searchAutoEnabled=false;}}
response=await this.sendMessageStream(this.currentSession.id,message,response.target_model,userAttachments,response.enable_thinking,thinkingMessageId,response.auto_enable_search||false);}else{if(this.searchAutoEnabled){const searchToggle=document.getElementById('searchToggle');const searchLabel=document.getElementById('searchToggleLabel');if(searchToggle&&searchToggle.checked){searchToggle.checked=false;if(searchLabel){searchLabel.classList.remove('checked');}}
this.searchAutoEnabled=false;}}}
this.removeThinkingMessage(thinkingMessageId);if(response.route_to_image&&response.is_image_generation){const targetModel=response.target_model;this.showNotification(`🎨 智能路由: 检测到图片生成需求，正在生成...`,'info');if(thinkingMessageId){this.removeThinkingMessage(thinkingMessageId);thinkingMessageId=null;}
await this.generateImage(message,targetModel,true,userAttachments);this.isLoading=false;this.updateSendButton();this.disableUserInput(false);return;}
if(response.success){messageSendSuccess=true;if(response.is_auto_routed&&response.route_info){const routeInfo=response.route_info;const score=routeInfo.score||'?';if(this.currentUser&&this.currentUser.is_admin){const routedModel=response.routed_model||response.model;this.showNotification(`🤖 智能路由: 评分${score}分，使用${routedModel}`,'info',3000);}}
await this.updateSessionMetaIfNeeded(message,model,response,searchChecked);const assistantMessage={role:'assistant',content:response.content,created_at:new Date().toISOString(),thinking_content:response.thinking_content||null,has_thinking:response.has_thinking||response.show_thinking||false,is_proxy:response.is_proxy||false};this.addMessageToUI(assistantMessage);this.allMessages.push(assistantMessage);if(!this.currentUser&&typeof anonymousStorage!=='undefined'&&this.currentSession){anonymousStorage.addMessage(this.currentSession.id,assistantMessage);}
if(!this.currentUser&&this.accessControl&&this.accessControl.isPublicDomain){const remaining=this.accessControl.anonymousLimit-this.accessControl.anonymousCount;if(remaining===0){this.showNotification('⚠️ 您今日的免费对话次数已用完，请登录后继续使用！','warning',6000);setTimeout(()=>{this.showLoginPage();},3000);}else if(remaining<=2){this.showNotification(`⚠️ 今日还剩 ${remaining} 次免费对话机会`,'info',5000);}}
this.scrollToBottom();let delay=100;if(this.isMobile){const screenHeight=window.innerHeight;if(screenHeight>=900){return;}else if(screenHeight>=800){return;}else if(screenHeight>=700){delay=2000;}else{delay=1500;}}
setTimeout(()=>{if(this.isMobile){this.updateSessionListOnly();}else{this.loadSessions();}},delay);if(response.context_warning){const estimatedTokens=response.estimated_tokens||0;const formattedTokens=estimatedTokens.toLocaleString();this.showNotification(`⚠️ 上下文较长（约${formattedTokens} tokens），建议开启新对话以获得更好的回复质量。`,'warning');}}else{if(response.context_too_long){const estimatedTokens=response.estimated_tokens||0;const limit=response.limit||0;const formattedTokens=estimatedTokens.toLocaleString();const formattedLimit=limit.toLocaleString();this.showNotification(`❌ ${response.error}
当前: ${formattedTokens} tokens
限制: ${formattedLimit} tokens

点击左上角"+"号创建新对话`,'error');}else if(response.is_thinking){this.showNotification('⏳ '+response.error,'warning');}else{this.showNotification(response.error,'error');}}}catch(error){this.showNotification(error.message,'error');if(error.message.includes('刷新页面查看')){setTimeout(async()=>{try{await this.loadMessages(this.currentSession.id);this.showNotification('✅ 消息已自动加载','success',2000);}catch(reloadError){}},1500);}}finally{if(thinkingMessageId){this.removeThinkingMessage(thinkingMessageId);}
if(!messageSendSuccess&&!this.currentUser&&this.accessControl&&this.accessControl.isPublicDomain){this.accessControl.decrementCount();}
this.isLoading=false;this.updateSendButton();this.disableUserInput(false);}}
async sendMessageStream(sessionId,message,model,attachments,enableThinking,thinkingMessageId,enableSearch=false){return new Promise((resolve,reject)=>{const chatMessages=document.getElementById('chatMessages');let streamMessageDiv=null;let thinkingContent='';let mainContent='';let isThinkingPhase=true;const thinkingMsg=document.getElementById(thinkingMessageId);if(thinkingMsg){const textEl=thinkingMsg.querySelector('.thinking-text');if(textEl){if(enableSearch){textEl.textContent='🌐 正在联网搜索中';thinkingMsg.classList.add('search-mode');}else{textEl.textContent='🧠 正在深度思考中';}}}
fetch('/api/chat-stream.php',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({session_id:sessionId,message:message,model:model,attachments:attachments,enable_thinking:enableThinking,enable_search:enableSearch}),credentials:'include'}).then(response=>{const reader=response.body.getReader();const decoder=new TextDecoder();const processStream=async()=>{while(true){const{done,value}=await reader.read();if(done)break;const text=decoder.decode(value,{stream:true});const lines=text.split('\n');for(const line of lines){if(!line.startsWith('data: '))continue;const data=line.slice(6);if(data==='[DONE]')continue;try{const chunk=JSON.parse(data);if(chunk.error){resolve({success:false,error:chunk.error});return;}
if(chunk.type==='thinking'&&chunk.thinking){thinkingContent+=chunk.thinking;if(thinkingMsg){const textEl=thinkingMsg.querySelector('.thinking-text');if(textEl){const displayText=thinkingContent.length>200?'...'+thinkingContent.slice(-200):thinkingContent;textEl.textContent=displayText;this.scrollToBottom();}}}
if(chunk.type==='content'&&chunk.content){if(isThinkingPhase){isThinkingPhase=false;this.removeThinkingMessage(thinkingMessageId);streamMessageDiv=document.createElement('div');streamMessageDiv.className='message ai';streamMessageDiv.innerHTML=`
                                            <div class="message-avatar avatar-ai">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                    <path d="M12 8V4H8"></path>
                                                    <rect width="16" height="12" x="4" y="8" rx="2"></rect>
                                                    <path d="M2 14h2"></path>
                                                    <path d="M20 14h2"></path>
                                                    <path d="M15 13v2"></path>
                                                    <path d="M9 13v2"></path>
                                                </svg>
                                            </div>
                                            <div class="message-bubble bubble-ai">
                                                <div class="streaming-text"></div>
                                            </div>
                                        `;chatMessages.appendChild(streamMessageDiv);}
mainContent+=chunk.content;if(streamMessageDiv){const textEl=streamMessageDiv.querySelector('.streaming-text');if(textEl){textEl.innerHTML=this.formatMessage(mainContent);}}
this.scrollToBottom();}
if(chunk.done){if(streamMessageDiv){streamMessageDiv.remove();}
resolve({success:true,content:chunk.full_content||mainContent,thinking_content:chunk.full_thinking||thinkingContent,has_thinking:!!thinkingContent,is_proxy:true,tokens:chunk.tokens,response_time:chunk.response_time});return;}}catch(e){}}}
resolve({success:true,content:mainContent,thinking_content:thinkingContent,has_thinking:!!thinkingContent,is_proxy:true});};processStream().catch(reject);}).catch(reject);});}
updateSendButton(){const sendBtn=document.getElementById('sendBtn');const messageInput=document.getElementById('messageInput');const hasContent=messageInput.value.trim()||this.attachments.length>0;sendBtn.disabled=this.isLoading||!hasContent;if(this.isLoading){sendBtn.innerHTML='<div class="loading"></div>';}else{sendBtn.innerHTML='<i class="fas fa-paper-plane"></i>';}}
disableUserInput(disabled,isImageGen=false){const messageInput=document.getElementById('messageInput');const sendBtn=document.getElementById('sendBtn');const attachBtn=document.getElementById('attachBtn');if(disabled){messageInput.disabled=true;messageInput.placeholder=isImageGen?'图片正在生成中，请稍后回来查看！':'模型正在思考中，请稍等...';sendBtn.disabled=true;attachBtn.disabled=true;messageInput.style.pointerEvents='none';}else{messageInput.disabled=false;messageInput.placeholder=this.isMobile?'输入您的消息...':'输入您的消息... (支持 Ctrl+V 粘贴图片)';sendBtn.disabled=false;attachBtn.disabled=false;messageInput.style.pointerEvents='auto';setTimeout(()=>{messageInput.focus();},100);}}
addThinkingMessage(messageOrImageGen=false){const chatMessages=document.getElementById('chatMessages');const messageDiv=document.createElement('div');let initialText;let isImageGen=false;let modeClass='';if(typeof messageOrImageGen==='string'){initialText=messageOrImageGen;isImageGen=messageOrImageGen.includes('图片');if(messageOrImageGen.includes('搜索')){modeClass='search-mode';}else if(isImageGen){modeClass='image-gen';}}else{isImageGen=messageOrImageGen;initialText=isImageGen?'🎨 图片正在生成中':'💭 正在思考';modeClass=isImageGen?'image-gen':'';}
messageDiv.className=`message ai thinking-message ${modeClass}`;const thinkingId='thinking-'+Date.now();messageDiv.id=thinkingId;messageDiv.innerHTML=`
        <div class="message-avatar avatar-ai">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 8V4H8"></path>
                <rect width="16" height="12" x="4" y="8" rx="2"></rect>
                <path d="M2 14h2"></path>
                <path d="M20 14h2"></path>
                <path d="M15 13v2"></path>
                <path d="M9 13v2"></path>
            </svg>
        </div>
        <div class="message-bubble bubble-ai">
            <div class="thinking-animation">
                <span class="thinking-text">${initialText}</span>
                <span class="thinking-dots">
                    <span class="dot"></span>
                    <span class="dot"></span>
                    <span class="dot"></span>
                </span>
            </div>
        </div>
    `;chatMessages.appendChild(messageDiv);this.scrollToBottom();const thinkingTextElement=messageDiv.querySelector('.thinking-text');let timer1,timer2,timer3;if(isImageGen){timer1=setTimeout(()=>{if(document.getElementById(thinkingId)){thinkingTextElement.textContent='图片生成需要一些时间，请稍后回来查看...';this.scrollToBottom();}},15000);timer2=setTimeout(()=>{if(document.getElementById(thinkingId)){thinkingTextElement.textContent='图片仍在生成中，请耐心等待...';this.scrollToBottom();}},30000);timer3=setTimeout(()=>{if(document.getElementById(thinkingId)){thinkingTextElement.textContent='图片生成时间较长，您可以稍后刷新查看结果';thinkingTextElement.style.color='#f59e0b';this.scrollToBottom();}},60000);}else{timer1=setTimeout(()=>{if(document.getElementById(thinkingId)){thinkingTextElement.textContent='我还在思考中，请稍等...';this.scrollToBottom();}},20000);timer2=setTimeout(()=>{if(document.getElementById(thinkingId)){thinkingTextElement.textContent='当前问题有点复杂，请稍等...';this.scrollToBottom();}},30000);timer3=setTimeout(()=>{if(document.getElementById(thinkingId)){thinkingTextElement.textContent='由于网络问题，我卡了，请刷新并且尝试重新提问，抱歉!';thinkingTextElement.style.color='#ef4444';this.scrollToBottom();}},60000);}
messageDiv.thinkingTimers=[timer1,timer2,timer3];return thinkingId;}
removeThinkingMessage(thinkingId=null){if(thinkingId){const thinkingElement=document.getElementById(thinkingId);if(thinkingElement){if(thinkingElement.thinkingTimers){thinkingElement.thinkingTimers.forEach(timer=>clearTimeout(timer));}
thinkingElement.remove();}}else{const thinkingMessages=document.querySelectorAll('.thinking-message');thinkingMessages.forEach(msg=>{if(msg.thinkingTimers){msg.thinkingTimers.forEach(timer=>clearTimeout(timer));}
msg.remove();});}}
initSearchButton(){const checkbox=document.getElementById('searchToggle');const label=document.getElementById('searchToggleLabel');if(checkbox&&label){checkbox.checked=false;label.classList.remove('checked');}}
handleSearchToggle(e){const checkbox=e.target;const label=checkbox.closest('.search-toggle-label');this.searchAutoEnabled=false;if(checkbox.checked){label.classList.add('checked');this.showNotification('🌐 已启用联网搜索，将使用超级模型实时搜索网络','success',3000);}else{label.classList.remove('checked');this.showNotification('⚡ 已关闭联网搜索，使用常规模式','info',2000);}}
toggleThinkingContent(thinkingId){const thinkingSection=document.getElementById(thinkingId);if(!thinkingSection)return;const thinkingBody=thinkingSection.querySelector('.thinking-body');const thinkingToggle=thinkingSection.querySelector('.thinking-toggle');if(thinkingBody.style.display==='none'){thinkingBody.style.display='block';thinkingToggle.classList.remove('fa-chevron-down');thinkingToggle.classList.add('fa-chevron-up');thinkingSection.classList.add('expanded');}else{thinkingBody.style.display='none';thinkingToggle.classList.remove('fa-chevron-up');thinkingToggle.classList.add('fa-chevron-down');thinkingSection.classList.remove('expanded');}}
handleModelChange(e){const selectedModel=e.target.value;if(!this.currentUser&&this.accessControl&&this.accessControl.isPublicDomain&&selectedModel==='pro'){this.showNotification('⚠️ 使用Pro模型需要登录，请先登录账号！','warning');setTimeout(()=>{e.target.value='flash';this.showLoginPage();},2000);}}
async compressImageIfNeeded(file){const TWO_MB=2*1024*1024;try{const name=file.name||'image';const ext=name.split('.').pop().toLowerCase();const isImage=(file.type&&file.type.startsWith('image/'))||['jpg','jpeg','png','gif','webp','heic','heif'].includes(ext);if(!isImage||file.size<=TWO_MB){return file;}
if((file.type&&(file.type.includes('heic')||file.type.includes('heif')))||ext==='heic'||ext==='heif'){if(window.heic2any){try{const converted=await window.heic2any({blob:file,toType:'image/jpeg',quality:0.7});const jpegBlob=Array.isArray(converted)?converted[0]:converted;return new File([jpegBlob],name.replace(/\.[^\.]+$/,'.jpg'),{type:'image/jpeg'});}catch(e){}}else{}}
const dataUrl=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(file);});const img=await new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=reject;image.src=dataUrl;});const canvas=document.createElement('canvas');const w=img.naturalWidth||img.width;const h=img.naturalHeight||img.height;canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d');const isPng=(file.type==='image/png')||ext==='png';if(isPng){ctx.fillStyle='#ffffff';ctx.fillRect(0,0,w,h);}
ctx.drawImage(img,0,0,w,h);const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',0.7));if(!blob){return file;}
const newName=name.replace(/\.[^\.]+$/,'.jpg');const newFile=new File([blob],newName,{type:'image/jpeg'});return newFile;}catch(err){return file;}}
setUploadProgress(percent){const sendBtn=document.getElementById('sendBtn');if(!sendBtn)return;if(percent===null||percent===undefined){sendBtn.classList.remove('uploading');sendBtn.innerHTML='<i class="fas fa-paper-plane"></i>';return;}
sendBtn.classList.add('uploading');const pct=Math.max(0,Math.min(100,Math.round(percent)));sendBtn.innerHTML=`<span class="progress-text">${pct}%</span>`;}
async uploadToS4(file,category='images'){const presignPayload={filename:file.name||'upload.jpg',content_type:file.type||'application/octet-stream',category};const presign=await this.apiCall('/s4/presign',{method:'POST',body:presignPayload});if(!presign||!presign.success){throw new Error((presign&&presign.error)||'S4 预签名失败');}
const formData=new FormData();Object.entries(presign.fields).forEach(([k,v])=>formData.append(k,v));formData.append('file',file);const respStatus=await new Promise((resolve,reject)=>{try{const xhr=new XMLHttpRequest();xhr.open('POST',presign.url,true);xhr.onload=()=>{resolve({status:xhr.status,ok:xhr.status===201||(xhr.status>=200&&xhr.status<300),text:xhr.responseText});};xhr.onerror=()=>reject(new Error('S4 网络错误'));xhr.upload.onprogress=(e)=>{if(e.lengthComputable){const percent=(e.loaded/e.total)*100;this.setUploadProgress(percent);}};xhr.send(formData);}catch(err){reject(err);}});this.setUploadProgress(null);if(!respStatus.ok){throw new Error('S4 上传失败');}
const publicUrl=presign.public_url_cdn||presign.public_url_hosted||presign.public_url;const att={name:file.name,path:null,url:publicUrl,size:file.size,type:file.type||'image/jpeg',category,source:'s4',key:presign.key,bucket:presign.bucket};return att;}
async handleFileUpload(e){const files=Array.from(e.target.files);for(const file of files){try{const maxSize=10*1024*1024;if(file.size>maxSize){this.showNotification(`文件 "${file.name}" 过大，最大支持 10MB`,'error');continue;}
const allowedTypes=['jpg','jpeg','png','gif','webp','heic','heif','pdf','doc','docx','ppt','pptx','txt','rtf','mp4','avi','mov'];const extension=file.name.split('.').pop().toLowerCase();if(!allowedTypes.includes(extension)){this.showNotification(`不支持的文件类型: ${extension}`,'error');continue;}
const uploadFile=((file.type&&file.type.startsWith('image/'))||['jpg','jpeg','png','gif','webp','heic','heif'].includes(extension))?await this.compressImageIfNeeded(file):file;try{const imageExts=['jpg','jpeg','png','gif','webp','heic','heif'];const videoExts=['mp4','avi','mov','wmv','flv'];const docExts=['pdf','doc','docx','ppt','pptx','txt','rtf'];const isImageType=((uploadFile.type&&uploadFile.type.startsWith('image/'))||imageExts.includes(extension));const category=isImageType?'images':(videoExts.includes(extension)?'videos':'documents');const attachment=await this.uploadToS4(uploadFile,category);this.attachments.push(attachment);this.updateAttachmentPreview();this.showNotification(`✅ 文件已上传到 OSS`,'success');}catch(err){const formData=new FormData();formData.append('file',uploadFile);try{const response=await fetch('api/upload',{method:'POST',body:formData});const result=await response.json();if(result.success){const localAttachment={...result.file,source:'local'};this.attachments.push(localAttachment);this.updateAttachmentPreview();this.showNotification(`✅ 文件上传成功`,'success');}else{this.showNotification(`❌ 文件上传失败: ${result.message||result.error}`,'error');}}catch(e2){this.showNotification(`❌ 文件上传失败: ${e2.message}`,'error');}}}catch(error){this.showNotification(`文件上传失败: ${error.message}`,'error');}}
e.target.value='';}
updateAttachmentPreview(){const preview=document.getElementById('attachmentPreview');if(this.attachments.length===0){preview.style.display='none';preview.innerHTML='';return;}
preview.style.display='flex';preview.innerHTML='';this.attachments.forEach((attachment,index)=>{const item=document.createElement('div');const isImage=attachment.category==='images';item.className=isImage?'attachment-item image-attachment-preview':'attachment-item';const icon=this.getFileIcon(attachment.category);if(isImage){item.innerHTML=`
                    <i class="${icon}"></i>
                    <span class="attachment-name" onclick="app.showImagePreview('${attachment.url}', '${attachment.name}')" style="cursor: pointer;">${attachment.name}</span>
                    <i class="fas fa-eye preview-icon-small" onclick="app.showImagePreview('${attachment.url}', '${attachment.name}')" style="cursor: pointer;" title="预览图片"></i>
                    <button class="attachment-remove" onclick="app.removeAttachment(${index})">&times;</button>
                `;}else{item.innerHTML=`
                    <i class="${icon}"></i>
                    <span>${attachment.name}</span>
                    <button class="attachment-remove" onclick="app.removeAttachment(${index})">&times;</button>
                `;}
preview.appendChild(item);});this.updateSendButton();}
async removeAttachment(index){const attachment=this.attachments[index];const isAnonymousUser=this.accessControl&&this.accessControl.isPublicDomain&&!this.accessControl.isApiDomain&&!this.currentUser;if(isAnonymousUser&&attachment&&attachment.source==='s4'&&attachment.key){this.showNotification('⚠️ 匿名用户不支持删除图片，请登录后操作','warning');this.attachments.splice(index,1);this.updateAttachmentPreview();this.updateSendButton();return;}
if(attachment&&attachment.source==='s4'&&attachment.key){try{const resp=await this.apiCall('/s4/delete',{method:'POST',body:{key:attachment.key}});if(resp&&resp.success){this.showNotification('✅ 已从OSS删除该文件','success');}else{const errorMsg=resp.error||resp.message||'未知错误';if(errorMsg.includes('登录已过期')||errorMsg.includes('匿名用户')||!this.currentUser){this.showNotification('⚠️ OSS删除失败：登录已过期，请重新登录。','warning');}else{this.showNotification(`⚠️ OSS删除失败：${errorMsg}`,'warning');}}}catch(err){if((err.message&&err.message.includes('登录已过期'))||!this.currentUser){this.showNotification('⚠️ OSS删除失败：登录已过期，请重新登录。','warning');}else{this.showNotification(`❌ OSS删除失败：${err.message}`,'error');}}
this.attachments.splice(index,1);this.updateAttachmentPreview();this.updateSendButton();}else{this.attachments.splice(index,1);this.updateAttachmentPreview();this.updateSendButton();}}
getFileIcon(category){const icons={'images':'fas fa-image','videos':'fas fa-video','documents':'fas fa-file-alt'};return icons[category]||'fas fa-file';}
async searchSessions(keyword){if(!keyword.trim()){this.loadSessions();return;}
try{const response=await this.apiCall(`/chat/search?keyword=${encodeURIComponent(keyword)}`);if(response.success){const sessions=response.messages.reduce((acc,message)=>{const existingSession=acc.find(s=>s.id===message.session_id);if(!existingSession){acc.push({id:message.session_id,title:message.session_title,last_message:message.content,updated_at:message.created_at});}
return acc;},[]);this.renderSessions(sessions);}}catch(error){this.showNotification('搜索失败','error');}}
formatLastLoginTime(lastLoginTime){if(!lastLoginTime)return '首次登录';try{const lastLogin=new Date(lastLoginTime);const now=new Date();const diff=now-lastLogin;if(isNaN(lastLogin.getTime())||diff<0){return '首次登录';}
const days=Math.floor(diff/(1000*60*60*24));const hours=Math.floor(diff/(1000*60*60));const minutes=Math.floor(diff/(1000*60));if(days>0){return `${days}天前 (${lastLogin.toLocaleString('zh-CN')})`;}else if(hours>0){return `${hours}小时前 (${lastLogin.toLocaleString('zh-CN')})`;}else if(minutes>0){return `${minutes}分钟前 (${lastLogin.toLocaleString('zh-CN')})`;}else{return '刚刚 (本次登录)';}}catch(error){return '首次登录';}}
formatTime(timestamp){let date;if(typeof timestamp==='string'){date=new Date(timestamp);if(isNaN(date.getTime())){const numTimestamp=parseInt(timestamp);if(!isNaN(numTimestamp)){date=new Date(numTimestamp<10000000000?numTimestamp*1000:numTimestamp);}else{return '时间无效';}}}else if(typeof timestamp==='number'){date=new Date(timestamp<10000000000?timestamp*1000:timestamp);}else{return '时间无效';}
if(isNaN(date.getTime())){return '时间无效';}
const now=new Date();const diff=now-date;if(diff<0){if(Math.abs(diff)<3600000){const absDiff=Math.abs(diff);if(absDiff<60000){return '刚刚';}else if(absDiff<3600000){return `${Math.floor(absDiff/60000)}分钟前`;}}
return date.toLocaleString('zh-CN');}
if(diff<60000){return '刚刚';}else if(diff<3600000){return `${Math.floor(diff/60000)}分钟前`;}else if(diff<86400000){return `${Math.floor(diff/3600000)}小时前`;}else{return date.toLocaleDateString('zh-CN',{year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});}}
scrollToBottom(){const chatMessages=document.getElementById('chatMessages');chatMessages.scrollTop=chatMessages.scrollHeight;}
autoResizeTextarea(){const textarea=document.getElementById('messageInput');textarea.addEventListener('input',function(){this.style.height='auto';this.style.height=Math.min(this.scrollHeight,120)+'px';});}
initImagePreview(){document.addEventListener('click',(e)=>{const img=e.target;if(img.tagName==='IMG'&&img.closest('.generated-image')){e.preventDefault();this.showImagePreview(img.src,img.alt||'AI生成图片');}});}
initScrollPagination(){const sessionList=document.getElementById('sessionList');if(sessionList){sessionList.addEventListener('scroll',()=>{const isNearBottom=sessionList.scrollHeight-sessionList.scrollTop-sessionList.clientHeight<50;if(isNearBottom&&this.sessionsHasMore&&!this.sessionsLoading){this.loadMoreSessions();}});}
const chatMessages=document.getElementById('chatMessages');if(chatMessages){chatMessages.addEventListener('scroll',()=>{if(chatMessages.scrollTop<50&&this.messagesHasMore&&!this.messagesLoading&&this.currentSession){this.loadMoreMessages();}});}}
showImagePreview(imageSrc,imageAlt){const modal=document.createElement('div');modal.className='image-preview-modal';modal.innerHTML=`
            <div class="image-preview-overlay"></div>
            <div class="image-preview-container">
                <button class="image-preview-close" title="关闭">
                    <i class="fas fa-times"></i>
                </button>
                <img src="${imageSrc}" alt="${imageAlt}" />
                <div class="image-preview-actions">
                    <button onclick="window.open('${imageSrc}', '_blank')" title="在新标签页打开">
                        <i class="fas fa-external-link-alt"></i> 新窗口打开
                    </button>
                    <button onclick="app.downloadImage('${imageSrc}', '${imageAlt}')" title="下载图片">
                        <i class="fas fa-download"></i> 下载图片
                    </button>
                </div>
            </div>
        `;document.body.appendChild(modal);modal.querySelector('.image-preview-overlay').addEventListener('click',()=>{modal.remove();});modal.querySelector('.image-preview-close').addEventListener('click',()=>{modal.remove();});const escHandler=(e)=>{if(e.key==='Escape'){modal.remove();document.removeEventListener('keydown',escHandler);}};document.addEventListener('keydown',escHandler);}
downloadImage(imageSrc,fileName){const link=document.createElement('a');link.href=imageSrc;link.download=fileName||'ai-generated-image.png';link.target='_blank';if(imageSrc.startsWith('http')&&!imageSrc.includes(window.location.hostname)){fetch(imageSrc).then(response=>response.blob()).then(blob=>{const url=URL.createObjectURL(blob);link.href=url;document.body.appendChild(link);link.click();document.body.removeChild(link);URL.revokeObjectURL(url);this.showNotification('图片下载已开始','success');}).catch(err=>{window.open(imageSrc,'_blank');this.showNotification('请在新窗口中右键保存图片','info');});}else{document.body.appendChild(link);link.click();document.body.removeChild(link);this.showNotification('图片下载已开始','success');}}
initPasteAndDrop(){const chatMessages=document.getElementById('chatMessages');const messageInput=document.getElementById('messageInput');const inputWrapper=document.querySelector('.input-wrapper');const chatInputContainer=document.querySelector('.chat-input-container');messageInput.addEventListener('paste',(e)=>this.handlePaste(e));chatMessages.addEventListener('paste',(e)=>this.handlePaste(e));const dropZones=[chatMessages,chatInputContainer,inputWrapper];dropZones.forEach(zone=>{['dragenter','dragover','dragleave','drop'].forEach(eventName=>{zone.addEventListener(eventName,(e)=>{e.preventDefault();e.stopPropagation();},false);});let dragCounter=0;zone.addEventListener('dragenter',(e)=>{dragCounter++;zone.classList.add('drag-over');});zone.addEventListener('dragover',(e)=>{zone.classList.add('drag-over');});zone.addEventListener('dragleave',(e)=>{dragCounter--;if(dragCounter<=0){dragCounter=0;zone.classList.remove('drag-over');}});zone.addEventListener('drop',(e)=>{dragCounter=0;zone.classList.remove('drag-over');document.querySelectorAll('.drag-over').forEach(el=>el.classList.remove('drag-over'));this.handleDrop(e);});});window.addEventListener('dragover',(e)=>{e.preventDefault();},false);window.addEventListener('drop',(e)=>{e.preventDefault();},false);}
handlePaste(e){const items=e.clipboardData?.items;if(!items)return;let hasImage=false;for(let i=0;i<items.length;i++){const item=items[i];if(item.type.indexOf('image')!==-1){hasImage=true;e.preventDefault();const blob=item.getAsFile();if(blob){this.uploadPastedImage(blob);}
break;}}
if(hasImage){this.showNotification('📋 正在上传粘贴的图片...','info');}}
handleDrop(e){const files=e.dataTransfer?.files;if(!files||files.length===0)return;this.showNotification(`📤 正在上传 ${files.length} 个文件...`,'info');Array.from(files).forEach(file=>{this.uploadDroppedFile(file);});}
async uploadPastedImage(blob){const timestamp=new Date().getTime();const fileName=`pasted-image-${timestamp}.png`;const file=new File([blob],fileName,{type:blob.type});const maxSize=10*1024*1024;if(file.size>maxSize){this.showNotification('❌ 图片过大，最大支持 10MB','error');return;}
const uploadFile=await this.compressImageIfNeeded(file);try{const attachment=await this.uploadToS4(uploadFile,'images');this.attachments.push(attachment);this.updateAttachmentPreview();this.showNotification(`✅ 图片已上传到 OSS`,'success');}catch(err){const formData=new FormData();formData.append('file',uploadFile);try{const response=await fetch('api/upload',{method:'POST',body:formData});const result=await response.json();if(result.success){const localAttachment={...result.file,source:'local'};this.attachments.push(localAttachment);this.updateAttachmentPreview();this.showNotification(`✅ 图片上传成功`,'success');}else{this.showNotification(`❌ 图片上传失败: ${result.message||result.error}`,'error');}}catch(error){this.showNotification(`❌ 图片上传失败: ${error.message}`,'error');}}}
async uploadDroppedFile(file){const maxSize=10*1024*1024;if(file.size>maxSize){this.showNotification(`❌ 文件 "${file.name}" 过大，最大支持 10MB`,'error');return;}
const allowedTypes=['jpg','jpeg','png','gif','webp','heic','heif','pdf','doc','docx','ppt','pptx','txt','rtf','mp4','avi','mov'];const extension=file.name.split('.').pop().toLowerCase();if(!allowedTypes.includes(extension)){this.showNotification(`❌ 不支持的文件类型: ${extension}`,'error');return;}
const uploadFile=((file.type&&file.type.startsWith('image/'))||['jpg','jpeg','png','gif','webp','heic','heif'].includes(extension))?await this.compressImageIfNeeded(file):file;try{const imageExts=['jpg','jpeg','png','gif','webp','heic','heif'];const videoExts=['mp4','avi','mov','wmv','flv'];const docExts=['pdf','doc','docx','ppt','pptx','txt','rtf'];const isImageType=((uploadFile.type&&uploadFile.type.startsWith('image/'))||imageExts.includes(extension));const category=isImageType?'images':(videoExts.includes(extension)?'videos':'documents');const attachment=await this.uploadToS4(uploadFile,category);this.attachments.push(attachment);this.updateAttachmentPreview();this.showNotification(`✅ 文件已上传到 OSS`,'success');}catch(error){const formData=new FormData();formData.append('file',uploadFile);try{const response=await fetch('api/upload',{method:'POST',body:formData});const result=await response.json();if(result.success){const localAttachment={...result.file,source:'local'};this.attachments.push(localAttachment);this.updateAttachmentPreview();this.showNotification(`✅ 文件上传成功`,'success');}else{this.showNotification(`❌ 文件上传失败: ${result.message||result.error}`,'error');}}catch(e2){this.showNotification(`❌ 文件上传失败: ${e2.message}`,'error');}}}
showModal(content){document.getElementById('modalBody').innerHTML=content;document.getElementById('modal').style.display='block';}
closeModal(){document.getElementById('modal').style.display='none';}
showImagePreview(imageUrl,imageName){let previewModal=document.getElementById('imagePreviewModal');if(!previewModal){previewModal=document.createElement('div');previewModal.id='imagePreviewModal';previewModal.className='image-preview-modal';previewModal.innerHTML=`
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
            `;document.body.appendChild(previewModal);document.addEventListener('keydown',(e)=>{if(e.key==='Escape'&&previewModal.classList.contains('active')){this.closeImagePreview();}});}
const previewImage=document.getElementById('previewImage');const previewImageName=document.getElementById('previewImageName');const downloadBtn=document.getElementById('downloadImageBtn');previewImage.src=imageUrl;previewImage.alt=imageName;previewImageName.textContent=imageName;downloadBtn.href=imageUrl;downloadBtn.download=imageName;previewModal.classList.add('active');document.body.style.overflow='hidden';setTimeout(()=>{previewModal.classList.add('loaded');},10);}
closeImagePreview(){const previewModal=document.getElementById('imagePreviewModal');if(previewModal){previewModal.classList.remove('loaded');setTimeout(()=>{previewModal.classList.remove('active');document.body.style.overflow='';},300);}}
async deleteSession(sessionId){const sessionItem=document.querySelector(`[data-session-id="${sessionId}"]`);if(sessionItem){sessionItem.style.opacity='0.5';sessionItem.style.pointerEvents='none';const menuBtn=sessionItem.querySelector('.session-menu-btn');if(menuBtn){menuBtn.innerHTML='<i class="fas fa-spinner fa-spin"></i>';}}
if(this.currentSession&&this.currentSession.id==sessionId){this.currentSession=null;document.getElementById('currentSessionTitle').textContent='选择或创建新对话';document.getElementById('editTitleBtn').style.display='none';this.showWelcomeMessage();}
try{const response=await this.apiCall('/chat/sessions',{method:'DELETE',body:{session_id:sessionId}});if(response.success){this.showNotification('对话删除成功','success');if(sessionItem){sessionItem.style.transform='translateX(-100%)';setTimeout(()=>{sessionItem.remove();},300);}}else{if(sessionItem){sessionItem.style.opacity='1';sessionItem.style.pointerEvents='auto';const menuBtn=sessionItem.querySelector('.session-menu-btn');if(menuBtn){menuBtn.innerHTML='<i class="fas fa-ellipsis-h"></i>';}}
this.showNotification(response.message||'删除失败','error');}}catch(error){if(sessionItem){sessionItem.style.opacity='1';sessionItem.style.pointerEvents='auto';const menuBtn=sessionItem.querySelector('.session-menu-btn');if(menuBtn){menuBtn.innerHTML='<i class="fas fa-ellipsis-h"></i>';}}
this.showNotification('删除对话失败','error');}}
initMobileInputAdaptation(){const messageInput=document.getElementById('messageInput');const chatInputContainer=document.querySelector('.chat-input-container');const chatMessages=document.getElementById('chatMessages');if(!messageInput||!chatInputContainer||!chatMessages)return;const isMobile=/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)||window.innerWidth<=768;if(!isMobile)return;let isKeyboardOpen=false;let originalViewportHeight=window.innerHeight;let adaptTimeout=null;let blurTimeout=null;let isSendingMessage=false;const getAdaptationConfig=()=>{const screenHeight=window.innerHeight;if(screenHeight>=900){return{heightThreshold:200,adaptDelay:150,blurDelay:500,focusDelay:400};}else if(screenHeight>=700){return{heightThreshold:150,adaptDelay:100,blurDelay:300,focusDelay:300};}else{return{heightThreshold:100,adaptDelay:50,blurDelay:200,focusDelay:200};}};const handleViewportChange=()=>{if(adaptTimeout){clearTimeout(adaptTimeout);}
const config=getAdaptationConfig();adaptTimeout=setTimeout(()=>{const currentHeight=window.innerHeight;const heightDifference=originalViewportHeight-currentHeight;if(heightDifference>config.heightThreshold){if(!isKeyboardOpen){isKeyboardOpen=true;this.adaptToKeyboard(true);}}else{if(isKeyboardOpen){isKeyboardOpen=false;this.adaptToKeyboard(false);}}},config.adaptDelay);};messageInput.addEventListener('focus',()=>{const config=getAdaptationConfig();setTimeout(()=>{handleViewportChange();},config.focusDelay);});messageInput.addEventListener('blur',()=>{if(blurTimeout){clearTimeout(blurTimeout);}
const config=getAdaptationConfig();blurTimeout=setTimeout(()=>{if(isSendingMessage){setTimeout(()=>{isKeyboardOpen=false;this.adaptToKeyboard(false);},1000);}else{isKeyboardOpen=false;this.adaptToKeyboard(false);}},config.blurDelay);});const sendBtn=document.getElementById('sendBtn');if(sendBtn){sendBtn.addEventListener('click',()=>{isSendingMessage=true;setTimeout(()=>{isSendingMessage=false;},2000);});}
messageInput.addEventListener('keydown',(e)=>{if(e.key==='Enter'&&!e.shiftKey){isSendingMessage=true;setTimeout(()=>{isSendingMessage=false;},2000);}});window.addEventListener('resize',handleViewportChange);if(window.visualViewport){window.visualViewport.addEventListener('resize',handleViewportChange);}}
adaptToKeyboard(isOpen){const chatInputContainer=document.querySelector('.chat-input-container');const chatMessages=document.getElementById('chatMessages');const mainChat=document.querySelector('.main-chat');const chatHeader=document.querySelector('.chat-header-new');if(!chatInputContainer||!chatMessages||!mainChat)return;const screenHeight=window.innerHeight;const isLargeScreen=screenHeight>=900;if(isOpen){chatInputContainer.style.position='fixed';chatInputContainer.style.bottom='0';chatInputContainer.style.left='0';chatInputContainer.style.right='0';chatInputContainer.style.zIndex='1000';const inputHeight=chatInputContainer.offsetHeight;const extraSpace=isLargeScreen?60:40;chatMessages.style.paddingBottom=`calc(${inputHeight+extraSpace}px + env(safe-area-inset-bottom))`;mainChat.style.height='100vh';mainChat.style.maxHeight='100vh';mainChat.style.overflow='hidden';if(chatHeader){chatHeader.style.position='sticky';chatHeader.style.top='0';chatHeader.style.zIndex='10';chatHeader.style.flexShrink='0';}
const scrollDelay=isLargeScreen?200:100;setTimeout(()=>{this.scrollToBottom();},scrollDelay);}else{const currentScrollTop=chatMessages.scrollTop;chatInputContainer.style.position='';chatInputContainer.style.bottom='';chatInputContainer.style.left='';chatInputContainer.style.right='';chatInputContainer.style.zIndex='';chatMessages.style.paddingBottom='';chatMessages.style.minHeight='auto';if(isLargeScreen){chatMessages.style.transition='none';chatMessages.offsetHeight;chatMessages.style.transition='';}
mainChat.style.height='';mainChat.style.maxHeight='';mainChat.style.overflow='';if(chatHeader){chatHeader.style.position='';chatHeader.style.top='';chatHeader.style.zIndex='';chatHeader.style.flexShrink='';}
setTimeout(()=>{chatMessages.scrollTop=currentScrollTop;},50);this.preventPageZoom();}}
preventPageZoom(){const viewport=document.querySelector('meta[name="viewport"]');if(viewport){viewport.setAttribute('content','width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');}
setTimeout(()=>{document.body.style.zoom='1';document.documentElement.style.zoom='1';},100);}
initLoginInputAdaptation(){const loginInputs=document.querySelectorAll('#loginUsername, #loginPassword, #registerUsername, #registerEmail, #registerPassword, #registerConfirmPassword');const loginContainer=document.querySelector('.login-container');const loginBox=document.querySelector('.login-box');if(!loginInputs.length||!loginContainer||!loginBox)return;const isMobile=/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)||window.innerWidth<=768;if(!isMobile)return;let isKeyboardOpen=false;let originalViewportHeight=window.innerHeight;const handleViewportChange=()=>{const currentHeight=window.innerHeight;const heightDifference=originalViewportHeight-currentHeight;if(heightDifference>150){if(!isKeyboardOpen){isKeyboardOpen=true;this.adaptLoginToKeyboard(true,loginContainer,loginBox);}}else{if(isKeyboardOpen){isKeyboardOpen=false;this.adaptLoginToKeyboard(false,loginContainer,loginBox);}}};loginInputs.forEach(input=>{input.addEventListener('focus',()=>{setTimeout(()=>{handleViewportChange();},300);});input.addEventListener('blur',()=>{isKeyboardOpen=false;this.adaptLoginToKeyboard(false,loginContainer,loginBox);});});window.addEventListener('resize',handleViewportChange);if(window.visualViewport){window.visualViewport.addEventListener('resize',handleViewportChange);}}
adaptLoginToKeyboard(isOpen,loginContainer,loginBox){if(!loginContainer||!loginBox)return;if(isOpen){loginContainer.style.position='fixed';loginContainer.style.top='0';loginContainer.style.left='0';loginContainer.style.right='0';loginContainer.style.bottom='0';loginContainer.style.height='100vh';loginContainer.style.maxHeight='100vh';loginContainer.style.overflow='hidden';loginBox.style.maxHeight='calc(100vh - 40px)';loginBox.style.overflowY='auto';loginBox.style.webkitOverflowScrolling='touch';setTimeout(()=>{const activeElement=document.activeElement;if(activeElement&&activeElement.tagName==='INPUT'){activeElement.scrollIntoView({behavior:'smooth',block:'center'});}},100);}else{loginContainer.style.position='';loginContainer.style.top='';loginContainer.style.left='';loginContainer.style.right='';loginContainer.style.bottom='';loginContainer.style.height='';loginContainer.style.maxHeight='';loginContainer.style.overflow='';loginBox.style.maxHeight='';loginBox.style.overflowY='';loginBox.style.webkitOverflowScrolling='';this.preventPageZoom();}}
async generateImage(prompt,targetModel=null,skipUI=false,passedAttachments=null){if(!this.currentSession){await this.createNewSession();if(!this.currentSession)return;}
this.isLoading=true;this.updateSendButton();this.disableUserInput(true,true);let thinkingMessageId=null;const currentAttachments=passedAttachments||[...this.attachments];if(!passedAttachments){this.attachments=[];this.updateAttachmentPreview();}
try{if(!skipUI){this.addMessageToUI({role:'user',content:prompt,attachments:currentAttachments.length>0?currentAttachments:undefined,created_at:new Date().toISOString()});const messageInput=document.getElementById('messageInput');messageInput.value='';}
thinkingMessageId=this.addThinkingMessage(true);this.scrollToBottom();const model=targetModel||document.getElementById('modelSelect').value;let endpoint='/generate-image';if(model==='wawa-image-1')endpoint='/kolors';if(model==='wawaimage'||model==='wawa-image-2'||model==='wawa-image-3')endpoint='/wawaimage';const response=await this.apiCall(endpoint,{method:'POST',body:{prompt:prompt,session_id:this.currentSession.id,attachments:currentAttachments.length>0?currentAttachments:undefined,skip_user_message:!!targetModel,skip_save_user_message:!!targetModel}});this.removeThinkingMessage(thinkingMessageId);if(response.success){let messageContent='';let kolorsUploadInfo=null;if(model==='wawa-image-1'){if(response.data&&response.data.images&&response.data.images.length>0){const tempImageUrl=response.data.images[0].url;const inferenceTime=response.data.timings?response.data.timings.inference:0;const messageId=response.message_id;const requireUpload=response.require_upload;const imageId='kolors-img-'+Date.now();const imageHtml=`
                            <div class="generated-image">
                                <img id="${imageId}" src="${tempImageUrl}" alt="${prompt}" />
                                <p class="image-prompt">提示词：${prompt}</p>
                                <p class="image-time">生成时间：${inferenceTime.toFixed(2)}秒</p>
                                <p class="upload-status" id="${imageId}-status" style="color: #888; font-size: 12px;">正在保存到云端...</p>
                            </div>
                        `;messageContent+=imageHtml;this.showNotification('图片生成成功！正在保存到云端...','success');kolorsUploadInfo={requireUpload:requireUpload&&this.currentUser,tempImageUrl:tempImageUrl,messageId:messageId,imageId:imageId,prompt:prompt};}else if(response.text){messageContent+=this.formatMessageText(response.text);this.showNotification('生成完成','success');}else{this.showNotification('图片生成失败：未返回图片','error');return;}}else if(model==='wawaimage'){if(response.content||response.temp_url){const tempImageUrl=response.temp_url;const requireUpload=response.require_upload||false;const messageId=response.message_id;const inferenceTime=response.response_time||0;const imageId='wawaimage-img-'+Date.now();const imageHtml=`
                            <div class="generated-image">
                                <img id="${imageId}" src="${tempImageUrl}" alt="${prompt}" />
                                <p class="image-prompt">提示词：${prompt}</p>
                                <p class="image-time">生成时间：${inferenceTime.toFixed(2)}秒</p>
                                <p class="upload-status" id="${imageId}-status" style="color: #888; font-size: 12px;">正在保存到云端...</p>
                            </div>
                        `;messageContent+=imageHtml;this.showNotification('图片生成成功！正在保存到云端...','success');kolorsUploadInfo={requireUpload:requireUpload&&this.currentUser,tempImageUrl:tempImageUrl,messageId:messageId,imageId:imageId,prompt:prompt};}else if(response.text){messageContent+=this.formatMessageText(response.text);this.showNotification('生成完成','success');}else{this.showNotification('图片生成失败：未返回图片','error');return;}}else{if(response.text){messageContent+=this.formatMessageText(response.text);}
if(response.image){const imageHtml=`
                            <div class="generated-image">
                                <img src="data:${response.mimeType||'image/png'};base64,${response.image}" alt="${prompt}" />
                                <p class="image-prompt">提示词：${prompt}</p>
                                <p class="image-time">生成时间：${response.response_time.toFixed(2)}秒</p>
                            </div>
                        `;messageContent+=imageHtml;}
if(!response.text&&!response.image){this.showNotification('图片生成失败：没有返回内容','error');return;}
if(response.text&&response.image){this.showNotification('文字和图片生成成功！','success');}else if(response.text){this.showNotification('文字生成成功！','success');}else if(response.image){this.showNotification('图片生成成功！','success');}}
this.addMessageToUI({role:'assistant',content:messageContent,created_at:new Date().toISOString()});await this.updateSessionMetaIfNeeded(prompt,model,{success:true},false);this.scrollToBottom();if(kolorsUploadInfo&&kolorsUploadInfo.requireUpload){setTimeout(()=>{this.uploadImageToOSS(kolorsUploadInfo.tempImageUrl,kolorsUploadInfo.messageId,kolorsUploadInfo.imageId,kolorsUploadInfo.prompt);},100);}
setTimeout(()=>{if(this.isMobile){this.updateSessionListOnly();}else{this.loadSessions();}},1000);}else{if(response.quota_exceeded){this.showNotification(`⚠️ ${response.error}`,'warning',8000);this.addMessageToUI({role:'assistant',content:`⚠️ **图片配额已满**\n\n${response.error}\n\n您当前已生成 ${response.current} 张AI图片，达到上限 ${response.limit} 张。\n\n**如何释放配额：**\n- 删除包含AI生成图片的对话会话\n- 删除后配额将自动恢复`,created_at:new Date().toISOString()});}else{this.showNotification('图片生成失败：'+response.error,'error');}}}catch(error){this.showNotification('图片生成失败：'+error.message,'error');this.removeThinkingMessage(thinkingMessageId);}finally{this.isLoading=false;this.updateSendButton();this.disableUserInput(false);}}
async uploadImageToOSS(tempUrl,messageId,imageId,prompt){const statusEl=document.getElementById(imageId+'-status');const imgEl=document.getElementById(imageId);try{if(statusEl)statusEl.textContent='正在下载图片...';const imageResponse=await fetch(tempUrl);if(!imageResponse.ok){throw new Error('下载图片失败: HTTP '+imageResponse.status);}
const imageBlob=await imageResponse.blob();if(statusEl)statusEl.textContent='正在获取上传凭证...';const presignResponse=await this.apiCall('/s4/presign',{method:'POST',body:{filename:`kolors-${Date.now()}.png`,content_type:imageBlob.type||'image/png',category:'ai-images'}});if(!presignResponse.success){throw new Error(presignResponse.error||'获取上传凭证失败');}
if(statusEl)statusEl.textContent='正在上传到云端...';const formData=new FormData();for(const[key,value]of Object.entries(presignResponse.fields)){formData.append(key,value);}
formData.append('file',imageBlob);const uploadResponse=await fetch(presignResponse.url,{method:'POST',body:formData});if(!uploadResponse.ok&&uploadResponse.status!==201){throw new Error(`上传失败: ${uploadResponse.status}`);}
const finalUrl=presignResponse.public_url_cdn||presignResponse.public_url_hosted||presignResponse.public_url;if(imgEl){imgEl.src=finalUrl;}
if(statusEl){statusEl.textContent='已保存到云端 ✓';statusEl.style.color='#4CAF50';}
if(messageId){try{await this.apiCall('/chat/update-message-image',{method:'POST',body:{message_id:messageId,old_url:tempUrl,new_url:finalUrl}});}catch(dbError){}}}catch(error){if(statusEl){statusEl.textContent='云端保存失败，使用临时链接';statusEl.style.color='#ff9800';}}}
async uploadBase64ToOSS(base64Data,messageId,imageId,prompt){const statusEl=document.getElementById(imageId+'-status');const imgEl=document.getElementById(imageId);try{if(statusEl)statusEl.textContent='正在处理图片...';const matches=base64Data.match(/^data:([^;]+);base64,(.+)$/);if(!matches){throw new Error('无效的 Base64 格式');}
const mimeType=matches[1];const base64=matches[2];const byteCharacters=atob(base64);const byteNumbers=new Array(byteCharacters.length);for(let i=0;i<byteCharacters.length;i++){byteNumbers[i]=byteCharacters.charCodeAt(i);}
const byteArray=new Uint8Array(byteNumbers);const imageBlob=new Blob([byteArray],{type:mimeType});if(statusEl)statusEl.textContent='正在获取上传凭证...';const ext=mimeType.split('/')[1]||'png';const presignResponse=await this.apiCall('/s4/presign',{method:'POST',body:{filename:`banana-${Date.now()}.${ext}`,content_type:mimeType,category:'ai-images'}});if(!presignResponse.success){throw new Error(presignResponse.error||'获取上传凭证失败');}
if(statusEl)statusEl.textContent='正在上传到云端...';const formData=new FormData();for(const[key,value]of Object.entries(presignResponse.fields)){formData.append(key,value);}
formData.append('file',imageBlob);const uploadResponse=await fetch(presignResponse.url,{method:'POST',body:formData});if(!uploadResponse.ok&&uploadResponse.status!==201){throw new Error(`上传失败: ${uploadResponse.status}`);}
const finalUrl=presignResponse.public_url_cdn||presignResponse.public_url_hosted||presignResponse.public_url;if(imgEl){imgEl.src=finalUrl;}
if(statusEl){statusEl.textContent='已保存到云端 ✓';statusEl.style.color='#4CAF50';}
if(messageId){try{await this.apiCall('/chat/update-message-image',{method:'POST',body:{message_id:messageId,old_url:base64Data.substring(0,100),new_url:finalUrl}});}catch(dbError){}}}catch(error){if(statusEl){statusEl.textContent='云端保存失败';statusEl.style.color='#ff9800';}}}}
const app=new WAWAAIApp();