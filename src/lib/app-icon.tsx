import type { ReactElement } from "react";

// The "L" wordmark icon, full-bleed coral so it works as a maskable PWA icon
// (no transparent corners). Rendered to PNG by next/og at various sizes.
export function appIcon(size: number): ReactElement {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f0816f",
        color: "#191816",
        fontWeight: 800,
        fontSize: Math.round(size * 0.62),
        fontFamily: "sans-serif",
      }}
    >
      L
    </div>
  );
}
