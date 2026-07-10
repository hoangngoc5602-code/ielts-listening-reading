/* ============================================================
   Phúc IELTS — Test interface (multi-part, stopwatch, submit→GDoc)
   A test = { id, course, skill, title, parts:[ {part, passage?, audio?,
              instruction?, groups:[...] } ] }
   Answers are namespaced per part:  answers[`${partIdx}:${qNum}`]
   Exposed on window.TID_TEST
   ============================================================ */
const { useState: useStateT, useEffect: useEffectT, useRef: useRefT, useMemo: useMemoT } = React;
const { Icons: IT } = window.TID_ICONS;
const { Logo: LogoT, Avatar: AvatarT } = window.TID_SHELL;
const { useStore: useStoreT, setAnswer: setAnswerT, submitTest: submitTestT, setState: setStateT, go: goT, weekUnlocked: weekUnlockedT, encodeResult: encodeResultT } = window.TID_STORE;
const { RenderGroup: RenderGroupT, allQNums: allQNumsT, isAnswered: isAnsT, tTheme: tThemeT } = window.TID_QUESTIONS;

const partQNums = (part) => allQNumsT({ groups: part.groups });
const scopeAnswers = (answers, pi) => {
  const out = {};
  Object.keys(answers).forEach((k) => { const i = k.indexOf(":"); if (i > 0 && +k.slice(0, i) === pi) out[k.slice(i + 1)] = answers[k]; });
  return out;
};

/* ============================================================
   Text highlighter / note-taker — works on any selected text in
   the passage and question panes. Uses the CSS Custom Highlight API
   so it never mutates React-rendered DOM (survives re-renders).
   ============================================================ */
let _hlId = 0;
const uidHL = () => `h${++_hlId}`;
function textOffsetOf(root, node, offset) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
  let idx = 0, n;
  while ((n = walker.nextNode())) {
    if (n === node) return idx + offset;
    idx += n.nodeValue.length;
  }
  return idx + offset;
}
function rangeFromOffsets(root, start, end) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
  let idx = 0, n, range = document.createRange(), setS = false, setE = false;
  while ((n = walker.nextNode())) {
    const len = n.nodeValue.length;
    if (!setS && start <= idx + len) { range.setStart(n, Math.max(0, start - idx)); setS = true; }
    if (!setE && end <= idx + len) { range.setEnd(n, Math.max(0, end - idx)); setE = true; break; }
    idx += len;
  }
  return (setS && setE) ? range : null;
}
function caretOffsetFromPoint(root, x, y) {
  let node, off;
  if (document.caretRangeFromPoint) { const r = document.caretRangeFromPoint(x, y); if (!r) return null; node = r.startContainer; off = r.startOffset; }
  else if (document.caretPositionFromPoint) { const p = document.caretPositionFromPoint(x, y); if (!p) return null; node = p.offsetNode; off = p.offset; }
  else return null;
  if (!root.contains(node)) return null;
  return textOffsetOf(root, node, off);
}

