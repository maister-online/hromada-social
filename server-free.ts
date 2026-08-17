import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const PORT = Number(process.env.PORT || 3000);
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const REQUEST_TIMEOUT_MS = Number(process.env.AI_TIMEOUT_MS || 45000);

const SYSTEM_PROMPT = `
Ти Машуня — дружня AI-помічниця Рокитнівської громади.
Відповідай живою сучасною українською мовою, коротко й по суті.

Правила:
- Не вигадуй факти, дати, новини, людей або посилання.
- Якщо запит стосується конкретної людини, прізвища, біографії, новин, сьогоднішніх подій, актуальної інформації, документів, рішень, тендерів або користувач просить знайти/перевірити інформацію — використовуй Google Search.
- Для людини не припускай зв'язок із Рокитнівською громадою. Спочатку перевір веб.
- Після вебпошуку узагальнюй знайдені джерела, а не просто вигадуй відповідь.
- Якщо надійних даних немає — прямо скажи про це.
- Не називай звичайний fallback-пошук Google Search через Gemini.
`;

function isSearchRequest(message: string): boolean {
  const q = message.toLowerCase();
  return [
    "знайди", "пошукай", "гугл", "в інтернеті", "інтернет", "мережі", "в мережі",
    "хто такий", "хто така", "інформація про", "що відомо про", "знайти інформацію",
    "перевір", "перевірити", "новин", "сьогодні", "зараз", "актуаль", "останні",
    "прізвище", "фамілі", "біограф", "людина", "особа", "публікац", "згадки",
    "документ", "рішення", "тендер", "закупів", "постанова", "хто голова"
  ].some(x => q.includes(x));
}

function isSimpleGreeting(message: string): boolean {
  return /^(привіт|вітаю|добрий ранок|добрий день|добрий вечір|хай|hello|hi)[!.? ]*$/iu.test(message.trim());
}

function errorDetails(error: any) {
  return {
    status: error?.status || null,
    code: error?.providerError?.code || error?.code || null,
    message: String(error?.message || error).slice(0, 4000),
    provider: error?.provider || "gemini",
    providerError: error?.providerError || null
  };
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

function buildContents(message: string, history: any[] = []) {
  const contents: any[] = [];
  if (Array.isArray(history)) {
    for (const m of history.slice(-8)) {
      if (!m || typeof m.text !== "string" || !m.text.trim()) continue;
      contents.push({
        role: m.sender === "user" || m.role === "user" ? "user" : "model",
        parts: [{ text: m.text.slice(0, 2000) }]
      });
    }
  }
  contents.push({ role: "user", parts: [{ text: message.slice(0, 5000) }] });
  return contents;
}

function extractGrounding(data: any) {
  const candidate = data?.candidates?.[0];
  const parts = Array.isArray(candidate?.content?.parts) ? candidate.content.parts : [];
  const text = parts.map((p: any) => String(p?.text || "")).join("").trim();
  const metadata = candidate?.groundingMetadata || {};

  const sources: { title: string; url: string }[] = [];
  for (const chunk of Array.isArray(metadata.groundingChunks) ? metadata.groundingChunks : []) {
    const web = chunk?.web;
    if (web?.uri) sources.push({ title: web.title || web.uri, url: web.uri });
  }

  const searchQueries = Array.isArray(metadata.webSearchQueries)
    ? metadata.webSearchQueries.filter((q: any) => typeof q === "string")
    : [];

  return {
    text,
    sources: Array.from(new Map(sources.map(s => [s.url, s])).values()),
    searchQueries: Array.from(new Set(searchQueries)),
    usedSearch: searchQueries.length > 0 || sources.length > 0
  };
}

async function geminiChat(message: string, history: any[] = [], maxTokens = 900) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw Object.assign(new Error("GEMINI_API_KEY is not set"), { status: 503, provider: "gemini" });

  const searchRequired = isSearchRequest(message);
  const searchInstruction = searchRequired
    ? `\n\nОБОВ'ЯЗКОВИЙ ВЕБ-ПОШУК: цей запит потребує актуальної інформації. Використай вбудований Google Search. Якщо йдеться про людину або прізвище, шукай точне ім'я/прізвище та перевір кілька джерел. Не вигадуй зв'язок із Рокитнівською громадою.`
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
        tools: searchRequired ? [{ google_search: {} }] : [],
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature: 0.2
        }
      })
    }
  );

  const raw = await response.text();
  let data: any;
  try { data = JSON.parse(raw); } catch { data = { error: { message: raw } }; }

  if (!response.ok) {
    const error: any = new Error(data?.error?.message || `Gemini HTTP ${response.status}`);
    error.status = response.status;
    error.provider = "gemini";
    error.providerError = data?.error || data;
    throw error;
  }

  const result = extractGrounding(data);
  if (!result.text) {
    const error: any = new Error("Gemini returned an empty response");
    error.status = 502;
    error.provider = "gemini";
    error.providerError = data;
    throw error;
  }

  return { ...result, searchRequired };
}

