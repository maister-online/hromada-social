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
        gsrlimit: '12',
        prop: 'imageinfo',
        iiprop: 'url|size',
        iiurlwidth: '800',
        format: 'json',
        origin: '*',
      });
      const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params.toString()}`);
      if (!response.ok) return null;
      const data = await response.json();
      const pages = Object.values(data?.query?.pages ?? {}) as Array<any>;
      const terms = key.split(/[^a-z0-9а-яіїєґ]+/i).filter((term) => term.length > 2);
      const candidates = pages
        .map((page) => {
          const info = page?.imageinfo?.[0];
          const title = String(page?.title ?? '').replace(/^File:/i, '').toLowerCase();
          const mime = String(info?.mime ?? '');
          const width = Number(info?.thumbwidth ?? info?.width ?? 0);
          const height = Number(info?.thumbheight ?? info?.height ?? 0);
          if (!info || !mime.startsWith('image/') || mime.includes('svg') || !info.thumburl) return null;
          if (width < 260 || height < 180) return null;
          const matches = terms.filter((term) => title.includes(term)).length;
          const exactPhrase = title.includes(key) ? 8 : 0;
          const resolutionScore = Math.min(3, (width * height) / 900000);
          const ratio = width / Math.max(1, height);
          const compositionScore = ratio >= 0.65 && ratio <= 2.4 ? 1.5 : 0;
          return {
            url: info.thumburl as string,
            score: exactPhrase + matches * 2 + resolutionScore + compositionScore,
          };
        })
        .filter((item): item is { url: string; score: number } => Boolean(item))
        .sort((a, b) => b.score - a.score);
      const url = candidates[0]?.url ?? null;
      writeCache(key, url);
      return url;
    } catch {
      return null;
    }
  })();
  memoryCache.set(key, request);
  const result = await request;
  if (!result) memoryCache.delete(key);
  return result;
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
    setSrc(null);
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
