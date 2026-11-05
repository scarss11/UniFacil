// ============================================
// UniFácil — Lógica de la aplicación
// Requiere js/data.js (cargado antes en index.html)
// ============================================

const ICONS={
  inicio:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/></svg>',
  tareas:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="3"/><path d="m8 9 1.5 1.5L12 8M8 15l1.5 1.5L12 14M14.5 9.5H17M14.5 15.5H17"/></svg>',
  horario:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4.5" width="18" height="16.5" rx="3"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4M7.5 13.5h3M13.5 13.5h3M7.5 17h3"/></svg>',
  colaborar:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="3"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  plus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  chev:'<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>',
  check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
  trash:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/></svg>'
};
const ROUTES=[
  {id:'inicio',n:'Inicio'},
  {id:'tareas',n:'Mis tareas'},
  {id:'horario',n:'Mi horario'},
  {id:'colaborar',n:'Colaborar'}
];

const KEY='unifacil.tasks.v1';
let tasks;
try{tasks=JSON.parse(localStorage.getItem(KEY))}catch(e){}
if(!Array.isArray(tasks))tasks=SAMPLE;
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(tasks))}catch(e){}};

let filter='todas', mDay=null;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmtH=h=>{const hh=Math.floor(h),mm=Math.round((h-hh)*60);return hh+':'+String(mm).padStart(2,'0')};
const fmtDate=s=>parse(s).toLocaleDateString('es-CO',{weekday:'short',day:'numeric',month:'short'}).replace('.','');
function rel(s){
  const diff=Math.round((parse(s)-today)/864e5);
  if(diff===0)return'Hoy'; if(diff===1)return'Mañana'; if(diff===-1)return'Ayer';
  return diff>0?'En '+diff+' días':'Hace '+(-diff)+' días';
}
const dueClass=(t)=>{if(t.st==='completada')return'';const d=Math.round((parse(t.f)-today)/864e5);return d<0?'late':d<=2?'soon':''};
const subjBadge=s=>`<span class="subj-badge"><i class="dot" style="background:${SUBJ[s].c}"></i>${SUBJ[s].n}</span>`;

function taskRow(t,{compact=false}={}){
  return `<div class="item ${t.st==='completada'?'done':''}" data-id="${t.id}">
    <button class="check" data-act="toggle" aria-label="${t.st==='completada'?'Marcar como pendiente':'Marcar como completada'}: ${esc(t.n)}">${ICONS.check}</button>
    <div class="body"><div class="title">${esc(t.n)}</div><div class="meta">${subjBadge(t.s)}</div></div>
    ${compact?'':`<div class="status-wrap"><button class="status st-${t.st}" data-act="cycle" title="Cambiar estado">${STATUS[t.st]}</button></div>`}
    <div class="due num ${dueClass(t)}">${rel(t.f)}<small>${fmtDate(t.f)}</small></div>
    ${compact?'':`<button class="del" data-act="del" aria-label="Eliminar ${esc(t.n)}">${ICONS.trash}</button>`}
  </div>`;
}

