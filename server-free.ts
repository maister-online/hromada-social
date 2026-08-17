import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const PORT = Number(process.env.PORT || 3000);
// Gemini 2.5 Flash-Lite is no longer available to new users.
// Use the current stable, cost-efficient Gemini 3.1 Flash-Lite model.
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models";
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
  return "AI-помічник тимчасово недоступний. Спробуй ще раз трохи пізніше або скористайся звичайним пошуком.";
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
    ? history
        .filter((m: any) => m && typeof m.text === "string")
        .slice(-8)
        .map((m: any) => ({
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

function openAIStyleToGemini(messages: any[]) {
  const system = messages.find((m: any) => m.role === "system")?.content || SYSTEM_PROMPT;
  const rest = messages.filter((m: any) => m.role !== "system");

  return {
    systemInstruction: { parts: [{ text: system }] },
    contents: rest.map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: String(m.content || "") }]
    }))
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

async function geminiChat(message: string, history: any[] = [], maxTokens = 600) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw Object.assign(new Error("GEMINI_API_KEY is not set"), {
      status: 503,
      provider: "gemini"
    });
  }

  const body = openAIStyleToGemini(buildMessages(message, history));
  const response = await fetchWithTimeout(
    `${GEMINI_URL}/${encodeURIComponent(GEMINI_MODEL)}:generateContent?key=${encodeURIComponent(key)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...body,
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: maxTokens
        }
      })
    }
  );

  const raw = await response.text();
  let data: any;
  try {
    data = JSON.parse(raw);
  } catch {
    data = { error: { message: raw } };
  }

  if (!response.ok) {
    const error: any = new Error(
      data?.error?.message || `gemini HTTP ${response.status}`
    );
    error.status = response.status;
    error.provider = "gemini";
    error.providerError = data?.error || null;
    throw error;
  }

  const text = String(
    data?.candidates?.[0]?.content?.parts
      ?.map((p: any) => p?.text || "")
      .join("") || ""
  ).trim();

  if (!text) {
    throw Object.assign(new Error("gemini returned an empty response"), {
      status: 502,
      provider: "gemini"
    });
  }

  return text;
}

async function ordinarySearch(query: string) {
  try {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query.slice(0, 300))}`;
    const response = await fetchWithTimeout(url, {
      headers: { "User-Agent": "Mozilla/5.0 HromadaSocial/1.0" }
    });

    if (!response.ok) throw new Error(`search HTTP ${response.status}`);

    const html = await response.text();
    const results: { title: string; url: string; snippet?: string }[] = [];
    const re = /<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
    let match: RegExpExecArray | null;

    while ((match = re.exec(html)) && results.length < 5) {
      const cleanTitle = match[2]
        .replace(/<[^>]*>/g, "")
        .replace(/&amp;/g, "&")
        .trim();

      let resultUrl = match[1];
      try {
        resultUrl = decodeURIComponent(resultUrl);
      } catch {}

      if (cleanTitle && resultUrl) {
        results.push({ title: cleanTitle, url: resultUrl });
      }
    }

    return results;
  } catch (error) {
    console.warn("Ordinary search failed:", errorDetails(error));
    return [];
  }
}

async function answer(message: string, history: any[] = []) {
  try {
    const text = await geminiChat(message, history);
    console.log(`Mashunya AI success provider=gemini model=${GEMINI_MODEL}`);

    return {
      text,
      provider: "gemini",
      model: GEMINI_MODEL,
      fallbackUsed: false,
      usedSearch: false,
      searchQueries: [],
      sources: [],
      attempts: []
    };
  } catch (error: any) {
    const details = errorDetails(error);
    console.warn(
      `Mashunya AI error provider=gemini model=${GEMINI_MODEL}:`,
      JSON.stringify(details)
    );

    const sources = await ordinarySearch(message);
    if (sources.length) {
      const sourceText = sources
        .map((s, i) => `${i + 1}. ${s.title} — ${s.url}`)
        .join("\n");

      return {
        text: `Gemini зараз недоступний. Ось результати звичайного пошуку за запитом «${message}»:\n\n${sourceText}`,
        provider: "search",
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

  app.get("/api/health", (_req, res) =>
    res.json({
      ok: true,
      mode: "gemini-only",
      gemini: {
        enabled: Boolean(process.env.GEMINI_API_KEY),
        model: GEMINI_MODEL
      },
      searchFallback: true,
      time: new Date().toISOString()
    })
  );

  app.post("/api/network/ping", (_req, res) =>
    res.json({
      ok: true,
      status: "ONLINE",
      timestamp: new Date().toISOString()
    });
  });

  app.post("/api/network/analyze-error", async (req, res) => {
    const errorText = typeof req.body?.errorText === "string" ? req.body.errorText : "";
    if (!errorText) {
      return res.status(400).json({
        ok: false,
        error: "Текст помилки обов'язковий"
      });
    }

    const result = await answer(
      `Проаналізуй цю технічну помилку українською та дай короткі кроки виправлення:\n${errorText}`
    );

    res.json({
      ok: true,
      analysis: result.text,
      provider: result.provider,
      fallbackUsed: result.fallbackUsed,
      timestamp: new Date().toISOString()
    });
  });

  app.get("/api/test-ai", async (_req, res) => {
    const result = await answer(
      "Відповідай одним коротким реченням: Привіт від Машуні!",
      []
    );

    res.status(result.provider === "fallback" ? 502 : 200).json({
      ok: result.provider === "gemini" || result.provider === "search",
      answer: result.text,
      provider: result.provider,
      model: result.model,
      fallbackUsed: result.fallbackUsed,
      attempts: result.attempts
    });
  });

  const chatHandler = async (req: express.Request, res: express.Response) => {
    const message = req.body?.message;
    if (!message || typeof message !== "string") {
      return res.status(400).json({
        ok: false,
        error: "Не передано повідомлення."
      });
    }

    const history = Array.isArray(req.body?.conversationHistory)
      ? req.body.conversationHistory
      : Array.isArray(req.body?.history)
        ? req.body.history
        : [];

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
      timestamp: new Date().toLocaleTimeString("uk-UA", {
        hour: "2-digit",
        minute: "2-digit"
      })
    });
  };

  app.post("/api/chat", chatHandler);
  app.post("/api/mashunya", chatHandler);

  app.post("/api/social-request", async (req, res) => {
    const details = typeof req.body?.details === "string" ? req.body.details : "";
    const result = await answer(
      `Допоможи сформувати соціальне звернення українською. Категорія: ${req.body?.category || "Загальна"}. Опис: ${details}`
    );

    res.json({
      analysis: result.text,
      provider: result.provider,
      model: result.model,
      fallbackUsed: result.fallbackUsed
    });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) =>
      res.sendFile(path.join(distPath, "index.html"))
    );
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(
      `Mashunya server running on ${PORT}; Gemini=${Boolean(process.env.GEMINI_API_KEY)} model=${GEMINI_MODEL}`
    );
  });
}

startServer();
