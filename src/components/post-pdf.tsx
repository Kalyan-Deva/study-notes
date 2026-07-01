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

// Minimal mdast node shape (we only read a few fields).
type MdNode = {
  type: string;
  value?: string;
  url?: string;
  depth?: number;
  ordered?: boolean;
  children?: MdNode[];
};

const INK = "#1b1a18";
const CORAL = "#c14a35";
const MUTED = "#71706d";

const styles = StyleSheet.create({
  page: {
    paddingVertical: 54,
    paddingHorizontal: 56,
    fontFamily: "Times-Roman",
    fontSize: 11,
    lineHeight: 1.5,
    color: INK,
  },
  eyebrow: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    color: CORAL,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  title: { fontFamily: "Times-Bold", fontSize: 24, marginBottom: 8 },
  meta: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: MUTED,
    marginBottom: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e7e4df",
  },
  h1: { fontFamily: "Times-Bold", fontSize: 18, marginTop: 16, marginBottom: 6 },
  h2: { fontFamily: "Times-Bold", fontSize: 15, marginTop: 16, marginBottom: 6 },
  h3: { fontFamily: "Times-Bold", fontSize: 12.5, marginTop: 12, marginBottom: 4 },
  paragraph: { marginBottom: 8 },
  bold: { fontFamily: "Times-Bold" },
  italic: { fontFamily: "Times-Italic" },
  link: { color: CORAL, textDecoration: "underline" },
  inlineCode: { fontFamily: "Courier", fontSize: 10 },
  codeBlock: {
    backgroundColor: "#f6f5f3",
    borderWidth: 1,
    borderColor: "#e7e4df",
    borderRadius: 4,
    padding: 8,
    marginVertical: 6,
  },
  codeText: { fontFamily: "Courier", fontSize: 9, lineHeight: 1.4, color: "#333" },
  blockquote: {
    borderLeftWidth: 2,
    borderLeftColor: CORAL,
    paddingLeft: 10,
    marginVertical: 6,
    color: "#57534e",
  },
  list: { marginVertical: 6 },
  listItem: { flexDirection: "row", marginBottom: 3 },
  listMarker: { width: 16, color: MUTED },
  listContent: { flex: 1 },
  hr: { borderBottomWidth: 1, borderBottomColor: "#e7e4df", marginVertical: 14 },
  image: { maxWidth: "100%", marginVertical: 8 },
  table: { marginVertical: 8, borderWidth: 1, borderColor: "#e7e4df" },
  tableRow: { flexDirection: "row" },
  tableCell: {
    flex: 1,
    padding: 5,
    fontSize: 9.5,
    borderWidth: 0.5,
    borderColor: "#e7e4df",
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
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.eyebrow}>{(post.category || "Post").toUpperCase()}</Text>
        <Text style={styles.title}>{post.title}</Text>
        <Text style={styles.meta}>
          {dateStr} · {minutes} min read · Lexicon
        </Text>
        {blocks}
      </Page>
    </Document>
  );

  return renderToBuffer(doc);
}
