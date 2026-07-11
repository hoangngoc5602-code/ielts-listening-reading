/* ============================================================
   IELTS Reading & Listening — Question renderers (all real IELTS types)
   Two visual themes via `th` (theme object): playful | pro
   Supported kinds:
     matching-info     · match info/headings to paragraphs (A–F)
     matching-ending   · match sentence beginnings to endings (A–…)
     summary-gap       · summary with a phrase/word bank (dropdowns)
     completion        · notes / table / flow / sentences (typed blanks)
     short-answer      · answer a question by typing (NO MORE THAN N WORDS)
     mc-single         · multiple choice, one answer
     mc-multi          · multiple choice, choose N
     tfng              · TRUE/FALSE/NOT GIVEN  or  YES/NO/NOT GIVEN
   Exposed on window.TID_QUESTIONS
   ============================================================ */
const { useRef: useRefQ } = React;
const { Icons: IQ } = window.TID_ICONS;

/* Review context — when set, gap/answer renderers switch to read-only "marked"
   mode (student answer + ✓/✗ + correct answer + 📍 evidence). Null during the
   live test, so test-taking behaviour is unchanged. Value shape:
     { byN: { [n]: { correct, blank, studentAns, correctAns } }, onEvidence(n), hasEvidence(n) } */
const ReviewCtx = React.createContext(null);

// Theme primitives for the test interface
function tTheme(pro, accent, accentDeep, tint) {
  if (pro) return {
    pro: true,
    accent: "#159a9a", accentDeep: "#0f7676", tint: "#e7f4f4",
    line: "#dfe3e3", lineStrong: "#c5cfcf", shadow: "none",
    r: 6, rSm: 4, pill: 5,
    font: "var(--font-pro)", titleFont: "var(--font-pro)", titleW: 700, titleSize: 17,
    read: "var(--font-pro)", readAlign: "justify", readSize: 16.5, readLh: 1.75,
    qSize: 16, qLh: 1.65,
    btnShadow: "none", cardBg: "#fafbfb",
  };
  return {
    pro: false,
    accent, accentDeep, tint,
    line: "var(--line)", lineStrong: "var(--line-strong)", shadow: "var(--shadow-card-sm)",
    r: 16, rSm: 12, pill: 999,
    font: "var(--font-body)", titleFont: "var(--font-display)", titleW: 700, titleSize: 21,
    read: "var(--font-body)", readAlign: "justify", readSize: 16.5, readLh: 1.75,
    qSize: 16, qLh: 1.65,
    btnShadow: "var(--shadow-card-sm)", cardBg: "#fff",
  };
}

// bold-ify **text** and italic _text_ in instructions
function richText(str) {
  const out = [];
  const parts = String(str).split(/(\*\*[^*]+\*\*|_[^_]+_)/g);
  parts.forEach((p, i) => {
    if (/^\*\*[^*]+\*\*$/.test(p)) out.push(<b key={i}>{p.slice(2, -2)}</b>);
    else if (/^_[^_]+_$/.test(p)) out.push(<i key={i}>{p.slice(1, -1)}</i>);
    else out.push(<React.Fragment key={i}>{p}</React.Fragment>);
  });
  return out;
}

function Instructions({ text, th }) {
  if (!text) return null;
  return (
    <div style={{ fontSize: 16, lineHeight: 1.6, color: "var(--ink-soft)", marginBottom: 16, fontWeight: 400, whiteSpace: "pre-line", fontFamily: th.font }}>
      {richText(text)}
    </div>
  );
}

function GroupTitle({ children, th }) {
  return <h3 style={{ fontFamily: th.titleFont, fontWeight: th.titleW, fontSize: th.titleSize, margin: 0 }}>{children}</h3>;
}

/* Styled block wrapping the group title + instructions together */
function GroupHeader({ th, title, instructions }) {
  if (th.pro) {
    return (
      <div style={{ background: "#f0f2f3", borderRadius: 6, padding: "12px 16px", marginBottom: 20, borderLeft: "3px solid #159a9a" }}>
        <h3 style={{ fontFamily: th.titleFont, fontWeight: 700, fontSize: 16.5, margin: 0, color: "#111827" }}>{title}</h3>
        {instructions && (
          <div style={{ fontSize: 14, lineHeight: 1.6, color: "#4b5563", marginTop: 8, fontWeight: 400, fontFamily: th.font, whiteSpace: "pre-line" }}>
            {richText(instructions)}
          </div>
        )}
      </div>
    );
  }
  return (
    <div style={{ background: th.tint, border: `2px solid ${th.accentDeep}20`, borderRadius: 14, padding: "12px 16px", marginBottom: 18 }}>
      <GroupTitle th={th}>{title}</GroupTitle>
      {instructions && (
        <div style={{ fontSize: 15, lineHeight: 1.55, color: "var(--ink-soft)", marginTop: 7, fontWeight: 400, fontFamily: th.font, whiteSpace: "pre-line" }}>
          {richText(instructions)}
        </div>
      )}
    </div>
  );
}