/* ---------- Vistas ---------- */
function viewHome(){
  const now=new Date(), hr=now.getHours();
  const greet=hr<12?'Buenos días':hr<19?'Buenas tardes':'Buenas noches';
  const open=tasks.filter(t=>t.st!=='completada').sort((a,b)=>a.f.localeCompare(b.f));
  const c={pendiente:0,proceso:0,completada:0}; tasks.forEach(t=>c[t.st]++);
  const pct=tasks.length?Math.round(c.completada/tasks.length*100):0;
  const circ=2*Math.PI*46;
  const wd=today.getDay();
  const todays=CLASSES.filter(x=>x.d===wd).sort((a,b)=>a.a-b.a);
  const week=open.filter(t=>Math.round((parse(t.f)-today)/864e5)<=7).length;
  const dateStr=today.toLocaleDateString('es-CO',{weekday:'long',day:'numeric',month:'long'});
  return `
  <div class="head"><div><div class="eyebrow">${dateStr}</div><h1>${greet}</h1></div>
    <button class="btn" data-act="new">${ICONS.plus}Nueva tarea</button></div>
  <div class="hero">
    <div class="hero-card">
      <p>UniFácil · tu semana académica</p>
      <div class="motto">Organiza tu tiempo, alcanza tus metas.</div>
      <div class="row"><span class="pill num">${week} entregas en los próximos 7 días</span><span class="pill num">${todays.length} clases hoy</span></div>
    </div>
    <div class="progress">
      <svg class="ring" viewBox="0 0 108 108" role="img" aria-label="${pct}% de tareas completadas">
        <circle class="t" cx="54" cy="54" r="46"/>
        <circle class="v" cx="54" cy="54" r="46" stroke-dasharray="${circ}" stroke-dashoffset="${circ*(1-pct/100)}" transform="rotate(-90 54 54)"/>
        <text x="54" y="52" text-anchor="middle" font-size="22" font-weight="700" fill="currentColor" font-family="Poppins,sans-serif">${pct}%</text>
        <text x="54" y="70" text-anchor="middle" font-size="11" fill="var(--fg2)" font-family="Poppins,sans-serif">completado</text>
      </svg>
      <div class="stats num">
        <div><i class="dot" style="background:var(--warn)"></i>${c.pendiente} pendientes</div>
        <div><i class="dot" style="background:var(--accent)"></i>${c.proceso} en proceso</div>
        <div><i class="dot" style="background:var(--ok)"></i>${c.completada} completadas</div>
      </div>
    </div>
  </div>
  <div class="quick">
    <a class="qa" href="#tareas"><span class="ic" style="background:var(--accent-soft);color:var(--accent)">${ICONS.tareas}</span><div><b>Mis tareas</b><span class="num">${open.length} actividades por entregar</span></div>${ICONS.chev}</a>
    <a class="qa" href="#horario"><span class="ic" style="background:var(--lav-soft);color:var(--s-lav)">${ICONS.horario}</span><div><b>Mi horario</b><span class="num">${CLASSES.length} clases a la semana</span></div>${ICONS.chev}</a>
    <a class="qa" href="#colaborar"><span class="ic" style="background:var(--ok-soft);color:var(--ok)">${ICONS.colaborar}</span><div><b>Colaborar</b><span>Foro para compartir dudas y apuntes</span></div>${ICONS.chev}</a>
  </div>
  <div class="cols">
    <div>
      <div class="sec-h"><h2>Próximas actividades</h2><a href="#tareas">Ver todas</a></div>
      <div class="list" id="upcoming">${open.slice(0,4).map(t=>taskRow(t,{compact:true})).join('')||'<div class="empty">No tienes entregas pendientes. Buen trabajo.</div>'}</div>
    </div>
    <div>
      <div class="sec-h"><h2>Clases de hoy</h2><a href="#horario">Horario</a></div>
      <div class="list classes">${todays.length?todays.map(x=>`<div class="item"><i class="bar" style="background:${SUBJ[x.s].c}"></i><div class="time num">${fmtH(x.a)} – ${fmtH(x.b)}</div><div class="body"><div class="title">${SUBJ[x.s].n}</div><div class="meta">${x.r}</div></div></div>`).join(''):'<div class="empty">Hoy no tienes clases. Aprovecha para adelantar tareas.</div>'}</div>
    </div>
  </div>`;
}

function viewTasks(){
  const c={todas:tasks.length,pendiente:0,proceso:0,completada:0}; tasks.forEach(t=>c[t.st]++);
  const list=tasks.filter(t=>filter==='todas'||t.st===filter)
    .sort((a,b)=>(a.st==='completada')-(b.st==='completada')||a.f.localeCompare(b.f));
  const tabs=[['todas','Todas'],['pendiente','Pendientes'],['proceso','En proceso'],['completada','Completadas']];
  return `
  <div class="head"><div><div class="eyebrow">Actividades</div><h1>Mis tareas</h1></div>
    <button class="btn" data-act="new">${ICONS.plus}Nueva tarea</button></div>
  <div class="toolbar"><div class="seg" role="group" aria-label="Filtrar por estado">
    ${tabs.map(([k,l])=>`<button data-filter="${k}" aria-pressed="${filter===k}">${l}<span class="count num">${c[k]}</span></button>`).join('')}
  </div></div>
  <div class="list">${list.map(t=>taskRow(t)).join('')||`<div class="empty">No hay tareas con este estado.<br><button class="btn ghost" style="margin-top:12px" data-filter="todas">Ver todas</button></div>`}</div>
  <p class="hint">Toca el círculo para marcar una tarea como completada, o toca su estado para avanzarlo: pendiente → en proceso → completada.</p>`;
}

