/* ============================================================
   TID — Course page (week list)
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
      <div style={{ background: `linear-gradient(${accent}, ${accentDeep})`, color: "#fff", borderBottom: "3px solid var(--ink)" }}>
        <div className="wrap" style={{ padding: "14px 28px 18px" }}>
          <CrumbsLight items={[{ label: "Trang chủ", to: "/" }, { label: course.name }]} />
          <div className="row" style={{ gap: 13, marginTop: 10, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
            <div className="row" style={{ gap: 13 }}>
              <div style={{ width: 48, height: 48, borderRadius: 13, background: "rgba(255,255,255,.92)", color: accentDeep, display: "grid", placeItems: "center", border: "2.5px solid var(--ink)", boxShadow: "3px 4px 0 var(--ink)", flex: "none" }}>
                {isReading ? <IC.book size={24} /> : <IC.headphones size={24} />}
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 11, letterSpacing: ".1em", opacity: .85 }}>KHÓA HỌC</div>
                <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 32, margin: "1px 0 0" }}>{course.name}</h1>
              </div>
            </div>
            <div className="row" style={{ gap: 8 }}>
              <Stat label="Đã mở" value={course.weeks.filter((w) => w.ready && weekUnlockedC(s.unlocked[courseId], w.number)).length} />
              <Stat label="Tuần học" value={course.weeks.length} />
            </div>
          </div>
        </div>
      </div>

      {/* week list */}
      <div className="wrap" style={{ padding: "34px 28px 70px" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 24, margin: "0 0 18px" }}>Các tuần học</h2>
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
      className="sticker-sm"
      style={{
        display: "grid", gridTemplateColumns: "auto 1fr auto", alignItems: "center", gap: 20,
        background: "#fff", padding: "20px 22px", textAlign: "left",
        boxShadow: dim ? "3px 4px 0 var(--line-strong)" : "4px 5px 0 var(--ink)",
        border: dim ? "2px solid var(--line-strong)" : "2.5px solid var(--ink)",
        cursor: clickable ? "pointer" : "default",
        opacity: dim ? .5 : 1, transition: "transform .12s ease, box-shadow .12s ease, opacity .12s ease",
      }}
      onMouseEnter={(e) => { if (clickable && !locked) { e.currentTarget.style.transform = "translate(-1px,-2px)"; e.currentTarget.style.boxShadow = "6px 7px 0 var(--ink)"; } else if (locked) { e.currentTarget.style.opacity = ".72"; } }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = dim ? "3px 4px 0 var(--line-strong)" : "4px 5px 0 var(--ink)"; e.currentTarget.style.opacity = dim ? ".5" : "1"; }}
    >
      <div style={{ width: 64, height: 64, borderRadius: 16, background: dim ? "var(--bg)" : tint, border: `2.5px solid ${dim ? "var(--line-strong)" : "var(--ink)"}`, display: "grid", placeItems: "center", color: dim ? "var(--muted-2)" : accentDeep }}>
        <div style={{ textAlign: "center", lineHeight: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: ".08em" }}>WEEK</div>
          <div className="mono-num" style={{ fontSize: 28, fontWeight: 700 }}>{String(w.number).padStart(2, "0")}</div>
        </div>
      </div>
      <div>
        <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 22, margin: 0, color: dim ? "var(--muted)" : "var(--ink)" }}>{w.title}</h3>
        </div>
        <div className="row" style={{ gap: 14, marginTop: 8, color: "var(--muted)", fontWeight: 700, fontSize: 14, flexWrap: "wrap" }}>
          <span className="row" style={{ gap: 6 }}><IC.flag size={15} /> {w.topic}</span>
          {w.materials.recordings.length > 0 && <span className="row" style={{ gap: 6 }}><IC.film size={15} /> {w.materials.recordings.length} recording</span>}
          {(w.classwork || w.homework) && <span className="row" style={{ gap: 6 }}><IC.doc size={15} /> {w.classwork && w.homework ? "Bài tập lớp + về nhà" : w.classwork ? "Bài tập trên lớp" : "Bài tập về nhà"}</span>}
          {w.intro && <span className="row" style={{ gap: 6 }}><IC.sparkle size={15} /> Buổi làm quen</span>}
        </div>
      </div>
      <div className="row" style={{ gap: 8, color: dim ? "var(--muted-2)" : accentDeep, fontWeight: 800, fontSize: 14, letterSpacing: dim ? ".04em" : 0, whiteSpace: "nowrap" }}>
        {!clickable ? <><IC.lock size={16} /> SẮP MỞ</> : locked ? <><IC.lock size={16} /> ĐÃ KHÓA</> : <>Vào tuần <IC.chevR size={18} /></>}
      </div>
    </button>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{ textAlign: "center", background: "rgba(255,255,255,.16)", border: "2px solid rgba(255,255,255,.4)", borderRadius: 12, padding: "6px 14px", minWidth: 64 }}>
      <div className="mono-num" style={{ fontSize: 22, fontWeight: 700, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, fontWeight: 700, opacity: .85, marginTop: 2, whiteSpace: "nowrap" }}>{label}</div>
    </div>
  );
}

function CrumbsLight({ items }) {
  return (
    <nav className="row" style={{ gap: 8, flexWrap: "wrap", fontWeight: 700, fontSize: 14, color: "rgba(255,255,255,.8)" }}>
      {items.map((it, i) => (
        <span key={i} className="row" style={{ gap: 8 }}>
          {i > 0 && <IC.chevR size={15} style={{ opacity: .7 }} />}
          {it.to ? <button onClick={() => goC(it.to)} style={{ background: "none", border: "none", padding: 0, color: "rgba(255,255,255,.8)", fontWeight: 700, fontSize: 14 }}>{it.label}</button>
            : <span style={{ color: "#fff", fontWeight: 800 }}>{it.label}</span>}
        </span>
      ))}
    </nav>
  );
}

function Empty({ text }) {
  return <div className="sticker-sm" style={{ background: "#fff", padding: "40px 24px", textAlign: "center", color: "var(--muted)", fontWeight: 700, boxShadow: "4px 5px 0 var(--ink)" }}>{text}</div>;
}

window.TID_COURSE = { CoursePage, CrumbsLight, Empty };
