// Reusable, theme-aware figures for notes. Plain (server-renderable) components
// passed into MDX via the `components` map. Use sparingly — one good visual beats
// a wall of text.

// Collapsible hint / approach drop-down for practice problems.
export function Hint({
  title = "Hint",
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <details className="my-2 rounded-lg border border-card-border bg-card/40 px-4 py-2">
      <summary className="cursor-pointer select-none font-medium text-accent marker:text-muted">
        {title}
      </summary>
      <div className="mt-1 text-[0.95em]">{children}</div>
    </details>
  );
}

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

const TCPIP_LAYERS = [
  { n: 4, name: "Application", note: "apps & their protocols — HTTP, DNS, SMTP, SSH", pdu: "Data", osi: "OSI 5–7" },
  { n: 3, name: "Transport", note: "end-to-end delivery, ports — TCP, UDP", pdu: "Segment", osi: "OSI 4" },
  { n: 2, name: "Internet", note: "addressing & routing between networks — IP, ICMP", pdu: "Packet", osi: "OSI 3" },
  { n: 1, name: "Network Access", note: "the local link & physical media — Ethernet, Wi-Fi", pdu: "Frame", osi: "OSI 1–2" },
];

export function TcpIpStack() {
  return (
    <figure className="not-prose my-5">
      <div className="overflow-hidden rounded-xl border border-card-border">
        {TCPIP_LAYERS.map((l) => (
          <div
            key={l.n}
            className={`flex items-center gap-3 px-3 py-2 ${l.n === 4 ? "" : "border-t border-card-border"}`}
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent/15 text-sm font-semibold text-accent">
              {l.n}
            </span>
            <span className="w-32 shrink-0 font-medium">{l.name}</span>
            <span className="hidden flex-1 text-sm text-muted sm:block">{l.note}</span>
            <span className="hidden shrink-0 rounded bg-card px-2 py-0.5 text-xs text-muted md:inline">
              {l.osi}
            </span>
            <span className="ml-auto shrink-0 rounded bg-card px-2 py-0.5 text-xs text-muted sm:ml-0">
              {l.pdu}
            </span>
          </div>
        ))}
      </div>
      <figcaption className="mt-2 text-center text-xs text-muted">
        TCP/IP's 4 layers, top (apps) to bottom (the wire) — and the OSI layers each one covers.
      </figcaption>
    </figure>
  );
}

const CARD = { fill: "var(--card)", stroke: "var(--border)" } as const;
const FG = { fill: "var(--foreground)" } as const;
const MUTED = { fill: "var(--muted)" } as const;
const ACCENT = { fill: "var(--accent)" } as const;
const ACCENT_STROKE = { stroke: "var(--accent)" } as const;
const BORDER_STROKE = { stroke: "var(--border)" } as const;

