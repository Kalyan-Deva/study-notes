"use client";

import { useEffect, useState } from "react";

type Heading = { id: string; text: string };

// Builds a contents list from the rendered <h2> headings in the note. Reads the
// real DOM ids (added by rehype-slug) so links always match — no slug guessing.
export function OnThisPage() {
  const [items, setItems] = useState<Heading[]>([]);

  useEffect(() => {
    const hs = Array.from(
      document.querySelectorAll<HTMLHeadingElement>("article h2[id]"),
    );
    setItems(hs.map((h) => ({ id: h.id, text: h.textContent ?? "" })));
  }, []);

  if (items.length < 4) return null;

  return (
    <nav className="not-prose mb-7 rounded-xl border border-card-border bg-card/50 p-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
        On this page
      </p>
      <ol className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
        {items.map((it) => (
          <li key={it.id}>
            <a
              href={`#${it.id}`}
              className="text-foreground/70 transition-colors hover:text-accent"
            >
              {it.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
