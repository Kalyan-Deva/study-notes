export type NoteMeta = {
  slug: string;
  title: string;
  category: string;
  summary: string;
  order: number;
  updated: string | null;
  // Where the card/link points. Curated topics omit this (default /notes/<slug>);
  // public posts set it to /posts/<id> so they can live in the same nav tree.
  href?: string;
};

export type Note = {
  meta: NoteMeta;
  body: string;
};

export type NavCategory = {
  category: string;
  notes: NoteMeta[];
};

export type GraphNode = { slug: string; title: string; category: string };
export type GraphEdge = { source: string; target: string };
export type GraphData = { nodes: GraphNode[]; edges: GraphEdge[] };
