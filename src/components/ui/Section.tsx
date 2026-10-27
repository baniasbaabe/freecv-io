import type { ReactNode } from "react";

export function Section({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="heading">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

export const Intro = ({ title, children }: { title: string; children: ReactNode }) => (
  <div>
    <h3 className="heading">{title}</h3>
    <p className="mt-0.5 text-sm text-zinc-500">{children}</p>
  </div>
);
