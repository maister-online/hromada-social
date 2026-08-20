import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { registerDataApi } from './server-data.ts';

const PORT = Number(process.env.PORT || 3000);
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
  app.use(express.json({ limit: '10mb' }));
  registerDataApi(app);
  app.get('/api/health', (_req, res) => res.json({ ok: true, status: 'ONLINE', gemini: Boolean(process.env.GEMINI_API_KEY), model: GEMINI_MODEL, persistentData: true, timestamp: new Date().toISOString() }));
  app.post('/api/network/ping', (_req, res) => res.json({ ok: true, status: 'ONLINE', timestamp: new Date().toISOString() }));
  app.post('/api/network/analyze-error', async (req, res) => { const result = await answer(`Проаналізуй технічну помилку українською та дай конкретні кроки виправлення:\n${String(req.body?.errorText || '')}`); res.json({ ok: true, analysis: result.text, provider: result.provider }); });
  const chat = async (req: express.Request, res: express.Response) => { const message = typeof req.body?.message === 'string' ? req.body.message : ''; if (!message.trim()) return res.status(400).json({ ok: false, error: 'Не передано повідомлення.' }); const result = await answer(message, req.body?.conversationHistory || req.body?.history || []); res.json({ ok: true, answer: result.text, reply: result.text, sources: result.sources, webSources: result.sources, usedSearch: result.usedSearch, searchQueries: result.searchQueries, provider: result.provider, model: result.model, fallbackUsed: result.fallbackUsed, timestamp: new Date().toISOString() }); };
  app.post('/api/chat', chat); app.post('/api/mashunya', chat);
  app.post('/api/social-request', async (req, res) => { const result = await answer(`Сформуй офіційне соціальне звернення українською. Деталі: ${String(req.body?.details || '')}`); res.json({ ok: true, response: result.text, answer: result.text, provider: result.provider }); });
  const distPath = path.resolve(process.cwd(), 'dist');
  if (process.env.NODE_ENV !== 'production') { const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' }); app.use(vite.middlewares); } else { app.use(express.static(distPath)); app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html'))); }
  app.listen(PORT, '0.0.0.0', () => console.log(`Hromada Social listening on ${PORT}`));
}
main().catch(error => { console.error(error); process.exit(1); });
