/* ============================================================
   CẤU HÌNH BACKEND TẠO GOOGLE DOC BÀI LÀM  (window.TID_DOC_CFG)

   ⭐ CHỖ DUY NHẤT bạn cần sửa sau khi deploy Apps Script mới.

   • url    : dán URL "New deployment" của Apps Script MỚI (apps-script/Code.gs)
              vào giữa hai dấu nháy. Dạng:
              https://script.google.com/macros/s/AKfyc...../exec
   • secret : phải KHỚP biến SECRET trong Code.gs (mặc định "hoangngoc").

   Khi url còn để TRỐNG "" → web chạy y như cũ (dùng backend cũ trong data.jsx),
   KHÔNG có gì thay đổi. Chỉ khi bạn dán url vào đây thì bài nộp mới đi qua
   backend mới (Doc đầy đủ đề + đáp án).
   ============================================================ */
window.TID_DOC_CFG = {
  url: "https://script.google.com/macros/s/AKfycby26mBzfltkVVA5D68GNH_MA0Sn4vREl_rsp_YKCl-7ID9BBfauWjdwIOZsWDfW5XBBag/exec",
  secret: "hoangngoc"
};