/* number bubble */
function QNum({ n, regRef, answered, th }) {
  if (th.pro) {
    return (
      <span ref={(el) => regRef && regRef(n, el)} data-qn={n}
        style={{
          flex: "none", width: 28, height: 28, borderRadius: 4, display: "grid", placeItems: "center",
          fontFamily: th.titleFont, fontWeight: 700, fontSize: 14,
          border: `1.5px solid ${answered ? th.accent : th.lineStrong}`,
          background: answered ? th.accent : "#fff",
          color: answered ? "#fff" : "#374151", scrollMarginTop: 90,
        }}>{n}</span>
    );
  }
  return (
    <span ref={(el) => regRef && regRef(n, el)} data-qn={n}
      style={{
        flex: "none", width: 32, height: 32, borderRadius: th.rSm, display: "grid", placeItems: "center",
        fontFamily: th.titleFont, fontWeight: 700, fontSize: 14,
        border: `2.5px solid ${answered ? th.accent : "var(--ink)"}`,
        background: answered ? th.accent : "#fff",
        color: answered ? "#fff" : "var(--ink)", scrollMarginTop: 90,
      }}>{n}</span>
  );
}

/* small numbered badge used inline next to a blank */
function GapBadge({ n, th }) {
  return <span className="mono-num" style={{ fontSize: 14.5, fontWeight: 800, color: th.accent, background: th.tint, borderRadius: 6, padding: "3px 9px", marginRight: 4 }}>{n}</span>;
}

/* a single answer blank — typed input (default) or dropdown when a bank is supplied */
function Blank({ n, answers, setA, th, bank, regRef, width = 150 }) {
  const review = React.useContext(ReviewCtx);
  const val = answers[n];
  if (review) {
    const r = (review.byN && review.byN[n]) || {};
    const ok = r.correct;
    const tone = ok ? "var(--ok)" : "var(--danger)";
    const hasEvi = review.hasEvidence && review.hasEvidence(n);
    return (
      <span ref={(el) => regRef && regRef(n, el)} data-qn={n} style={{ display: "inline-flex", alignItems: "center", gap: 5, scrollMarginTop: 90, margin: "0 4px", flexWrap: "wrap", verticalAlign: "middle" }}>
        <GapBadge n={n} th={th} />
        <span style={{ flex: "none", width: 19, height: 19, borderRadius: "50%", background: tone, color: "#fff", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 900 }}>{ok ? <IQ.check size={12} /> : <IQ.x size={12} />}</span>
        {!r.blank && (
          <span style={{ fontFamily: th.titleFont, fontWeight: 700, fontSize: th.qSize, color: ok ? "var(--ok)" : "var(--ink)", textDecoration: ok ? "none" : "line-through", textDecorationColor: "var(--danger)", textDecorationThickness: 2 }}>{r.studentAns}</span>
        )}
        {!ok && (
          <>
            <span style={{ color: "var(--muted-2)", fontWeight: 800 }}>→</span>
            <span style={{ fontFamily: th.titleFont, fontWeight: 800, fontSize: th.qSize, color: "var(--ok)" }}>{r.correctAns}</span>
          </>
        )}
        {hasEvi && (
          <button onClick={() => review.onEvidence(n)} title="Xem trong bài" style={{ flex: "none", display: "inline-grid", placeItems: "center", width: 24, height: 24, borderRadius: 7, border: `1.5px solid ${th.lineStrong}`, background: th.tint, cursor: "pointer", fontSize: 13, lineHeight: 1 }}>📍</button>
        )}
      </span>
    );
  }
  if (bank) {
    return (
      <span ref={(el) => regRef && regRef(n, el)} data-qn={n} style={{ display: "inline-flex", alignItems: "center", scrollMarginTop: 90, marginRight: 4 }}>
        <GapBadge n={n} th={th} />
        <select value={val || ""} onChange={(e) => setA(n, e.target.value)}
          style={{ appearance: "none", padding: "4px 26px 4px 12px", borderRadius: th.rSm, border: `${th.pro ? "1.5px" : "2.5px"} solid ${val ? th.accent : th.lineStrong}`, background: `#fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='%231f2433' stroke-width='2.4' stroke-linecap='round'%3E%3Cpath d='M3 5l3 3 3-3'/%3E%3C/svg%3E") no-repeat right 8px center`, fontFamily: th.titleFont, fontWeight: 700, fontSize: th.qSize, color: "var(--ink)", cursor: "pointer", minWidth: 60, boxShadow: val ? th.btnShadow : "none" }}>
          <option value="">—</option>
          {bank.map((b) => <option key={b.letter} value={b.letter}>{b.letter}</option>)}
        </select>
      </span>
    );
  }
  return (
    <span ref={(el) => regRef && regRef(n, el)} data-qn={n} style={{ display: "inline-flex", alignItems: "center", scrollMarginTop: 90, marginRight: 4 }}>
      <GapBadge n={n} th={th} />
      <input value={val || ""} onChange={(e) => setA(n, e.target.value)} placeholder="…"
        style={{ padding: "5px 12px", borderRadius: th.rSm, border: `${th.pro ? "1.5px" : "2.5px"} solid ${val && val.trim() ? th.accent : th.lineStrong}`, fontWeight: th.pro ? 400 : 700, fontSize: th.qSize, width, background: "#fff", fontFamily: th.font, boxShadow: val && val.trim() ? th.btnShadow : "none", verticalAlign: "middle" }} />
    </span>
  );
}

