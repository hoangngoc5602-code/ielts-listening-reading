/* ============================================================
   TID — Homepage: hero + name onboarding + course unlock
   Exposed on window.TID_HOME
   ============================================================ */
const { useState: useStateH } = React;
const { Icons: IH, SunMascot: SunMascotH, Creature: CreatureH } = window.TID_ICONS;
const { Logo: LogoH, LogoMark: LogoMarkH, Avatar: AvatarH } = window.TID_SHELL;
const { useStore: useStoreH, setState: setStateH, go: goH } = window.TID_STORE;

function HomePage() {
  const s = useStoreH();
  const D = window.TID_DATA;
  const [pwFor, setPwFor] = useStateH(null); // course id awaiting password

  return (
    <div style={{ minHeight: "100vh", background: "#fff" }}>
      {/* ===== HERO ===== */}
      <section style={{ position: "relative", overflow: "hidden", background: "var(--ink)" }}>
        {/* soft dotted texture + orange glow */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,.06) 1.4px, transparent 1.4px)", backgroundSize: "26px 26px", opacity: .7 }}></div>
        <div style={{ position: "absolute", width: 520, height: 520, borderRadius: "50%", background: "radial-gradient(circle, rgba(245,160,28,.32), transparent 62%)", right: "-90px", top: "-120px" }}></div>

        {/* hero top bar */}
        <div className="wrap row" style={{ height: 92, justifyContent: "space-between", position: "relative", zIndex: 5 }}>
          <LogoH light />
          <div className="row" style={{ gap: 10 }}>
            <div className="row" style={{ gap: 10, padding: "5px 14px 5px 6px", borderRadius: 999, background: "rgba(255,255,255,.10)", border: "2px solid rgba(255,255,255,.22)", flex: "none" }}>
              <AvatarH name={s.name || "Học viên"} size={34} />
              <div style={{ lineHeight: 1.15, color: "#fff" }}>
                <div style={{ fontWeight: 800, fontSize: 14, whiteSpace: "nowrap" }}>{s.name || "Học viên"}</div>
                <div className="row" style={{ gap: 5, fontSize: 11, fontWeight: 800, letterSpacing: ".06em", opacity: .9 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#7fe0a0" }}></span>ONLINE
                </div>
              </div>
            </div>
            <button onClick={() => setStateH({ onboarded: false })} className="row" style={{ gap: 7, padding: "9px 15px", borderRadius: 999, fontWeight: 800, fontSize: 14, border: "2px solid rgba(255,255,255,.22)", background: "rgba(255,255,255,.10)", color: "#fff", whiteSpace: "nowrap", flex: "none" }}>
              <IH.user size={17} /> Đổi tên
            </button>
          </div>
        </div>

        {/* hero body */}
        <div className="wrap" style={{ position: "relative", zIndex: 3, paddingBottom: 78, paddingTop: 26 }}>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.05fr) minmax(0,1fr)", alignItems: "center", gap: 36 }}>
            <div style={{ color: "#fff" }}>
              <span className="row" style={{ display: "inline-flex", gap: 9, background: "rgba(245,160,28,.16)", color: "var(--tid-orange)", padding: "8px 16px", borderRadius: 999, fontWeight: 800, fontSize: 13, letterSpacing: ".08em", border: "1.5px solid rgba(245,160,28,.4)", whiteSpace: "nowrap" }}>
                <IH.sparkle size={15} /> LỚP LUYỆN THI · PHÚC IELTS
              </span>
              <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 66, lineHeight: 1.0, margin: "22px 0 0", letterSpacing: "-.015em" }}>
                Reading <span style={{ color: "var(--tid-orange)" }}>&amp;</span><br/>Listening
              </h1>
              <p style={{ fontSize: 19, lineHeight: 1.6, maxWidth: 470, marginTop: 22, color: "rgba(255,255,255,.78)", fontWeight: 600 }}>
                Làm bài, xem lại recording và tài liệu — tất cả ở một nơi. Học trực tiếp trên web, chữa online cùng thầy qua Google Meet.
              </p>
              <div style={{ marginTop: 32, display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
                <button className="row" onClick={() => { const el = document.getElementById("courses"); if (el) window.scrollTo({ top: el.offsetTop - 20, behavior: "smooth" }); }} style={{ gap: 10, padding: "16px 26px", borderRadius: 14, background: "var(--tid-orange)", color: "var(--ink)", border: "2.5px solid var(--ink)", fontWeight: 800, fontSize: 17, boxShadow: "4px 5px 0 rgba(0,0,0,.45)", whiteSpace: "nowrap" }}>
                  Vào khóa học của bạn <IH.arrowR size={20} />
                </button>
                <div className="row" style={{ gap: 18, color: "rgba(255,255,255,.7)", fontWeight: 700, fontSize: 14 }}>
                  <span className="row" style={{ gap: 7 }}><IH.book size={16} /> Reading</span>
                  <span className="row" style={{ gap: 7 }}><IH.headphones size={16} /> Listening</span>
                </div>
              </div>
            </div>

            {/* Reading + Listening sticker-card illustration */}
            <div style={{ position: "relative", minHeight: 420 }}>
              <div style={{ position: "absolute", width: 230, height: 230, borderRadius: "50%", background: "var(--tid-orange)", right: 40, top: 30 }}></div>

              {/* Reading card */}
              <div className="sticker anim-pop" style={{ position: "absolute", left: 8, top: 36, width: 290, background: "#fff", padding: "18px 18px 20px", transform: "rotate(-5deg)" }}>
                <div className="row" style={{ gap: 8, marginBottom: 14 }}>
                  <span style={{ width: 34, height: 34, borderRadius: 9, background: "var(--reading-tint)", color: "var(--reading-deep)", border: "2px solid var(--ink)", display: "grid", placeItems: "center" }}><IH.book size={17} /></span>
                  <span style={{ fontWeight: 800, fontSize: 13, letterSpacing: ".06em", color: "var(--reading-deep)" }}>READING</span>
                </div>
                {[100, 88, 94].map((w, i) => <div key={i} style={{ height: 9, borderRadius: 6, background: "var(--line-strong)", width: w + "%", marginBottom: 9 }}></div>)}
                <div style={{ height: 9, borderRadius: 6, background: "var(--reading)", width: "62%", marginBottom: 9 }}></div>
                {[80].map((w, i) => <div key={i} style={{ height: 9, borderRadius: 6, background: "var(--line-strong)", width: w + "%" }}></div>)}
              </div>

              {/* Listening card */}
              <div className="sticker anim-pop" style={{ position: "absolute", right: 6, bottom: 28, width: 250, background: "#fff", padding: "16px 18px 18px", transform: "rotate(4deg)" }}>
                <div className="row" style={{ gap: 8, marginBottom: 14, justifyContent: "space-between" }}>
                  <div className="row" style={{ gap: 8 }}>
                    <span style={{ width: 34, height: 34, borderRadius: 9, background: "var(--listening-tint)", color: "var(--listening-deep)", border: "2px solid var(--ink)", display: "grid", placeItems: "center" }}><IH.headphones size={17} /></span>
                    <span style={{ fontWeight: 800, fontSize: 13, letterSpacing: ".06em", color: "var(--listening-deep)" }}>LISTENING</span>
                  </div>
                  <span style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--listening)", color: "#fff", border: "2px solid var(--ink)", display: "grid", placeItems: "center" }}><IH.play size={14} /></span>
                </div>
                <div className="row" style={{ gap: 5, alignItems: "flex-end", height: 56 }}>
                  {[40, 70, 30, 92, 55, 78, 36, 100, 48, 66, 28, 84, 52].map((hh, i) => (
                    <div key={i} style={{ flex: 1, height: hh + "%", borderRadius: 4, background: i % 3 === 0 ? "var(--listening)" : "var(--listening-tint)", border: "1.5px solid var(--ink)" }}></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== COURSE SELECTION ===== */}
      <section id="courses" className="wrap" style={{ padding: "20px 28px 80px" }}>
        <div style={{ textAlign: "center", maxWidth: 620, margin: "0 auto 8px" }}>
          <span className="pill" style={{ background: "var(--reading-tint)", color: "var(--reading-deep)", padding: "7px 16px", fontSize: 13, whiteSpace: "nowrap" }}>
            <IH.lock size={15} /> Chọn khóa để bắt đầu
          </span>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 38, margin: "16px 0 6px" }}>
            {s.name ? `Chào ${s.name.split(" ").slice(-1)[0]}, ` : "Chào bạn, "}học gì hôm nay?
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 30, maxWidth: 880, margin: "36px auto 0" }}>
          <CourseCard id="reading" color="var(--reading)" deep="var(--reading-deep)"
            icon={<IH.book size={26} />} unlocked={s.unlocked.reading}
            data={D.courses.reading} />
          <CourseCard id="listening" color="var(--listening)" deep="var(--listening-deep)"
            icon={<IH.headphones size={26} />} unlocked={s.unlocked.listening}
            data={D.courses.listening} />
        </div>
      </section>

      <Footer />

      {pwFor && <PasswordModal courseId={pwFor} onClose={() => setPwFor(null)} />}
    </div>
  );
}

