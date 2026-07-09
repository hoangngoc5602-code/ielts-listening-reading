/* ============================================================
   TID — Week page: 3 tabs (Materials / Classwork / Homework)
   Exposed on window.TID_WEEK
   ============================================================ */
const { useState: useStateW } = React;
const { Icons: IW, SunMascot: SunW } = window.TID_ICONS;
const { TopNav: TopNavW } = window.TID_SHELL;
const { CrumbsLight: CrumbsLightW, Empty: EmptyW } = window.TID_COURSE;
const { useStore: useStoreW, go: goW, weekUnlocked: weekUnlockedW } = window.TID_STORE;

/* ---------- Per-week syllabus content (from the PDF syllabi) ----------
   Each week: type (dạng bài), order (trình tự đáp án — điểm cực kỳ quan trọng),
   keySkill (kỹ năng đọc/nghe quan trọng nhất), features (đặc điểm dạng bài),
   tips (lưu ý để làm tốt), quiz (1–3 câu hỏi hiểu bài về nội dung buổi học). */
const SYLLABUS = {
  reading: {
    1: {
      type: "Parallel Reading Method",
      order: "sequential",
      orderText: "Trong cùng 1 bài tập, đáp án thường theo trình tự lần lượt. Giữa các bài tập khác nhau thì có thể bị xáo trộn.",
      keySkill: "Đọc có mục tiêu — xử lý theo ý, không dịch từng từ",
      features: [
        "Câu hỏi trong cùng một bài tập thường xuất hiện theo trình tự lần lượt của thông tin trong bài đọc.",
        "Tư duy đúng: hiểu ý ở mức câu/đoạn và so nghĩa tương đương (paraphrase) — KHÔNG dịch từng từ, không đọc thụ động.",
        "Quy trình 4 bước: (1) Xác định dạng câu hỏi → (2) Highlight keywords → (3) Áp dụng cách làm của dạng → (4) Đọc câu tiếp theo để định vị thông tin.",
      ],
      tips: [
        "ALWAYS READ WITH GOALS IN MIND — đọc lướt đến khi tìm được vị trí thông tin rồi mới đọc chậm & phân tích.",
        "Đừng làm lần lượt từng câu một — hãy đọc & xử lý 2–3 câu hỏi cùng lúc.",
        "Chỉ cần hiểu đúng chỗ đề hỏi, không cần hiểu toàn bộ bài đọc.",
      ],
      quiz: [
        { q: "Trong cùng một bài tập Reading, đáp án thường xuất hiện như thế nào?", opts: ["Theo trình tự lần lượt của bài đọc", "Hoàn toàn ngẫu nhiên", "Luôn ở đoạn cuối bài"], a: 0 },
        { q: "Tư duy ĐÚNG khi làm Reading là gì?", opts: ["Dịch từng từ thật kỹ", "Xử lý theo ý & so nghĩa tương đương", "Đọc thuộc cả bài trước khi làm"], a: 1 },
        { q: "Theo Parallel Reading Method, nên làm câu hỏi ra sao?", opts: ["Làm hết câu 1 rồi mới sang câu 2", "Xử lý 2–3 câu cùng lúc", "Chỉ làm câu dễ, bỏ câu khó"], a: 1 },
      ],
    },
    2: {
      type: "Sentence Completion & Short Answer",
      order: "sequential",
      orderText: "Đáp án đi theo trình tự lần lượt — câu sau thường xuất hiện sau câu trước trong bài đọc.",
      keySkill: "Xác định Paraphrase",
      features: [
        "Phải dùng NGUYÊN TỪ trong bài đọc (word-for-word), không được tự ý thay đổi.",
        "Thường có giới hạn từ cho đáp án, ví dụ: NO MORE THAN TWO WORDS / ONE WORD ONLY.",
        "Các dạng hay gặp: Summary, Note, Table và Flowchart Completion.",
      ],
      tips: [
        "Đọc kỹ giới hạn từ; New York = 2 words, well-being = 1 word, mother-in-law = 1 word.",
        "Tránh lỗi chính tả và lỗi ngữ pháp (thiếu “s”, sai thì).",
        "Tuyệt đối không trả lời vượt quá giới hạn từ cho phép.",
      ],
      quiz: [
        { q: "Khi điền đáp án dạng Completion, bạn phải dùng từ như thế nào?", opts: ["Tự diễn đạt lại bằng từ của mình", "Dùng nguyên từ trong bài đọc", "Dịch sang nghĩa tương đương"], a: 1 },
        { q: "“NO MORE THAN TWO WORDS” nghĩa là gì?", opts: ["Phải viết đúng 2 từ", "Không quá 2 từ", "Ít nhất 2 từ"], a: 1 },
        { q: "Kỹ năng quan trọng nhất ở dạng bài này là gì?", opts: ["Xác định paraphrase", "Đọc thật nhanh", "Đoán mò đáp án"], a: 0 },
      ],
    },
    3: {
      type: "True / False / Not Given",
      order: "sequential",
      orderText: "Các đáp án thường tuân theo trình tự lần lượt trong bài đọc.",
      keySkill: "Xác định Paraphrase & đọc hiểu nội dung",
      features: [
        "TRUE = thông tin trong câu hỏi KHỚP / đồng nghĩa với bài đọc.",
        "FALSE = thông tin MÂU THUẪN rõ ràng với bài đọc.",
        "NOT GIVEN = thông tin KHÔNG được nhắc đến, hoặc bài không đủ thông tin để kết luận.",
      ],
      tips: [
        "Không dành quá nhiều thời gian cho 1 câu — không thấy thông tin thì rất có thể là NOT GIVEN.",
        "Cẩn thận với các từ như only, all, never (some ≠ all).",
        "Chỉ dùng thông tin trong bài, KHÔNG suy luận cá nhân. Điền đúng định dạng T/F/NG hay Y/N/NG.",
      ],
      quiz: [
        { q: "Khi nào chọn NOT GIVEN?", opts: ["Khi thông tin mâu thuẫn với bài", "Khi thông tin không được nhắc đến / không đủ để kết luận", "Khi thông tin khớp với bài"], a: 1 },
        { q: "FALSE khác NOT GIVEN ở điểm nào?", opts: ["FALSE = mâu thuẫn rõ ràng; NOT GIVEN = không có thông tin", "Chúng giống hệt nhau", "FALSE = không có thông tin"], a: 0 },
        { q: "Có được dùng kiến thức cá nhân để suy luận đáp án không?", opts: ["Có, miễn là hợp lý", "Không, chỉ dùng thông tin trong bài", "Chỉ khi không tìm thấy thông tin"], a: 1 },
      ],
    },
    4: {
      type: "Multiple Choice Questions",
      order: "sequential",
      orderText: "Các đáp án thường tuân theo trình tự lần lượt trong bài đọc.",
      keySkill: "Xác định Paraphrase, đọc hiểu & loại trừ (elimination)",
      features: [
        "Lượng thông tin phải đọc khá nhiều; các đáp án đôi khi gần giống nhau, dễ gây nhầm lẫn.",
        "Bài đọc chứa thông tin liên quan tới TẤT CẢ các đáp án — phải hiểu ý thay vì tìm từ y nguyên.",
        "Các dạng câu hỏi: Ý chính (Main Idea), Thông tin chi tiết, Thái độ tác giả (Attitude), Ngụ ý (Inference).",
      ],
      tips: [
        "Tìm bằng chứng cụ thể trong bài cho từng đáp án; nhiều đáp án “có vẻ đúng” nhưng không chính xác 100%.",
        "Cẩn thận với câu hỏi phủ định (Which … is NOT true) — đọc kỹ để tránh tìm nhầm.",
        "Nên đọc cả câu hỏi và 4 đáp án A/B/C/D trước khi đọc bài.",
      ],
      quiz: [
        { q: "Vì sao MCQ dễ gây nhầm lẫn?", opts: ["Vì các đáp án thường gần giống nhau & bài chứa thông tin về tất cả đáp án", "Vì không có đáp án đúng", "Vì luôn có 2 đáp án đúng"], a: 0 },
        { q: "Nên làm gì trước khi đọc bài?", opts: ["Đọc cả câu hỏi và 4 đáp án A/B/C/D", "Chỉ đọc câu hỏi", "Đọc luôn bài, bỏ qua đáp án"], a: 0 },
        { q: "Với câu hỏi có chữ NOT, bạn cần?", opts: ["Bỏ qua câu đó", "Đọc kỹ để tránh tìm nhầm thông tin", "Chọn đáp án đầu tiên"], a: 1 },
      ],
    },
    5: {
      type: "Matching Headings",
      order: "non-sequential",
      orderText: "KHÔNG theo trình tự lần lượt — phải nối tiêu đề phù hợp cho từng đoạn.",
      keySkill: "Đọc và tổng hợp nội dung cả đoạn (không bám keyword)",
      features: [
        "Nối mỗi đoạn văn với một tiêu đề (heading) phù hợp.",
        "Thường có NHIỀU heading hơn số đoạn, và không được dùng 1 heading cho 2 đoạn.",
        "Nếu chỉ bám keyword sẽ rất dễ bị lừa bởi các heading gây nhiễu.",
      ],
      tips: [
        "Tự tóm tắt ý chính của đoạn TRƯỚC, rồi mới so với danh sách heading.",
        "Khi 2 heading đều có vẻ phù hợp: chọn cái sát nội dung CHÍNH của cả đoạn hơn; luôn có lý do, tránh chọn cảm tính.",
        "Đừng tốn quá nhiều thời gian cho 1 câu — dùng phương pháp loại trừ để dễ hơn.",
      ],
      quiz: [
        { q: "Đáp án dạng Matching Headings có theo trình tự lần lượt không?", opts: ["Có, luôn theo thứ tự", "Không theo trình tự lần lượt", "Chỉ 2 câu đầu theo thứ tự"], a: 1 },
        { q: "Cách làm đúng cho mỗi đoạn là gì?", opts: ["Chỉ tìm keyword giống heading", "Tự tóm tắt ý chính đoạn rồi so với heading", "Chọn heading dài nhất"], a: 1 },
        { q: "Khi 2 heading đều hợp với 1 đoạn, nên chọn?", opts: ["Cái sát nội dung chính của cả đoạn hơn", "Chọn ngẫu nhiên", "Cái xuất hiện trước trong danh sách"], a: 0 },
      ],
    },
    6: {
      type: "Matching Names",
      order: "non-sequential",
      orderText: "KHÔNG theo trình tự lần lượt — nối tên người / địa danh với thông tin tương ứng.",
      keySkill: "Scan thông tin một cách hiệu quả",
      features: [
        "Yêu cầu nối tên người hoặc tên địa danh với một thông tin / quan điểm nhất định.",
        "Thông tin để trả lời thường không theo thứ tự câu hỏi.",
      ],
      tips: [
        "Scan cả bài để highlight vị trí TẤT CẢ các tên cần tìm ngay từ đầu.",
        "Một người có thể được gọi bằng họ hoặc tên (Frank Smith → “Frank” hoặc “Smith”) — tìm cả hai.",
        "Làm những tên xuất hiện ÍT lần trước (1 lần) — dễ hơn tên xuất hiện 3–4 lần.",
      ],
      quiz: [
        { q: "Việc đầu tiên nên làm với dạng Matching Names là gì?", opts: ["Đọc kỹ cả bài từ đầu đến cuối", "Scan & highlight vị trí tất cả các tên cần tìm", "Đoán đáp án theo thứ tự"], a: 1 },
        { q: "Nếu một người tên Frank Smith, bài đọc có thể nhắc tới họ bằng?", opts: ["Chỉ “Frank Smith”", "“Frank” hoặc “Smith” — nên tìm cả hai", "Chỉ bằng chữ cái đầu"], a: 1 },
        { q: "Nên ưu tiên xử lý tên nào trước?", opts: ["Tên xuất hiện nhiều lần", "Tên xuất hiện ít lần (dễ hơn)", "Tên dài nhất"], a: 1 },
      ],
    },
    7: {
      type: "Which Paragraph Contains (Matching Information)",
      order: "non-sequential",
      orderText: "KHÔNG theo trình tự lần lượt — tìm đoạn văn chứa thông tin được cho.",
      keySkill: "Đọc và tổng hợp nội dung của từng đoạn",
      features: [
        "Nối một thông tin nhất định với đoạn văn chứa nó.",
        "Một đoạn có thể KHÔNG chứa đáp án nào, hoặc chứa đáp án cho NHIỀU câu.",
        "Dễ nhầm với True/False/Not Given — nhưng ở đây chỉ cần tìm vị trí, không xét đúng/sai.",
      ],
      tips: [
        "Chỉ cần tìm đoạn chứa thông tin, KHÔNG quan tâm độ chính xác đúng/sai.",
        "Tìm thông tin dễ nhất trước: tên riêng, số liệu, từ đặc biệt thường dễ định vị hơn.",
        "Keyword trong đáp án thường được paraphrase lại trong bài đọc.",
      ],
      quiz: [
        { q: "Mục tiêu của dạng “Which paragraph contains” là gì?", opts: ["Xác định đúng/sai của thông tin", "Tìm đoạn văn chứa thông tin được cho", "Chọn tiêu đề cho đoạn"], a: 1 },
        { q: "Một đoạn văn có thể chứa bao nhiêu đáp án?", opts: ["Luôn đúng 1 đáp án", "Có thể không có hoặc có nhiều đáp án", "Tối đa 1 đáp án"], a: 1 },
        { q: "Nên tìm loại thông tin nào trước cho nhanh?", opts: ["Tên riêng, số liệu, từ đặc biệt", "Các từ nối", "Câu đầu mỗi đoạn"], a: 0 },
      ],
    },
    8: {
      type: "Comprehensive Review",
      order: "mixed",
      orderText: "Tùy dạng: Gap fill / TFNG / MCQ theo trình tự lần lượt; Matching Headings / Names / Information thì KHÔNG theo trình tự.",
      keySkill: "Quản lý thời gian (60 phút / 3 passages) & phân tích lỗi",
      features: [
        "Ôn tập tổng hợp cả 6 dạng câu hỏi và cách nhận diện trình tự đáp án của từng dạng.",
        "Phân bổ ~20 phút cho mỗi passage.",
        "Nhận diện dạng bài TRƯỚC → áp dụng đúng chiến thuật của dạng đó.",
      ],
      tips: [
        "Nhớ bảng tổng hợp: dạng nào theo trình tự, dạng nào không, kỹ năng đọc quan trọng của từng dạng.",
        "Chữa đề để biết vì sao mình sai và vì sao mình đúng.",
        "Lập Keyword Table và lên kế hoạch ôn tập định kỳ.",
      ],
      quiz: [
        { q: "Dạng nào KHÔNG theo trình tự lần lượt?", opts: ["Gap Fill & Short Answer", "Matching Headings / Names / Information", "True / False / Not Given"], a: 1 },
        { q: "Nên phân bổ thời gian thế nào cho 3 passages trong 60 phút?", opts: ["Khoảng 20 phút mỗi passage", "Dồn hết cho passage cuối", "Không cần để ý thời gian"], a: 0 },
        { q: "Bước quan trọng trước khi làm mỗi nhóm câu hỏi là?", opts: ["Nhận diện dạng bài để chọn chiến thuật", "Đọc thuộc cả bài", "Làm câu cuối trước"], a: 0 },
      ],
    },
  },
  listening: {
    1: {
      type: "Listening Diagnosis & DTT Method",
      order: "sequential",
      orderText: "Listening là LINEAR — không quay lại được; trong mỗi part đáp án đi theo trình tự câu hỏi.",
      keySkill: "Nghe theo ý (Idea-based) & nghe từ nhấn trọng âm (Stress-based)",
      features: [
        "Bản chất Spoken English: nghe theo Ý, nghe từ mang trọng âm — KHÔNG dịch & nghe từng từ.",
        "Hiện tượng nối âm – nuốt âm – yếu hóa là bình thường, cần làm quen.",
        "Phương pháp DTT (Double Two Three): tận dụng lúc audio giới thiệu/đọc lại để đọc trước câu hỏi part sau.",
      ],
      tips: [
        "Luôn đọc câu hỏi TRƯỚC khi nghe; tận dụng mọi khoảng nghỉ để đọc trước part tiếp theo.",
        "Nghe để hiểu thông tin, không phải chép lại từng chữ.",
        "Vì là linear, lỡ một câu thì bỏ qua ngay, tập trung câu tiếp theo.",
      ],
      quiz: [
        { q: "Bản chất đúng của Spoken English là gì?", opts: ["Phát âm rõ từng từ", "Nghe theo ý & theo từ nhấn trọng âm (stress-based)", "Phải nhớ cả câu dài"], a: 1 },
        { q: "Bài thi Listening có cho nghe lại / quay lại không?", opts: ["Có, nghe lại thoải mái", "Không — Listening là linear", "Chỉ Part 4 được nghe lại"], a: 1 },
        { q: "Phương pháp DTT giúp bạn làm gì?", opts: ["Tận dụng khoảng nghỉ để đọc trước câu hỏi part sau", "Nghe nhanh gấp đôi", "Dịch nhanh hơn"], a: 0 },
      ],
    },
    2: {
      type: "Form Filling (Part 1)",
      order: "sequential",
      orderText: "Đáp án đi theo trình tự lần lượt của câu hỏi.",
      keySkill: "Prediction & nghe chính xác số / tên / địa chỉ",
      features: [
        "Part 1 = hội thoại giữa 2 người về tình huống quen thuộc hằng ngày.",
        "Điền thông tin vào form / bảng đăng ký / ghi chú / flowchart; thường có giới hạn từ.",
        "Hay phải nghe Synonym (từ đồng nghĩa) hoặc Paraphrase (cụm đồng nghĩa).",
      ],
      tips: [
        "Cẩn thận cặp số dễ nhầm: 13–30, 14–40… (-teen trọng âm cuối, -ty trọng âm đầu).",
        "Chú ý âm cuối -s và -ed (light ≠ lights, play ≠ played).",
        "Tránh sai chính tả & vượt giới hạn từ; luyện nghe Names / Places / Numbers / Time / Date / Currency.",
      ],
      quiz: [
        { q: "Part 1 thường là gì?", opts: ["Bài giảng học thuật", "Hội thoại 2 người về tình huống đời thường", "Độc thoại về bản đồ"], a: 1 },
        { q: "Cặp số nào dễ gây nhầm khi nghe?", opts: ["13 và 30 (-teen vs -ty)", "1 và 2", "100 và 200"], a: 0 },
        { q: "Để phân biệt light và lights, cần chú ý gì?", opts: ["Trọng âm câu", "Âm cuối -s", "Tốc độ nói"], a: 1 },
      ],
    },
    3: {
      type: "Multiple Choice Questions – Part 1",
      order: "sequential",
      orderText: "Đáp án đi theo trình tự câu hỏi.",
      keySkill: "Đọc & nắm thông tin TRƯỚC khi nghe (áp dụng DTT)",
      features: [
        "Chọn đáp án A/B/C sau khi nghe hội thoại; cần đọc và nắm nhiều thông tin trước khi nghe.",
        "Có Distractors — thông tin phụ nghe giống đáp án đúng để gây rối (mentioned but rejected, half-true, opposite meaning, future change).",
      ],
      tips: [
        "GOLDEN RULE: NEVER CHOOSE BEFORE THE SENTENCE FINISHES — thông tin cuối cùng mới là đáp án.",
        "Chú ý các từ nối tương phản: but, however, though, actually — thường báo hiệu thông tin bị sửa.",
        "Lỡ một câu thì chuyển ngay sang câu tiếp theo, tránh bị tắc.",
      ],
      quiz: [
        { q: "GOLDEN RULE của dạng MCQ Listening là gì?", opts: ["Chọn ngay khi nghe được từ khóa", "Không chọn trước khi câu nói kết thúc", "Luôn chọn đáp án B"], a: 1 },
        { q: "Distractor là gì?", opts: ["Thông tin phụ gây rối, nghe giống đáp án đúng", "Đáp án chắc chắn đúng", "Một dạng câu hỏi"], a: 0 },
        { q: "Từ “but / however” thường báo hiệu điều gì?", opts: ["Thông tin sắp bị đảo / sửa lại", "Hết bài nghe", "Đáp án đúng đã qua"], a: 0 },
      ],
    },
    4: {
      type: "Multiple Choice Questions – Part 2",
      order: "sequential",
      orderText: "Theo trình tự câu hỏi, nhưng thông tin trong audio có thể không theo thứ tự đáp án A–F.",
      keySkill: "Nghe hiểu chi tiết & xác định paraphrase, tránh thông tin nhiễu",
      features: [
        "Thường xuất hiện ở Part 2 & Part 3; có dạng “Choose TWO letters”.",
        "Hiện tượng nối âm (linking) khiến khó nghe — cần nghe theo cụm, không nghe từng chữ.",
        "Kiểm tra khả năng bắt kịp đoạn hội thoại và tránh thông tin gây nhiễu / đánh lừa.",
      ],
      tips: [
        "Người bản xứ nuốt âm – nói nhanh – nối liên tục: hãy nghe Ý, không nghe từng chữ.",
        "Thông tin có thể không theo thứ tự đáp án → phải NẮM RÕ các đáp án trước khi nghe.",
        "Đừng chọn ngay khi nghe được từ khóa — đợi người nói hoàn thành câu.",
      ],
      quiz: [
        { q: "Với câu “Choose TWO letters”, bạn cần làm gì?", opts: ["Chọn đúng 2 đáp án", "Chọn 1 đáp án", "Chọn tất cả đáp án đúng có thể"], a: 0 },
        { q: "Vì sao nên nắm rõ các đáp án trước khi nghe?", opts: ["Vì thông tin có thể không theo thứ tự đáp án", "Vì sẽ không được nghe lại", "Vì đáp án luôn ở cuối"], a: 0 },
        { q: "Nên nghe như thế nào khi người bản xứ nói nhanh & nối âm?", opts: ["Cố nghe từng chữ", "Nghe theo Ý / theo cụm", "Bỏ qua cả đoạn"], a: 1 },
      ],
    },
    5: {
      type: "Matching",
      order: "repeatable",
      orderText: "Có thể dùng 1 đáp án NHIỀU lần — đọc kỹ đề (“You may choose any letter more than once”).",
      keySkill: "Nghe theo cụm (chunking) & loại trừ đáp án",
      features: [
        "Xuất hiện ở Part 2 hoặc Part 3, nối thông tin nghe được với các lựa chọn.",
        "One-to-one: mỗi đáp án dùng 1 lần (dễ loại trừ). One-to-many: 1 đáp án dùng nhiều lần (khó hơn).",
        "Người nói nói theo cụm (chunk), không theo từng từ.",
      ],
      tips: [
        "Tập trung vào các đáp án vì chúng thường được paraphrase; tên riêng có thể đọc lướt vì hay nhắc y nguyên.",
        "Chú ý các từ tương phản: even though, but, however — đây là bẫy phổ biến.",
        "Gạch / loại bỏ các đáp án đã chọn (với One-to-one) để tránh chọn lại.",
      ],
      quiz: [
        { q: "Câu “You may choose any letter more than once” nghĩa là gì?", opts: ["Mỗi đáp án chỉ được dùng 1 lần", "Một đáp án có thể dùng nhiều lần", "Không được dùng lại đáp án"], a: 1 },
        { q: "Dạng nào khó hơn?", opts: ["One-to-one", "One-to-many", "Cả hai như nhau"], a: 1 },
        { q: "Nên ưu tiên tập trung nghe gì?", opts: ["Tên riêng (đọc y nguyên)", "Nội dung các đáp án (thường bị paraphrase)", "Các từ nối"], a: 1 },
      ],
    },
    6: {
      type: "Maps",
      order: "sequential",
      orderText: "Theo dòng di chuyển trong audio (đi từ điểm xuất phát theo các chỉ dẫn).",
      keySkill: "Từ vựng chỉ vị trí & chỉ đường + 8 hướng la bàn",
      features: [
        "Nghe một đoạn hội thoại và xác định vị trí các địa danh trên bản đồ.",
        "Cần Anchor Information: điểm xuất phát (starting point), hướng la bàn, các landmark.",
        "Ngôn ngữ chỉ đường: go past, turn left, opposite, next to, before/after, at the end of…",
      ],
      tips: [
        "Xác định điểm xuất phát + nắm tên & chức năng các địa danh TRƯỚC khi nghe.",
        "Tên địa danh có thể bị paraphrase theo chức năng (ví dụ “dining room” → “where we have meals”).",
        "Học thuộc 8 hướng la bàn & từ vựng location/direction; có thể vẽ la bàn ra nháp để định hướng.",
      ],
      quiz: [
        { q: "“Anchor Information” trên bản đồ gồm những gì?", opts: ["Điểm xuất phát, hướng la bàn, landmark", "Chỉ tên địa danh", "Số lượng phòng"], a: 0 },
        { q: "Tên địa danh trong audio có thể được?", opts: ["Đọc y nguyên 100%", "Paraphrase theo chức năng", "Bỏ qua hoàn toàn"], a: 1 },
        { q: "Nên làm gì trước khi nghe dạng Maps?", opts: ["Xác định điểm xuất phát & nắm tên/chức năng các địa danh", "Đoán hết đáp án", "Chỉ nhìn la bàn"], a: 0 },
      ],
    },
    7: {
      type: "Note Completion – Part 4",
      order: "sequential",
      orderText: "Đáp án đi theo trình tự lần lượt của bài giảng.",
      keySkill: "Prediction Framework & note-taking cho monologue dài",
      features: [
        "Part 4 = bài giảng học thuật (academic lecture) — thường được coi là phần khó nhất.",
        "Là độc thoại dài; cần dự đoán loại từ cần điền từ dạng chỗ trống.",
        "Cấu trúc quen thuộc: intro → main points → conclusion.",
      ],
      tips: [
        "Dự đoán loại từ (danh từ, số, động từ…) cho mỗi chỗ trống trước khi nghe.",
        "Bám theo cấu trúc bài giảng để không bị lạc.",
        "Tránh sai chính tả & vượt giới hạn từ.",
      ],
      quiz: [
        { q: "Part 4 trong IELTS Listening là gì?", opts: ["Hội thoại 2 người", "Bài giảng học thuật (độc thoại dài)", "Bản đồ"], a: 1 },
        { q: "Nên làm gì trước khi nghe để điền chỗ trống?", opts: ["Dự đoán loại từ cần điền", "Chép cả bài giảng", "Bỏ qua câu hỏi"], a: 0 },
        { q: "Cấu trúc thường gặp của bài giảng là?", opts: ["Intro → main points → conclusion", "Ngẫu nhiên", "Chỉ có kết luận"], a: 0 },
      ],
    },
    8: {
      type: "Comprehensive Review",
      order: "mixed",
      orderText: "Tùy dạng: Form/Note Completion & MCQ theo trình tự câu hỏi; Matching & Maps đi theo dòng chảy của audio.",
      keySkill: "Áp dụng DTT toàn bài & quản lý thời gian qua 4 Parts",
      features: [
        "Ôn tập tổng hợp các dạng Parts 1–4.",
        "40 phút cho 40 câu — gần như không có thời gian thừa.",
        "Chuyển part nhanh, đọc câu hỏi của part mới ngay lập tức.",
      ],
      tips: [
        "Nhận diện dạng bài → áp dụng đúng phương pháp của dạng đó.",
        "Phân tích lỗi từng dạng; chữa đề để biết vì sao sai / đúng.",
        "Ghi chép vocabulary, lập Keyword Table và ôn tập định kỳ.",
      ],
      quiz: [
        { q: "Bài thi Listening đầy đủ có thời lượng & số câu thế nào?", opts: ["60 phút / 40 câu", "40 phút / 40 câu", "30 phút / 30 câu"], a: 1 },
        { q: "Khi chuyển sang part mới nên làm gì?", opts: ["Nghỉ một chút", "Đọc câu hỏi của part mới ngay lập tức", "Kiểm tra lại part cũ"], a: 1 },
        { q: "Bước quan trọng để chọn đúng chiến thuật là?", opts: ["Nhận diện dạng bài", "Nghe thật to", "Đoán mò"], a: 0 },
      ],
    },
  },
};

