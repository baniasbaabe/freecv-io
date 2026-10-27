import NumberFlow from "@number-flow/react";
import { strength, type Resume } from "../../lib/data";

export function StrengthMeter({ r }: { r: Resume }) {
  const { score, next } = strength(r);
  const color = score >= 80 ? "bg-emerald-500" : score >= 50 ? "bg-amber-400" : "bg-red-400";
  return (
    <div className="px-5 pb-3">
      <div className="flex items-baseline justify-between text-xs">
        <span className="font-medium text-zinc-700">Resume strength</span>
        <span className="font-medium text-zinc-500"><NumberFlow value={score} suffix="%" /></span>
      </div>
      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-zinc-100">
        {/* scaleX (not width) so the fill animates on the compositor */}
        <div className={`h-full origin-left rounded-full transition-[scale,background-color] duration-300 ease-out-strong ${color}`} style={{ scale: `${score / 100} 1` }} />
      </div>
      <p className="mt-1.5 text-xs text-zinc-500">{next ? <>Next: {next}</> : "Everything recruiters look for is there."}</p>
    </div>
  );
}
