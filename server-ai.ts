import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { registerDataApi } from './server-data.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT || 3000);
const app = express();
app.use(express.json({ limit: '10mb' }));

registerDataApi(app);

app.get('/api/health', (_req, res) => res.json({ ok: true, status: 'online', timestamp: new Date().toISOString(), storage: 'persistent-file' }));
app.get('/api/network/ping', (_req, res) => res.json({ ok: true, status: 'online', latencyMs: 0, timestamp: new Date().toISOString() }));

const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));
app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));

app.listen(PORT, '0.0.0.0', () => console.log(`Hromada Social server listening on ${PORT}`));