function useHighlighter() {
  const [items, setItems] = useStateT([]);     // {id, rootKey, start, end, kind:'hl'|'note', note}
  const [tool, setTool] = useStateT(null);      // selection toolbar {x,y,rootKey,start,end}
  const [pop, setPop] = useStateT(null);        // open note/remove popover {id,x,y,edit}
  const rootsRef = useRefT({});
  const supported = typeof CSS !== "undefined" && CSS.highlights && typeof Highlight !== "undefined";

  const registerRoot = (key) => (el) => { if (el) rootsRef.current[key] = el; else delete rootsRef.current[key]; };

  useEffectT(() => {
    if (!supported) return;
    const hl = new Highlight(), note = new Highlight();
    items.forEach((it) => {
      const root = rootsRef.current[it.rootKey];
      if (!root) return;
      const r = rangeFromOffsets(root, it.start, it.end);
      if (r) (it.kind === "note" ? note : hl).add(r);
    });
    CSS.highlights.set("tid-hl", hl);
    CSS.highlights.set("tid-note", note);
    return () => { CSS.highlights.delete("tid-hl"); CSS.highlights.delete("tid-note"); };
  });

  function findRoot(node) {
    for (const k of Object.keys(rootsRef.current)) {
      const el = rootsRef.current[k];
      if (el && el.contains(node)) return [k, el];
    }
    return [null, null];
  }

  function onMouseUp(e) {
    if (e.target.closest && e.target.closest("[data-hl-ui]")) return;
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.rangeCount) { setTool(null); return; }
    const range = sel.getRangeAt(0);
    const [rootKey, rootEl] = findRoot(range.commonAncestorContainer);
    if (!rootKey) { setTool(null); return; }
    let start = textOffsetOf(rootEl, range.startContainer, range.startOffset);
    let end = textOffsetOf(rootEl, range.endContainer, range.endOffset);
    if (end < start) { const t = start; start = end; end = t; }
    if (end - start < 1) { setTool(null); return; }
    const rect = range.getBoundingClientRect();
    setTool({ x: rect.left + rect.width / 2, y: rect.top, rootKey, start, end });
    setPop(null);
  }

  function onClick(e) {
    if (e.target.closest && e.target.closest("[data-hl-ui]")) return;
    if (window.getSelection && !window.getSelection().isCollapsed) return;
    const [rootKey, rootEl] = findRoot(e.target);
    if (!rootKey) { setPop(null); return; }
    const off = caretOffsetFromPoint(rootEl, e.clientX, e.clientY);
    if (off == null) { setPop(null); return; }
    const hit = [...items].reverse().find((it) => it.rootKey === rootKey && off >= it.start && off < it.end);
    if (hit) setPop({ id: hit.id, x: e.clientX, y: e.clientY, edit: false });
    else setPop(null);
  }

  const addHighlight = () => { setItems((a) => [...a, { id: uidHL(), rootKey: tool.rootKey, start: tool.start, end: tool.end, kind: "hl" }]); window.getSelection().removeAllRanges(); setTool(null); };
  const addNote = () => { const id = uidHL(); const t = tool; setItems((a) => [...a, { id, rootKey: t.rootKey, start: t.start, end: t.end, kind: "note", note: "" }]); window.getSelection().removeAllRanges(); setTool(null); setPop({ id, x: t.x, y: t.y, edit: true }); };
  const remove = (id) => { setItems((a) => a.filter((x) => x.id !== id)); setPop(null); };
  const setNote = (id, note) => setItems((a) => a.map((x) => x.id === id ? { ...x, note } : x));

  const current = pop && items.find((x) => x.id === pop.id);

  const overlay = (
    <React.Fragment>
      {tool && (
        <div data-hl-ui style={{ position: "fixed", left: tool.x, top: tool.y - 12, transform: "translate(-50%,-100%)", zIndex: 200 }}>
          <div className="row anim-pop" style={{ gap: 4, background: "var(--ink)", padding: 4, borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,.32)" }}>
            <button onClick={addHighlight} className="row" style={{ gap: 6, padding: "7px 12px", borderRadius: 8, border: "none", background: "transparent", color: "#fff", fontWeight: 800, fontSize: 13.5, whiteSpace: "nowrap" }}>
              <span style={{ width: 14, height: 14, borderRadius: 4, background: "#ffe08a", display: "inline-block" }} /> Tô màu
            </button>
            <span style={{ width: 1, height: 20, background: "rgba(255,255,255,.2)" }} />
            <button onClick={addNote} className="row" style={{ gap: 6, padding: "7px 12px", borderRadius: 8, border: "none", background: "transparent", color: "#fff", fontWeight: 800, fontSize: 13.5, whiteSpace: "nowrap" }}>
              <IT.doc size={14} /> Ghi chú
            </button>
          </div>
          <div style={{ position: "absolute", left: "50%", bottom: -5, transform: "translateX(-50%) rotate(45deg)", width: 10, height: 10, background: "var(--ink)" }} />
        </div>
      )}
      {current && (
        <div data-hl-ui style={{ position: "fixed", left: Math.min(pop.x, window.innerWidth - 280), top: pop.y + 14, zIndex: 200 }}>
          <div className="anim-pop" style={{ width: 260, background: "#fff", border: "1.5px solid var(--line-strong)", borderRadius: 14, boxShadow: "0 10px 30px rgba(0,0,0,.22)", padding: 14 }}>
            {current.kind === "note" ? (
              <div>
                <div style={{ fontWeight: 800, fontSize: 12, color: "var(--muted)", letterSpacing: ".05em", marginBottom: 8 }}>GHI CHÚ</div>
                <textarea autoFocus value={current.note} onChange={(e) => setNote(current.id, e.target.value)} placeholder="Nhập ghi chú của bạn…"
                  style={{ width: "100%", height: 80, resize: "none", border: "2px solid var(--line-strong)", borderRadius: 10, padding: "8px 10px", fontWeight: 600, fontSize: 14, lineHeight: 1.5 }} />
              </div>
            ) : (
              <div style={{ fontWeight: 700, fontSize: 14, color: "var(--ink-soft)", marginBottom: 10 }}>Đoạn đã tô màu</div>
            )}
            <div className="row" style={{ gap: 8, marginTop: 10 }}>
              <button onClick={() => remove(current.id)} className="row" style={{ gap: 6, flex: 1, justifyContent: "center", padding: "8px 10px", borderRadius: 9, border: "2px solid var(--line-strong)", background: "#fff", color: "var(--danger)", fontWeight: 800, fontSize: 13 }}><IT.x size={15} /> Xóa</button>
              <button onClick={() => setPop(null)} style={{ flex: 1, padding: "8px 10px", borderRadius: 9, border: "none", background: "var(--ink)", color: "#fff", fontWeight: 800, fontSize: 13 }}>Xong</button>
            </div>
          </div>
        </div>
      )}
    </React.Fragment>
  );

  return { registerRoot, onMouseUp, onClick, overlay, hasItems: items.length > 0 };
}

