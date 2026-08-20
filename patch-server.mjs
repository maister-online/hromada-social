import fs from 'node:fs';

// Keep the build-time patcher idempotent. It patches only source files and never
// touches secrets or runtime data.
const serverFile = 'server-ai.ts';
let server = fs.readFileSync(serverFile, 'utf8');
server = server.replace(/const GEMINI_MODEL = process\.env\.GEMINI_MODEL \|\| '[^']+';/, "const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';");
fs.writeFileSync(serverFile, server);

const appFile = 'src/App.tsx';
let app = fs.readFileSync(appFile, 'utf8');
const start = app.indexOf('function OfficialPortal');
const end = app.indexOf('function SectionSwitcher', start);
if (start >= 0 && end >= 0) {
  let portal = app.slice(start, end);
  const institutionUrls = {
    'Селищна рада': 'https://rokytne-gromada.gov.ua/',
    'Водоканал': 'https://rokytne-gromada.gov.ua/',
    'КП Рокитне': 'https://rokytne-gromada.gov.ua/',
    'Освіта': 'https://rokytne-gromada.gov.ua/',
    'Медицина': 'https://rokytne-gromada.gov.ua/',
    'Соціальний захист': 'https://rokytne-gromada.gov.ua/'
  };
  for (const [title, url] of Object.entries(institutionUrls)) {
    const marker = `title: '${title}'`;
    const p = portal.indexOf(marker);
    if (p >= 0) {
      const lineEnd = portal.indexOf('\n', p);
      const line = portal.slice(p, lineEnd < 0 ? portal.length : lineEnd);
      if (!line.includes('url:')) {
        portal = portal.replace(line, `${line}, url: '${url}'`);
      }
    }
  }
  const serviceUrls = {
    'Рішення та документи': 'https://rokytne-gromada.gov.ua/',
    'Бюджет та відкриті дані': 'https://rokytne-gromada.gov.ua/',
    'ЦНАП та послуги': 'https://cnap.rokytne-gromada.gov.ua/',
    'Звернення громадян': 'https://rokytne-gromada.gov.ua/',
    'Карта громади': null,
    'Старостинські округи': 'https://rokytne-gromada.gov.ua/'
  };
  for (const [title, url] of Object.entries(serviceUrls)) {
    const p = portal.indexOf(`['${title}'`);
    if (p >= 0) {
      const lineEnd = portal.indexOf('\n', p);
      const line = portal.slice(p, lineEnd < 0 ? portal.length : lineEnd);
      if (!line.includes('null]') && !line.match(/https?:\/\//)) {
        portal = portal.replace(line, line.replace(/\],?$/, `, ${url ? `'${url}'` : 'null'}],`));
      }
    }
  }
  portal = portal.replace('function OfficialPortal({ onSelectTab }: { onSelectTab: (tab: string) => void }) {', "function OfficialPortal({ onSelectTab }: { onSelectTab: (tab: string) => void }) {\n  const openOfficial = (url: string | null, tab: string) => { if (url) window.open(url, '_blank', 'noopener,noreferrer'); else onSelectTab(tab); };");
  portal = portal.replace('({ title, subtitle, icon: Icon, accent, tab }) => (', '({ title, subtitle, icon: Icon, accent, tab, url }) => (');
  portal = portal.replace('onClick={() => onSelectTab(tab)}', 'onClick={() => openOfficial(url, tab)}');
  portal = portal.replace('{services.map(([title, subtitle, tab]) => (', '{services.map(([title, subtitle, tab, url]) => (');
  app = app.slice(0, start) + portal + app.slice(end);
  fs.writeFileSync(appFile, app);
}

const aiFile = 'src/components/ai/AIAssistantPanel.tsx';
let ai = fs.readFileSync(aiFile, 'utf8');
ai = ai.replace("text: 'Опрацьовую запит. Сервіси Рокитного працюють. Ви можете перевірити послуги ЦНАП чи оголошення громади.',", "text: `Машуня не отримала відповідь від сервера AI. Перевірте GEMINI_API_KEY у Render.\\n\\nТехнічна причина: ${err instanceof Error ? err.message : String(err)}`,");
fs.writeFileSync(aiFile, ai);

console.log('Production patch applied: official external links + Mashunya diagnostics');
