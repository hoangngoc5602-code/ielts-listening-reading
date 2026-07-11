# CLAUDE.md — Hồ sơ dự án website "Phúc IELTS · Reading & Listening"

> File này để **Claude đọc đầu tiên ở mỗi phiên chat mới** nhằm hiểu toàn bộ dự án
> trước khi làm bất cứ việc gì. Chủ dự án là người **không chuyên kỹ thuật**, hãy
> giải thích dễ hiểu và luôn cẩn trọng.

---

## 0. QUY TẮC LÀM VIỆC BẮT BUỘC (đọc kỹ trước tiên)

1. **KHÔNG được làm hỏng project.** Mọi thay đổi phải giữ web chạy được, không gây lỗi.
2. **KHÔNG tự ý thay đổi.** Trước khi sửa/thêm/xoá bất cứ thứ gì, **đề xuất rõ ràng và chờ chủ dự án DUYỆT** rồi mới làm.
3. **Sau khi làm xong một yêu cầu**, luôn hỏi lại: **"Bạn đã chốt các thay đổi này chưa?"**
   - Khi chủ dự án xác nhận đã chốt → **cập nhật lại chính file `CLAUDE.md` này** (mục trạng thái + nhật ký thay đổi ở cuối) để phiên chat sau luôn đọc được bản mới nhất.
4. Ưu tiên **thay đổi nhỏ, có thể hoàn tác**. Nếu một yêu cầu có rủi ro làm hỏng, hãy nói rõ rủi ro và đề xuất cách an toàn hơn.
5. Chủ dự án dùng **GitHub Desktop → Netlify** để đưa web lên mạng (xem mục 8). Nhắc họ các bước đẩy lên khi cần.

---

## 1. Dự án này là gì

Website học IELTS gồm 2 khóa **Reading** và **Listening**, mỗi khóa **8 tuần**. Học viên
xem tài liệu, nghe audio, làm bài (classwork/homework) ngay trên web; bài nộp được tạo
thành Google Doc để giáo viên chữa.

- Đây là **web của chủ dự án**. Trước đây chạy trên `phucielts.vercel.app` nhưng chủ đã
  **mất tài khoản Google + mã nguồn cũ**. Bản hiện tại là **bản dựng lại độc lập**, đã
  chuyển toàn bộ nội dung và backend sang **tài khoản Google mới của chủ**.
- Repo này (`ielts-listening-reading`) là **bản đang chạy tốt**, deploy qua Netlify.

---

## 2. Công nghệ (KHÔNG có bước build)

- **Web tĩnh thuần** (static site). Không có Node build, không webpack. Chỉ cần mở bằng
  một web server tĩnh là chạy.
- **React 18.3.1** (UMD dev) + **ReactDOM 18.3.1** + **Babel Standalone 7.29.0** — tải từ
  `unpkg.com` (CDN). JSX được **biên dịch ngay trên trình duyệt** lúc chạy (classic runtime).
- **Hash routing** (URL dạng `#/...`). Không cần cấu hình server.
- Font: Google Fonts — **Plus Jakarta Sans** (chính, từ 2026-07-10), Fredoka, Nunito, Source Serif 4 — tải từ CDN.
- **GSAP 3.12.5 + ScrollTrigger** (từ `cdnjs.cloudflare.com`) — lớp chuyển động; do `app/motion.js` điều khiển. Nếu CDN lỗi thì web vẫn chạy, chỉ mất hiệu ứng.
- ⇒ **Cần internet** để tải React/Babel/GSAP/Fonts (bình thường với mọi web online).

---

## 3. Cấu trúc thư mục

