/* Vulnerability submissions use the established Memo AURA UI; PHP verifies every final request. */
(() => {
  'use strict';
  if(window.SecRisk)return;
  const mount=document.createElement('div');mount.innerHTML="    <div class=\"aura-overlay\" id=\"auraOverlay\" hidden aria-hidden=\"true\" data-ui>\n        <div class=\"aura-modal\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"auraTitle\" tabindex=\"-1\">\n            <div class=\"aura-header\">\n                <div class=\"aura-brand\" id=\"auraTitle\">\n                    <div class=\"sec-risk-shield-icon-wrapper\" aria-hidden=\"true\"><div class=\"sec-risk-shield-pulse\"></div>\n                        <svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z\" /></svg>\n                    </div><span>人机验证</span>\n                </div>\n                <button type=\"button\" class=\"aura-close\" id=\"auraClose\" aria-label=\"关闭验证窗口\"><svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"m18 6-12 12M6 6l12 12\" /></svg></button>\n            </div>\n\n            <div class=\"aura-body\">\n                <div class=\"sec-risk-scan-state\" id=\"scanState\">\n                    <div class=\"sec-risk-scan-circle\"></div>\n                    <div class=\"sec-risk-scan-text\"><span id=\"scanText\" role=\"status\">正在评估环境风险</span><div class=\"sec-risk-scan-dots\" aria-hidden=\"true\"><span>.</span><span>.</span><span>.</span></div></div>\n                </div>\n                <div id=\"auraStage\" aria-live=\"polite\"></div>\n            </div>\n\n            <div class=\"aura-footer\">\n                <div class=\"sec-risk-security-status\"><span class=\"sec-risk-status-dot\" id=\"auraStatusDot\"></span><span id=\"auraStatusText\">娃娃团队_云域安全</span></div>\n                <a class=\"aura-help-link\" href=\"mailto:wawa@wawacm.com\" target=\"_blank\" rel=\"noopener noreferrer\">无法使用验证码？</a>\n            </div>\n        </div>\n    </div>";
  document.body.appendChild(mount.firstElementChild);
  const riskUrl=new URL('risk.php',location.href).href;
  const byId=id=>document.getElementById(id);
  const ui={overlay:byId('auraOverlay'),close:byId('auraClose'),scan:byId('scanState'),text:byId('scanText'),stage:byId('auraStage'),status:byId('auraStatusText'),dot:byId('auraStatusDot')};
  const state={id:0,challenge:0,pending:null,resolve:null,submitting:false,geetest:null,hcaptcha:null,requests:new Set(),closeTimer:null,readyTimer:null,checking:false};
  const config={},sdkPromises=new Map();
  const escape=text=>String(text??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  const active=id=>id===state.id&&ui.overlay.classList.contains('active');
  const current=(id,generation)=>active(id)&&generation===state.challenge;
  function resetCaptcha(){
    state.challenge++;clearTimeout(state.readyTimer);state.readyTimer=null;
    try{state.geetest?.destroy?.();}catch{}
    try{if(state.hcaptcha!==null)window.hcaptcha?.remove?.(state.hcaptcha);}catch{}
    state.geetest=null;state.hcaptcha=null;
  }
  function finish(value){
    if(!state.pending)return;
    state.id++;state.checking=false;resetCaptcha();state.requests.forEach(c=>c.abort());state.requests.clear();
    state.submitting=false;ui.close.disabled=false;
    ui.overlay.classList.remove('active');ui.overlay.classList.add('closing');
    if(state.form&&!state.formWasInert)state.form.removeAttribute('inert');
    state.closeTimer=setTimeout(()=>{
      ui.overlay.hidden=true;ui.overlay.setAttribute('aria-hidden','true');ui.overlay.classList.remove('closing');ui.stage.innerHTML='';
      if(state.focus?.isConnected)state.focus.focus();
    },320);
    const resolve=state.resolve;state.resolve=null;state.pending=null;state.data=null;state.entries=null;state.form=null;state.url=null;state.csrf=null;state.action=null;resolve(value);
  }
  function stage(html){ui.scan.classList.add('hidden');ui.stage.innerHTML=html;ui.stage.classList.add('visible');}
  function loading(text){stage(`<div class="aura-submit-state"><div class="aura-submit-spinner" aria-hidden="true"></div><div class="title">请求处理中</div><div class="aura-desc">${escape(text)}</div></div>`);}
  function error(text,id){
    stage(`<div class="aura-error-state"><div class="title">验证未完成</div><div class="aura-desc">${escape(text)}</div><button type="button" class="aura-retry">重新验证</button></div>`);
    ui.stage.querySelector('.aura-retry').addEventListener('click',()=>{if(active(id))check(id);});
  }
  function pass(text){ui.dot.classList.add('secure');stage(`<div class="aura-pass-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m7 12 3 3 7-7"/></svg><div class="title">验证通过</div><div class="aura-desc">${escape(text)}</div></div>`);}
  async function post(url,data,method='POST'){
    const isForm=typeof FormData!=='undefined'&&data instanceof FormData;
    const controller=new AbortController();state.requests.add(controller);
    const timer=setTimeout(()=>controller.abort(),method==='POST'&&url===state.url?(isForm?45000:30000):18000);
    try{
      const headers={'Accept':'application/json','X-Requested-With':'XMLHttpRequest'};
      if(method==='POST'&&!isForm)headers['Content-Type']='application/x-www-form-urlencoded';
      const body=method==='POST'?(isForm?data:(data instanceof URLSearchParams?data:new URLSearchParams(data))):undefined;
      const response=await fetch(url,{method,credentials:'same-origin',cache:'no-store',signal:controller.signal,headers,...(method==='POST'?{body}:{})});
      let parsed;try{parsed=await response.json();}catch{throw Error('服务返回异常，请刷新页面后重试。');}
      if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))throw Error('安全验证响应格式异常。');
      if(!response.ok)throw Error(parsed.msg||parsed.error||'验证请求失败，请稍后重试。');
      return parsed;
    }finally{clearTimeout(timer);state.requests.delete(controller);}
  }
  function script(kind){
    const ready=()=>kind==='geetest'?typeof window.initGeetest4==='function':typeof window.hcaptcha?.render==='function';
    if(sdkPromises.has(kind))return sdkPromises.get(kind);
    if(ready())return Promise.resolve();
    const promise=new Promise((resolve,reject)=>{
      const el=document.createElement('script');el.async=true;el.defer=true;el.dataset.rcCaptcha=kind;
      el.src=kind==='geetest'?'https://static.geetest.com/v4/gt4.js':'https://js.hcaptcha.com/1/api.js?onload=rcHcaptchaReady&render=explicit';
      const timer=setTimeout(()=>failed(),12000);
      const failed=()=>{clearTimeout(timer);el.remove();reject(Error('验证码加载失败，请检查网络后重试。'));};
      const loaded=()=>{clearTimeout(timer);if(ready())resolve();else failed();};
      if(kind==='hcaptcha')window.rcHcaptchaReady=loaded;
      el.onload=()=>{if(kind==='geetest')loaded();};el.onerror=failed;
      document.head.appendChild(el);
    });
    sdkPromises.set(kind,promise);promise.catch(()=>sdkPromises.delete(kind));return promise;
  }
  async function submit(id,captcha){
    if(!active(id)||state.submitting)return;
    state.submitting=true;ui.close.disabled=true;
    const refApi=window.SecRefImages;
    if(refApi?.isCompressing?.()){
      loading('正在等待参考图压缩完成…');
      await refApi.waitReady();
      if(!active(id)){state.submitting=false;ui.close.disabled=false;return;}
    }
    const refFiles=refApi?.getFiles?.()||[];
    loading(refFiles.length>0?'正在加密上传参考图并提交报告…':'正在校验并提交请求…');
    let next=null;
    try{
      const data=new URLSearchParams(state.entries);
      for(const key of [...data.keys()])if(key.startsWith('risk_'))data.delete(key);
      for(const [key,value] of Object.entries({...state.data,risk_csrf:state.csrf,...captcha}))data.set(key,value);
      let payload=data;
      if(refFiles.length>0){
        const fd=new FormData();
        for(const [k,v] of data.entries())fd.append(k,v);
        for(const item of refFiles){
          if(item?.blob)fd.append('ref_images[]',item.blob,item.filename||'ref.webp');
        }
        payload=fd;
      }
      const result=await post(state.url,payload);if(!active(id))return;
      if(result.risk?.blocked===true){error(result.msg||'当前 IP 已被禁止访问。',id);return;}
      if(result.risk?.csrf_invalid===true){error(result.msg||'验证凭据已过期，请重新验证。',id);return;}
      if(result.risk?.captcha_required===true){Object.assign(config,result.risk);next=[0,1,2].includes(result.risk.score)?result.risk.score:2;}
      else if(result.code===1){pass('提交成功');await sleep(250);if(active(id))finish(result);}
      else if(Number.isInteger(result.code)&&typeof result.msg==='string')finish(result);
      else throw Error('服务返回异常，请刷新页面后重试。');
    }catch(e){if(active(id))error(e.name==='AbortError'?'提交结果尚未确认，请稍后检查后再提交。':e.message,id);}
    finally{state.submitting=false;ui.close.disabled=false;}
    if(next!==null&&active(id))await challenge(id,next);
  }
  async function hcaptcha(id){
    if(!active(id))return;resetCaptcha();const generation=state.challenge;loading('正在加载 hCaptcha 验证…');
    try{
      await script('hcaptcha');if(!current(id,generation))return;
      if(!config.hcaptcha_site_key)throw Error('验证码尚未配置，请联系站点管理员。');
      stage('<div id="aura-hcaptcha-container" class="aura-hcaptcha-slot"></div>');
      state.hcaptcha=window.hcaptcha.render('aura-hcaptcha-container',{sitekey:config.hcaptcha_site_key,theme:'light',size:ui.stage.clientWidth<304?'compact':'normal',
        callback:token=>{if(current(id,generation)&&typeof token==='string'&&token)submit(id,{risk_captcha_type:'hcaptcha',risk_hcaptcha_token:token});},
        'error-callback':()=>{if(current(id,generation))error('hCaptcha 验证失败，请重试。',id);},
        'expired-callback':()=>{if(current(id,generation))error('验证码已过期，请重新验证。',id);}
      });
    }catch(e){if(current(id,generation))error(e.message,id);}
  }
  async function geetest(id){
    if(!active(id))return;resetCaptcha();const generation=state.challenge;loading('正在加载极验验证…');
    try{
      await script('geetest');if(!current(id,generation))return;
      if(!config.captcha_id)throw Error('极验未配置');
      stage('<div class="aura-loading">请完成极验验证</div>');
      state.readyTimer=setTimeout(()=>{if(current(id,generation))hcaptcha(id);},12000);
      window.initGeetest4({captchaId:config.captcha_id,product:'bind',language:'zho'},object=>{
        if(!current(id,generation)){try{object.destroy();}catch{}return;}
        state.geetest=object;
        object.onReady(()=>{if(current(id,generation)){clearTimeout(state.readyTimer);state.readyTimer=null;object.showCaptcha();}});
        object.onSuccess(()=>{if(current(id,generation)){const proof=object.getValidate();if(proof)submit(id,{risk_captcha_type:'geetest',risk_lot_number:proof.lot_number,risk_captcha_output:proof.captcha_output,risk_pass_token:proof.pass_token,risk_gen_time:proof.gen_time});else error('验证结果为空，请重试。',id);}});
        object.onError(()=>{if(current(id,generation))hcaptcha(id);});
        object.onClose(()=>{if(current(id,generation)&&!state.submitting)error('验证已取消，可重新验证或关闭窗口。',id);});
      });
    }catch{if(current(id,generation))await hcaptcha(id);}
  }
  async function challenge(id,score){
    ui.status.textContent=`风险等级：${score}`;
    if(score===0){pass('低风险环境，正在自动提交');await sleep(250);if(active(id))await submit(id,{risk_captcha_type:'none'});}
    else if(score===1)await geetest(id);else await hcaptcha(id);
  }
  async function check(id){
    if(state.checking||!active(id))return;state.checking=true;
    try{await checkOnce(id);}finally{state.checking=false;}
  }
  async function checkOnce(id){
    resetCaptcha();ui.scan.classList.remove('hidden');ui.stage.classList.remove('visible');ui.stage.innerHTML='';ui.text.textContent='正在评估环境风险';ui.dot.className='sec-risk-status-dot';ui.status.textContent='娃娃团队_云域安全';
    let result;
    try{
      const [boot]=await Promise.all([post(riskUrl+'?action=bootstrap',null,'GET'),sleep(650)]);
      if(!active(id))return;
      if(boot.code!==1||typeof boot.risk_csrf!=='string')throw Error(boot.msg||'安全配置正在更新，请刷新页面后重试。');
      state.csrf=boot.risk_csrf;Object.assign(config,boot);
    }catch(e){if(active(id))error(e.name==='AbortError'?'请求超时，请重新验证。':e.message,id);return;}
    try{
      result=await post(riskUrl+'?action=preview',{risk_csrf:state.csrf,...state.data});
      if(!active(id))return;
      if(result.code!==1){error(result.msg||'安全验证暂不可用，请稍后重试。',id);return;}
    }catch{result={score:2};}
    if(!active(id))return;
    if(result.blocked===true){ui.status.textContent='访问受限';stage('<div class="aura-error-state"><div class="title">访问受限</div><div class="aura-desc">当前 IP 已被禁止访问，请联系管理员。</div></div>');return;}
    await challenge(id,Number.isInteger(result.score)&&[0,1,2].includes(result.score)?result.score:2);
  }
  window.SecRisk={run(action,entries,form,url){
    if(state.pending)return state.pending;
    clearTimeout(state.closeTimer);resetCaptcha();state.id++;state.entries=entries;state.form=form;state.action=action;state.url=url;
    let timezone='UTC';try{timezone=Intl.DateTimeFormat().resolvedOptions().timeZone||'UTC';}catch{}
    state.data={risk_timezone:timezone};state.focus=document.activeElement;state.formWasInert=form.hasAttribute('inert');form.setAttribute('inert','');
    ui.overlay.hidden=false;ui.overlay.setAttribute('aria-hidden','false');ui.overlay.classList.remove('closing');ui.overlay.classList.add('active');ui.close.focus();
    state.pending=new Promise(resolve=>{state.resolve=resolve;});check(state.id);return state.pending;
  }};
  ui.close.addEventListener('click',()=>{if(!state.submitting)finish(null);});
  ui.overlay.addEventListener('click',event=>{if(event.target===ui.overlay&&!state.submitting)finish(null);});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&state.pending&&!state.submitting){event.preventDefault();finish(null);}});
})();