function viewSchedule(){
  const wd=today.getDay();
  if(mDay===null)mDay=(wd>=1&&wd<=5)?wd:1;
  const monday=new Date(today); monday.setDate(today.getDate()-((wd+6)%7));
  const hours=[];for(let h=START;h<=END;h++)hours.push(h);
  const total=(END-START)*H;
  const n=new Date(), nowH=n.getHours()+n.getMinutes()/60;
  const head=DAYS.map((d,i)=>{const dt=new Date(monday);dt.setDate(monday.getDate()+i);const isT=i+1===wd;
    return `<div class="dayh ${isT?'today':''}">${d}<b class="num">${dt.getDate()}</b></div>`}).join('');
  const cols=DAYS.map((d,i)=>{const isT=i+1===wd;
    const blocks=CLASSES.filter(x=>x.d===i+1).map(x=>`<div class="blk" style="--c:${SUBJ[x.s].c};top:${(x.a-START)*H+2}px;height:${(x.b-x.a)*H-4}px"><b>${SUBJ[x.s].n}</b><span class="num">${fmtH(x.a)} – ${fmtH(x.b)}</span><br><span>${x.r}</span></div>`).join('');
    const line=isT&&nowH>=START&&nowH<=END?`<div class="now" style="top:${(nowH-START)*H}px"></div>`:'';
    return `<div class="col ${isT?'today':''}" style="--h:${H}px;height:${total}px">${blocks}${line}</div>`}).join('');
  const times=`<div class="times" style="height:${total}px">${hours.map(h=>`<span class="num" style="top:${(h-START)*H}px">${h}:00</span>`).join('')}</div>`;
  const mList=CLASSES.filter(x=>x.d===mDay).sort((a,b)=>a.a-b.a);
  return `
  <div class="head"><div><div class="eyebrow">Semana del ${monday.toLocaleDateString('es-CO',{day:'numeric',month:'long'})}</div><h1>Mi horario</h1></div></div>
  <div class="week"><div class="grid"><div class="dayh"></div>${head}${times}${cols}</div></div>
  <div class="mday">
    <div class="toolbar"><div class="seg" role="group" aria-label="Elegir día">${DAYS.map((d,i)=>`<button data-day="${i+1}" aria-pressed="${mDay===i+1}">${d.slice(0,3)}</button>`).join('')}</div></div>
    <div class="list classes">${mList.map(x=>`<div class="item"><i class="bar" style="background:${SUBJ[x.s].c}"></i><div class="time num">${fmtH(x.a)} – ${fmtH(x.b)}</div><div class="body"><div class="title">${SUBJ[x.s].n}</div><div class="meta">${x.r}</div></div></div>`).join('')}</div>
  </div>
  <div class="legend">${Object.values(SUBJ).map(s=>`<span><i class="dot" style="background:${s.c}"></i>${s.n}</span>`).join('')}</div>`;
}

/* ---------- Foro ---------- */
const FORUM_KEY='unifacil.forum.v1';
const NAME_KEY='unifacil.forum.name';
let forumName='';
try{forumName=localStorage.getItem(NAME_KEY)||''}catch(e){}
const saveName=n=>{forumName=n.trim();try{localStorage.setItem(NAME_KEY,forumName)}catch(e){}};
const ago=ts=>{
  const m=Math.max(0,Math.round((Date.now()-ts)/60000));
  if(m<1)return'Ahora';
  if(m<60)return'Hace '+m+' min';
  const h=Math.round(m/60);
  if(h<24)return'Hace '+h+' h';
  const d=Math.round(h/24);
  return d===1?'Ayer':'Hace '+d+' días';
};
const activity=p=>Math.max(p.created,...(p.replies||[]).map(r=>r.created));
function seedForum(){
  const h=n=>Date.now()-n*3600000;
  return [
    {id:101,s:'prog',author:'Camila Ríos',created:h(5),title:'¿Qué incluye la entrega 1 del inventario?',body:'No me queda claro si el primer entregable es solo el diagrama o también las pantallas. Si alguien ya lo confirmó con el profesor, ¿lo puede dejar por aquí?',replies:[
      {id:102,author:'Andrés Melo',created:h(4),body:'Pregunté hoy: la entrega 1 es el modelo de datos y un pantallazo de las pantallas. El código va en la entrega 2.'}
    ]},
    {id:103,s:'calc',author:'Mateo López',created:h(20),title:'Resumen corto de derivadas parciales',body:'Dejo los tres pasos que usé en el taller: identificar la variable que se deriva, tratar las demás como constantes y revisar el resultado con un punto conocido. Si ven un error, corríjanlo.',replies:[
      {id:104,author:'Sara Gómez',created:h(18),body:'Me sirvió. En el ejercicio 4 también hay que aplicar la regla de la cadena porque z depende de x y de y.'}
    ]},
    {id:105,s:'fis',author:'Laura Peña',created:h(8),title:'Duda del péndulo: ¿desde dónde mido la longitud?',body:'En el informe del laboratorio medí hasta el centro de la esfera. ¿Es así o se mide hasta el borde?',replies:[]},
    {id:106,s:'eti',author:'Sara Gómez',created:h(30),title:'Ideas para el ensayo de dilemas de la IA',body:'Estoy armando el ensayo con dos casos: un sistema que recomienda notas y otro que filtra hojas de vida. ¿Alguien tiene una fuente corta y confiable para citar?',replies:[
      {id:107,author:'Camila Ríos',created:h(26),body:'En la biblioteca está el capítulo 3 de la lectura. Resume bien el principio de no hacer daño sin ponerse tan técnico.'}
    ]}
  ];
}
let forum;
try{forum=JSON.parse(localStorage.getItem(FORUM_KEY))}catch(e){}
if(!Array.isArray(forum)||!forum.length){forum=seedForum();try{localStorage.setItem(FORUM_KEY,JSON.stringify(forum))}catch(e){}}
const saveForum=()=>{try{localStorage.setItem(FORUM_KEY,JSON.stringify(forum))}catch(e){}};
let forumOpen=null, forumSubj='todas';
const initial=n=>esc((n.trim()[0]||'?').toUpperCase());
const replyLabel=n=>n===1?'1 respuesta':n+' respuestas';