export function DnsResolution() {
  return (
    <figure className="not-prose my-5">
      <svg viewBox="0 0 680 300" className="w-full" role="img" aria-label="DNS resolution flow from your computer through the resolver to root, TLD and authoritative servers">
        <defs>
          <marker id="dns-arrow" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" style={ACCENT} />
          </marker>
        </defs>
        <rect x="16" y="125" width="120" height="50" rx="8" style={CARD} strokeWidth={1.5} />
        <text x="76" y="155" textAnchor="middle" fontSize="13" fontWeight="600" style={FG}>You</text>
        <rect x="210" y="125" width="150" height="50" rx="8" style={CARD} strokeWidth={1.5} />
        <text x="285" y="150" textAnchor="middle" fontSize="13" fontWeight="600" style={FG}>Resolver</text>
        <text x="285" y="166" textAnchor="middle" fontSize="10" style={MUTED}>(e.g. 8.8.8.8)</text>
        <rect x="520" y="14" width="150" height="44" rx="8" style={CARD} strokeWidth={1.5} />
        <text x="595" y="40" textAnchor="middle" fontSize="12" style={FG}>Root server</text>
        <rect x="520" y="128" width="150" height="44" rx="8" style={CARD} strokeWidth={1.5} />
        <text x="595" y="154" textAnchor="middle" fontSize="12" style={FG}>.com TLD server</text>
        <rect x="520" y="242" width="150" height="44" rx="8" style={CARD} strokeWidth={1.5} />
        <text x="595" y="268" textAnchor="middle" fontSize="12" style={FG}>Authoritative</text>
        <line x1="136" y1="143" x2="206" y2="143" style={ACCENT_STROKE} strokeWidth={2} markerEnd="url(#dns-arrow)" />
        <text x="171" y="137" textAnchor="middle" fontSize="11" style={MUTED}>1</text>
        <line x1="210" y1="162" x2="140" y2="162" style={ACCENT_STROKE} strokeWidth={2} markerEnd="url(#dns-arrow)" />
        <text x="171" y="176" textAnchor="middle" fontSize="11" style={MUTED}>8</text>
        <line x1="362" y1="140" x2="516" y2="44" style={ACCENT_STROKE} strokeWidth={2} markerEnd="url(#dns-arrow)" />
        <text x="430" y="84" textAnchor="middle" fontSize="11" style={MUTED}>2</text>
        <line x1="516" y1="54" x2="362" y2="150" style={ACCENT_STROKE} strokeWidth={2} markerEnd="url(#dns-arrow)" />
        <text x="455" y="112" textAnchor="middle" fontSize="11" style={MUTED}>3</text>
        <line x1="362" y1="150" x2="516" y2="150" style={ACCENT_STROKE} strokeWidth={2} markerEnd="url(#dns-arrow)" />
        <text x="440" y="144" textAnchor="middle" fontSize="11" style={MUTED}>4</text>
        <line x1="516" y1="164" x2="362" y2="164" style={ACCENT_STROKE} strokeWidth={2} markerEnd="url(#dns-arrow)" />
        <text x="440" y="178" textAnchor="middle" fontSize="11" style={MUTED}>5</text>
        <line x1="362" y1="162" x2="516" y2="256" style={ACCENT_STROKE} strokeWidth={2} markerEnd="url(#dns-arrow)" />
        <text x="430" y="222" textAnchor="middle" fontSize="11" style={MUTED}>6</text>
        <line x1="516" y1="266" x2="362" y2="172" style={ACCENT_STROKE} strokeWidth={2} markerEnd="url(#dns-arrow)" />
        <text x="455" y="244" textAnchor="middle" fontSize="11" style={MUTED}>7</text>
      </svg>
      <div className="mt-1 grid gap-x-6 gap-y-0.5 text-xs text-muted sm:grid-cols-2">
        <span>1. You ask the resolver for the name.</span>
        <span>2–3. Resolver asks a root server → "try .com".</span>
        <span>4–5. Resolver asks .com → "try example.com's NS".</span>
        <span>6–7. Resolver asks the authoritative server → the IP.</span>
        <span>8. Resolver caches it and hands the IP back to you.</span>
      </div>
      <figcaption className="mt-1 text-center text-xs text-muted">
        How a DNS name becomes an IP address.
      </figcaption>
    </figure>
  );
}

const FLOW_LAYERS = ["Application", "Transport", "Internet", "Network Access"];
const FLOW_Y = [44, 104, 164, 224];

