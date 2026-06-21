"use client";

import { useEffect, useRef, useState } from "react";

// Session-only text highlighter for note pages. Select text in the note, pick a
// colour from the popover, and it wraps the selection in a <mark>. Highlights
// live only in the DOM — they vanish on reload / closing the tab (no storage).
// Click an existing highlight to remove it.

const COLORS = [
  { name: "Yellow", value: "rgba(250, 204, 21, 0.45)" },
  { name: "Green", value: "rgba(74, 222, 128, 0.45)" },
  { name: "Pink", value: "rgba(244, 114, 182, 0.45)" },
  { name: "Blue", value: "rgba(96, 165, 250, 0.45)" },
];

function highlightRange(range: Range, color: string) {
  const root = range.commonAncestorContainer;
  const rootEl = (root.nodeType === Node.TEXT_NODE ? root.parentNode : root) as Node;
  const nodes: Text[] = [];
  const walker = document.createTreeWalker(rootEl, NodeFilter.SHOW_TEXT);
  let node: Node | null;
  while ((node = walker.nextNode())) {
    if (range.intersectsNode(node)) nodes.push(node as Text);
  }
  if (nodes.length === 0 && root.nodeType === Node.TEXT_NODE) nodes.push(root as Text);

  for (const textNode of nodes) {
    // Skip text already inside a highlight.
    if ((textNode.parentElement as HTMLElement | null)?.closest(".lex-hl")) continue;
    const r = document.createRange();
    r.selectNodeContents(textNode);
    if (textNode === range.startContainer) r.setStart(textNode, range.startOffset);
    if (textNode === range.endContainer) r.setEnd(textNode, range.endOffset);
    if (r.collapsed || r.toString().trim() === "") continue;
    const mark = document.createElement("mark");
    mark.className = "lex-hl";
    mark.style.backgroundColor = color;
    try {
      r.surroundContents(mark);
    } catch {
      /* selection crossed an element boundary awkwardly — skip this node */
    }
  }
}

export function Highlighter() {
  const [bar, setBar] = useState<{ x: number; y: number } | null>(null);
  const savedRange = useRef<Range | null>(null);

  // Show the colour popover when text inside the note is selected.
  useEffect(() => {
    function onSelect() {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
        setBar(null);
        return;
      }
      const range = sel.getRangeAt(0);
      const prose = document.querySelector("article .prose");
      if (!prose || !prose.contains(range.commonAncestorContainer) || !sel.toString().trim()) {
        setBar(null);
        return;
      }
      const rect = range.getBoundingClientRect();
      savedRange.current = range.cloneRange();
      setBar({ x: rect.left + rect.width / 2, y: Math.max(rect.top, 56) });
    }
    document.addEventListener("mouseup", onSelect);
    document.addEventListener("keyup", onSelect);
    return () => {
      document.removeEventListener("mouseup", onSelect);
      document.removeEventListener("keyup", onSelect);
    };
  }, []);

  // Click an existing highlight to remove it.
  useEffect(() => {
    const prose = document.querySelector("article .prose");
    if (!prose) return;
    function onClick(e: Event) {
      const mark = (e.target as HTMLElement).closest?.(".lex-hl");
      if (!mark || !mark.parentNode) return;
      const parent = mark.parentNode;
      while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
      parent.removeChild(mark);
      (parent as Element).normalize?.();
    }
    prose.addEventListener("click", onClick);
    return () => prose.removeEventListener("click", onClick);
  }, []);

  function apply(color: string) {
    const range = savedRange.current;
    if (range) highlightRange(range, color);
    window.getSelection()?.removeAllRanges();
    setBar(null);
  }

  if (!bar) return null;

  return (
    <div
      className="fixed z-50 -translate-x-1/2 -translate-y-full"
      style={{ left: bar.x, top: bar.y - 8 }}
    >
      <div className="flex items-center gap-2 rounded-full border border-foreground/10 bg-card/90 px-2.5 py-1.5 shadow-xl backdrop-blur-xl">
        {COLORS.map((c) => (
          <button
            key={c.name}
            type="button"
            title={`Highlight ${c.name}`}
            aria-label={`Highlight ${c.name}`}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => apply(c.value)}
            className="h-5 w-5 rounded-full border border-foreground/20 transition-transform hover:scale-110"
            style={{ backgroundColor: c.value }}
          />
        ))}
      </div>
    </div>
  );
}