const TABS = [
  { id: "materials", label: "Materials", sub: "Recording · Tài liệu · Quiz", icon: (p) => <IW.film {...p} /> },
  { id: "classwork", label: "Bài tập trên lớp", sub: "Làm tại lớp", icon: (p) => <IW.doc {...p} /> },
  { id: "homework", label: "Bài tập về nhà", sub: "Tự luyện ở nhà", icon: (p) => <IW.book {...p} /> },
];

function WeekPage({ courseId, weekNum, tab }) {
  const s = useStoreW();
  const D = window.TID_DATA;
  const course = D.courses[courseId];
  const week = course.weeks.find((w) => w.number === weekNum);
  const isReading = courseId === "reading";
  const accent = isReading ? "var(--reading)" : "var(--listening)";
  const accentDeep = isReading ? "var(--reading-deep)" : "var(--listening-deep)";
  const tint = isReading ? "var(--reading-tint)" : "var(--listening-tint)";
  const active = tab || "materials";

  if (!week) { goW(`/c/${courseId}`); return null; }
  if (!weekUnlockedW(s.unlocked[courseId], weekNum)) { goW(`/c/${courseId}`); return null; }
  if (active === "homework") { goW(`/c/${courseId}/w/${weekNum}/classwork`); return null; }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <TopNavW />
      {/* week banner */}
      <div style={{ background: `linear-gradient(${accent}, ${accentDeep})`, color: "#fff", borderBottom: "3px solid var(--ink)" }}>
        <div className="wrap" style={{ padding: "14px 28px 0" }}>
          <CrumbsLightW items={[{ label: "Trang chủ", to: "/" }, { label: course.name, to: `/c/${courseId}` }, { label: `Week ${week.number}` }]} />
          <div className="row" style={{ gap: 13, margin: "10px 0 14px" }}>
            <div style={{ width: 48, height: 48, borderRadius: 13, background: "rgba(255,255,255,.92)", color: accentDeep, display: "grid", placeItems: "center", border: "2.5px solid var(--ink)", boxShadow: "3px 4px 0 var(--ink)", lineHeight: 1, flex: "none" }}>
              <div style={{ textAlign: "center" }}><div style={{ fontSize: 8, fontWeight: 800 }}>WEEK</div><div className="mono-num" style={{ fontSize: 20, fontWeight: 700 }}>{String(week.number).padStart(2, "0")}</div></div>
            </div>
            <div>
              <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 27, margin: 0 }}>{week.title}</h1>
              <div className="row" style={{ gap: 7, fontWeight: 700, fontSize: 13, opacity: .9, marginTop: 3 }}><IW.flag size={13} /> {week.topic}</div>
            </div>
          </div>
          {/* tabs */}
          <div className="row" style={{ gap: 6 }}>
            {TABS.filter((t) => t.id !== "homework").map((t) => {
              const on = active === t.id;
              return (
                <button key={t.id} onClick={() => goW(`/c/${courseId}/w/${week.number}/${t.id}`)}
                  className="row" style={{
                    gap: 8, padding: "9px 18px", border: "2.5px solid var(--ink)",
                    borderBottom: on ? "2.5px solid #fff" : "2.5px solid var(--ink)",
                    background: on ? "#fff" : "rgba(0,0,0,.16)", color: on ? "var(--ink)" : "#fff",
                    borderTopLeftRadius: 14, borderTopRightRadius: 14, borderBottomLeftRadius: 0, borderBottomRightRadius: 0,
                    fontWeight: 800, fontSize: 14.5, marginBottom: -3, position: "relative", transition: "background .15s", whiteSpace: "nowrap",
                  }}>
                  {t.icon({ size: 17 })}
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="wrap" style={{ padding: "30px 28px 70px" }}>
        {active === "materials" && <MaterialsTab week={week} accent={accent} accentDeep={accentDeep} tint={tint} courseId={courseId} />}
        {active === "classwork" && <TestLauncher kind="classwork" week={week} courseId={courseId} accent={accent} accentDeep={accentDeep} tint={tint} />}
        {active === "homework" && <TestLauncher kind="homework" week={week} courseId={courseId} accent={accent} accentDeep={accentDeep} tint={tint} />}
      </div>
    </div>
  );
}

/* ---------------- MATERIALS ---------------- */
function MaterialsTab({ week, accent, accentDeep, tint, courseId }) {
  const m = week.materials;
  const syl = (SYLLABUS[courseId] || {})[week.number] || null;
  // A week "has video" only when at least one recording carries a YouTube id.
  const hasVideo = (m.recordings || []).some((r) => r.youtube);

  const typeGuide = syl && (
    <TypeGuide syl={syl} accent={accent} accentDeep={accentDeep} tint={tint} skill={courseId === "reading" ? "Reading" : "Listening"} fill />
  );

  const docsSection = (
    <Section icon={<IW.doc size={18} />} title="Tài liệu tuần học" accent={accentDeep} tint={tint}>
      {(!m.pdfs || m.pdfs.length === 0) ? (
        <div className="sticker-sm" style={{ background: "#fff", padding: "16px 18px", boxShadow: "none", border: "2px dashed var(--line-strong)", display: "flex", gap: 12, alignItems: "center", color: "var(--muted)" }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: tint, color: accentDeep, border: "2px solid var(--ink)", display: "grid", placeItems: "center", flex: "none" }}><IW.doc size={18} /></div>
          <div style={{ fontWeight: 700, fontSize: 13.5, lineHeight: 1.5 }}>Slide & tài liệu sẽ được thầy cập nhật.</div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {m.pdfs.map((p, i) => {
            const isGdoc = p.type === "gdoc" || (p.url && p.url.includes("docs.google.com/document"));
            const iconBg = isGdoc ? "#e8f0fe" : "#fdecec";
            const iconFg = isGdoc ? "#1a73e8" : "#d6453b";
            const Icon = isGdoc ? IW.doc : IW.pdf;
            const subtitle = isGdoc ? "Google Docs · Mở bằng trình duyệt" : (p.pages ? `${p.pages} trang · ${p.size}` : null);
            return (
              <a key={i} href={p.url || "#"} target={p.url ? "_blank" : undefined} rel="noreferrer" onClick={(e) => { if (!p.url) e.preventDefault(); }} className="row sticker-sm" style={{ gap: 14, background: "#fff", padding: "13px 15px", justifyContent: "space-between", boxShadow: "3px 4px 0 var(--ink)" }}>
                <div className="row" style={{ gap: 13 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: iconBg, color: iconFg, border: "2px solid var(--ink)", display: "grid", placeItems: "center", flex: "none" }}><Icon size={18} /></div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14.5 }}>{p.title}</div>
                    {subtitle && <div style={{ color: "var(--muted)", fontWeight: 700, fontSize: 13 }}>{subtitle}</div>}
                  </div>
                </div>
                <span className="btn btn-ghost" style={{ padding: "8px 14px", fontSize: 13 }}><IW.externalLink size={15} /> Mở</span>
              </a>
            );
          })}
        </div>
      )}
    </Section>
  );

  const quizSection = (
    <Section icon={<IW.quiz size={18} />} title="Quiz kiểm tra nhanh" accent={accentDeep} tint={tint}>
      {syl && syl.quiz && syl.quiz.length
        ? <QuizCard items={syl.quiz} weekNum={week.number} accent={accent} accentDeep={accentDeep} tint={tint} />
        : <Muted>Chưa có quiz.</Muted>}
    </Section>
  );

  // Weeks WITHOUT a YouTube recording: drop the video block entirely and put
  // Dạng bài on the left, Tài liệu (top) + Quiz (below) on the right.
  // Dạng bài renders at its full natural height (drives the row height, no inner
  // scroll → easy to read) and the Quiz card stretches to fill the right column
  // down to the same height.
  if (!hasVideo) {
    return (
      <div>
        <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 24, alignItems: "stretch" }}>
          {/* LEFT: Dạng bài — full height, no scroll */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            {syl && (
              <TypeGuide syl={syl} accent={accent} accentDeep={accentDeep} tint={tint} skill={courseId === "reading" ? "Reading" : "Listening"} natural />
            )}
          </div>

          {/* RIGHT: Tài liệu (trên) + Quiz (ngay dưới, cao bằng cột trái) */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {docsSection}
            <Section icon={<IW.quiz size={18} />} title="Quiz kiểm tra nhanh" accent={accentDeep} tint={tint} grow>
              {syl && syl.quiz && syl.quiz.length
                ? <QuizCard items={syl.quiz} weekNum={week.number} accent={accent} accentDeep={accentDeep} tint={tint} fill />
                : <Muted>Chưa có quiz.</Muted>}
            </Section>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 24, alignItems: "stretch" }}>
        {/* LEFT: Video + Quiz stacked */}
        <div style={{ display: "grid", gap: 24 }}>
          {/* Recordings — full-width, larger */}
          <Section icon={<IW.film size={18} />} title="Video recording buổi học" accent={accentDeep} tint={tint}>
            {m.recordings.map((r, i) => <RecordingRow key={i} r={r} accent={accent} accentDeep={accentDeep} large />)}
          </Section>

          {/* Quiz — kiểm tra hiểu bài buổi học */}
          {quizSection}
        </div>

        {/* RIGHT: Dạng bài (trên) + Tài liệu (dưới) — cao bằng cột trái */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24, height: "100%" }}>
          {/* Đặc điểm dạng bài — đẩy lên trên, co giãn lấp đầy chiều cao còn lại */}
          {typeGuide}
          {docsSection}
        </div>
      </div>
    </div>
  );
}