function viewCollab(){
  const post=forum.find(p=>p.id===forumOpen);
  if(forumOpen&&!post)forumOpen=null;
  if(post)return viewThread(post);
  const chips=[['todas','Todas'],...Object.entries(SUBJ)];
  const list=forum.filter(p=>forumSubj==='todas'||p.s===forumSubj).sort((a,b)=>activity(b)-activity(a));
  return `
  <div class="head"><div><div class="eyebrow">Foro de la clase</div><h1>Colaborar</h1><p class="lead">Publica una duda o un apunte por asignatura. Tus compañeros responden en el mismo hilo.</p></div>
    <button class="btn" data-act="forum">${ICONS.plus}Publicar</button></div>
  <div class="who"><label for="whoName">Tu nombre en el foro</label><input id="whoName" maxlength="32" value="${esc(forumName)}" placeholder="Ej. Camila" autocomplete="nickname"></div>
  <div class="toolbar"><div class="seg" role="group" aria-label="Filtrar por asignatura">
    ${chips.map(([k,s])=>`<button data-forum="${k}" aria-pressed="${forumSubj===k}">${typeof s==='string'?s:s.n}</button>`).join('')}
  </div></div>
  <div class="list forum">${list.map(p=>`<button type="button" class="post" data-act="open-post" data-id="${p.id}">
    <span class="avatar" style="background:color-mix(in srgb,${SUBJ[p.s].c} 18%,var(--card));color:${SUBJ[p.s].c}">${initial(p.author)}</span>
    <span class="body"><span class="meta">${esc(p.author)} · ${subjBadge(p.s)} · ${ago(activity(p))}</span><span class="title">${esc(p.title)}</span><span class="excerpt">${esc(p.body)}</span></span>
    <span class="replies num">${replyLabel(p.replies.length)}</span>
  </button>`).join('')||'<div class="empty">Nadie ha publicado en esta asignatura. Sé la primera persona en compartir algo.</div>'}</div>
  <p class="hint">Las publicaciones se guardan en este navegador. Desde cada hilo puedes enviar el mensaje por WhatsApp para que otra persona lo vea.</p>`;
}
function viewThread(p){
  const text=encodeURIComponent(`${p.title}\n\n${p.body}\n— ${p.author}, foro de UniFácil`);
  const replies=p.replies.slice().sort((a,b)=>a.created-b.created);
  return `
  <button type="button" class="back" data-act="forum-back">← Volver al foro</button>
  <div class="head"><div><div class="eyebrow">${SUBJ[p.s].n}</div><h1>${esc(p.title)}</h1></div>
    <a class="btn ghost" href="https://wa.me/?text=${text}" target="_blank" rel="noopener noreferrer">Enviar por WhatsApp</a></div>
  <div class="who"><label for="whoName">Respondes como</label><input id="whoName" maxlength="32" value="${esc(forumName)}" placeholder="Ej. Camila" autocomplete="nickname"></div>
  <article class="thread">
    <div class="post static">
      <span class="avatar" style="background:color-mix(in srgb,${SUBJ[p.s].c} 18%,var(--card));color:${SUBJ[p.s].c}">${initial(p.author)}</span>
      <div class="body"><div class="meta">${esc(p.author)} · ${ago(p.created)}</div><p class="post-body">${esc(p.body)}</p></div>
    </div>
    ${replies.map(r=>`<div class="reply"><span class="avatar">${initial(r.author)}</span><div class="body"><div class="meta">${esc(r.author)} · ${ago(r.created)}</div><p class="post-body">${esc(r.body)}</p></div></div>`).join('')||'<p class="hint">Todavía no hay respuestas. Comparte lo que sepas.</p>'}
    <form class="composer" id="replyForm">
      <label for="replyBody">Tu respuesta</label>
      <textarea id="replyBody" rows="3" maxlength="600" placeholder="Un apunte, una duda o una corrección"></textarea>
      <p class="err" id="replyErr" hidden></p>
      <button class="btn" type="submit">Responder</button>
    </form>
  </article>`;
}
function bindForum(){
  const who=document.getElementById('whoName');
  if(who)who.addEventListener('change',()=>saveName(who.value));
  const form=document.getElementById('replyForm');
  if(!form)return;
  form.addEventListener('submit',e=>{
    e.preventDefault();
    const post=forum.find(p=>p.id===forumOpen);
    const body=document.getElementById('replyBody').value.trim();
    const err=document.getElementById('replyErr');
    const name=currentName();
    if(!name){err.textContent='Escribe tu nombre para que sepan quién responde.';err.hidden=false;document.getElementById('whoName').focus();return}
    if(!body){err.textContent='Escribe una respuesta para publicarla.';err.hidden=false;return}
    post.replies.push({id:Date.now(),author:name,created:Date.now(),body});
    saveForum();render();
  });
}
function currentName(){
  const el=document.getElementById('whoName');
  const n=(el?el.value:forumName).trim();
  if(n)saveName(n);
  return forumName;
}