function TestPage({ courseId, weekNum, kind }) {
  const s = useStoreT();
  const D = window.TID_DATA;
  const course = D.courses[courseId];
  const week = course && course.weeks.find((w) => w.number === weekNum);
  const test = week && week[kind];

  const courseAccent = courseId === "reading" ? "var(--reading)" : "var(--listening)";
  const courseDeep = courseId === "reading" ? "var(--reading-deep)" : "var(--listening-deep)";
  const courseTint = courseId === "reading" ? "var(--reading-tint)" : "var(--listening-tint)";
  const pro = s.testTheme === "pro";
  const th = tThemeT(pro, courseAccent, courseDeep, courseTint);
  const accent = th.accent;

  const [activePart, setActivePart] = useStateT(0);
  const [activeRow, setActiveRow] = useStateT(null);
  const [showSubmit, setShowSubmit] = useStateT(false);
  const [fontScale, setFontScale] = useStateT(1);
  const paneRef = useRefT(null);
  const refMap = useRefT({});
  const HL = useHighlighter();

  if (!test || !test.parts || !test.parts.length) { goT("/"); return null; }
  if (!weekUnlockedT(s.unlocked[courseId], weekNum)) { goT(`/c/${courseId}`); return null; }

  const kindLabel = kind === "classwork" ? "Bài Tập Trên Lớp" : "Bài Tập Về Nhà";
  const displayTitle = `${kindLabel} - Week ${weekNum}`;

  const answers = s.answers[test.id] || {};
  const parts = test.parts;
  const pi = Math.min(activePart, parts.length - 1);
  const part = parts[pi];

  // question numbers per part (across all parts)
  const perPart = useMemoT(() => parts.map((p) => partQNums(p)), [test.id]);
  const totalQ = perPart.reduce((a, q) => a + q.length, 0);
  const answeredCount = parts.reduce((sum, p, i) => {
    const sa = scopeAnswers(answers, i);
    return sum + perPart[i].filter((n) => isAnsT(sa, n)).length;
  }, 0);

  const partAnswers = scopeAnswers(answers, pi);
  const setA = (n, v) => setAnswerT(test.id, `${pi}:${n}`, v);
  const regRef = (n, el) => { if (el) refMap.current[`${pi}:${n}`] = el; };
  const qnums = perPart[pi];

  function scrollToQ(n) {
    const el = refMap.current[`${pi}:${n}`];
    const pane = paneRef.current;
    if (!el || !pane) return;
    const er = el.getBoundingClientRect(), pr = pane.getBoundingClientRect();
    pane.scrollTo({ top: pane.scrollTop + (er.top - pr.top) - 90, behavior: "smooth" });
    const grp = part.groups.find((g) => g.kind && g.kind.startsWith("matching-info") && g.questions && g.questions.some((q) => q.n === n));
    if (grp) setActiveRow(n);
  }
  function switchPart(i) { setActivePart(i); setActiveRow(null); if (paneRef.current) paneRef.current.scrollTo({ top: 0 }); }

  const hasPassage = !!part.passage;

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#fff", overflow: "hidden" }}
      onMouseUp={HL.onMouseUp} onClick={HL.onClick}>
      <TestHeader test={test} title={displayTitle} answeredCount={answeredCount} total={totalQ}
        onSubmit={() => setShowSubmit(true)} accent={accent} th={th}
        theme={s.testTheme} onTheme={(v) => setStateT({ testTheme: v })} courseId={courseId}
        fontScale={fontScale} setFontScale={setFontScale} />

      {/* Part banner — exam-style flat strip, shown only in "Thi Thật" (pro).
         In "Vui tươi" the bar under the nav is removed; part selection lives in the footer. */}
      {pro && (
        <div style={{ background: "#f1f2ed", borderBottom: "1px solid #e3e5de", flex: "none" }}>
          <div style={{ padding: "14px 24px", maxWidth: 1500, margin: "0 auto" }}>
            <div style={{ fontFamily: th.titleFont, fontWeight: 700, fontSize: 18, color: "#1a1f2b" }}>{part.part}</div>
            <div style={{ color: "#4b5563", fontWeight: 400, fontSize: 14.5, marginTop: 3, fontFamily: th.font }}>
              {part.instruction || (hasPassage ? "Read the passage and answer the questions in this section." : "Listen and answer the questions in this section.")}
            </div>
          </div>
        </div>
      )}

      {part.audio && <AudioBar key={part.audio.url || part.part} accent={accent} th={th} label={part.audio.label} url={part.audio.url} />}

      {/* body */}
      {hasPassage ? (
        <div style={{ flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: "1.05fr 6px 1fr", maxWidth: 1500, margin: "0 auto", width: "100%" }}>
          <div ref={HL.registerRoot(`passage-${pi}`)} className="thin-scroll hl-root" style={{ overflowY: "auto", padding: "26px 30px 60px", zoom: fontScale }}>
            <Passage passage={part.passage} th={th} />
          </div>
          <div style={{ background: "var(--line)", position: "relative" }}>
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 26, height: 46, background: "#fff", border: `2px solid ${th.lineStrong}`, borderRadius: 8, display: "grid", placeItems: "center", color: "var(--muted-2)" }}>
              <svg width="12" height="20" viewBox="0 0 12 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 2v16M2 7l4-4 4 4M2 13l4 4 4-4"/></svg>
            </div>
          </div>
          <div ref={(el) => { paneRef.current = el; HL.registerRoot(`questions-${pi}`)(el); }} className="thin-scroll hl-root" style={{ overflowY: "auto", padding: "26px 30px 80px", zoom: fontScale }}>
            <QuestionPane part={part} partAnswers={partAnswers} setA={setA} accent={accent}
              activeRow={activeRow} setActiveRow={setActiveRow} regRef={regRef} th={th}
              qnums={qnums} scrollToQ={scrollToQ} />
          </div>
        </div>
      ) : (
        <div ref={(el) => { paneRef.current = el; HL.registerRoot(`questions-${pi}`)(el); }} className="thin-scroll hl-root" style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "26px 30px 80px", zoom: fontScale }}>
          <div style={{ maxWidth: 820, margin: "0 auto" }}>
            <QuestionPane part={part} partAnswers={partAnswers} setA={setA} accent={accent}
              activeRow={activeRow} setActiveRow={setActiveRow} regRef={regRef} th={th}
              qnums={qnums} scrollToQ={scrollToQ} />
          </div>
        </div>
      )}

      <TestFooter part={part} qnums={qnums} partAnswers={partAnswers} onChip={scrollToQ}
        onSubmit={() => setShowSubmit(true)} accent={accent} th={th}
        parts={parts} pi={pi} switchPart={switchPart} perPart={perPart} answers={answers} />

      {HL.overlay}

      {showSubmit && <SubmitModal test={test} parts={parts} perPart={perPart} answers={answers} courseId={courseId}
        weekNum={weekNum} kind={kind} name={s.name} onClose={() => setShowSubmit(false)} accent={accent} />}
    </div>
  );
}

function QuestionPane({ part, partAnswers, setA, accent, activeRow, setActiveRow, regRef, th, qnums, scrollToQ }) {
  return (
    <div style={{ display: "grid", gap: 36 }}>
      {part.groups.map((g) => (
        <div key={g.id}>
          <RenderGroupT group={g} answers={partAnswers} setA={setA} accent={accent}
            activeRow={activeRow} setActiveRow={setActiveRow} regRef={regRef} th={th} />
        </div>
      ))}
      <div className="row" style={{ gap: 10, justifyContent: "flex-end", paddingTop: 8 }}>
        <NavArrow dir="left" th={th} onClick={() => { const next = qnums.find((n) => !isAnsT(partAnswers, n)); if (next) scrollToQ(next); }} />
        <NavArrow dir="right" th={th} onClick={() => { const next = qnums.find((n) => !isAnsT(partAnswers, n)); if (next) scrollToQ(next); }} />
      </div>
    </div>
  );
}

/* ---- header + stopwatch ---- */
function ThemeToggle({ theme, onTheme }) {
  const opts = [{ k: "playful", label: "Vui tươi" }, { k: "pro", label: "Thi Thật" }];
  return (
    <div className="row" style={{ gap: 3, padding: 3, borderRadius: 999, background: "var(--bg)", border: "1.5px solid var(--line-strong)", flex: "none" }}>
      {opts.map((o) => {
        const on = theme === o.k;
        return (
          <button key={o.k} onClick={() => onTheme(o.k)} style={{ padding: "6px 13px", borderRadius: 999, border: "none", background: on ? "var(--ink)" : "transparent", color: on ? "#fff" : "var(--muted)", fontWeight: 800, fontSize: 12.5, whiteSpace: "nowrap" }}>{o.label}</button>
        );
      })}
    </div>
  );
}

