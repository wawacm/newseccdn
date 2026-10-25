var v=Object.defineProperty;var u=(c,e,t)=>e in c?v(c,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):c[e]=t;var d=(c,e,t)=>u(c,typeof e!="symbol"?e+"":e,t);class LiveCallUI{constructor(){d(this,"timerInterval",null);d(this,"timerSeconds",0);this.liveCall=null,this.callOverlay=null,this.voiceSelectorModal=null,this.captchaModal=null,this.isVideoMode=!1,this.videoElement=null,this.pendingCallType=null,this.geetestInstance=null,this.transcriptRows={},this.activeTools=new Map,this.init()}init(){this.liveCall=new LiveCall({tokenEndpoint:"/api/live-token.php",onStatusChange:(e,t)=>this.onStatusChange(e,t),onMessage:e=>this.onMessage(e),onError:e=>this.onError(e),onAudioLevel:(e,t)=>this.onAudioLevel(e,t)}),this.createCallOverlay(),this.createVoiceSelectorModal(),this.createCaptchaModal(),this.bindEvents(),window.addEventListener("liveCallCaptchaRequired",e=>{this.showCaptchaModal(e.detail.captcha_id)}),window.addEventListener("beforeunload",()=>{this.liveCall&&this.liveCall.stop()})}createCallOverlay(){if(document.getElementById("liveCallOverlay")){this.callOverlay=document.getElementById("liveCallOverlay");return}const e=document.createElement("div");e.id="liveCallOverlay",e.className="live-call-overlay",e.innerHTML=`
            <div class="call-container">
                <!-- \u9876\u90E8\u72B6\u6001\u680F -->
                <div class="call-header">
                    <div class="call-status">
                        <div class="status-indicator" id="callStatusIndicator"></div>
                        <span class="status-text" id="callStatusText">\u51C6\u5907\u4E2D...</span>
                    </div>
                    <div class="call-timer" id="callTimer">00:00</div>
                    <button class="call-close" id="closeLiveCallBtn" aria-label="\u5173\u95ED\u901A\u8BDD">\xD7</button>
                </div>
                
                <!-- \u89C6\u9891\u533A\u57DF -->
                <div class="video-container" id="videoContainer" style="display: none;">
                    <video id="callVideo" autoplay playsinline muted></video>
                    <button class="camera-switch-btn" id="cameraSwitchBtn" title="\u5207\u6362\u6444\u50CF\u5934">
                        <svg viewBox="0 0 24 24" width="24" height="24">
                            <path fill="currentColor" d="M20 4h-3.17L15 2H9L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM9.88 4h4.24l1.83 2H20v12H4V6h4.05"/>
                            <circle fill="currentColor" cx="12" cy="12" r="4"/>
                            <path fill="currentColor" d="M5 12l3-3v2h4v2H8v2z"/>
                        </svg>
                    </button>
                </div>
                
                <!-- \u97F3\u9891\u53EF\u89C6\u5316 -->
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
                        <span class="speaking-text">\u6B63\u5728\u8BF4\u8BDD...</span>
                    </div>
                </div>
                
                <section class="call-transcripts" aria-label="\u901A\u8BDD\u6587\u5B57">
                    <div class="call-transcript-heading"><strong>\u901A\u8BDD\u6587\u5B57</strong><span id="callToolStatus" role="status"></span></div>
                    <div id="callTranscriptLog" class="call-transcript-log" role="log" aria-live="off"><p class="call-transcript-empty">\u5F00\u59CB\u8BF4\u8BDD\uFF0C\u53CC\u65B9\u6587\u5B57\u4F1A\u663E\u793A\u5728\u8FD9\u91CC</p></div>
                </section>
                <!-- \u5F53\u524D\u58F0\u97F3 -->
                <div class="current-voice" id="currentVoice">
                    <span class="voice-label">\u58F0\u97F3\uFF1A</span>
                    <button class="voice-name" id="voiceNameBtn">Aoede \xB7 \u5973\u6027\xB7\u6E29\u67D4</button>
                </div>
                
                <!-- \u63A7\u5236\u6309\u94AE -->
                <div class="call-controls">
                    <button class="control-btn mute-btn" id="muteBtn" title="\u9759\u97F3">
                        <svg class="unmuted-icon" viewBox="0 0 24 24" width="28" height="28">
                            <path fill="currentColor" d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                            <path fill="currentColor" d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                        </svg>
                        <svg class="muted-icon" viewBox="0 0 24 24" width="28" height="28" style="display:none;">
                            <path fill="currentColor" d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z"/>
                        </svg>
                    </button>
                    
                    <button class="control-btn end-btn" id="endCallBtn" title="\u7ED3\u675F\u901A\u8BDD">
                        <svg viewBox="0 0 24 24" width="32" height="32">
                            <path fill="currentColor" d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.73-1.68-1.36-2.66-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"/>
                        </svg>
                    </button>
                    
                    <button class="control-btn speaker-btn" id="speakerBtn" title="\u626C\u58F0\u5668">
                        <svg class="speaker-on-icon" viewBox="0 0 24 24" width="28" height="28">
                            <path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                        </svg>
                        <svg class="speaker-off-icon" viewBox="0 0 24 24" width="28" height="28" style="display:none;">
                            <path fill="currentColor" d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                        </svg>
                    </button>
                </div>
            </div>
        `,document.body.appendChild(e),this.callOverlay=e,this.videoElement=document.getElementById("callVideo"),document.getElementById("closeLiveCallBtn").addEventListener("click",()=>{this.endCall(),this.hideCallOverlay()}),window.addEventListener("wawa-account-cleared",()=>{this.endCall(),this.hideCallOverlay(),this.resetTranscript()}),window.addEventListener("wawa-account-locked",()=>{this.endCall(),this.hideCallOverlay()})}createVoiceSelectorModal(){if(document.getElementById("voiceSelectorModal")){this.voiceSelectorModal=document.getElementById("voiceSelectorModal");return}const e=this.liveCall.getVoiceList(),t=document.createElement("div");t.id="voiceSelectorModal",t.className="voice-selector-modal",t.innerHTML=`
            <div class="voice-selector-content">
                <div class="voice-selector-header">
                    <h3>\u9009\u62E9\u58F0\u97F3</h3>
                    <button class="close-btn" id="closeVoiceSelector">&times;</button>
                </div>
                <div class="voice-options">
                    ${e.map(i=>`
                        <label class="voice-option" data-voice="${i.value}">
                            <input type="radio" name="voice" value="${i.value}" ${i.value==="Aoede"?"checked":""}>
                            <div class="voice-info">
                                <span class="voice-name">${i.name}</span>
                                <span class="voice-desc">${i.label}</span>
                            </div>
                            <div class="voice-check">\u2713</div>
                        </label>
                    `).join("")}
                </div>
                <button class="voice-confirm-btn" id="confirmVoiceBtn">\u786E\u5B9A</button>
            </div>
        `,document.body.appendChild(t),this.voiceSelectorModal=t}createCaptchaModal(){if(document.getElementById("captchaModal")){this.captchaModal=document.getElementById("captchaModal");return}const e=document.createElement("div");e.id="captchaModal",e.className="captcha-modal",e.innerHTML=`
      <div class="captcha-modal-content">
        <div class="captcha-modal-header">
          <div class="captcha-icon">
            <svg viewBox="0 0 24 24" width="32" height="32">
              <path fill="currentColor" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
            </svg>
          </div>
          <h3>\u5B89\u5168\u9A8C\u8BC1</h3>
          <p class="captcha-subtitle">\u8BF7\u5B8C\u6210\u9A8C\u8BC1\u540E\u7EE7\u7EED\u4F7F\u7528\u8BED\u97F3\u901A\u8BDD</p>
          <button class="captcha-close-btn" id="closeCaptchaModal">&times;</button>
        </div>
        <div class="captcha-body">
          <div id="geetestCaptcha" class="geetest-captcha-container">
            <div class="captcha-loading">
              <div class="captcha-spinner"></div>
              <span>\u52A0\u8F7D\u9A8C\u8BC1\u7801\u4E2D...</span>
            </div>
          </div>
        </div>
        <div class="captcha-footer">
          <p class="captcha-hint">\u9A8C\u8BC1\u6210\u529F\u540E\u5C06\u81EA\u52A8\u5F00\u59CB\u901A\u8BDD</p>
        </div>
      </div>
    `,document.body.appendChild(e),this.captchaModal=e;const t=document.getElementById("closeCaptchaModal");t&&t.addEventListener("click",()=>this.hideCaptchaModal()),e.addEventListener("click",i=>{i.target===e&&this.hideCaptchaModal()})}showCaptchaModal(e){this.captchaModal&&(this.captchaModal.classList.add("active"),this.loadGeetestSDK().then(()=>{this.initGeetest(e)}).catch(t=>{this.showToast("\u9A8C\u8BC1\u7801\u52A0\u8F7D\u5931\u8D25\uFF0C\u8BF7\u5237\u65B0\u91CD\u8BD5","error")}))}hideCaptchaModal(){if(this.captchaModal&&(this.captchaModal.classList.remove("active"),this.pendingCallType=null),this.geetestInstance)try{this.geetestInstance.reset()}catch{}}loadGeetestSDK(){return new Promise((e,t)=>{if(window.initGeetest4){e();return}const i=document.createElement("script");i.src="https://static.geetest.com/v4/gt4.js",i.onload=()=>{e()},i.onerror=()=>{t(new Error("\u6781\u9A8C SDK \u52A0\u8F7D\u5931\u8D25"))},document.head.appendChild(i)})}initGeetest(e){if(!window.initGeetest4)return;const t=document.getElementById("geetestCaptcha");t&&(t.innerHTML="",initGeetest4({captchaId:e,product:"bind",language:"zho",protocol:"https://"},i=>{this.geetestInstance=i;const s=document.createElement("button");s.className="captcha-verify-btn",s.innerHTML=`
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        </svg>
        <span>\u70B9\u51FB\u8FDB\u884C\u9A8C\u8BC1</span>
      `,t.appendChild(s),s.addEventListener("click",()=>{i.showBox()}),i.onSuccess(()=>{const l=i.getValidate();this.hideCaptchaModal(),this.startCallWithCaptcha(l)}),i.onError(l=>{this.showToast("\u9A8C\u8BC1\u5931\u8D25\uFF0C\u8BF7\u91CD\u8BD5","error")}),i.onClose(()=>{})}))}async startCallWithCaptcha(e){const t=this.pendingCallType==="video";try{await this.liveCall.getToken(!1,e),await this.doStartCall(t)}catch(i){this.showToast("\u9A8C\u8BC1\u5931\u8D25: "+i.message,"error")}}bindEvents(){const e=document.getElementById("voiceCallBtn");e&&e.addEventListener("click",()=>this.startCall(!1));const t=document.getElementById("videoCallBtn");t&&t.addEventListener("click",()=>this.startCall(!0));const i=document.getElementById("endCallBtn");i&&i.addEventListener("click",()=>this.endCall());const s=document.getElementById("cameraSwitchBtn");s&&s.addEventListener("click",()=>this.switchCamera());const l=document.getElementById("muteBtn");l&&l.addEventListener("click",()=>this.toggleMute());const a=document.getElementById("speakerBtn");a&&a.addEventListener("click",()=>this.toggleSpeaker());const o=document.getElementById("voiceNameBtn");o&&o.addEventListener("click",()=>this.showVoiceSelector());const n=document.getElementById("closeVoiceSelector");n&&n.addEventListener("click",()=>this.hideVoiceSelector());const h=document.getElementById("confirmVoiceBtn");h&&h.addEventListener("click",()=>this.confirmVoiceSelection()),this.voiceSelectorModal&&this.voiceSelectorModal.addEventListener("click",r=>{r.target===this.voiceSelectorModal&&this.hideVoiceSelector()}),document.addEventListener("keydown",r=>{r.key==="Escape"&&(this.voiceSelectorModal?.classList.contains("active")?this.hideVoiceSelector():this.callOverlay?.classList.contains("active")&&this.endCall())})}async startCall(e=!1){if(!(this.liveCall.isActive||this.liveCall.isConnecting||this.startingCall)){this.liveCall.setMode(e?"audio-video":"audio-only"),this.startingCall=!0,this.pendingCallType=e?"video":"voice",this.isVideoMode=e;try{await this.liveCall.getToken(),await this.doStartCall(e)}catch(t){t.message!=="\u9700\u8981\u9A8C\u8BC1\u7801\u9A8C\u8BC1"&&this.showToast("\u901A\u8BDD\u542F\u52A8\u5931\u8D25: "+t.message,"error")}finally{this.startingCall=!1}}}async doStartCall(e=!1){this.isVideoMode=e,this.resetTranscript(),document.getElementById("endCallBtn").disabled=!1,this.showCallOverlay(),this.resetMuteUI(),this.liveCall.setMode(e?"audio-video":"audio-only");const t=document.getElementById("videoContainer"),i=document.getElementById("audioVisualizer");e?(t.style.display="block",i.style.display="none"):(t.style.display="none",i.style.display="flex");try{await this.liveCall.start(this.videoElement),this.startTimer()}catch(s){this.showToast("\u901A\u8BDD\u542F\u52A8\u5931\u8D25: "+s.message,"error"),setTimeout(()=>{this.hideCallOverlay()},3e3)}}endCall(){this.liveCall.stop(),this.stopTimer(),this.transcriptRows={},this.activeTools.clear();const e=document.getElementById("callStatusText");e&&(e.textContent="\u901A\u8BDD\u5DF2\u7ED3\u675F");const t=document.getElementById("callToolStatus");t&&(t.textContent="");const i=document.getElementById("endCallBtn");i&&(i.disabled=!0)}async switchCamera(){const e=document.getElementById("cameraSwitchBtn");e&&(e.disabled=!0);try{await this.liveCall.switchCamera()?this.showToast("\u6444\u50CF\u5934\u5DF2\u5207\u6362","success"):this.showToast("\u6444\u50CF\u5934\u5207\u6362\u5931\u8D25","error")}catch{this.showToast("\u6444\u50CF\u5934\u5207\u6362\u5931\u8D25","error")}e&&(e.disabled=!1)}resetMuteUI(){const e=document.getElementById("muteBtn");if(!e)return;const t=e.querySelector(".unmuted-icon"),i=e.querySelector(".muted-icon");t&&(t.style.display="block"),i&&(i.style.display="none"),e.classList.remove("active")}toggleMute(){const e=this.liveCall.toggleMute(),t=document.getElementById("muteBtn");if(!t)return;const i=t.querySelector(".unmuted-icon"),s=t.querySelector(".muted-icon");e?(i&&(i.style.display="none"),s&&(s.style.display="block"),t.classList.add("active"),this.showToast("\u5DF2\u9759\u97F3","info")):(i&&(i.style.display="block"),s&&(s.style.display="none"),t.classList.remove("active"),this.showToast("\u5DF2\u53D6\u6D88\u9759\u97F3","info"))}toggleSpeaker(){const e=this.liveCall.toggleSpeakerMute(),t=document.getElementById("speakerBtn");if(!t)return;const i=t.querySelector(".speaker-on-icon"),s=t.querySelector(".speaker-off-icon");e?(i&&(i.style.display="none"),s&&(s.style.display="block"),t.classList.add("active"),this.showToast("\u626C\u58F0\u5668\u5DF2\u5173\u95ED","info")):(i&&(i.style.display="block"),s&&(s.style.display="none"),t.classList.remove("active"),this.showToast("\u626C\u58F0\u5668\u5DF2\u5F00\u542F","info"))}showVoiceSelector(){this.voiceSelectorModal&&this.voiceSelectorModal.classList.add("active")}hideVoiceSelector(){this.voiceSelectorModal&&this.voiceSelectorModal.classList.remove("active")}confirmVoiceSelection(){const e=this.voiceSelectorModal.querySelector('input[name="voice"]:checked');if(e){const t=e.value,i=this.liveCall.selectedVoice,s=this.liveCall.isActive||this.liveCall.isConnecting;if(t!==i){this.liveCall.setVoice(t);const l=this.liveCall.voiceConfigs[t],a=document.getElementById("voiceNameBtn");a&&l&&(a.textContent=`${l.name} \xB7 ${l.label}`),s?this.showToast(`\u5DF2\u9009\u62E9 ${l.name}\uFF0C\u9700\u8981\u6302\u65AD\u540E\u91CD\u65B0\u8FDE\u63A5\u624D\u80FD\u751F\u6548`,"warning",4e3):this.showToast(`\u5DF2\u9009\u62E9\u58F0\u97F3\uFF1A${l.name}`,"success")}}this.hideVoiceSelector()}showCallOverlay(){this.callOverlay&&(this.callOverlay.classList.add("active"),document.body.style.overflow="hidden")}hideCallOverlay(){this.callOverlay&&(this.callOverlay.classList.remove("active"),document.body.style.overflow="")}onStatusChange(e,t){const i=document.getElementById("callStatusIndicator"),s=document.getElementById("callStatusText");i&&s&&(i.className="status-indicator "+e,s.textContent=t);const l=document.getElementById("visualizerCircle");l&&(e==="connected"?l.classList.add("active"):l.classList.remove("active"))}onMessage(e){const t=document.getElementById("callTranscriptLog");if(t){if(e.type==="tool"){e.state==="running"?this.activeTools.set(e.id||"current",e.message):this.activeTools.delete(e.id||"current"),document.getElementById("callToolStatus").textContent=[...this.activeTools.values()].at(-1)||"";return}if(e.type==="turn-end"){delete this.transcriptRows.assistant,this.activeTools.size||(document.getElementById("callToolStatus").textContent="");return}if(e.type==="transcript"){const i=e.role==="user"?"user":"assistant";let s=this.transcriptRows[i];if(!s&&!e.content)return;const l=t.scrollHeight-t.scrollTop-t.clientHeight<64;if(!s){t.querySelector(".call-transcript-empty")?.remove();const a=document.createElement("div");a.className="call-transcript-row "+i;const o=document.createElement("strong");o.textContent=i==="user"?"\u4F60":"\u5A03\u5A03AI";const n=document.createElement("p");a.append(o,n),t.append(a),s=this.transcriptRows[i]={element:a,body:n,transcription:!1}}e.source==="transcription"&&!s.transcription&&(s.body.textContent="",s.transcription=!0),(e.source!=="part"||!s.transcription)&&s.body.append(document.createTextNode(e.content||"")),e.finished&&i==="user"&&delete this.transcriptRows.user,l&&(t.scrollTop=t.scrollHeight)}if(e.type==="sources"){const i=this.transcriptRows.assistant?.element||t.lastElementChild;if(!i)return;for(const s of e.sources.slice(0,5)){let l;try{l=new URL(s.uri||s.url)}catch{continue}if(!["https:","http:"].includes(l.protocol)||[...i.querySelectorAll("a")].some(o=>o.href===l.href))continue;const a=document.createElement("a");a.href=l.href,a.target="_blank",a.rel="noopener noreferrer",a.textContent=s.title||l.hostname,i.append(a)}}}}resetTranscript(){this.transcriptRows={},this.activeTools.clear();const e=document.getElementById("callTranscriptLog");e&&(e.innerHTML='<p class="call-transcript-empty">\u5F00\u59CB\u8BF4\u8BDD\uFF0C\u53CC\u65B9\u6587\u5B57\u4F1A\u663E\u793A\u5728\u8FD9\u91CC</p>');const t=document.getElementById("callToolStatus");t&&(t.textContent="")}onError(e){this.showToast(e,"error")}onAudioLevel(e,t){const i=document.getElementById("visualizerCircle"),s=document.getElementById("speakingIndicator");if(i){const l=1+Math.min(e*10,.3);i.style.transform=`scale(${l})`}s&&s.classList.toggle("active",t)}startTimer(){this.timerSeconds=0,this.updateTimerDisplay(),this.timerInterval=setInterval(()=>{this.timerSeconds++,this.updateTimerDisplay()},1e3)}stopTimer(){this.timerInterval&&(clearInterval(this.timerInterval),this.timerInterval=null),this.timerSeconds=0}updateTimerDisplay(){const e=document.getElementById("callTimer");if(e){const t=Math.floor(this.timerSeconds/60),i=this.timerSeconds%60;e.textContent=`${String(t).padStart(2,"0")}:${String(i).padStart(2,"0")}`}}showToast(e,t="info",i=3e3){const s=document.getElementById("liveCallOverlay");if(s&&s.classList.contains("active")){const a=document.createElement("div");a.className=`live-toast live-toast-${t}`,a.textContent=e,a.style.cssText=`
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
        background: ${t==="warning"?"#f59e0b":t==="error"?"#ef4444":t==="success"?"#10b981":"#3b82f6"};
      `,document.body.appendChild(a),setTimeout(()=>{a.style.opacity="0",a.style.transition="opacity 0.3s",setTimeout(()=>a.remove(),300)},i);return}typeof showToast=="function"?showToast(e,t,i):typeof app<"u"&&typeof app.showNotification=="function"&&app.showNotification(e,t,i)}}let liveCallUI=null;document.addEventListener("DOMContentLoaded",()=>{(document.getElementById("voiceCallBtn")||document.getElementById("videoCallBtn"))&&(liveCallUI=new LiveCallUI)}),typeof window<"u"&&(window.LiveCallUI=LiveCallUI);
