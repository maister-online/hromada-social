import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

const MODEL = "gemini-2.5-flash-lite";
const PORT = Number(process.env.PORT || 3000);

const SYSTEM_PROMPT = `
Ти Машуня — дружня AI-помічниця Рокитнівської громади.
Відповідай живою сучасною українською мовою, коротко й по суті.
Допомагай із питаннями про громаду, документи, послуги, Marketplace, звернення та загальними питаннями.
Не вигадуй факти, дати, новини або посилання.
Якщо запит стосується сьогоднішніх/актуальних даних, використовуй Google Search, якщо він увімкнений для цього запиту.
Якщо актуальні дані не вдалося підтвердити — прямо скажи про це.
`;

function isLiveSearchRequest(message: string): boolean {
  const text = message.toLowerCase();
  const terms = [
    "сьогодні", "зараз", "останн", "новин", "поді", "погода", "температур",
    "дощ", "вітер", "курс", "актуальн", "свіж", "рішення ради", "виконком",
    "оголошенн", "ваканс", "тендер", "закупів", "відключ", "тривог",
    "аварі", "розклад", "графік", "пряме посилання", "що нового"
  ];
  return terms.some(term => text.includes(term));
}

function isSimpleGreeting(message: string): boolean {
  return /^(привіт|вітаю|добрий ранок|добрий день|добрий вечір|хай|hello|hi)[!.? ]*$/iu.test(message.trim());
}

const requestWindows = new Map<string, { started: number; ai: number; search: number }>();
function allowRequest(ip: string, liveSearch: boolean): boolean {
  const now = Date.now();
  const hour = 60 * 60 * 1000;
  let state = requestWindows.get(ip);
  if (!state || now - state.started >= hour) {
    state = { started: now, ai: 0, search: 0 };
    requestWindows.set(ip, state);
  }
  if (state.ai >= 30) return false;
  if (liveSearch && state.search >= 10) return false;
  state.ai += 1;
  if (liveSearch) state.search += 1;
  return true;
}

let client: GoogleGenAI | null = null;
function getClient(): GoogleGenAI {
  if (!client) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error("GEMINI_API_KEY environment variable is not set");
    client = new GoogleGenAI({ apiKey: key });
  }
  return client;
}

function fallback(message: string): string {
  if (isSimpleGreeting(message)) return "Привіт! Я Машуня 😉 Що будемо сьогодні шукати?";
  return "Я зараз працюю в максимально економному режимі. Для цього запиту не вдалося отримати відповідь від Gemini. Спробуй ще раз трохи пізніше.";
}

async function answer(message: string, history: any[] = []) {
  const liveSearch = isLiveSearchRequest(message);
  const ip = "server";
  if (!allowRequest(ip, liveSearch)) {
    return { text: "Безкоштовний ліміт Машуні на цей момент вичерпано. Спробуй трохи пізніше.", sources: [], usedSearch: false, searchQueries: [] };
  }

  try {
    const ai = getClient();
    const safeHistory = Array.isArray(history)
      ? history.filter((m: any) => m && typeof m.text === "string").slice(-8).map((m: any) => ({
          role: m.sender === "user" || m.role === "user" ? "user" : "model",
          parts: [{ text: m.text.slice(0, 2000) }]
        }))
      : [];

    const contents: any[] = [...safeHistory, { role: "user", parts: [{ text: message.slice(0, 4000) }] }];
    const config: any = {
      systemInstruction: SYSTEM_PROMPT,
      maxOutputTokens: 600
    };

    if (liveSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    const response = await ai.models.generateContent({ model: MODEL, contents, config });
    const text = response.text || "";
    const metadata = response.candidates?.[0]?.groundingMetadata;
    const chunks = metadata?.groundingChunks || [];
    const sources = chunks.map((chunk: any) => ({
      title: chunk.web?.title || "Джерело з мережі",
      url: chunk.web?.uri || ""
    })).filter((s: any) => s.url);
    const searchQueries = metadata?.webSearchQueries || [];

    if (liveSearch && sources.length === 0 && searchQueries.length === 0) {
      return { text: "Я не знайшла підтвердженої актуальної інформації через Google Search. Не хочу вигадувати новини або факти.", sources: [], usedSearch: false, searchQueries: [] };
    }

    return { text: text || fallback(message), sources, usedSearch: sources.length > 0 || searchQueries.length > 0, searchQueries };
  } catch (error: any) {
    const messageText = String(error?.message || error);
    console.warn("Mashunya Gemini error:", messageText);
    return {
      text: liveSearch && /429|quota|resource_exhausted/i.test(messageText)
        ? "Безкоштовна квота Gemini зараз вичерпана. Я не буду вигадувати актуальні новини. Спробуй пізніше."
        : fallback(message),
      sources: [],
      usedSearch: false,
      searchQueries: []
    };
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, mode: "free", model: MODEL, gemini: Boolean(process.env.GEMINI_API_KEY), googleSearch: true, time: new Date().toISOString() });
  });

  app.post("/api/network/ping", (_req, res) => {
    res.json({ ok: true, status: "ONLINE", timestamp: new Date().toISOString() });
  });

  app.post("/api/network/analyze-error", async (req, res) => {
    const errorText = typeof req.body?.errorText === "string" ? req.body.errorText : "";
    if (!errorText) return res.status(400).json({ ok: false, error: "Текст помилки обов'язковий" });
    const result = await answer(`Проаналізуй цю технічну помилку українською та дай короткі кроки виправлення:\n${errorText}`);
    res.json({ ok: true, analysis: result.text, timestamp: new Date().toISOString() });
  });

  app.get("/api/test-gemini", async (_req, res) => {
    const result = await answer("Відповідай одним коротким реченням: Привіт від Машуні!");
    res.json({ ok: true, answer: result.text, model: MODEL });
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
      searchCategory: isLiveSearchRequest(message) ? "live" : "general",
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

  app.listen(PORT, "0.0.0.0", () => console.log(`Mashunya free server running on ${PORT} using ${MODEL}`));
}

startServer();
