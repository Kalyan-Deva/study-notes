import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";

// Allow <u> (underline) on top of the safe default allowlist — the composer's
// Ctrl+U inserts it. Still strips scripts/dangerous HTML.
const schema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), "u"],
};

// Renders user-authored Markdown SAFELY — rehype-sanitize strips any scripts or
// dangerous HTML, so a user note can never execute code (unlike the trusted MDX
// library notes).
export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[[rehypeSanitize, schema]]}>
        {children || "_Nothing here yet — start typing._"}
      </ReactMarkdown>
    </div>
  );
}
