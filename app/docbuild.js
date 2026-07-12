/* ============================================================
   IELTS Reading & Listening — Doc model builder  (window.TID_DOCBUILD)

   MỤC ĐÍCH
   Dựng "mô hình tài liệu" (document model) ngay trên trình duyệt để tạo ra
   Google Doc bài làm GIỐNG hệt bố cục site cũ:
     • Mỗi Passage/Part = 1 bảng 2 cột: TRÁI = đoạn đọc (Reading) hoặc
       transcript (Listening), PHẢI = câu hỏi.
     • Đáp án của học viên được chèn ngay tại chỗ, tô XANH + IN ĐẬM (#0000FF).
     • Tên file = "Tên HV — Week N Bài tập trên lớp — DD-MM-YYYY HHhMM".

   File này CHỈ dựng dữ liệu (JSON). Việc vẽ ra Google Doc do Apps Script mới
   đảm nhiệm (xem apps-script/Code.gs). Không phụ thuộc React.

   Mô hình trả về:
     { filename, top:[Block,...], parts:[ {label, left:[Block], right:[Block]} ] }
   Block  = { r:[Run,...], a?:'l'|'c'|'j', bul?:1, ind?:0 }
   Run    = { t:"chữ", b?:1(đậm), i?:1(nghiêng), c?:"#hex"(màu) }
   ============================================================ */
