export interface UploadedImage {
  url: string;
  name: string;
  size: number;
  type: string;
}

export async function uploadImage(file: File): Promise<UploadedImage> {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowed.includes(file.type)) throw new Error('Підтримуються JPG, PNG, WEBP та GIF.');
  if (file.size > 8 * 1024 * 1024) throw new Error('Фото завелике. Максимальний розмір — 8 МБ.');

  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Не вдалося прочитати фото.'));
    reader.readAsDataURL(file);
  });

  const response = await fetch('/api/upload/image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: file.name, type: file.type, size: file.size, data: base64 })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data?.ok) throw new Error(data?.error || 'Не вдалося завантажити фото.');
  return data.data as UploadedImage;
}
