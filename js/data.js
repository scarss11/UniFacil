// ============================================
// UniFácil — Datos: asignaturas, horario y tareas de ejemplo
// ============================================

const STATUS={pendiente:'Pendiente',proceso:'En proceso',completada:'Completada'};
const NEXT={pendiente:'proceso',proceso:'completada',completada:'pendiente'};

const today=new Date(); today.setHours(0,0,0,0);
const iso=d=>{const x=new Date(d);return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0')};
const plus=n=>{const d=new Date(today);d.setDate(d.getDate()+n);return iso(d)};
const parse=s=>{const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d)};

const SUBJ={
  calc:{n:'Cálculo II',c:'var(--s-blue)'},
  prog:{n:'Programación',c:'var(--s-lav)'},
  fis:{n:'Física I',c:'var(--s-teal)'},
  est:{n:'Estadística',c:'var(--s-orange)'},
  ing:{n:'Inglés B1',c:'var(--s-pink)'},
  eti:{n:'Ética profesional',c:'var(--s-green)'}
};
// Horario semanal (día 1 = lunes). Horas en formato decimal.
const CLASSES=[
  {d:1,s:'calc',a:7,b:9,r:'Aula B-204'},{d:1,s:'prog',a:10,b:12,r:'Sala de cómputo 3'},{d:1,s:'ing',a:14,b:16,r:'Aula C-102'},
  {d:2,s:'fis',a:7,b:9,r:'Aula A-301'},{d:2,s:'est',a:9.5,b:11.5,r:'Aula B-110'},{d:2,s:'eti',a:14,b:16,r:'Auditorio 2'},
  {d:3,s:'calc',a:7,b:9,r:'Aula B-204'},{d:3,s:'prog',a:10,b:12,r:'Sala de cómputo 3'},{d:3,s:'fis',a:14,b:17,r:'Laboratorio de física'},
  {d:4,s:'fis',a:7,b:9,r:'Aula A-301'},{d:4,s:'est',a:9.5,b:11.5,r:'Aula B-110'},{d:4,s:'ing',a:14,b:16,r:'Aula C-102'},
  {d:5,s:'prog',a:8,b:10,r:'Sala de cómputo 3'},{d:5,s:'calc',a:10,b:12,r:'Aula B-204'},{d:5,s:'eti',a:13,b:15,r:'Auditorio 2'}
];
const DAYS=['Lunes','Martes','Miércoles','Jueves','Viernes'];
const START=7, END=18, H=56;

const SAMPLE=[
  {id:1,n:'Taller de derivadas parciales',s:'calc',f:plus(1),st:'proceso'},
  {id:2,n:'Informe de laboratorio: péndulo simple',s:'fis',f:plus(2),st:'pendiente'},
  {id:3,n:'Quiz de distribuciones de probabilidad',s:'est',f:plus(3),st:'pendiente'},
  {id:4,n:'Proyecto final: app de inventario (entrega 1)',s:'prog',f:plus(4),st:'proceso'},
  {id:5,n:'Ensayo: dilemas éticos de la inteligencia artificial',s:'eti',f:plus(6),st:'pendiente'},
  {id:6,n:'Presentación oral: Unit 5 "Travel stories"',s:'ing',f:plus(8),st:'pendiente'},
  {id:7,n:'Lectura del capítulo 3 y resumen',s:'eti',f:plus(-1),st:'completada'},
  {id:8,n:'Ejercicios de vectores y fuerzas',s:'fis',f:plus(-2),st:'completada'}
];