```
ielts-listening-reading/            ← gốc repo (index.html PHẢI ở đây)
├── index.html                      ← khung trang + "bootstrap loader" (xem mục 4)
├── CLAUDE.md                       ← file này
├── README.txt                      ← ghi chú deploy ngắn
├── .gitignore                      ← nên chứa .DS_Store
├── app/
│   ├── data.jsx      ← ⭐ TOÀN BỘ NỘI DUNG BÀI HỌC (window.TID_DATA). Plain JS, ~800KB.
│   ├── tokens.css    ← màu sắc, font, style hệ thống (CSS variables) — theme "Calm Academy"
│   ├── motion.js     ← ⭐ lớp chuyển động GSAP (plain JS, KHÔNG JSX) → window.TID_MOTION
│   ├── icons.jsx     ← icon SVG + mascot (mặt trời, con vật)  → window.TID_ICONS
│   ├── store.jsx     ← state (localStorage) + hash router + access control → window.TID_STORE
│   ├── auth.jsx      ← ⭐ cổng đăng nhập Google (GIS) + allowlist → window.TID_AUTH
│   ├── shell.jsx     ← logo, thanh nav, avatar, breadcrumb → window.TID_SHELL
│   ├── questions.jsx ← renderer TẤT CẢ dạng câu hỏi IELTS + chấm điểm → window.TID_QUESTIONS
│   ├── home.jsx      ← trang chủ + màn hình nhập tên/email (onboarding) → window.TID_HOME
│   ├── course.jsx    ← danh sách tuần của một khóa → window.TID_COURSE
│   ├── week.jsx      ← trang 1 tuần (3 tab) + NỘI DUNG "Materials"/quiz (hằng SYLLABUS) → window.TID_WEEK
│   ├── test.jsx      ← giao diện làm bài + nộp bài (gọi Apps Script) → window.TID_TEST
│   ├── result.jsx    ← trang kết quả/chữa bài (self-check) → window.TID_RESULT
│   └── app.jsx       ← gốc React + định tuyến (render <App/>)
└── assets/
    ├── audio/        ← 10 file nghe (Listening). Tên PHẢI khớp link trong data.jsx.
    └── docs/         ← 16 file PDF tài liệu (reading-week-1..8.pdf, listening-week-1..8.pdf)
```

**Cách các file JS "nói chuyện" với nhau:** mỗi file gán kết quả vào một biến toàn cục
`window.TID_*` và đọc của file khác qua `window.TID_*`. Vì vậy:
- Đừng đổi tên các biến `window.TID_ICONS/STORE/SHELL/QUESTIONS/HOME/COURSE/WEEK/TEST/RESULT/DATA`.
- Giữ nguyên các alias `const {...} = React;` (mỗi file dùng alias riêng để không đụng nhau).

---

## 4. Cách trang tải (bootstrap loader trong index.html)

`index.html` làm theo thứ tự:
1. Tải React, ReactDOM, Babel (CDN).
2. **Tải nội dung**: `app/data.jsx` (LOCAL) trước. Nếu không có mới fallback về
   `https://phucielts.vercel.app/app/data.jsx` (site cũ) để trang không trắng.
   → Vì đã có `app/data.jsx` local nên **site cũ không bao giờ được gọi tới**.
3. Lần lượt `fetch` + biên dịch (Babel, **runtime "classic"**) + chạy các file trong `app/`
   theo đúng thứ tự: icons → store → shell → questions → home → course → week → test → result → app.

**Lưu ý:** `data.jsx` được nạp như **JS thường** (nó chỉ gán `window.TID_DATA = {...}`,
KHÔNG chứa JSX). Các file `app/*.jsx` khác thì có JSX nên phải qua Babel.

---

## 5. Mô hình dữ liệu (`app/data.jsx` → `window.TID_DATA`)

```
TID_DATA = {
  courses: {
    reading:   { id, name, tagline, weeks: [ 8 tuần ] },
    listening: { id, name, tagline, weeks: [ 8 tuần ] },
  },
  passwords: {...},          // KHÔNG còn tác dụng (mật khẩu đã gỡ, xem mục 6)
  gdocTemplateUrl: "...",    // link Google Doc mẫu (chỉ dùng cho cách nộp thủ công dự phòng)
  docScriptUrl: "...",       // ⭐ URL Google Apps Script nhận bài nộp (xem mục 7)
  docSecret: "hoangngoc",    // ⭐ mật khẩu nội bộ, PHẢI khớp SECRET trong Apps Script
}
```

Mỗi **week** gồm: `number, title, topic, ready` (true=đã mở), `materials`, `classwork`,
`homework` (và `intro` cho Listening tuần 1).
- `materials = { recordings:[{title, youtube}], pdfs:[{title, type:"gdoc", url}], quiz:{...} }`
  - `pdfs[].url` hiện trỏ tới **`assets/docs/....pdf`** (đường dẫn nội bộ).
  - `recordings[].youtube` = ID video YouTube (xem cảnh báo mục 9).
- `classwork`/`homework = { id, course, skill, title, parts:[...], answerKey:{...} }`
  - Mỗi `part = { part, passage:{title, paras:[{text}]}, groups:[...], audio:{url,label} }`
  - `audio.url` (Listening) trỏ tới **`assets/audio/....mp3`**.
  - `groups[].kind` ∈ `matching-info | matching-heading | matching-ending | summary-gap |
    completion | short-answer | mc-single | mc-multi | tfng`.

