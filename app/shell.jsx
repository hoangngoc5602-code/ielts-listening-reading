/* ============================================================
   TID — shared shell: Logo, TopNav, page chrome
   THEME: Calm Academy. Only styling changed — logic intact.
   Exposed on window.TID_SHELL
   ============================================================ */
const { Icons: I_, } = window.TID_ICONS;
const { go: goS, useStore: useStoreSh } = window.TID_STORE;

function LogoMark({ size = 46, flat }) {
  // "Phúc IELTS" brand mark — a soft squircle badge with a geometric P + gold accent dot
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" style={{ display: "block", flex: "none" }}>
      <rect x="2" y="2" width="44" height="44" rx="15"
        fill={flat ? "#ffffff" : "var(--tid-green)"} />
      {/* P glyph */}
      <path d="M16 11h11.5a8.5 8.5 0 0 1 0 17H22v9h-6z"
        fill={flat ? "var(--tid-green)" : "#ffffff"} />
      <circle cx="22" cy="19.5" r="3.4" fill={flat ? "#ffffff" : "var(--tid-green)"} />
      {/* accent dot */}
      <circle cx="34.5" cy="34.5" r="3.8" fill="var(--tid-orange)" />
    </svg>
  );
}

function Logo({ small, light, flat }) {
  const markSize = small ? 32 : 46;
  const textSize = small ? 19 : 23;
  return (
    <div className="row" style={{ gap: small ? 9 : 12 }}>
      <LogoMark size={markSize} flat={flat} />
      <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: textSize, color: light ? "#fff" : "var(--ink)", letterSpacing: "-.02em", whiteSpace: "nowrap", lineHeight: 1 }}>
        Phúc<span style={{ fontWeight: 500, letterSpacing: ".02em", marginLeft: small ? 4 : 6, opacity: .82 }}>IELTS</span>
      </span>
    </div>
  );
}

function Avatar({ name, size = 40 }) {
  const initials = (name || "?").trim().split(/\s+/).slice(-2).map((w) => w[0]).join("").toUpperCase() || "?";
  const hue = [...(name || "x")].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <div style={{
      width: size, height: size, borderRadius: "32%", flex: "none",
      background: `hsl(${hue} 42% 52%)`, color: "#fff",
      boxShadow: "inset 0 0 0 2px rgba(255,255,255,.55), 0 3px 8px rgba(20,52,44,.18)",
      display: "grid", placeItems: "center",
      fontWeight: 700, fontSize: size * 0.38, fontFamily: "var(--font-display)", letterSpacing: "-.01em",
    }}>{initials}</div>
  );
}

/* Top nav for content pages (warm translucent, dark text) */
function TopNav({ onHome, accent = "var(--ink)" }) {
  const s = useStoreSh();
  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 40, background: "rgba(247,243,233,.82)",
      backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderBottom: "1px solid var(--line)",
    }}>
      <div className="wrap row" style={{ height: "var(--nav-h)", justifyContent: "space-between", gap: 16 }}>
        <button onClick={() => goS("/")} style={{ background: "none", border: "none", padding: 0 }} aria-label="Trang chủ">
          <Logo small />
        </button>
        <div className="row" style={{ gap: 10 }}>
          <div className="row" style={{ gap: 9, padding: "5px 12px 5px 5px", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 999, boxShadow: "var(--shadow-card-sm)", flex: "none" }}>
            <Avatar name={s.name || "Học viên"} size={28} />
            <div style={{ lineHeight: 1.15 }}>
              <div style={{ fontWeight: 700, fontSize: 14, whiteSpace: "nowrap" }}>{s.name || "Học viên"}</div>
              <div className="row" style={{ gap: 5, fontSize: 11, fontWeight: 700, color: "var(--ok)", letterSpacing: ".04em" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--ok)" }}></span>ONLINE
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function NavChip({ icon, label }) {
  return (
    <button className="row" style={{
      gap: 7, padding: "9px 15px", borderRadius: 999, fontWeight: 700, fontSize: 14,
      border: "1px solid var(--line-strong)", background: "#fff", color: "var(--ink)",
      whiteSpace: "nowrap", flex: "none",
    }}>{icon}{label}</button>
  );
}

/* Breadcrumb */
function Crumbs({ items }) {
  return (
    <nav className="row" style={{ gap: 8, flexWrap: "wrap", fontWeight: 600, fontSize: 14, color: "var(--muted)" }}>
      {items.map((it, i) => (
        <span key={i} className="row" style={{ gap: 8 }}>
          {i > 0 && <I_.chevR size={15} style={{ color: "var(--muted-2)" }} />}
          {it.to
            ? <button onClick={() => goS(it.to)} style={{ background: "none", border: "none", padding: 0, color: "var(--muted)", fontWeight: 600, fontSize: 14 }} onMouseEnter={(e)=>e.currentTarget.style.color="var(--ink)"} onMouseLeave={(e)=>e.currentTarget.style.color="var(--muted)"}>{it.label}</button>
            : <span style={{ color: "var(--ink)", fontWeight: 700 }}>{it.label}</span>}
        </span>
      ))}
    </nav>
  );
}

window.TID_SHELL = { Logo, LogoMark, Avatar, TopNav, NavChip, Crumbs };
