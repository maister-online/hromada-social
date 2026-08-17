import fs from "fs";
const file = "server-ai.ts";
let s = fs.readFileSync(file, "utf8");

if (!s.includes('const GEMINI_SEARCH_MODEL')) {
  s = s.replace('const GEMINI_MODEL = "gemini-3.6-flash";\n', 'const GEMINI_MODEL = "gemini-3.6-flash";\nconst GEMINI_SEARCH_MODEL = "gemini-2.5-flash";\n');
}

s = s.replace('const searchRequired = forceSearch || isSearchRequest(message);', 'const searchRequired = forceSearch || (isSearchRequest(message) && !message.startsWith("__MASHUNYA_SYNTHESIS__"));');
s = s.replace('model: GEMINI_MODEL,\n      contents: buildContents(message, history),', 'model: searchRequired ? GEMINI_SEARCH_MODEL : GEMINI_MODEL,\n      contents: buildContents(message, history),');

const searchBlock = /async function ordinarySearch\\(query: string\\) \\{[\\s\\S]*?\\n\\}\\n\\nasync function synthesizeSearchResults/;
const replacement = String.raw`async function ordinarySearch(query: string) {
  try {
    const cleanQuery = query.replace(/^Знайди актуальну інформацію та джерела за запитом:\\s*/iu, "").trim();
    const variants = [cleanQuery, `"${cleanQuery.slice(0, 180)}"`, `${cleanQuery} Рокитне Рівненська область`];
    const all: { title: string; url: string; snippet: string }[] = [];
    for (const q of variants) {
      const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(q.slice(0, 300))}`;
      const response = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 HromadaSocial/1.0" } });
      if (!response.ok) continue;
      const html = await response.text();
      const re = /<div[^>]+class="result"[\\s\\S]*?<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>([\\s\\S]*?)<\\/a>[\\s\\S]*?(?:<a[^>]+class="result__snippet"[^>]*>([\\s\\S]*?)<\\/a>|<div[^>]+class="result__snippet"[^>]*>([\\s\\S]*?)<\\/div>)/gi;
      let match: RegExpExecArray | null;
      while ((match = re.exec(html)) && all.length < 12) {
        const title = decodeHtml(match[2]);
        const resultUrl = normalizeSearchUrl(match[1]);
        const snippet = decodeHtml(match[3] || match[4] || "");
        if (title && /^https?:\\/\\//i.test(resultUrl)) all.push({ title, url: resultUrl, snippet });
      }
    }
    return Array.from(new Map(all.map(s => [s.url, s])).values()).slice(0, 8);
  } catch {
    return [];
  }
}

async function synthesizeSearchResults`;
if (searchBlock.test(s)) s = s.replace(searchBlock, replacement);

const synthBlock = /async function synthesizeSearchResults\\(query: string, sources: \\{ title: string; url: string; snippet\\?: string \\}\\[\\], history: any\\[\\] = \\[\\]\\) \\{[\\s\\S]*?\\n\\}\\n\\nasync function answer/;
const synthReplacement = String.raw`async function synthesizeSearchResults(query: string, sources: { title: string; url: string; snippet?: string }[], history: any[] = []) {
  const sourceText = sources.map((s, i) => `${i + 1}. ${s.title}\n${s.snippet ? `Опис: ${s.snippet}\n` : ""}URL: ${s.url}`).join("\n\n");
  const prompt = `__MASHUNYA_SYNTHESIS__\nКористувач запитав: ${query}\n\nЗнайдені вебджерела:\n${sourceText}\n\nСформуй точну коротку відповідь українською. Використовуй лише інформацію з наведених результатів. Якщо джерела не дають однозначної відповіді — прямо скажи про це. Не вигадуй. Наприкінці додай «Джерела» з назвами джерел без технічних redirect-посилань.`;
  const result = await geminiChat(prompt, history, false);
  return result.text;
}

async function answer`;
if (synthBlock.test(s)) s = s.replace(synthBlock, synthReplacement);

s = s.replace('googleSearchGrounding: true, ordinarySearchFallback: true,', 'googleSearchGrounding: true, googleSearchModel: GEMINI_SEARCH_MODEL, ordinarySearchFallback: true,');
fs.writeFileSync(file, s);
console.log("Mashunya server patch applied");
