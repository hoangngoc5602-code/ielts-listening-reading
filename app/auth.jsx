/* ============================================================
   IELTS Reading & Listening — Google Sign-In gate + allowlist
   Chỉ email có trong Google Sheet (qua Apps Script) mới vào được.
   THIẾT KẾ AN TOÀN:
   - Nếu AUTH_CONFIG.clientId RỖNG → cổng TẮT hoàn toàn, web chạy y như cũ.
   - Link chia sẻ kết quả (#/r/...) KHÔNG đi qua cổng này (xử lý ở app.jsx).
   - Email Google đã xác thực được dùng luôn cho bước nộp bài (khỏi gõ tay).
   - Lưu ý: file tĩnh (PDF/audio) vẫn công khai → đây là cổng chặn GIAO DIỆN.
   Exposed on window.TID_AUTH
   ============================================================ */
const { useState: useStateAu, useEffect: useEffectAu, useRef: useRefAu } = React;
const { Icons: IAu } = window.TID_ICONS;
const { Logo: LogoAu } = window.TID_SHELL;
const { useStore: useStoreAu, setState: setStateAu } = window.TID_STORE;

const AUTH_CONFIG = {
  // Dán Client ID vào đây để BẬT cổng. Để rỗng "" để TẮT (web chạy như cũ).
  clientId: "980038724507-7qe3njkvl977hefdhlpfru49jiiab2pi.apps.googleusercontent.com",
  // URL Apps Script kiểm tra allowlist (trả JSON { allowed: true/false }).
  allowlistUrl: "https://script.google.com/macros/s/AKfycbwDC0JaaTuWVNQ2pLkO51xIjg8aEiz-i2-OvAGQGMOm76NLiv0Rck71C90qiX2jI1_R/exec",
};

function authEnabled() { return !!(AUTH_CONFIG.clientId && AUTH_CONFIG.clientId.trim()); }

function decodeJwt(tok) {
  try {
    const part = tok.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(decodeURIComponent(escape(atob(part))));
  } catch (e) { return null; }
}

// Trả về Promise<boolean> — email có trong allowlist không.
function checkAllowlist(email) {
  const url = AUTH_CONFIG.allowlistUrl + "?email=" + encodeURIComponent(email);
  return fetch(url, { method: "GET" })
    .then(function (r) { return r.text(); })
    .then(function (txt) {
      try { return !!JSON.parse(txt).allowed; }
      catch (e) { return /"?allowed"?\s*:\s*true/i.test(txt) || /^true$/i.test(txt.trim()); }
    });
}

// Như checkAllowlist nhưng trả về 3 TRẠNG THÁI rõ ràng, dùng cho lần kiểm tra
// lại nền (kiểu "Mượt"):
//   "allowed"  = Sheet xác nhận CÒN quyền
//   "denied"   = Sheet trả rõ KHÔNG còn quyền  → mới đá HV ra
//   "unknown"  = lỗi mạng / không đọc được KQ  → GIỮ NGUYÊN quyền (không khóa nhầm)
function recheckAllowlist(email) {
  const url = AUTH_CONFIG.allowlistUrl + "?email=" + encodeURIComponent(email);
  return fetch(url, { method: "GET" })
    .then(function (r) { return r.text(); })
    .then(function (txt) {
      let val = null;
      try { val = JSON.parse(txt).allowed; }
      catch (e) {
        if (/"?allowed"?\s*:\s*true/i.test(txt) || /^true$/i.test(txt.trim())) val = true;
        else if (/"?allowed"?\s*:\s*false/i.test(txt) || /^false$/i.test(txt.trim())) val = false;
      }
      if (val === true) return "allowed";
      if (val === false) return "denied";
      return "unknown";
    })
    .catch(function () { return "unknown"; });
}

