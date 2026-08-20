import fs from 'node:fs';

// Idempotent production patcher. Source-only; no secrets are written here.
const serverFile = 'server-ai.ts';
let server = fs.readFileSync(serverFile, 'utf8');
server = server.replace(/const GEMINI_MODEL = process\.env\.GEMINI_MODEL \|\| '[^']+';/, "const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';");
fs.writeFileSync(serverFile, server);

const appFile = 'src/App.tsx';
let app = fs.readFileSync(appFile, 'utf8');
const start = app.indexOf('function OfficialPortal');
const end = app.indexOf('function SectionSwitcher', start);
if (start >= 0 && end >= 0) {
  const portal = `function OfficialPortal({ onSelectTab }: { onSelectTab: (tab: string) => void }) {
  const institutions = [
    { title: 'Селищна рада', subtitle: 'Офіційний сайт • вул. Незалежності, 15 • +380363522090', icon: Landmark, accent: 'cyan', tab: 'documents', url: 'https://rokytne-gromada.gov.ua/' },
    { title: 'ЦНАП', subtitle: 'вул. Незалежності, 15 • +380363521990 • cnaprokitne@ukr.net', icon: FileText, accent: 'sky', tab: 'cnap', url: 'https://cnap.rokytne-gromada.gov.ua/contacts' },
    { title: 'Водоканал', subtitle: 'Окремий сайт не підтверджено • офіційні повідомлення через портал громади', icon: Droplets, accent: 'sky', tab: 'documents', url: 'https://rokytne-gromada.gov.ua/' },
    { title: 'КП Рокитне', subtitle: 'Комунальні послуги та благоустрій • офіційний портал громади', icon: Building2, accent: 'emerald', tab: 'problems', url: 'https://rokytne-gromada.gov.ua/' },
    { title: 'Освіта', subtitle: 'Відділ освіти, молоді та спорту • вул. Незалежності, 13 • +380502830628', icon: School, accent: 'amber', tab: 'documents', url: 'https://rokytne-gromada.gov.ua/' },
    { title: 'Медицина', subtitle: 'Рокитнівська БЛІЛ • вул. Руслана Дубовця, 24 • +380363522789', icon: HeartPulse, accent: 'rose', tab: 'documents', url: 'https://rokytne-gromada.gov.ua/' },
    { title: 'Соціальний захист', subtitle: 'Соціальні послуги та допомога • через офіційний портал громади', icon: HandHeart, accent: 'violet', tab: 'cnap', url: 'https://rokytne-gromada.gov.ua/' },
  ];

  const services = [
    ['Рішення та документи', 'Офіційний сайт громади', 'documents', 'https://rokytne-gromada.gov.ua/'],
    ['Бюджет та відкриті дані', 'Офіційний портал громади', 'opendata', 'https://rokytne-gromada.gov.ua/'],
    ['ЦНАП та послуги', '+380363521990 • онлайн-послуги та е-черга', 'cnap', 'https://cnap.rokytne-gromada.gov.ua/'],
    ['Електронна приймальня ЦНАП', 'Подати звернення онлайн', 'cnap', 'https://cnap.rokytne-gromada.gov.ua/application'],
    ['Електронна черга ЦНАП', 'Попередній запис', 'cnap', 'https://cnap.rokytne-gromada.gov.ua/cherga'],
    ['Карта громади', 'Об’єкти, установи та інфраструктура', 'map', null],
    ['Старостинські округи', 'Офіційна інформація по округах', 'starostins', 'https://rokytne-gromada.gov.ua/'],
  ];

  const openOfficial = (url: string | null, tab: string) => {
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
    else onSelectTab(tab);
  };

  const call = (phone: string) => window.location.href = 'tel:' + phone;

  return (
    <div className="space-y-6 animate-fadeIn">
      <section className="official-hero rounded-3xl overflow-hidden border border-emerald-500/20">
        <div className="relative p-6 sm:p-8">
          <div className="official-grid" />
          <div className="relative max-w-3xl">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-emerald-300 font-bold"><ShieldCheck className="w-4 h-4" /> Офіційний портал громади</div>
            <h1 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight text-white">🏛️ ОФІЦІЙНІ</h1>
            <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-2xl">Офіційні установи, сервіси, контакти та перевірені посилання. Непідтверджені телефони й сайти не вигадуємо.</p>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between mb-3 px-1"><div><h2 className="text-lg font-black text-white">Установи громади</h2><p className="text-xs text-slate-500">Натисніть картку — відкриється офіційний ресурс</p></div><span className="official-badge">ОФІЦІЙНО</span></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {institutions.map(({ title, subtitle, icon: Icon, accent, tab, url }) => (
            <div key={title} className="official-institution-card text-left group flex items-center gap-3">
              <button onClick={() => openOfficial(url, tab)} className="flex items-center gap-3 min-w-0 flex-1 text-left">
                <div className={\`official-icon official-\${accent}\`}><Icon className="w-5 h-5" /></div>
                <div className="min-w-0 flex-1"><div className="flex items-center gap-2"><h3 className="font-bold text-white truncate">{title}</h3><span className="text-[9px] font-bold text-emerald-400">✓</span></div><p className="mt-1 text-xs leading-5 text-slate-500">{subtitle}</p></div>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition" />
              </button>
              {title === 'Селищна рада' && <button aria-label="Зателефонувати селищній раді" onClick={() => call('+380363522090')} className="shrink-0 p-2 rounded-xl border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10">☎</button>}
              {title === 'ЦНАП' && <button aria-label="Зателефонувати в ЦНАП" onClick={() => call('+380363521990')} className="shrink-0 p-2 rounded-xl border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10">☎</button>}
              {title === 'Освіта' && <button aria-label="Зателефонувати у відділ освіти" onClick={() => call('+380502830628')} className="shrink-0 p-2 rounded-xl border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10">☎</button>}
              {title === 'Медицина' && <button aria-label="Зателефонувати в лікарню" onClick={() => call('+380363522789')} className="shrink-0 p-2 rounded-xl border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10">☎</button>}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-black text-white mb-3 px-1">Офіційні сервіси</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {services.map(([title, subtitle, tab, url]) => (
            <button key={title} onClick={() => openOfficial(url, tab)} className="official-service-card text-left group">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center shrink-0"><FileText className="w-5 h-5 text-emerald-400" /></div>
              <div className="min-w-0 flex-1"><h3 className="font-bold text-sm text-white">{title}</h3><p className="mt-1 text-xs text-slate-500">{subtitle}</p></div><ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400" />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

`;
  app = app.slice(0, start) + portal + app.slice(end);
  fs.writeFileSync(appFile, app);
}

const aiFile = 'src/components/ai/AIAssistantPanel.tsx';
let ai = fs.readFileSync(aiFile, 'utf8');
ai = ai.replace("text: 'Опрацьовую запит. Сервіси Рокитного працюють. Ви можете перевірити послуги ЦНАП чи оголошення громади.',", "text: `Машуня не отримала відповідь від сервера AI. Перевірте GEMINI_API_KEY у Render.\\n\\nТехнічна причина: ${err instanceof Error ? err.message : String(err)}`,");
ai = ai.replace("const botReply = data.reply || data.answer || data.fallbackReply || 'Запит опрацьовано. Які ще дані з мережі вас цікавлять?';", "if (!res.ok || data?.ok === false) throw new Error(data?.error || data?.message || `AI HTTP ${res.status}`);\n      const botReply = data.reply || data.answer;\n      if (!botReply) throw new Error('Сервер AI не повернув текст відповіді');");
fs.writeFileSync(aiFile, ai);

console.log('Production patch applied: verified official links, real contact actions, and transparent Mashunya errors.');