export function DataFlow() {
  return (
    <figure className="not-prose my-5">
      <svg viewBox="0 0 640 330" className="w-full" role="img" aria-label="Data moving down the sender's stack, across the wire, and up the receiver's stack">
        <defs>
          <marker id="flow-arrow" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" style={ACCENT} />
          </marker>
        </defs>
        <text x="180" y="28" textAnchor="middle" fontSize="12" fontWeight="700" style={FG}>Sender</text>
        <text x="460" y="28" textAnchor="middle" fontSize="12" fontWeight="700" style={FG}>Receiver</text>
        {FLOW_LAYERS.map((name, i) => (
          <g key={name}>
            <rect x="110" y={FLOW_Y[i]} width="140" height="46" rx="8" style={CARD} strokeWidth={1.5} />
            <text x="180" y={FLOW_Y[i] + 28} textAnchor="middle" fontSize="12" style={FG}>{name}</text>
            <rect x="390" y={FLOW_Y[i]} width="140" height="46" rx="8" style={CARD} strokeWidth={1.5} />
            <text x="460" y={FLOW_Y[i] + 28} textAnchor="middle" fontSize="12" style={FG}>{name}</text>
          </g>
        ))}
        <line x1="90" y1="50" x2="90" y2="262" style={ACCENT_STROKE} strokeWidth={2} markerEnd="url(#flow-arrow)" />
        <text x="78" y="158" textAnchor="middle" fontSize="11" style={ACCENT} transform="rotate(-90 78 158)">encapsulate (add headers)</text>
        <line x1="550" y1="262" x2="550" y2="50" style={ACCENT_STROKE} strokeWidth={2} markerEnd="url(#flow-arrow)" />
        <text x="562" y="158" textAnchor="middle" fontSize="11" style={ACCENT} transform="rotate(90 562 158)">decapsulate (strip headers)</text>
        <path d="M180,270 L180,302 L460,302 L460,272" fill="none" style={ACCENT_STROKE} strokeWidth={2} markerEnd="url(#flow-arrow)" />
        <text x="320" y="320" textAnchor="middle" fontSize="11" style={MUTED}>bits over the wire</text>
      </svg>
      <figcaption className="mt-1 text-center text-xs text-muted">
        Sending: data goes <em>down</em> the stack, each layer adding its header. Receiving: it
        goes back <em>up</em>, each layer stripping its header off.
      </figcaption>
    </figure>
  );
}

export function HandshakeDiagram() {
  return (
    <figure className="not-prose my-5">
      <svg viewBox="0 0 600 290" className="w-full" role="img" aria-label="TCP three-way handshake: SYN, SYN-ACK, ACK between client and server">
        <defs>
          <marker id="hs-arrow" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" style={ACCENT} />
          </marker>
        </defs>
        <text x="110" y="28" textAnchor="middle" fontSize="13" fontWeight="700" style={FG}>Client</text>
        <text x="490" y="28" textAnchor="middle" fontSize="13" fontWeight="700" style={FG}>Server</text>
        <line x1="110" y1="42" x2="110" y2="252" style={BORDER_STROKE} strokeWidth={2} />
        <line x1="490" y1="42" x2="490" y2="252" style={BORDER_STROKE} strokeWidth={2} />
        <line x1="112" y1="78" x2="488" y2="108" style={ACCENT_STROKE} strokeWidth={2} markerEnd="url(#hs-arrow)" />
        <text x="300" y="84" textAnchor="middle" fontSize="12" style={FG}>SYN — seq = x</text>
        <line x1="488" y1="140" x2="112" y2="170" style={ACCENT_STROKE} strokeWidth={2} markerEnd="url(#hs-arrow)" />
        <text x="300" y="146" textAnchor="middle" fontSize="12" style={FG}>SYN, ACK — seq = y, ack = x+1</text>
        <line x1="112" y1="202" x2="488" y2="232" style={ACCENT_STROKE} strokeWidth={2} markerEnd="url(#hs-arrow)" />
        <text x="300" y="208" textAnchor="middle" fontSize="12" style={FG}>ACK — ack = y+1</text>
        <text x="300" y="274" textAnchor="middle" fontSize="11" fontWeight="600" style={ACCENT}>connection established — data can flow</text>
      </svg>
      <figcaption className="mt-1 text-center text-xs text-muted">
        TCP's 3-way handshake: both sides agree on starting sequence numbers before any data.
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