/* ---- a course card ---- */
function CourseCard({ id, color, deep, icon, unlocked, data }) {
  const weeksReady = data.weeks.filter((w) => w.ready).length;
  const u = unlocked || {};
  const fully = u === true || u.full || (u.half1 && u.half2);
  return (
    <button
      onClick={() => goH(`/c/${id}`)}
      className="sticker anim-pop"
      style={{
        position: "relative", textAlign: "left", padding: 0, overflow: "hidden",
        background: `linear-gradient(${color}, ${deep})`, color: "#fff",
        minHeight: 320, display: "flex", flexDirection: "column",
        cursor: "pointer", transition: "transform .14s ease, box-shadow .14s ease",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translate(-2px,-3px)"; e.currentTarget.style.boxShadow = "9px 11px 0 rgba(24,26,38,.88)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "var(--shadow-card)"; }}
    >
      {/* creature peeking */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 130, opacity: .92, pointerEvents: "none" }}>
        <CreatureH color={color} deep={deep} />
      </div>
      <div style={{ position: "relative", padding: "24px 24px 0", flex: 1 }}>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(255,255,255,.92)", color: deep, display: "grid", placeItems: "center", border: "2.5px solid var(--ink)" }}>{icon}</div>
          <div className="row sticker-sm" style={{ gap: 7, padding: "8px 13px", background: "#fff", color: "var(--ink)", boxShadow: "2px 3px 0 var(--ink)", fontWeight: 800, fontSize: 13 }}>
            {fully ? <><IH.unlock size={15} /> Đã mở</> : <><IH.unlock size={15} /> Week 1 miễn phí</>}
          </div>
        </div>
        <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 34, margin: "20px 0 8px" }}>{data.name}</h3>
        <p style={{ fontSize: 15.5, fontWeight: 600, lineHeight: 1.5, maxWidth: 280, opacity: .94 }}>{data.tagline}</p>
      </div>
      <div className="row" style={{ position: "relative", justifyContent: "space-between", padding: "0 24px 22px", marginTop: 12 }}>
        <span className="pill" style={{ background: "rgba(0,0,0,.26)", padding: "9px 16px", border: "2px solid rgba(255,255,255,.35)", color: "#fff", whiteSpace: "nowrap" }}>
          {weeksReady > 0 ? `${data.weeks.length} TUẦN` : "SẮP CÓ"}
        </span>
        <span className="row" style={{ gap: 7, fontWeight: 800, fontSize: 15, background: "rgba(255,255,255,.2)", padding: "9px 16px", borderRadius: 999, border: "2px solid rgba(255,255,255,.35)", whiteSpace: "nowrap" }}>
          Vào học <IH.arrowR size={18} />
        </span>
      </div>
    </button>
  );
}

