"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavCategory } from "@/lib/types";
import { ThemeToggle } from "./theme-toggle";
import { SearchBar } from "./search-bar";
import { AuthButton } from "./auth-button";

export function AppShell({
  tree,
  children,
}: {
  tree: NavCategory[];
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-full flex-col">
      {/* Ambient color behind the glass */}
      <div className="ambient" aria-hidden="true" />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/65 backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-3 px-4 lg:gap-4 lg:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-2 font-semibold tracking-tight">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-accent text-[13px] font-bold text-accent-foreground">
              L
            </span>
            <span className="hidden sm:inline">Lexicon</span>
          </Link>
          <div className="flex min-w-0 flex-1 justify-center">
            <SearchBar tree={tree} />
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/compose"
              aria-label="Write a post"
              title="Write a post"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:bg-card hover:text-foreground"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z" />
              </svg>
            </Link>
            <Link
              href="/journal"
              aria-label="Journal"
              title="Journal"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:bg-card hover:text-foreground"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H18a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H5.5A1.5 1.5 0 0 1 4 19.5z" />
                <path d="M4 17.5A1.5 1.5 0 0 1 5.5 16H19" />
                <path d="M8 7h7M8 10.5h7" />
              </svg>
            </Link>
            <Link
              href="/graph"
              aria-label="Knowledge map"
              title="Knowledge map"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:bg-card hover:text-foreground"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="5" cy="6" r="2.5" />
                <circle cx="19" cy="8" r="2.5" />
                <circle cx="12" cy="18" r="2.5" />
                <path d="M7.2 7 16.5 8.6M17.6 10.3 13 15.8M10.2 16.6 6 8.2" />
              </svg>
            </Link>
            <ThemeToggle />
            <AuthButton />
            <button
              type="button"
              aria-label="Toggle topics"
              onClick={() => setOpen((v) => !v)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:bg-card hover:text-foreground lg:hidden"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-1 px-4 lg:gap-10 lg:px-8">
        {/* Left floating glass sidebar (desktop) */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="glass-edge scroll-thin sticky top-20 mt-6 max-h-[calc(100vh-6.5rem)] overflow-y-auto rounded-2xl border border-foreground/10 bg-card/55 p-4 shadow-xl backdrop-blur-2xl backdrop-saturate-150">
            <SidebarNav tree={tree} />
          </div>
        </aside>

        {/* Flowing notes */}
        <main className="min-w-0 flex-1 py-10">{children}</main>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="glass-edge scroll-thin absolute left-0 top-0 h-full w-72 overflow-y-auto rounded-r-2xl border-r border-foreground/10 bg-card/70 p-5 shadow-2xl backdrop-blur-2xl backdrop-saturate-150">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-semibold">Topics</span>
              <button
                type="button"
                aria-label="Close topics"
                onClick={() => setOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:text-foreground"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <SidebarNav tree={tree} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

function SidebarNav({
  tree,
  onNavigate,
}: {
  tree: NavCategory[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  if (tree.length === 0) {
    return <p className="text-sm text-muted">No topics yet.</p>;
  }

  return (
    <nav className="space-y-6 text-sm">
      <p className="px-2 text-xs font-semibold uppercase tracking-wider text-muted">
        Topics
      </p>
      {tree.map((group) => (
        <div key={group.category} className="space-y-1">
          <p className="px-2 text-[11px] font-semibold uppercase tracking-wider text-muted/80">
            {group.category}
          </p>
          <ul className="space-y-0.5">
            {group.notes.map((note) => {
              const href = note.href ?? `/notes/${note.slug}`;
              const active = pathname === href;
              return (
                <li key={note.slug}>
                  <Link
                    href={href}
                    onClick={onNavigate}
                    className={[
                      "block rounded-md px-2 py-1.5 transition-colors",
                      active
                        ? "bg-accent-soft font-medium text-accent"
                        : "text-foreground/75 hover:bg-card hover:text-foreground",
                    ].join(" ")}
                  >
                    {note.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      <div className="border-t border-border pt-4">
        <Link
          href="/suggest"
          onClick={onNavigate}
          className="block rounded-md px-2 py-1.5 text-foreground/75 transition-colors hover:bg-card hover:text-foreground"
        >
          + Suggest a topic
        </Link>
      </div>
    </nav>
  );
}
