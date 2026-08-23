import { createClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_KEY;
const bucket = process.env.SUPABASE_MEDIA_BUCKET || 'media';

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabaseKey);
}

export async function checkSupabaseStorage() {
  if (!isSupabaseConfigured()) return { configured: false, bucket, accessible: false };
  try {
    const { error } = await client().storage.from(bucket).list('', { limit: 1 });
    return { configured: true, bucket, accessible: !error, error: error?.message || null };
  } catch (error: any) {
    return { configured: true, bucket, accessible: false, error: error?.message || String(error) };
  }
}

function client() {
  if (!supabaseUrl || !supabaseKey) throw new Error('Supabase storage is not configured');
  return createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function uploadImageToSupabase(buffer: Buffer, mimeType: string, originalName = 'image') {
  const ext = (originalName.split('.').pop() || mimeType.split('/').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
  const path = `images/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${ext}`;
  const { error } = await client().storage.from(bucket).upload(path, buffer, { contentType: mimeType, upsert: false, cacheControl: '31536000' });
  if (error) throw error;
  const { data } = client().storage.from(bucket).getPublicUrl(path);
  return { url: data.publicUrl, path };
}
