import { Fragment, type ReactNode } from "react";
import { linkHref, linkText, type Resume } from "../lib/data";

export type Item = { key: string; node: ReactNode };
// Links render as real anchors so they stay clickable in the exported PDF.
export function contacts(r: Resume): Item[] {
  const p = r.personal;
  return [
    ...[p.email, p.phone, p.location].filter(Boolean).map((t) => ({ key: t, node: t })),
    ...(p.links ?? []).filter((l) => l.url.trim()).map((l, i) => ({ key: `link${i}`, node: <a href={linkHref(l.url)}>{linkText(l)}</a> })),
  ];
}
export const Joined = ({ items, sep }: { items: Item[]; sep: string }) => (
  <>{items.map((c, i) => <Fragment key={c.key}>{i > 0 && sep}{c.node}</Fragment>)}</>
);

export function Photo({ r, className, style }: { r: Resume; className: string; style?: React.CSSProperties }) {
  return r.personal.photo ? <img src={r.personal.photo} alt="" className={`shrink-0 object-cover ${className}`} style={style} /> : null;
}
