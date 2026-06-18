import type { Metadata } from "next";
import { getLinkGraph } from "@/lib/content";
import { KnowledgeGraph } from "@/components/knowledge-graph";

export const metadata: Metadata = {
  title: "Map",
  description: "A visual map of how the notes connect.",
};

export default function GraphPage() {
  const data = getLinkGraph();

  return (
    <div>
      <header className="mb-5 border-b border-border pb-4">
        <h1 className="text-2xl font-bold tracking-tight">Knowledge map</h1>
        <p className="mt-2 text-sm text-muted">
          How the notes connect — each dot is a note, each line a link between them. Hover to
          highlight a note&apos;s links; click to open it.
        </p>
      </header>
      <KnowledgeGraph data={data} />
    </div>
  );
}
