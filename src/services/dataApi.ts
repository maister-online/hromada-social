export type ApiItem = { id: string; createdAt?: string; updatedAt?: string; [key: string]: unknown };

const request = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(url, { headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) }, ...options });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body?.ok === false) throw new Error(body?.error || `HTTP ${response.status}`);
  return body as T;
};

export const dataApi = {
  list: async <T extends ApiItem = ApiItem>(collection: string) => (await request<{ ok: true; data: T[] }>(`/api/data/${encodeURIComponent(collection)}`)).data,
  create: async <T extends ApiItem = ApiItem>(collection: string, data: Omit<T, 'id'>) => (await request<{ ok: true; data: T }>(`/api/data/${encodeURIComponent(collection)}`, { method: 'POST', body: JSON.stringify(data) })).data,
  update: async <T extends ApiItem = ApiItem>(collection: string, id: string, data: Partial<T>) => (await request<{ ok: true; data: T }>(`/api/data/${encodeURIComponent(collection)}/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(data) })).data,
  remove: async (collection: string, id: string) => request<{ ok: true }>(`/api/data/${encodeURIComponent(collection)}/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  health: async () => request<{ ok: true; status: string; timestamp: string }>('/api/health'),
};
