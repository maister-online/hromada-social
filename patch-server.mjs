import fs from 'node:fs';

// Idempotent production patcher. Source-only; no secrets are written here.
const serverFile = 'server-ai.ts';
let server = fs.readFileSync(serverFile, 'utf8');
server = server.replace(/const GEMINI_MODEL = process\.env\.GEMINI_MODEL \|\| '[^']+';/, "const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';");
server = server.replace('import { classifySearchIntent, prioritizeWebSources, WebSourceItem } from "./src/services/searchRouter";', 'import { classifySearchIntent, prioritizeWebSources, WebSourceItem } from "./src/services/searchRouter";\nimport { registerUploadApi } from "./server-upload";');
server = server.replace('app.use(express.json());', 'app.use(express.json({ limit: "12mb" }));\n  registerUploadApi(app);');
fs.writeFileSync(serverFile, server);

const appFile = 'src/App.tsx';
let app = fs.readFileSync(appFile, 'utf8');
const start = app.indexOf('function OfficialPortal');
const end = app.indexOf('function SectionSwitcher', start);
if (start >= 0 && end >= 0) {
  const portal = app.slice(start, end);
  fs.writeFileSync(appFile, app);
}

const aiFile = 'src/components/ai/AIAssistantPanel.tsx';
let ai = fs.readFileSync(aiFile, 'utf8');
ai = ai.replace("text: 'Опрацьовую запит. Сервіси Рокитного працюють. Ви можете перевірити послуги ЦНАП чи оголошення громади.',", "text: `Машуня не отримала відповідь від сервера AI. Перевірте GEMINI_API_KEY.\\n\\nТехнічна причина: ${err instanceof Error ? err.message : String(err)}`,");
ai = ai.replace("const botReply = data.reply || data.answer || data.fallbackReply || 'Запит опрацьовано. Які ще дані з мережі вас цікавлять?';", "if (!res.ok || data?.ok === false) throw new Error(data?.error || data?.message || `AI HTTP ${res.status}`);\n      const botReply = data.reply || data.answer;\n      if (!botReply) throw new Error('Сервер AI не повернув текст відповіді');");
fs.writeFileSync(aiFile, ai);

console.log('Production patch applied.');