/* ---- Đặc điểm dạng bài + Lưu ý (main material content) ---- */
const ORDER_BADGE = {
  sequential:     { label: "Đáp án THEO trình tự lần lượt", bg: "#e7f7ee", fg: "#1f7a4d", bd: "#b6e3c9" },
  "non-sequential": { label: "Đáp án KHÔNG theo trình tự", bg: "#fdf0e3", fg: "#b5660d", bd: "#f3d4ad" },
  repeatable:     { label: "Một đáp án có thể dùng nhiều lần", bg: "#eaf1fb", fg: "#2f5fb0", bd: "#c5d8f3" },
  mixed:          { label: "Trình tự đáp án tùy theo dạng bài", bg: "#f0ecf9", fg: "#6a4bb0", bd: "#d6caf0" },
};
function TypeGuide({ syl, accent, accentDeep, tint, skill, fill, natural }) {
  const ob = ORDER_BADGE[syl.order] || ORDER_BADGE.sequential;
  return (
    <div className="sticker anim-pop" style={{ background: "#fff", overflow: "hidden", marginBottom: (fill || natural) ? 0 : 24, ...(fill ? { flex: "1 1 0", minHeight: 0, display: "flex", flexDirection: "column" } : null) }}>
      <div style={{ background: `linear-gradient(120deg, ${accent}, ${accentDeep})`, color: "#fff", padding: "18px 24px", borderBottom: "2.5px solid var(--ink)", flex: "none" }}>
        <div className="row" style={{ gap: 9, fontWeight: 800, fontSize: 12.5, letterSpacing: ".06em", opacity: .92 }}>
          <IW.flag size={15} /> DẠNG BÀI {skill.toUpperCase()} TUẦN NÀY
        </div>
        <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 26, margin: "6px 0 0", lineHeight: 1.15 }}>{syl.type}</h3>
      </div>
      <div className="thin-scroll" style={{ padding: "18px 20px", overflowY: natural ? "visible" : "auto", ...(fill ? { flex: "1 1 0", minHeight: 0 } : natural ? null : { maxHeight: "62vh" }) }}>
        {/* key facts — stacked for the narrow column */}
        <div style={{ display: "grid", gap: 11, marginBottom: 18 }}>
          {skill.toLowerCase() !== "listening" && (
            <div style={{ background: ob.bg, border: `2px solid ${ob.bd}`, borderRadius: 14, padding: "12px 14px" }}>
              <div style={{ fontWeight: 800, fontSize: 11, color: ob.fg, letterSpacing: ".05em", marginBottom: 5, display: "flex", alignItems: "center", gap: 6 }}><IW.flag size={13} /> TRÌNH TỰ ĐÁP ÁN</div>
              <div style={{ fontWeight: 800, fontSize: 14.5, color: ob.fg, marginBottom: 4 }}>{ob.label}</div>
              <div style={{ fontWeight: 600, fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.5 }}>{syl.orderText}</div>
            </div>
          )}
          <div style={{ background: tint, border: "2px solid var(--line-strong)", borderRadius: 14, padding: "12px 14px" }}>
            <div style={{ fontWeight: 800, fontSize: 11, color: accentDeep, letterSpacing: ".05em", marginBottom: 5, display: "flex", alignItems: "center", gap: 6 }}><IW.sparkle size={13} /> KỸ NĂNG QUAN TRỌNG NHẤT</div>
            <div style={{ fontWeight: 800, fontSize: 14.5, color: "var(--ink)", lineHeight: 1.4 }}>{syl.keySkill}</div>
          </div>
        </div>

        <div style={{ fontWeight: 800, fontSize: 12.5, color: "var(--muted)", letterSpacing: ".05em", marginBottom: 11 }}>ĐẶC ĐIỂM DẠNG BÀI</div>
        <div style={{ display: "grid", gap: 11, marginBottom: 20 }}>
          {syl.features.map((f, i) => (
            <div key={i} className="row" style={{ gap: 10, alignItems: "flex-start" }}>
              <span style={{ flex: "none", width: 22, height: 22, borderRadius: 7, background: tint, color: accentDeep, border: "2px solid var(--ink)", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 800 }}>{i + 1}</span>
              <span style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.55, color: "var(--ink)" }}>{f}</span>
            </div>
          ))}
        </div>

        <div style={{ fontWeight: 800, fontSize: 12.5, color: "var(--muted)", letterSpacing: ".05em", marginBottom: 11 }}>LƯU Ý ĐỂ LÀM TỐT</div>
        <div style={{ display: "grid", gap: 11 }}>
          {syl.tips.map((t, i) => (
            <div key={i} className="row" style={{ gap: 10, alignItems: "flex-start" }}>
              <IW.check size={16} style={{ color: accentDeep, flex: "none", marginTop: 2 }} />
              <span style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.55, color: "var(--ink-soft)" }}>{t}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RecordingRow({ r, accent, accentDeep, large }) {
  const [play, setPlay] = useStateW(false);
  const thumb = r.youtube ? `https://img.youtube.com/vi/${r.youtube}/hqdefault.jpg` : null;
  return (
    <div className="sticker-sm" style={{ background: "#fff", overflow: "hidden", boxShadow: "3px 4px 0 var(--ink)" }}>
      <div style={{ position: "relative", aspectRatio: "16 / 9", minHeight: large ? 340 : undefined, background: `linear-gradient(135deg, ${accent}, ${accentDeep})`, borderBottom: "2.5px solid var(--ink)" }}>
        {play && r.youtube ? (
          <iframe title={r.title} src={`https://www.youtube.com/embed/${r.youtube}?autoplay=1&rel=0`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }} />
        ) : (
          <button onClick={() => r.youtube && setPlay(true)} aria-label="Phát recording" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none", padding: 0, background: thumb ? `center/cover no-repeat url(${thumb})` : "transparent", cursor: r.youtube ? "pointer" : "default", display: "grid", placeItems: "center" }}>
            <span style={{ position: "absolute", inset: 0, background: "rgba(24,26,38,.28)" }} />
            <span style={{ position: "relative", width: 62, height: 62, borderRadius: "50%", background: "#fff", border: "2.5px solid var(--ink)", display: "grid", placeItems: "center", color: accentDeep, boxShadow: "3px 4px 0 rgba(0,0,0,.35)" }}>
              <IW.play size={26} />
            </span>
          </button>
        )}
      </div>
      <div className="row" style={{ justifyContent: "space-between", padding: "12px 15px", gap: 10 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 15 }}>{r.title}</div>
          <div className="row" style={{ gap: 6, color: "var(--muted)", fontWeight: 700, fontSize: 13 }}><IW.film size={13} /> {r.date || "Recording buổi học"}</div>
        </div>
        {r.youtube && <a href={`https://youtu.be/${r.youtube}`} target="_blank" rel="noreferrer" className="btn btn-ink" style={{ padding: "9px 16px", fontSize: 13, flex: "none" }}><IW.externalLink size={15} /> YouTube</a>}
      </div>
    </div>
  );
}

