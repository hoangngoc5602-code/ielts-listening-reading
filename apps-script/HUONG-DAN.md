# Hướng dẫn cài backend tạo Google Doc bài làm (BẢN MỚI)

Mục tiêu: khi học viên **Nộp bài**, Google Doc sinh ra sẽ **tái hiện đầy đủ đề**
(đoạn đọc / transcript nghe **bên trái**, câu hỏi **bên phải**) và **điền đáp án
của học viên** vào từng chỗ (tô **xanh + in đậm**) — giống hệt site cũ.

> Toàn bộ phần "vẽ" nội dung do web lo. Apps Script mới chỉ nhận dữ liệu rồi tạo
> Doc, nên code rất ngắn và ổn định, về sau hầu như không phải đụng tới nữa.

**Bạn cần làm 5 bước.** Mất khoảng 5–10 phút. Cứ làm từ từ theo đúng thứ tự.

---

## Bước 1 — Tạo Apps Script mới & dán code

1. Mở trình duyệt, đăng nhập **đúng tài khoản** `hoangngoc5602@gmail.com`.
2. Vào **https://script.google.com** → bấm nút **New project** (Dự án mới) ở góc trái.
3. Cửa sổ soạn code hiện ra, bên trái có file **`Code.gs`** với vài dòng mặc định.
   **Bôi đen xoá hết** nội dung mặc định đó.
4. Mở file **`apps-script/Code.gs`** trong dự án này, **copy toàn bộ** rồi **dán** vào.
5. (Khuyến nghị) Bấm tên dự án ở trên cùng, đổi thành **"IELTS Doc Backend"** cho dễ nhớ.
6. Bấm biểu tượng **đĩa mềm 💾 (Save project)** hoặc `Ctrl/Cmd + S`.

> Mã bảo mật đã đặt sẵn là `hoangngoc` (dòng `var SECRET = "hoangngoc";`). Không cần đổi.

---

## Bước 2 — Cấp quyền (chạy hàm `setup` một lần)

1. Trên thanh công cụ, ở ô chọn hàm (dropdown cạnh nút ▶ Run), chọn **`setup`**.
2. Bấm **▶ Run**.
3. Google hỏi quyền → bấm **Review permissions** → chọn tài khoản
   `hoangngoc5602@gmail.com`.
4. Nếu thấy màn "Google hasn't verified this app" → bấm **Advanced** →
   **Go to IELTS Doc Backend (unsafe)** → **Allow**.
   (Đây là script của chính bạn nên an toàn.)
5. Chạy xong không báo lỗi đỏ là được (nó tạo 1 file thử rồi tự xoá vào thùng rác).

---

## Bước 3 — Deploy thành Web app

> ⚠️ Quan trọng: **luôn tạo "New deployment"** mỗi lần muốn áp dụng code mới.
> Không dùng lại bản deploy cũ (dễ dính lỗi *"Truy cập bị từ chối: DriveApp"*).

1. Góc trên bên phải, bấm **Deploy** → **New deployment**.
2. Bấm biểu tượng ⚙️ (Select type) → chọn **Web app**.
3. Điền:
   - **Description**: gõ gì cũng được (vd "v1").
   - **Execute as**: **Me (hoangngoc5602@gmail.com)**.
   - **Who has access**: **Anyone**.
4. Bấm **Deploy**.
5. Copy dòng **Web app URL**, dạng:
   `https://script.google.com/macros/s/AKfyc…………/exec`
   (Bấm **Copy**. Giữ nguyên tab này để lát nữa lấy lại nếu cần.)

---

## Bước 4 — Dán URL vào web

1. Mở file **`app/doc-config.js`** trong dự án.
2. Dán URL vừa copy vào giữa hai dấu nháy ở dòng `url`:
   ```js
   window.TID_DOC_CFG = {
     url: "https://script.google.com/macros/s/AKfyc…………/exec",
     secret: "hoangngoc"
   };
   ```
3. Lưu file.

> Chừng nào `url` còn để trống `""` thì web vẫn chạy y như cũ (dùng backend cũ).
> Dán URL vào là backend mới bật lên.

---

## Bước 5 — Đưa lên mạng & thử

1. Mở **GitHub Desktop** → **Commit** (ghi chú ví dụ "Doc bài làm đầy đủ đề")
   → **Push**. Netlify sẽ tự deploy lại sau ~1–2 phút.
2. Vào web, **đăng nhập**, mở **một bài Reading** (vd Week 1 → Bài tập trên lớp),
   làm vài câu → **Nộp bài** → bấm **Mở bài làm trên Google Doc**.
3. Kiểm tra: có bảng 2 cột (đề bên trái, câu hỏi bên phải), đáp án của em tô
   **xanh đậm**. Làm tương tự với **một bài Listening** (kiểm tra có transcript bên trái).

---

## Xử lý sự cố

- **"Truy cập bị từ chối: DriveApp / DocumentApp"** → bạn đang dùng bản deploy cũ.
  Quay lại **Deploy → New deployment** (tạo bản MỚI), rồi cập nhật lại URL ở Bước 4.
- **Bấm nộp không ra file / báo lỗi** → kiểm tra:
  1. `url` trong `app/doc-config.js` đã dán đúng (kết thúc bằng `/exec`).
  2. `secret` ở `doc-config.js` khớp `SECRET` trong `Code.gs` (đều là `hoangngoc`).
  3. Đã Push và Netlify deploy xong chưa.
- **Muốn tạm tắt backend mới** (quay về như cũ) → xoá URL, để `url: ""` trong
  `doc-config.js`, Push lại.
- **Học viên không mở được Doc** → Doc được chia sẻ theo **email đăng nhập Google**
  của em. Đảm bảo em mở bằng đúng tài khoản đó.

---

## Ghi chú kỹ thuật (không bắt buộc đọc)

- File mới thêm vào web: `app/doc-config.js`, `app/scripts.js` (transcript nghe),
  `app/docbuild.js` (bộ dựng nội dung Doc). `index.html` nạp thêm 3 file này.
  `app/test.jsx` được sửa để gửi "model" sang backend mới (có cơ chế tự lùi về
  backend cũ nếu lỗi).
- Backend cũ trong `data.jsx` (`docScriptUrl`) vẫn giữ nguyên làm lưới an toàn.
- Transcript Listening (`app/scripts.js`) được thu hồi từ Doc của site cũ, đủ 8 tuần.
