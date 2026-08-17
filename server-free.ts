import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const PORT = Number(process.env.PORT || 3000);
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/interactions";
const REQUEST_TIMEOUT_MS = Number(process.env.AI_TIMEOUT_MS || 45000);

const SYSTEM_PROMPT = `
Ти Машуня — дружня AI-помічниця Рокитнівської громади.
Відповідай живою сучасною українською мовою, коротко й по суті.

КРИТИЧНО ВАЖЛИВО:
- Не вигадуй факти, дати, новини, людей або посилання.
- Якщо запит просить знайти, перевірити, дізнатися хто така/такий конкретна особа, знайти інформацію про прізвище, актуальні новини, сьогоднішні події або будь-яку актуальну інформацію — ОБОВ'ЯЗКОВО використовуй Google Search.
- Для інформації про людину не припускай, що вона пов'язана з Рокитнівською громадою. Спочатку перевір пошуком.
- Якщо Google Search не знайшов надійних даних, прямо скажи, що підтвердженої інформації не знайдено.
- Відрізняй факт від припущення.
- Для важливих тверджень спирайся на знайдені веб-джерела.
- Якщо пошук виконано, коротко вкажи це у відповіді.
`;

function isSearchRequest(message: string): boolean {
  const q = message.toLowerCase().trim();
  return [
    "знайди", "пошукай", "гугл", "в інтернеті", "інтернет", "мережі", "в мережі",
    "хто такий", "хто така", "інформація про", "що відомо про", "знайти інформацію",
    "перевір", "перевірити", "новин", "сьогодні", "зараз", "актуаль", "останні",
    "прізвище", "фамілі", "біограф", "людина", "особа", "публікац", "згадки",
    "документ", "рішення", "тендер", "закупів", "постанова"
  ].some(x => q.includes(x));
}

function isSimpleGreeting(message: string): boolean {
  return /^(привіт|вітаю|добрий ранок|добрий день|добрий вечір|хай|hello|hi)[!.? ]*$/iu.test(message.trim());
}

function fallback(message: string): string {
  if (isSimpleGreeting(message)) return "Привіт! Я Машуня 😉 Що будемо сьогодні шукати?";
  return "Машуня тимчасово не отримала відповідь від AI. Спробуй повторити запит трохи пізніше.";
}

function errorDetails(error: any) {
  return {
    code: Number(error?.status || error?.code) || null,
    status: error?.status || null,
    message: String(error?.message || error).slice(0, 2000),
    provider: error?.provider || null,
    providerError: error?.providerError || null
  };
}

function buildInput(message: string, history: any[] = []) {
  const safeHistory = Array.isArray(history)
    ? history
        .filter((m: any) => m && typeof m.text === "string")
        .slice(-8)
        .map((m: any) => `${m.sender === "user" || m.role === "user" ? "Користувач" : "Машуня"}: ${m.text.slice(0, 2000)}`)
        .join("\n")
    : "";
  return safeHistory
    ? `Попередній діалог:\n${safeHistory}\n\nНовий запит користувача:\n${message.slice(0, 4000)}`
    : message.slice(0, 4000);
}

async function fetchWithTimeout(url: string, options: RequestInit) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try { return await fetch(url, { ...options, signal: controller.signal }); }
  finally { clearTimeout(timer); }
}

function extractInteraction(data: any) {
  const steps = Array.isArray(data?.steps) ? data.steps : [];
  let text = "";
  const sources: { title: string; url: string }[] = [];
  const searchQueries: string[] = [];

  for (const step of steps) {
    if (step?.type === "google_search_call") {
      const queries = step?.arguments?.queries;
      if (Array.isArray(queries)) searchQueries.push(...queries.filter((q: any) => typeof q === "string"));
    }
    if (step?.type === "model_output" && Array.isArray(step?.content)) {
      for (const block of step.content) {
        if (block?.type !== "text") continue;
        text += String(block.text || "");
        if (Array.isArray(block.annotations)) {
          for (const annotation of block.annotations) {
            if (annotation?.type === "url_citation" && annotation?.url) {
              sources.push({ title: annotation.title || annotation.url, url: annotation.url });
            }
          }
        }
      }
    }
  }

  if (!text && typeof data?.output_text === "string") text = data.output_text;
  const uniqueSources = Array.from(new Map(sources.map(s => [s.url, s])).values());
  const uniqueQueries = Array.from(new Set(searchQueries));
  return {
    text: text.trim(),
    sources: uniqueSources,
    searchQueries: uniqueQueries,
    usedSearch: uniqueQueries.length > 0 || uniqueSources.length > 0,
    status: data?.status || null,
    interactionId: data?.id || null
  };
}

