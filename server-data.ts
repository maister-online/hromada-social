import express from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

export function registerDataApi(app: express.Express) {
  const dataDir = path.resolve(process.env.DATA_DIR || '.data');
  const file = path.join(dataDir, 'hromada.json');
  const initial = { posts: [], comments: [], likes: [], petitions: [], problems: [], appeals: [], listings: [], groups: [], events: [], users: [] };
  let writeQueue = Promise.resolve();

  const load = async () => {
    await fs.mkdir(dataDir, { recursive: true });
    try { return JSON.parse(await fs.readFile(file, 'utf8')); }
    catch { await fs.writeFile(file, JSON.stringify(initial, null, 2)); return structuredClone(initial); }
  };
  const save = (db: any) => {
    writeQueue = writeQueue.then(() => fs.writeFile(file, JSON.stringify(db, null, 2)));
    return writeQueue;
  };
  const collection = (name: string) => name.replace(/[^a-zA-Z0-9_-]/g, '');

  app.get('/api/data/:collection', async (req, res) => {
    try {
      const db = await load(); const name = collection(req.params.collection);
      if (!(name in db)) return res.status(404).json({ ok:false, error:'Unknown collection' });
      res.json({ ok:true, data: db[name] });
    } catch { res.status(500).json({ ok:false, error:'Database read failed' }); }
  });

  app.post('/api/data/:collection', async (req, res) => {
    try {
      const db = await load(); const name = collection(req.params.collection);
      if (!(name in db)) return res.status(404).json({ ok:false, error:'Unknown collection' });
      const item = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...req.body };
      db[name].push(item); await save(db); res.status(201).json({ ok:true, data:item });
    } catch { res.status(500).json({ ok:false, error:'Database write failed' }); }
  });

  app.patch('/api/data/:collection/:id', async (req, res) => {
    try {
      const db = await load(); const name = collection(req.params.collection);
      if (!(name in db)) return res.status(404).json({ ok:false, error:'Unknown collection' });
      const index = db[name].findIndex((x:any) => x.id === req.params.id);
      if (index < 0) return res.status(404).json({ ok:false, error:'Item not found' });
      db[name][index] = { ...db[name][index], ...req.body, updatedAt: new Date().toISOString() };
      await save(db); res.json({ ok:true, data:db[name][index] });
    } catch { res.status(500).json({ ok:false, error:'Database update failed' }); }
  });

  app.delete('/api/data/:collection/:id', async (req, res) => {
    try {
      const db = await load(); const name = collection(req.params.collection);
      if (!(name in db)) return res.status(404).json({ ok:false, error:'Unknown collection' });
      const before = db[name].length; db[name] = db[name].filter((x:any) => x.id !== req.params.id);
      if (before === db[name].length) return res.status(404).json({ ok:false, error:'Item not found' });
      await save(db); res.json({ ok:true });
    } catch { res.status(500).json({ ok:false, error:'Database delete failed' }); }
  });
}
