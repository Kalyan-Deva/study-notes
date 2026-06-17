// Reusable, theme-aware figures for notes. Plain (server-renderable) components
// passed into MDX via the `components` map. Use sparingly — one good visual beats
// a wall of text.

type Part = { label: string; accent?: boolean };

function Chip({ label, accent }: Part) {
  return (
    <span
      className={
        "rounded px-2 py-1 text-xs font-medium " +
        (accent
          ? "bg-accent/15 text-accent"
          : "border border-card-border bg-card text-foreground")
      }
    >
      {label}
    </span>
  );
}

const LAYERS = [
  { n: 7, name: "Application", pdu: "Data", note: "the apps I use — web, email, DNS" },
  { n: 6, name: "Presentation", pdu: "Data", note: "encrypt, compress, format (TLS)" },
  { n: 5, name: "Session", pdu: "Data", note: "open, keep and close the connection" },
  { n: 4, name: "Transport", pdu: "Segment", note: "TCP / UDP, port numbers" },
  { n: 3, name: "Network", pdu: "Packet", note: "IP addresses, routing" },
  { n: 2, name: "Data Link", pdu: "Frame", note: "MAC addresses, switches" },
  { n: 1, name: "Physical", pdu: "Bits", note: "cables, wifi, signals" },
];

export function LayerStack() {
  return (
    <figure className="not-prose my-5">
      <div className="overflow-hidden rounded-xl border border-card-border">
        {LAYERS.map((l) => {
          const top =
            l.n === 7
              ? ""
              : l.n === 4
                ? "border-t-2 border-t-accent/40"
                : "border-t border-card-border";
          return (
            <div key={l.n} className={`flex items-center gap-3 px-3 py-2 ${top}`}>
              <span
                aria-hidden="true"
                className={`h-6 w-1 shrink-0 rounded-full ${l.n >= 5 ? "bg-accent/50" : "bg-muted/30"}`}
              />
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent/15 text-sm font-semibold text-accent">
                {l.n}
              </span>
              <span className="w-24 shrink-0 font-medium">{l.name}</span>
              <span className="hidden flex-1 text-sm text-muted sm:block">{l.note}</span>
              <span className="ml-auto shrink-0 rounded bg-card px-2 py-0.5 text-xs text-muted sm:ml-0">
                {l.pdu}
              </span>
            </div>
          );
        })}
      </div>
      <figcaption className="mt-2 text-center text-xs text-muted">
        Layer 7 is closest to me; layer 1 is the wire. Coral = software side (7–5),
        grey = network side (4–1).
      </figcaption>
    </figure>
  );
}

const STEPS: { add: string; name: string; parts: Part[] }[] = [
  { add: "App data", name: "Data", parts: [{ label: "Data" }] },
  {
    add: "+ TCP header (L4)",
    name: "Segment",
    parts: [{ label: "TCP", accent: true }, { label: "Data" }],
  },
  {
    add: "+ IP header (L3)",
    name: "Packet",
    parts: [{ label: "IP", accent: true }, { label: "TCP", accent: true }, { label: "Data" }],
  },
  {
    add: "+ frame (L2)",
    name: "Frame",
    parts: [
      { label: "Eth", accent: true },
      { label: "IP", accent: true },
      { label: "TCP", accent: true },
      { label: "Data" },
      { label: "FCS", accent: true },
    ],
  },
];

export function Encapsulation() {
  return (
    <figure className="not-prose my-5 space-y-2">
      {STEPS.map((s) => (
        <div key={s.name} className="flex flex-wrap items-center gap-2">
          <span className="w-32 shrink-0 text-xs text-muted">{s.add}</span>
          <span className="flex flex-wrap gap-1">
            {s.parts.map((p, i) => (
              <Chip key={i} label={p.label} accent={p.accent} />
            ))}
          </span>
          <span className="text-xs font-medium text-foreground">= {s.name}</span>
        </div>
      ))}
      <figcaption className="text-xs text-muted">
        Going down, each layer wraps the data in its own header. Coming back up, each
        layer peels its header off again.
      </figcaption>
    </figure>
  );
}

const HANDSHAKE = [
  { arrow: "→", label: "SYN", sub: '"can we talk?" — seq = x' },
  { arrow: "←", label: "SYN, ACK", sub: '"yes" — seq = y, ack = x+1' },
  { arrow: "→", label: "ACK", sub: '"great, starting" — ack = y+1' },
];

export function Handshake() {
  return (
    <figure className="not-prose my-5">
      <div className="flex items-center justify-between px-1 text-xs font-semibold text-muted">
        <span>Client</span>
        <span>Server</span>
      </div>
      <div className="mt-2 space-y-2">
        {HANDSHAKE.map((s, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-lg border border-card-border bg-card px-3 py-2"
          >
            <span className="w-5 text-center font-mono text-lg text-accent">{s.arrow}</span>
            <span className="font-semibold">{s.label}</span>
            <span className="ml-auto text-xs text-muted">{s.sub}</span>
          </div>
        ))}
      </div>
      <figcaption className="mt-2 text-center text-xs text-muted">
        TCP's 3-way handshake — both sides agree before any real data is sent.
      </figcaption>
    </figure>
  );
}

