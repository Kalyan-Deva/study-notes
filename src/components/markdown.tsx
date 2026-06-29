import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";

// Allow <u> (composer Ctrl+U) and heading `id`s (added by rehype-slug, used by
// the table of contents) on top of the safe default allowlist. clobberPrefix is
// cleared so heading ids stay clean for anchor links. Still strips scripts.
const schema = {
  ...defaultSchema,
  clobberPrefix: "",
  tagNames: [...(defaultSchema.tagNames ?? []), "u"],
  attributes: {
    ...defaultSchema.attributes,
    h1: [...(defaultSchema.attributes?.h1 ?? []), "id"],
    h2: [...(defaultSchema.attributes?.h2 ?? []), "id"],
    h3: [...(defaultSchema.attributes?.h3 ?? []), "id"],
    h4: [...(defaultSchema.attributes?.h4 ?? []), "id"],
  },
};

// Renders user-authored Markdown SAFELY — rehype-sanitize strips any scripts or
// dangerous HTML, so a user note can never execute code (unlike the trusted MDX
// library notes).
export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug, [rehypeSanitize, schema]]}
      >
        {children || "_Nothing here yet — start typing._"}
      </ReactMarkdown>
    </div>
  );
}