⚠️ **Nội dung tab "Materials"** (đặc điểm dạng bài, kỹ năng, lưu ý, quiz nhanh 3 câu) **KHÔNG
nằm trong data.jsx** — nó nằm trong hằng **`SYLLABUS`** ở đầu file **`app/week.jsx`**.

---

## 6. Những chỗ đã tùy biến so với bản gốc

- **Đã GỠ MẬT KHẨU:** trong `app/store.jsx`, hàm `weekUnlocked()` **luôn trả về `true`**
  → tất cả các tuần đều mở, không hỏi mật khẩu. (Popup nhập mật khẩu không còn xuất hiện.)
  Màn hình hỏi **tên + email** đầu vào thì vẫn giữ (đây là bước làm quen, không phải mật khẩu).
- **Nội dung đã đưa về local:** audio → `assets/audio/`, tài liệu (PDF) → `assets/docs/`,
  link trong `data.jsx` là đường dẫn tương đối. Site không còn phụ thuộc `phucielts.vercel.app`.
- **Backend nộp bài đã chuyển sang tài khoản Google MỚI của chủ** (xem mục 7).

---

## 7. Chức năng "Nộp bài" (Google Apps Script)

- Khi học viên bấm Nộp: `app/test.jsx` gửi (POST) đáp án tới **`docScriptUrl`** kèm `docSecret`.
  Apps Script **tạo một Google Doc mới** chứa đáp án, chia sẻ, và trả link về.
- URL hiện tại (`docScriptUrl` trong data.jsx):
  `https://script.google.com/macros/s/AKfycbyvVheH4SlANE4_oY4pDzrSr70H2j9MeHPRr9ZJWcwR158ZrGe_k6ksejD5PsWSjh0Eyg/exec`
- `docSecret = "hoangngoc"` — **phải khớp** biến `SECRET` trong code Apps Script.
- Bản Apps Script hiện dùng là **bản 2**: dùng `DocumentApp.create()` (không copy template).
- Tài khoản Google chạy Apps Script: `hoangngoc5602@gmail.com`.

**Nếu cần đổi/deploy lại Apps Script (lưu ý quan trọng, từng bị lỗi):**
- Sau khi sửa code hoặc quyền, **PHẢI tạo "New deployment"** (bản deploy mới) — bản cũ bị
  "đóng băng" mức quyền cũ, dẫn tới lỗi *"Truy cập bị từ chối: DriveApp"*.
- Thiết lập: **Execute as = Me**, **Who has access = Anyone**.
- Deploy mới → **URL đổi** → phải cập nhật lại `docScriptUrl` trong `data.jsx`.
- Cấp quyền: chạy hàm `setup` một lần → Allow (Drive + Docs).

---

## 8. Chạy & Deploy

