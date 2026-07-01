import {
  Document,
  Page,
  Text,
  View,
  Link,
  Image,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import type { Post } from "@/lib/supabase/types";

type MdNode = {
  type: string;
  value?: string;
  url?: string;
  depth?: number;
  ordered?: boolean;
  children?: MdNode[];
};

const INK = "#1b1a18";
const SUBTLE = "#4b4842";
const CORAL = "#c14a35";
const MUTED = "#8a857d";
const LINE = "#e7e4df";
const PANEL = "#f6f5f2";

const styles = StyleSheet.create({
  page: {
    paddingTop: 56,
    paddingBottom: 64,
    paddingHorizontal: 58,
    fontFamily: "Helvetica",
    fontSize: 10.5,
    lineHeight: 1.55,
    color: INK,
  },
  // ── header ──
  eyebrow: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8.5,
    color: CORAL,
    letterSpacing: 2,
    marginBottom: 8,
  },
  title: {
    fontFamily: "Helvetica-Bold",
    fontSize: 25,
    lineHeight: 1.12,
    color: "#141311",
    marginBottom: 10,
  },
  meta: { fontFamily: "Helvetica", fontSize: 9, color: MUTED },
  rule: { borderBottomWidth: 2, borderBottomColor: CORAL, marginTop: 14, marginBottom: 22 },
  // ── blocks ──
  h1: { fontFamily: "Helvetica-Bold", fontSize: 17, color: "#141311", marginTop: 18, marginBottom: 7 },
  h2: { fontFamily: "Helvetica-Bold", fontSize: 14, color: "#141311", marginTop: 18, marginBottom: 7 },
  h3: { fontFamily: "Helvetica-Bold", fontSize: 11.5, color: SUBTLE, marginTop: 13, marginBottom: 4 },
  paragraph: { marginBottom: 9, color: SUBTLE },
  bold: { fontFamily: "Helvetica-Bold", color: INK },
  italic: { fontFamily: "Helvetica-Oblique" },
  link: { color: CORAL, textDecoration: "underline" },
  inlineCode: {
    fontFamily: "Courier",
    fontSize: 9.5,
    color: "#b5310f",
  },
  codeBlock: {
    backgroundColor: PANEL,
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: 5,
    paddingVertical: 9,
    paddingHorizontal: 11,
    marginVertical: 9,
  },
  codeText: { fontFamily: "Courier", fontSize: 9, lineHeight: 1.5, color: "#3a3733" },
  blockquote: {
    borderLeftWidth: 3,
    borderLeftColor: CORAL,
    paddingLeft: 12,
    paddingVertical: 2,
    marginVertical: 9,
    color: MUTED,
  },
  list: { marginVertical: 7 },
  listItem: { flexDirection: "row", marginBottom: 5 },
  listMarker: { width: 16, color: CORAL, fontFamily: "Helvetica-Bold" },
  listContent: { flex: 1, color: SUBTLE },
  hr: { borderBottomWidth: 1, borderBottomColor: LINE, marginVertical: 16 },
  image: { maxWidth: "100%", marginVertical: 10 },
  table: { marginVertical: 10, borderWidth: 1, borderColor: LINE, borderRadius: 4 },
  tableRow: { flexDirection: "row" },
  tableCell: {
    flex: 1,
    paddingVertical: 5,
    paddingHorizontal: 7,
    fontSize: 9,
    color: SUBTLE,
    borderWidth: 0.5,
    borderColor: LINE,
  },
  footer: {
    position: "absolute",
    bottom: 28,
    left: 58,
    right: 58,
    textAlign: "center",
    fontFamily: "Helvetica",
    fontSize: 8,
    color: MUTED,
    letterSpacing: 0.5,
  },
});

