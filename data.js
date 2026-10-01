// ================================================================
// data.js – Ngân hàng đề thi & câu hỏi mở rộng Tiếng Anh THCS Global Success
// Tác giả & Bản quyền: Thầy Đinh Văn Thành – Trường THCS Đồng Yên
// ================================================================

const EXTRA_ENGLISH_QUESTIONS = [
  // ── Lớp 6: Unit 2 & Unit 3 ──
  {
    id: 'en6-ext-001', grade: 6, subject: 'english', chapterId: 'en6u2', skill: 'language',
    topic: 'Vocabulary: Rooms & furniture', level: 'NB',
    content: 'We often cook delicious meals in the ________.',
    options: ['A. bathroom', 'B. kitchen', 'C. bedroom', 'D. hall'],
    answer: 'B',
    solution: 'Giải thích: Nấu ăn (cook meals) được thực hiện trong nhà bếp: kitchen.'
  },
  {
    id: 'en6-ext-002', grade: 6, subject: 'english', chapterId: 'en6u3', skill: 'language',
    topic: 'Vocabulary: Personality & body parts', level: 'TH',
    content: 'My best friend Lan is very ________. She always shares her snacks with everyone.',
    options: ['A. generous', 'B. shy', 'C. lazy', 'D. selfish'],
    answer: 'A',
    solution: 'Giải thích: Người luôn sẵn sàng chia sẻ đồ ăn cho mọi người là người hào phóng/rộng lượng: generous.'
  },
  {
    id: 'en6-ext-003', grade: 6, subject: 'english', chapterId: 'en6u6', skill: 'language',
    topic: 'Grammar: Modal verbs should / shouldn\'t', level: 'TH',
    content: 'Children ________ eat too many sweets because it is bad for their teeth.',
    options: ['A. should', 'B. shouldn\'t', 'C. must', 'D. can'],
    answer: 'B',
    solution: 'Giải thích: Lời khuyên không nên làm điều gì có hại cho sức khỏe: shouldn\'t.'
  },
  // ── Lớp 7: Unit 5 & Unit 7 ──
  {
    id: 'en7-ext-001', grade: 7, subject: 'english', chapterId: 'en7u5', skill: 'language',
    topic: 'Grammar: How much / How many', level: 'TH',
    content: '________ apples do we need to make an apple pie?',
    options: ['A. How much', 'B. How many', 'C. How long', 'D. How far'],
    answer: 'B',
    solution: 'Giải thích: "apples" là danh từ đếm được số nhiều, ta dùng "How many".'
  },
  {
    id: 'en7-ext-002', grade: 7, subject: 'english', chapterId: 'en7u7', skill: 'language',
    topic: 'Vocabulary: Means of transport & road safety', level: 'NB',
    content: 'You must fasten your ________ when you travel in a car.',
    options: ['A. helmet', 'B. seatbelt', 'C. jacket', 'D. gloves'],
    answer: 'B',
    solution: 'Giải thích: Đi xe ô tô phải thắt dây an toàn: seatbelt.'
  },
  {
    id: 'en7-ext-003', grade: 7, subject: 'english', chapterId: 'en7u9', skill: 'language',
    topic: 'Vocabulary: Festival celebrations & traditions', level: 'TH',
    content: 'People decorate their houses with peach blossoms and kumquat trees during ________.',
    options: ['A. Mid-Autumn Festival', 'B. Tet Holiday', 'C. Christmas', 'D. Halloween'],
    answer: 'B',
    solution: 'Giải thích: Hoa đào và cây quất là đặc trưng ngày Tết truyền thống của Việt Nam: Tet Holiday.'
  },
  // ── Lớp 8: Unit 1 & Unit 3 ──
  {
    id: 'en8-ext-001', grade: 8, subject: 'english', chapterId: 'en8u1', skill: 'language',
    topic: 'Grammar: Verbs of liking/disliking + Gerunds/To-infinitive', level: 'NB',
    content: 'Minh adores ________ DIY models with his younger brother in his free time.',
    options: ['A. making', 'B. make', 'C. to make', 'D. made'],
    answer: 'A',
    solution: 'Giải thích: Sau động từ "adore" (yêu thích) dùng V-ing: making.'
  },
  {
    id: 'en8-ext-002', grade: 8, subject: 'english', chapterId: 'en8u3', skill: 'language',
    topic: 'Vocabulary: Teen clubs, forums & stress', level: 'TH',
    content: 'Many teenagers suffer from academic ________ from high school exams.',
    options: ['A. comfort', 'B. pressure', 'C. peace', 'D. pleasure'],
    answer: 'B',
    solution: 'Giải thích: Áp lực học tập / thi cử là "academic pressure".'
  },
  // ── Lớp 9: Unit 1 & Unit 2 ──
  {
    id: 'en9-ext-001', grade: 9, subject: 'english', chapterId: 'en9u1', skill: 'language',
    topic: 'Grammar: Question words before to-infinitives', level: 'VD',
    content: 'She doesn\'t know ________ to ask for help when dealing with bullies at school.',
    options: ['A. who', 'B. where', 'C. when', 'D. what'],
    answer: 'A',
    solution: 'Giải thích: "who to ask for help": hỏi ai để xin sự trợ giúp.'
  },
  {
    id: 'en9-ext-002', grade: 9, subject: 'english', chapterId: 'en9u2', skill: 'language',
    topic: 'Grammar: Comparison of adjectives & adverbs', level: 'TH',
    content: 'The cost of living in Ho Chi Minh City is ________ higher than in rural areas.',
    options: ['A. much', 'B. very', 'C. more', 'D. many'],
    answer: 'A',
    solution: 'Giải thích: Bổ nghĩa cho tính từ so sánh hơn "higher" dùng "much" hoặc "far".'
  }
];

// Nạp thêm vào QUESTION_BANK trong runtime nếu chưa có
if (typeof QUESTION_BANK !== 'undefined' && Array.isArray(QUESTION_BANK)) {
  EXTRA_ENGLISH_QUESTIONS.forEach(eq => {
    if (!QUESTION_BANK.some(q => q.id === eq.id)) {
      QUESTION_BANK.push(eq);
    }
  });
}