/* ---- font-size stepper (works in both interfaces) ---- */
function FontSizeCtl({ fontScale, setFontScale, pro }) {
  const dec = () => setFontScale((v) => Math.max(0.85, Math.round((v - 0.1) * 100) / 100));
  const inc = () => setFontScale((v) => Math.min(1.5, Math.round((v + 0.1) * 100) / 100));
  const base = pro
    ? { width: 30, height: 30, borderRadius: 7, border: "1.5px solid #c7cdd8", background: "#fff", color: "#374151" }
    : { width: 30, height: 30, borderRadius: 8, border: "2px solid var(--line-strong)", background: "#fff", color: "var(--ink)", boxShadow: "var(--shadow-card-sm)" };
  return (
    <div className="row" data-hl-ui style={{ gap: pro ? 4 : 5, flex: "none" }} title="Cỡ chữ">
      <button onClick={dec} aria-label="Giảm cỡ chữ" style={{ ...base, display: "grid", placeItems: "center", fontWeight: 800, fontSize: 12, fontFamily: th2Font(pro) }}>A−</button>
      <button onClick={inc} aria-label="Tăng cỡ chữ" style={{ ...base, display: "grid", placeItems: "center", fontWeight: 800, fontSize: 16, fontFamily: th2Font(pro) }}>A+</button>
    </div>
  );
}
function th2Font(pro) { return pro ? "var(--font-pro)" : "var(--font-body)"; }

function TestHeader({ test, title, answeredCount, total, onSubmit, accent, th, theme, onTheme, courseId, fontScale, setFontScale }) {
  const elapsed = useStopwatch(test.id);
  const pro = th.pro;

  if (pro) {
    return (
      <header style={{ borderBottom: "1px solid #e3e5de", background: "#fff", flex: "none" }}>
        <div style={{ height: 64, padding: "0 24px", display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 16 }}>
          {/* Left: brand + title */}
          <div className="row" style={{ gap: 14, minWidth: 0, justifySelf: "start" }}>
            <button onClick={() => history.back()} aria-label="Quay lại" style={{ flex: "none", background: "none", border: "none", padding: 0, display: "flex", alignItems: "center" }}>
              <LogoT small />
            </button>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: th.titleFont, fontWeight: 700, fontSize: 16.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "#111827", lineHeight: 1.25 }}>{title}</div>
              <div style={{ fontSize: 13, color: "#6b7280", fontWeight: 500 }}>{test.skill} · {total} Qs</div>
            </div>
          </div>
          {/* Center: stopwatch (same direction as playful, pro styling) */}
          <div className="row" style={{ justifySelf: "center", gap: 9, padding: "7px 18px", borderRadius: 10, border: "1.5px solid #dbe0e8", background: "#f5f7fa", flex: "none" }}>
            <IT.clock size={17} style={{ color: "#4b5563" }} />
            <span style={{ fontFamily: "var(--font-pro)", fontVariantNumeric: "tabular-nums", fontWeight: 700, fontSize: 20, color: "#111827", letterSpacing: ".04em" }}>{fmt(elapsed)}</span>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: "#6b7280", fontFamily: "var(--font-pro)", textTransform: "uppercase", letterSpacing: ".06em" }}>Time</span>
          </div>
          {/* Right: font size + submit + status icons */}
          <div className="row" style={{ gap: 14, justifySelf: "end" }}>
            <FontSizeCtl fontScale={fontScale} setFontScale={setFontScale} pro />
            <button onClick={onSubmit} style={{ padding: "9px 22px", borderRadius: 8, border: "none", background: accent, color: "#fff", fontWeight: 700, fontSize: 14.5, cursor: "pointer", flex: "none", letterSpacing: ".01em" }}>Submit Test</button>
            <div className="row" style={{ gap: 16, color: "#4b5563", flex: "none" }}>
              <IT.wifi size={20} />
              <IT.bell size={20} />
              <IT.menu size={22} />
            </div>
          </div>
        </div>
      </header>
    );
  }

  /* Vui tươi: back · centered stopwatch · font size + count (Nộp bài is in the footer) */
  return (
    <header style={{ borderBottom: "2px solid var(--line)", background: "#fff", flex: "none" }}>
      <div style={{ height: 60, padding: "0 22px", display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 16 }}>
        <div className="row" style={{ gap: 8, justifySelf: "start" }}>
          <button onClick={() => history.back()} style={{ width: 34, height: 34, borderRadius: 9, border: "1.5px solid var(--line-strong)", background: "#fff", display: "grid", placeItems: "center", flex: "none", boxShadow: "var(--shadow-card-sm)" }} aria-label="Quay lại"><IT.chevL size={18} /></button>
          <FontSizeCtl fontScale={fontScale} setFontScale={setFontScale} />
        </div>
        {/* center: stopwatch */}
        <div className="row" style={{ justifySelf: "center", gap: 10, padding: "5px 16px", borderRadius: 999, background: th.tint, border: `1.5px solid var(--line-strong)`, boxShadow: "var(--shadow-card-sm)" }}>
          <span style={{ width: 28, height: 28, borderRadius: "50%", background: accent, color: "#fff", display: "grid", placeItems: "center", flex: "none" }}><IT.clock size={15} /></span>
          <span className="mono-num" style={{ fontWeight: 700, fontSize: 22, lineHeight: 1, color: "var(--ink)", letterSpacing: ".02em" }}>{fmt(elapsed)}</span>
          <span style={{ fontWeight: 800, fontSize: 10, color: "var(--muted)", whiteSpace: "nowrap", textTransform: "uppercase", letterSpacing: ".05em", lineHeight: 1.2 }}>time<br/>elapsed</span>
        </div>
        <div className="row" style={{ gap: 12, justifySelf: "end" }}>
          <span className="pill" style={{ background: "var(--bg)", color: "var(--ink)", padding: "6px 12px", border: "2px solid var(--line-strong)", flex: "none", fontSize: 14 }}>
            <b className="mono-num">{answeredCount}</b>/{total} Qs
          </span>
        </div>
      </div>
    </header>
  );
}

function useStopwatch(testId) {
  // The stopwatch resets to 0 on every fresh entry to the test and counts ONLY
  // the active time spent on this screen — the interval ticks while mounted and
  // stops on exit, so time spent away from the test is never added. The live
  // value is mirrored to localStorage (testElapsed) so the submit modal reads
  // the exact same number instead of recomputing from a stale wall-clock start.
  const [now, setNow] = useStateT(Date.now());
  const startRef = useRefT(Date.now());
  useEffectT(() => {
    startRef.current = Date.now();
    const persist = (secs) => {
      const st = JSON.parse(localStorage.getItem("tid_rl_v1") || "{}");
      st.testElapsed = st.testElapsed || {};
      st.testElapsed[testId] = secs;
      if (st.testStart) delete st.testStart; // retire the old wall-clock model
      localStorage.setItem("tid_rl_v1", JSON.stringify(st));
    };
    persist(0);
    setNow(Date.now());
    const id = setInterval(() => {
      const n = Date.now();
      setNow(n);
      persist(Math.max(0, Math.floor((n - startRef.current) / 1000)));
    }, 1000);
    return () => clearInterval(id);
  }, [testId]);
  return Math.max(0, Math.floor((now - startRef.current) / 1000));
}
function fmt(s) { const m = Math.floor(s / 60); return `${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`; }
function fmtRemaining(elapsed, total) {
  const rem = Math.max(0, total - elapsed);
  const m = Math.floor(rem / 60);
  return `${String(m).padStart(2, "0")}:${String(rem % 60).padStart(2, "0")}`;
}

