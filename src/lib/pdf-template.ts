// Builds the full, self-contained HTML document that Chromium renders to PDF.
// Editorial look: serif body, coral accent, clean headings, light theme. The
// body is already-sanitized HTML from the Markdown renderer.

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const CSS = `
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    font-family: Georgia, "Iowan Old Style", "Times New Roman", serif;
    color: #1b1a18;
    font-size: 11.5pt;
    line-height: 1.65;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .cover { border-bottom: 2px solid #d65a43; padding-bottom: 14px; margin-bottom: 26px; }
  .cover .eyebrow {
    font-family: Arial, Helvetica, sans-serif;
    color: #d65a43; text-transform: uppercase; letter-spacing: 2px;
    font-size: 9pt; font-weight: 700; margin: 0 0 6px;
  }
  .cover h1 { font-size: 26pt; line-height: 1.15; margin: 0; font-weight: 700; }
  .cover .meta {
    font-family: Arial, Helvetica, sans-serif;
    color: #71706d; font-size: 9.5pt; margin-top: 10px;
  }
  main h1 { font-size: 19pt; margin: 22px 0 6px; }
  main h2 {
    font-size: 15.5pt; margin: 22px 0 6px; padding-bottom: 3px;
    border-bottom: 1px solid #ece9e4; break-after: avoid;
  }
  main h3 { font-size: 12.5pt; margin: 18px 0 4px; break-after: avoid; }
  main p { margin: 0 0 10px; }
  main a { color: #c14a35; text-decoration: none; }
  main a[href^="http"]::after {
    content: " (" attr(href) ")";
    font-family: Arial, sans-serif; font-size: 0.75em; color: #8a857d; word-break: break-all;
  }
  main ul, main ol { padding-left: 22px; margin: 8px 0; }
  main li { margin: 3px 0; }
  main blockquote {
    border-left: 3px solid #d65a43; padding-left: 14px; margin: 12px 0;
    color: #57534e; font-style: italic;
  }
  main :not(pre) > code {
    font-family: "SF Mono", Consolas, monospace; font-size: 0.86em;
    background: #f4f3f1; padding: 1px 5px; border-radius: 4px;
  }
  main pre {
    background: #f7f6f4; border: 1px solid #e7e4df; border-radius: 8px;
    padding: 12px 14px; font-size: 9.5pt; line-height: 1.5;
    white-space: pre-wrap; word-break: break-word; break-inside: avoid;
    font-family: "SF Mono", Consolas, monospace;
  }
  main pre code { background: none; padding: 0; }
  main img { max-width: 100%; border-radius: 6px; margin: 12px 0; break-inside: avoid; }
  main table { border-collapse: collapse; width: 100%; font-size: 10pt; margin: 12px 0; break-inside: avoid; }
  main th, main td { border: 1px solid #e7e4df; padding: 6px 9px; text-align: left; }
  main th { background: #faf9f7; }
  main hr { border: none; border-top: 1px solid #e7e4df; margin: 22px 0; }
`;

export function buildPdfHtml({
  title,
  category,
  bodyHtml,
  dateStr,
  minutes,
}: {
  title: string;
  category: string;
  bodyHtml: string;
  dateStr: string;
  minutes: number;
}): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <style>${CSS}</style>
</head>
<body>
  <header class="cover">
    <p class="eyebrow">${escapeHtml(category)}</p>
    <h1>${escapeHtml(title)}</h1>
    <p class="meta">${escapeHtml(dateStr)} &middot; ${minutes} min read &middot; Lexicon</p>
  </header>
  <main>${bodyHtml}</main>
</body>
</html>`;
}
