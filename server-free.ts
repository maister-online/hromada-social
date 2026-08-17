import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-20b";
const PORT = Number(process.env.PORT || 3000);
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

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

function getKey(): string {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY environment variable is not set");
  return key;
}

function fallback(message: string): string {
  if (isSimpleGreeting(message)) return "Привіт! Я Машуня 😉 Що будемо сьогодні шукати?";
  return "Машуня тимчасово не отримала відповідь від AI. Спробуй ще раз трохи пізніше.";
}

function errorDetails(error: any) {
  return {
    code: Number(error?.status || error?.code) || null,
    status: error?.status || null,
    message: String(error?.message || error).slice(0, 2000)
  };
}

async function groqChat(message: string, history: any[] = [], maxTokens = 600) {
  const safeHistory = Array.isArray(history)
    ? history.filter((m: any) => m && typeof m.text === "string").slice(-8).map((m: any) => ({
        role: m.sender === "user" || m.role === "user" ? "user" : "assistant",
        content: m.text.slice(0, 2000)
      }))
    : [];

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...safeHistory,
    { role: "user", content: message.slice(0, 4000) }
  ];

  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${getKey()}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      max_tokens: maxTokens,
      temperature: 0.4
    })
  });

  const raw = await response.text();
  let data: any;
  try { data = JSON.parse(raw); } catch { data = { error: { message: raw } }; }

  if (!response.ok) {
    const error: any = new Error(data?.error?.message || `Groq HTTP ${response.status}`);
    error.status = response.status;
    error.provider = data?.error;
    throw error;
  }

  return String(data?.choices?.[0]?.message?.content || "").trim();
}

async function answer(message: string, history: any[] = []) {
  try {
    const text = await groqChat(message, history);
    return { text: text || fallback(message), sources: [], usedSearch: false, searchQueries: [] };
  } catch (error: any) {
    const details = errorDetails(error);
    console.warn(`Mashunya Groq error model=${MODEL}:`, JSON.stringify({ ...details, provider: error?.provider || null }));
    return { text: fallback(message), sources: [], usedSearch: false, searchQueries: [], error: details };
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_req, res) => res.json({
    ok: true,
    mode: "free",
    provider: "groq",
    model: MODEL,
    groqKeyPresent: Boolean(process.env.GROQ_API_KEY),
    googleSearch: false,
    time: new Date().toISOString()
  }));

  app.post("/api/network/ping", (_req, res) => res.json({ ok: true, status: "ONLINE", timestamp: new Date().toISOString() }));

  app.post("/api/network/analyze-error", async (req, res) => {
    const errorText = typeof req.body?.errorText === "string" ? req.body.errorText : "";
    if (!errorText) return res.status(400).json({ ok: false, error: "Текст помилки обов'язковий" });
    const result = await answer(`Проаналізуй цю технічну помилку українською та дай короткі кроки виправлення:\n${errorText}`);
    res.json({ ok: true, analysis: result.text, timestamp: new Date().toISOString() });
  });

  app.get("/api/test-groq", async (_req, res) => {
    try {
      const text = await groqChat("Відповідай одним коротким реченням: Привіт від Машуні!", [], 100);
      res.json({ ok: true, answer: text, provider: "groq", model: MODEL });
    } catch (error: any) {
      res.status(502).json({
        ok: false,
        provider: "groq",
        model: MODEL,
        groqKeyPresent: Boolean(process.env.GROQ_API_KEY),
        error: errorDetails(error),
        providerError: error?.provider || null
      });
    }
  });

  const chatHandler = async (req: express.Request, res: express.Response) => {
    const message = req.body?.message;
    if (!message || typeof message !== "string") return res.status(400).json({ ok: false, error: "Не передано повідомлення." });
    const history = Array.isArray(req.body?.conversationHistory) ? req.body.conversationHistory : (Array.isArray(req.body?.history) ? req.body.history : []);
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
      provider: "groq",
      model: MODEL,
      timestamp: new Date().toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" })
    });
  };

  app.post("/api/chat", chatHandler);
  app.post("/api/mashunya", chatHandler);

  app.post("/api/social-request", async (req, res) => {
    const details = typeof req.body?.details === "string" ? req.body.details : "";
    const result = await answer(`Допоможи сформувати соціальне звернення українською. Категорія: ${req.body?.category || "Загальна"}. Опис: ${details}`);
    res.json({ analysis: result.text });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  app.listen(PORT, "0.0.0.0", () => console.log(`Mashunya server running on ${PORT} using Groq ${MODEL}`));
}

startServer();