/* ---- passage ---- */
function Passage({ passage, th }) {
  return (
    <article style={{ maxWidth: 680 }}>
      <h2 style={{ fontFamily: th.titleFont, fontWeight: th.pro ? 700 : 600, fontSize: th.pro ? 20 : 27, margin: th.pro ? "0 0 14px" : "0 0 18px", lineHeight: 1.25, textAlign: th.pro ? "left" : "center" }}>{passage.title}</h2>
      <div style={{ fontFamily: th.read, fontWeight: 400, fontSize: th.readSize, lineHeight: th.readLh, color: "var(--ink)", textAlign: th.readAlign }}>
        {passage.paras.map((p, i) => p.subhead
          ? <h3 key={i} style={{ fontFamily: th.titleFont, fontWeight: th.pro ? 700 : 600, fontSize: th.pro ? 17 : 18, margin: "20px 0 10px", lineHeight: 1.3, color: "var(--ink)" }}>{p.text}</h3>
          : <p key={i} style={{ margin: "0 0 16px" }}>
              {p.tag && <b style={{ fontFamily: th.titleFont, marginRight: 7 }}>{p.tag}</b>}{p.text}
            </p>
        )}
      </div>
    </article>
  );
}

/* ---- audio (listening) ---- */
function AudioBar({ accent, th, label, url }) {
  const audioRef = useRefT(null);
  const rateWrapRef = useRefT(null);
  const [playing, setPlaying] = useStateT(false);
  const [t, setT] = useStateT(0);
  const [dur, setDur] = useStateT(0);
  const [rate, setRate] = useStateT(1);
  const [rateOpen, setRateOpen] = useStateT(false);
  const bd = th.pro ? th.lineStrong : "var(--ink)";
  const RATES = [0.5, 0.75, 1, 1.25, 1.5, 2];

  function toggle() {
    const a = audioRef.current; if (!a) return;
    if (a.paused) a.play().catch(() => {}); else a.pause();
  }
  function pickRate(r) {
    setRate(r);
    if (audioRef.current) audioRef.current.playbackRate = r;
    setRateOpen(false);
  }
  useEffectT(() => {
    if (!rateOpen) return;
    const onDoc = (e) => { if (rateWrapRef.current && !rateWrapRef.current.contains(e.target)) setRateOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [rateOpen]);
  function seek(e) {
    const a = audioRef.current; if (!a || !dur) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    a.currentTime = ratio * dur; setT(a.currentTime);
  }
  const pct = dur ? (t / dur) * 100 : 0;

  return (
    <div style={{ background: th.pro ? "#f4f6f8" : "var(--listening-tint)", borderBottom: `${th.pro ? "1px" : "2px"} solid ${bd}` }}>
      {url && (
        <audio ref={audioRef} src={url} preload="metadata"
          onLoadedMetadata={(e) => { setDur(e.target.duration || 0); e.target.playbackRate = rate; }}
          onTimeUpdate={(e) => setT(e.target.currentTime)}
          onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)} />
      )}
      <div className="row" style={{ gap: 16, padding: "12px 26px", maxWidth: 1500, margin: "0 auto" }}>
        <button onClick={toggle} disabled={!url} style={{ width: 46, height: 46, borderRadius: "50%", border: `2.5px solid ${bd}`, background: th.pro ? accent : "#fff", color: th.pro ? "#fff" : accent, display: "grid", placeItems: "center", flex: "none", boxShadow: th.btnShadow, cursor: url ? "pointer" : "not-allowed", opacity: url ? 1 : 0.5 }}>
          {playing ? <IT.pause size={20} /> : <IT.play size={20} />}
        </button>
        <span className="mono-num" style={{ fontWeight: 700, fontSize: 14 }}>{fmt(Math.floor(t))}</span>
        <div onClick={seek} style={{ flex: 1, height: 8, borderRadius: 999, background: "#fff", border: `${th.pro ? "1px" : "2px"} solid ${bd}`, overflow: "hidden", cursor: url ? "pointer" : "default" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: accent }}></div>
        </div>
        <span className="mono-num" style={{ fontWeight: 700, fontSize: 14, color: "var(--muted)" }}>{dur ? fmt(Math.floor(dur)) : "--:--"}</span>
        <div ref={rateWrapRef} style={{ position: "relative", flex: "none" }}>
          <button onClick={() => url && setRateOpen((o) => !o)} disabled={!url} title="Tốc độ phát"
            style={{ background: url ? accent : "#e5e7eb", color: "#fff", border: `2px solid ${bd}`, borderRadius: 999, padding: "6px 12px", fontSize: 13.5, fontWeight: 800, whiteSpace: "nowrap", cursor: url ? "pointer" : "not-allowed", display: "flex", alignItems: "center", gap: 6, boxShadow: th.btnShadow, lineHeight: 1 }}>
            {rate}×
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: rateOpen ? "rotate(180deg)" : "none", transition: "transform .15s" }}><path d="M6 9l6 6 6-6" /></svg>
          </button>
          {rateOpen && (
            <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, background: "#fff", border: `2px solid ${bd}`, borderRadius: 12, boxShadow: "0 8px 22px rgba(0,0,0,.16)", padding: 5, zIndex: 60, minWidth: 104 }}>
              {RATES.map((r) => (
                <button key={r} onClick={() => pickRate(r)}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", textAlign: "left", padding: "8px 12px", border: "none", background: r === rate ? (th.tint || "var(--listening-tint)") : "transparent", color: "var(--ink)", fontWeight: r === rate ? 800 : 600, fontSize: 14, borderRadius: 8, cursor: "pointer", whiteSpace: "nowrap" }}>
                  <span>{r}×{r === 1 ? " · Chuẩn" : ""}</span>
                  {r === rate && <IT.check size={15} style={{ color: accent }} />}
                </button>
              ))}
            </div>
          )}
        </div>
        <span className="pill" style={{ background: "#fff", border: `${th.pro ? "1px" : "2px"} solid ${bd}`, padding: "5px 12px", fontSize: 12, whiteSpace: "nowrap" }}>🎧 {label || "Audio"}</span>
      </div>
    </div>
  );
}

