"use client";

import { useEffect, useState } from "react";

type Heading = { id: string; text: string };

// Right-rail "on this page" that highlights the section you're currently reading.
// Reads the rendered <h2 id> headings and tracks them with an IntersectionObserver.
export function ScrollSpyToc() {
  const [items, setItems] = useState<Heading[]>([]);
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const hs = Array.from(
      document.querySelectorAll<HTMLHeadingElement>("article h2[id]"),
    );
    setItems(hs.map((h) => ({ id: h.id, text: h.textContent ?? "" })));
    if (hs.length === 0) return;

    let ticking = false;
    function update() {
      ticking = false;
      // active = the last heading whose top has scrolled above the header line
      let current = hs[0].id;
      for (const h of hs) {
        if (h.getBoundingClientRect().top <= 100) current = h.id;
        else break;
      }
      setActive(current);
    }
    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  if (items.length < 2) return null;

  return (
    <nav className="scroll-thin sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pb-10 text-sm">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
        On this page
      </p>
      <ul className="border-l border-border">
        {items.map((it) => (
          <li key={it.id}>
            <a
              href={`#${it.id}`}
              className={[
                "-ml-px block border-l py-1 pl-3 transition-colors",
                active === it.id
                  ? "border-accent font-medium text-accent"
                  : "border-transparent text-foreground/60 hover:text-foreground",
              ].join(" ")}
            >
              {it.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
