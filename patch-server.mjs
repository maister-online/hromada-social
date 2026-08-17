import fs from "fs";

const file = "server-ai.ts";
let s = fs.readFileSync(file, "utf8");

// Keep one normal Gemini model and a separate model for Google Search.
if (/const GEMINI_SEARCH_MODEL\s*=/.test(s)) {
  s = s.replace(/const GEMINI_SEARCH_MODEL\s*=\s*"[^"]+";/, 'const GEMINI_SEARCH_MODEL = "gemini-2.5-flash";');
} else {
  s = s.replace(
    'const GEMINI_MODEL = "gemini-3.6-flash";\n',
    'const GEMINI_MODEL = "gemini-3.6-flash";\nconst GEMINI_SEARCH_MODEL = "gemini-2.5-flash";\n'
  );
}

// Search requests use the dedicated search model; synthesis requests never invoke Search.
s = s.replace(
  'const searchRequired = forceSearch || isSearchRequest(message);',
  'const searchRequired = !message.startsWith("__MASHUNYA_SYNTHESIS__") && (forceSearch || isSearchRequest(message));'
);
s = s.replace(
  'model: GEMINI_MODEL,\n      contents: buildContents(message, history),',
  'model: searchRequired ? GEMINI_SEARCH_MODEL : GEMINI_MODEL,\n      contents: buildContents(message, history),'
);
s = s.replace(
  'model: GEMINI_MODEL,\n      contents: buildContents(message, history),',
  'model: searchRequired ? GEMINI_SEARCH_MODEL : GEMINI_MODEL,\n      contents: buildContents(message, history),'
);

// Replace the ordinary web search with a cleaner multi-query fallback.
const startSearch = s.indexOf("async function ordinarySearch(query: string)");
const startSynthesis = s.indexOf("async function synthesizeSearchResults", startSearch);
if (startSearch !== -1 && startSynthesis !== -1) {
  const replacement = String.raw`async function ordinarySearch(query: string) {
  try {
    const cleanQuery = query.replace(/^Знайди актуальну інформацію та джерела за запитом:\s*/iu, "").trim();
    const variants = [cleanQuery, `${cleanQuery} Рокитне Рівненська область`, `${cleanQuery} Рокитнівська громада`];
    const all: { title: string; url: string; snippet: string }[] = [];

    for (const q of variants) {
      const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(q.slice(0, 300))}`;
      const response = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 HromadaSocial/1.0" } });
      if (!response.ok) continue;
      const html = await response.text();
      const re = /<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?(?:<a[^>]+class="result__snippet"[^>]*>([\s\S]*?)<\/a>|<div[^>]+class="result__snippet"[^>]*>([\s\S]*?)<\/div>)/gi;
      let match: RegExpExecArray | null;
      while ((match = re.exec(html)) && all.length < 18) {
        const title = decodeHtml(match[2]);
        const resultUrl = normalizeSearchUrl(match[1]);
        const snippet = decodeHtml(match[3] || match[4] || "");
        if (title && /^https?:\/\//i.test(resultUrl)) all.push({ title, url: resultUrl, snippet });
      }
    }
    return Array.from(new Map(all.map(s => [s.url, s])).values()).slice(0, 8);
  } catch {
    return [];
  }
}

`;
  s = s.slice(0, startSearch) + replacement + s.slice(startSynthesis);
}

// Synthesis uses normal Gemini without Search Grounding.
const startSynth = s.indexOf("async function synthesizeSearchResults");
const startAnswer = s.indexOf("async function answer", startSynth);
if (startSynth !== -1 && startAnswer !== -1) {
  const replacement = String.raw`async function synthesizeSearchResults(query: string, sources: { title: string; url: string; snippet?: string }[], history: any[] = []) {
  const sourceText = sources.map((src, i) => `${i + 1}. ${src.title}\n${src.snippet ? `Опис: ${src.snippet}\n` : ""}URL: ${src.url}`).join("\n\n");
  const prompt = `__MASHUNYA_SYNTHESIS__\nКористувач запитав: ${query}\n\nЗнайдені вебджерела:\n${sourceText}\n\nСформуй точну коротку відповідь українською. Використовуй лише інформацію з наведених результатів. Якщо джерела не дають однозначної відповіді — прямо скажи про це. Не вигадуй. Наприкінці додай «Джерела» з назвами джерел без технічних redirect-посилань.`;
  const result = await geminiChat(prompt, history, false);
  return result.text;
}

`;
  s = s.slice(0, startSynth) + replacement + s.slice(startAnswer);
}

s = s.replace(
  'googleSearchGrounding: true, ordinarySearchFallback: true,',
  'googleSearchGrounding: true, googleSearchModel: GEMINI_SEARCH_MODEL, ordinarySearchFallback: true,'
);

fs.writeFileSync(file, s);
console.log("Mashunya server patch applied: Gemini normal=3.6, Google Search=2.5, synthesis=no-search");