async function geminiInteraction(message: string, history: any[] = [], maxTokens = 800) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw Object.assign(new Error("GEMINI_API_KEY is not set"), { status: 503, provider: "gemini" });

  const searchRequired = isSearchRequest(message);
  const searchInstruction = searchRequired
    ? `\n\nЦЕ ОБОВ'ЯЗКОВИЙ ВЕБ-ПОШУК. Перед відповіддю використай інструмент Google Search. Якщо запит стосується людини або прізвища — шукай точний запит, перевіряй кілька джерел і не вигадуй зв'язок із Рокитнівською громадою.`
    : "";

  const response = await fetchWithTimeout(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({
      model: GEMINI_MODEL,
      input: buildInput(message, history),
      system_instruction: SYSTEM_PROMPT + searchInstruction,
      tools: searchRequired ? [{ type: "google_search" }] : [],
      tool_choice: searchRequired ? "any" : "auto",
      store: false,
      generation_config: { max_output_tokens: maxTokens, thinking_level: "low" }
    })
  });

  const raw = await response.text();
  let data: any;
  try { data = JSON.parse(raw); } catch { data = { error: { message: raw } }; }

  if (!response.ok) {
    const error: any = new Error(data?.error?.message || `Gemini Interactions HTTP ${response.status}`);
    error.status = response.status;
    error.provider = "gemini-interactions";
    error.providerError = data?.error || data;
    throw error;
  }
  if (data?.status === "failed") {
    const error: any = new Error(data?.error?.message || "Gemini interaction failed");
    error.status = 502;
    error.provider = "gemini-interactions";
    error.providerError = data?.error || data;
    throw error;
  }

  const result = extractInteraction(data);
  if (!result.text) {
    const error: any = new Error("Gemini returned an empty interaction output");
    error.status = 502;
    error.provider = "gemini-interactions";
    error.providerError = data;
    throw error;
  }
  return { ...result, searchRequired };
}