async function ordinarySearch(query: string) {
  try {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query.slice(0, 300))}`;
    const response = await fetchWithTimeout(url, {
      headers: { "User-Agent": "Mozilla/5.0 HromadaSocial/1.0" }
    });
    if (!response.ok) throw new Error(`DuckDuckGo HTTP ${response.status}`);
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
    console.log(JSON.stringify({
      event: "mashunya_ai_success",
      model: GEMINI_MODEL,
      searchRequired: result.searchRequired,
      usedSearch: result.usedSearch,
      searchQueries: result.searchQueries,
      sources: result.sources.length
    }));
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
    console.error("MASHUNYA_GEMINI_ERROR", JSON.stringify(details));

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
        attempts: [{ provider: "gemini", model: GEMINI_MODEL, error: details }]
      };
    }

    if (isSimpleGreeting(message)) {
      return {
        text: "Привіт! Я Машуня 😉 Що будемо сьогодні шукати?",
        provider: "fallback",
        model: "none",
        fallbackUsed: true,
        usedSearch: false,
        searchQueries: [],
        sources: [],
        attempts: [{ provider: "gemini", model: GEMINI_MODEL, error: details }]
      };
    }

    return {
      text: "Машуня тимчасово не отримала відповідь від AI. Спробуй повторити запит трохи пізніше.",
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
      mode: "gemini-generateContent-google-search",
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
    const q = typeof req.query.q === "string" && req.query.q.trim()
      ? req.query.q.trim()
      : "Хто є головою Рокитнівської селищної територіальної громади?";
    const result = await answer(`Знайди в Google актуальну інформацію та джерела за запитом: ${q}`);
    res.status(result.provider === "fallback" ? 502 : 200).json({
      ok: result.provider !== "fallback",
      query: q,
      answer: result.text,
      provider: result.provider,
      model: result.model,
      usedSearch: result.usedSearch,
      searchQueries: result.searchQueries,
      sources: result.sources,
      fallbackUsed: result.fallbackUsed,
      attempts: result.attempts
    });
  });

  const chatHandler = async (req: express.Request, res: express.Response) => {
    const message = req.body?.message;
    if (!message || typeof message !== "string") return res.status(400).json({ ok: false, error: "Не передано повідомлення." });
    const history = Array.isArray(req.body?.conversationHistory)
      ? req.body.conversationHistory
      : Array.isArray(req.body?.history) ? req.body.history : [];
    const result = await answer(message, history);
    res.json({
      ok: true,
      answer: result.text,
      reply: result.text,
      sources: result.sources,
      webSources: result.sources,
      usedSearch: result.usedSearch,
      searchQueries: result.searchQueries,
      quickActions: [],
      emotion: "smile",
      searchCategory: result.usedSearch ? "web" : "general",
      provider: result.provider,
      model: result.model,
      fallbackUsed: result.fallbackUsed,
      timestamp: new Date().toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" })
    });
  };

  app.post("/api/chat", chatHandler);
  app.post("/api/mashunya", chatHandler);

  app.post("/api/social-request", async (req, res) => {
    const details = typeof req.body?.details === "string" ? req.body.details : "";
    const result = await answer(`Допоможи сформувати соціальне звернення українською мовою. Деталі: ${details}`);
    res.json({ ok: true, response: result.text, answer: result.text, provider: result.provider });
  });

  const distPath = path.resolve(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*", (_req, res) => res.sendFile(path.join(distPath, "index.html")));

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Hromada Social server listening on 0.0.0.0:${PORT}`);
    console.log(`Gemini model: ${GEMINI_MODEL}`);
    console.log(`Google Search Grounding: enabled via generateContent`);
  });
}

startServer().catch(error => {
  console.error("Fatal server startup error:", error);
  process.exit(1);
});
