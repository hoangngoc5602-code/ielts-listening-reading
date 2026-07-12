/* ============================================================
   IELTS Reading & Listening — Backend tạo Google Doc bài làm  (BẢN MỚI)

   Script này NHẬN sẵn "mô hình tài liệu" (model) do web dựng, rồi VẼ ra
   Google Doc: bảng 2 cột (đề | câu hỏi), đáp án HV tô xanh đậm — giống hệt
   bố cục site cũ. Script KHÔNG cần biết nội dung đề; mọi thứ nằm trong model.

   CÀI ĐẶT (xem apps-script/HUONG-DAN.md):
     1) Dán toàn bộ file này vào editor Apps Script (thay code cũ).
     2) Chạy 1 lần hàm  setup  → Cho phép quyền (Docs + Drive).
     3) Deploy → New deployment → Web app → Execute as: Me,
        Who has access: Anyone → copy URL "…/exec".
     4) Dán URL đó vào app/doc-config.js (url) trên web.

   Lưu ý: SECRET dưới đây PHẢI khớp secret trong app/doc-config.js.
   ============================================================ */

var SECRET = "hoangngoc";
var COL_WIDTH = 272;          // bề rộng mỗi cột (points) — rộng gần hết khổ giấy
var BORDER = "#c9c9c9";

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    if (!data || data.secret !== SECRET) return json({ ok: false, error: "Sai mã bảo mật (secret)." });
    var model = data.model;
    if (!model || !model.filename) return json({ ok: false, error: "Thiếu dữ liệu bài làm (model)." });

    var doc = DocumentApp.create(String(model.filename).slice(0, 240));
    var body = doc.getBody();
    body.setMarginTop(28); body.setMarginBottom(28);
    body.setMarginLeft(28); body.setMarginRight(28);

    // 1) khối trên cùng (dòng thời gian…)
    (model.top || []).forEach(function (b) { renderBlock(body, b); });

    // 2) mỗi part = (sang trang mới) + nhãn "Part N" (kiểu Heading → hiện ở Mục lục
    //    để điều hướng như tab) + bảng 2 cột.
    var multi = (model.parts || []).length > 1;
    (model.parts || []).forEach(function (part, i) {
      if (i > 0) body.appendPageBreak();
      if (part.label) {
        var lp = body.appendParagraph(String(part.label));
        if (multi) { try { lp.setHeading(DocumentApp.ParagraphHeading.HEADING1); } catch (e) {} }
        lp.editAsText().setBold(true);
        lp.setSpacingBefore(8); try { lp.setSpacingAfter(6); } catch (e) {}
      }
      var table = body.appendTable();
      var row = table.appendTableRow();
      var c0 = row.appendTableCell(); renderInto(c0, part.left || []); trimCell(c0);
      var c1 = row.appendTableCell(); renderInto(c1, part.right || []); trimCell(c1);
      try { table.setBorderColor(BORDER); table.setBorderWidth(1); } catch (err) {}
      try { c0.setWidth(COL_WIDTH); c1.setWidth(COL_WIDTH); } catch (err) {}
    });

    // xoá đoạn trống mặc định ở đầu tài liệu
    trimLeading(body);
    doc.saveAndClose();

    // chia sẻ cho email học viên (nếu có) để em mở được
    var email = String(data.email || "").trim();
    if (email && /@/.test(email)) {
      try { DriveApp.getFileById(doc.getId()).addEditor(email); }
      catch (e1) { try { DriveApp.getFileById(doc.getId()).addViewer(email); } catch (e2) {} }
    }
    return json({ ok: true, url: doc.getUrl() });
  } catch (err) {
    return json({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

function doGet() {
  return ContentService.createTextOutput("IELTS Doc backend đang chạy. Hãy gửi POST từ web.");
}

/* ---- render một khối (đoạn văn hoặc bullet) với các run có định dạng ---- */
function renderBlock(container, b) {
  var el = b.bul ? container.appendListItem("") : container.appendParagraph("");
  if (b.bul) {
    el.setGlyphType(DocumentApp.GlyphType.BULLET);
    el.setNestingLevel(Math.min(b.ind || 0, 3));
  }
  var t = el.editAsText();
  var pos = 0;
  (b.r || []).forEach(function (run) {
    var s = run && run.t != null ? String(run.t) : "";
    if (!s) return;
    t.appendText(s);
    var start = pos, end = pos + s.length - 1;
    // Đặt RÕ RÀNG cho từng run (kể cả tắt) — nếu không, Docs để chữ mới "thừa kế"
    // định dạng của run trước → màu/đậm bị loang sang phần sau.
    t.setBold(start, end, !!run.b);
    t.setItalic(start, end, !!run.i);
    t.setForegroundColor(start, end, run.c || "#000000");
    t.setBackgroundColor(start, end, run.bg ? run.bg : null);   // null = xoá nền (chống loang)
    t.setLinkUrl(start, end, run.link ? run.link : null);
    pos += s.length;
  });
  if (b.a) {
    var A = DocumentApp.HorizontalAlignment;
    el.setAlignment(b.a === "c" ? A.CENTER : b.a === "j" ? A.JUSTIFY : A.LEFT);
  }
  // Khoảng cách dòng/đoạn cho dễ đọc
  try { el.setLineSpacing(1.25); el.setSpacingAfter(4); } catch (e) {}
  return el;
}

function renderInto(container, blocks) {
  blocks.forEach(function (b) { renderBlock(container, b); });
}

/* xoá đoạn trống đầu tiên của 1 ô bảng (Docs luôn tạo sẵn 1 đoạn trống) */
function trimCell(cell) {
  if (cell.getNumChildren() > 1) {
    var f = cell.getChild(0);
    if (f.getType() === DocumentApp.ElementType.PARAGRAPH && f.asParagraph().getText() === "") f.removeFromParent();
  }
}
function trimLeading(body) {
  try {
    var f = body.getChild(0);
    if (body.getNumChildren() > 1 && f.getType() === DocumentApp.ElementType.PARAGRAPH && f.asParagraph().getText() === "") f.removeFromParent();
  } catch (e) {}
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/* Chạy 1 lần để cấp quyền Docs + Drive (tạo rồi xoá 1 file thử) */
function setup() {
  var d = DocumentApp.create("Cấp quyền IELTS (có thể xoá)");
  d.saveAndClose();
  DriveApp.getFileById(d.getId()).setTrashed(true);
}
