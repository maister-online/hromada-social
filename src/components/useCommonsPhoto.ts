import { useEffect, useRef, useState } from 'react';

const memoryCache = new Map<string, Promise<string | null>>();

function readCache(key: string): string | null {
  try { return localStorage.getItem(`commons-photo:${key}`); } catch { return null; }
}
function writeCache(key: string, value: string | null) {
  try { if (value) localStorage.setItem(`commons-photo:${key}`, value); } catch { /* storage may be unavailable */ }
}

async function searchCommons(query: string): Promise<string | null> {
  const key = query.trim().toLowerCase();
  if (!key) return null;
  const saved = readCache(key);
  if (saved) return saved;
  if (memoryCache.has(key)) return memoryCache.get(key)!;

  const request = (async () => {
    try {
      const params = new URLSearchParams({
        action: 'query',
        generator: 'search',
        gsrsearch: query,
        gsrnamespace: '6',
        gsrlimit: '5',
        prop: 'imageinfo',
        iiprop: 'url',
        iiurlwidth: '640',
        format: 'json',
        origin: '*',
      });
      const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params.toString()}`);
      if (!response.ok) return null;
      const data = await response.json();
      const pages = Object.values(data?.query?.pages ?? {}) as Array<any>;
      const page = pages.find((entry) => entry?.imageinfo?.[0]?.thumburl || entry?.imageinfo?.[0]?.url);
      const url = page?.imageinfo?.[0]?.thumburl || page?.imageinfo?.[0]?.url || null;
      writeCache(key, url);
      return url;
    } catch {
      return null;
    }
  })();
  memoryCache.set(key, request);
  return request;
}

export function useCommonsPhoto(query: string, fallbackQueries: string[] = []) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) { setVisible(true); return; }
    if (typeof IntersectionObserver === 'undefined') { setVisible(true); return; }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setVisible(true);
        observer.disconnect();
      }
    }, { rootMargin: '220px' });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || !query) return;
    let cancelled = false;
    (async () => {
      for (const term of [query, ...fallbackQueries]) {
        const result = await searchCommons(term);
        if (cancelled) return;
        if (result) { setSrc(result); return; }
      }
    })();
    return () => { cancelled = true; };
  }, [visible, query, fallbackQueries.join('|')]);

  return { ref, src };
}
