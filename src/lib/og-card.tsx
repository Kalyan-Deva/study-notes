import type { ReactElement } from "react";

// Shared layout for generated Open Graph images (next/og). Inline styles only —
// next/og supports a flexbox subset of CSS, not Tailwind. Brand colors match the
// app's dark theme (warm charcoal + coral accent).
export const OG_SIZE = { width: 1200, height: 630 };

export function ogCard({
  title,
  eyebrow,
}: {
  title: string;
  eyebrow: string;
}): ReactElement {
  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#191816",
        color: "#ecebe7",
        padding: "80px",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            color: "#f0816f",
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: 4,
            textTransform: "uppercase",
          }}
        >
          {eyebrow}
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 68,
            fontWeight: 800,
            lineHeight: 1.1,
            display: "-webkit-box",
            WebkitLineClamp: 4,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {title}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", fontSize: 32 }}>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 12,
            background: "#f0816f",
            color: "#191816",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            marginRight: 18,
          }}
        >
          L
        </div>
        <div style={{ fontWeight: 700 }}>Lexicon</div>
      </div>
    </div>
  );
}
