import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const PORT = Number(process.env.PORT || 3000);
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const REQUEST_TIMEOUT_MS = Number(process.env.AI_TIMEOUT_MS || 30000);

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
    provider: error?.provider || null
  };
}

function buildContents(message: string, history: any[] = []) {
  const safeHistory = Array.isArray(history)
    ? history
        .filter((m: any) => m && typeof m.text === "string")
        .slice(-8)
        .map((m: any) => ({
          role: m.sender === "user" || m.role === "user" ? "user" : "model",
          parts: [{ text: m.text.slice(0, 2000) }]
        }))
    : [];

  return [...safeHistory, { role: "user", parts: [{ text: message.slice(0, 4000) }] }];
}

async function fetchWithTimeout(url: string, options: RequestInit) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function geminiChat(message: string, history: any[] = [], maxTokens = 800) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw Object.assign(new Error("GEMINI_API_KEY is not set"), { status: 503, provider: "gemini" });

  const searchRequired = isSearchRequest(message);
  const searchInstruction = searchRequired
    ? `\n\nЦЕ ОБОВ'ЯЗКОВИЙ ВЕБ-ПОШУК. Запит користувача: «${message}». Використай Google Search перед відповіддю. Особливо якщо це запит про конкретну людину або прізвище: шукай точне ім'я/прізвище, перевіряй кілька результатів і не вигадуй зв'язок із Рокитнівською громадою. У відповіді вкажи, що інформацію перевірено в Інтернеті, якщо пошук був виконаний.`
    : "";

  const response = await fetchWithTimeout(
    `${GEMINI_URL}/${encodeURIComponent(GEMINI_MODEL)}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": key
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT + searchInstruction }] },
        contents: buildContents(message, history),
        tools: searchRequired ? [{ google_search: {} }] : undefined,
        generationConfig: { temperature: 0.25, maxOutputTokens: maxTokens }
      })
    }
  );

  const raw = await response.text();
  let data: any;
  try { data = JSON.parse(raw); } catch { data = { error: { message: raw } }; }

  if (!response.ok) {
    const error: any = new Error(data?.error?.message || `gemini HTTP ${response.status}`);
    error.status = response.status;
    error.provider = "gemini";
    error.providerError = data?.error || null;
    throw error;
  }

  const text = String(data?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text || "").join("") || "").trim();
  if (!text) throw Object.assign(new Error("gemini returned an empty response"), { status: 502, provider: "gemini" });

  const metadata = data?.candidates?.[0]?.groundingMetadata || {};
  const chunks = Array.isArray(metadata.groundingChunks) ? metadata.groundingChunks : [];
  const sources = chunks
    .map((chunk: any) => ({
      title: chunk?.web?.title || chunk?.web?.uri || "Джерело",
      url: chunk?.web?.uri || ""
    }))
    .filter((s: any) => s.url);

  const searchQueries = Array.isArray(metadata.webSearchQueries) ? metadata.webSearchQueries : [];
  const usedSearch = searchQueries.length > 0 || sources.length > 0;

  return { text, sources, searchQueries, usedSearch, searchRequired };
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
    const result = await geminiChat(message, history);
    console.log(`Mashunya AI success model=${GEMINI_MODEL} searchRequired=${result.searchRequired} usedSearch=${result.usedSearch} queries=${JSON.stringify(result.searchQueries)}`);

    if (result.searchRequired && !result.usedSearch) {
      console.warn("Search was required but Gemini returned no grounding metadata");
    }

    return {
      text: result.text,
      provider: "gemini",
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
        text: `Google Search через Gemini зараз недоступний. Нижче — звичайні результати вебпошуку, без вигаданого аналізу:\n\n${sourceText}`,
        provider: "search-fallback",
        model: "duckduckgo-html",
        fallbackUsed: true,
        usedSearch: true,
        searchQueries: [message],
        sources,
        attempts: [{ provider: "gemini", model: GEMINI_MODEL, error: details }]
      };
    }

    return {
      text: fallback(message),
      provider: "fallback",
      model: "none",
      fallbackUsed: true,
      usedSearch: false,
      searchQueries: [],
      sources: [],
      attempts: [{ provider: "gemini", model: GEMINI_MODEL, error: details }]
    };
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({
      ok: true,
      mode: "gemini-google-search-grounding",
      gemini: { enabled: Boolean(process.env.GEMINI_API_KEY), model: GEMINI_MODEL },
      googleSearchGrounding: true,
      ordinarySearchFallback: true,
      time: new Date().toISOString()
    });
  });

  app.post("/api/network/ping", (_req, res) => {
    res.json({ ok: true, status: "ONLINE", timestamp: new Date().toISOString() });
  });

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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Mashunya server running on ${PORT}; Gemini=${Boolean(process.env.GEMINI_API_KEY)} model=${GEMINI_MODEL} googleSearchGrounding=true`);
  });
}

startServer();
