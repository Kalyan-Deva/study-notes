export type NoteMeta = {
  slug: string;
  title: string;
  category: string;
  summary: string;
  order: number;
  updated: string | null;
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
