// Pulls a JSON object out of a model reply that may be wrapped in <think> reasoning, code fences or chatter.
export function parseLooseJson<T>(text: string | undefined): T | undefined {
  if (!text) return undefined;
  const cleaned = text.replace(/<think>[\s\S]*?<\/think>/g, "");
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end <= start) return undefined;
  try {
    return JSON.parse(cleaned.slice(start, end + 1)) as T;
  } catch {
    return undefined;
  }
}
