/* ============================================================
   TID — global store (localStorage) + tiny hash router
   Exposed on window.TID_STORE
   ------------------------------------------------------------
   [CLONE] Cơ chế mật khẩu khóa tuần đã được GỠ BỎ:
   weekUnlocked() luôn trả về true → tất cả các tuần đều mở.
   (Các hàm tier/unlock giữ lại để không phá vỡ code gọi tới.)
   ============================================================ */
const { useState: useStateS, useEffect: useEffectS, useCallback } = React;

const LS_KEY = "tid_rl_v1";

function loadState() {
  const defaults = {
    name: "",
    email: "",
    onboarded: false,
    emailV2: false,
    emailV3: false,
    // Mở khóa theo MỨC mỗi khóa: { reading: { half1, half2, full }, listening: {...} }.
    unlocked: { reading: {}, listening: {} },
    answers: {},        // testId -> { [qn]: value }
    submissions: {},     // testId -> { elapsed, submittedAt, answers }
    quizDone: {},        // quizId -> score
    testTheme: "pro",    // 'pro' (Thi Thật, mặc định) | 'playful' (Vui tươi)
  };
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return { ...defaults, ...JSON.parse(raw) }; // bổ sung khóa mới còn thiếu
  } catch (e) {}
  return defaults;
}

let _state = loadState();
const _subs = new Set();
function persist() {
  try { localStorage.setItem(LS_KEY, JSON.stringify(_state)); } catch (e) {}
  _subs.forEach((fn) => fn(_state));
}
function setState(patch) {
  _state = typeof patch === "function" ? patch(_state) : { ..._state, ...patch };
  persist();
}

function useStore() {
  const [, force] = useStateS(0);
  useEffectS(() => {
    const fn = () => force((x) => x + 1);
    _subs.add(fn);
    return () => _subs.delete(fn);
  }, []);
  return _state;
}

// ---- answer helpers ----
function setAnswer(testId, qn, value) {
  setState((s) => ({
    ...s,
    answers: { ...s.answers, [testId]: { ...(s.answers[testId] || {}), [qn]: value } },
  }));
}
function clearTest(testId) {
  setState((s) => {
    const a = { ...s.answers }; delete a[testId];
    const sub = { ...s.submissions }; delete sub[testId];
    return { ...s, answers: a, submissions: sub };
  });
}
function submitTest(testId, elapsed) {
  setState((s) => ({
    ...s,
    submissions: { ...s.submissions, [testId]: { elapsed, submittedAt: Date.now(), answers: s.answers[testId] || {} } },
  }));
}

// ---- hash router ----
function useRoute() {
  const [hash, setHash] = useStateS(window.location.hash || "#/");
  useEffectS(() => {
    const fn = () => { setHash(window.location.hash || "#/"); window.scrollTo(0, 0); };
    window.addEventListener("hashchange", fn);
    return () => window.removeEventListener("hashchange", fn);
  }, []);
  const parts = hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  return { hash, parts };
}
function go(path) { window.location.hash = path; }

// ---- self-contained result links (#/r/<payload>) ----
// Encode a homework result into a URL-safe token (handles Vietnamese names).
function encodeResult(obj) {
  try {
    const b64 = btoa(unescape(encodeURIComponent(JSON.stringify(obj))));
    return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  } catch (e) { return ""; }
}
function decodeResult(token) {
  try {
    let b64 = String(token).replace(/-/g, "+").replace(/_/g, "/");
    while (b64.length % 4) b64 += "=";
    return JSON.parse(decodeURIComponent(escape(atob(b64))));
  } catch (e) { return null; }
}

// ---- access control ----
// [CLONE] Mật khẩu đã gỡ — MỌI tuần đều mở (kể cả tuần > 1).
function weekUnlocked(u, week) {
  return true;
}
// Mức mật khẩu mở thêm những tuần nào (để hiển thị / điều hướng).
function tierWeeks(tier) {
  if (tier === "half1") return [2, 3, 4];
  if (tier === "half2") return [5, 6, 7, 8];
  if (tier === "full") return [2, 3, 4, 5, 6, 7, 8];
  return [];
}
function unlockTier(courseId, tier) {
  setState((s) => {
    const cur = (s.unlocked && typeof s.unlocked[courseId] === "object") ? s.unlocked[courseId] : {};
    return { ...s, unlocked: { ...s.unlocked, [courseId]: { ...cur, [tier]: true } } };
  });
}

window.TID_STORE = { useStore, setState, setAnswer, clearTest, submitTest, useRoute, go, weekUnlocked, tierWeeks, unlockTier, encodeResult, decodeResult };
