const root=document.documentElement;
const motion=document.querySelector('#motion');
const preference=matchMedia('(prefers-reduced-motion: reduce)');
const image=document.querySelector('.cover-image img');
const cover=document.querySelector('.portfolio-cover');
const progress=document.querySelector('.scroll-progress');
let paused=preference.matches,frame=0;
const items=[...document.querySelectorAll('.editorial-reveal')];
function update(){
 frame=0;
 if(document.hidden)return;
 const height=document.documentElement.scrollHeight-innerHeight;
 if(progress)progress.style.transform=`scaleX(${Math.max(0,Math.min(1,scrollY/Math.max(1,height)))})`;
 if(!paused&&cover&&image){const rect=cover.getBoundingClientRect();if(rect.bottom>0&&rect.top<innerHeight)image.style.transform=`scale(1.06) translateY(${Math.max(-12,Math.min(12,-rect.top*.025))}px)`;}
 const marker=scrollY+(document.querySelector('.masthead')?.offsetHeight||0)+30;
 let current='inicio';
 for(const id of ['inicio','practicas','proceso']){const section=document.getElementById(id);if(section&&section.getBoundingClientRect().top+scrollY<=marker)current=id;}
 document.querySelectorAll('.primary-nav a').forEach(link=>{if(link.getAttribute('aria-current')==='page')return;if(link.hash===`#${current}`)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
}
function request(){if(!frame&&!document.hidden)frame=requestAnimationFrame(update)}
function setMotion(){root.classList.toggle('reduced-motion',paused);motion.textContent=paused?'Activar movimiento':'Pausar movimiento';motion.setAttribute('aria-pressed',String(paused));if(paused){root.classList.remove('unified-motion');if(image)image.style.transform='none';items.forEach(item=>item.classList.add('is-visible'));}request();}
motion.addEventListener('click',()=>{paused=!paused;setMotion()});preference.addEventListener('change',event=>{paused=event.matches;setMotion()});
if('IntersectionObserver' in window&&!paused){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}}),{threshold:.03});items.forEach(item=>observer.observe(item));root.classList.add('unified-motion');}
addEventListener('scroll',request,{passive:true});addEventListener('resize',request,{passive:true});addEventListener('pageshow',request);document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0}else request()});
// Preserve old chapter bookmarks without restoring a duplicate journey.
const aliases={voz:'practica-1',logro:'practica-2',pista:'practica-3',aula:'practica-4'};
function resolveOldHash(){const id=aliases[location.hash.slice(1)];if(id){history.replaceState(history.state,'',`#${id}`);document.getElementById(id)?.scrollIntoView();}}
addEventListener('hashchange',resolveOldHash);resolveOldHash();setMotion();
