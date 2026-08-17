import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const PORT = Number(process.env.PORT || 3000);
const GROQ_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-20b";
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "openrouter/free";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const REQUEST_TIMEOUT_MS = Number(process.env.AI_TIMEOUT_MS || 15000);

const SYSTEM_PROMPT = `
Ти Машуня — дружня AI-помічниця Рокитнівської громади.
Відповідай живою сучасною українською мовою, коротко й по суті.
Допомагай із питаннями про громаду, документи, послуги, Marketplace, звернення та загальні питання.
Не вигадуй факти, дати, новини або посилання.
Якщо не знаєш актуальної інформації — чесно скажи про це.
`;

function isSimpleGreeting(message: string): boolean {
  return /^(привіт|вітаю|добрий ранок|добрий день|добрий вечір|хай|hello|hi)[!.? ]*$/iu.test(message.trim());
}

function fallback(message: string): string {
  if (isSimpleGreeting(message)) return "Привіт! Я Машуня 😉 Що будемо сьогодні шукати?";
  return "AI-помічник тимчасово недоступний. Спробуй ще раз трохи пізніше або скористайся пошуком сайту.";
}

function errorDetails(error: any) {
  return {
    code: Number(error?.status || error?.code) || null,
    status: error?.status || null,
    message: String(error?.message || error).slice(0, 2000),
    provider: error?.provider || null
  };
}

function buildMessages(message: string, history: any[] = []) {
  const safeHistory = Array.isArray(history)
    ? history.filter((m: any) => m && typeof m.text === "string").slice(-8).map((m: any) => ({
        role: m.sender === "user" || m.role === "user" ? "user" : "assistant",
        content: m.text.slice(0, 2000)
      }))
    : [];

  return [
    { role: "system", content: SYSTEM_PROMPT },
    ...safeHistory,
    { role: "user", content: message.slice(0, 4000) }
  ];
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

async function chatRequest(provider: string, url: string, apiKey: string, model: string, messages: any[], maxTokens = 600) {
  const response = await fetchWithTimeout(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...(provider === "openrouter" ? {
        "HTTP-Referer": process.env.SITE_URL || "https://hromada-social.onrender.com",
        "X-Title": process.env.SITE_NAME || "Hromada Social"
      } : {})
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: maxTokens,
      temperature: 0.4
    })
  });

  const raw = await response.text();
  let data: any;
  try { data = JSON.parse(raw); } catch { data = { error: { message: raw } }; }

  if (!response.ok) {
    const error: any = new Error(data?.error?.message || `${provider} HTTP ${response.status}`);
    error.status = response.status;
    error.provider = provider;
    error.providerError = data?.error || null;
    throw error;
  }

  const text = String(data?.choices?.[0]?.message?.content || "").trim();
  if (!text) {
    const error: any = new Error(`${provider} returned an empty response`);
    error.status = 502;
    error.provider = provider;
    throw error;
  }

  return text;
}

async function groqChat(message: string, history: any[] = [], maxTokens = 600) {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw Object.assign(new Error("GROQ_API_KEY is not set"), { status: 503, provider: "groq" });
  return chatRequest("groq", GROQ_URL, key, GROQ_MODEL, buildMessages(message, history), maxTokens);
}

async function openRouterChat(message: string, history: any[] = [], maxTokens = 600) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw Object.assign(new Error("OPENROUTER_API_KEY is not set"), { status: 503, provider: "openrouter" });
  return chatRequest("openrouter", OPENROUTER_URL, key, OPENROUTER_MODEL, buildMessages(message, history), maxTokens);
}

async function answer(message: string, history: any[] = []) {
  const attempts: any[] = [];

  const providers = [
    {
      name: "groq",
      model: GROQ_MODEL,
      enabled: Boolean(process.env.GROQ_API_KEY),
      call: () => groqChat(message, history)
    },
    {
      name: "openrouter",
      model: OPENROUTER_MODEL,
      enabled: Boolean(process.env.OPENROUTER_API_KEY),
      call: () => openRouterChat(message, history)
    }
  ];

  for (const provider of providers) {
    if (!provider.enabled) {
      attempts.push({ provider: provider.name, model: provider.model, skipped: true, reason: "API key not configured" });
      continue;
    }

    try {
      const text = await provider.call();
      const fallbackUsed = attempts.length > 0;
      console.log(`Mashunya AI success provider=${provider.name} model=${provider.model} fallback=${fallbackUsed}`);
      return {
        text,
        provider: provider.name,
        model: provider.model,
        fallbackUsed,
        usedSearch: false,
        searchQueries: [],
        sources: [],
        attempts
      };
    } catch (error: any) {
      const details = errorDetails(error);
      attempts.push({ provider: provider.name, model: provider.model, error: details });
      console.warn(`Mashunya AI error provider=${provider.name} model=${provider.model}:`, JSON.stringify(details));
    }
  }

  console.warn("Mashunya: all configured AI providers failed; using local fallback.");
  return {
    text: fallback(message),
    provider: "fallback",
    model: "none",
    fallbackUsed: true,
    usedSearch: false,
    searchQueries: [],
    sources: [],
    attempts
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_req, res) => res.json({
    ok: true,
    mode: "hybrid-free",
    providers: {
      groq: { enabled: Boolean(process.env.GROQ_API_KEY), model: GROQ_MODEL },
      openrouter: { enabled: Boolean(process.env.OPENROUTER_API_KEY), model: OPENROUTER_MODEL }
    },
    searchFallback: true,
    time: new Date().toISOString()
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
    const ok = result.provider !== "fallback";
    res.status(ok ? 200 : 502).json({
      ok,
      answer: result.text,
      provider: result.provider,
      model: result.model,
      fallbackUsed: result.fallbackUsed,
      attempts: result.attempts
    });
  });

  // Backward-compatible endpoint used by older frontend diagnostics.
  app.get("/api/test-groq", async (_req, res) => {
    try {
      const text = await groqChat("Відповідай одним коротким реченням: Привіт від Машуні!", [], 100);
      res.json({ ok: true, answer: text, provider: "groq", model: GROQ_MODEL });
    } catch (error: any) {
      res.status(502).json({
        ok: false,
        provider: "groq",
        model: GROQ_MODEL,
        groqKeyPresent: Boolean(process.env.GROQ_API_KEY),
        error: errorDetails(error)
      });
    }
  });

  const chatHandler = async (req: express.Request, res: express.Response) => {
    const message = req.body?.message;
    if (!message || typeof message !== "string") return res.status(400).json({ ok: false, error: "Не передано повідомлення." });
    const history = Array.isArray(req.body?.conversationHistory)
      ? req.body.conversationHistory
      : (Array.isArray(req.body?.history) ? req.body.history : []);

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
      searchCategory: "general",
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
    const result = await answer(`Допоможи сформувати соціальне звернення українською. Категорія: ${req.body?.category || "Загальна"}. Опис: ${details}`);
    res.json({ analysis: result.text, provider: result.provider, model: result.model, fallbackUsed: result.fallbackUsed });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Mashunya hybrid server running on ${PORT}; Groq=${Boolean(process.env.GROQ_API_KEY)} OpenRouter=${Boolean(process.env.OPENROUTER_API_KEY)}`);
  });
}

startServer();
