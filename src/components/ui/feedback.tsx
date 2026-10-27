import type { ReactNode } from "react";
import { IconSparkle } from "./icons";

export const Spinner = () => <span className="size-3.5 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden />;

export const ErrorBox = ({ msg }: { msg: string }) => (msg ? <div className="rounded-control border border-red-200 bg-red-50 p-3 text-sm text-red-700">{msg}</div> : null);

export function AiButton({ loading, disabled, onClick, children, busy }: { loading: boolean; disabled?: boolean; onClick: () => void; children: ReactNode; busy: string }) {
  return (
    <button className="btn-primary w-full py-2" disabled={loading || disabled} onClick={onClick}>
      {loading ? <><Spinner /> {busy}</> : <><IconSparkle size={14} /> {children}</>}
    </button>
  );
}
