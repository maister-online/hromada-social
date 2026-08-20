import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { answer } from './server-free.ts';
import { registerDataApi } from './server-data.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = Number(process.env.PORT || 3000);
app.use(express.json({ limit: '10mb' }));
registerDataApi(app);

const chatHandler = async (req: express.Request, res: express.Response) => {
  const message = req.body?.message;
  if (!message || typeof message !== 'string') return res.status(400).json({ ok: false, error: 'Не передано повідомлення.' });
  const history = Array.isArray(req.body?.conversationHistory) ? req.body.conversationHistory : [];
  try {
    const result = await answer(message, history);
    res.json({ ok: true, answer: result.text, reply: result.text, sources: result.sources || [], webSources: result.sources || [], usedSearch: result.usedSearch || false, provider: result.provider || 'gemini', model: result.model || '', fallbackUsed: result.fallbackUsed || false, attempts: result.attempts || 1, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('CHAT_ERROR', error);
    res.status(502).json({ ok: false, error: 'Не вдалося отримати відповідь AI.' });
  }
};
app.post('/api/chat', chatHandler);
app.post('/api/mashunya', chatHandler);

app.get('/api/health', (_req, res) => res.json({ ok: true, status: 'online', timestamp: new Date().toISOString(), storage: 'persistent-file' }));
app.get('/api/network/ping', (_req, res) => res.json({ ok: true, status: 'online', latencyMs: 0, timestamp: new Date().toISOString() }));

const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));
app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));
app.listen(PORT, '0.0.0.0', () => console.log(`Hromada Social server listening on ${PORT}`));
