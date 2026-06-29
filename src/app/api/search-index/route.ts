import { NextResponse } from "next/server";
import { getSearchIndex } from "@/lib/search";

// Public search index (all content is public-read). Fetched once on first focus
// by the search bar, then filtered client-side.
export async function GET() {
  const docs = await getSearchIndex();
  return NextResponse.json(docs);
}