/* render a sequence of segments: {t:"text"} | {gap:n} */
function Segments({ segs, answers, setA, th, bank, regRef }) {
  return segs.map((seg, i) => {
    if (seg.t != null) return <React.Fragment key={i}>{seg.t}</React.Fragment>;
    if (seg.gap != null) return <Blank key={i} n={seg.gap} answers={answers} setA={setA} th={th} bank={bank} regRef={regRef} width={seg.w || 140} />;
    return null;
  });
}

/* an optional phrase/word bank box (for summary-gap & banked completion) */
function BankBox({ bank, th, label = "ANSWER BANK", cols = 2 }) {
  return (
    <div style={{ background: th.cardBg, padding: "14px 16px", border: `1.5px solid ${th.lineStrong}`, borderRadius: th.r, marginTop: 6 }}>
      <div style={{ fontWeight: 800, fontSize: 13, color: "var(--muted)", marginBottom: 10, letterSpacing: ".04em", fontFamily: th.font }}>{label}</div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: "7px 18px" }}>
        {bank.map((b) => (
          <div key={b.letter} className="row" style={{ gap: 9, fontSize: 15, fontWeight: th.pro ? 500 : 400, fontFamily: th.font, alignItems: "flex-start" }}>
            <span style={{ flex: "none", width: 24, height: 24, borderRadius: th.rSm, border: `2px solid ${th.pro ? th.lineStrong : "var(--ink)"}`, display: "grid", placeItems: "center", fontFamily: th.titleFont, fontWeight: 700, fontSize: 13 }}>{b.letter}</span>
            <span style={{ lineHeight: 1.35 }}>{b.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---- MATCHING (info → paragraph), click-to-assign ---- */
function MatchingInfo({ group, answers, setA, regRef, th }) {
  return (
    <div>
      <GroupHeader th={th} title={group.title} instructions={group.instructions} />
      {group.people && (
        <div style={{ marginBottom: 16, padding: "12px 16px", borderRadius: th.r, background: th.cardBg, border: `1.5px solid ${th.lineStrong}` }}>
          <div style={{ fontWeight: 800, fontSize: 13, color: "var(--muted)", marginBottom: 8, letterSpacing: ".04em", fontFamily: th.font }}>PEOPLE</div>
          {group.people.map(p => (
            <div key={p.letter} style={{ fontFamily: th.font, fontSize: th.qSize, color: th.pro ? "#1a1f2b" : "var(--ink)", lineHeight: 1.75 }}>
              <span style={{ fontWeight: 700, color: th.accent, marginRight: 4 }}>{p.letter}.</span>{p.name}
            </div>
          ))}
        </div>
      )}
      <div style={{ display: "grid", gap: 10 }}>
        {group.questions.map((q) => {
          const val = answers[q.n] || "";
          return (
            <div key={q.n} className="row" style={{ gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <QNum n={q.n} regRef={regRef} answered={!!val} th={th} />
              <span style={{ flex: 1, fontWeight: 400, fontSize: th.qSize, fontFamily: th.font, lineHeight: 1.45, color: th.pro ? "#1a1f2b" : "var(--ink)" }}>{q.prompt}</span>
              <select value={val} onChange={(e) => setA(q.n, e.target.value)}
                style={{ appearance: "none", padding: "5px 28px 5px 12px", borderRadius: th.rSm, border: `${th.pro ? "1.5px" : "2.5px"} solid ${val ? th.accent : th.lineStrong}`, background: `#fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='%231f2433' stroke-width='2.4' stroke-linecap='round'%3E%3Cpath d='M3 5l3 3 3-3'/%3E%3C/svg%3E") no-repeat right 8px center`, fontFamily: th.titleFont, fontWeight: 700, fontSize: th.qSize, color: val ? th.accent : "var(--muted)", cursor: "pointer", minWidth: 70, boxShadow: val ? th.btnShadow : "none" }}>
                <option value="">—</option>
                {group.options.map(op => <option key={op} value={op}>{op}</option>)}
              </select>
            </div>
          );
        })}
      </div>
    </div>
  );
}
function advance(group, answers, cur, setActiveRow) {
  const qs = group.questions.map((q) => q.n);
  const idx = qs.indexOf(cur);
  for (let k = 1; k <= qs.length; k++) {
    const cand = qs[(idx + k) % qs.length];
    if (answers[cand] == null && cand !== cur) { setActiveRow(cand); return; }
  }
}

/* ---- MATCHING sentence endings: numbered beginnings → endings (A–…) via dropdown ---- */
function MatchingEnding({ group, answers, setA, regRef, th }) {
  const label = group.bankLabel || "SENTENCE ENDINGS";
  const questionList = (
    <div style={{ display: "grid", gap: 12 }}>
      {group.questions.map((q) => (
        <div key={q.n} className="row" style={{ gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <QNum n={q.n} regRef={regRef} answered={answers[q.n] != null && answers[q.n] !== ""} th={th} />
          <span style={{ fontWeight: 400, fontSize: th.qSize, fontFamily: th.font, flex: 1, minWidth: 140, lineHeight: 1.45, color: th.pro ? "#1a1f2b" : "var(--ink)" }}>{q.prompt}</span>
          <Blank n={q.n} answers={answers} setA={setA} th={th} bank={group.endings} />
        </div>
      ))}
    </div>
  );

  // Map/diagram questions: show the image and the questions side-by-side (the A–I
  // letters live on the map). Wraps to stacked on narrow screens.
  if (group.image) {
    return (
      <div>
        <GroupHeader th={th} title={group.title} instructions={group.instructions} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 22, alignItems: "flex-start" }}>
          <img src={group.image} alt="Map" style={{ flex: "1 1 300px", maxWidth: 440, width: "100%", display: "block", borderRadius: th.r, border: `1.5px solid ${th.lineStrong}` }} />
          <div style={{ flex: "1 1 260px", minWidth: 240 }}>{questionList}</div>
        </div>
      </div>
    );
  }

  const box = <BankBox bank={group.endings} th={th} label={label} cols={1} />;
  return (
    <div>
      <GroupHeader th={th} title={group.title} instructions={group.instructions} />
      {group.bankFirst && <div style={{ marginBottom: 16 }}>{box}</div>}
      {questionList}
      {!group.bankFirst && <div style={{ marginTop: 16 }}>{box}</div>}
    </div>
  );
}

/* ---- SUMMARY with gaps + phrase bank (dropdown gaps) ---- */
function SummaryGap({ group, answers, setA, accent, regRef, th }) {
  return (
    <div>
      <GroupHeader th={th} title={group.title} instructions={group.instructions} />
      {group.heading && <div style={{ fontFamily: th.titleFont, fontWeight: 700, fontSize: 17, margin: "0 0 10px" }}>{group.heading}</div>}
      <div style={{ fontSize: th.qSize, lineHeight: 2.2, fontWeight: 400, color: "var(--ink)", marginBottom: 18, fontFamily: th.font }}>
        <Segments segs={group.summary} answers={answers} setA={setA} th={th} bank={group.bank} regRef={regRef} />
      </div>
      <BankBox bank={group.bank} th={th} label="PHRASE BANK" cols={2} />
    </div>
  );
}

/* ---- COMPLETION (notes / table / flow / sentences) with typed (or banked) blanks ---- */
function Completion({ group, answers, setA, regRef, th }) {
  const bank = group.bank; // optional → dropdowns
  return (
    <div>
      <GroupHeader th={th} title={group.title} instructions={group.instructions} />
      {group.heading && <div style={{ fontFamily: th.titleFont, fontWeight: 700, fontSize: 18, margin: "0 0 12px", textAlign: group.layout === "notes" ? "center" : "left" }}>{group.heading}</div>}
      {group.image && <img src={group.image} alt="Diagram" style={{ width: "100%", maxWidth: 640, display: "block", margin: "0 auto 16px", borderRadius: th.r, border: `1.5px solid ${th.lineStrong}` }} />}

      {group.layout === "table" && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontFamily: th.font, fontSize: th.qSize }}>
            {group.columns && (
              <thead>
                <tr>{group.columns.map((c, i) => (
                  <th key={i} style={{ textAlign: "left", padding: "10px 12px", background: th.tint, color: th.accentDeep, fontWeight: 800, fontSize: 13.5, border: `1.5px solid ${th.lineStrong}`, fontFamily: th.titleFont }}>{c}</th>
                ))}</tr>
              </thead>
            )}
            <tbody>
              {group.rows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci} style={{ padding: "10px 12px", border: `1.5px solid ${th.lineStrong}`, verticalAlign: "top", lineHeight: 1.7, fontWeight: 400, fontSize: th.qSize, fontFamily: th.font }}>
                      {typeof cell === "string" ? cell : <Segments segs={cell} answers={answers} setA={setA} th={th} bank={bank} regRef={regRef} />}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {group.layout === "flow" && (
        <div style={{ display: "grid", gap: 0 }}>
          {group.steps.map((step, i) => (
            <React.Fragment key={i}>
              <div className="row" style={{ gap: 12, alignItems: "flex-start", background: th.cardBg, border: `${th.pro ? "1.5px" : "2.5px"} solid ${th.pro ? th.lineStrong : "var(--ink)"}`, borderRadius: th.r, padding: "13px 16px", boxShadow: th.pro ? "none" : "var(--shadow-card-sm)" }}>
                {step.label && <span style={{ flex: "none", fontFamily: th.titleFont, fontWeight: 700, fontSize: 14, color: th.accentDeep, minWidth: 64 }}>{step.label}</span>}
                <span style={{ lineHeight: 1.8, fontWeight: 400, fontFamily: th.font, fontSize: th.qSize }}>
                  <Segments segs={step.segs} answers={answers} setA={setA} th={th} bank={bank} regRef={regRef} />
                </span>
              </div>
              {i < group.steps.length - 1 && (
                <div style={{ display: "grid", placeItems: "center", padding: "4px 0" }}>
                  <svg width="18" height="22" viewBox="0 0 18 22" fill="none" stroke={th.lineStrong} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 2v16M3 13l6 5 6-5"/></svg>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {(group.layout === "notes" || !group.layout) && group.lines && (
        <div style={{ display: "grid", gap: 9 }}>
          {group.lines.map((line, i) => {
            if (line.head) return <div key={i} style={{ fontFamily: th.titleFont, fontWeight: 700, fontSize: 16, color: th.accentDeep, marginTop: i ? 8 : 0 }}>{line.head}</div>;
            const indent = (line.sub ? 22 : 0) + (line.lvl || 0) * 22;
            return (
              <div key={i} className="row" style={{ gap: 9, alignItems: "baseline", paddingLeft: indent, lineHeight: 1.9, fontWeight: 400, fontFamily: th.font, fontSize: th.qSize, flexWrap: "wrap" }}>
                <span style={{ color: th.accent, flex: "none" }}>•</span>
                <span style={{ flex: 1, textAlign: "justify" }}><Segments segs={line.segs} answers={answers} setA={setA} th={th} bank={bank} regRef={regRef} /></span>
              </div>
            );
          })}
        </div>
      )}

      {group.layout === "sentences" && (
        <div style={{ display: "grid", gap: 16 }}>
          {group.items.map((it) => (
            <div key={it.n} className="row" style={{ gap: 12, alignItems: "center", flexWrap: "wrap", lineHeight: 1.9, fontWeight: 400, fontFamily: th.font, fontSize: th.qSize }}>
              <Segments segs={it.segs} answers={answers} setA={setA} th={th} bank={bank} regRef={regRef} />
            </div>
          ))}
        </div>
      )}

      {/* trailing sentence(s) that follow a table in the same group (e.g. a table + one extra gap) */}
      {group.after && (
        <div style={{ display: "grid", gap: 16, marginTop: 16 }}>
          {group.after.map((line, i) => (
            <div key={`af${i}`} className="row" style={{ gap: 12, alignItems: "center", flexWrap: "wrap", lineHeight: 1.9, fontWeight: 400, fontFamily: th.font, fontSize: th.qSize }}>
              <Segments segs={line.segs} answers={answers} setA={setA} th={th} bank={bank} regRef={regRef} />
            </div>
          ))}
        </div>
      )}

      {bank && <div style={{ marginTop: 16 }}><BankBox bank={bank} th={th} cols={2} /></div>}
    </div>
  );
}

/* ---- SHORT ANSWER (type the answer to a question) ---- */
function ShortAnswer({ group, answers, setA, regRef, th }) {
  return (
    <div>
      <GroupHeader th={th} title={group.title} instructions={group.instructions} />
      <div style={{ display: "grid", gap: 16 }}>
        {group.questions.map((q) => (
          <div key={q.n} className="row" style={{ gap: 14, alignItems: "flex-start" }}>
            <QNum n={q.n} regRef={regRef} answered={!!(answers[q.n] && answers[q.n].trim())} th={th} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 400, fontSize: th.qSize, marginBottom: 9, lineHeight: 1.45, fontFamily: th.font, color: th.pro ? "#1a1f2b" : "var(--ink)" }}>{q.q}</div>
              <input value={answers[q.n] || ""} onChange={(e) => setA(q.n, e.target.value)} placeholder="Your answer…"
                style={{ padding: "9px 14px", borderRadius: th.rSm, border: `${th.pro ? "1.5px" : "2.5px"} solid ${answers[q.n] && answers[q.n].trim() ? th.accent : th.lineStrong}`, fontWeight: 700, fontSize: 16, minWidth: 240, width: "min(420px, 100%)", background: "#fff", fontFamily: th.font, boxShadow: answers[q.n] && answers[q.n].trim() ? th.btnShadow : "none" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---- Shared MC option card (single + multi) ---- */
function McOption({ letter, text, on, isMulti, onClick, th }) {
  return (
    <button onClick={onClick} className="row"
      style={{ gap: 11, padding: "10px 14px", borderRadius: th.r, textAlign: "left", width: "100%",
        border: `${th.pro ? "1.5px" : "2px"} solid ${on ? th.accent : th.line}`,
        background: on ? th.tint : "#fff", fontFamily: th.font, cursor: "pointer",
        alignItems: "flex-start", transition: "border-color .12s, background .12s" }}>
      <span style={{ flex: "none", width: 22, height: 22, borderRadius: isMulti ? 5 : 11, marginTop: 1,
        border: `${th.pro ? "1.5px" : "2px"} solid ${on ? th.accent : th.lineStrong}`,
        background: on ? th.accent : "#fff", color: "#fff", display: "grid", placeItems: "center" }}>
        {on && <IQ.check size={13} />}
      </span>
      <span style={{ flex: "none", fontWeight: 700, color: th.accent, minWidth: 22, fontSize: th.qSize, userSelect: "text" }}>{letter}.</span>
      <span style={{ flex: 1, fontWeight: 400, fontSize: th.qSize, color: th.pro ? "#1a1f2b" : "var(--ink)", lineHeight: 1.45, userSelect: "text" }}>{text}</span>
    </button>
  );
}

/* ---- Range badge for mc-multi (e.g. "7–8") ---- */
function QRange({ from, to, regRef, answered, th }) {
  const label = from === to ? String(from) : `${from}–${to}`;
  if (th.pro) {
    return (
      <span ref={(el) => regRef && regRef(from, el)} data-qn={from}
        style={{ flex: "none", padding: "3px 10px", minWidth: 44, height: 28, borderRadius: 4,
          display: "grid", placeItems: "center", whiteSpace: "nowrap",
          fontFamily: th.titleFont, fontWeight: 700, fontSize: 13,
          border: `1.5px solid ${answered ? th.accent : th.lineStrong}`,
          background: answered ? th.accent : "#fff",
          color: answered ? "#fff" : "#374151", scrollMarginTop: 90 }}>{label}</span>
    );
  }
  return (
    <span ref={(el) => regRef && regRef(from, el)} data-qn={from}
      style={{ flex: "none", padding: "3px 12px", minWidth: 50, height: 32, borderRadius: th.rSm,
        display: "grid", placeItems: "center", whiteSpace: "nowrap",
        fontFamily: th.titleFont, fontWeight: 700, fontSize: 13.5,
        border: `2.5px solid ${answered ? th.accent : "var(--ink)"}`,
        background: answered ? th.accent : "#fff",
        color: answered ? "#fff" : "var(--ink)", scrollMarginTop: 90 }}>{label}</span>
  );
}

/* ---- MC single ---- */
function McSingle({ group, answers, setA, accent, regRef, th }) {
  return (
    <div>
      <GroupHeader th={th} title={group.title} instructions={group.instructions} />
      <div style={{ display: "grid", gap: 24 }}>
        {group.questions.map((q) => (
          <div key={q.n} className="row" style={{ gap: 14, alignItems: "flex-start" }}>
            <QNum n={q.n} regRef={regRef} answered={answers[q.n] != null} th={th} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 400, fontSize: th.qSize, marginBottom: 10, lineHeight: 1.5, fontFamily: th.font, color: th.pro ? "#1a1f2b" : "var(--ink)" }}>{q.prompt}</div>
              <div style={{ display: "grid", gap: 7 }}>
                {q.options.map((op) => (
                  <McOption key={op.letter} letter={op.letter} text={op.text}
                    on={answers[q.n] === op.letter} isMulti={false}
                    onClick={() => setA(q.n, op.letter)} th={th} />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---- MC multi (pick N) ---- */
function McMulti({ group, answers, setA, accent, regRef, th }) {
  const val = answers[group.n] || [];
  function toggle(letter) {
    let next = val.includes(letter) ? val.filter((x) => x !== letter) : [...val, letter];
    if (next.length > group.pick) next = next.slice(next.length - group.pick);
    for (let i = 0; i < group.pick; i++) setA(group.n + i, next);
  }
  const answered = val.length === group.pick;
  return (
    <div>
      <GroupHeader th={th} title={group.title} instructions={group.instructions} />
      <div className="row" style={{ gap: 14, alignItems: "flex-start" }}>
        <QRange from={group.n} to={group.n + group.pick - 1} regRef={regRef} answered={answered} th={th} />
        <div style={{ flex: 1 }}>
          {group.prompt && (
            <div style={{ fontWeight: 700, fontSize: th.qSize, marginBottom: 10, lineHeight: 1.5, fontFamily: th.font, color: th.pro ? "#1a1f2b" : "var(--ink)" }}>
              {group.prompt}
            </div>
          )}
          <div style={{ display: "grid", gap: 7 }}>
            {group.options.map((op) => (
              <McOption key={op.letter} letter={op.letter} text={op.text}
                on={val.includes(op.letter)} isMulti={true}
                onClick={() => toggle(op.letter)} th={th} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---- True/False/Not Given  ·  Yes/No/Not Given (configurable labels) ---- */
function Tfng({ group, answers, setA, accent, regRef, th }) {
  const yn = group.labels === "yn";
  const opts = yn
    ? [{ k: "YES", c: "var(--ok)" }, { k: "NO", c: "var(--danger)" }, { k: "NOT GIVEN", c: "var(--warn)" }]
    : [{ k: "TRUE", c: "var(--ok)" }, { k: "FALSE", c: "var(--danger)" }, { k: "NOT GIVEN", c: "var(--warn)" }];

  if (th.pro) {
    // Real-exam look: vertical radio options (TRUE / FALSE / NOT GIVEN)
    return (
      <div>
        <GroupHeader th={th} title={group.title} instructions={group.instructions} />
        <div style={{ display: "grid", gap: 22 }}>
          {group.questions.map((q) => (
            <div key={q.n} className="row" style={{ gap: 12, alignItems: "flex-start" }}>
              <QNum n={q.n} regRef={regRef} answered={answers[q.n] != null} th={th} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 400, fontSize: th.qSize, marginBottom: 8, lineHeight: 1.45, fontFamily: th.font, color: "#1a1f2b" }}>{q.prompt}</div>
                <div style={{ display: "grid", gap: 2 }}>
                  {opts.map((o) => {
                    const on = answers[q.n] === o.k;
                    return (
                      <button key={o.k} onClick={() => setA(q.n, o.k)} className="row"
                        style={{ gap: 11, padding: "5px 6px", borderRadius: 5, textAlign: "left", border: "none", background: "transparent", fontFamily: th.font, cursor: "pointer", width: "fit-content" }}>
                        <Radio on={on} accent={th.accent} th={th} />
                        <span style={{ fontWeight: on ? 600 : 400, fontSize: th.qSize, color: "#1a1f2b", userSelect: "text" }}>{o.k}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <GroupHeader th={th} title={group.title} instructions={group.instructions} />
      <div style={{ display: "grid", gap: 16 }}>
        {group.questions.map((q) => (
          <div key={q.n} className="row" style={{ gap: 14, alignItems: "flex-start" }}>
            <QNum n={q.n} regRef={regRef} answered={answers[q.n] != null} th={th} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 400, fontSize: th.qSize, marginBottom: 11, lineHeight: 1.4, fontFamily: th.font }}>{q.prompt}</div>
              <div className="row" style={{ gap: 9, flexWrap: "wrap" }}>
                {opts.map((o) => {
                  const on = answers[q.n] === o.k;
                  return (
                    <button key={o.k} onClick={() => setA(q.n, o.k)}
                      style={{ padding: "9px 18px", borderRadius: th.pill, border: `2.5px solid ${on ? o.c : th.lineStrong}`, background: on ? o.c : "#fff", color: on ? "#fff" : "var(--ink)", fontWeight: 800, fontSize: 14.5, fontFamily: th.font, boxShadow: on ? "none" : th.btnShadow, transition: "all .12s" }}>
                      {o.k}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Radio({ on, accent, th }) {
  const sz = th && th.pro ? 19 : 24;
  const dot = th && th.pro ? 9 : 11;
  const bw = th && th.pro ? 1.5 : 2.5;
  return (
    <span style={{ flex: "none", width: sz, height: sz, borderRadius: "50%", border: `${bw}px solid ${on ? accent : (th ? th.lineStrong : "#c5cfcf")}`, display: "grid", placeItems: "center", background: "#fff" }}>
      {on && <span style={{ width: dot, height: dot, borderRadius: "50%", background: accent }}></span>}
    </span>
  );
}

/* legacy simple gap-fill kept for compatibility (before / input / after) */
function GapFillLegacy({ group, answers, setA, regRef, th }) {
  return (
    <div>
      <GroupHeader th={th} title={group.title} instructions={group.instructions} />
      <div style={{ display: "grid", gap: 16 }}>
        {group.questions.map((q) => (
          <div key={q.n} className="row" style={{ gap: 14, alignItems: "center", flexWrap: "wrap" }}>
            <QNum n={q.n} regRef={regRef} answered={!!(answers[q.n] && answers[q.n].trim())} th={th} />
            <span style={{ fontWeight: 400, fontSize: th.qSize, fontFamily: th.font }}>{q.before}</span>
            <Blank n={q.n} answers={answers} setA={setA} th={th} />
            <span style={{ fontWeight: 400, fontSize: th.qSize, fontFamily: th.font }}>{q.after}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* dispatcher */
function RenderGroup(props) {
  const k = props.group.kind;
  if (k === "matching-info" || k === "matching-heading") return <MatchingInfo {...props} />;
  if (k === "matching-ending") return <MatchingEnding {...props} />;
  if (k === "summary-gap") return <SummaryGap {...props} />;
  if (k === "completion") return <Completion {...props} />;
  if (k === "short-answer") return <ShortAnswer {...props} />;
  if (k === "mc-single") return <McSingle {...props} />;
  if (k === "mc-multi") return <McMulti {...props} />;
  if (k === "tfng") return <Tfng {...props} />;
  if (k === "gap-fill") return <GapFillLegacy {...props} />;
  return null;
}

// question numbers of a SINGLE group, in display order (deduped)
function groupQNums(g) {
  const nums = [];
  const addSegs = (segs) => segs && segs.forEach((s) => { if (s && s.gap != null) nums.push(s.gap); });
  if (g.questions) g.questions.forEach((q) => nums.push(q.n));
  if (g.summary) addSegs(g.summary);
  if (g.lines) g.lines.forEach((l) => addSegs(l.segs));
  if (g.items) g.items.forEach((it) => addSegs(it.segs));
  if (g.rows) g.rows.forEach((r) => r.forEach((c) => { if (Array.isArray(c)) addSegs(c); }));
  if (g.after) g.after.forEach((l) => addSegs(l.segs));
  if (g.steps) g.steps.forEach((st) => addSegs(st.segs));
  if (g.n != null) { for (let i = 0; i < (g.pick || 1); i++) nums.push(g.n + i); }
  return [...new Set(nums)];
}
// list of all question numbers in a test (for footer chips + counting)
function allQNums(test) {
  const nums = new Set();
  test.groups.forEach((g) => groupQNums(g).forEach((n) => nums.add(n)));
  return [...nums].sort((a, b) => a - b);
}
function isAnswered(answers, n) {
  const v = answers[n];
  if (v == null) return false;
  if (Array.isArray(v)) return v.length > 0;
  return String(v).trim() !== "";
}

/* ============================================================
   GRADING (homework self-check)
   ============================================================ */
// Normalise a typed/selected answer for lenient comparison.
function normAns(v) {
  if (v == null) return "";
  if (Array.isArray(v)) return v.map(normAns).filter(Boolean).sort().join("|");
  return String(v).toLowerCase()
    .replace(/[‘’ʼ']/g, "'")
    .replace(/[“”"]/g, "")
    .replace(/^[\s.,;:!?()\[\]\-–—'"]+|[\s.,;:!?()\[\]\-–—'"]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
// Grade one answer against its key (array of accepted variants).
function gradeOne(studentVal, keyVariants) {
  if (keyVariants == null) return { graded: false, blank: !isAnswered({ x: studentVal }, "x") };
  const s = normAns(studentVal);
  if (!s) return { graded: true, correct: false, blank: true };
  const variants = Array.isArray(keyVariants) ? keyVariants : [keyVariants];
  return { graded: true, correct: variants.some((k) => normAns(k) === s), blank: false };
}
// Find the prompt + bank-text for a question, for readable review rows.
function questionMeta(group, n) {
  let prompt = null, options = null;
  if (group.questions) {
    const q = group.questions.find((x) => x.n === n);
    if (q) prompt = q.prompt || q.q || null;
  }
  if (group.endings) options = group.endings; // letter→text bank (matching)
  return { prompt, options };
}
// Show an answer value nicely (resolve a matching letter to "D — its text").
function displayAns(group, n, val) {
  if (val == null || (Array.isArray(val) && !val.length) || String(val).trim() === "") return "";
  const v = Array.isArray(val) ? val.join(", ") : String(val);
  const meta = questionMeta(group, n);
  if (meta.options) {
    const hit = meta.options.find((e) => String(e.letter).toLowerCase() === v.trim().toLowerCase());
    if (hit) return `${hit.letter} — ${hit.text}`;
  }
  return v;
}
// Grade a whole test. `aByPart` = { "1": {n:val}, "2": {...} } (1-based part index).
function gradeTest(test, aByPart) {
  let score = 0, total = 0, graded = 0;
  const parts = (test.parts || []).map((p, i) => {
    const ans = (aByPart && aByPart[String(i + 1)]) || {};
    const items = [];
    p.groups.forEach((g) => {
      groupQNums(g).forEach((n) => {
        const key = test.answerKey ? test.answerKey[n] : null;
        const r = gradeOne(ans[n], key);
        total++;
        if (r.graded) { graded++; if (r.correct) score++; }
        const meta = questionMeta(g, n);
        items.push({
          n, kind: g.kind, prompt: meta.prompt,
          studentAns: displayAns(g, n, ans[n]),
          correctAns: key ? displayAns(g, n, Array.isArray(key) ? key[0] : key) : null,
          correctVariants: key || null,
          ...r,
          explain: (test.explain || {})[n] || null,
        });
      });
    });
    return { part: p.part, passageTitle: p.passage && p.passage.title, items };
  });
  return { score, total, graded, parts };
}

window.TID_QUESTIONS = { RenderGroup, allQNums, groupQNums, isAnswered, richText, tTheme, normAns, gradeOne, gradeTest, ReviewCtx };