/* ---- nav arrow ---- */
function NavArrow({ dir, onClick, th }) {
  const pro = th.pro;
  if (pro) {
    const isRight = dir === "right";
    return (
      <button onClick={onClick} style={{
        width: 46, height: 46, borderRadius: 999, border: "none",
        background: isRight ? "#1f2733" : "#d3d8dd", display: "grid", placeItems: "center",
        color: isRight ? "#fff" : "#7c848e", cursor: "pointer",
      }} aria-label={dir}>
        {isRight ? <IT.chevR size={22} /> : <IT.chevL size={22} />}
      </button>
    );
  }
  return (
    <button onClick={onClick} style={{
      width: 54, height: 48, borderRadius: th.r,
      border: `2px solid ${th.lineStrong}`,
      background: "#f6f6f6", display: "grid", placeItems: "center",
      color: "var(--ink-soft)",
    }} aria-label={dir}>
      {dir === "left" ? <IT.chevL size={22} /> : <IT.chevR size={22} />}
    </button>
  );
}

/* ---- footer: part tabs with the active part's question chips shown inline
   right after it (other parts collapse) + submit ---- */
function TestFooter({ part, qnums, partAnswers, onChip, onSubmit, accent, th, parts, pi, switchPart, perPart, answers }) {
  const pro = th.pro;
  const multi = parts.length > 1;

  const chip = (n) => {
    const on = isAnsT(partAnswers, n);
    return (
      <button key={n} onClick={() => onChip(n)} style={{
        flex: "none", width: 30, height: 30, borderRadius: pro ? 6 : th.rSm,
        fontFamily: "system-ui, -apple-system, sans-serif", fontWeight: 700, fontSize: 14,
        border: `${pro ? "1.5px" : "2px"} solid ${on ? accent : th.lineStrong}`,
        background: on ? accent : "#fff", color: on ? "#fff" : (pro ? "#374151" : "var(--ink)"), transition: "all .12s",
      }}>{n}</button>
    );
  };
  const chipsRow = (
    <div className="row" style={{ gap: pro ? 5 : 7, flex: "none" }}>{qnums.map(chip)}</div>
  );
  const partTab = (p, i) => {
    const on = i === pi;
    const sa = scopeAnswers(answers, i);
    const ans = perPart[i].filter((n) => isAnsT(sa, n)).length;
    const tot = perPart[i].length;
    const done = tot > 0 && ans === tot;
    if (pro) {
      // Real-exam footer: active part = bold label, inactive = gray label + "X of Y"
      return (
        <button onClick={() => switchPart(i)} className="row" style={{
          gap: 7, padding: "6px 10px", border: "none", background: "transparent", flex: "none", whiteSpace: "nowrap", cursor: "pointer",
          borderBottom: on ? `2px solid ${accent}` : "2px solid transparent",
        }}>
          <span style={{ fontFamily: th.titleFont, fontWeight: on ? 700 : 500, fontSize: 14.5, color: on ? "#111827" : "#6b7280" }}>{p.part}</span>
          {!on && <span style={{ fontSize: 12.5, fontWeight: 400, color: done ? "var(--ok)" : "#9aa3ad", fontFamily: th.titleFont }}>{ans} of {tot}</span>}
        </button>
      );
    }
    return (
      <button onClick={() => switchPart(i)} className="row" style={{
        gap: 6, padding: "8px 14px", borderRadius: th.pill, flex: "none", whiteSpace: "nowrap",
        border: `2.5px solid ${on ? "var(--ink)" : th.lineStrong}`,
        background: on ? accent : "#fff", color: on ? "#fff" : "var(--ink)",
        fontWeight: 800, fontSize: 13.5, fontFamily: th.font,
        boxShadow: on ? "var(--shadow-card-sm)" : "none",
      }}>
        {p.part}
        {done && <span style={{ width: 6, height: 6, borderRadius: "50%", background: on ? "#fff" : "var(--ok)" }} />}
      </button>
    );
  };

  return (
    <footer style={{ borderTop: pro ? "1px solid #e3e5de" : "2px solid var(--line)", background: pro ? "#f9fafc" : "#fff", flex: "none" }}>
      <div className="row" style={{ padding: pro ? "10px 22px" : "11px 22px", gap: 14, justifyContent: "space-between" }}>
        <div className="row thin-scroll" style={{ gap: 10, minWidth: 0, flex: 1, overflowX: "auto", paddingBottom: 2 }}>
          {multi ? (
            parts.map((p, i) => (
              <React.Fragment key={i}>
                {partTab(p, i)}
                {/* the selected part's question boxes appear right after its tab */}
                {i === pi && chipsRow}
                {i === pi && i < parts.length - 1 && <div style={{ width: 1, height: 24, background: pro ? "#dde1e9" : "var(--line)", flex: "none", margin: "0 4px" }} />}
              </React.Fragment>
            ))
          ) : (
            <React.Fragment>
              <span style={{ fontFamily: th.titleFont, fontWeight: 700, fontSize: pro ? 14 : 16, whiteSpace: "nowrap", color: pro ? "#1a1f2b" : "var(--ink)", flex: "none" }}>{part.part}</span>
              <div style={{ width: 1, height: 24, background: pro ? "#dde1e9" : "var(--line)", flex: "none" }} />
              {chipsRow}
            </React.Fragment>
          )}
        </div>
        {pro ? (
          <button onClick={onSubmit} style={{ padding: "9px 22px", borderRadius: 8, border: "none", background: accent, color: "#fff", fontWeight: 700, fontSize: 14.5, cursor: "pointer", flex: "none", letterSpacing: ".01em" }}>Submit Test</button>
        ) : (
          <button onClick={onSubmit} className="btn btn-primary" style={{ padding: "12px 28px", fontSize: 16, flex: "none" }}>Submit</button>
        )}
      </div>
    </footer>
  );
}

