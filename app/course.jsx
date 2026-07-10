/* ============================================================
   TID — Course page (week list)
   THEME: Calm Academy. Styling reworked, logic/flow unchanged.
   Exposed on window.TID_COURSE
   ============================================================ */
const { useState: useStateC } = React;
const { Icons: IC } = window.TID_ICONS;
const { TopNav: TopNavC, Crumbs: CrumbsC } = window.TID_SHELL;
const { useStore: useStoreC, go: goC, weekUnlocked: weekUnlockedC } = window.TID_STORE;

function CoursePage({ courseId }) {
  const s = useStoreC();
  const D = window.TID_DATA;
  const course = D.courses[courseId];
  const isReading = courseId === "reading";
  const accent = isReading ? "var(--reading)" : "var(--listening)";
  const accentDeep = isReading ? "var(--reading-deep)" : "var(--listening-deep)";
  const tint = isReading ? "var(--reading-tint)" : "var(--listening-tint)";
  const [pwWeek, setPwWeek] = useStateC(null); // tuần đang chờ nhập mật khẩu
  const PasswordModalC = window.TID_HOME.PasswordModal;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <TopNavC />
      {/* course banner */}
      <div style={{ background: `linear-gradient(150deg, ${accent}, ${accentDeep})`, color: "#fff", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,.06) 1.2px, transparent 1.2px)", backgroundSize: "26px 26px", opacity: .6 }}></div>
        <div className="wrap" style={{ padding: "18px 28px 26px", position: "relative" }}>
          <CrumbsLight items={[{ label: "Trang chủ", to: "/" }, { label: course.name }]} />
          <div className="row" style={{ gap: 13, marginTop: 12, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
            <div className="row" style={{ gap: 15 }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: "rgba(255,255,255,.95)", color: accentDeep, display: "grid", placeItems: "center", boxShadow: "0 10px 22px rgba(0,0,0,.14)", flex: "none" }}>
                {isReading ? <IC.book size={26} /> : <IC.headphones size={26} />}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 11, letterSpacing: ".14em", opacity: .82 }}>KHÓA HỌC</div>
                <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 32, margin: "2px 0 0", letterSpacing: "-.02em" }}>{course.name}</h1>
              </div>
            </div>
            <div className="row" style={{ gap: 10 }}>
              <Stat label="Đã mở" value={course.weeks.filter((w) => w.ready && weekUnlockedC(s.unlocked[courseId], w.number)).length} />
              <Stat label="Tuần học" value={course.weeks.length} />
            </div>
          </div>
        </div>
      </div>

      {/* week list */}
      <div className="wrap" style={{ padding: "40px 28px 80px" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 24, margin: "0 0 20px", letterSpacing: "-.02em" }}>Các tuần học</h2>
        {course.weeks.length === 0 && <Empty text="Khóa này sắp có nội dung. Thầy sẽ cập nhật sớm!" />}
        <div style={{ display: "grid", gap: 16 }}>
          {course.weeks.map((w) => (
            <WeekRow key={w.number} w={w} courseId={courseId} accent={accent} accentDeep={accentDeep} tint={tint}
              locked={w.ready && !weekUnlockedC(s.unlocked[courseId], w.number)}
              onLocked={() => setPwWeek(w.number)} />
          ))}
        </div>
      </div>

      {pwWeek != null && <PasswordModalC courseId={courseId} targetWeek={pwWeek} onClose={() => setPwWeek(null)} />}
    </div>
  );
}