async function ordinarySearch(query: string) {
  try {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query.slice(0, 300))}`;
    const response = await fetchWithTimeout(url, { headers: { "User-Agent": "Mozilla/5.0 HromadaSocial/1.0" } });
    if (!response.ok) throw new Error(`search HTTP ${response.status}`);
    const html = await response.text();
    const results: { title: string; url: string }[] = [];
    const re = /<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
    let match: RegExpExecArray | null;
    while ((match = re.exec(html)) && results.length < 5) {
      const title = match[2].replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").trim();
      if (title && match[1]) results.push({ title, url: match[1] });
    }
    return results;
  } catch (error) {
    console.warn("Ordinary search failed:", errorDetails(error));
    return [];
  }
}

async function answer(message: string, history: any[] = []) {
  try {
    const result = await geminiInteraction(message, history);
    console.log(`Mashunya AI success model=${GEMINI_MODEL} searchRequired=${result.searchRequired} usedSearch=${result.usedSearch} queries=${JSON.stringify(result.searchQueries)}`);
    return {
      text: result.text,
      provider: "gemini-interactions",
      model: GEMINI_MODEL,
      fallbackUsed: false,
      usedSearch: result.usedSearch,
      searchQueries: result.searchQueries,
      sources: result.sources,
      attempts: []
    };
  } catch (error: any) {
    const details = errorDetails(error);
    console.warn(`Mashunya AI error model=${GEMINI_MODEL}:`, JSON.stringify(details));
    const sources = await ordinarySearch(message);
    if (sources.length) {
      const sourceText = sources.map((s, i) => `${i + 1}. ${s.title} — ${s.url}`).join("\n");
      return {
        text: `Google Search через Gemini зараз недоступний. Технічна причина: ${details.status || details.code || "невідома"}. Нижче — звичайні результати вебпошуку, без вигаданого аналізу:\n\n${sourceText}`,
        provider: "search-fallback",
        model: "duckduckgo-html",
        fallbackUsed: true,
        usedSearch: true,
        searchQueries: [message],
        sources,
        attempts: [{ provider: "gemini-interactions", model: GEMINI_MODEL, error: details }]
      };
    }
    return {
      text: fallback(message), provider: "fallback", model: "none", fallbackUsed: true,
      usedSearch: false, searchQueries: [], sources: [], attempts: [{ provider: "gemini-interactions", model: GEMINI_MODEL, error: details }]
    };
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_req, res) => res.json({
    ok: true, mode: "gemini-interactions-google-search", gemini: { enabled: Boolean(process.env.GEMINI_API_KEY), model: GEMINI_MODEL }, googleSearchGrounding: true, ordinarySearchFallback: true, time: new Date().toISOString()
  }));

  app.post("/api/network/ping", (_req, res) => res.json({ ok: true, status: "ONLINE", timestamp: new Date().toISOString() }));

  app.post("/api/network/analyze-error", async (req, res) => {
    const errorText = typeof req.body?.errorText === "string" ? req.body.errorText : "";
    if (!errorText) return res.status(400).json({ ok: false, error: "Текст помилки обов'язковий" });
    const result = await answer(`Проаналізуй цю технічну помилку українською та дай короткі кроки виправлення:\n${errorText}`);
    res.json({ ok: true, analysis: result.text, provider: result.provider, fallbackUsed: result.fallbackUsed, timestamp: new Date().toISOString() });
  });

  app.get("/api/test-ai", async (_req, res) => {
    const result = await answer("Відповідай одним коротким реченням: Привіт від Машуні!", []);
    res.status(result.provider === "fallback" ? 502 : 200).json({ ok: result.provider !== "fallback", answer: result.text, provider: result.provider, model: result.model, fallbackUsed: result.fallbackUsed, attempts: result.attempts });
  });

  app.get("/api/test-google-search", async (req, res) => {
    const q = typeof req.query.q === "string" && req.query.q.trim() ? req.query.q.trim() : "Хто є головою Рокитнівської селищної територіальної громади?";
    const result = await answer(`Знайди в Google актуальну інформацію та джерела за запитом: ${q}`);
    res.status(result.provider === "fallback" ? 502 : 200).json({ ok: result.provider !== "fallback", query: q, answer: result.text, provider: result.provider, model: result.model, usedSearch: result.usedSearch, searchQueries: result.searchQueries, sources: result.sources, fallbackUsed: result.fallbackUsed, attempts: result.attempts });
  });

  const chatHandler = async (req: express.Request, res: express.Response) => {
    const message = req.body?.message;
    if (!message || typeof message !== "string") return res.status(400).json({ ok: false, error: "Не передано повідомлення." });
    const history = Array.isArray(req.body?.conversationHistory) ? req.body.conversationHistory : Array.isArray(req.body?.history) ? req.body.history : [];
    const result = await answer(message, history);
    res.json({ ok: true, answer: result.text, reply: result.text, sources: result.sources, webSources: result.sources, usedSearch: result.usedSearch, searchQueries: result.searchQueries, quickActions: [], emotion: "smile", searchCategory: result.usedSearch ? "web" : "general", provider: result.provider, model: result.model, fallbackUsed: result.fallbackUsed, timestamp: new Date().toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" }) });
  };

  app.post("/api/chat", chatHandler);
  app.post("/api/mashunya", chatHandler);

  app.post("/api/social-request", async (req, res) => {
    const details = typeof req.body?.details === "string" ? req.body.details : "";
    const result = await answer(`Допоможи сформувати соціальне звернення українською. Категорія: ${req.body?.category || "Загальна"}. Опис: ${details}`);
    res.json({ analysis: result.text, provider: result.provider, model: result.model, fallbackUsed: result.fallbackUsed });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.use((_req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  app.listen(PORT, "0.0.0.0", () => console.log(`Mashunya server running on ${PORT}; Gemini=${Boolean(process.env.GEMINI_API_KEY)} model=${GEMINI_MODEL} googleSearchGrounding=true`));
}

startServer();