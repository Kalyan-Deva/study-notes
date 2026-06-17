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