const SOLVE_STEPS = [
  { n: 1, name: "Understand", note: "restate it, note inputs/outputs, constraints, edge cases" },
  { n: 2, name: "Match", note: "what kind of problem is this? which pattern fits?" },
  { n: 3, name: "Plan", note: "brute force first, then the better idea; pick data structures" },
  { n: 4, name: "Code", note: "turn the plan into clean code" },
  { n: 5, name: "Test", note: "run edge cases and trace it by hand" },
  { n: 6, name: "Optimize", note: "state the complexity, cut repeated work, improve" },
];

export function SolveSteps() {
  return (
    <figure className="not-prose my-5">
      <div className="overflow-hidden rounded-xl border border-card-border">
        {SOLVE_STEPS.map((s) => (
          <div
            key={s.n}
            className={`flex items-center gap-3 px-3 py-2 ${s.n === 1 ? "" : "border-t border-card-border"}`}
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent/15 text-sm font-semibold text-accent">
              {s.n}
            </span>
            <span className="w-24 shrink-0 font-medium">{s.name}</span>
            <span className="flex-1 text-sm text-muted">{s.note}</span>
          </div>
        ))}
      </div>
      <figcaption className="mt-2 text-center text-xs text-muted">
        The loop I run on every problem. Don't skip step 1 — most wrong answers start there.
      </figcaption>
    </figure>
  );
}

const TCP_UDP_ROWS = [
  { k: "Connection", tcp: "set up first (handshake)", udp: "none — just send" },
  { k: "Reliable?", tcp: "yes — resends lost data", udp: "no — fire and forget" },
  { k: "Ordered?", tcp: "yes, in order", udp: "no guarantee" },
  { k: "Speed", tcp: "slower, more overhead", udp: "fast, low overhead" },
  { k: "Header", tcp: "20–60 bytes", udp: "8 bytes" },
  { k: "Flow/congestion control", tcp: "built in", udp: "none (app's job)" },
  { k: "Best for", tcp: "web, files, email, APIs", udp: "video, voice, games, DNS" },
];

export function TcpVsUdp() {
  return (
    <figure className="not-prose my-5">
      <div className="overflow-hidden rounded-xl border border-card-border text-sm">
        <div className="grid grid-cols-[1.3fr_1fr_1fr] bg-card font-semibold">
          <span className="px-3 py-2" />
          <span className="border-l border-card-border px-3 py-2 text-accent">TCP</span>
          <span className="border-l border-card-border px-3 py-2 text-accent">UDP</span>
        </div>
        {TCP_UDP_ROWS.map((r) => (
          <div
            key={r.k}
            className="grid grid-cols-[1.3fr_1fr_1fr] border-t border-card-border"
          >
            <span className="px-3 py-2 font-medium text-muted">{r.k}</span>
            <span className="border-l border-card-border px-3 py-2">{r.tcp}</span>
            <span className="border-l border-card-border px-3 py-2">{r.udp}</span>
          </div>
        ))}
      </div>
      <figcaption className="mt-2 text-center text-xs text-muted">
        TCP trades speed for guarantees; UDP trades guarantees for speed.
      </figcaption>
    </figure>
  );
}

const COMPLEXITIES = [
  { o: "O(1)", name: "constant", ex: "hash lookup, array index" },
  { o: "O(log n)", name: "logarithmic", ex: "binary search" },
  { o: "O(n)", name: "linear", ex: "scan the array once" },
  { o: "O(n log n)", name: "linearithmic", ex: "a good sort" },
  { o: "O(n²)", name: "quadratic", ex: "nested loops / all pairs" },
  { o: "O(2ⁿ)", name: "exponential", ex: "try every subset" },
  { o: "O(n!)", name: "factorial", ex: "try every ordering" },
];

export function ComplexityScale() {
  const n = COMPLEXITIES.length;
  return (
    <figure className="not-prose my-5 space-y-1.5">
      {COMPLEXITIES.map((c, i) => {
        const width = 14 + (i * 86) / (n - 1);
        const hue = 130 - (i * 130) / (n - 1);
        return (
          <div key={c.o} className="flex items-center gap-3">
            <span className="w-20 shrink-0 font-mono text-xs">{c.o}</span>
            <span
              className="h-2.5 rounded-full"
              style={{ width: `${width}%`, backgroundColor: `hsl(${hue} 65% 50%)` }}
            />
            <span className="shrink-0 text-xs text-muted">
              {c.name} — {c.ex}
            </span>
          </div>
        );
      })}
      <figcaption className="pt-1 text-xs text-muted">
        Best (green, top) to worst (red, bottom). The bar is how fast the work grows as the
        input grows.
      </figcaption>
    </figure>
  );
}
