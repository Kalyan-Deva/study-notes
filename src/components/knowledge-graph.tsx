"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { GraphData } from "@/lib/types";

const W = 900;
const H = 600;
const CX = W / 2;
const CY = H / 2;
const R = 200;

function truncate(s: string, n = 20) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

export function KnowledgeGraph({ data }: { data: GraphData }) {
  const router = useRouter();
  const [hover, setHover] = useState<string | null>(null);

  const categories = useMemo(
    () => [...new Set(data.nodes.map((n) => n.category))].sort(),
    [data],
  );
  const hueOf = (cat: string) =>
    Math.round((categories.indexOf(cat) * 360) / Math.max(categories.length, 1));

  const pos = useMemo(() => {
    const m = new Map<string, { x: number; y: number }>();
    const n = data.nodes.length;
    data.nodes.forEach((node, i) => {
      const a = (i / n) * 2 * Math.PI - Math.PI / 2;
      m.set(node.slug, { x: CX + R * Math.cos(a), y: CY + R * Math.sin(a) });
    });
    return m;
  }, [data]);

  const adj = useMemo(() => {
    const m = new Map<string, Set<string>>();
    for (const e of data.edges) {
      if (!m.has(e.source)) m.set(e.source, new Set());
      if (!m.has(e.target)) m.set(e.target, new Set());
      m.get(e.source)!.add(e.target);
      m.get(e.target)!.add(e.source);
    }
    return m;
  }, [data]);

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label="Knowledge graph showing how the notes link to each other"
      >
        {data.edges.map((e, i) => {
          const a = pos.get(e.source);
          const b = pos.get(e.target);
          if (!a || !b) return null;
          const active = hover === e.source || hover === e.target;
          return (
            <line
              key={i}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              style={{ stroke: active ? "var(--accent)" : "var(--border)" }}
              strokeWidth={active ? 2 : 1}
              opacity={hover && !active ? 0.15 : 0.7}
            />
          );
        })}
        {data.nodes.map((node) => {
          const p = pos.get(node.slug)!;
          const dim = !!hover && hover !== node.slug && !adj.get(hover)?.has(node.slug);
          const left = p.x < CX - 1;
          return (
            <g
              key={node.slug}
              transform={`translate(${p.x},${p.y})`}
              className="cursor-pointer"
              opacity={dim ? 0.3 : 1}
              onMouseEnter={() => setHover(node.slug)}
              onMouseLeave={() => setHover(null)}
              onClick={() => router.push(`/notes/${node.slug}`)}
            >
              <circle
                r={hover === node.slug ? 11 : 8}
                style={{ fill: `hsl(${hueOf(node.category)} 65% 55%)` }}
              />
              <text
                x={left ? -13 : 13}
                y={4}
                textAnchor={left ? "end" : "start"}
                fontSize={13}
                fontWeight={hover === node.slug ? 700 : 400}
                style={{ fill: "var(--foreground)" }}
                className="pointer-events-none"
              >
                {truncate(node.title)}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted">
        {categories.map((c) => (
          <span key={c} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ background: `hsl(${hueOf(c)} 65% 55%)` }}
            />
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}
