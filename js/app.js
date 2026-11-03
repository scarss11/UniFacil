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
    <a class="qa" href="#colaborar"><span class="ic" style="background:var(--ok-soft);color:var(--ok)">${ICONS.colaborar}</span><div><b>Colaborar</b><span>Promover la colaboración y el intercambio de conocimiento</span></div>${ICONS.chev}</a>
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

function viewCollab(){
  const share=encodeURIComponent('Promovamos la colaboración y el intercambio de conocimiento con UniFácil: https://scarss11.github.io/UniFacil/');
  const ideas=[
    ['Grupos de estudio','Reúnete con compañeros de tu asignatura para repasar antes de cada entrega.'],
    ['Apuntes compartidos','Intercambia resúmenes, talleres y dudas para que el grupo avance junto.'],
    ['Resolver en equipo','Si una tarea se atasca, coméntala con tu grupo antes de la fecha límite.']
  ];
  return `
  <div class="head"><div><div class="eyebrow">Comunidad</div><h1>Colaboración</h1></div>
    <a class="btn" href="https://wa.me/?text=${share}" target="_blank" rel="noopener noreferrer">Compartir por WhatsApp</a></div>
  <div class="hero-card collab-lead">
    <p>UniFácil · comunidad</p>
    <div class="motto">Promover la colaboración y el intercambio de conocimiento</div>
  </div>
  <div class="list" style="margin-top:16px">${ideas.map(([t,d])=>`<div class="item"><div class="body"><div class="title">${t}</div><div class="meta">${d}</div></div></div>`).join('')}</div>
  <div class="sec-h"><h2>Grupos por asignatura</h2></div>
  <div class="list classes">${Object.values(SUBJ).map(s=>`<div class="item"><i class="bar" style="background:${s.c}"></i><div class="body"><div class="title">Grupo de ${esc(s.n)}</div><div class="meta">Espacio para compartir apuntes y dudas</div></div></div>`).join('')}</div>`;
}

/* ---------- Navegación ---------- */
function route(){return ROUTES.some(r=>'#'+r.id===location.hash)?location.hash.slice(1):'inicio'}
function render(){
  const r=route();
  const nav=ROUTES.map(x=>`<a href="#${x.id}" ${x.id===r?'aria-current="page"':''}>${ICONS[x.id]}<span>${x.n}</span></a>`).join('');
  document.getElementById('sideNav').innerHTML=nav;
  document.getElementById('tabBar').innerHTML=nav;
  document.getElementById('view').innerHTML=r==='tareas'?viewTasks():r==='horario'?viewSchedule():r==='colaborar'?viewCollab():viewHome();
}
window.addEventListener('hashchange',()=>{render();window.scrollTo(0,0)});

document.addEventListener('click',e=>{
  const f=e.target.closest('[data-filter]'); if(f){filter=f.dataset.filter;render();return}
  const d=e.target.closest('[data-day]'); if(d){mDay=+d.dataset.day;render();return}
  const a=e.target.closest('[data-act]'); if(!a)return;
  const act=a.dataset.act;
  if(act==='new'){openSheet();return}
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
function closeSheet(){document.getElementById('sheetRoot').innerHTML='';lastFocus&&lastFocus.focus&&lastFocus.focus()}
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.getElementById('scrim'))closeSheet()});

render();