function QuizCard({ items, weekNum, accent, accentDeep, tint, fill }) {
  const s = useStoreW();
  const qid = `quiz-${weekNum}`;
  const score = s.quizDone[qid];
  const [running, setRunning] = useStateW(false);
  const fillStyle = fill ? { flex: "1 1 0", width: "100%" } : null;
  if (running) {
    return (
      <div className="sticker-sm" style={{ background: "#fff", padding: "18px", textAlign: "left", boxShadow: "3px 4px 0 var(--ink)", ...fillStyle }}>
        <QuizInline items={items} qid={qid} accent={accent} accentDeep={accentDeep} onClose={() => setRunning(false)} />
      </div>
    );
  }
  return (
    <div className="sticker-sm" style={{ background: tint, padding: "20px", textAlign: "center", boxShadow: "3px 4px 0 var(--ink)", ...(fill ? { ...fillStyle, display: "flex", flexDirection: "column", justifyContent: "center" } : null) }}>
      <div style={{ width: 56, height: 56, margin: "0 auto", borderRadius: 16, background: "#fff", border: "2.5px solid var(--ink)", display: "grid", placeItems: "center", color: accentDeep }}><IW.quiz size={26} /></div>
      <h4 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 19, margin: "14px 0 4px" }}>Hiểu bài hôm nay?</h4>
      <p style={{ color: "var(--ink-soft)", fontWeight: 700, fontSize: 14, margin: "0 0 16px" }}>{items.length} câu · kiểm tra bạn đã nắm các ý chính buổi học chưa</p>
      {score != null && <div className="pill" style={{ background: "#fff", color: "var(--ok)", padding: "6px 14px", border: "2px solid var(--ink)", marginBottom: 12 }}><IW.check size={15} /> Lần trước: {score}/{items.length}</div>}
      <button onClick={() => setRunning(true)} className="btn btn-ink" style={{ width: "100%" }}><IW.sparkle size={17} /> Làm quiz</button>
    </div>
  );
}

