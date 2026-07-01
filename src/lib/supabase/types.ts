// One chat-style entry within a Journal note. `md` is raw Markdown.
export type JournalEntry = {
  id: string;
  md: string;
};

// A public, open Journal note: an ordered stream of entries.
export type JournalNote = {
  id: string;
  title: string;
  entries: JournalEntry[];
  created_at: string;
  updated_at: string;
};

// A public, open Post: one continuous Markdown document shown on the home page
// alongside the curated topics.
export type Post = {
  id: string;
  title: string;
  body: string;
  category: string;
  status: string; // 'published' | 'pending' | 'rejected'
  created_at: string;
  updated_at: string;
};

// A public submission awaiting review (admin queue).
export type PendingPost = {
  id: string;
  title: string;
  category: string;
  submitter_email: string | null;
  created_at: string;
};
