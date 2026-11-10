import { initQuiz } from "./practica-3.mjs?v=20261103-p2p3";

const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const configs={
 'practica-1':{kind:'dialogue',label:'01 · Trabajo colaborativo',title:'Padlet',src:'/alba-portafolio-respaldo/cuaderno/',selector:'#voz'},
 'practica-2':{kind:'gamification',label:'02 · Gamificación',title:'Cartas de logros',src:'/alba-portafolio-respaldo/practica-2/',selector:'main'},
 'practica-3':{kind:'assessment',label:'03 · Evaluación formativa',title:'Socrative',src:'/alba-portafolio-respaldo/practica-3/',selector:'main'},
 'practica-4':{kind:'classroom',label:'04 · Aula invertida · Vídeo pendiente',title:'Preparar el encuentro',src:'/alba-portafolio-respaldo/cuaderno/',selector:'#aula'}
};
const quiet=()=>reduced.matches||document.documentElement.classList.contains('reduced-motion');
let active=null;
const historyKey='albaPortfolioResource';
const ease='cubic-bezier(.22,.8,.2,1)';
function animate(element,keyframes,options){if(!element.animate)return Promise.resolve();const a=element.animate(keyframes,options);active?.animations.push(a);return a.finished.catch(()=>{});}
function alive(state){return active===state&&!state.closing;}
function remove(state){if(active!==state)return;active=null;state.abort.abort();clearTimeout(state.timeout);state.animations.forEach(a=>a.cancel());state.dialog.close();state.dialog.remove();document.documentElement.classList.remove('resource-reader-active');if(state.link.isConnected)state.link.focus({preventScroll:true});state.resolveClosed();}
async function close(immediate=false,fromHistory=false){const state=active;if(!state)return;if(state.closing)return state.closed;state.closing=true;
 if(!fromHistory&&history.state?.[historyKey]===state.card.id)history.back();state.abort.abort();clearTimeout(state.timeout);state.animations.forEach(a=>a.cancel());
 if(!immediate&&!quiet()){
  const box=state.card.getBoundingClientRect();const panel=state.panel.getBoundingClientRect();const visible=box.bottom>0&&box.top<innerHeight;
  state.dialog.classList.add('reader-closing');
  await Promise.all([animate(state.body,[{opacity:1},{opacity:0,transform:'translateY(8px)'}],{duration:140,fill:'forwards'}),animate(state.panel,[{transform:'none',opacity:1},{transform:visible?`translate(${box.left-panel.left}px,${box.top-panel.top}px) scale(${box.width/panel.width},${box.height/panel.height})`:'scale(.98)',opacity:0}],{duration:400,easing:ease,fill:'forwards'})]);
 }remove(state);return state.closed;
}
function normalizedContent(html,url,selector){
 const doc=new DOMParser().parseFromString(html,'text/html');const original=doc.querySelector(selector);if(!original)throw Error('missing content');
 const content=original.cloneNode(true);content.querySelectorAll('script,style,object,embed,header,footer').forEach(n=>n.remove());
 content.querySelectorAll('iframe').forEach(frame=>frame.remove());
 const ids=new Map();[content,...content.querySelectorAll('[id]')].forEach(el=>{if(el.id){ids.set(el.id,`reader-${el.id}`);el.id=`reader-${el.id}`;}});
 content.querySelectorAll('*').forEach(el=>{for(const attribute of [...el.attributes])if(attribute.name.startsWith('on'))el.removeAttribute(attribute.name);for(const attr of ['href','src'])if(el.hasAttribute(attr)){const raw=el.getAttribute(attr);if(raw.startsWith('#')&&ids.has(raw.slice(1)))el.setAttribute(attr,`#${ids.get(raw.slice(1))}`);else{const parsed=new URL(raw,url);if(!['http:','https:'].includes(parsed.protocol)){el.removeAttribute(attr);continue;}el.setAttribute(attr,parsed.href);}}});
 content.querySelectorAll('[aria-labelledby],[aria-describedby],[for]').forEach(el=>{for(const attr of ['aria-labelledby','aria-describedby','for'])if(el.hasAttribute(attr))el.setAttribute(attr,el.getAttribute(attr).split(/\s+/).map(id=>ids.get(id)||id).join(' '));});
 content.querySelectorAll('a[href^="#reader-"]').forEach(link=>link.addEventListener('click',e=>{e.preventDefault();content.querySelector(`[id="${link.hash.slice(1)}"]`)?.scrollIntoView({behavior:quiet()?'instant':'smooth',block:'start'});}));
 return content;
}
async function load(state,config){
 try{
  let content;
  if(config.pdf){
   content=document.createElement('div');content.className='reader-document';
   content.innerHTML='<p class="reader-intro">Tabla de logros, puntuaciones y cartas de recompensa.</p><figure><img src="/alba-portafolio-respaldo/recursos/logros-pagina-1.webp" alt="Página 1: tabla de logros, puntuaciones y recompensas" width="1400"><figcaption>1 / 2 · Tabla de logros y recompensas</figcaption></figure><figure><img src="/alba-portafolio-respaldo/recursos/logros-pagina-2.webp" alt="Página 2: cartas ilustradas del sistema de gamificación" width="1400" loading="lazy"><figcaption>2 / 2 · Cartas ilustradas</figcaption></figure><details><summary>Leer transcripción del documento</summary><pre></pre></details>';
   const response=await fetch('/alba-portafolio-respaldo/recursos/logros-transcripcion.txt',{signal:state.abort.signal});if(!response.ok)throw Error('transcript');content.querySelector('pre').textContent=await response.text();
   const zoom=document.createElement('button');zoom.type='button';zoom.className='reader-zoom';zoom.textContent='Ampliar páginas';zoom.setAttribute('aria-pressed','false');zoom.addEventListener('click',()=>{const on=content.classList.toggle('pages-enlarged');zoom.setAttribute('aria-pressed',String(on));zoom.textContent=on?'Ajustar al ancho':'Ampliar páginas';});content.querySelector('.reader-intro').append(' ',zoom);
   content.querySelectorAll('figure').forEach(figure=>{const image=figure.querySelector('img');const scroll=document.createElement('div');scroll.className='reader-page-scroll';scroll.tabIndex=0;scroll.setAttribute('aria-label','Página del documento; desplaza para leer al ampliar');image.before(scroll);scroll.append(image);});
   await content.querySelector('img').decode();
  }else{
   const url=new URL(config.src,location.href);const response=await fetch(url,{signal:state.abort.signal});if(!response.ok)throw Error('load');content=normalizedContent(await response.text(),url,config.selector);
   if(config.external){const notice=document.createElement('p');notice.className='reader-external-note';notice.textContent='La ficha presenta la actividad colaborativa. El botón «Abrir muro en Padlet» permite consultar el recurso.';content.prepend(notice);}
  }
  await state.expanded;if(!alive(state)||state.abort.signal.aborted)return;
  clearTimeout(state.timeout);state.body.replaceChildren(content);
  if (config.kind === "assessment") initQuiz(content);
  state.body.setAttribute('aria-busy','false');state.dialog.classList.add('reader-ready');
  state.body.scrollTop=0;
  await animate(state.body,[{opacity:0,transform:config.kind==='gamification'?'translateY(18px) scale(.985)':config.kind==='assessment'?'translateX(12px)':'translateY(10px)'},{opacity:1,transform:'none'}],{duration:quiet()?0:420,easing:ease});
 }catch(error){if(!alive(state)||error.name==='AbortError')return;fail(state);}
}
function fail(state){if(!alive(state))return;state.body.setAttribute('aria-busy','false');state.body.innerHTML='<div class="reader-fallback"><h2>No se ha podido mostrar el contenido aquí.</h2><p>Puedes abrir el recurso original con el enlace de la cabecera.</p></div>';state.dialog.classList.add('reader-ready');}
async function open(link,config,fromHistory=false){
 if(active)return;const card=link.closest('.practice-card'),source=card.getBoundingClientRect();
 const dialog=document.createElement('dialog');dialog.className=`resource-reader ${config.kind}`;dialog.setAttribute('aria-labelledby','reader-title');
 dialog.innerHTML='<div class="reader-panel"><header class="reader-toolbar"><div><p></p><h2 id="reader-title"></h2></div><nav aria-label="Controles del recurso"><a target="_blank" rel="noopener"></a><button type="button" aria-label="Cerrar recurso y volver a las prácticas">Cerrar <span aria-hidden="true">×</span></button></nav></header><div class="reader-body" aria-busy="true"><div class="reader-wait" role="status">Preparando el contenido…</div></div></div>';
 dialog.querySelector('.reader-toolbar p').textContent=config.label;dialog.querySelector('h2').textContent=config.title;
 const original=dialog.querySelector('.reader-toolbar a');original.href=link.href;original.textContent=config.external?'Abrir muro en Padlet ↗':config.pdf?'Abrir PDF original ↗':'Abrir página ↗';
 const state={dialog,card,link,panel:dialog.querySelector('.reader-panel'),body:dialog.querySelector('.reader-body'),abort:new AbortController(),animations:[],closing:false,timeout:0};
 state.closed=new Promise(resolve=>{state.resolveClosed=resolve;});
 active=state;document.body.append(dialog);
 try{dialog.showModal();}catch{remove(state);location.assign(link.href);return;}
 if(!fromHistory){const url=new URL(location.href);url.hash=`recurso-${card.id}`;history.pushState({...history.state,[historyKey]:card.id},'',url);}
 document.documentElement.classList.add('resource-reader-active');dialog.querySelector('button').focus({preventScroll:true});
 const target=state.panel.getBoundingClientRect();const from=`translate(${source.left-target.left}px,${source.top-target.top}px) scale(${source.width/target.width},${source.height/target.height})`;
 state.expanded=animate(state.panel,[{transform:from,borderRadius:getComputedStyle(card).borderRadius,opacity:.9},{transform:'none',borderRadius:getComputedStyle(state.panel).borderRadius,opacity:1}],{duration:quiet()?0:640,easing:ease});
 animate(dialog.querySelector('.reader-toolbar'),[{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'none'}],{duration:quiet()?0:220,delay:quiet()?0:420,easing:ease,fill:'backwards'});
 dialog.addEventListener('cancel',event=>{event.preventDefault();close();});dialog.querySelector('button').addEventListener('click',()=>close());dialog.addEventListener('click',event=>{if(event.target===dialog)close();});
 state.timeout=setTimeout(()=>{if(alive(state)){state.abort.abort();fail(state);}},10000);load(state,config);
}
document.querySelectorAll('.practice-card .practice-primary').forEach(link=>link.addEventListener('click',event=>{
 const config=configs[link.closest('.practice-card').id];if(!config||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||link.hasAttribute('download')||link.target==='_blank')return;
 event.preventDefault();open(link,config);
}));
addEventListener('popstate',async()=>{
 const resource=history.state?.[historyKey];
 if(active?.card.id===resource&&!active.closing)return;
 await close(false,true);
 if(history.state?.[historyKey]!==resource||!configs[resource])return;
 const link=document.querySelector(`#${resource} .practice-primary`);if(link)open(link,configs[resource],true);
});
// A copied resource URL also opens the same reader after a reload.
const requestedResource=location.hash.match(/^#recurso-(practica-[1-4])$/)?.[1];
if(requestedResource&&configs[requestedResource]){
 const link=document.querySelector(`#${requestedResource} .practice-primary`);
 if(link){
  link.closest('.practice-card').scrollIntoView({behavior:'instant',block:'center'});
  if(history.state?.[historyKey]===requestedResource)open(link,configs[requestedResource],true);
  else{const base=new URL(location.href);base.hash=requestedResource;history.replaceState(history.state,'',base);open(link,configs[requestedResource]);}
 }
}
reduced.addEventListener('change',event=>{if(event.matches&&active){active.animations.forEach(a=>{try{a.finish();}catch{a.cancel();}});}});
addEventListener('pagehide',()=>{if(active)remove(active);});

// Restore a reader removed on pagehide when returning through the browser cache.
addEventListener('pageshow',event=>{
 if(!event.persisted||active)return;
 const resource=history.state?.[historyKey];
 if(!configs[resource]||location.hash!==`#recurso-${resource}`)return;
 const link=document.querySelector(`#${resource} .practice-primary`);
 if(link)open(link,configs[resource],true);
});
