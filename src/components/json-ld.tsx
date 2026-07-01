// Emits a schema.org JSON-LD <script> for rich results. Data is trusted
// (built server-side from our own content), so dangerouslySetInnerHTML is safe.
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