(function () {
  var BLUE = "#0000FF";

  function run(t, o) { var r = { t: t == null ? "" : String(t) }; if (o) { if (o.b) r.b = 1; if (o.i) r.i = 1; if (o.c) r.c = o.c; } return r; }
  function ans(t) { return { t: (t == null ? "" : String(t)), b: 1, c: BLUE }; }      // đáp án HV: xanh đậm
  function para(runs, o) { var b = { r: runs && runs.length ? runs : [run("")] }; if (o) { if (o.a) b.a = o.a; if (o.ind) b.ind = o.ind; } return b; }
  function bullet(runs, ind) { var b = { r: runs && runs.length ? runs : [run("")], bul: 1 }; if (ind) b.ind = ind; return b; }

  function fmtVal(v) {
    if (v == null || v === "") return "______";
    if (Array.isArray(v)) return v.filter(function (x) { return x != null && String(x).trim() !== ""; }).join(", ") || "______";
    return String(v);
  }

  // **đậm** _nghiêng_ trong instructions → runs
  function richRuns(str, base) {
    var out = [];
    String(str).split(/(\*\*[^*]+\*\*|_[^_]+_)/g).forEach(function (p) {
      if (!p) return;
      if (/^\*\*[^*]+\*\*$/.test(p)) out.push(run(p.slice(2, -2), Object.assign({ b: 1 }, base || {})));
      else if (/^_[^_]+_$/.test(p)) out.push(run(p.slice(1, -1), Object.assign({ i: 1 }, base || {})));
      else out.push(run(p, base));
    });
    return out.length ? out : [run(String(str), base)];
  }

  // segments {t}|{gap:n} → runs (gap = "n. đáp án" xanh đậm)
  function segRuns(segs, ansMap) {
    var out = [];
    (segs || []).forEach(function (s) {
      if (s == null) return;
      if (s.t != null) out.push(run(s.t));
      else if (s.gap != null) { out.push(ans(s.gap + ". " + fmtVal(ansMap[s.gap]))); out.push(run(" ")); }
    });
    return out;
  }

  // (Qn) trong transcript → xanh (không đậm), phần còn lại dùng base
  function qTagRuns(text, base) {
    var out = [];
    String(text).split(/(\(Q\d+\))/).forEach(function (seg) {
      if (!seg) return;
      if (/^\(Q\d+\)$/.test(seg)) out.push(run(seg, { c: BLUE }));
      else out.push(run(seg, base));
    });
    return out.length ? out : [run(String(text), base)];
  }

  /* ---------- header của một nhóm câu hỏi ---------- */
  function headerBlocks(g) {
    var out = [];
    if (g.title) out.push(para([run(g.title, { b: 1 })]));
    if (g.instructions) String(g.instructions).split("\n").forEach(function (line) {
      if (line.trim() === "") return;
      out.push(para(richRuns(line)));
    });
    return out;
  }

  /* ---------- danh sách ngân hàng đáp án (A. …) ---------- */
  function bankBlocks(bank) {
    return (bank || []).map(function (b) { return para([run(b.letter + ". ", { b: 1 }), run(b.text)]); });
  }

  /* ---------- COMPLETION (notes / table / flow / sentences) ---------- */
  function completionBlocks(g, ansMap) {
    var out = [];
    if (g.heading) out.push(para([run(g.heading, { b: 1 })], { a: g.layout === "notes" ? "c" : "l" }));
    if (g.image) out.push(para([run("[Hình minh hoạ — xem trong đề gốc]", { i: 1 })]));
    var layout = g.layout || "notes";

    if (layout === "table" && g.rows) {
      if (g.columns && g.columns.some(function (c) { return c; }))
        out.push(para([run(g.columns.filter(Boolean).join("   |   "), { b: 1 })]));
      g.rows.forEach(function (row) {
        if (row.length === 1) {
          var cell = row[0];
          if (typeof cell === "string") out.push(para([run(cell, { b: 1 })]));
          else out.push(para(segRuns(cell, ansMap)));
        } else {
          var runs = [];
          row.forEach(function (cell, ci) {
            if (ci) runs.push(run("   —   "));
            if (typeof cell === "string") runs.push(run(cell));
            else runs = runs.concat(segRuns(cell, ansMap));
          });
          out.push(para(runs));
        }
      });
    } else if (layout === "flow" && g.steps) {
      g.steps.forEach(function (step) {
        var runs = [];
        if (step.label) runs.push(run(step.label + " ", { b: 1 }));
        runs = runs.concat(segRuns(step.segs, ansMap));
        out.push(para(runs));
      });
    } else if (layout === "sentences" && g.items) {
      g.items.forEach(function (it) { out.push(para(segRuns(it.segs, ansMap))); });
    } else if (g.lines) { // notes (mặc định)
      // Danh sách ghi chú → bullet; nếu chỉ là 1 đoạn văn tóm tắt (không có head,
      // 1 dòng segs) → in như đoạn văn thường (giống summary, không có dấu chấm).
      var isList = g.lines.some(function (l) { return l.head != null; })
        || g.lines.filter(function (l) { return !l.head; }).length > 1;
      g.lines.forEach(function (line) {
        if (line.head != null) out.push(para([run(line.head, { b: 1 })]));
        else if (isList) out.push(bullet(segRuns(line.segs, ansMap), (line.sub ? 1 : 0) + (line.lvl || 0)));
        else out.push(para(segRuns(line.segs, ansMap), { a: "j" }));
      });
    }
    if (g.after) g.after.forEach(function (line) { out.push(para(segRuns(line.segs, ansMap))); });
    if (g.bank) out = out.concat(bankBlocks(g.bank));
    return out;
  }

  /* ---------- SUMMARY-GAP ---------- */
  function summaryBlocks(g, ansMap) {
    var out = [];
    if (g.heading) out.push(para([run(g.heading, { b: 1 })]));
    out.push(para(segRuns(g.summary, ansMap), { a: "j" }));
    if (g.bank) out = out.concat(bankBlocks(g.bank));
    return out;
  }

  /* ---------- MATCHING info / heading  →  "đáp án - n. prompt" ---------- */
  function matchingInfoBlocks(g, ansMap) {
    var out = [];
    if (g.people) g.people.forEach(function (p) {
      out.push(para(p.letter ? [run(p.letter + ". ", { b: 1 }), run(p.name)] : [run(p.name)]));
    });
    (g.questions || []).forEach(function (q) {
      out.push(para([ans(fmtVal(ansMap[q.n])), run(" - " + q.n + ". " + q.prompt)]));
    });
    return out;
  }

  /* ---------- MATCHING endings  →  bank rồi "prompt - đáp án" ---------- */
  function matchingEndingBlocks(g, ansMap) {
    var out = [];
    if (g.endings) g.endings.forEach(function (e) { out.push(para([run(e.letter + " ", { b: 1 }), run(e.text)])); });
    (g.questions || []).forEach(function (q) {
      out.push(para([run(q.prompt + " - "), ans(fmtVal(ansMap[q.n]))]));
    });
    return out;
  }

  /* ---------- SHORT ANSWER  →  "n. câu hỏi" rồi "=> đáp án" ---------- */
  function shortAnswerBlocks(g, ansMap) {
    var out = [];
    (g.questions || []).forEach(function (q) {
      out.push(para([run(q.n + ". " + (q.q || q.prompt || ""))]));
      out.push(para([run("=> "), ans(fmtVal(ansMap[q.n]))]));
    });
    return out;
  }

  /* ---------- MC single  →  tô đậm phương án đã chọn ---------- */
  function mcSingleBlocks(g, ansMap) {
    var out = [];
    (g.questions || []).forEach(function (q) {
      out.push(para([run(q.n + ". " + q.prompt)]));
      (q.options || []).forEach(function (op) {
        var txt = op.letter + ". " + op.text;
        out.push(para([ansMap[q.n] === op.letter ? ans(txt) : run(txt)]));
      });
    });
    return out;
  }

  /* ---------- MC multi  →  tô đậm các phương án đã chọn ---------- */
  function mcMultiBlocks(g, ansMap) {
    var out = [];
    var arr = ansMap[g.n];
    if (!Array.isArray(arr)) arr = arr != null ? [arr] : [];
    if (g.prompt) out.push(para([run(g.prompt, { b: 1 })]));
    (g.options || []).forEach(function (op) {
      var txt = op.letter + ". " + op.text;
      out.push(para([arr.indexOf(op.letter) >= 0 ? ans(txt) : run(txt)]));
    });
    return out;
  }

  /* ---------- TFNG / YNNG  →  "đáp án - n. prompt" ---------- */
  function tfngBlocks(g, ansMap) {
    return (g.questions || []).map(function (q) {
      return para([ans(fmtVal(ansMap[q.n])), run(" - " + q.n + ". " + q.prompt)]);
    });
  }

  function groupBlocks(g, ansMap) {
    var out = headerBlocks(g);
    switch (g.kind) {
      case "completion": return out.concat(completionBlocks(g, ansMap));
      case "summary-gap": return out.concat(summaryBlocks(g, ansMap));
      case "matching-info":
      case "matching-heading": return out.concat(matchingInfoBlocks(g, ansMap));
      case "matching-ending": return out.concat(matchingEndingBlocks(g, ansMap));
      case "short-answer": return out.concat(shortAnswerBlocks(g, ansMap));
      case "mc-single": return out.concat(mcSingleBlocks(g, ansMap));
      case "mc-multi": return out.concat(mcMultiBlocks(g, ansMap));
      case "tfng": return out.concat(tfngBlocks(g, ansMap));
      case "gap-fill":
        return out.concat((g.questions || []).map(function (q) {
          return para([run((q.before || "") + " "), ans(fmtVal(ansMap[q.n])), run(" " + (q.after || ""))]);
        }));
      default: return out;
    }
  }

  /* ---------- cột trái: đoạn đọc (Reading) ---------- */
  function passageBlocks(p) {
    var out = [];
    if (p.passage.title) out.push(para([run(p.passage.title, { b: 1 })], { a: "c" }));
    (p.passage.paras || []).forEach(function (par) {
      if (par.subhead) out.push(para([run(par.text, { b: 1 })]));
      else {
        var runs = [];
        if (par.tag) runs.push(run(par.tag + " ", { b: 1 }));
        runs.push(run(par.text));
        out.push(para(runs, { a: "j" }));
      }
    });
    return out;
  }

  /* ---------- cột trái: transcript (Listening) ---------- */
  function transcriptBlocks(text) {
    var out = [];
    String(text).split(/\n\s*\n/).map(function (s) { return s.trim(); }).filter(Boolean).forEach(function (p, idx) {
      var m = p.match(/^(.+?\|\s*\d{1,2}:\d{2})\s([\s\S]*)$/);
      if (m) out.push(para([run(m[1] + " ", { b: 1 })].concat(qTagRuns(m[2]))));
      else out.push(para(qTagRuns(p, idx === 0 ? { b: 1 } : undefined)));
    });
    return out.length ? out : [para([run("")])];
  }

  /* ---------- điểm vào ---------- */
  function buildModel(ctx) {
    var D = (typeof window !== "undefined" && window.TID_DATA) || (typeof global !== "undefined" && global.TID_DATA) || {};
    var SCRIPTS = (typeof window !== "undefined" && window.TID_SCRIPTS) || (typeof global !== "undefined" && global.TID_SCRIPTS) || {};
    var test = ctx.test, weekNum = ctx.weekNum, kind = ctx.kind;
    var answersByPart = ctx.answersByPart || {};
    var kindLabel = kind === "classwork" ? "Bài tập trên lớp" : "Bài tập về nhà";

    var now = new Date();
    var pad = function (n) { return String(n).padStart(2, "0"); };
    var stamp = pad(now.getDate()) + "-" + pad(now.getMonth() + 1) + "-" + now.getFullYear() + " " + pad(now.getHours()) + "h" + pad(now.getMinutes());
    var filename = (ctx.student || "(chưa nhập tên)").trim() + " — Week " + weekNum + " " + kindLabel + " — " + stamp;

    var el = ctx.elapsed || 0;
    var top = [para([run("Thời gian làm bài: " + Math.floor(el / 60) + " phút " + pad(el % 60) + " giây", { b: 1 })], { a: "c" })];

    var scripts = SCRIPTS[test.id] || [];
    var parts = (test.parts || []).map(function (p, pi) {
      var ansMap = answersByPart[String(pi + 1)] || {};
      var left;
      if (p.passage) left = passageBlocks(p);
      else if (scripts[pi]) left = transcriptBlocks(scripts[pi]);
      else left = [para([run("(Chưa có transcript cho phần này)", { i: 1 })])];

      var right = [];
      if (p.audio && p.audio.label) right.push(para([run("🔊 Audio: " + p.audio.label, { b: 1 })]));
      (p.groups || []).forEach(function (g) { right = right.concat(groupBlocks(g, ansMap)); });

      return { label: p.part || "", left: left, right: right };
    });

    return { filename: filename, top: top, parts: parts };
  }

  var api = { buildModel: buildModel };
  if (typeof window !== "undefined") window.TID_DOCBUILD = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})();
