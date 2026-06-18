"use client";

import { useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { supabaseConfigured } from "@/lib/supabase/config";

export function SuggestForm() {
  const [topic, setTopic] = useState("");
  const [detail, setDetail] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [err, setErr] = useState<string | null>(null);

  if (!supabaseConfigured) {
    return (
      <p className="rounded-xl border border-card-border bg-card p-4 text-sm text-muted">
        Suggestions need Supabase set up — see <code className="text-foreground">SETUP-SUPABASE.md</code>.
      </p>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErr(null);
    const supabase = createSupabaseBrowser();
    const { error } = await supabase.from("topic_suggestions").insert({
      topic: topic.trim(),
      detail: detail.trim() || null,
      email: email.trim() || null,
    });
    if (error) {
      setErr(error.message);
      setStatus("idle");
      return;
    }
    setStatus("done");
  }

  if (status === "done") {
    return (
      <div className="rounded-xl border border-card-border bg-card p-6 text-center">
        <p className="font-medium">Thanks! 🙌</p>
        <p className="mt-1 text-sm text-muted">
          Your suggestion was sent.{" "}
          <button
            type="button"
            onClick={() => {
              setTopic("");
              setDetail("");
              setEmail("");
              setStatus("idle");
            }}
            className="text-accent"
          >
            Suggest another
          </button>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Topic *</label>
        <input
          required
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. HTTP & REST APIs"
          className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Anything specific? (optional)</label>
        <textarea
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
          rows={4}
          placeholder="What angle or sub-topics would help most?"
          className="w-full resize-y rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Your email (optional)</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="If you'd like a heads-up when it's added"
          className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </div>
      {err && <p className="text-sm text-accent">{err}</p>}
      <button
        type="submit"
        disabled={status === "sending"}
        className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-opacity disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : "Send suggestion"}
      </button>
    </form>
  );
}
