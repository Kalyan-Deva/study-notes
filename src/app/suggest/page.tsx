import type { Metadata } from "next";
import { SuggestForm } from "@/components/suggest-form";

export const metadata: Metadata = { title: "Suggest a topic" };

export default function SuggestPage() {
  return (
    <div className="mx-auto max-w-xl">
      <header className="mb-5 border-b border-border pb-4">
        <h1 className="text-2xl font-bold tracking-tight">Suggest a topic</h1>
        <p className="mt-2 text-sm text-muted">
          Want a note on something? Tell me what — I&apos;ll add it to the list.
        </p>
      </header>
      <SuggestForm />
    </div>
  );
}
