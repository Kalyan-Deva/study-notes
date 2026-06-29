import type { ReactElement } from "react";

// Branded promo "screenshot" for the PWA install UI. Rendered to PNG by next/og
// at a wide (desktop) or narrow (mobile) aspect.
export function appScreenshot({
  width,
  height,
}: {
  width: number;
  height: number;
}): ReactElement {
  const wide = width >= height;
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#191816",
        color: "#ecebe7",
        fontFamily: "sans-serif",
        padding: wide ? 64 : 48,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", marginBottom: wide ? 56 : 40 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            background: "#f0816f",
            color: "#191816",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontSize: 26,
            marginRight: 16,
          }}
        >
          L
        </div>
        <div style={{ fontSize: 30, fontWeight: 700 }}>Lexicon</div>
      </div>

      <div style={{ fontSize: wide ? 72 : 52, fontWeight: 800, lineHeight: 1.05, marginBottom: 22 }}>
        A personal knowledge base
      </div>
      <div style={{ display: "flex", fontSize: wide ? 30 : 24, color: "#a8a39b", marginBottom: wide ? 56 : 40 }}>
        Clear, searchable notes on computing, networking & security.
      </div>

      <div style={{ display: "flex", flexDirection: wide ? "row" : "column", gap: 24, flexWrap: "wrap" }}>
        {["OSI Model", "TCP vs UDP", "Python"].map((t) => (
          <div
            key={t}
            style={{
              display: "flex",
              flexDirection: "column",
              background: "#211f1d",
              border: "1px solid #322f2b",
              borderRadius: 16,
              padding: 28,
              width: wide ? 360 : "100%",
            }}
          >
            <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 10 }}>{t}</div>
            <div style={{ display: "flex", fontSize: 20, color: "#a8a39b" }}>
              A clear explainer, saved as a topic.
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
