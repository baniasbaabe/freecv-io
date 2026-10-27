import { useState } from "react";

// Runs one Groq call with loading/error state; result stays in memory only.
export function useAi<T>() {
  const [state, setState] = useState<{ loading: boolean; error: string; data?: T }>({ loading: false, error: "" });
  const run = async (fn: () => Promise<T>) => {
    setState((s) => ({ ...s, loading: true, error: "" }));
    try {
      setState({ loading: false, error: "", data: await fn() });
    } catch (e) {
      setState((s) => ({ ...s, loading: false, error: e instanceof Error ? e.message : String(e) }));
    }
  };
  return { ...state, run };
}
