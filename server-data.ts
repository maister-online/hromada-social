import fs from 'fs';
import path from 'path';
import type { Express, Request, Response } from 'express';

const dataDir = path.resolve(process.cwd(), '.data');
const dataFile = path.join(dataDir, 'hromada.json');

const collections = ['posts','comments','likes','petitions','problems','appeals','marketplace','groups','events','users','documents','officialNews'] as const;
type Collection = typeof collections[number];
type Item = Record<string, any> & { id: string; createdAt: string; updatedAt?: string };

type Store = Record<Collection, Item[]>;

const emptyStore = (): Store => Object.fromEntries(collections.map(name => [name, []])) as Store;

function readStore(): Store {
  try {
    if (!fs.existsSync(dataFile)) return emptyStore();
    const parsed = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    return { ...emptyStore(), ...parsed };
  } catch (error) {
    console.error('DATA_STORE_READ_ERROR', error);
    return emptyStore();
  }
}

function writeStore(store: Store) {
  fs.mkdirSync(dataDir, { recursive: true });
  const temp = `${dataFile}.tmp`;
  fs.writeFileSync(temp, JSON.stringify(store, null, 2), 'utf8');
  fs.renameSync(temp, dataFile);
}

function validCollection(value: string): value is Collection {
  return (collections as readonly string[]).includes(value);
}

function id() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function sendError(res: Response, status: number, error: string) {
  return res.status(status).json({ ok: false, error });
}

export function registerDataApi(app: Express) {
  app.get('/api/data', (_req, res) => res.json({ ok: true, collections }));

  app.get('/api/data/:collection', (req, res) => {
    const collection = req.params.collection;
    if (!validCollection(collection)) return sendError(res, 404, 'Невідома колекція');
    const store = readStore();
    return res.json({ ok: true, data: store[collection] });
  });

  app.post('/api/data/:collection', (req, res) => {
    const collection = req.params.collection;
    if (!validCollection(collection)) return sendError(res, 404, 'Невідома колекція');
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) return sendError(res, 400, 'Некоректні дані');
    const now = new Date().toISOString();
    const item: Item = { ...req.body, id: String(req.body.id || id()), createdAt: String(req.body.createdAt || now), updatedAt: now };
    const store = readStore();
    store[collection].push(item);
    writeStore(store);
    return res.status(201).json({ ok: true, data: item });
  });

  app.patch('/api/data/:collection/:id', (req, res) => {
    const { collection, id: itemId } = req.params;
    if (!validCollection(collection)) return sendError(res, 404, 'Невідома колекція');
    const store = readStore();
    const index = store[collection].findIndex(item => item.id === itemId);
    if (index < 0) return sendError(res, 404, 'Запис не знайдено');
    const existing = store[collection][index];
    const updated: Item = { ...existing, ...req.body, id: existing.id, createdAt: existing.createdAt, updatedAt: new Date().toISOString() };
    store[collection][index] = updated;
    writeStore(store);
    return res.json({ ok: true, data: updated });
  });

  app.delete('/api/data/:collection/:id', (req, res) => {
    const { collection, id: itemId } = req.params;
    if (!validCollection(collection)) return sendError(res, 404, 'Невідома колекція');
    const store = readStore();
    const before = store[collection].length;
    store[collection] = store[collection].filter(item => item.id !== itemId);
    if (before === store[collection].length) return sendError(res, 404, 'Запис не знайдено');
    writeStore(store);
    return res.json({ ok: true });
  });

  app.get('/api/data/:collection/:id', (req, res) => {
    const { collection, id: itemId } = req.params;
    if (!validCollection(collection)) return sendError(res, 404, 'Невідома колекція');
    const item = readStore()[collection].find(entry => entry.id === itemId);
    if (!item) return sendError(res, 404, 'Запис не знайдено');
    return res.json({ ok: true, data: item });
  });
}
