import {useEffect,useMemo,useRef,useState} from "react";
import L from "leaflet";
import "./style.css";
type Role="Мешканець"|"Підприємець"|"Журналіст"|"Депутат"|"Працівник ради"|"Поліцейський";
type Place={id:string;name:string;kind:string;lat:number;lng:number;desc:string};
type Choice={label:string;text:string;money?:number;trust?:number;rep?:number;energy?:number;item?:string;quest?:string};
type Talk={title:string;lines:string[];choices:Choice[]};
type NPC={id:string;name:string;job:string;greeting:string;topics:string[]};
const npcRoster:Record<string,NPC[]> = {
 square:[
 {id:"mykola",name:"Микола",job:"місцевий мешканець",greeting:"Вітаю! Я тутешній, знаю майже всіх у центрі.",topics:["Життя громади","Дороги й транспорт","Робота та заробіток","Сім'я і дозвілля","Чутки та новини","Запросити на подію"]},
 {id:"viktor",name:"Віктор",job:"водій",greeting:"Привіт. Щойно повернувся з рейсу.",topics:["Маршрути й автобуси","Стан доріг","Підробіток","Пасажири","Місцеві новини","Попрощатися"]},
 {id:"olha",name:"Ольга",job:"пенсіонерка",greeting:"Добридень, дитино. Чим можу допомогти?",topics:["Побутові проблеми","Допомога сусідам","Школа й діти","Медицина","Спогади про Рокитне","Попрощатися"]},
 {id:"taras",name:"Тарас",job:"молодий мешканець",greeting:"Йо! Збираємо компанію на вечір.",topics:["Друзі та відпочинок","Спорт","Соцмережі","Робота для молоді","Музика","Запросити погуляти"]}
 ],
 shop:[
 {id:"andrii",name:"Андрій",job:"продавець",greeting:"Вітаю! Я Андрій, сьогодні моя зміна. Що шукаєш?",topics:["Купити продукти","Повернути товар","Запитати про роботу","Поговорити про ціни","Місцеві новини","Поскаржитися на сервіс","Попрощатися"]},
 {id:"halyna",name:"Галина",job:"покупчиня",greeting:"Добрий день. Я часто тут купую продукти.",topics:["Порадити покупки","Ціни в магазинах","Рецепти Полісся","Плітки та новини","Попросити допомоги","Попрощатися"]},
 {id:"petro",name:"Петро",job:"постачальник",greeting:"Доброго дня! Привіз товар. Є хвилина поговорити.",topics:["Постачання товарів","Влаштуватися на роботу","Якість продукції","Проблеми доставки","Поговорити про бізнес","Попрощатися"]},
 {id:"sofia",name:"Софія",job:"касирка",greeting:"Привіт! Я Софія, працюю на касі.",topics:["Оплата й покупки","Знижки","Загублена річ","Робота в магазині","Поговорити про день","Попрощатися"]}
 ],
 council:[
 {id:"iryna",name:"Ірина",job:"спеціалістка звернень",greeting:"Добрий день. Я Ірина, приймаю звернення мешканців.",topics:["Подати звернення","Дізнатися про бюджет","Дороги та благоустрій","Записатися на прийом","Громадські слухання","Запит на публічну інформацію","Попрощатися"]},
 {id:"oleh",name:"Олег",job:"депутат",greeting:"Вітаю. Готовий вислухати пропозиції мешканців.",topics:["Місцеві проблеми","Бюджетні пріоритети","Зустріч із виборцями","Молодіжні ініціативи","Критика роботи ради","Співпраця","Попрощатися"]},
 {id:"nataliia",name:"Наталія",job:"відвідувачка",greeting:"Я прийшла з питанням щодо земельної ділянки.",topics:["Земельне питання","Комунальні послуги","Соціальна допомога","Черги та документи","Порадитися","Попрощатися"]},
 {id:"serhii_c",name:"Сергій",job:"керівник відділу",greeting:"Доброго дня. Я можу пояснити порядок звернень.",topics:["Дозвільні документи","Підприємництво","Комунальне майно","Робота установ","Оскарження рішення","Попрощатися"]}
 ],
 clinic:[
 {id:"olena",name:"Олена",job:"медсестра",greeting:"Вітаю. Я Олена. Що вас турбує?",topics:["Записатися на прийом","Поради щодо здоров'я","Аптечка та ліки","Вакцинація","Допомога літнім людям","Робота амбулаторії","Попрощатися"]},
 {id:"doctor",name:"Андрій Петрович",job:"сімейний лікар",greeting:"Добрий день. Розкажіть, що вас привело.",topics:["Консультація","Профілактичний огляд","Направлення до спеціаліста","Медична декларація","Графік прийому","Попрощатися"]},
 {id:"lidia",name:"Лідія",job:"пацієнтка",greeting:"Доброго дня. Чекаю своєї черги.",topics:["Черга та очікування","Медичні послуги","Поговорити про погоду","Попросити підтримки","Попрощатися"]},
 {id:"maksym",name:"Максим",job:"фельдшер",greeting:"Привіт. Я на чергуванні.",topics:["Виклик допомоги","Перша допомога","Медичне обладнання","Робота в медицині","Поговорити про громаду","Попрощатися"]}
 ],
 cafe:[
 {id:"mariia",name:"Марія",job:"відвідувачка",greeting:"Привіт! Я Марія. Тут часто збираються знайомі.",topics:["Познайомитися ближче","Події на вихідних","Робота та навчання","Стосунки й сім'я","Місцеві новини","Запросити на каву","Попрощатися"]},
 {id:"barista",name:"Денис",job:"бариста",greeting:"Вітаю! Що бажаєш замовити?",topics:["Замовити каву","Меню та ціни","Вакансія бариста","Відгук про заклад","Музика в кафе","Попрощатися"]},
 {id:"anna",name:"Анна",job:"студентка",greeting:"Привіт. Роблю тут домашнє завдання.",topics:["Навчання","Студентське життя","Плани на майбутнє","Молодіжні події","Соцмережі","Попрощатися"]},
 {id:"roman",name:"Роман",job:"підприємець",greeting:"Добрий день. Маю невелику справу в селищі.",topics:["Відкрити бізнес","Оренда приміщення","Клієнти й реклама","Податки та документи","Партнерство","Попрощатися"]}
 ],
 police:[
 {id:"serhii",name:"Сергій",job:"дільничний офіцер",greeting:"Добрий день. Я дільничний. Слухаю вас.",topics:["Подати заяву","Повідомити про проблему","Поради з безпеки","Дорожній рух","Знайдені речі","Права мешканців","Попрощатися"]},
 {id:"kateryna",name:"Катерина",job:"чергова",greeting:"Вітаю. Я чергова частини.",topics:["Як подати звернення","Графік прийому","Загублені документи","Порядок виклику служб","Попрощатися"]},
 {id:"dmytro",name:"Дмитро",job:"відвідувач",greeting:"Прийшов уточнити щодо свого звернення.",topics:["Статус звернення","Поговорити про безпеку","Попросити пояснення","Місцеві проблеми","Попрощатися"]},
 {id:"ira",name:"Ірина",job:"інспекторка",greeting:"Добрий день. Проводжу прийом громадян.",topics:["Профілактика правопорушень","Безпека дітей","Домашні конфлікти — куди звернутися","Шахрайство та захист","Попрощатися"]}
 ]
};
function npcChoices(n:NPC):Choice[]{return n.topics.map((topic,i)=>{
 const replies=[
 ["Звісно, розкажу. У громаді багато щоденних справ, і кожна залежить від активності мешканців.","Дякую за розмову. Можемо ще обговорити іншу тему."],
 ["Є кілька варіантів. Варто звернутися до відповідальної служби й уточнити деталі.","Я занотував твоє питання. Що ще хочеш дізнатися?"],
 ["Це питання часто обговорюють місцеві. Головне — перевіряти факти й чути різні сторони.","Радий, що ти цікавишся життям громади."],
 ["Можу поділитися власним досвідом. У кожного тут своя історія.","Можливо, ще зустрінемося й продовжимо."],
 ["Дякую за ініціативу! Такі розмови допомагають знаходити рішення.","Передам твою пропозицію в межах ігрового сюжету."],
 ["Цікава тема. Давай обговоримо спокійно та по суті.","Ти можеш повернутися до цієї розмови пізніше."]
 ];
 const pair=replies[i%replies.length];
 return {label:topic,text:n.name+": "+pair[0]+" "+pair[1],trust:i%3===0?2:1,rep:i%4===0?1:0,energy:topic==="Попрощатися"?0:undefined};
});}