function QuizInline({ items, qid, onClose, accent, accentDeep }) {
  const [i, setI] = useStateW(0);
  const [picked, setPicked] = useStateW(null);
  const [score, setScore] = useStateW(0);
  const [done, setDone] = useStateW(false);
  const cur = items[i];

  function choose(idx) {
    if (picked != null) return;
    setPicked(idx);
    if (idx === cur.a) setScore((x) => x + 1);
  }
  function next() {
    if (i + 1 >= items.length) {
      window.TID_STORE.setState((st) => ({ ...st, quizDone: { ...st.quizDone, [qid]: score } }));
      setDone(true);
    } else { setI(i + 1); setPicked(null); }
  }
  function restart() { setI(0); setPicked(null); setScore(0); setDone(false); }

  if (done) {
    return (
      <div style={{ textAlign: "center", padding: "6px 4px" }}>
        <div style={{ width: 52, height: 52, margin: "0 auto", borderRadius: 14, background: "#e7f7ee", color: "var(--ok)", border: "2.5px solid var(--ink)", display: "grid", placeItems: "center" }}><IW.check size={26} /></div>
        <h4 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 21, margin: "12px 0 2px" }}>Hoàn thành!</h4>
        <p style={{ fontWeight: 700, color: "var(--muted)", margin: "0 0 2px", fontSize: 14 }}>Bạn đúng</p>
        <div className="mono-num" style={{ fontSize: 40, fontWeight: 700, color: accentDeep }}>{score}/{items.length}</div>
        <div className="row" style={{ gap: 10, marginTop: 14 }}>
          <button onClick={restart} className="btn btn-ghost" style={{ flex: 1, padding: "11px" }}>Làm lại</button>
          <button onClick={onClose} className="btn btn-ink" style={{ flex: 1, padding: "11px" }}>Đóng</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 14 }}>
        <span className="pill" style={{ background: "var(--bg)", color: "var(--ink)", padding: "5px 13px", border: "2px solid var(--ink)" }}>Câu {i + 1}/{items.length}</span>
        <button onClick={onClose} aria-label="Thoát" style={{ width: 32, height: 32, borderRadius: "50%", border: "2px solid var(--line-strong)", background: "#fff", display: "grid", placeItems: "center" }}><IW.x size={16} /></button>
      </div>
      {/* progress bar */}
      <div style={{ height: 7, borderRadius: 999, background: "var(--bg)", border: "1.5px solid var(--line-strong)", overflow: "hidden", marginBottom: 16 }}>
        <div style={{ width: `${((i + (picked != null ? 1 : 0)) / items.length) * 100}%`, height: "100%", background: accent, transition: "width .3s" }}></div>
      </div>
      <h4 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 19, margin: "0 0 14px", lineHeight: 1.3 }}>{cur.q}</h4>
      <div style={{ display: "grid", gap: 9 }}>
        {cur.opts.map((o, idx) => {
          const isAns = idx === cur.a, isPick = idx === picked;
          let bg = "#fff", bd = "var(--ink)";
          if (picked != null) {
            if (isAns) { bg = "#e7f7ee"; bd = "var(--ok)"; }
            else if (isPick) { bg = "#fdeceb"; bd = "var(--danger)"; }
            else { bd = "var(--line-strong)"; }
          }
          return (
            <button key={idx} onClick={() => choose(idx)} className="row" style={{ gap: 11, padding: "11px 14px", border: `2.5px solid ${bd}`, background: bg, color: "var(--ink)", borderRadius: 11, fontWeight: 700, fontSize: 15, textAlign: "left", boxShadow: picked == null ? "2px 3px 0 var(--ink)" : "none" }}>
              <span style={{ width: 24, height: 24, flex: "none", borderRadius: 7, border: "2px solid currentColor", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 12 }}>{String.fromCharCode(65 + idx)}</span>
              <span style={{ flex: 1 }}>{o}</span>
              {picked != null && isAns && <IW.check size={17} style={{ color: "var(--ok)" }} />}
              {picked != null && isPick && !isAns && <IW.x size={17} style={{ color: "var(--danger)" }} />}
            </button>
          );
        })}
      </div>
      {picked != null && <button onClick={next} className="btn btn-ink" style={{ width: "100%", marginTop: 16 }}>{i + 1 >= items.length ? "Xem kết quả" : "Câu tiếp theo"} <IW.arrowR size={17} /></button>}
    </div>
  );
}

