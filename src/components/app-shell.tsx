"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavCategory } from "@/lib/types";
import { ThemeToggle } from "./theme-toggle";

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
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 lg:px-8">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-accent text-[13px] font-bold text-accent-foreground">
              N
            </span>
            Notes
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
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
              const href = `/notes/${note.slug}`;
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
    </nav>
  );
}
