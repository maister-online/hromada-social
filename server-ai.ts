import express from 'express';
import path from 'path';
import { registerDataApi } from './server-data.ts';
import { isSupabaseConfigured, checkSupabaseStorage, uploadImageToSupabase } from './server-supabase.ts';

const PORT = Number(process.env.PORT || 3000);
const HOST = '0.0.0.0';
const IS_PRODUCTION = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const REQUEST_TIMEOUT_MS = Number(process.env.AI_TIMEOUT_MS || 45000);
const SYSTEM_PROMPT = `Ти Машуня — AI-помічниця Рокитнівської громади. Відповідай українською, коротко й точно. Не вигадуй факти, людей, документи, новини або посилання. Для актуальних запитів використовуй Google Search Grounding. Якщо джерел недостатньо — прямо скажи про це.`;

function needsSearch(message: string) { return /знайди|пошукай|гугл|інтернет|новин|сьогодні|зараз|актуаль|останні|перевір|біограф|документ|рішення|тендер|закупів|постанова|хто голова|інформація про/iu.test(message); }
function withTimeout(url: string, options: RequestInit) { const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS); return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timer)); }
function buildContents(message: string, history: any[]) { const out: any[] = []; for (const item of Array.isArray(history) ? history.slice(-8) : []) if (item?.text) out.push({ role: item.sender === 'user' || item.role === 'user' ? 'user' : 'model', parts: [{ text: String(item.text).slice(0, 2000) }] }); out.push({ role: 'user', parts: [{ text: message.slice(0, 6000) }] }); return out; }
function extractGrounding(data: any) { const candidate = data?.candidates?.[0]; const text = (candidate?.content?.parts || []).map((p: any) => p?.text || '').join('').trim(); const metadata = candidate?.groundingMetadata || {}; const sources = (Array.isArray(metadata.groundingChunks) ? metadata.groundingChunks : []).map((c: any) => c?.web).filter((w: any) => w?.uri).map((w: any) => ({ title: w.title || w.uri, url: w.uri })); const searchQueries = Array.from(new Set(metadata.webSearchQueries || [])); return { text, sources: Array.from(new Map(sources.map((s: any) => [s.url, s])).values()), searchQueries, usedSearch: sources.length > 0 || searchQueries.length > 0 }; }
async function askGemini(message: string, history: any[]) { const key = process.env.GEMINI_API_KEY; if (!key) throw new Error('GEMINI_API_KEY is not set'); const response = await withTimeout(`${GEMINI_URL}/${encodeURIComponent(GEMINI_MODEL)}:generateContent`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key }, body: JSON.stringify({ systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] }, contents: buildContents(message, history), ...(needsSearch(message) ? { tools: [{ google_search: {} }] } : {}), generationConfig: { temperature: 0.2, maxOutputTokens: 1000 } }) }); const raw = await response.text(); let data: any; try { data = JSON.parse(raw); } catch { data = {}; } if (!response.ok) throw new Error(data?.error?.message || `Gemini HTTP ${response.status}`); const result = extractGrounding(data); if (!result.text) throw new Error('Gemini returned an empty response'); return result; }
async function webFallback(query: string) { try { const response = await withTimeout(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query.slice(0, 300))}`, { headers: { 'User-Agent': 'Mozilla/5.0 HromadaSocial/1.0' } }); if (!response.ok) return []; const html = await response.text(); const results: any[] = []; const re = /<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi; let match: RegExpExecArray | null; while ((match = re.exec(html)) && results.length < 5) { const title = match[2].replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').trim(); if (title) results.push({ title, url: match[1] }); } return results; } catch { return []; } }
async function answer(message: string, history: any[] = []) { try { const result = await askGemini(message, history); return { ...result, provider: 'gemini', model: GEMINI_MODEL, fallbackUsed: false }; } catch (error: any) { const sources = await webFallback(message); if (sources.length) return { text: `Google Search через Gemini тимчасово недоступний. Ось реальні результати вебпошуку:\n\n${sources.map((s: any, i: number) => `${i + 1}. ${s.title}\n${s.url}`).join('\n\n')}`, sources, searchQueries: [message], usedSearch: true, provider: 'web-search-fallback', model: 'duckduckgo-html', fallbackUsed: true }; return { text: 'Машуня тимчасово не отримала відповідь від AI. Спробуй ще раз трохи пізніше.', sources: [], searchQueries: [], usedSearch: false, provider: 'fallback', model: 'none', fallbackUsed: true, error: String(error?.message || error) }; }
}

async function main() {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(express.json({ limit: '10mb' }));
  registerDataApi(app);

  app.get('/api/health', async (_req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    const storage = await checkSupabaseStorage();
    res.status(200).json({ ok: true, status: 'ONLINE', gemini: Boolean(process.env.GEMINI_API_KEY), supabase: isSupabaseConfigured(), supabaseUrlPresent: Boolean(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL), supabaseKeyPresent: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_KEY), storage, model: GEMINI_MODEL, persistentData: true, production: IS_PRODUCTION, port: PORT, timestamp: new Date().toISOString() });
  });

  app.post('/api/upload/image', async (req, res) => {
    try {
      const data = typeof req.body?.data === 'string' ? req.body.data : '';
      const mimeType = typeof req.body?.mimeType === 'string' ? req.body.mimeType : 'image/jpeg';
      const originalName = typeof req.body?.name === 'string' ? req.body.name : 'image.jpg';
      if (!data) return res.status(400).json({ ok: false, error: 'Фото не передано.' });
      if (!/^image\/(jpeg|jpg|png|webp|gif)$/i.test(mimeType)) return res.status(415).json({ ok: false, error: 'Підтримуються JPG, PNG, WEBP та GIF.' });
      const clean = data.replace(/^data:[^;]+;base64,/, '');
      const buffer = Buffer.from(clean, 'base64');
      if (!buffer.length || buffer.length > 8 * 1024 * 1024) return res.status(413).json({ ok: false, error: 'Фото має бути не більше 8 МБ.' });
      if (!isSupabaseConfigured()) return res.status(503).json({ ok: false, error: 'Сховище Supabase ще не налаштоване.' });
      const result = await uploadImageToSupabase(buffer, mimeType, originalName);
      res.status(201).json({ ok: true, url: result.url, path: result.path, storage: 'supabase' });
    } catch (error: any) {
      console.error('SUPABASE_UPLOAD_ERROR', error);
      res.status(500).json({ ok: false, error: 'Не вдалося завантажити фото в Supabase.' });
    }
  });

  app.post('/api/network/ping', (_req, res) => res.status(200).json({ ok: true, status: 'ONLINE', timestamp: new Date().toISOString() }));
  app.post('/api/network/analyze-error', async (req, res) => { const result = await answer(`Проаналізуй технічну помилку українською та дай конкретні кроки виправлення:\n${String(req.body?.errorText || '')}`); res.json({ ok: true, analysis: result.text, provider: result.provider }); });
  const chat = async (req: express.Request, res: express.Response) => { const message = typeof req.body?.message === 'string' ? req.body.message : ''; if (!message.trim()) return res.status(400).json({ ok: false, error: 'Не передано повідомлення.' }); const result = await answer(message, req.body?.conversationHistory || req.body?.history || []); res.json({ ok: true, answer: result.text, reply: result.text, sources: result.sources, webSources: result.sources, usedSearch: result.usedSearch, searchQueries: result.searchQueries, provider: result.provider, model: result.model, fallbackUsed: result.fallbackUsed, timestamp: new Date().toISOString() }); };
  app.post('/api/chat', chat);
  app.post('/api/mashunya', chat);
  app.post('/api/social-request', async (req, res) => { const result = await answer(`Сформуй офіційне соціальне звернення українською. Деталі: ${String(req.body?.details || '')}`); res.json({ ok: true, response: result.text, answer: result.text, provider: result.provider }); });

  const distPath = path.resolve(process.cwd(), 'dist');
  if (!IS_PRODUCTION) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath, { index: 'index.html' }));
    app.use((_req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  app.use((error: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => { console.error('HTTP_HANDLER_ERROR', error); if (!res.headersSent) res.status(500).json({ ok: false, error: 'Внутрішня помилка сервера.' }); });
  console.log(`Starting Hromada Social: production=${IS_PRODUCTION}, host=${HOST}, port=${PORT}`);
  const server = app.listen(PORT, HOST, () => console.log(`Hromada Social listening on ${HOST}:${PORT}`));
  server.on('error', (error) => { console.error('SERVER_LISTEN_ERROR', error); process.exit(1); });
}
process.on('uncaughtException', (error) => console.error('UNCAUGHT_EXCEPTION', error));
process.on('unhandledRejection', (error) => console.error('UNHANDLED_REJECTION', error));
main().catch(error => { console.error('SERVER_START_ERROR', error); process.exit(1); });