/* ---------- Navegación ---------- */
function route(){return ROUTES.some(r=>'#'+r.id===location.hash)?location.hash.slice(1):'inicio'}
function render(){
  const r=route();
  const nav=ROUTES.map(x=>`<a href="#${x.id}" ${x.id===r?'aria-current="page"':''}>${ICONS[x.id]}<span>${x.n}</span></a>`).join('');
  document.getElementById('sideNav').innerHTML=nav;
  document.getElementById('tabBar').innerHTML=nav;
  document.getElementById('view').innerHTML=r==='tareas'?viewTasks():r==='horario'?viewSchedule():r==='colaborar'?viewCollab():viewHome();
  bindForum();
}
window.addEventListener('hashchange',()=>{if(route()!=='colaborar')forumOpen=null;render();window.scrollTo(0,0)});

document.addEventListener('click',e=>{
  const f=e.target.closest('[data-filter]'); if(f){filter=f.dataset.filter;render();return}
  const d=e.target.closest('[data-day]'); if(d){mDay=+d.dataset.day;render();return}
  const ff=e.target.closest('[data-forum]'); if(ff){forumSubj=ff.dataset.forum;render();return}
  const a=e.target.closest('[data-act]'); if(!a)return;
  const act=a.dataset.act;
  if(act==='new'){openSheet();return}
  if(act==='forum'){openForum();return}
  if(act==='forum-back'){forumOpen=null;render();return}
  if(act==='open-post'){forumOpen=+a.dataset.id;render();return}
  const id=+a.closest('[data-id]')?.dataset.id; const t=tasks.find(x=>x.id===id); if(!t)return;
  if(act==='toggle')t.st=t.st==='completada'?'pendiente':'completada';
  if(act==='cycle')t.st=NEXT[t.st];
  if(act==='del')tasks=tasks.filter(x=>x.id!==id);
  save();render();
});