/* ---- name onboarding modal ---- */
function Onboard() {
  const s = useStoreH();
  const isReturning = s.onboarded && s.name;
  const [val, setVal] = useStateH(s.name || "");
  const [emailVal, setEmailVal] = useStateH(s.email || "");
  const canSubmit = val.trim() && emailVal.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal.trim());
  return (
    <Overlay>
      <div className="sticker anim-pop" style={{ background: "#fff", maxWidth: 460, width: "92%", padding: "34px 32px", textAlign: "center" }}>
        <div style={{ margin: "0 auto 14px", width: 72 }}><LogoMarkH size={72} /></div>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 28, margin: "10px 0 6px" }}>
          {isReturning ? "Xác nhận thông tin" : "Chào mừng tới lớp!"}
        </h2>
        <p style={{ color: "var(--muted)", fontWeight: 600, fontSize: 16, lineHeight: 1.5, margin: "0 0 20px" }}>
          {isReturning
            ? "Vui lòng xác nhận hoặc cập nhật email của bạn — dùng để chia sẻ file chữa bài sau khi nộp."
            : "Cho thầy biết tên và email của bạn — dùng để hiển thị trong bài và chia sẻ file chữa bài."}
        </p>
        <form onSubmit={(e) => { e.preventDefault(); if (canSubmit) setStateH({ name: val.trim(), email: emailVal.trim(), onboarded: true, emailV2: true, emailV3: true }); }}>
          <input autoFocus value={val} onChange={(e) => setVal(e.target.value)} placeholder="VD: Hoàng Đăng Phúc"
            style={{ width: "100%", padding: "15px 18px", borderRadius: 14, border: "2.5px solid var(--ink)", fontSize: 17, fontWeight: 700, textAlign: "center", boxShadow: "3px 4px 0 var(--ink)" }} />
          <input type="email" value={emailVal} onChange={(e) => setEmailVal(e.target.value)} placeholder="Email của bạn"
            style={{ width: "100%", padding: "15px 18px", borderRadius: 14, border: "2.5px solid var(--ink)", fontSize: 16, fontWeight: 600, textAlign: "center", boxShadow: "3px 4px 0 var(--ink)", marginTop: 12, boxSizing: "border-box" }} />
          <div style={{ marginTop: 8, padding: "10px 14px", borderRadius: 10, background: "#fff8ec", border: "1.5px solid #f5a01c", fontSize: 13.5, fontWeight: 600, color: "#7a4e00", lineHeight: 1.5, textAlign: "left" }}>
            ⚠️ Hãy chắc chắn đây là email Google bạn dùng để đăng nhập và sử dụng Google Doc.
          </div>
          <button type="submit" disabled={!canSubmit} className="btn btn-ink" style={{ width: "100%", marginTop: 16, fontSize: 17, padding: "15px", opacity: canSubmit ? 1 : .5 }}>
            {isReturning ? "Xác nhận" : "Bắt đầu học"} <IH.arrowR size={19} />
          </button>
        </form>
      </div>
    </Overlay>
  );
}

