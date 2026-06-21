export type UserNote = {
  id: string;
  user_id: string;
  title: string;
  body: string;
  created_at: string;
  updated_at: string;
};

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
  created_at: string;
  updated_at: string;
};