// Nạp thư viện Google Identity Services (một lần).
function loadGis() {
  return new Promise(function (resolve, reject) {
    if (window.google && window.google.accounts && window.google.accounts.id) return resolve();
    let tries = 0;
    const iv = setInterval(function () {
      if (window.google && window.google.accounts && window.google.accounts.id) { clearInterval(iv); resolve(); }
      else if (++tries > 60) { clearInterval(iv); reject(new Error("GIS not loaded")); } // ~9s
    }, 150);
  });
}

/* ---- Cổng xác thực: bọc quanh toàn bộ app ---- */
function AuthGate({ children }) {
  const s = useStoreAu();
  // Nếu tắt cổng, hoặc đã xác thực & được phép trước đó → cho vào ngay.
  const cachedOk = s.authAllowed && s.authEmail;
  const [phase, setPhase] = useStateAu(!authEnabled() || cachedOk ? "ok" : "loading");
  const [who, setWho] = useStateAu(s.authEmail || "");
  const btnRef = useRefAu(null);

  function onCredential(resp) {
    const info = resp && resp.credential ? decodeJwt(resp.credential) : null;
    if (!info || !info.email) { setPhase("error"); return; }
    setWho(info.email);
    setPhase("verifying");
    checkAllowlist(info.email).then(function (allowed) {
      if (allowed) {
        setStateAu({
          authAllowed: true, authEmail: info.email, authName: info.name || "",
          name: info.name || s.name || "", email: info.email,
          onboarded: true, emailV2: true, emailV3: true,
        });
        setPhase("ok");
      } else { setPhase("denied"); }
    }).catch(function () { setPhase("checkerror"); });
  }

  // Kiểm tra LẠI allowlist mỗi lần mở web cho người đã lưu (kiểu "Mượt"):
  // cho vào ngay, kiểm tra ngầm; nếu Sheet trả rõ "không còn quyền" → đá ra
  // màn "denied" (HV bị xoá khỏi Sheet sẽ bị chặn ở lần vào kế tiếp).
  // Lỗi mạng / không đọc được kết quả → giữ nguyên quyền, không khóa nhầm HV thật.
  useEffectAu(function () {
    if (!authEnabled() || !cachedOk) return;
    let alive = true;
    recheckAllowlist(s.authEmail).then(function (status) {
      if (!alive) return;
      if (status === "denied") {
        setStateAu({ authAllowed: false, authEmail: "", authName: "" });
        try { window.google.accounts.id.disableAutoSelect(); } catch (e) {}
        setWho(s.authEmail || "");
        setPhase("denied");
      }
    });
    return function () { alive = false; };
  }, []);

  // Khởi tạo GIS khi cổng bật. Khởi tạo cho CẢ người đã lưu (cached) để nếu
  // sau đó họ bị re-check đá ra thì nút "Dùng tài khoản Google khác" vẫn hiện
  // được. Chỉ chuyển sang màn "signin" khi CHƯA có phiên đã lưu.
  useEffectAu(function () {
    if (!authEnabled()) return;
    let alive = true;
    loadGis().then(function () {
      if (!alive) return;
      try {
        window.google.accounts.id.initialize({ client_id: AUTH_CONFIG.clientId, callback: onCredential });
      } catch (e) {}
      if (!cachedOk) setPhase("signin");
    }).catch(function () { if (alive && !cachedOk) setPhase("gis_error"); });
    return function () { alive = false; };
  }, []);

  // Vẽ nút Google khi vào phase "signin".
  useEffectAu(function () {
    if (phase !== "signin" || !btnRef.current) return;
    try {
      window.google.accounts.id.renderButton(btnRef.current, {
        theme: "outline", size: "large", type: "standard", text: "signin_with", shape: "pill", width: 260,
      });
    } catch (e) {}
  }, [phase]);

  // Nền + khung thẻ (theme Calm Academy)
  function Frame(inner) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 22,
        background: "linear-gradient(160deg, #1c4a40 0%, #14342c 100%)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", width: 520, height: 520, borderRadius: "50%", background: "radial-gradient(circle, rgba(217,164,65,.22), transparent 64%)", right: -120, top: -140 }}></div>
        <div className="sticker anim-pop" style={{ position: "relative", background: "#fff", width: "92%", maxWidth: 440, padding: "34px 30px", textAlign: "center", boxShadow: "var(--shadow-pop)" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}><LogoAu /></div>
          {inner}
        </div>
      </div>
    );
  }

  if (phase === "ok") return children;

  if (phase === "denied") {
    return Frame(
      <div>
        <div style={{ width: 58, height: 58, borderRadius: 16, margin: "4px auto 14px", background: "#fdECEB", color: "var(--danger)", display: "grid", placeItems: "center" }}><IAu.lock size={26} /></div>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 24, margin: "0 0 8px", letterSpacing: "-.02em" }}>Chưa có quyền truy cập</h2>
        <p style={{ color: "var(--muted)", fontWeight: 500, fontSize: 15, lineHeight: 1.55, margin: "0 0 6px" }}>
          Email <b style={{ color: "var(--ink)" }}>{who}</b> chưa nằm trong danh sách lớp. Vui lòng liên hệ giáo viên để được thêm vào.
        </p>
        <button onClick={() => { setStateAu({ authAllowed: false, authEmail: "", authName: "" }); try { window.google.accounts.id.disableAutoSelect(); } catch (e) {} setWho(""); setPhase("signin"); }}
          className="btn btn-ghost" style={{ width: "100%", marginTop: 16 }}>Dùng tài khoản Google khác</button>
      </div>
    );
  }

  if (phase === "verifying" || phase === "loading") {
    return Frame(
      <div>
        <div style={{ width: 34, height: 34, margin: "10px auto 14px", border: "3px solid var(--line)", borderTopColor: "var(--reading)", borderRadius: "50%", animation: "tid-spin .8s linear infinite" }}></div>
        <style>{"@keyframes tid-spin{to{transform:rotate(360deg)}}"}</style>
        <p style={{ color: "var(--muted)", fontWeight: 600, fontSize: 15, margin: 0 }}>{phase === "verifying" ? "Đang kiểm tra quyền truy cập…" : "Đang tải…"}</p>
      </div>
    );
  }

  if (phase === "checkerror" || phase === "gis_error" || phase === "error") {
    const msg = phase === "gis_error"
      ? "Không tải được đăng nhập Google. Kiểm tra kết nối mạng rồi thử lại."
      : "Không kiểm tra được quyền lúc này. Vui lòng thử lại.";
    return Frame(
      <div>
        <div style={{ width: 58, height: 58, borderRadius: 16, margin: "4px auto 14px", background: "#fbf3df", color: "var(--warn)", display: "grid", placeItems: "center" }}><IAu.bell size={26} /></div>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, margin: "0 0 8px", letterSpacing: "-.02em" }}>Có trục trặc nhỏ</h2>
        <p style={{ color: "var(--muted)", fontWeight: 500, fontSize: 15, lineHeight: 1.55, margin: "0 0 6px" }}>{msg}</p>
        <button onClick={() => setPhase("signin")} className="btn btn-ink" style={{ width: "100%", marginTop: 16 }}>Thử lại</button>
      </div>
    );
  }

  // phase === "signin"
  return Frame(
    <div>
      <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 24, margin: "2px 0 6px", letterSpacing: "-.02em" }}>Đăng nhập để vào lớp</h2>
      <p style={{ color: "var(--muted)", fontWeight: 500, fontSize: 15, lineHeight: 1.55, margin: "0 0 20px" }}>
        Dùng tài khoản Google đã đăng ký với giáo viên. Email này cũng được dùng để nhận file chữa bài.
      </p>
      <div ref={btnRef} style={{ display: "flex", justifyContent: "center", minHeight: 44 }}></div>
    </div>
  );
}

window.TID_AUTH = { AuthGate, authEnabled, AUTH_CONFIG };
