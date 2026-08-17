import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";

const PORT = Number(process.env.PORT || 3000);
// Prefer current models and automatically try another available model if one is
// unavailable for this project or temporarily rate-limited.
const GEMINI_MODELS = ["gemini-3.6-flash", "gemini-3.7-flash", "gemini-3.5-flash-lite"];
const GEMINI_MODEL = GEMINI_MODELS[0];
const REQUEST_TIMEOUT_MS = Number(process.env.AI_TIMEOUT_MS || 45000);
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";

const SYSTEM_PROMPT = `
Ти Машуня — дружня AI-помічниця Рокитнівської громади.
Відповідай живою сучасною українською мовою, коротко й по суті.

Правила:
- Не вигадуй факти, дати, новини, людей або посилання.
- Якщо запит стосується конкретної людини, прізвища, біографії, новин, сьогоднішніх подій, актуальної інформації, документів, рішень, тендерів або користувач просить знайти/перевірити інформацію — використовуй вебпошук.
- Для людини не припускай зв'язок із Рокитнівською громадою. Спочатку перевір веб.
- Після вебпошуку узагальнюй знайдені джерела, а не вигадуй відповідь.
- Якщо надійних даних немає — прямо скажи про це.
`;

function isSearchRequest(message: string): boolean {
  const q = message.toLowerCase();
  return ["знайди","пошукай","гугл","в інтернеті","інтернет","мережі","в мережі","хто такий","хто така","хто це","інформація про","що відомо про","знайти інформацію","перевір","перевірити","новин","сьогодні","зараз","актуаль","останні","прізвище","фамілі","біограф","людина","особа","публікац","згадки","документ","рішення","тендер","закупів","постанова","хто голова","голова громади"].some(x => q.includes(x));
}

function isSimpleGreeting(message: string): boolean {
  return /^(привіт|вітаю|добрий ранок|добрий день|добрий вечір|хай|hello|hi)[!.? ]*$/iu.test(message.trim());
}

function withTimeout<T>(promise: Promise<T>): Promise<T> {
  return Promise.race([promise, new Promise<T>((_, reject) => setTimeout(() => reject(Object.assign(new Error("Gemini request timeout"), { status: 504 })), REQUEST_TIMEOUT_MS))]);
}

function buildContents(message: string, history: any[] = []) {
  const contents: any[] = [];
  if (Array.isArray(history)) for (const m of history.slice(-8)) {
    if (!m || typeof m.text !== "string" || !m.text.trim()) continue;
    contents.push({ role: m.sender === "user" || m.role === "user" ? "user" : "model", parts: [{ text: m.text.slice(0, 2000) }] });
  }
  contents.push({ role: "user", parts: [{ text: message.slice(0, 5000) }] });
  return contents;
}

function extractGrounding(response: any) {
  const candidate = response?.candidates?.[0];
  const text = String(response?.text || "").trim();
  const metadata = candidate?.groundingMetadata || {};
  const sources: { title: string; url: string }[] = [];
  for (const chunk of Array.isArray(metadata.groundingChunks) ? metadata.groundingChunks : []) {
    const web = chunk?.web;
    if (web?.uri) sources.push({ title: web.title || web.uri, url: web.uri });
  }
  const searchQueries = Array.isArray(metadata.webSearchQueries) ? metadata.webSearchQueries.filter((q: any) => typeof q === "string") : [];
  return { text, sources: Array.from(new Map(sources.map(s => [s.url, s])).values()), searchQueries: Array.from(new Set(searchQueries)), usedSearch: searchQueries.length > 0 || sources.length > 0 };
}

function errorDetails(error: any) {
  return { status: error?.status || error?.code || null, message: String(error?.message || error).slice(0, 4000), name: error?.name || null };
}

async function geminiChat(message: string, history: any[] = [], forceSearch = false) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw Object.assign(new Error("GEMINI_API_KEY is not set"), { status: 503 });
  const searchRequired = forceSearch || isSearchRequest(message);
  const ai = new GoogleGenAI({ apiKey: key });
  const searchInstruction = searchRequired
    ? "\n\nЦей запит потребує актуальної інформації. Використай Google Search. Якщо йдеться про людину або прізвище, шукай точне ім'я/прізвище та перевір вебджерела. Не вигадуй зв'язок із Рокитнівською громадою."
    : "";
  const errors: any[] = [];

  for (const model of GEMINI_MODELS) {
    try {
      const response = await withTimeout(ai.models.generateContent({
        model,
        contents: buildContents(message, history),
        config: {
          systemInstruction: SYSTEM_PROMPT + searchInstruction,
          ...(searchRequired ? { tools: [{ googleSearch: {} }] } : {}),
          maxOutputTokens: 900
        }
      }));
      const result = extractGrounding(response);
      if (!result.text) throw Object.assign(new Error("Gemini returned an empty response"), { status: 502 });
      return { ...result, searchRequired, model, attempts: errors };
    } catch (error: any) {
      const details = errorDetails(error);
      errors.push({ provider: "gemini", model, error: details });
      console.error("MASHUNYA_GEMINI_ATTEMPT", JSON.stringify({ model, ...details }));
      // A model-specific 404/429 should not kill the whole assistant. Try the
      // next current model available to the same API project.
      continue;
    }
  }
  const last = errors[errors.length - 1]?.error || { status: 502, message: "All Gemini models failed" };
  throw Object.assign(new Error(last.message || "All Gemini models failed"), { status: last.status || 502, attempts: errors });
}

