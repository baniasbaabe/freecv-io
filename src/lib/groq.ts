import { invoke } from "@tauri-apps/api/core";
import { fetch as tauriFetch } from "@tauri-apps/plugin-http";
import type { Settings } from "./data";
import { parseLooseJson } from "./json";

const inTauri = () => "__TAURI_INTERNALS__" in window;
// Inside Tauri the request goes through Rust (no CORS); in a plain browser (vite dev) use window.fetch.
const doFetch: typeof fetch = inTauri() ? tauriFetch : window.fetch.bind(window);
const BASE = "https://api.groq.com/openai/v1";

// Keeps Groq's error code and, for JSON-mode rejections, the raw reply it refused.
class GroqError extends Error {
  constructor(message: string, readonly code?: string, readonly failedGeneration?: string) {
    super(message);
  }
}

async function call(settings: Settings, path: string, init: RequestInit = {}) {
  if (!settings.apiKey) throw new Error("Add your free Groq API key in Settings first.");
  const res = await doFetch(BASE + path, {
    ...init,
    headers: { Authorization: `Bearer ${settings.apiKey}`, "Content-Type": "application/json" },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new GroqError(data?.error?.message ?? `Groq request failed (${res.status})`, data?.error?.code, data?.error?.failed_generation);
  return data;
}

export async function listModels(settings: Settings): Promise<string[]> {
  const data = await call(settings, "/models");
  return (data.data as { id: string; active?: boolean }[])
    .filter((m) => m.active !== false && !/whisper|tts|guard/i.test(m.id))
    .map((m) => m.id)
    .sort();
}

export async function chat(settings: Settings, system: string, user: string, json = false): Promise<string> {
  const data = await call(settings, "/chat/completions", {
    method: "POST",
    body: JSON.stringify({
      model: settings.model,
      temperature: json ? 0.2 : 0.6,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      ...(json && { response_format: { type: "json_object" } }),
    }),
  });
  return data.choices[0].message.content as string;
}

// JSON mode fails ("json_validate_failed") when the model wraps its answer in fences, <think> reasoning or chatter.
// Salvage the JSON from the rejected reply, otherwise retry once before giving up.
export async function chatJson<T>(settings: Settings, system: string, user: string): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      const reply = await chat(settings, system, user, true);
      const parsed = parseLooseJson<T>(reply);
      if (parsed) return parsed;
      throw new GroqError("The model's reply wasn't valid JSON.", "json_validate_failed", reply);
    } catch (e) {
      if (!(e instanceof GroqError) || e.code !== "json_validate_failed") throw e;
      const salvaged = parseLooseJson<T>(e.failedGeneration);
      if (salvaged) return salvaged;
      if (attempt >= 2) throw new Error(`The AI returned an unreadable answer twice. Try again, or pick another model in Settings (current: ${settings.model}).`);
    }
  }
}

export type Job = { title: string; company: string; description: string };

// Loads a job page with Scrapling's stealth browser (Rust side), then lets the LLM cut the posting out of the page noise.
export async function fetchJob(settings: Settings, url: string): Promise<Job> {
  if (!inTauri()) throw new Error("Importing from a link needs the desktop app, which runs Scrapling locally. Paste the text instead.");
  const page = await invoke<string>("fetch_page", { url, bin: settings.scraplingPath || null });
  // shortcut: only the first 15k chars go to the LLM to stay inside Groq free-tier token limits; postings sit near the top of job pages.
  const job = await chatJson<Job & { found?: boolean }>(
    settings,
    `Extract the job posting from this web page (Markdown). Reply with JSON only: {"found": boolean, "title": string, "company": string, "description": string}.
"description" is the complete posting as clean plain text with line breaks: about the role, responsibilities, requirements, nice-to-haves, location and salary if present. Leave out navigation, cookie banners, similar jobs and application forms. Do not summarize or invent anything.`,
    page.slice(0, 15000),
  );
  if (!job.found || !job.description?.trim()) throw new Error("No job posting found on that page. Some sites need a login; paste the text instead.");
  return job;
}