(() => {
  'use strict';
  const form=document.getElementById('ldtj');
  if(!form||!window.SecRisk)return;
  const button=document.getElementById('sec-risk-submit');
  const feedback=document.getElementById('submissionStatus');
  function notify(message,ok=false){
    feedback.textContent=message;
    feedback.className='mt-3 '+(ok?'text-success':'text-danger');
    feedback.hidden=false;
    if(!ok)feedback.focus();
  }
  function validate(){
    const name=form.elements.namedItem('yourname'),message=form.elements.namedItem('message');
    if(!name.value.trim()){notify('请输入您的姓名。');name.focus();return false;}
    if(!message.value.trim()){notify('请详细描述漏洞内容。');message.focus();return false;}
    return typeof form.reportValidity==='function'?form.reportValidity():true;
  }
  async function submit(event){
    event.preventDefault();event.stopImmediatePropagation();
    if(form.dataset.secRiskPending)return;
    if(!validate())return;
    form.dataset.secRiskPending='1';button.disabled=true;feedback.hidden=true;
    try{
      const entries=new URLSearchParams(new FormData(form));
      const result=await window.SecRisk.run('register',entries,form,new URL('ldtj.php',location.href).href);
      if(!result)return;
      if(result.code!==1){notify(result.msg||'提交未完成，请稍后重试。');return;}
      notify(result.msg||'漏洞信息已提交，感谢您的反馈。',true);
      // Retain the report on screen until success is confirmed; no automatic resubmission.
      form.reset();
      if(window.Swal?.fire)window.Swal.fire({icon:'success',title:'提交成功',text:result.msg||'感谢您的反馈，安全团队会尽快处理。',confirmButtonColor:'#4361ee'});
    }catch(e){notify(e.message||'提交失败，请稍后重试。');}
    finally{delete form.dataset.secRiskPending;button.disabled=false;}
  }
  form.addEventListener('submit',submit,true);
  for(const input of form.querySelectorAll('.form-control')){
    input.addEventListener('focus',()=>input.parentElement.classList.add('was-validated'));
  }
})();
