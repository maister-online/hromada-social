import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import type { Express, Request, Response } from 'express';

const uploadDir = path.resolve(process.cwd(), '.data', 'uploads');
const MAX_BYTES = 8 * 1024 * 1024;
const TYPES: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };

function error(res: Response, status: number, message: string) { return res.status(status).json({ ok: false, error: message }); }

export function registerUploadApi(app: Express) {
  app.use('/uploads', (req, res, next) => {
    const file = path.basename(req.path);
    if (!file || file !== req.path.slice(1)) return res.status(404).end();
    expressStatic(req, res, next);
  });

  app.post('/api/upload/image', (req: Request, res: Response) => {
    try {
      const { name = 'photo', type, size, data } = req.body || {};
      const extension = TYPES[String(type || '')];
      if (!extension) return error(res, 400, 'Підтримуються JPG, PNG, WEBP та GIF.');
      if (Number(size) > MAX_BYTES) return error(res, 413, 'Фото завелике. Максимальний розмір — 8 МБ.');
      if (typeof data !== 'string' || !data.startsWith(`data:${type};base64,`)) return error(res, 400, 'Некоректний файл.');
      const base64 = data.slice(data.indexOf(',') + 1);
      const buffer = Buffer.from(base64, 'base64');
      if (buffer.length > MAX_BYTES) return error(res, 413, 'Фото завелике. Максимальний розмір — 8 МБ.');
      fs.mkdirSync(uploadDir, { recursive: true });
      const filename = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${extension}`;
      fs.writeFileSync(path.join(uploadDir, filename), buffer);
      return res.status(201).json({ ok: true, data: { url: `/uploads/${filename}`, name: String(name), size: buffer.length, type } });
    } catch (e) {
      console.error('IMAGE_UPLOAD_ERROR', e);
      return error(res, 500, 'Не вдалося зберегти фотографію.');
    }
  });
}

// Imported dynamically by patch-server.mjs so the existing Express app can serve uploads.
import expressStatic from 'express';
