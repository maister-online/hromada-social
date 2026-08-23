import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import express from 'express';
import type { Express, Request, Response } from 'express';

const uploadDir = path.resolve(process.cwd(), '.data', 'uploads');
const MAX_BYTES = 8 * 1024 * 1024;
const TYPES: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };

function error(res: Response, status: number, message: string) { return res.status(status).json({ ok: false, error: message }); }

export function registerUploadApi(app: Express) {
  app.use('/uploads', express.static(uploadDir, { maxAge: '7d', index: false }));
  app.post('/api/upload/image', (req: Request, res: Response) => {
    try {
      const { name = 'photo', type, size, data } = req.body || {};
      const extension = TYPES[String(type || '')];
      if (!extension) return error(res, 400, 'Підтримуються JPG, PNG, WEBP та GIF.');
      if (Number(size) > MAX_BYTES) return error(res, 413, 'Фото завелике. Максимальний розмір — 8 МБ.');
      if (typeof data !== 'string' || !data.startsWith(`data:${type};base64,`)) return error(res, 400, 'Некоректний файл.');
      const buffer = Buffer.from(data.slice(data.indexOf(',') + 1), 'base64');
      if (!buffer.length || buffer.length > MAX_BYTES) return error(res, 413, 'Фото завелике або пошкоджене.');
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