const KEY="rokytne-total-simulator-v2";
const roles:Role[]=["Мешканець","Підприємець","Журналіст","Депутат","Працівник ради","Поліцейський"];
const places:Place[]=[
{id:"square",name:"Центральна площа",kind:"Локація",lat:51.28,lng:27.21,desc:"Місце зустрічей мешканців. Тут починається твоя історія."},
{id:"shop",name:"Магазин «Полісся»",kind:"Магазин",lat:51.281,lng:27.212,desc:"Продавець Андрій допоможе придбати необхідні речі."},
{id:"council",name:"Селищна рада",kind:"Установа",lat:51.279,lng:27.208,desc:"Тут приймають звернення та обговорюють справи громади."},
{id:"clinic",name:"Амбулаторія",kind:"Медицина",lat:51.283,lng:27.215,desc:"Медсестра Олена допоможе відновити сили."},
{id:"cafe",name:"Кав'ярня «Зустріч»",kind:"Кав'ярня",lat:51.277,lng:27.214,desc:"Знайомства, розмови та місцеві новини."},
{id:"police",name:"Поліцейська дільниця",kind:"Безпека",lat:51.282,lng:27.205,desc:"Дільничний Сергій приймає звернення."}
];
type Quest={id:string;title:string;text:string;done:boolean;reward:number};
type Game={player:{name:string;role:Role;money:number;energy:number;trust:number;rep:number;lat:number;lng:number};day:number;quests:Quest[];log:string[];items:string[];posts:string[]};
const fresh:Game={player:{name:"Гравець",role:"Мешканець",money:1000,energy:100,trust:50,rep:50,lat:51.28,lng:27.21},day:1,quests:[{id:"shop",title:"Перше знайомство",text:"Завітай до магазину та поговори з Андрієм.",done:false,reward:150},{id:"council",title:"Голос громади",text:"Подай звернення до селищної ради.",done:false,reward:250},{id:"clinic",title:"Добра справа",text:"Відвідай амбулаторію та допоможи Олені.",done:false,reward:200}],log:["Ти приїхав до Рокитного. Попереду нове життя.","Порада: натискай на значки локацій на карті."],items:["Телефон"],posts:[]};
function load():Game{try{const v=localStorage.getItem(KEY);if(v){const x=JSON.parse(v);return {...fresh,...x,player:{...fresh.player,...x.player},quests:x.quests||fresh.quests,log:x.log||fresh.log,items:x.items||fresh.items,posts:x.posts||[]};}}catch{}return fresh;}
export default function App(){
const [g,setG]=useState<Game>(load),[tab,setTab]=useState("Світ"),[menu,setMenu]=useState(false),[place,setPlace]=useState<Place|null>(null),[talk,setTalk]=useState<Talk|null>(null),[notice,setNotice]=useState("Ласкаво просимо!"),[post,setPost]=useState("");
const mapEl=useRef<HTMLDivElement>(null),map=useRef<L.Map|null>(null),hero=useRef<L.Marker|null>(null),keys=useRef<Record<string,boolean>>({});
useEffect(()=>{localStorage.setItem(KEY,JSON.stringify(g));},[g]);
useEffect(()=>{if(!mapEl.current||map.current)return;const m=L.map(mapEl.current,{zoomControl:false}).setView([g.player.lat,g.player.lng],16);L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:20,attribution:"© OpenStreetMap"}).addTo(m);L.control.zoom({position:"bottomright"}).addTo(m);hero.current=L.marker([g.player.lat,g.player.lng],{icon:L.divIcon({className:"hero-pin",html:"<span>Т</span>",iconSize:[38,38],iconAnchor:[19,19]})}).addTo(m).bindTooltip("Твій персонаж");places.forEach(p=>{const symbol=p.id==="shop"?"₴":p.id==="clinic"?"+":p.id==="council"?"Р":p.id==="cafe"?"К":p.id==="police"?"П":"⌖";L.marker([p.lat,p.lng],{icon:L.divIcon({className:"poi-pin",html:"<span>"+symbol+"</span>",iconSize:[38,42],iconAnchor:[19,21]})}).addTo(m).on("click",()=>setPlace(p));});map.current=m;const t=setTimeout(()=>m.invalidateSize(),200);return()=>{clearTimeout(t);m.remove();map.current=null;};},[]);
useEffect(()=>{const down=(e:KeyboardEvent)=>{const k=e.key.toLowerCase();if(["w","a","s","d","arrowup","arrowdown","arrowleft","arrowright"].includes(k)&&!(e.target instanceof HTMLInputElement)&&!(e.target instanceof HTMLTextAreaElement)){e.preventDefault();keys.current[k]=true;}};const up=(e:KeyboardEvent)=>{keys.current[e.key.toLowerCase()]=false;};window.addEventListener("keydown",down);window.addEventListener("keyup",up);let raf=0,last=0;const tick=(t:number)=>{if(t-last>45){last=t;let x=0,y=0;const k=keys.current;if(k.w||k.arrowup)y++;if(k.s||k.arrowdown)y--;if(k.a||k.arrowleft)x--;if(k.d||k.arrowright)x++;if(x||y){const n=Math.hypot(x,y);x/=n;y/=n;setG(s=>{const lat=s.player.lat+y*.000009,lng=s.player.lng+x*.000009/Math.cos(s.player.lat*Math.PI/180);hero.current?.setLatLng([lat,lng]);return {...s,player:{...s.player,lat,lng}};});}}raf=requestAnimationFrame(tick);};raf=requestAnimationFrame(tick);return()=>{cancelAnimationFrame(raf);window.removeEventListener("keydown",down);window.removeEventListener("keyup",up);};},[]);
useEffect(()=>{map.current?.invalidateSize();},[menu,tab]);
const done=g.quests.filter(q=>q.done).length;
const nearest=useMemo(()=>places.map(p=>({...p,d:Math.round(Math.hypot((p.lat-g.player.lat)*111000,(p.lng-g.player.lng)*111000*Math.cos(g.player.lat*Math.PI/180)))})).sort((a,b)=>a.d-b.d)[0],[g.player.lat,g.player.lng]);
const changeTab=(t:string)=>{setTab(t);setMenu(false);setPlace(null);setTalk(null);};
function log(s:Game,line:string):Game{return {...s,log:[line,...s.log].slice(0,80)};}
function begin(p:Place,n:NPC){setPlace(null);setTalk({title:n.name+" — "+n.job,lines:[n.greeting,"Про що хочеш поговорити? Обери тему нижче."],choices:npcChoices(n)});}
function choose(c:Choice){setG(s=>{let n={...s,player:{...s.player,money:Math.max(0,s.player.money+(c.money||0)),trust:Math.min(100,s.player.trust+(c.trust||0)),rep:Math.min(100,s.player.rep+(c.rep||0)),energy:Math.min(100,s.player.energy+(c.energy||0))},items:c.item?[...s.items,c.item]:s.items};if(c.quest)n.quests=n.quests.map(q=>q.id===c.quest?{...q,done:true}:q);return log(n,c.text);});setNotice(c.text);setTalk(null);}
function enter(p:Place){setG(s=>({...s,player:{...s.player,lat:p.lat,lng:p.lng}}));hero.current?.setLatLng([p.lat,p.lng]);map.current?.setView([p.lat,p.lng],17);setPlace(p);}
function nextDay(){setG(s=>log({...s,day:s.day+1,player:{...s.player,energy:Math.min(100,s.player.energy+25)}}, "Почався день "+(s.day+1)+". Ти відновив сили."));setNotice("Новий день розпочався.");}
function publish(){if(!post.trim())return;setG(s=>log({...s,posts:[post.trim(),...s.posts]},s.player.name+" опублікував: "+post.trim()));setPost("");}
const nav=[["Світ","⌖"],["Завдання","✓"],["Персонаж","◉"],["Стрічка","▤"],["Журнал","☰"]];
return <div className="game-shell">
<header className="topbar"><button className="menu-toggle" onClick={()=>setMenu(v=>!v)}>{menu?"✕":"☰"}</button><div className="brand"><span className="brand-mark">Р</span><div><b>РОКИТНЕ</b><small>ЖИТТЯ ГРОМАДИ</small></div></div><div className="top-stats"><span>ДЕНЬ <b>{g.day}</b></span><span>ГРОШІ <b>{g.player.money} ₴</b></span><span>ЕНЕРГІЯ <b>{Math.round(g.player.energy)}%</b></span></div><button className="profile-chip" onClick={()=>changeTab("Персонаж")}>{g.player.name}</button></header>
<main className="game-layout"><section className="map-stage"><div id="map" ref={mapEl}/><div className="map-title"><b>РОКИТНЕ · ВІДКРИТИЙ СВІТ</b><span>Натисни на значок локації</span></div><div className="map-legend"><span>● Ти</span><span>● Локації</span></div><div className="move-help">РУХ: WASD / СТРІЛКИ</div></section>
<aside className={"side-panel "+(menu?"is-open":"")}><div className="panel-head"><div><small>ІГРОВИЙ ІНТЕРФЕЙС</small><h2>{tab}</h2></div><button className="close-menu" onClick={()=>setMenu(false)}>✕</button></div><nav className="side-nav">{nav.map(([n,ico])=><button key={n} className={tab===n?"selected":""} onClick={()=>changeTab(n)}><span>{ico}</span>{n}</button>)}</nav>
{tab==="Світ"&&<div className="panel-content"><div className="welcome-card"><small>ТВОЯ ІСТОРІЯ ПОЧИНАЄТЬСЯ ТУТ</small><h3>Вітаємо у Рокитному, {g.player.name}!</h3><p>{notice}</p></div><div className="section-title">ПОБЛИЗУ ТЕБЕ</div><button className="location-card" onClick={()=>setPlace(places.find(p=>p.id===nearest.id)||places[0])}><span className="location-symbol">⌖</span><span><b>{nearest.name}</b><small>{nearest.kind} · {nearest.d} м</small></span><strong>›</strong></button><div className="section-title">ШВИДКІ ДІЇ</div><div className="quick-actions"><button onClick={nextDay}>Наступний день</button><button onClick={()=>setG(s=>log({...s,player:{...s.player,energy:Math.min(100,s.player.energy+20)}},"Ти відпочив і відновив 20% енергії."))}>Відпочити +20%</button></div><div className="section-title">АКТИВНЕ ЗАВДАННЯ</div><div className="quest-mini">{g.quests.find(q=>!q.done)?.title||"Початкові завдання виконано"}<p>{g.quests.find(q=>!q.done)?.text||"Шукай нові пригоди."}</p><button onClick={()=>changeTab("Завдання")}>Усі завдання →</button></div></div>}
{tab==="Завдання"&&<div className="panel-content"><div className="progress-card"><b>ІСТОРІЯ ГРОМАДИ</b><strong>{done}/{g.quests.length}</strong><div className="progress-track"><i style={{width:(done/g.quests.length*100)+"%"}}/></div></div>{g.quests.map(q=><article className={"quest-card "+(q.done?"done":"")} key={q.id}><span>{q.done?"✓":"○"}</span><div><b>{q.title}</b><p>{q.text}</p><small>{q.done?"ВИКОНАНО":"НАГОРОДА: "+q.reward+" ₴"}</small></div></article>)}</div>}
{tab==="Персонаж"&&<div className="panel-content"><div className="character-card"><div className="avatar">Г</div><h3>{g.player.name}</h3><p>{g.player.role}</p></div><label>Ім'я<input value={g.player.name} onChange={e=>setG(s=>({...s,player:{...s.player,name:e.target.value}}))}/></label><label>Роль<select value={g.player.role} onChange={e=>setG(s=>({...s,player:{...s.player,role:e.target.value as Role}}))}>{roles.map(r=><option key={r}>{r}</option>)}</select></label><div className="stat-grid"><div><small>ДОВІРА</small><b>{g.player.trust}/100</b></div><div><small>РЕПУТАЦІЯ</small><b>{g.player.rep}/100</b></div><div><small>ЕНЕРГІЯ</small><b>{Math.round(g.player.energy)}%</b></div><div><small>ГРОШІ</small><b>{g.player.money} ₴</b></div></div><div className="section-title">ІНВЕНТАР</div><div className="inventory">{g.items.map((x,i)=><span key={i}>{x}</span>)}</div></div>}
{tab==="Стрічка"&&<div className="panel-content"><div className="section-title">ІГРОВА СТРІЧКА МЕШКАНЦІВ</div><textarea value={post} onChange={e=>setPost(e.target.value)} placeholder="Напиши допис..."/><button className="primary-btn full" onClick={publish}>Опублікувати</button><article className="feed-card"><b>Марія · мешканка</b><small>Сьогодні · NPC</small><p>Може, організуємо толоку біля парку? Разом зробимо містечко кращим!</p></article>{g.posts.map((x,i)=><article className="feed-card" key={i}><b>{g.player.name}</b><p>{x}</p></article>)}</div>}
{tab==="Журнал"&&<div className="panel-content"><div className="section-title">ІСТОРІЯ ТВОЇХ РІШЕНЬ</div>{g.log.map((x,i)=><article className="log-entry" key={i}>{x}</article>)}<button className="secondary-btn full" onClick={()=>{localStorage.removeItem(KEY);location.reload();}}>Почати спочатку</button></div>}
</aside></main>
{menu&&<button className="scrim" onClick={()=>setMenu(false)} aria-label="Закрити меню"/>}
{place&&<div className="modal-backdrop" onClick={()=>setPlace(null)}><section className="place-modal" onClick={e=>e.stopPropagation()}><button className="modal-close" onClick={()=>setPlace(null)}>✕</button><small>{place.kind.toUpperCase()} · ЛОКАЦІЯ</small><h2>{place.name}</h2><p>{place.desc}</p><div className="section-title">ЛЮДИ В ЦІЙ ЛОКАЦІЇ · ОБЕРИ ПЕРСОНАЖА</div><div className="npc-roster">{(npcRoster[place.id]||npcRoster.square).map(n=><button className="npc-card" key={n.id} onClick={()=>{setG(s=>({...s,player:{...s.player,lat:place.lat,lng:place.lng}}));hero.current?.setLatLng([place.lat,place.lng]);map.current?.setView([place.lat,place.lng],17);begin(place,n);}}><span className="npc-avatar">{n.name.slice(0,1)}</span><span><b>{n.name}</b><small>{n.job}</small></span><strong>›</strong></button>)}</div><div className="modal-actions"><button className="secondary-btn" onClick={()=>{map.current?.setView([place.lat,place.lng],18);setPlace(null);}}>Повернутися на карту</button></div></section></div>}
{talk&&<div className="modal-backdrop" onClick={()=>setTalk(null)}><section className="dialogue-modal" onClick={e=>e.stopPropagation()}><div className="dialogue-top"><small>РОЗМОВА · NPC</small><button className="modal-close" onClick={()=>setTalk(null)}>✕</button></div><h2>{talk.title}</h2><div className="dialogue-lines">{talk.lines.map((x,i)=><p key={i}>{x}</p>)}</div><div className="dialogue-choices">{talk.choices.map((c,i)=><button key={i} onClick={()=>choose(c)}>{c.label}<span>›</span></button>)}</div></section></div>}
<div className="toast">{notice}</div><footer className="bottom-note">ДЕМО · ПЕРСОНАЖІ ТА ПОДІЇ ВИГАДАНІ · КАРТА OPENSTREETMAP</footer></div>;
}