/* ============================================================
   TID — Homepage: hero + name onboarding + course unlock
   THEME: Calm Academy. Styling reworked, logic/flow unchanged.
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
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* ===== HERO ===== */}
      <section style={{ position: "relative", overflow: "hidden", background: "linear-gradient(160deg, #1c4a40 0%, #14342c 100%)" }}>
        {/* soft dotted texture + gold glow */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,.05) 1.3px, transparent 1.3px)", backgroundSize: "28px 28px", opacity: .7 }}></div>
        <div style={{ position: "absolute", width: 560, height: 560, borderRadius: "50%", background: "radial-gradient(circle, rgba(217,164,65,.26), transparent 64%)", right: "-120px", top: "-140px" }}></div>
        <div style={{ position: "absolute", width: 420, height: 420, borderRadius: "50%", background: "radial-gradient(circle, rgba(47,158,119,.20), transparent 66%)", left: "-140px", bottom: "-180px" }}></div>

        {/* hero top bar */}
        <div className="wrap row" style={{ height: 92, justifyContent: "space-between", position: "relative", zIndex: 5 }}>
          <LogoH light />
          <div className="row" style={{ gap: 10 }}>
            <div className="row" style={{ gap: 10, padding: "5px 14px 5px 6px", borderRadius: 999, background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.18)", flex: "none" }}>
              <AvatarH name={s.name || "Học viên"} size={34} />
              <div style={{ lineHeight: 1.15, color: "#fff" }}>
                <div style={{ fontWeight: 700, fontSize: 14, whiteSpace: "nowrap" }}>{s.name || "Học viên"}</div>
                <div className="row" style={{ gap: 5, fontSize: 11, fontWeight: 700, letterSpacing: ".04em", opacity: .9 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#7fe0a0" }}></span>ONLINE
                </div>
              </div>
            </div>
            <button onClick={() => setStateH({ onboarded: false })} className="row" style={{ gap: 7, padding: "9px 15px", borderRadius: 999, fontWeight: 700, fontSize: 14, border: "1px solid rgba(255,255,255,.18)", background: "rgba(255,255,255,.08)", color: "#fff", whiteSpace: "nowrap", flex: "none", transition: "background .2s ease" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,.16)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,.08)"}>
              <IH.user size={17} /> Đổi tên
            </button>
          </div>
        </div>

        {/* hero body */}
        <div className="wrap" style={{ position: "relative", zIndex: 3, paddingBottom: 86, paddingTop: 30 }}>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.05fr) minmax(0,1fr)", alignItems: "center", gap: 40 }}>
            <div data-stagger style={{ color: "#fff" }}>
              <span data-stagger-item className="row" style={{ display: "inline-flex", gap: 9, background: "rgba(217,164,65,.14)", color: "#f0cd86", padding: "8px 16px", borderRadius: 999, fontWeight: 700, fontSize: 13, letterSpacing: ".06em", border: "1px solid rgba(217,164,65,.32)", whiteSpace: "nowrap" }}>
                <IH.sparkle size={15} /> LỚP LUYỆN THI · PHÚC IELTS
              </span>
              <h1 data-stagger-item style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 66, lineHeight: 1.02, margin: "22px 0 0", letterSpacing: "-.03em" }}>
                Reading <span style={{ color: "var(--tid-orange)" }}>&amp;</span><br/>Listening
              </h1>
              <p data-stagger-item style={{ fontSize: 19, lineHeight: 1.65, maxWidth: 470, marginTop: 22, color: "rgba(255,255,255,.76)", fontWeight: 500 }}>
                Làm bài, xem lại recording và tài liệu — tất cả ở một nơi. Học trực tiếp trên web, chữa online cùng thầy qua Google Meet.
              </p>
              <div data-stagger-item style={{ marginTop: 34, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                <button className="row" onClick={() => { const el = document.getElementById("courses"); if (el) window.scrollTo({ top: el.offsetTop - 20, behavior: "smooth" }); }} style={{ gap: 10, padding: "16px 28px", borderRadius: 999, background: "var(--tid-orange)", color: "#3a2a05", border: "none", fontWeight: 700, fontSize: 17, boxShadow: "0 14px 30px rgba(217,164,65,.32)", whiteSpace: "nowrap", transition: "transform .2s var(--ease-out), box-shadow .2s ease" }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 20px 40px rgba(217,164,65,.42)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 14px 30px rgba(217,164,65,.32)"; }}>
                  Vào khóa học của bạn <IH.arrowR size={20} />
                </button>
                <div className="row" style={{ gap: 18, color: "rgba(255,255,255,.66)", fontWeight: 600, fontSize: 14 }}>
                  <span className="row" style={{ gap: 7 }}><IH.book size={16} /> Reading</span>
                  <span className="row" style={{ gap: 7 }}><IH.headphones size={16} /> Listening</span>
                </div>
              </div>
            </div>

            {/* Reading + Listening soft-card illustration */}
            <div style={{ position: "relative", minHeight: 420 }}>
              <div data-float="14" style={{ position: "absolute", width: 240, height: 240, borderRadius: "50%", background: "radial-gradient(circle at 35% 30%, #e6b968, #d9a441)", right: 44, top: 26, boxShadow: "0 24px 50px rgba(217,164,65,.30)" }}></div>

              {/* Reading card */}
              <div data-float="9" className="sticker" style={{ position: "absolute", left: 8, top: 40, width: 292, background: "#fff", padding: "20px 20px 22px", transform: "rotate(-4deg)", boxShadow: "var(--shadow-pop)" }}>
                <div className="row" style={{ gap: 10, marginBottom: 16 }}>
                  <span style={{ width: 36, height: 36, borderRadius: 11, background: "var(--reading-tint)", color: "var(--reading-deep)", display: "grid", placeItems: "center" }}><IH.book size={18} /></span>
                  <span style={{ fontWeight: 700, fontSize: 13, letterSpacing: ".04em", color: "var(--reading-deep)" }}>READING</span>
                </div>
                {[100, 88, 94].map((w, i) => <div key={i} style={{ height: 9, borderRadius: 6, background: "var(--line)", width: w + "%", marginBottom: 10 }}></div>)}
                <div style={{ height: 9, borderRadius: 6, background: "var(--reading)", width: "62%", marginBottom: 10 }}></div>
                {[80].map((w, i) => <div key={i} style={{ height: 9, borderRadius: 6, background: "var(--line)", width: w + "%" }}></div>)}
              </div>

              {/* Listening card */}
              <div data-float="11" className="sticker" style={{ position: "absolute", right: 6, bottom: 24, width: 252, background: "#fff", padding: "18px 20px 20px", transform: "rotate(3deg)", boxShadow: "var(--shadow-pop)" }}>
                <div className="row" style={{ gap: 8, marginBottom: 16, justifyContent: "space-between" }}>
                  <div className="row" style={{ gap: 9 }}>
                    <span style={{ width: 36, height: 36, borderRadius: 11, background: "var(--listening-tint)", color: "var(--listening-deep)", display: "grid", placeItems: "center" }}><IH.headphones size={18} /></span>
                    <span style={{ fontWeight: 700, fontSize: 13, letterSpacing: ".04em", color: "var(--listening-deep)" }}>LISTENING</span>
                  </div>
                  <span style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--listening)", color: "#fff", display: "grid", placeItems: "center" }}><IH.play size={14} /></span>
                </div>
                <div data-bars className="row" style={{ gap: 5, alignItems: "flex-end", height: 56 }}>
                  {[40, 70, 30, 92, 55, 78, 36, 100, 48, 66, 28, 84, 52].map((hh, i) => (
                    <span key={i} style={{ display: "block", flex: 1, height: hh + "%", borderRadius: 5, background: i % 3 === 0 ? "var(--listening)" : "var(--listening-tint)" }}></span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* soft bottom edge */}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: -1, height: 40, background: "linear-gradient(to bottom, transparent, var(--bg))" }}></div>
      </section>

      {/* ===== COURSE SELECTION ===== */}
      <section id="courses" className="wrap" style={{ padding: "44px 28px 90px" }}>
        <div style={{ textAlign: "center", maxWidth: 620, margin: "0 auto 8px" }}>
          <span className="pill" style={{ background: "var(--reading-tint)", color: "var(--reading-deep)", padding: "8px 16px", fontSize: 13, whiteSpace: "nowrap" }}>
            <IH.sparkle size={15} /> Chọn khóa để bắt đầu
          </span>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 38, margin: "16px 0 6px", letterSpacing: "-.02em" }}>
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
      data-reveal
      style={{
        position: "relative", textAlign: "left", padding: 0, overflow: "hidden",
        background: `linear-gradient(155deg, ${color}, ${deep})`, color: "#fff",
        minHeight: 320, display: "flex", flexDirection: "column",
        border: "none", borderRadius: "var(--r-xl)", boxShadow: "var(--shadow-card)",
        cursor: "pointer", transition: "transform .24s var(--ease-out), box-shadow .24s var(--ease-out)",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "var(--shadow-pop)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "var(--shadow-card)"; }}
    >
      {/* creature peeking */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 130, opacity: .9, pointerEvents: "none" }}>
        <CreatureH color={color} deep={deep} />
      </div>
      <div style={{ position: "relative", padding: "26px 26px 0", flex: 1 }}>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div style={{ width: 54, height: 54, borderRadius: 16, background: "rgba(255,255,255,.95)", color: deep, display: "grid", placeItems: "center", boxShadow: "0 8px 18px rgba(0,0,0,.14)" }}>{icon}</div>
          <div className="row" style={{ gap: 7, padding: "8px 14px", background: "rgba(255,255,255,.96)", color: deep, borderRadius: 999, boxShadow: "0 6px 14px rgba(0,0,0,.12)", fontWeight: 700, fontSize: 13 }}>
            {fully ? <><IH.unlock size={15} /> Đã mở</> : <><IH.unlock size={15} /> Week 1 miễn phí</>}
          </div>
        </div>
        <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 34, margin: "22px 0 8px", letterSpacing: "-.02em" }}>{data.name}</h3>
        <p style={{ fontSize: 15.5, fontWeight: 500, lineHeight: 1.5, maxWidth: 280, opacity: .94 }}>{data.tagline}</p>
      </div>
      <div className="row" style={{ position: "relative", justifyContent: "space-between", padding: "0 26px 24px", marginTop: 12 }}>
        <span className="pill" style={{ background: "rgba(0,0,0,.20)", padding: "9px 16px", color: "#fff", whiteSpace: "nowrap" }}>
          {weeksReady > 0 ? `${data.weeks.length} TUẦN` : "SẮP CÓ"}
        </span>
        <span className="row" style={{ gap: 7, fontWeight: 700, fontSize: 15, background: "rgba(255,255,255,.18)", padding: "9px 16px", borderRadius: 999, whiteSpace: "nowrap" }}>
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
      <div className="sticker anim-pop" style={{ background: "#fff", maxWidth: 460, width: "92%", padding: "36px 32px", textAlign: "center", boxShadow: "var(--shadow-pop)" }}>
        <div style={{ margin: "0 auto 14px", width: 72 }}><LogoMarkH size={72} /></div>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 28, margin: "10px 0 6px", letterSpacing: "-.02em" }}>
          {isReturning ? "Xác nhận thông tin" : "Chào mừng tới lớp!"}
        </h2>
        <p style={{ color: "var(--muted)", fontWeight: 500, fontSize: 16, lineHeight: 1.55, margin: "0 0 20px" }}>
          {isReturning
            ? "Vui lòng xác nhận hoặc cập nhật email của bạn — dùng để chia sẻ file chữa bài sau khi nộp."
            : "Cho thầy biết tên và email của bạn — dùng để hiển thị trong bài và chia sẻ file chữa bài."}
        </p>
        <form onSubmit={(e) => { e.preventDefault(); if (canSubmit) setStateH({ name: val.trim(), email: emailVal.trim(), onboarded: true, emailV2: true, emailV3: true }); }}>
          <input autoFocus value={val} onChange={(e) => setVal(e.target.value)} placeholder="VD: Hoàng Đăng Phúc"
            style={{ width: "100%", padding: "15px 18px", borderRadius: 14, border: "1.5px solid var(--line-strong)", fontSize: 17, fontWeight: 600, textAlign: "center", background: "var(--surface-warm)", outline: "none" }} />
          <input type="email" value={emailVal} onChange={(e) => setEmailVal(e.target.value)} placeholder="Email của bạn"
            style={{ width: "100%", padding: "15px 18px", borderRadius: 14, border: "1.5px solid var(--line-strong)", fontSize: 16, fontWeight: 500, textAlign: "center", background: "var(--surface-warm)", outline: "none", marginTop: 12, boxSizing: "border-box" }} />
          <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 12, background: "#fbf3df", border: "1px solid #e6c778", fontSize: 13.5, fontWeight: 500, color: "#7a4e00", lineHeight: 1.5, textAlign: "left" }}>
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
      <div className="sticker anim-pop" style={{ background: "#fff", maxWidth: 440, width: "92%", padding: "30px 30px", position: "relative", boxShadow: "var(--shadow-pop)" }}>
        <button onClick={onClose} aria-label="Đóng" style={{ position: "absolute", top: 14, right: 14, width: 36, height: 36, borderRadius: "50%", border: "1px solid var(--line-strong)", background: "#fff", display: "grid", placeItems: "center" }}><IH.x size={18} /></button>
        <div style={{ width: 60, height: 60, borderRadius: 18, background: courseId === "reading" ? "var(--reading-tint)" : "var(--listening-tint)", color: courseId === "reading" ? "var(--reading-deep)" : "var(--listening-deep)", display: "grid", placeItems: "center" }}>
          <IH.lock size={26} />
        </div>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 26, margin: "18px 0 6px", letterSpacing: "-.02em" }}>Mở khóa {cName}</h2>
        <p style={{ color: "var(--muted)", fontWeight: 500, fontSize: 15.5, lineHeight: 1.55, margin: "0 0 18px" }}>
          Nội dung này chỉ giành cho các học viên đã đăng ký khóa thui nha. Hãy liên hệ giáo viên của mình để được hỗ trợ nhaaa
        </p>
        <form onSubmit={submit}>
          <input autoFocus value={val} onChange={(e) => { setVal(e.target.value); setErr(false); }} placeholder="Mật khẩu"
            autoCapitalize="none" autoCorrect="off" spellCheck={false}
            style={{ width: "100%", padding: "14px 16px", borderRadius: 12, border: `1.5px solid ${err ? "var(--danger)" : "var(--line-strong)"}`, fontSize: 16, fontWeight: 600, letterSpacing: ".02em", background: "var(--surface-warm)", outline: "none" }} />
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
      style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(20,52,44,.5)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)", display: "grid", placeItems: "center", padding: 20, overflowY: "auto" }}>
      {children}
    </div>
  );
}

function Footer() {
  return (
    <footer style={{ background: "var(--tid-green-deep)", color: "rgba(255,255,255,.66)", padding: "34px 0" }}>
      <div className="wrap row" style={{ justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div className="row" style={{ gap: 12, color: "#fff" }}>
          <LogoH small light />
          <span style={{ fontWeight: 600, fontSize: 15 }}>Lớp Reading &amp; Listening</span>
        </div>
        <div style={{ fontSize: 14, fontWeight: 500 }}>© 2026 Phúc IELTS</div>
      </div>
    </footer>
  );
}

window.TID_HOME = { HomePage, PasswordModal, Onboard };
