import type { Metadata } from "next";
import Link from "next/link";
import { PostComposer } from "@/components/post-composer";
import { supabaseConfigured } from "@/lib/supabase/config";
import { getNavTree } from "@/lib/content";

export const metadata: Metadata = { title: "Submit a post" };

export default async function SubmitPage({
  searchParams,
}: {
  searchParams: Promise<{ confirmed?: string }>;
}) {
  const { confirmed } = await searchParams;

  if (confirmed === "1") {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Submission confirmed 🎉</h1>
        <p className="mt-3 text-muted">
          Thanks! Your post is now awaiting review. It appears on the site once approved.
        </p>
        <Link href="/" className="mt-6 inline-block text-accent hover:underline">
          ← Back to home
        </Link>
      </div>
    );
  }

  if (confirmed === "0") {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Link invalid or expired</h1>
        <p className="mt-3 text-muted">
          That confirmation link didn&apos;t work. You can write and submit again below.
        </p>
        <Link href="/submit" className="mt-6 inline-block text-accent hover:underline">
          Write a post →
        </Link>
      </div>
    );
  }

  if (!supabaseConfigured) {
    return (
      <p className="text-muted">Submissions aren&apos;t set up yet.</p>
    );
  }

  const categories = getNavTree().map((g) => g.category);

  return (
    <div>
      <div className="mb-4 rounded-lg border border-card-border bg-card/60 px-4 py-3 text-sm text-muted">
        Write a post below and submit it with your email. We&apos;ll send a confirmation
        link; once you confirm, it goes to the editor for review before publishing.
      </div>
      <PostComposer categories={categories} canEdit mode="submit" />
    </div>
  );
}