/* ---------- Hoja: nueva tarea ---------- */
let lastFocus=null;
function openSheet(){
  lastFocus=document.activeElement;
  document.getElementById('sheetRoot').innerHTML=`
  <div class="scrim" id="scrim"><form class="sheet" id="taskForm" role="dialog" aria-modal="true" aria-labelledby="sheetTitle" novalidate>
    <div class="sheet-h"><button type="button" class="l" id="cancelBtn">Cancelar</button><b id="sheetTitle">Nueva tarea</b><button type="submit" class="r">Agregar</button></div>
    <div class="form">
      <div class="field"><label for="fName">Nombre de la actividad</label><input id="fName" autocomplete="off" placeholder="Ej. Taller de integrales"></div>
      <div class="field"><label for="fSubj">Asignatura</label><select id="fSubj">${Object.entries(SUBJ).map(([k,s])=>`<option value="${k}">${s.n}</option>`).join('')}</select></div>
      <div class="field"><label for="fDate">Fecha de entrega</label><input id="fDate" type="date" value="${plus(3)}"></div>
      <div class="field"><label for="fSt">Estado</label><select id="fSt">${Object.entries(STATUS).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select></div>
    </div>
    <p class="err" id="fErr" hidden></p>
  </form></div>`;
  const name=document.getElementById('fName'); name.focus();
  name.addEventListener('input',()=>document.getElementById('fErr').hidden=true);
  document.getElementById('cancelBtn').onclick=closeSheet;
  document.getElementById('scrim').addEventListener('click',e=>{if(e.target.id==='scrim')closeSheet()});
  document.getElementById('taskForm').addEventListener('submit',e=>{
    e.preventDefault();
    const n=name.value.trim(), f=document.getElementById('fDate').value;
    const err=document.getElementById('fErr');
    if(!n){err.textContent='Escribe el nombre de la actividad para poder agregarla.';err.hidden=false;name.focus();return}
    if(!f){err.textContent='Elige una fecha de entrega.';err.hidden=false;return}
    tasks.push({id:Date.now(),n,s:document.getElementById('fSubj').value,f,st:document.getElementById('fSt').value});
    save();closeSheet();render();
  });
}
function openForum(){
  lastFocus=document.activeElement;
  const name=currentName();
  document.getElementById('sheetRoot').innerHTML=`
  <div class="scrim" id="scrim"><form class="sheet" id="postForm" role="dialog" aria-modal="true" aria-labelledby="sheetTitle" novalidate>
    <div class="sheet-h"><button type="button" class="l" id="cancelBtn">Cancelar</button><b id="sheetTitle">Nueva publicación</b><button type="submit" class="r">Publicar</button></div>
    <div class="form">
      <div class="field"><label for="pName">Tu nombre</label><input id="pName" maxlength="32" autocomplete="nickname" value="${esc(name)}" placeholder="Ej. Camila"></div>
      <div class="field"><label for="pSubj">Asignatura</label><select id="pSubj">${Object.entries(SUBJ).map(([k,s])=>`<option value="${k}" ${k===forumSubj?'selected':''}>${s.n}</option>`).join('')}</select></div>
      <div class="field"><label for="pTitle">Título</label><input id="pTitle" maxlength="80" autocomplete="off" placeholder="Ej. Duda del taller 2"></div>
      <div class="field"><label for="pBody">Qué quieres compartir</label><textarea id="pBody" rows="4" maxlength="600" placeholder="Una duda, un resumen o un dato que le sirva al grupo"></textarea></div>
    </div>
    <p class="err" id="pErr" hidden></p>
  </form></div>`;
  const title=document.getElementById('pTitle'); title.focus();
  document.getElementById('cancelBtn').onclick=closeSheet;
  document.getElementById('scrim').addEventListener('click',e=>{if(e.target.id==='scrim')closeSheet()});
  document.getElementById('postForm').addEventListener('submit',e=>{
    e.preventDefault();
    const who=document.getElementById('pName').value.trim();
    const n=title.value.trim(), body=document.getElementById('pBody').value.trim();
    const err=document.getElementById('pErr');
    if(!who){err.textContent='Escribe tu nombre para que sepan quién publica.';err.hidden=false;return}
    if(!n){err.textContent='Escribe un título para la publicación.';err.hidden=false;title.focus();return}
    if(!body){err.textContent='Cuenta qué quieres compartir.';err.hidden=false;return}
    saveName(who);
    const subj=document.getElementById('pSubj').value;
    forum.unshift({id:Date.now(),s:subj,author:who,created:Date.now(),title:n,body,replies:[]});
    forumSubj='todas';forumOpen=null;saveForum();closeSheet();render();
  });
}
function closeSheet(){document.getElementById('sheetRoot').innerHTML='';lastFocus&&lastFocus.focus&&lastFocus.focus()}
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.getElementById('scrim'))closeSheet()});

render();
