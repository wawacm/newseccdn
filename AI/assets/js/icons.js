class IconSystem{constructor(){this.iconsLoaded=false;this.enhancedIcons=true;this.initializeSystem();}
async initializeSystem(){this.injectIconStyles();await this.loadIcons();this.setupDynamicEffects();}
injectIconStyles(){const styles=`
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
        `;document.head.insertAdjacentHTML('beforeend',styles);}
async loadIcons(){try{const response=await fetch('assets/icons/icons.svg');const svgText=await response.text();const iconContainer=document.createElement('div');iconContainer.style.display='none';iconContainer.innerHTML=svgText;document.body.appendChild(iconContainer);this.iconsLoaded=true;this.replaceIcons();}catch(error){console.warn('无法加载SVG图标，将使用Font Awesome作为后备方案:',error);}}
createIcon(iconName,className='',options={}){const{enhanced=this.enhancedIcons,interactive=false,glow=false,pulse=false,spin=false,size='1em'}=options;if(!this.iconsLoaded){return this.createFallbackIcon(iconName,className,options);}
const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');const use=document.createElementNS('http://www.w3.org/2000/svg','use');let classes=[`icon`,`icon-${iconName}`];if(enhanced)classes.push('icon-enhanced');if(interactive)classes.push('icon-interactive');if(glow)classes.push('icon-glow');if(pulse)classes.push('icon-pulse');if(spin)classes.push('icon-spin');if(className)classes.push(className);svg.setAttribute('class',classes.join(' '));svg.setAttribute('aria-hidden','true');svg.setAttribute('style',`width: ${size}; height: ${size};`);use.setAttribute('href',`#icon-${iconName}`);svg.appendChild(use);return svg;}
createFallbackIcon(iconName,className='',options={}){const{interactive=false,size='1em'}=options;const i=document.createElement('i');const faClass=this.getFontAwesomeClass(iconName);let classes=['fas',faClass];if(interactive)classes.push('icon-interactive');if(className)classes.push(className);i.setAttribute('class',classes.join(' '));i.setAttribute('aria-hidden','true');i.setAttribute('style',`font-size: ${size};`);return i;}
getFontAwesomeClass(iconName){const iconMap={'user':'fa-user','user-circle':'fa-user-circle','lock':'fa-lock','email':'fa-envelope','send':'fa-paper-plane','robot':'fa-robot','plus':'fa-plus','settings':'fa-cog','logout':'fa-sign-out-alt','search':'fa-search','trash':'fa-trash','edit':'fa-edit','close':'fa-times','menu':'fa-bars','attach':'fa-paperclip','arrow-left':'fa-arrow-left'};return iconMap[iconName]||'fa-circle';}
setupDynamicEffects(){document.addEventListener('DOMContentLoaded',()=>{const robotIcons=document.querySelectorAll('.icon-robot, .fa-robot');robotIcons.forEach(icon=>{icon.classList.add('icon-pulse');});const sendButtons=document.querySelectorAll('.btn-send');sendButtons.forEach(btn=>{const icon=btn.querySelector('.icon, i');if(icon){icon.classList.add('icon-interactive');}});const sidebarButtons=document.querySelectorAll('.sidebar .btn-icon');sidebarButtons.forEach(btn=>{const icon=btn.querySelector('.icon, i');if(icon){icon.classList.add('icon-hover-glow');}});});}
addEffect(element,effect){const validEffects=['glow','pulse','spin','hover-glow','interactive'];if(validEffects.includes(effect)){element.classList.add(`icon-${effect}`);}}
removeEffect(element,effect){element.classList.remove(`icon-${effect}`);}
getIconHTML(iconName,className=''){return `<svg class="icon icon-${iconName} ${className}" aria-hidden="true">
            <use href="#icon-${iconName}"></use>
        </svg>`;}
replaceIcons(){if(!this.iconsLoaded)return;const iconMap={'fa-user':'user','fa-user-circle':'user-circle','fa-lock':'lock','fa-envelope':'email','fa-sign-in-alt':'arrow-left','fa-user-plus':'user','fa-plus':'plus','fa-cog':'settings','fa-sign-out-alt':'logout','fa-sync-alt':'refresh','fa-refresh':'refresh','fa-robot':'robot','fa-paperclip':'attach','fa-paper-plane':'send','fa-trash':'trash','fa-trash-alt':'trash','fa-download':'download','fa-times':'close','fa-arrow-left':'arrow-left','fa-chart-bar':'dashboard','fa-key':'key','fa-users':'users','fa-list-alt':'logs','fa-search':'search','fa-edit':'edit','fa-copy':'copy','fa-check':'check','fa-warning':'warning','fa-info':'info','fa-shield-alt':'settings','fa-menu':'menu','fa-ellipsis-v':'more'};Object.keys(iconMap).forEach(faClass=>{const elements=document.querySelectorAll(`.${faClass}`);elements.forEach(element=>{const svgIcon=this.createIcon(iconMap[faClass]);const classList=Array.from(element.classList).filter(cls=>!cls.startsWith('fa')&&cls!=='fas'&&cls!=='far'&&cls!=='fab');classList.forEach(cls=>svgIcon.classList.add(cls));element.parentNode.replaceChild(svgIcon,element);});});}
addIconToElement(element,iconName,position='before'){const icon=this.createIcon(iconName);if(position==='before'){element.insertBefore(icon,element.firstChild);}else{element.appendChild(icon);}}
updateIcon(element,newIconName){const iconElement=element.querySelector('.icon');if(iconElement){const newIcon=this.createIcon(newIconName);const classList=Array.from(iconElement.classList).filter(cls=>!cls.startsWith('icon-'));classList.forEach(cls=>newIcon.classList.add(cls));iconElement.parentNode.replaceChild(newIcon,iconElement);}}}
window.iconSystem=new IconSystem();window.createIcon=(iconName,className='')=>{return window.iconSystem.createIcon(iconName,className);};window.getIconHTML=(iconName,className='')=>{return window.iconSystem.getIconHTML(iconName,className);};document.addEventListener('DOMContentLoaded',()=>{setTimeout(()=>{window.iconSystem.replaceIcons();},100);});if(typeof module!=='undefined'&&module.exports){module.exports=IconSystem;}