/* ---- submit → google doc ---- */
function buildAnswerSheet(test, parts, perPart, answers, name, courseName, weekNum, kindLabel, elapsed) {
  const lines = [];
  lines.push(`BÀI LÀM — ${courseName} · Week ${weekNum} · ${kindLabel}`);
  lines.push(`Đề: ${test.title}`);
  lines.push(`Học viên: ${name || "(chưa nhập tên)"}`);
  lines.push(`Thời gian làm bài: ${Math.floor(elapsed / 60)} phút ${elapsed % 60} giây`);
  lines.push(`Ngày nộp: ${new Date().toLocaleString("vi-VN")}`);
  lines.push("");
  lines.push("ĐÁP ÁN:");
  parts.forEach((p, i) => {
    if (parts.length > 1) lines.push(`— ${p.part} —`);
    const sa = scopeAnswers(answers, i);
    perPart[i].forEach((n) => {
      let v = sa[n];
      if (Array.isArray(v)) v = v.join(", ");
      lines.push(`${n}. ${v && String(v).trim() ? v : "—"}`);
    });
  });
  return lines.join("\n");
}

// Đáp án gom theo passage (1-based) cho Apps Script: { "1": { "1":"...", "5":"D" }, "2": {...} }
function buildAnswerPayload(parts, perPart, answers) {
  const out = {};
  parts.forEach((p, i) => {
    const sa = scopeAnswers(answers, i);
    const m = {};
    perPart[i].forEach((n) => {
      const v = sa[n];
      if (v == null) return;
      if (Array.isArray(v)) { if (v.length) m[n] = v; }
      else if (String(v).trim() !== "") m[n] = v;
    });
    out[String(i + 1)] = m;
  });
  return out;
}

function DocSpinner({ size = 22, accent }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ flex: "none" }}>
      <circle cx="12" cy="12" r="9" fill="none" stroke="var(--line)" strokeWidth="3" />
      <path d="M12 3a9 9 0 0 1 9 9" fill="none" stroke={accent || "var(--test-blue)"} strokeWidth="3" strokeLinecap="round">
        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}

