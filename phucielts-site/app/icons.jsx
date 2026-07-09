/* ============================================================
   TID — Icons & mascots (inline SVG, brand-matched)
   Exposed on window.TID_ICONS
   ============================================================ */
const { createElement: h } = React;

// ---- Generic stroke icon helper ----
function Ic(props, ...paths) {
  const { size = 22, stroke = "currentColor", sw = 2.2, fill = "none", ...rest } = props || {};
  return h("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none",
    stroke, strokeWidth: sw, strokeLinecap: "round", strokeLinejoin: "round", ...rest },
    ...paths.map((d, i) => typeof d === "string" ? h("path", { key: i, d, fill }) : d));
}

const Icons = {
  bell: (p) => Ic(p, "M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9", "M13.7 21a2 2 0 0 1-3.4 0"),
  book: (p) => Ic(p, "M4 19.5A2.5 2.5 0 0 1 6.5 17H20", "M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"),
  history: (p) => Ic(p, "M3 3v5h5", "M3.05 13A9 9 0 1 0 6 5.3L3 8", "M12 7v5l4 2"),
  headphones: (p) => Ic(p, "M3 14v-2a9 9 0 0 1 18 0v2", "M21 14v3a2 2 0 0 1-2 2h-1v-6h1a2 2 0 0 1 2 2z M3 14v3a2 2 0 0 1 2 2h1v-6H5a2 2 0 0 1-2 2z"),
  lock: (p) => Ic(p, h("rect", { key: "r", x: 5, y: 11, width: 14, height: 10, rx: 2 }), "M8 11V8a4 4 0 0 1 8 0v3"),
  unlock: (p) => Ic(p, h("rect", { key: "r", x: 5, y: 11, width: 14, height: 10, rx: 2 }), "M8 11V8a4 4 0 0 1 7.5-2"),
  play: (p) => Ic(p, h("path", { key: "t", d: "M7 4v16l13-8z", fill: "currentColor", stroke: "none" })),
  pause: (p) => Ic(p, h("rect",{key:"a",x:6,y:5,width:4,height:14,rx:1,fill:"currentColor",stroke:"none"}), h("rect",{key:"b",x:14,y:5,width:4,height:14,rx:1,fill:"currentColor",stroke:"none"})),
  film: (p) => Ic(p, h("rect",{key:"r",x:3,y:4,width:18,height:16,rx:2}), "M7 4v16 M17 4v16 M3 9h4 M17 9h4 M3 15h4 M17 15h4"),
  pdf: (p) => Ic(p, "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z", "M14 2v6h6"),
  quiz: (p) => Ic(p, h("rect",{key:"r",x:3,y:3,width:18,height:18,rx:3}), "M8 12l3 3 5-6"),
  doc: (p) => Ic(p, "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z", "M14 2v6h6 M9 13h6 M9 17h6 M9 9h1"),
  chevR: (p) => Ic(p, "M9 18l6-6-6-6"),
  chevL: (p) => Ic(p, "M15 18l-6-6 6-6"),
  arrowR: (p) => Ic(p, "M5 12h14 M13 6l6 6-6 6"),
  check: (p) => Ic(p, "M20 6L9 17l-5-5"),
  x: (p) => Ic(p, "M18 6L6 18 M6 6l12 12"),
  clock: (p) => Ic(p, h("circle",{key:"c",cx:12,cy:12,r:9}), "M12 7v5l3 2"),
  wifi: (p) => Ic(p, "M5 12.55a11 11 0 0 1 14 0 M8.5 16.1a6 6 0 0 1 7 0 M2 8.8a16 16 0 0 1 20 0", h("circle",{key:"c",cx:12,cy:20,r:1,fill:"currentColor",stroke:"none"})),
  menu: (p) => Ic(p, "M3 12h18 M3 6h18 M3 18h18"),
  user: (p) => Ic(p, h("circle",{key:"c",cx:12,cy:8,r:4}), "M4 21a8 8 0 0 1 16 0"),
  send: (p) => Ic(p, "M22 2L11 13 M22 2l-7 20-4-9-9-4 20-7z"),
  copy: (p) => Ic(p, h("rect",{key:"r",x:9,y:9,width:12,height:12,rx:2}), "M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"),
  flag: (p) => Ic(p, "M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z M4 22v-7"),
  sparkle: (p) => Ic(p, h("path",{key:"s",d:"M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z",fill:"currentColor",stroke:"none"})),
  externalLink: (p) => Ic(p, "M15 3h6v6 M10 14L21 3 M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"),
  thread: (p) => Ic(p, h("circle",{key:"c",cx:12,cy:12,r:9}), "M8.5 13.5c1.5 2 5.5 2.2 6.8-.3.9-1.7-.2-3.7-2.3-3.7-2.6 0-3.4 3.6.4 4"),
};

// ---- The sun mascot (hero centrepiece) ----
function SunMascot({ size = 460 }) {
  const rays = [];
  const N = 22, R = 168, r1 = 168, r2 = 198;
  for (let i = 0; i < N; i++) {
    const a0 = (i / N) * Math.PI * 2;
    const a1 = ((i + 0.5) / N) * Math.PI * 2;
    const a2 = ((i + 1) / N) * Math.PI * 2;
    const cx = 230, cy = 230;
    const p = (a, rad) => [cx + Math.cos(a) * rad, cy + Math.sin(a) * rad];
    const [x0, y0] = p(a0, r1);
    const [xt, yt] = p(a1, r2);
    const [x2, y2] = p(a2, r1);
    rays.push(`M${x0.toFixed(1)} ${y0.toFixed(1)} L${xt.toFixed(1)} ${yt.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)} Z`);
  }
  return h("svg", { viewBox: "0 0 460 460", width: size, height: size, style: { display: "block", maxWidth: "100%" } },
    h("g", null,
      ...rays.map((d, i) => h("path", { key: i, d, fill: "var(--tid-orange)", stroke: "var(--ink)", strokeWidth: 4, strokeLinejoin: "round" })),
      h("circle", { cx: 230, cy: 230, r: 172, fill: "var(--tid-orange)", stroke: "var(--ink)", strokeWidth: 5 }),
      h("circle", { cx: 230, cy: 230, r: 158, fill: "none", stroke: "var(--tid-cream)", strokeWidth: 7 }),
      // face
      h("circle", { cx: 196, cy: 212, r: 15, fill: "var(--ink)" }),
      h("circle", { cx: 268, cy: 212, r: 15, fill: "var(--ink)" }),
      h("path", { d: "M192 266 q38 40 78 0", fill: "none", stroke: "var(--ink)", strokeWidth: 9, strokeLinecap: "round" }),
    ));
}

// ---- Course creature card mascot (eyes peeking over a hill) ----
function Creature({ color, deep }) {
  return h("svg", { viewBox: "0 0 200 120", width: "100%", height: "100%", preserveAspectRatio: "xMidYMax meet", style: { display: "block" } },
    h("ellipse", { cx: 100, cy: 150, rx: 120, ry: 70, fill: deep }),
    h("ellipse", { cx: 100, cy: 158, rx: 95, ry: 60, fill: color }),
    // eyes
    h("g", null,
      h("ellipse", { cx: 78, cy: 92, rx: 17, ry: 19, fill: "#fff" }),
      h("ellipse", { cx: 122, cy: 92, rx: 17, ry: 19, fill: "#fff" }),
      h("circle", { cx: 82, cy: 96, r: 7.5, fill: "var(--ink)" }),
      h("circle", { cx: 118, cy: 96, r: 7.5, fill: "var(--ink)" }),
    ));
}

window.TID_ICONS = { Icons, SunMascot, Creature };