/* ---- password modal ---- */
function PasswordModal({ courseId, onClose, targetWeek }) {
  const D = window.TID_DATA;
  const { weekUnlocked, unlockTier } = window.TID_STORE;
  const [val, setVal] = useStateH("");
  const [err, setErr] = useStateH(false);
  const cName = D.courses[courseId].name;

  function submit(e) {
    e.preventDefault();
    const pw = val.trim();
    const P = D.passwords[courseId] || {};
    let tier = null;
    if (P.full && pw === P.full) tier = "full";
    else if (P.half1 && pw === P.half1) tier = "half1";
    else if (P.half2 && pw === P.half2) tier = "half2";
    if (!tier) { setErr(true); return; }
    unlockTier(courseId, tier);
    onClose();
    // Vào thẳng tuần học sinh đang muốn mở (nếu mức vừa nhập mở được tuần đó).
    if (targetWeek != null) {
      const next = { half1: { 2: 1, 3: 1, 4: 1 }, half2: { 5: 1, 6: 1, 7: 1, 8: 1 }, full: { 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1, 8: 1 } }[tier];
      if (next && next[targetWeek]) { goH(`/c/${courseId}/w/${targetWeek}`); return; }
    }
    goH(`/c/${courseId}`);
  }

  return (
    <Overlay onClose={onClose}>
      <div className="sticker anim-pop" style={{ background: "#fff", maxWidth: 440, width: "92%", padding: "30px 30px", position: "relative" }}>
        <button onClick={onClose} aria-label="Đóng" style={{ position: "absolute", top: 14, right: 14, width: 36, height: 36, borderRadius: "50%", border: "2px solid var(--line-strong)", background: "#fff", display: "grid", placeItems: "center" }}><IH.x size={18} /></button>
        <div style={{ width: 60, height: 60, borderRadius: 16, background: courseId === "reading" ? "var(--reading-tint)" : "var(--listening-tint)", color: courseId === "reading" ? "var(--reading-deep)" : "var(--listening-deep)", display: "grid", placeItems: "center", border: "2.5px solid var(--ink)" }}>
          <IH.lock size={26} />
        </div>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 26, margin: "18px 0 6px" }}>Mở khóa {cName}</h2>
        <p style={{ color: "var(--muted)", fontWeight: 600, fontSize: 15.5, lineHeight: 1.55, margin: "0 0 18px" }}>
          Nội dung này chỉ giành cho các học viên đã đăng ký khóa thui nha. Hãy liên hệ giáo viên của mình để được hỗ trợ nhaaa
        </p>
        <form onSubmit={submit}>
          <input autoFocus value={val} onChange={(e) => { setVal(e.target.value); setErr(false); }} placeholder="Mật khẩu"
            autoCapitalize="none" autoCorrect="off" spellCheck={false}
            style={{ width: "100%", padding: "14px 16px", borderRadius: 12, border: `2.5px solid ${err ? "var(--danger)" : "var(--ink)"}`, fontSize: 16, fontWeight: 700, letterSpacing: ".04em", boxShadow: "3px 4px 0 var(--ink)" }} />
          {err && <div className="row" style={{ gap: 6, color: "var(--danger)", fontWeight: 700, fontSize: 14, marginTop: 10 }}><IH.x size={16} /> Mật khẩu chưa đúng, thử lại nhé.</div>}
          <button type="submit" className="btn btn-ink" style={{ width: "100%", marginTop: 16, fontSize: 16, padding: "14px" }}>
            <IH.unlock size={18} /> Mở khóa
          </button>
        </form>
      </div>
    </Overlay>
  );
}

function Overlay({ children, onClose }) {
  return (
    <div onMouseDown={(e) => { if (e.target === e.currentTarget && onClose) onClose(); }}
      style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(24,26,38,.55)", backdropFilter: "blur(3px)", display: "grid", placeItems: "center", padding: 20, overflowY: "auto" }}>
      {children}
    </div>
  );
}

function Footer() {
  return (
    <footer style={{ background: "var(--ink)", color: "rgba(255,255,255,.7)", padding: "30px 0" }}>
      <div className="wrap row" style={{ justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div className="row" style={{ gap: 12, color: "#fff" }}>
          <LogoH small light />
          <span style={{ fontWeight: 700, fontSize: 15 }}>Lớp Reading &amp; Listening</span>
        </div>
        <div style={{ fontSize: 14, fontWeight: 600 }}>© 2026 Phúc IELTS</div>
      </div>
    </footer>
  );
}

window.TID_HOME = { HomePage, PasswordModal, Onboard };
