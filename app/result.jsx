/* ============================================================
   IELTS Reading & Listening — Homework result page (self-check + shareable)
   Route: #/r/<payload>  where payload = encodeResult({v,c,w,k,n,e,a,t})
   The link is self-contained: it carries the student's answers; the page
   grades them client-side against the answer key embedded in data.jsx and
   shows correct/incorrect + the teacher's step-by-step explanation.
   Exposed on window.TID_RESULT
   ============================================================ */
const { useState: useStateR, useMemo: useMemoR, useRef: useRefR, useEffect: useEffectR } = React;
const { Icons: IR } = window.TID_ICONS;
const { Logo: LogoR, Avatar: AvatarR } = window.TID_SHELL;
const { decodeResult: decodeResultR, go: goR } = window.TID_STORE;
const { gradeTest: gradeTestR, RenderGroup: RenderGroupR, tTheme: tThemeR, ReviewCtx: ReviewCtxR } = window.TID_QUESTIONS;
const NOOP = () => {};

// Academic Reading raw(/40) → approximate band (reference only).
function bandFor(score, total) {
  if (total !== 40) return null;
  const t = [[39, 9], [37, 8.5], [35, 8], [33, 7.5], [30, 7], [27, 6.5], [23, 6], [19, 5.5], [15, 5], [13, 4.5], [10, 4], [8, 3.5], [6, 3], [4, 2.5]];
  for (const [min, band] of t) if (score >= min) return band;
  return 2;
}