function WeekRow({ w, courseId, accent, accentDeep, tint, locked, onLocked }) {
  const clickable = w.ready;
  const dim = !clickable || locked;            // tuần chưa có nội dung hoặc đang khóa → mờ đi
  function handleClick() {
    if (!clickable) return;
    if (locked) { onLocked(); return; }
    goC(`/c/${courseId}/w/${w.number}`);
  }
  return (
    <button
      onClick={handleClick}
      data-reveal
      style={{
        display: "grid", gridTemplateColumns: "auto 1fr auto", alignItems: "center", gap: 20,
        background: "var(--surface)", padding: "20px 22px", textAlign: "left",
        borderRadius: "var(--r-lg)",
        boxShadow: dim ? "var(--shadow-card-sm)" : "var(--shadow-card)",
        border: "1px solid var(--line)",
        cursor: clickable ? "pointer" : "default",
        opacity: dim ? .58 : 1, transition: "transform .2s var(--ease-out), box-shadow .2s var(--ease-out), opacity .2s ease",
      }}
      onMouseEnter={(e) => { if (clickable && !locked) { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "var(--shadow-pop)"; } else if (locked) { e.currentTarget.style.opacity = ".78"; } }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = dim ? "var(--shadow-card-sm)" : "var(--shadow-card)"; e.currentTarget.style.opacity = dim ? ".58" : "1"; }}
    >
      <div style={{ width: 66, height: 66, borderRadius: 18, background: dim ? "var(--bg)" : tint, border: dim ? "1px solid var(--line)" : "none", display: "grid", placeItems: "center", color: dim ? "var(--muted-2)" : accentDeep }}>
        <div style={{ textAlign: "center", lineHeight: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".08em" }}>WEEK</div>
          <div className="mono-num" style={{ fontSize: 28, fontWeight: 700 }}>{String(w.number).padStart(2, "0")}</div>
        </div>
      </div>
      <div>
        <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, margin: 0, letterSpacing: "-.01em", color: dim ? "var(--muted)" : "var(--ink)" }}>{w.title}</h3>
        </div>
        <div className="row" style={{ gap: 14, marginTop: 8, color: "var(--muted)", fontWeight: 600, fontSize: 14, flexWrap: "wrap" }}>
          <span className="row" style={{ gap: 6 }}><IC.flag size={15} /> {w.topic}</span>
          {w.materials.recordings.length > 0 && <span className="row" style={{ gap: 6 }}><IC.film size={15} /> {w.materials.recordings.length} recording</span>}
          {(w.classwork || w.homework) && <span className="row" style={{ gap: 6 }}><IC.doc size={15} /> {w.classwork && w.homework ? "Bài tập lớp + về nhà" : w.classwork ? "Bài tập trên lớp" : "Bài tập về nhà"}</span>}
          {w.intro && <span className="row" style={{ gap: 6 }}><IC.sparkle size={15} /> Buổi làm quen</span>}
        </div>
      </div>
      <div className="row" style={{ gap: 8, color: dim ? "var(--muted-2)" : accentDeep, fontWeight: 700, fontSize: 14, letterSpacing: dim ? ".04em" : 0, whiteSpace: "nowrap" }}>
        {!clickable ? <><IC.lock size={16} /> SẮP MỞ</> : locked ? <><IC.lock size={16} /> ĐÃ KHÓA</> : <>Vào tuần <IC.chevR size={18} /></>}
      </div>
    </button>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{ textAlign: "center", background: "rgba(255,255,255,.16)", border: "1px solid rgba(255,255,255,.3)", borderRadius: 14, padding: "8px 16px", minWidth: 66 }}>
      <div className="mono-num" style={{ fontSize: 22, fontWeight: 700, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, fontWeight: 600, opacity: .85, marginTop: 3, whiteSpace: "nowrap" }}>{label}</div>
    </div>
  );
}

function CrumbsLight({ items }) {
  return (
    <nav className="row" style={{ gap: 8, flexWrap: "wrap", fontWeight: 600, fontSize: 14, color: "rgba(255,255,255,.8)" }}>
      {items.map((it, i) => (
        <span key={i} className="row" style={{ gap: 8 }}>
          {i > 0 && <IC.chevR size={15} style={{ opacity: .7 }} />}
          {it.to ? <button onClick={() => goC(it.to)} style={{ background: "none", border: "none", padding: 0, color: "rgba(255,255,255,.8)", fontWeight: 600, fontSize: 14 }}>{it.label}</button>
            : <span style={{ color: "#fff", fontWeight: 700 }}>{it.label}</span>}
        </span>
      ))}
    </nav>
  );
}

function Empty({ text }) {
  return <div className="sticker-sm" style={{ background: "var(--surface)", padding: "44px 24px", textAlign: "center", color: "var(--muted)", fontWeight: 600 }}>{text}</div>;
}

window.TID_COURSE = { CoursePage, CrumbsLight, Empty };
