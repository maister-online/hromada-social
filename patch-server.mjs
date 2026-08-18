import fs from "node:fs";

const file = "server-ai.ts";
let s = fs.readFileSync(file, "utf8");

const marker = 'const GEMINI_SEARCH_MODEL = "gemini-2.5-flash";';
if (!s.includes("GEMINI_SEARCH_MODEL")) {
  s = s.replace(
    'const GEMINI_MODEL = "gemini-3.6-flash";\n',
    'const GEMINI_MODEL = "gemini-3.6-flash";\n' + marker + "\n"
  );
} else {
  s = s.replace(/const GEMINI_SEARCH_MODEL\s*=\s*"[^"]+";/, marker);
}

// The patcher must itself remain valid JavaScript. Do not embed generated
// template literals containing ${...} in this file.
s = s.replace(
  'model: GEMINI_MODEL,\n      contents: buildContents(message, history),',
  'model: searchRequired ? GEMINI_SEARCH_MODEL : GEMINI_MODEL,\n      contents: buildContents(message, history),'
);

s = s.replace(
  'const searchRequired = forceSearch || isSearchRequest(message);',
  'const searchRequired = !message.startsWith("__MASHUNYA_SYNTHESIS__") && (forceSearch || isSearchRequest(message));'
);

fs.writeFileSync(file, s);
console.log("Mashunya server patch applied: Gemini normal=3.6, Google Search=2.5");
