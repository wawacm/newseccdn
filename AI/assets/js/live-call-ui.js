class LiveCallUI{constructor(){this.liveCall=null;this.callOverlay=null;this.voiceSelectorModal=null;this.captchaModal=null;this.isVideoMode=false;this.videoElement=null;this.pendingCallType=null;this.geetestInstance=null;this.init();}
init(){this.liveCall=new LiveCall({wsUrl:'wss://ailive.wawacm.com',tokenEndpoint:'/api/live-token.php',onStatusChange:(status,message)=>this.onStatusChange(status,message),onMessage:(msg)=>this.onMessage(msg),onError:(error)=>this.onError(error),onAudioLevel:(level,isSpeaking)=>this.onAudioLevel(level,isSpeaking)});this.createCallOverlay();this.createVoiceSelectorModal();this.createCaptchaModal();this.bindEvents();window.addEventListener('liveCallCaptchaRequired',(e)=>{this.showCaptchaModal(e.detail.captcha_id);});window.addEventListener('beforeunload',()=>{if(this.liveCall){this.liveCall.stop();}});}
createCallOverlay(){if(document.getElementById('liveCallOverlay')){this.callOverlay=document.getElementById('liveCallOverlay');return;}
const overlay=document.createElement('div');overlay.id='liveCallOverlay';overlay.className='live-call-overlay';overlay.innerHTML=`
            <div class="call-container">
                <!-- 顶部状态栏 -->
                <div class="call-header">
                    <div class="call-status">
                        <div class="status-indicator" id="callStatusIndicator"></div>
                        <span class="status-text" id="callStatusText">准备中...</span>
                    </div>
                    <div class="call-timer" id="callTimer">00:00</div>
                </div>
                
                <!-- 视频区域 -->
                <div class="video-container" id="videoContainer" style="display: none;">
                    <video id="callVideo" autoplay playsinline muted></video>
                    <button class="camera-switch-btn" id="cameraSwitchBtn" title="切换摄像头">
                        <svg viewBox="0 0 24 24" width="24" height="24">
                            <path fill="currentColor" d="M20 4h-3.17L15 2H9L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM9.88 4h4.24l1.83 2H20v12H4V6h4.05"/>
                            <circle fill="currentColor" cx="12" cy="12" r="4"/>
                            <path fill="currentColor" d="M5 12l3-3v2h4v2H8v2z"/>
                        </svg>
                    </button>
                </div>
                
                <!-- 音频可视化 -->
                <div class="audio-visualizer" id="audioVisualizer">
                    <div class="visualizer-circle" id="visualizerCircle">
                        <div class="avatar-icon">
                            <svg viewBox="0 0 24 24" width="64" height="64">
                                <path fill="currentColor" d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                                <path fill="currentColor" d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                            </svg>
                        </div>
                        <div class="pulse-ring ring-1"></div>
                        <div class="pulse-ring ring-2"></div>
                        <div class="pulse-ring ring-3"></div>
                    </div>
                    <div class="speaking-indicator" id="speakingIndicator">
                        <span class="speaking-dot"></span>
                        <span class="speaking-text">正在说话...</span>
                    </div>
                </div>
                
                <!-- 当前声音 -->
                <div class="current-voice" id="currentVoice">
                    <span class="voice-label">声音：</span>
                    <button class="voice-name" id="voiceNameBtn">Aoede · 女性·温柔</button>
                </div>
                
                <!-- 控制按钮 -->
                <div class="call-controls">
                    <button class="control-btn mute-btn" id="muteBtn" title="静音">
                        <svg class="unmuted-icon" viewBox="0 0 24 24" width="28" height="28">
                            <path fill="currentColor" d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                            <path fill="currentColor" d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                        </svg>
                        <svg class="muted-icon" viewBox="0 0 24 24" width="28" height="28" style="display:none;">
                            <path fill="currentColor" d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z"/>
                        </svg>
                    </button>
                    
                    <button class="control-btn end-btn" id="endCallBtn" title="结束通话">
                        <svg viewBox="0 0 24 24" width="32" height="32">
                            <path fill="currentColor" d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.73-1.68-1.36-2.66-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"/>
                        </svg>
                    </button>
                    
                    <button class="control-btn speaker-btn" id="speakerBtn" title="扬声器">
                        <svg class="speaker-on-icon" viewBox="0 0 24 24" width="28" height="28">
                            <path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                        </svg>
                        <svg class="speaker-off-icon" viewBox="0 0 24 24" width="28" height="28" style="display:none;">
                            <path fill="currentColor" d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;document.body.appendChild(overlay);this.callOverlay=overlay;this.videoElement=document.getElementById('callVideo');}
createVoiceSelectorModal(){if(document.getElementById('voiceSelectorModal')){this.voiceSelectorModal=document.getElementById('voiceSelectorModal');return;}
const voices=this.liveCall.getVoiceList();const modal=document.createElement('div');modal.id='voiceSelectorModal';modal.className='voice-selector-modal';modal.innerHTML=`
            <div class="voice-selector-content">
                <div class="voice-selector-header">
                    <h3>选择声音</h3>
                    <button class="close-btn" id="closeVoiceSelector">&times;</button>
                </div>
                <div class="voice-options">
                    ${voices.map(voice=>`
                        <label class="voice-option" data-voice="${voice.value}">
                            <input type="radio" name="voice" value="${voice.value}" ${voice.value==='Aoede'?'checked':''}>
                            <div class="voice-info">
                                <span class="voice-name">${voice.name}</span>
                                <span class="voice-desc">${voice.label}</span>
                            </div>
                            <div class="voice-check">✓</div>
                        </label>
                    `).join('')}
                </div>
                <button class="voice-confirm-btn" id="confirmVoiceBtn">确定</button>
            </div>
        `;document.body.appendChild(modal);this.voiceSelectorModal=modal;}
createCaptchaModal(){if(document.getElementById('captchaModal')){this.captchaModal=document.getElementById('captchaModal');return;}
const modal=document.createElement('div');modal.id='captchaModal';modal.className='captcha-modal';modal.innerHTML=`
      <div class="captcha-modal-content">
        <div class="captcha-modal-header">
          <div class="captcha-icon">
            <svg viewBox="0 0 24 24" width="32" height="32">
              <path fill="currentColor" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
            </svg>
          </div>
          <h3>安全验证</h3>
          <p class="captcha-subtitle">请完成验证后继续使用语音通话</p>
          <button class="captcha-close-btn" id="closeCaptchaModal">&times;</button>
        </div>
        <div class="captcha-body">
          <div id="geetestCaptcha" class="geetest-captcha-container">
            <div class="captcha-loading">
              <div class="captcha-spinner"></div>
              <span>加载验证码中...</span>
            </div>
          </div>
        </div>
        <div class="captcha-footer">
          <p class="captcha-hint">验证成功后将自动开始通话</p>
        </div>
      </div>
    `;document.body.appendChild(modal);this.captchaModal=modal;const closeBtn=document.getElementById('closeCaptchaModal');if(closeBtn){closeBtn.addEventListener('click',()=>this.hideCaptchaModal());}
modal.addEventListener('click',(e)=>{if(e.target===modal){this.hideCaptchaModal();}});}
showCaptchaModal(captchaId){if(!this.captchaModal)return;this.captchaModal.classList.add('active');this.loadGeetestSDK().then(()=>{this.initGeetest(captchaId);}).catch(err=>{this.showToast('验证码加载失败，请刷新重试','error');});}
hideCaptchaModal(){if(this.captchaModal){this.captchaModal.classList.remove('active');this.pendingCallType=null;}
if(this.geetestInstance){try{this.geetestInstance.reset();}catch(e){}}}
loadGeetestSDK(){return new Promise((resolve,reject)=>{if(window.initGeetest4){resolve();return;}
const script=document.createElement('script');script.src='https://static.geetest.com/v4/gt4.js';script.onload=()=>{resolve();};script.onerror=()=>{reject(new Error('极验 SDK 加载失败'));};document.head.appendChild(script);});}
initGeetest(captchaId){if(!window.initGeetest4){return;}
const container=document.getElementById('geetestCaptcha');if(!container)return;container.innerHTML='';initGeetest4({captchaId:captchaId,product:'bind',language:'zho',protocol:'https://'},(captcha)=>{this.geetestInstance=captcha;const verifyBtn=document.createElement('button');verifyBtn.className='captcha-verify-btn';verifyBtn.innerHTML=`
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        </svg>
        <span>点击进行验证</span>
      `;container.appendChild(verifyBtn);verifyBtn.addEventListener('click',()=>{captcha.showBox();});captcha.onSuccess(()=>{const result=captcha.getValidate();this.hideCaptchaModal();this.startCallWithCaptcha(result);});captcha.onError((err)=>{this.showToast('验证失败，请重试','error');});captcha.onClose(()=>{});});}
async startCallWithCaptcha(captchaResult){const isVideo=this.pendingCallType==='video';try{await this.liveCall.getToken(false,captchaResult);this.doStartCall(isVideo);}catch(error){this.showToast('验证失败: '+error.message,'error');}}
bindEvents(){const voiceCallBtn=document.getElementById('voiceCallBtn');if(voiceCallBtn){voiceCallBtn.addEventListener('click',()=>this.startCall(false));}
const videoCallBtn=document.getElementById('videoCallBtn');if(videoCallBtn){videoCallBtn.addEventListener('click',()=>this.startCall(true));}
const endCallBtn=document.getElementById('endCallBtn');if(endCallBtn){endCallBtn.addEventListener('click',()=>this.endCall());}
const cameraSwitchBtn=document.getElementById('cameraSwitchBtn');if(cameraSwitchBtn){cameraSwitchBtn.addEventListener('click',()=>this.switchCamera());}
const muteBtn=document.getElementById('muteBtn');if(muteBtn){muteBtn.addEventListener('click',()=>this.toggleMute());}
const speakerBtn=document.getElementById('speakerBtn');if(speakerBtn){speakerBtn.addEventListener('click',()=>this.toggleSpeaker());}
const voiceNameBtn=document.getElementById('voiceNameBtn');if(voiceNameBtn){voiceNameBtn.addEventListener('click',()=>this.showVoiceSelector());}
const closeVoiceSelector=document.getElementById('closeVoiceSelector');if(closeVoiceSelector){closeVoiceSelector.addEventListener('click',()=>this.hideVoiceSelector());}
const confirmVoiceBtn=document.getElementById('confirmVoiceBtn');if(confirmVoiceBtn){confirmVoiceBtn.addEventListener('click',()=>this.confirmVoiceSelection());}
if(this.voiceSelectorModal){this.voiceSelectorModal.addEventListener('click',(e)=>{if(e.target===this.voiceSelectorModal){this.hideVoiceSelector();}});}
document.addEventListener('keydown',(e)=>{if(e.key==='Escape'){if(this.voiceSelectorModal?.classList.contains('active')){this.hideVoiceSelector();}else if(this.callOverlay?.classList.contains('active')){this.endCall();}}});}
async startCall(isVideo=false){this.pendingCallType=isVideo?'video':'voice';this.isVideoMode=isVideo;try{await this.liveCall.getToken();this.doStartCall(isVideo);}catch(error){if(error.message!=='需要验证码验证'){this.showToast('通话启动失败: '+error.message,'error');}}}
async doStartCall(isVideo=false){this.isVideoMode=isVideo;this.showCallOverlay();this.resetMuteUI();this.liveCall.setMode(isVideo?'audio-video':'audio-only');const videoContainer=document.getElementById('videoContainer');const audioVisualizer=document.getElementById('audioVisualizer');if(isVideo){videoContainer.style.display='block';audioVisualizer.style.display='none';}else{videoContainer.style.display='none';audioVisualizer.style.display='flex';}
try{await this.liveCall.start(this.videoElement);this.startTimer();}catch(error){this.showToast('通话启动失败: '+error.message,'error');setTimeout(()=>{this.hideCallOverlay();},3000);}}
endCall(){this.liveCall.stop();this.hideCallOverlay();this.stopTimer();}
async switchCamera(){const btn=document.getElementById('cameraSwitchBtn');if(btn)btn.disabled=true;const success=await this.liveCall.switchCamera();if(success){this.showToast('摄像头已切换','success');}
if(btn)btn.disabled=false;}
resetMuteUI(){const btn=document.getElementById('muteBtn');if(!btn)return;const unmutedIcon=btn.querySelector('.unmuted-icon');const mutedIcon=btn.querySelector('.muted-icon');if(unmutedIcon)unmutedIcon.style.display='block';if(mutedIcon)mutedIcon.style.display='none';btn.classList.remove('active');}
toggleMute(){const isMuted=this.liveCall.toggleMute();const btn=document.getElementById('muteBtn');if(!btn)return;const unmutedIcon=btn.querySelector('.unmuted-icon');const mutedIcon=btn.querySelector('.muted-icon');if(isMuted){if(unmutedIcon)unmutedIcon.style.display='none';if(mutedIcon)mutedIcon.style.display='block';btn.classList.add('active');this.showToast('已静音','info');}else{if(unmutedIcon)unmutedIcon.style.display='block';if(mutedIcon)mutedIcon.style.display='none';btn.classList.remove('active');this.showToast('已取消静音','info');}}
toggleSpeaker(){const isSpeakerMuted=this.liveCall.toggleSpeakerMute();const btn=document.getElementById('speakerBtn');if(!btn)return;const onIcon=btn.querySelector('.speaker-on-icon');const offIcon=btn.querySelector('.speaker-off-icon');if(isSpeakerMuted){if(onIcon)onIcon.style.display='none';if(offIcon)offIcon.style.display='block';btn.classList.add('active');this.showToast('扬声器已关闭','info');}else{if(onIcon)onIcon.style.display='block';if(offIcon)offIcon.style.display='none';btn.classList.remove('active');this.showToast('扬声器已开启','info');}}
showVoiceSelector(){if(this.voiceSelectorModal){this.voiceSelectorModal.classList.add('active');}}
hideVoiceSelector(){if(this.voiceSelectorModal){this.voiceSelectorModal.classList.remove('active');}}
confirmVoiceSelection(){const selected=this.voiceSelectorModal.querySelector('input[name="voice"]:checked');if(selected){const voice=selected.value;const currentVoice=this.liveCall.selectedVoice;const isInCall=this.liveCall.isActive||this.liveCall.isConnecting;if(voice!==currentVoice){this.liveCall.setVoice(voice);const voiceInfo=this.liveCall.voiceConfigs[voice];const voiceNameBtn=document.getElementById('voiceNameBtn');if(voiceNameBtn&&voiceInfo){voiceNameBtn.textContent=`${voiceInfo.name} · ${voiceInfo.label}`;}
if(isInCall){this.showToast(`已选择 ${voiceInfo.name}，需要挂断后重新连接才能生效`,'warning',4000);}else{this.showToast(`已选择声音：${voiceInfo.name}`,'success');}}}
this.hideVoiceSelector();}
showCallOverlay(){if(this.callOverlay){this.callOverlay.classList.add('active');document.body.style.overflow='hidden';}}
hideCallOverlay(){if(this.callOverlay){this.callOverlay.classList.remove('active');document.body.style.overflow='';}}
onStatusChange(status,message){const indicator=document.getElementById('callStatusIndicator');const text=document.getElementById('callStatusText');if(indicator&&text){indicator.className='status-indicator '+status;text.textContent=message;}
const circle=document.getElementById('visualizerCircle');if(circle){if(status==='connected'){circle.classList.add('active');}else{circle.classList.remove('active');}}}
onMessage(msg){if(msg.type==='text'){}}
onError(error){this.showToast(error,'error');}
onAudioLevel(level,isSpeaking){const circle=document.getElementById('visualizerCircle');const indicator=document.getElementById('speakingIndicator');if(circle){const scale=1+Math.min(level*10,0.3);circle.style.transform=`scale(${scale})`;}
if(indicator){indicator.classList.toggle('active',isSpeaking);}}
timerInterval=null;timerSeconds=0;startTimer(){this.timerSeconds=0;this.updateTimerDisplay();this.timerInterval=setInterval(()=>{this.timerSeconds++;this.updateTimerDisplay();},1000);}
stopTimer(){if(this.timerInterval){clearInterval(this.timerInterval);this.timerInterval=null;}
this.timerSeconds=0;}
updateTimerDisplay(){const timer=document.getElementById('callTimer');if(timer){const mins=Math.floor(this.timerSeconds/60);const secs=this.timerSeconds%60;timer.textContent=`${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;}}
showToast(message,type='info',duration=3000){const overlay=document.getElementById('liveCallOverlay');const isInCall=overlay&&overlay.classList.contains('active');if(isInCall){const toast=document.createElement('div');toast.className=`live-toast live-toast-${type}`;toast.textContent=message;toast.style.cssText=`
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        padding: 12px 24px;
        border-radius: 8px;
        color: white;
        font-size: 14px;
        font-weight: 500;
        z-index: 999999;
        box-shadow: 0 4px 20px rgba(0,0,0,0.4);
        max-width: 80%;
        text-align: center;
        background: ${type==='warning'?'#f59e0b':type==='error'?'#ef4444':type==='success'?'#10b981':'#3b82f6'};
      `;document.body.appendChild(toast);setTimeout(()=>{toast.style.opacity='0';toast.style.transition='opacity 0.3s';setTimeout(()=>toast.remove(),300);},duration);return;}
if(typeof showToast==='function'){showToast(message,type,duration);}else if(typeof app!=='undefined'&&typeof app.showNotification==='function'){app.showNotification(message,type,duration);}else{}}}
let liveCallUI=null;document.addEventListener('DOMContentLoaded',()=>{if(document.getElementById('voiceCallBtn')||document.getElementById('videoCallBtn')){liveCallUI=new LiveCallUI();}});if(typeof window!=='undefined'){window.LiveCallUI=LiveCallUI;}