async function ordinarySearch(query: string) {
  try {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query.slice(0, 300))}`;
    const response = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 HromadaSocial/1.0" } });
    if (!response.ok) return [];
    const html = await response.text();
    const results: { title: string; url: string }[] = [];
    const re = /<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
    let match: RegExpExecArray | null;
    while ((match = re.exec(html)) && results.length < 5) {
      const title = match[2].replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").trim();
      if (title && match[1]) results.push({ title, url: match[1] });
    }
    return results;
  } catch {
    return [];
  }
}

async function answer(message: string, history: any[] = [], forceSearch = false) {
  try {
    const result = await geminiChat(message, history, forceSearch);
    return { text: result.text, provider: "gemini", model: result.model, fallbackUsed: false, usedSearch: result.usedSearch, searchQueries: result.searchQueries, sources: result.sources, attempts: result.attempts };
  } catch (error: any) {
    const details = errorDetails(error);
    console.error("MASHUNYA_GEMINI_ERROR", JSON.stringify(details));
    const sources = await ordinarySearch(message);
    if (sources.length) {
      const sourceText = sources.map((s, i) => `${i + 1}. ${s.title} — ${s.url}`).join("\n");
      return {
        text: `Ось знайдені результати вебпошуку за вашим запитом:\n\n${sourceText}`,
        provider: "web-search-fallback",
        model: "duckduckgo-html",
        fallbackUsed: true,
        usedSearch: true,
        searchQueries: [message],
        sources,
        attempts: error?.attempts || [{ provider: "gemini", model: GEMINI_MODEL, error: details }]
      };
    }
    if (isSimpleGreeting(message)) return { text: "Привіт! Я Машуня 😉 Що будемо сьогодні шукати?", provider: "fallback", model: "none", fallbackUsed: true, usedSearch: false, searchQueries: [], sources: [], attempts: error?.attempts || [{ provider: "gemini", model: GEMINI_MODEL, error: details }] };
    return { text: "Не вдалося отримати актуальну відповідь. Спробуйте ще раз через кілька секунд.", provider: "fallback", model: "none", fallbackUsed: true, usedSearch: false, searchQueries: [], sources: [], attempts: error?.attempts || [{ provider: "gemini", model: GEMINI_MODEL, error: details }] };
  }
}

async function testModelSearch(model: string, key: string, query: string) {
  const ai = new GoogleGenAI({ apiKey: key });
  const started = Date.now();
  try {
    const response = await withTimeout(ai.models.generateContent({
      model,
      contents: [{ role: "user", parts: [{ text: `Знайди актуальну інформацію за запитом: ${query}. Дай коротку відповідь і використай вебпошук.` }] }],
      config: { tools: [{ googleSearch: {} }], maxOutputTokens: 300 }
    }));
    const result = extractGrounding(response);
    return { model, ok: true, status: 200, elapsedMs: Date.now() - started, answer: result.text.slice(0, 1500), usedSearch: result.usedSearch, searchQueries: result.searchQueries, sources: result.sources };
  } catch (error: any) {
    return { model, ok: false, status: error?.status || error?.code || null, elapsedMs: Date.now() - started, error: errorDetails(error) };
  }
}

function cleanSpeechText(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/https?:\/\/\S+/gi, " ")
    .replace(/www\.\S+/gi, " ")
    .replace(/[\*_`#>\[\]{}()<>|~^=+_]/g, " ")
    .replace(/\s[-–—]\s/g, ". ")
    .replace(/[!?;:]+/g, ". ")
    .replace(/\.{2,}/g, ". ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 5000);
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_req, res) => res.json({ ok: true, mode: "google-genai-sdk", gemini: { enabled: Boolean(process.env.GEMINI_API_KEY), model: GEMINI_MODEL, models: GEMINI_MODELS }, googleSearchGrounding: true, ordinarySearchFallback: true, elevenLabsTTS: Boolean(process.env.ELEVENLABS_API_KEY), time: new Date().toISOString() }));

  app.get("/api/gemini-models", async (_req, res) => {
    try {
      const key = process.env.GEMINI_API_KEY;
      if (!key) return res.status(503).json({ ok: false, error: "GEMINI_API_KEY is not set" });
      const ai = new GoogleGenAI({ apiKey: key });
      const models: any[] = [];
      for await (const model of await ai.models.list({ config: { pageSize: 100 } })) {
        const supported = Array.isArray((model as any).supportedActions) ? (model as any).supportedActions : Array.isArray((model as any).supportedGenerationMethods) ? (model as any).supportedGenerationMethods : [];
        if (supported.includes("generateContent") || supported.length === 0) models.push({ name: (model as any).name || null, baseModelId: (model as any).baseModelId || null, displayName: (model as any).displayName || null, version: (model as any).version || null, supportedActions: supported });
      }
      models.sort((a, b) => String(a.name).localeCompare(String(b.name)));
      res.json({ ok: true, currentModel: GEMINI_MODEL, fallbackModels: GEMINI_MODELS, count: models.length, models, timestamp: new Date().toISOString() });
    } catch (error: any) {
      const details = errorDetails(error);
      res.status(500).json({ ok: false, error: details, currentModel: GEMINI_MODEL, fallbackModels: GEMINI_MODELS });
    }
  });

  app.get("/api/test-google-search-models", async (req, res) => {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return res.status(503).json({ ok: false, error: "GEMINI_API_KEY is not set" });
    const query = typeof req.query.q === "string" && req.query.q.trim() ? req.query.q.trim() : "Хто є головою Рокитнівської селищної територіальної громади?";
    const candidates = GEMINI_MODELS;
    const results = [];
    for (const model of candidates) results.push(await testModelSearch(model, key, query));
    res.json({ ok: results.some(r => r.ok && r.usedSearch), query, results, timestamp: new Date().toISOString() });
  });

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
    const result = await answer(`Знайди актуальну інформацію та джерела за запитом: ${q}`, [], true);
    res.status(result.provider === "fallback" ? 502 : 200).json({ ok: result.provider !== "fallback", query: q, answer: result.text, provider: result.provider, model: result.model, usedSearch: result.usedSearch, searchQueries: result.searchQueries, sources: result.sources, fallbackUsed: result.fallbackUsed, attempts: result.attempts });
  });

  app.post("/api/tts", async (req, res) => {
    const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";
    const key = process.env.ELEVENLABS_API_KEY;
    if (!key) return res.status(503).json({ ok: false, error: "ELEVENLABS_API_KEY is not set" });
    if (!text) return res.status(400).json({ ok: false, error: "Текст для озвучення порожній" });
    const cleanText = cleanSpeechText(text);
    if (!cleanText) return res.status(400).json({ ok: false, error: "Немає тексту для озвучення" });
    try {
      const elevenResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(ELEVENLABS_VOICE_ID)}?output_format=mp3_44100_128`, {
        method: "POST",
        headers: { "xi-api-key": key, "Content-Type": "application/json", "Accept": "audio/mpeg" },
        body: JSON.stringify({ text: cleanText, model_id: "eleven_multilingual_v2", voice_settings: { stability: 0.45, similarity_boost: 0.8, style: 0.35, use_speaker_boost: true } })
      });
      if (!elevenResponse.ok) return res.status(elevenResponse.status).json({ ok: false, error: "ElevenLabs TTS error", status: elevenResponse.status });
      const audio = Buffer.from(await elevenResponse.arrayBuffer());
      res.set({ "Content-Type": "audio/mpeg", "Cache-Control": "private, max-age=3600", "Content-Length": String(audio.length) });
      return res.send(audio);
    } catch (error: any) {
      console.error("ELEVENLABS_TTS_EXCEPTION", error?.message || error);
      return res.status(502).json({ ok: false, error: "Не вдалося отримати аудіо від ElevenLabs" });
    }
  });

  const chatHandler = async (req: express.Request, res: express.Response) => {
    const message = req.body?.message;
    if (!message || typeof message !== "string") return res.status(400).json({ ok: false, error: "Не передано повідомлення." });
    const history = Array.isArray(req.body?.conversationHistory) ? req.body.conversationHistory : Array.isArray(req.body?.history) ? req.body.history : [];
    const result = await answer(message, history);
    res.json({ ok: true, answer: result.text, reply: result.text, sources: result.sources, webSources: result.sources, usedSearch: result.usedSearch, searchQueries: result.searchQueries, provider: result.provider, model: result.model, fallbackUsed: result.fallbackUsed, attempts: result.attempts, timestamp: new Date().toISOString() });
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
  app.listen(PORT, "0.0.0.0", () => console.log(`Hromada Social server listening on 0.0.0.0:${PORT}; Gemini=${GEMINI_MODEL}; Google Search enabled; ElevenLabs TTS=${Boolean(process.env.ELEVENLABS_API_KEY)}`));
}

startServer().catch((error) => {
  console.error("Server startup failed:", error);
  process.exit(1);
});