function inline(nodes: MdNode[] | undefined, kp: string): React.ReactNode[] {
  if (!nodes) return [];
  return nodes.map((n, i) => {
    const key = `${kp}.${i}`;
    switch (n.type) {
      case "text":
        return <Text key={key}>{n.value}</Text>;
      case "strong":
        return (
          <Text key={key} style={styles.bold}>
            {inline(n.children, key)}
          </Text>
        );
      case "emphasis":
        return (
          <Text key={key} style={styles.italic}>
            {inline(n.children, key)}
          </Text>
        );
      case "inlineCode":
        return (
          <Text key={key} style={styles.inlineCode}>
            {n.value}
          </Text>
        );
      case "break":
        return <Text key={key}>{"\n"}</Text>;
      case "link":
        return (
          <Link key={key} src={n.url ?? "#"} style={styles.link}>
            {inline(n.children, key)}
          </Link>
        );
      case "delete":
        return <Text key={key}>{inline(n.children, key)}</Text>;
      default:
        return n.children ? (
          <Text key={key}>{inline(n.children, key)}</Text>
        ) : n.value ? (
          <Text key={key}>{n.value}</Text>
        ) : null;
    }
  });
}

function block(n: MdNode, key: string): React.ReactNode {
  switch (n.type) {
    case "heading": {
      const s = n.depth === 1 ? styles.h1 : n.depth === 2 ? styles.h2 : styles.h3;
      return (
        <Text key={key} style={s}>
          {inline(n.children, key)}
        </Text>
      );
    }
    case "paragraph": {
      if (n.children?.length === 1 && n.children[0].type === "image") {
        return <Image key={key} src={n.children[0].url ?? ""} style={styles.image} />;
      }
      return (
        <Text key={key} style={styles.paragraph}>
          {inline(n.children, key)}
        </Text>
      );
    }
    case "list":
      return (
        <View key={key} style={styles.list}>
          {(n.children ?? []).map((li, i) => (
            <View key={`${key}.${i}`} style={styles.listItem}>
              <Text style={styles.listMarker}>{n.ordered ? `${i + 1}.` : "•"}</Text>
              <View style={styles.listContent}>
                {(li.children ?? []).map((c, j) => block(c, `${key}.${i}.${j}`))}
              </View>
            </View>
          ))}
        </View>
      );
    case "code":
      return (
        <View key={key} style={styles.codeBlock}>
          <Text style={styles.codeText}>{n.value}</Text>
        </View>
      );
    case "blockquote":
      return (
        <View key={key} style={styles.blockquote}>
          {(n.children ?? []).map((c, i) => block(c, `${key}.${i}`))}
        </View>
      );
    case "thematicBreak":
      return <View key={key} style={styles.hr} />;
    case "image":
      return <Image key={key} src={n.url ?? ""} style={styles.image} />;
    case "table":
      return (
        <View key={key} style={styles.table}>
          {(n.children ?? []).map((row, r) => (
            <View key={`${key}.${r}`} style={styles.tableRow}>
              {(row.children ?? []).map((cell, c) => (
                <Text key={`${key}.${r}.${c}`} style={styles.tableCell}>
                  {inline(cell.children, `${key}.${r}.${c}`)}
                </Text>
              ))}
            </View>
          ))}
        </View>
      );
    default:
      return n.children ? (
        <View key={key}>{n.children.map((c, i) => block(c, `${key}.${i}`))}</View>
      ) : null;
  }
}

export async function renderPostPdf(
  post: Post,
  dateStr: string,
  minutes: number,
): Promise<Buffer> {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(post.body || "") as MdNode;
  const blocks = (tree.children ?? []).map((n, i) => block(n, `b${i}`));

  const doc = (
    <Document title={post.title} author="Lexicon">
      <Page size="A4" style={styles.page}>
        <Text style={styles.eyebrow}>{(post.category || "Post").toUpperCase()}</Text>
        <Text style={styles.title}>{post.title}</Text>
        <Text style={styles.meta}>
          {dateStr}   ·   {minutes} min read   ·   Lexicon
        </Text>
        <View style={styles.rule} />
        {blocks}
        <Text
          style={styles.footer}
          fixed
          render={({ pageNumber, totalPages }) =>
            `Lexicon   ·   ${pageNumber} of ${totalPages}`
          }
        />
      </Page>
    </Document>
  );

  return renderToBuffer(doc);
}
