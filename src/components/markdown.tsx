import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

// Renders user-authored Markdown SAFELY — rehype-sanitize strips any scripts or
// dangerous HTML, so a user note can never execute code (unlike the trusted MDX
// library notes).
export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
        {children || "_Nothing here yet — start typing._"}
      </ReactMarkdown>
    </div>
  );
}