/* ---------------- TEST LAUNCHER (classwork / homework) ---------------- */
const KIND_LABELS = {
  "completion":      "Điền từ / hoàn thành",
  "summary-gap":     "Hoàn thành đoạn tóm tắt",
  "matching-ending": "Nối nửa câu",
  "matching-info":   "Nối thông tin",
  "mc-multi":        "Trắc nghiệm nhiều đáp án",
  "mc-single":       "Trắc nghiệm một đáp án",
  "short-answer":    "Trả lời ngắn",
  "tfng":            "True / False / Not Given",
};
function groupCount(g) {
  const set = new Set();
  (g.questions || []).forEach((q) => set.add(q.n));
  (g.summary || []).forEach((s) => s.gap != null && set.add(s.gap));
  (g.lines || []).forEach((l) => (l.segs || []).forEach((s) => s.gap != null && set.add(s.gap)));
  if (g.n != null) set.add(g.n);
  return set.size;
}

function TestLauncher({ kind, week, courseId, accent, accentDeep, tint }) {
  const s = useStoreW();
  const test = week[kind];
  const isClass = kind === "classwork";
  if (!test) return <EmptyW text={`Chưa có ${isClass ? "bài tập trên lớp" : "bài tập về nhà"} cho tuần này.`} />;

  const sub = s.submissions[test.id];
  const answered = Object.keys(s.answers[test.id] || {}).length;

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <div className="sticker" style={{ background: "#fff", overflow: "hidden" }}>
        <div style={{ background: `linear-gradient(120deg, ${accent}, ${accentDeep})`, color: "#fff", padding: "22px 26px", borderBottom: "2.5px solid var(--ink)" }}>
          <div className="row" style={{ gap: 10, fontWeight: 800, fontSize: 13, letterSpacing: ".06em", opacity: .9 }}>
            {isClass ? <IW.doc size={16} /> : <IW.book size={16} />} {test.skill.toUpperCase()} · TUẦN {week.number}
          </div>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 30, margin: "8px 0 0" }}>{isClass ? "Bài Tập Trên Lớp" : "Bài Tập Về Nhà"} - Week {week.number}</h2>
        </div>
        <div style={{ padding: "24px 26px" }}>
          {/* Nội dung đề bài: passage/part badges + tiêu đề */}
          <div style={{ marginBottom: 22 }}>
            <div className="row" style={{ gap: 7, fontWeight: 800, fontSize: 12.5, color: "var(--muted)", letterSpacing: ".05em", marginBottom: 11 }}>
              <IW.flag size={14} /> NỘI DUNG ĐỀ BÀI
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              {test.parts.map((p, i) => {
                const isReadingSkill = test.skill === "Reading";
                const pill = isReadingSkill ? p.part : `Part ${i + 1}`;
                const subtitle = isReadingSkill ? (p.passage && p.passage.title) : `Part ${i + 1}`;
                return (
                  <div key={i} className="row" style={{ gap: 10, alignItems: "center", background: "var(--bg)", border: "2px solid var(--line-strong)", borderRadius: 14, padding: "12px 15px" }}>
                    <span style={{ flex: "none", fontWeight: 800, fontSize: 11.5, letterSpacing: ".04em", color: accentDeep, background: tint, border: "2px solid var(--ink)", borderRadius: 8, padding: "3px 9px" }}>{pill}</span>
                    {subtitle && <span style={{ fontWeight: 700, fontSize: 15, color: "var(--ink)" }}>{subtitle}</span>}
                  </div>
                );
              })}
            </div>
          </div>
          {sub && (
            <div className="row" style={{ gap: 10, marginTop: 16, color: "var(--ok)", fontWeight: 800, fontSize: 14 }}>
              <IW.check size={18} /> Đã nộp · {Math.floor(sub.elapsed / 60)}m{String(sub.elapsed % 60).padStart(2, "0")}s · {Object.keys(sub.answers).length} câu
            </div>
          )}

          <div style={{ marginTop: 22 }}>
            <div className="row" style={{ gap: 7, fontWeight: 800, fontSize: 12.5, color: "var(--muted)", letterSpacing: ".05em", marginBottom: 11 }}>
              <IW.sparkle size={14} /> CHỌN GIAO DIỆN LÀM BÀI
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <ThemeOption k="pro" cur={s.testTheme} title="Thi Thật" desc="Tối giản như phòng thi thật" accent="var(--test-blue)" />
              <ThemeOption k="playful" cur={s.testTheme} title="Vui tươi" desc="Bo tròn, nhiều màu, sinh động" accent={accentDeep} />
            </div>
          </div>

          <div className="row" style={{ gap: 12, marginTop: 18 }}>
            <button onClick={() => goW(`/c/${courseId}/w/${week.number}/${kind}/do`)} className="btn btn-primary" style={{ fontSize: 17, padding: "15px 26px", flex: 1 }}>
              {answered > 0 || sub ? <>Tiếp tục làm bài <IW.arrowR size={19} /></> : <>Bắt đầu làm bài <IW.arrowR size={19} /></>}
            </button>
            {answered > 0 && <span className="pill" style={{ background: "var(--bg)", color: "var(--muted)", padding: "10px 16px", border: "2px solid var(--line-strong)" }}>{answered} câu đã làm</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

function Meta({ icon, label, value }) {
  return (
    <div>
      <div className="row" style={{ gap: 6, color: "var(--muted)", fontWeight: 700, fontSize: 12.5, whiteSpace: "nowrap" }}>{icon}{label}</div>
      <div style={{ fontWeight: 800, fontSize: 17, marginTop: 2 }}>{value}</div>
    </div>
  );
}

function ThemeOption({ k, cur, title, desc, accent }) {
  const on = cur === k;
  const pro = k === "pro";
  return (
    <button onClick={() => window.TID_STORE.setState({ testTheme: k })} style={{
      textAlign: "left", padding: 14, borderRadius: 14, background: "#fff",
      border: `2.5px solid ${on ? accent : "var(--line-strong)"}`,
      boxShadow: on ? `3px 4px 0 ${accent}` : "none", transition: "all .12s", cursor: "pointer",
    }}>
      {/* mini preview */}
      <div style={{ height: 64, borderRadius: pro ? 7 : 11, background: pro ? "#f4f6f8" : "var(--bg)", border: pro ? "1px solid var(--line)" : "2px solid var(--ink)", padding: 9, marginBottom: 11, overflow: "hidden", boxShadow: pro ? "none" : "2px 2px 0 var(--ink)" }}>
        <div style={{ height: 7, width: "70%", borderRadius: 4, background: "var(--line-strong)", marginBottom: 6 }}></div>
        <div style={{ height: 7, width: "90%", borderRadius: 4, background: "var(--line-strong)", marginBottom: 9 }}></div>
        <div className="row" style={{ gap: 5 }}>
          <span style={{ height: 16, width: 30, borderRadius: pro ? 4 : 999, background: "#fff", border: `${pro ? "1px" : "2px"} solid ${pro ? "var(--line-strong)" : "var(--ink)"}` }}></span>
          <span style={{ height: 16, width: 30, borderRadius: pro ? 4 : 999, background: accent, border: `${pro ? "1px" : "2px"} solid ${pro ? accent : "var(--ink)"}` }}></span>
        </div>
      </div>
      <div className="row" style={{ gap: 8, marginBottom: 3 }}>
        <span style={{ width: 18, height: 18, borderRadius: "50%", border: `2.5px solid ${on ? accent : "var(--line-strong)"}`, display: "grid", placeItems: "center", flex: "none" }}>
          {on && <span style={{ width: 8, height: 8, borderRadius: "50%", background: accent }}></span>}
        </span>
        <span style={{ fontWeight: 800, fontSize: 15, whiteSpace: "nowrap" }}>{title}</span>
      </div>
      <div style={{ color: "var(--muted)", fontWeight: 600, fontSize: 12.5, paddingLeft: 26, lineHeight: 1.35 }}>{desc}</div>
    </button>
  );
}

function Section({ icon, title, accent, tint, children, grow }) {
  return (
    <div style={grow ? { display: "flex", flexDirection: "column", flex: "1 1 0", minHeight: 0 } : null}>
      <div className="row" style={{ gap: 10, marginBottom: 14, flex: "none" }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: tint, color: accent, border: "2px solid var(--ink)", display: "grid", placeItems: "center" }}>{icon}</div>
        <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 20, margin: 0 }}>{title}</h3>
      </div>
      {grow ? <div style={{ flex: "1 1 0", minHeight: 0, display: "flex" }}>{children}</div> : children}
    </div>
  );
}
function Muted({ children }) { return <div style={{ color: "var(--muted)", fontWeight: 700, fontSize: 14, padding: "8px 0" }}>{children}</div>; }

window.TID_WEEK = { WeekPage };