**Chạy thử tại máy** (không mở trực tiếp bằng file:// — Babel cần fetch qua http):
```bash
cd ielts-listening-reading
python3 -m http.server 8080     # rồi mở http://localhost:8080
```

**Đưa lên mạng:** repo này nối với **Netlify**. Đẩy code bằng **GitHub Desktop**
(Commit → Push) → **Netlify tự deploy lại**.
- `index.html` phải nằm ở **gốc repo**; Netlify: Build command = trống, Publish directory = trống/`.`.
- **Tên file phân biệt HOA/thường** trên Netlify → giữ tên đúng như trong `data.jsx`.
- **GitHub upload qua web chặn file > 25MB** (có `Week-4-MCQ-P2.mp4` ~29MB) → dùng
  **GitHub Desktop** hoặc **Netlify kéo–thả** cho file lớn.

---

## 9. Phụ thuộc bên ngoài & điểm cần biết

- **CDN:** React/ReactDOM/Babel (unpkg) + **GSAP 3.12.5 + ScrollTrigger (cdnjs)** + Google Fonts → cần internet khi mở web.
- **Nộp bài:** phụ thuộc Google Apps Script của chủ (mục 7).
- **Video buổi học (CHƯA độc lập):** `data.jsx` có **12 chỗ nhúng video YouTube**
  (`materials.recordings[].youtube`). Các video này **vẫn nằm trên kênh YouTube gắn tài khoản
  cũ**. Nếu kênh mất, video hỏng. Muốn độc lập hẳn: tải video về + up lên kênh mới rồi
  đổi ID. (Chưa làm — hỏi chủ nếu muốn xử lý.)
- **Màn chờ loading:** `index.html` có overlay `#tid-loader` (hamster chạy bánh xe, CSS thuần) hiện
  ngay khi mở web; bootstrap gọi `hideLoader()` để ẩn mượt khi app tải xong (hoặc khi lỗi thiếu data).
- **Fallback site cũ:** ĐÃ GỠ (không còn trỏ tới `phucielts.vercel.app`). Nếu thiếu `app/data.jsx` local
  thì hiện thẳng thông báo lỗi (hàm `fail()`), không gọi site cũ nữa.
- **`.DS_Store`:** file rác của macOS, vô hại. Nên để `.gitignore` bỏ qua.

---

## 10. Hướng dẫn làm một số việc thường gặp (LUÔN đề xuất trước khi làm)

- **Sửa nội dung bài đọc/câu hỏi/đáp án:** sửa trong `app/data.jsx` (đúng khóa/tuần/part).
  Cẩn thận giữ cú pháp JS hợp lệ (dấu phẩy, ngoặc). File rất lớn → sửa đúng chỗ, tránh làm hỏng.
- **Sửa nội dung tab Materials (đặc điểm dạng bài, quiz nhanh):** sửa hằng `SYLLABUS` trong `app/week.jsx`.
- **Thêm/đổi 1 tài liệu:** bỏ file PDF vào `assets/docs/` (tên chữ thường, gạch ngang) →
  cập nhật `url` tương ứng trong `data.jsx`. Tên file phải khớp y hệt (phân biệt hoa/thường).
- **Thêm/đổi 1 file nghe:** bỏ vào `assets/audio/` → cập nhật `audio.url` trong `data.jsx`.
- **Đổi màu/font/giao diện:** `app/tokens.css` (biến CSS) hoặc style trong các file `.jsx`. Đổi giá trị **biến CSS** (VD `--reading`, `--ink`, `--tid-orange`) sẽ lan ra toàn site.
- **Đổi/tắt chuyển động:** sửa `app/motion.js`. Người dùng bật "giảm chuyển động" trong hệ điều hành sẽ tự động thấy bản tĩnh.
- **Trang làm bài (test.jsx):** theme "Thi Thật" (pro) cố ý giống IELTS máy — hạn chế trang trí/motion ở đây.
- **Sau mọi thay đổi:** nhắc chủ chạy thử local, rồi Push qua GitHub Desktop để Netlify deploy.

---

## 11. Trạng thái hiện tại (cập nhật mỗi khi chốt thay đổi)

- ✅ Web chạy tốt trên Netlify, độc lập với site cũ (trừ video YouTube — mục 9).
- ✅ Mật khẩu đã gỡ, tất cả tuần mở.
- ✅ 10 file nghe trong `assets/audio/`, 16 PDF trong `assets/docs/` — tất cả khớp link trong `data.jsx`.
- ✅ Nộp bài chạy qua Apps Script mới (`docScriptUrl` bản mới, `docSecret=hoangngoc`).
- ✅ **Giao diện đã đổi sang theme "Calm Academy"** (2026-07-10): xanh pine + sage + vàng gold, bóng mềm, font Plus Jakarta Sans, + chuyển động GSAP (`app/motion.js`). Trang làm bài "Thi Thật" giữ nguyên cho sát IELTS máy. Flow không đổi.
- ✅ **Đã DE-BRAND toàn bộ "Phúc"** (2026-07-10, chủ đã chốt): web + tên khóa (`IELTS Reading`/`IELTS Listening`) + logo (bỏ chữ P → biểu tượng sách, chữ "IELTS · Reading & Listening") + **cả 16 PDF** (xoá "PHÚC" và ô header "Week N - …", giữ nguyên nội dung). Không còn chữ "Phúc" trong code/PDF. Đã gỡ luôn fallback về `phucielts.vercel.app`.
- ✅ **Màn chờ loading** (hamster chạy bánh xe) hiện ngay trong `index.html`, tự ẩn khi app tải xong.
- ✅ **Google Auth + allowlist (đã test thật, chạy ổn định — chủ xác nhận 2026-07-10):** `app/auth.jsx` (`window.TID_AUTH`) — đăng nhập Google (GIS) rồi kiểm tra email qua Apps Script allowlist; bọc `AuthGate` trong `app.jsx` (link `#/r/...` KHÔNG đi qua cổng). Client ID + `allowlistUrl` nằm trong `AUTH_CONFIG` đầu `auth.jsx`. **Tắt cổng:** để `clientId` rỗng. Email Google xác thực được dùng luôn cho nộp bài. Nhắc: file tĩnh vẫn công khai → cổng chỉ chặn giao diện. Thêm/bớt học viên = sửa Google Sheet allowlist (không cần deploy lại).
- ✅ **Kiểm tra lại allowlist mỗi lần mở web + khóa email nộp bài (2026-07-11, chủ đã chốt):** `auth.jsx` giờ hỏi LẠI allowlist mỗi lần tải trang cho người đã lưu phiên (kiểu "Mượt" — chạy ngầm, KHÔNG chặn hiển thị; HV bị xoá khỏi Sheet sẽ bị đá ra ~1s ở lần vào kế tiếp; lỗi mạng/Apps Script thì GIỮ NGUYÊN quyền để không khóa nhầm HV thật). Trước đây chỉ kiểm tra 1 lần rồi cache `authAllowed` trong localStorage → xoá khỏi Sheet vẫn vào được; nay đã khắc phục. Đồng thời **email nộp bài luôn lấy theo email đăng nhập** (`st.authEmail` ưu tiên, `test.jsx`); màn "Đổi tên" (`home.jsx` Onboard) khi cổng BẬT chỉ cho sửa TÊN, email hiển thị **chỉ đọc** → hết cảnh HV gõ email khác làm lệch email nhận Google Doc. Cổng TẮT (`clientId` rỗng) → cả 2 việc tự bỏ qua, web chạy y như cũ, không thêm request nào.
- ⏳ Chưa xử lý: 12 video YouTube vẫn ở kênh cũ (mục 9).

---

## 12. Nhật ký thay đổi (Claude thêm dòng mới mỗi khi chốt)

- 2026-07-10 — Tạo `CLAUDE.md`; xác nhận repo đầy đủ (index.html ở gốc, 12 file app,
  10 audio, 16 PDF, docScriptUrl mới, docSecret=hoangngoc, không còn link .html/r2.dev).
- 2026-07-10 — **Đại tu UX/UI sang theme "Calm Academy"** (chủ đã chốt). Chỉ đổi lớp giao
  diện, KHÔNG đụng logic/flow. Cụ thể:
  · `tokens.css` viết lại: bảng màu xanh pine/sage/vàng gold, nền oat, **bóng mềm** (thay bóng
    cứng sticker), bo góc lớn, font **Plus Jakarta Sans**; giữ nguyên tên biến CSS.
  · `shell.jsx`, `home.jsx`, `course.jsx` viết lại phần trình bày (hero gradient, thẻ mềm nâng
    khi hover, avatar bo vuông, nav kính mờ). `week.jsx`/`result.jsx`/`questions.jsx` làm mềm
    viền + bóng, tab kiểu mới.
  · Thêm `app/motion.js` (GSAP + ScrollTrigger) + nạp GSAP/ScrollTrigger trong `index.html`;
    reveal khi cuộn, mascot/vòng gold nổi, sóng âm động, stagger hero. Tôn trọng
    prefers-reduced-motion + có lưới an toàn (lỗi motion vẫn hiện nội dung).
  · Trang làm bài `test.jsx`: theme "Thi Thật" GIỮ NGUYÊN (sát IELTS máy); chỉ làm mềm theme
    "Vui tươi".
  · Đã kiểm tra: toàn bộ file JSX biên dịch sạch; render thử 11 trang/tab/theme bằng jsdom → không lỗi.
  · Sao lưu bản gốc trước khi sửa (thư mục tạm của phiên làm việc).
- 2026-07-10 — **Màn chờ loading + De-brand toàn bộ "Phúc"** (chủ đã chốt). Không đụng logic/flow:
  · `index.html`: thêm overlay `#tid-loader` (hamster chạy bánh xe, CSS thuần) hiện ngay + `hideLoader()`
    ẩn khi app xong; đổi `<title>` thành "IELTS Reading & Listening"; **gỡ fallback** về site cũ.
  · De-brand chữ: logo (`shell.jsx` — bỏ chữ P → biểu tượng sách, chữ "IELTS · Reading & Listening"),
    kicker + footer + placeholder (`home.jsx`), tên khóa trong `data.jsx` (`IELTS Reading`/`IELTS Listening`),
    README + comment đầu các file. Không còn "Phúc" trong code.
  · **16 PDF trong `assets/docs/`**: xoá chữ "PHÚC" (giữ phần "IELTS READING/LISTENING" gốc) và **che ô header
    "Week N - …"** bằng PyMuPDF (redact text tách biệt + che trắng dải header — KHÔNG xoá nhầm nội dung).
    Đã kiểm tra tỷ lệ text 0.97–1.0, số trang không đổi, render ảnh đối chiếu. Bản gốc PDF đã sao lưu.
  · Google Auth + allowlist: đã giao hướng dẫn thiết lập (OAuth Client ID + Apps Script đọc Google Sheet).
- 2026-07-10 — **Ráp Google Auth (GIS) + allowlist** (chủ đã gửi Client ID + URL). Thêm `app/auth.jsx`
  (`window.TID_AUTH`): đăng nhập Google → decode email → gọi Apps Script allowlist → nếu được phép thì
  vào app và điền sẵn email/tên cho bước nộp bài; nếu không thì màn "chưa có quyền". Nạp GIS + `auth.jsx`
  trong `index.html`; `app.jsx` bọc `AuthGate` (chừa link kết quả `#/r/...`). Cổng TẮT nếu `clientId` rỗng.
  Đã kiểm tra: biên dịch sạch; smoke test AuthGate (cho qua khi allowed / chặn khi chưa đăng nhập) + 11 trang → OK.
- 2026-07-10 — **Chủ đã test đăng nhập Google thật trên site → chạy ổn định. CHỐT toàn bộ đợt nâng cấp này.**
  Tổng kết đợt: theme "Calm Academy" + motion GSAP · màn chờ hamster · de-brand toàn bộ (web + 16 PDF) ·
  Google Auth + allowlist (đã bật, `clientId` có trong `auth.jsx`). Flow gốc (mở tuần, làm bài, nộp qua
  Apps Script, chấm điểm, link chia sẻ kết quả) giữ nguyên, không đổi.
- 2026-07-11 — **Vá 2 lỗ hổng đăng nhập/nộp bài** (chủ đã test thật OK + chốt). KHÔNG đụng flow khác:
  · **Vấn đề 1 — HV bị xoá khỏi Sheet vẫn vào được:** nguyên nhân là `auth.jsx` chỉ kiểm tra allowlist
    1 lần rồi lưu `authAllowed` trong localStorage, lần sau cho vào thẳng không hỏi lại. Sửa: thêm
    `recheckAllowlist(email)` (3 trạng thái allowed/denied/unknown) + `useEffect` kiểm tra LẠI mỗi lần
    mở web cho người đã lưu phiên. Kiểu "Mượt": render nội dung ngay, kiểm tra ngầm; chỉ khi Sheet trả
    rõ `allowed:false` mới đá ra "denied" (xoá cache + `disableAutoSelect`); lỗi mạng/không đọc được KQ →
    "unknown" → giữ nguyên quyền (fail-open, không khóa nhầm HV thật). Chạy 1 lần/lần-tải-trang, KHÔNG
    lặp khi chuyển tuần (hash routing không remount `AuthGate`). Đổi effect khởi tạo GIS: nay init cả cho
    người đã cache (chỉ chuyển màn "signin" khi chưa có phiên) để nút "Dùng tài khoản Google khác" hoạt
    động sau khi bị đá ra.
  · **Vấn đề 2 — nộp bài chia sẻ Doc nhầm email:** `st.email` bị cả auth (email đăng nhập) LẪN ô "Đổi tên"
    (email HV tự gõ) ghi đè → HV đổi email sau khi đăng nhập thì Doc share nhầm. Sửa: `test.jsx` nộp bài
    ưu tiên `st.authEmail || st.email`; `home.jsx` Onboard khi cổng BẬT + đã có `authEmail` → khóa email
    (chỉ đọc), chỉ cho sửa tên; submit ghi `email = authEmail`. Cổng TẮT → quay lại cho gõ email như cũ.
  · Ảnh hưởng: KHÔNG đổi tốc độ hiển thị (các call chạy nền, không chặn paint); link `#/r/...` vẫn đi vòng
    qua cổng; các trang/flow khác không chạm. Cổng TẮT → không thêm request nào.
  · Đã kiểm tra: Babel transform (preset react) `auth.jsx`/`home.jsx`/`test.jsx` → sạch. Chủ test local:
    xoá email khỏi Sheet + refresh → bị đá ra; email ô Đổi tên chỉ đọc; nộp bài share đúng email đăng nhập.
  · File đụng tới: `app/auth.jsx`, `app/home.jsx`, `app/test.jsx` (store.jsx/app.jsx không đổi).
