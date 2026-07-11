/* ============================================================
   TID — App root + routing
   ============================================================ */
const { useStore: useStoreA, useRoute: useRouteA, go: goA } = window.TID_STORE;
const { HomePage: HomePageA, Onboard: OnboardA } = window.TID_HOME;
const { CoursePage: CoursePageA } = window.TID_COURSE;
const { WeekPage: WeekPageA } = window.TID_WEEK;
const { TestPage: TestPageA } = window.TID_TEST;
const { ResultPage: ResultPageA } = window.TID_RESULT;
const { AuthGate: AuthGateA } = window.TID_AUTH;

function App() {
  const { parts } = useRouteA();
  const s = useStoreA(); // re-render on state change

  // Shared homework result link (#/r/<payload>) — must work for a teacher who
  // has never onboarded, so it bypasses BOTH the sign-in gate and the name gate
  // and is fully self-contained.
  if (parts[0] === "r" && parts[1]) return <ResultPageA payload={parts[1]} />;

  // Everything else lives behind the Google sign-in + allowlist gate.
  // (AuthGate is a no-op / passthrough when no clientId is configured.)
  return <AuthGateA><Routed parts={parts} s={s} /></AuthGateA>;
}

function Routed({ parts, s }) {
  // First visit via ANY link (including deep links to a course/week/test) must
  // ask for the student's name before anything else — otherwise the name stays
  // empty and shows the "Học viên" default everywhere (incl. submitted docs).
  if (!s.onboarded || !s.email || !s.emailV2 || !s.emailV3) return <OnboardA />;

  // #/                          -> home
  // #/c/:course                 -> course
  // #/c/:course/w/:n            -> week (materials)
  // #/c/:course/w/:n/:tab       -> week tab
  // #/c/:course/w/:n/:kind/do   -> test interface
  if (parts[0] === "c" && parts[1]) {
    const courseId = parts[1];
    if (!window.TID_DATA.courses[courseId]) { goA("/"); return null; }
    if (parts[2] === "w" && parts[3]) {
      const weekNum = parseInt(parts[3], 10);
      const seg = parts[4];
      if ((seg === "classwork" || seg === "homework") && parts[5] === "do") {
        return <TestPageA courseId={courseId} weekNum={weekNum} kind={seg} />;
      }
      const tab = ["materials", "classwork", "homework"].includes(seg) ? seg : "materials";
      return <WeekPageA courseId={courseId} weekNum={weekNum} tab={tab} />;
    }
    return <CoursePageA courseId={courseId} />;
  }
  return <HomePageA />;
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