function fmtTime(sec) {
  sec = Math.max(0, parseInt(sec, 10) || 0);
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${m}m ${String(s).padStart(2, "0")}s`;
}

/* ——— Owl mascot — replaces sun to avoid brand duplication ——— */
function OwlMascot({ size = 340 }) {
  return (
    <svg width={size} height={size * 1.05} viewBox="0 0 340 357" style={{ display: "block", overflow: "visible" }}>
      {/* Body */}
      <ellipse cx="170" cy="228" rx="90" ry="88" fill="#7BB8D4" />
      {/* Chest */}
      <ellipse cx="170" cy="248" rx="60" ry="65" fill="#C8E8F8" />
      {/* Chest feather pattern */}
      <ellipse cx="170" cy="224" rx="42" ry="34" fill="#B0D8EE" opacity="0.6" />
      {/* Head */}
      <circle cx="170" cy="128" r="88" fill="#7BB8D4" />
      {/* Ear tufts */}
      <polygon points="108,55 120,16 138,68" fill="#5A9AB8" />
      <polygon points="232,55 220,16 202,68" fill="#5A9AB8" />
      {/* Face disc */}
      <ellipse cx="170" cy="138" rx="64" ry="60" fill="#C8E8F8" />
      {/* Eyes — left */}
      <circle cx="142" cy="124" r="30" fill="white" />
      <circle cx="142" cy="124" r="30" fill="none" stroke="#F0C030" strokeWidth="5" />
      <circle cx="142" cy="128" r="19" fill="#1a1a1a" />
      <circle cx="134" cy="118" r="7.5" fill="white" />
      {/* Eyes — right */}
      <circle cx="198" cy="124" r="30" fill="white" />
      <circle cx="198" cy="124" r="30" fill="none" stroke="#F0C030" strokeWidth="5" />
      <circle cx="198" cy="128" r="19" fill="#1a1a1a" />
      <circle cx="190" cy="118" r="7.5" fill="white" />
      {/* Beak */}
      <polygon points="170,162 157,183 183,183" fill="#F0C030" />
      {/* Wings */}
      <ellipse cx="96" cy="240" rx="38" ry="76" fill="#5A9AB8" transform="rotate(-10 96 240)" />
      <ellipse cx="244" cy="240" rx="38" ry="76" fill="#5A9AB8" transform="rotate(10 244 240)" />
      {/* Wing feather lines */}
      <path d="M75 215 Q100 200 96 228" stroke="#4A8AA8" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M77 238 Q102 222 99 250" stroke="#4A8AA8" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M265 215 Q240 200 244 228" stroke="#4A8AA8" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M263 238 Q238 222 241 250" stroke="#4A8AA8" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Graduation cap */}
      <rect x="110" y="48" width="120" height="18" rx="4" fill="#1a2a1a" />
      <polygon points="170,22 242,54 170,68 98,54" fill="#1a2a1a" />
      {/* Cap tassel */}
      <line x1="242" y1="54" x2="248" y2="82" stroke="#F0C030" strokeWidth="3" />
      <circle cx="248" cy="85" r="5" fill="#F0C030" />
    </svg>
  );
}

/* ——— Summary view — shown right after HW submission before detailed results ——— */
function SummaryView({ graded, courseName, elapsed, data, onViewDetail }) {
  const { score, total } = graded;
  const correct = score;
  const wrong = graded.graded - score;
  const blanks = total - graded.graded;
  const band = bandFor(score, total);

  const stats = [
    { sym: "✓", color: "#52C87B", bg: "#1a3322", label: "CÂU ĐÚNG",   value: correct, sub: total ? (correct / total * 100).toFixed(1) + "%" : "—" },
    { sym: "—", color: "#F0B429", bg: "#352a0a", label: "CÂU BỎ QUA", value: blanks,  sub: total ? (blanks  / total * 100).toFixed(1) + "%" : "—" },
    { sym: "✕", color: "#E05C5C", bg: "#361414", label: "CÂU SAI",    value: wrong,   sub: total ? (wrong   / total * 100).toFixed(1) + "%" : "—" },
    { sym: "☆", color: "#5B9AE0", bg: "#142034", label: "BAND IELTS", value: band != null ? band : "—", sub: "Điểm số" },
  ];

  return (
    <div className="gridpaper" style={{
      minHeight: "100vh", boxSizing: "border-box",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "48px 24px",
    }}>
      {/* ── Centered container (everything lives inside this fixed width) ── */}
      <div style={{ position: "relative", width: "100%", maxWidth: 660 }}>

        {/* Owl mascot — top-right, dips into the card's top edge (in front of it) */}
        <div style={{ position: "absolute", top: -28, right: -64, zIndex: 2, pointerEvents: "none" }}>
          <OwlMascot size={300} />
        </div>

        {/* Title block */}
        <div style={{ position: "relative", zIndex: 1, paddingRight: 200 }}>
          <div style={{
            fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18,
            color: "rgba(255,255,255,.78)", letterSpacing: ".14em",
            textTransform: "uppercase",
          }}>KẾT QUẢ BÀI</div>
          <div style={{
            fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 92,
            lineHeight: .95, textTransform: "uppercase",
            letterSpacing: "-.02em", margin: "2px 0 16px",
            backgroundImage: "linear-gradient(168deg, #ffffff 58%, #c2cfae 100%)",
            WebkitBackgroundClip: "text", backgroundClip: "text",
            WebkitTextFillColor: "transparent", color: "transparent",
            filter: "drop-shadow(0 3px 0 rgba(24,26,38,.18))",
          }}>{courseName}</div>
          <p style={{
            color: "rgba(255,255,255,.66)", fontSize: 15, lineHeight: 1.6,
            fontWeight: 600, margin: "0 0 14px", maxWidth: 360,
          }}>
            Dưới đây là tổng kết kết quả làm bài của bạn. Cố gắng hơn nữa ở những lần tiếp theo nha!
          </p>
          <div style={{ fontWeight: 700, fontSize: 15, color: "rgba(255,255,255,.9)" }}>
            Thời gian làm bài:{" "}
            <span style={{ color: "#ffd76a", fontWeight: 800 }}>{fmtTime(elapsed)}</span>
          </div>
        </div>

        {/* Stats card — olive frosted panel, container width (not full screen) */}
        <div style={{
          position: "relative", zIndex: 1, marginTop: 22,
          background: "rgba(22,30,14,.42)", backdropFilter: "blur(5px)",
          border: "1px solid rgba(255,255,255,.10)",
          borderRadius: 28, padding: "30px 18px 28px",
          display: "flex", gap: 2,
          boxShadow: "0 22px 50px rgba(20,26,12,.35)",
        }}>
          {stats.map((s, i) => (
            <div key={i} style={{
              flex: 1, textAlign: "center",
              borderLeft: i === 0 ? "none" : "1px solid rgba(255,255,255,.07)",
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: "50%",
                background: `${s.color}1f`, border: `1.6px solid ${s.color}80`,
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 12px",
                color: s.color, fontSize: 20, fontWeight: 900,
                fontFamily: "var(--font-display)",
              }}>{s.sym}</div>
              <div style={{
                fontFamily: "var(--font-display)", fontWeight: 900,
                fontSize: 62, color: "white", lineHeight: 1, marginBottom: 8,
              }}>{s.value}</div>
              <div style={{
                fontSize: 9.5, fontWeight: 800, letterSpacing: ".08em",
                color: "rgba(255,255,255,.45)", textTransform: "uppercase", marginBottom: 5,
              }}>{s.label}</div>
              <div style={{ fontSize: 12, fontWeight: 800, color: s.color }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Buttons — brand sticker treatment (ink border + hard shadow + hover) */}
        <div style={{ display: "flex", gap: 14, marginTop: 20, position: "relative", zIndex: 1 }}>
          <button className="btn btn-sticker" onClick={() => goR(`/c/${data.c}/w/${data.w}/${data.k}/do`)}
            style={{ flex: 1, padding: "16px 20px", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, letterSpacing: ".02em" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" />
            </svg>
            LÀM LẠI BÀI
          </button>
          <button className="btn btn-ink" onClick={onViewDetail}
            style={{ flex: 1, padding: "16px 20px", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, letterSpacing: ".02em", boxShadow: "0 12px 24px rgba(24,26,38,.28)" }}>
            XEM BÀI GIẢI CHI TIẾT
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/* Format the teacher's explanation (keeps "Bước N:" structure, bolds the labels). */
function Explanation({ text }) {
  const lines = String(text).split(/\n+/).map((l) => l.trim()).filter(Boolean)
    .filter((l) => !/^câu\s*\d+\s*[-–]/i.test(l) && !/^\[.*\]\s*[-–]\s*giải thích/i.test(l));
  return (
    <div style={{ marginTop: 12, padding: "13px 15px", background: "var(--reading-tint)", border: "2px solid var(--line-strong)", borderRadius: 12, display: "grid", gap: 7 }}>
      <div className="row" style={{ gap: 7, fontWeight: 800, fontSize: 12.5, color: "var(--reading-deep)", letterSpacing: ".05em", textTransform: "uppercase" }}>
        <IR.sparkle size={14} /> Lời giải
      </div>
      {lines.map((l, i) => {
        const m = l.match(/^(Bước\s*\d+\s*:|Đáp án\s*:)/i);
        return (
          <div key={i} style={{ fontSize: 14.5, lineHeight: 1.6, color: "var(--ink-soft)", fontWeight: 400 }}>
            {m ? <><b style={{ color: "var(--ink)" }}>{m[0]}</b>{l.slice(m[0].length)}</> : l}
          </div>
        );
      })}
    </div>
  );
}

/* ——— Evidence in passage — locate the sentence that justifies an answer ———
   For completion questions the answer text appears verbatim in the passage, so
   we find it and expand to its surrounding sentence. `needle` may also be an
   explicit evidence string authored on test.evidence[n]. */
function resolveEvidence(passage, needle) {
  if (!passage || !passage.paras || !needle) return null;
  const n = String(needle).trim().toLowerCase();
  if (n.length < 2) return null;
  for (let pi = 0; pi < passage.paras.length; pi++) {
    const para = passage.paras[pi];
    if (para.subhead) continue;
    const text = para.text || "";
    const idx = text.toLowerCase().indexOf(n);
    if (idx === -1) continue;
    // expand left to the start of the sentence
    let start = 0;
    const before = text.slice(0, idx);
    const bm = before.match(/[.!?]["”’)]?\s+\S*$/);
    if (bm) start = bm.index + bm[0].match(/[.!?]["”’)]?\s+/)[0].length;
    // expand right to the end of the sentence
    let end = idx + n.length;
    const rest = text.slice(end);
    const em = rest.search(/[.!?]/);
    end = em === -1 ? text.length : end + em + 1;
    return { paraIdx: pi, sentence: text.slice(start, end).trim() };
  }
  return null;
}

/* Render a paragraph with one or more evidence sentences highlighted green. */
function renderHighlighted(text, marks, activeN, regHl) {
  const found = marks
    .map((m) => { const i = text.toLowerCase().indexOf(String(m.sentence).toLowerCase()); return i === -1 ? null : { ...m, idx: i, end: i + m.sentence.length }; })
    .filter(Boolean)
    .sort((a, b) => a.idx - b.idx);
  const clean = []; let lastEnd = -1;
  found.forEach((f) => { if (f.idx >= lastEnd) { clean.push(f); lastEnd = f.end; } });
  if (!clean.length) return text;
  const nodes = []; let cur = 0;
  clean.forEach((f, k) => {
    if (f.idx > cur) nodes.push(<React.Fragment key={"t" + k}>{text.slice(cur, f.idx)}</React.Fragment>);
    const active = f.n === activeN;
    nodes.push(
      <span key={"h" + k} ref={(el) => regHl && regHl(f.n, el)} style={{
        background: active ? "#9fe3b0" : "#d2ecd8", color: "var(--ink)",
        borderRadius: 3, boxShadow: active ? "0 0 0 2px #9fe3b0" : "none",
        transition: "background .2s ease",
      }}>{text.slice(f.idx, f.end)}</span>
    );
    cur = f.end;
  });
  if (cur < text.length) nodes.push(<React.Fragment key="te">{text.slice(cur)}</React.Fragment>);
  return nodes;
}

/* Left column — the passage with evidence sentences highlighted. */
function ReviewPassage({ passage, marks, activeN, regHl }) {
  if (!passage) return null;
  const byPara = {};
  marks.forEach((m) => { (byPara[m.paraIdx] = byPara[m.paraIdx] || []).push(m); });
  return (
    <article style={{ maxWidth: 700 }}>
      <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 23, margin: "0 0 16px", lineHeight: 1.25 }}>{passage.title}</h2>
      <div style={{ fontFamily: "var(--font-read)", fontWeight: 400, fontSize: 16.5, lineHeight: 1.85, color: "var(--ink)" }}>
        {passage.paras.map((p, i) => {
          if (p.subhead) return <h3 key={i} style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18, margin: "22px 0 10px", lineHeight: 1.3 }}>{p.text}</h3>;
          const tag = p.tag ? <b style={{ fontFamily: "var(--font-display)", marginRight: 7 }}>{p.tag}</b> : null;
          const m = byPara[i];
          return <p key={i} style={{ margin: "0 0 16px" }}>{tag}{m && m.length ? renderHighlighted(p.text, m, activeN, regHl) : p.text}</p>;
        })}
      </div>
    </article>
  );
}

/* One explanation card in the right column (YouPass "Bước" style). */
function ExplainCard({ item, hasEvi, onEvidence, active }) {
  const tone = active ? "var(--reading)" : item.correct ? "var(--ok)" : item.blank ? "var(--muted-2)" : "var(--danger)";
  return (
    <div className="sticker-sm" style={{ background: "#fff", border: "1.5px solid var(--line-strong)", boxShadow: "var(--shadow-card-sm)", padding: "13px 15px", borderLeft: `7px solid ${tone}` }}>
      <div className="row" style={{ gap: 10, justifyContent: "space-between", flexWrap: "wrap", marginBottom: 2 }}>
        <div className="row" style={{ gap: 9 }}>
          <span style={{ width: 27, height: 27, borderRadius: 8, background: item.correct ? "#e7f7ee" : item.blank ? "#f1f0ea" : "#fdeceb", border: `2.5px solid ${item.correct ? "var(--ok)" : item.blank ? "var(--muted-2)" : "var(--danger)"}`, color: item.correct ? "var(--ok)" : item.blank ? "var(--muted-2)" : "var(--danger)", display: "grid", placeItems: "center", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 13 }}>{item.n}</span>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15 }}>Câu {item.n} — Giải thích đáp án</div>
        </div>
        {hasEvi && (
          <button onClick={onEvidence} className="row" style={{ gap: 6, padding: "5px 12px", borderRadius: 999, border: "2px solid var(--reading)", background: "var(--reading-tint)", color: "var(--reading-deep)", fontWeight: 800, fontSize: 12.5 }}>📍 Xem trong bài</button>
        )}
      </div>
      <Explanation text={item.explain} />
    </div>
  );
}

/* Full two-column exam-style review: passage (left) + questions & explanations
   (right), with evidence highlighting and a bottom question navigator. */
function ExamReview({ data, test, graded, course, evidenceMap, copied, onCopy, onSummary }) {
  const th = tThemeR(false, "var(--reading)", "var(--reading-deep)", "var(--reading-tint)");
  const [activePart, setActivePart] = useStateR(0);
  const [activeN, setActiveN] = useStateR(null);
  const refMap = useRefR({});
  const paneRef = useRefR(null);

  const parts = test.parts || [];
  const pi = Math.min(activePart, parts.length - 1);
  const part = parts[pi];
  const gp = graded.parts[pi];
  const partAnswers = (data.a && data.a[String(pi + 1)]) || {};
  const { score, total } = graded;

  const byN = {};
  gp.items.forEach((it) => { byN[it.n] = { correct: it.correct, blank: it.blank, studentAns: it.studentAns, correctAns: it.correctAns }; });

  const marks = [];
  gp.items.forEach((it) => { const e = evidenceMap[it.n]; if (e && e.partIdx === pi) marks.push({ n: it.n, paraIdx: e.paraIdx, sentence: e.sentence }); });

  const regRef = (n, el) => { if (el) refMap.current["q" + n] = el; };
  const regHl = (n, el) => { if (el) refMap.current["hl" + n] = el; };
  function showEvidence(n) {
    setActiveN(n);
    setTimeout(() => { const el = refMap.current["hl" + n]; if (el && el.scrollIntoView) el.scrollIntoView({ behavior: "smooth", block: "center" }); }, 60);
  }
  function scrollToQ(n) {
    const el = refMap.current["q" + n], pane = paneRef.current;
    if (el && pane) { const er = el.getBoundingClientRect(), pr = pane.getBoundingClientRect(); pane.scrollTo({ top: pane.scrollTop + (er.top - pr.top) - 80, behavior: "smooth" }); }
  }

  const reviewCtx = {
    byN,
    hasEvidence: (n) => !!(evidenceMap[n] && evidenceMap[n].partIdx === pi),
    onEvidence: showEvidence,
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#fff", overflow: "hidden" }}>
      {/* header */}
      <header className="row" style={{ flex: "none", justifyContent: "space-between", gap: 14, padding: "10px 22px", borderBottom: "2px solid var(--line)", background: "var(--bg)" }}>
        <div className="row" style={{ gap: 12 }}>
          <button onClick={onSummary} className="btn btn-ghost" style={{ padding: "8px 14px", fontSize: 13.5 }}><IR.chevL size={16} /> Tổng quan</button>
          <div className="row" style={{ gap: 7, padding: "6px 15px", borderRadius: 999, background: "#fff", border: "2px solid var(--line-strong)", fontFamily: "var(--font-display)" }}>
            <b style={{ color: "var(--ok)", fontSize: 15.5 }}>{score}/{total}</b>
            <span style={{ color: "var(--muted)", fontWeight: 700, fontSize: 13.5 }}>câu đúng</span>
          </div>
        </div>
        <button onClick={onCopy} className="btn btn-sticker" style={{ padding: "8px 16px", fontSize: 13.5, background: copied ? "var(--ok)" : "#fff", color: copied ? "#fff" : "var(--ink)" }}>
          {copied ? <><IR.check size={16} /> Đã chép!</> : <><IR.send size={16} /> Chia sẻ bài làm</>}
        </button>
      </header>

      {/* part banner */}
      <div style={{ flex: "none", background: "var(--reading-tint)", borderBottom: "1px solid var(--line)", padding: "11px 24px" }}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: "var(--reading-deep)" }}>{part.part}{gp.passageTitle ? ` — ${gp.passageTitle}` : ""}</div>
      </div>

      {/* body */}
      <div style={{ flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: part.passage ? "1.05fr 1fr" : "1fr", maxWidth: 1500, margin: "0 auto", width: "100%" }}>
        {part.passage && (
          <div className="thin-scroll" style={{ overflowY: "auto", padding: "24px 30px 70px", borderRight: "2px solid var(--line)" }}>
            <ReviewPassage passage={part.passage} marks={marks} activeN={activeN} regHl={regHl} />
          </div>
        )}
        <div ref={paneRef} className="thin-scroll" style={{ overflowY: "auto", padding: "24px 30px 90px" }}>
          <ReviewCtxR.Provider value={reviewCtx}>
            <div style={{ display: "grid", gap: 34 }}>
              {part.groups.map((g) => (
                <div key={g.id}><RenderGroupR group={g} answers={partAnswers} setA={NOOP} accent={th.accent} th={th} regRef={regRef} /></div>
              ))}
            </div>
          </ReviewCtxR.Provider>

          {gp.items.some((it) => it.explain) && (
            <>
              <div className="row" style={{ gap: 10, margin: "32px 0 14px" }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, margin: 0 }}>Giải thích đáp án</h3>
                <span style={{ flex: 1, height: 2.5, background: "var(--line)", borderRadius: 2 }} />
              </div>
              <div style={{ display: "grid", gap: 12 }}>
                {gp.items.filter((it) => it.explain).map((it) => (
                  <ExplainCard key={it.n} item={it} active={activeN === it.n}
                    hasEvi={!!(evidenceMap[it.n] && evidenceMap[it.n].partIdx === pi)}
                    onEvidence={() => showEvidence(it.n)} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* bottom navigator */}
      <div className="row" style={{ flex: "none", gap: 14, justifyContent: "space-between", padding: "10px 22px", borderTop: "2px solid var(--line)", background: "var(--bg)", flexWrap: "wrap" }}>
        {parts.length > 1 && (
          <div className="row" style={{ gap: 6 }}>
            {parts.map((p, i) => (
              <button key={i} onClick={() => { setActivePart(i); setActiveN(null); if (paneRef.current) paneRef.current.scrollTo({ top: 0 }); }}
                style={{ padding: "5px 12px", borderRadius: 8, border: `2px solid ${i === pi ? "var(--ink)" : "var(--line-strong)"}`, background: i === pi ? "var(--ink)" : "#fff", color: i === pi ? "#fff" : "var(--ink)", fontWeight: 800, fontSize: 12.5, fontFamily: "var(--font-display)" }}>Phần {i + 1}</button>
            ))}
          </div>
        )}
        <div className="row" style={{ gap: 6, flexWrap: "wrap", flex: 1 }}>
          {gp.items.map((it) => {
            const tone = it.correct ? "var(--ok)" : it.blank ? "var(--muted-2)" : "var(--danger)";
            return (
              <button key={it.n} onClick={() => scrollToQ(it.n)} title={`Câu ${it.n}`}
                style={{ width: 30, height: 30, borderRadius: "50%", border: `2px solid ${tone}`, background: it.correct ? "#e7f7ee" : "#fff", color: tone, fontWeight: 800, fontSize: 13, fontFamily: "var(--font-display)", display: "grid", placeItems: "center" }}>{it.n}</button>
            );
          })}
        </div>
        <button onClick={onSummary} className="btn btn-ink" style={{ padding: "9px 18px", fontSize: 14 }}>Xong</button>
      </div>
    </div>
  );
}

function ResultPage({ payload }) {
  const data = useMemoR(() => decodeResultR(payload), [payload]);
  const [copied, setCopied] = useStateR(false);
  const [showDetail, setShowDetail] = useStateR(false);

  const D = window.TID_DATA;
  const course = data && D.courses[data.c];
  const week = course && course.weeks.find((w) => w.number === data.w);
  const test = week && week[data.k];
  const graded = useMemoR(() => (test ? gradeTestR(test, data.a || {}) : null), [test, data]);

  // Map question number → evidence location in its part's passage (auto-resolved).
  const evidenceMap = useMemoR(() => {
    const map = {};
    if (!test || !graded) return map;
    graded.parts.forEach((gp, pi) => {
      const passage = test.parts[pi] && test.parts[pi].passage;
      if (!passage) return;
      gp.items.forEach((it) => {
        const override = test.evidence && test.evidence[it.n];
        const needle = override || (it.correctVariants && (Array.isArray(it.correctVariants) ? it.correctVariants[0] : it.correctVariants));
        const loc = resolveEvidence(passage, needle);
        if (loc) map[it.n] = { ...loc, partIdx: pi };
      });
    });
    return map;
  }, [test, graded]);

  if (!data || !test || !graded) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "grid", placeItems: "center", padding: 24 }}>
        <div className="sticker" style={{ background: "#fff", padding: 28, maxWidth: 440, textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, margin: "0 auto 14px", background: "#fdeceb", color: "var(--danger)", border: "1.5px solid var(--line-strong)", display: "grid", placeItems: "center" }}><IR.flag size={26} /></div>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, margin: "0 0 6px" }}>Không mở được kết quả</h2>
          <p style={{ color: "var(--muted)", fontWeight: 600, fontSize: 14.5, margin: "0 0 18px", lineHeight: 1.55 }}>Đường link có thể bị thiếu hoặc hỏng. Hãy xin lại link kết quả từ học sinh.</p>
          <button onClick={() => goR("/")} className="btn btn-ink">Về trang chủ</button>
        </div>
      </div>
    );
  }

  if (!showDetail) {
    return (
      <SummaryView
        graded={graded}
        courseName={course.name}
        elapsed={data.e}
        data={data}
        onViewDetail={() => setShowDetail(true)}
      />
    );
  }

  function copyLink() {
    const url = window.location.href;
    const done = () => { setCopied(true); setTimeout(() => setCopied(false), 2200); };
    if (navigator.clipboard) navigator.clipboard.writeText(url).then(done).catch(() => fallbackCopy(url, done));
    else fallbackCopy(url, done);
  }
  function fallbackCopy(text, done) {
    const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); done(); } catch (e) {} document.body.removeChild(ta);
  }

  return (
    <ExamReview
      data={data} test={test} graded={graded} course={course}
      evidenceMap={evidenceMap}
      copied={copied} onCopy={copyLink}
      onSummary={() => setShowDetail(false)}
    />
  );
}

window.TID_RESULT = { ResultPage };