function SubmitModal({ test, parts, perPart, answers, courseId, weekNum, kind, name, onClose, accent }) {
  const D = window.TID_DATA;
  const courseName = D.courses[courseId].name;
  const kindLabel = kind === "classwork" ? "Bài tập trên lớp" : "Bài tập về nhà";
  // Homework with an answer key → instant self-check + shareable result link
  // (no Google Doc). Classwork (and any homework still lacking a key) keep the Doc flow.
  const isHwGraded = kind === "homework" && test.answerKey && Object.keys(test.answerKey).length > 0;
  const st = JSON.parse(localStorage.getItem("tid_rl_v1") || "{}");
  const elapsed = Math.max(0, ((st.testElapsed || {})[test.id]) || 0);
  const totalQ = perPart.reduce((a, q) => a + q.length, 0);
  const answered = parts.reduce((sum, p, i) => { const sa = scopeAnswers(answers, i); return sum + perPart[i].filter((n) => isAnsT(sa, n)).length; }, 0);
  const sheet = useMemoT(() => buildAnswerSheet(test, parts, perPart, answers, name, courseName, weekNum, kindLabel, elapsed), []);
  const [copied, setCopied] = useStateT(false);
  const [confirmed, setConfirmed] = useStateT(false);
  const [sending, setSending] = useStateT(false);
  const [docUrl, setDocUrl] = useStateT("");
  const [docError, setDocError] = useStateT("");

  function copy() {
    navigator.clipboard?.writeText(sheet).then(() => setCopied(true)).catch(() => {
      const ta = document.createElement("textarea"); ta.value = sheet; document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); setCopied(true); } catch (e) {} document.body.removeChild(ta);
    });
  }

  function createDoc() {
    if (!D.docScriptUrl) { setDocError("Chưa cấu hình dịch vụ tạo Google Doc."); return; }
    setSending(true); setDocError(""); setDocUrl("");
    const st = JSON.parse(localStorage.getItem("tid_rl_v1") || "{}");
    const payload = {
      secret: D.docSecret,
      course: courseId,
      week: weekNum,
      kind,
      student: name || "",
      email: st.email || "",
      elapsed,
      answers: buildAnswerPayload(parts, perPart, answers),
    };
    fetch(D.docScriptUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
      redirect: "follow",
    })
      .then((r) => r.json())
      .then((data) => {
        if (data && data.ok && data.url) setDocUrl(data.url);
        else setDocError((data && data.error) || "Không tạo được file. Thử lại hoặc dùng cách thủ công bên dưới.");
      })
      .catch((e) => setDocError("Lỗi kết nối: " + String(e && e.message ? e.message : e)))
      .finally(() => setSending(false));
  }

  function finalize() {
    submitTestT(test.id, elapsed);
    if (isHwGraded) {
      const payload = { v: 1, c: courseId, w: weekNum, k: kind, n: name || "", e: elapsed, a: buildAnswerPayload(parts, perPart, answers), t: Date.now() };
      goT(`/r/${encodeResultT(payload)}`);
      return;
    }
    setConfirmed(true); createDoc();
  }

  if (!confirmed) {
    return (
      <Modal onClose={onClose}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 60, height: 60, borderRadius: 16, margin: "0 auto", background: "var(--test-blue-tint)", color: "var(--test-blue)", border: "1.5px solid var(--line-strong)", display: "grid", placeItems: "center" }}><IT.flag size={26} /></div>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 26, margin: "16px 0 4px" }}>Submit?</h2>
          <p style={{ color: "var(--muted)", fontWeight: 700, fontSize: 15, margin: "0 0 18px", lineHeight: 1.5 }}>
            You've answered <b style={{ color: "var(--ink)" }}>{answered}/{totalQ}</b> questions · time <b style={{ color: "var(--ink)" }}>{Math.floor(elapsed / 60)}m{String(elapsed % 60).padStart(2, "0")}s</b>.<br/>
            {isHwGraded
              ? "Nộp xong em xem được kết quả và lời giải từng câu ngay, rồi gửi link cho thầy."
              : "Your answers will be prepared for the Google Doc after submitting."}
          </p>
          {answered < totalQ && (
            <div className="row" style={{ gap: 8, justifyContent: "center", color: "var(--warn)", fontWeight: 800, fontSize: 14, marginBottom: 16 }}>
              <IT.flag size={16} /> {totalQ - answered} question{totalQ - answered !== 1 ? "s" : ""} unanswered
            </div>
          )}
          <div className="row" style={{ gap: 12 }}>
            <button onClick={onClose} className="btn btn-ghost" style={{ flex: 1, padding: 14 }}>Keep working</button>
            <button onClick={finalize} className="btn btn-primary" style={{ flex: 1, padding: 14 }}>Submit <IT.check size={18} /></button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal onClose={onClose} wide>
      <div className="row" style={{ gap: 12, marginBottom: 16 }}>
        <div style={{ width: 50, height: 50, borderRadius: 14, background: "#e7f7ee", color: "var(--ok)", border: "1.5px solid var(--line-strong)", display: "grid", placeItems: "center", flex: "none" }}><IT.check size={24} /></div>
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 24, margin: 0 }}>Đã nộp bài!</h2>
          <p style={{ color: "var(--muted)", fontWeight: 700, fontSize: 14, margin: "2px 0 0" }}>
            {sending ? "Đang tạo bài làm trên Google Doc…" : docUrl ? "Bài làm của bạn đã sẵn sàng để thầy chữa." : "Đang chuẩn bị bài làm…"}
          </p>
        </div>
      </div>

      {/* Loading */}
      {sending && (
        <div className="row" style={{ gap: 12, padding: "20px 18px", border: "2px solid var(--line-strong)", borderRadius: 14, background: "#fbfbfa", marginBottom: 4 }}>
          <DocSpinner size={26} accent="var(--test-blue)" />
          <div style={{ fontWeight: 700, fontSize: 15, color: "var(--ink-soft)", lineHeight: 1.5 }}>
            Đang tạo bản sao Google Doc và điền đáp án của bạn…<br />
            <span style={{ fontWeight: 600, fontSize: 13.5, color: "var(--muted)" }}>Việc này mất vài giây.</span>
          </div>
        </div>
      )}

      {/* Success */}
      {!sending && docUrl && (
        <div style={{ padding: "18px", border: "2px solid var(--line-strong)", borderRadius: 14, background: "#f3fbf6", marginBottom: 4 }}>
          <p style={{ margin: "0 0 14px", color: "var(--ink-soft)", fontWeight: 600, fontSize: 14.5, lineHeight: 1.55 }}>
            Bài làm đã được tạo trên Google Doc (lưu trong Drive của thầy). Mở ra để cùng thầy chữa qua Google Meet.
          </p>
          <a href={docUrl} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ width: "100%", textDecoration: "none" }}>
            <IT.doc size={18} /> Mở bài làm trên Google Doc <IT.externalLink size={16} />
          </a>
          <button onClick={copy} className="btn btn-ghost" style={{ width: "100%", marginTop: 10 }}>
            {copied ? <><IT.check size={18} /> Đã sao chép đáp án</> : <><IT.copy size={18} /> Sao chép đáp án (dự phòng)</>}
          </button>
        </div>
      )}

      {/* Error → fallback thủ công */}
      {!sending && docError && (
        <div>
          <div className="row" style={{ gap: 10, padding: "12px 14px", border: "2px solid var(--warn)", borderRadius: 12, background: "#fff8ec", marginBottom: 6 }}>
            <IT.flag size={18} style={{ color: "var(--warn)", flex: "none", marginTop: 2 }} />
            <div style={{ fontWeight: 700, fontSize: 13.5, color: "var(--ink-soft)", lineHeight: 1.5 }}>
              Không tạo được file tự động ({docError}).
              <button onClick={createDoc} style={{ marginLeft: 6, border: "none", background: "none", color: "var(--test-blue)", fontWeight: 800, textDecoration: "underline", cursor: "pointer", padding: 0 }}>Thử lại</button>
              <br />Bạn có thể gửi đáp án thủ công bên dưới.
            </div>
          </div>

          <Step n={1} title="Sao chép đáp án">
            <textarea readOnly value={sheet} className="thin-scroll" style={{ width: "100%", height: 150, borderRadius: 12, border: "2px solid var(--line-strong)", padding: "12px 14px", fontFamily: "ui-monospace, monospace", fontSize: 13, lineHeight: 1.5, resize: "none", background: "#fbfbfa", color: "var(--ink)" }} />
            <button onClick={copy} className="btn btn-ink" style={{ marginTop: 10, width: "100%" }}>
              {copied ? <><IT.check size={18} /> Đã sao chép vào clipboard</> : <><IT.copy size={18} /> Sao chép đáp án</>}
            </button>
          </Step>

          <Step n={2} title="Dán vào file Google Doc của bạn">
            <p style={{ margin: "0 0 12px", color: "var(--ink-soft)", fontWeight: 600, fontSize: 14.5, lineHeight: 1.55 }}>
              Mở bản copy file template của thầy, rồi <b>dán (Ctrl/Cmd + V)</b> phần đáp án vừa sao chép vào. Sau đó share lại cho thầy để chữa qua Google Meet.
            </p>
            <a href={D.gdocTemplateUrl} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ width: "100%", textDecoration: "none" }}>
              <IT.doc size={18} /> Mở file Google Doc template <IT.externalLink size={16} />
            </a>
          </Step>
        </div>
      )}

      <div className="row" style={{ gap: 12, marginTop: 18 }}>
        <button onClick={onClose} className="btn btn-ghost" style={{ flex: 1, padding: 13 }}>Xem lại bài</button>
        <button onClick={() => goT(`/c/${courseId}/w/${weekNum}/${kind}`)} className="btn btn-ink" style={{ flex: 1, padding: 13 }}>Xong, về tuần học</button>
      </div>
    </Modal>
  );
}

function Step({ n, title, children }) {
  return (
    <div className="sticker-sm" style={{ background: "#fff", padding: "16px 18px", boxShadow: "none", border: "2px solid var(--line-strong)", marginTop: 14 }}>
      <div className="row" style={{ gap: 10, marginBottom: 12 }}>
        <span style={{ width: 28, height: 28, borderRadius: 8, background: "var(--ink)", color: "#fff", display: "grid", placeItems: "center", fontFamily: "var(--font-display)", fontWeight: 700, flex: "none" }}>{n}</span>
        <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18, margin: 0 }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Modal({ children, onClose, wide }) {
  return (
    <div onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }} style={{ position: "fixed", inset: 0, zIndex: 120, background: "rgba(24,26,38,.55)", backdropFilter: "blur(3px)", display: "grid", placeItems: "center", padding: 20 }}>
      <div className="sticker anim-pop thin-scroll" style={{ background: "#fff", width: "94%", maxWidth: wide ? 560 : 460, padding: "26px", maxHeight: "90vh", overflowY: "auto" }}>
        {children}
      </div>
    </div>
  );
}

window.TID_TEST = { TestPage };
