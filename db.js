// ================================================================
// db.js – Database: EnglishExam Pro (Tiếng Anh THCS Global Success)
// Bản quyền & Phát triển: Thầy Đinh Văn Thành – Trường THCS Đồng Yên
// ================================================================

// ── Config ──────────────────────────────────────────────────────
const APP_CONFIG = {
  name: 'EnglishExam Pro',
  title: 'Hệ thống Soạn đề & Đánh giá Tiếng Anh THCS Global Success',
  author: 'Thầy Đinh Văn Thành',
  school: 'Trường THCS Đồng Yên',
  department: 'Tổ Xã Hội – Nhóm Ngoại Ngữ',
  curriculum: 'Global Success (Bộ Giáo Dục và Đào Tạo)',
  version: '3.0.0',
};

// ── Grade & Skills Definition ───────────────────────────────────
const GRADES = [6, 7, 8, 9];

const SUBJECTS = [
  { id: 'english', name: 'Tiếng Anh Global Success', icon: '🇬🇧', color: '#2563eb' }
];

const ENGLISH_SKILLS = [
  { id: 'listening', name: 'Nghe hiểu (Listening)', icon: '🎧', color: '#0284c7' },
  { id: 'language', name: 'Ngôn ngữ (Phát âm, Từ vựng, Ngữ pháp)', icon: '🔤', color: '#4f46e5' },
  { id: 'reading', name: 'Đọc hiểu (Reading)', icon: '📖', color: '#059669' },
  { id: 'writing', name: 'Kỹ năng Viết (Writing)', icon: '✍️', color: '#d97706' },
  { id: 'speaking', name: 'Giao tiếp (Everyday English)', icon: '🗣️', color: '#e11d48' },
];

// ── Units by Grade (Global Success Curriculum) ───────────────────
const CHAPTERS = {
  english: {
    6: [
      { id: 'en6u1', name: 'Unit 1: My New School', topics: ['Vocabulary: School items & subjects', 'Grammar: Present simple', 'Grammar: Adverbs of frequency', 'Pronunciation: Sounds /ɑː/ and /ʌ/'] },
      { id: 'en6u2', name: 'Unit 2: My Home', topics: ['Vocabulary: Rooms & furniture', 'Grammar: Prepositions of place', 'Grammar: There is / There are', 'Pronunciation: Final sounds /s/ and /z/'] },
      { id: 'en6u3', name: 'Unit 3: My Friends', topics: ['Vocabulary: Personality & body parts', 'Grammar: Present continuous for future', 'Pronunciation: Sounds /b/ and /p/'] },
      { id: 'en6u4', name: 'Unit 4: My Neighbourhood', topics: ['Vocabulary: Places in town & directions', 'Grammar: Comparative adjectives', 'Pronunciation: Sounds /iː/ and /ɪ/'] },
      { id: 'en6u5', name: 'Unit 5: Natural Wonders of Viet Nam', topics: ['Vocabulary: Nature & travel', 'Grammar: Countable & uncountable nouns', 'Grammar: Modal verbs must / mustn\'t', 'Pronunciation: Sounds /t/ and /d/'] },
      { id: 'en6u6', name: 'Unit 6: Our Tet Holiday', topics: ['Vocabulary: Tet things & activities', 'Grammar: Modal verbs should / shouldn\'t', 'Grammar: Some and any', 'Pronunciation: Sounds /s/ and /ʃ/'] },
      { id: 'en6u7', name: 'Unit 7: Television', topics: ['Vocabulary: TV programmes', 'Grammar: Conjunctions and/but/so/because', 'Grammar: Wh-questions', 'Pronunciation: Sounds /θ/ and /ð/'] },
      { id: 'en6u8', name: 'Unit 8: Sports and Games', topics: ['Vocabulary: Sports & equipment', 'Grammar: Past simple tense', 'Grammar: Imperatives', 'Pronunciation: Sounds /e/ and /æ/'] },
      { id: 'en6u9', name: 'Unit 9: Cities of the World', topics: ['Vocabulary: Landmarks & weather', 'Grammar: Possessive adjectives & pronouns', 'Grammar: Superlative adjectives', 'Pronunciation: Sounds /əʊ/ and /aʊ/'] },
      { id: 'en6u10', name: 'Unit 10: Houses in the Future', topics: ['Vocabulary: Future appliances', 'Grammar: Future simple with will / won\'t', 'Grammar: Might for possibility', 'Pronunciation: Sounds /dr/ and /tr/'] },
      { id: 'en6u11', name: 'Unit 11: Our Greener World', topics: ['Vocabulary: The 3Rs (Reduce, Reuse, Recycle)', 'Grammar: First conditional (If + Present simple, will + V)', 'Pronunciation: Sounds /ɑː/ and /æ/'] },
      { id: 'en6u12', name: 'Unit 12: Robots', topics: ['Vocabulary: Daily abilities & robots', 'Grammar: Modal verbs can / could / will be able to', 'Grammar: Superlative with short & long adjectives', 'Pronunciation: Sounds /ɔɪ/ and /aɪ/'] },
    ],
    7: [
      { id: 'en7u1', name: 'Unit 1: Hobbies', topics: ['Vocabulary: Action verbs & hobby types', 'Grammar: Present simple', 'Grammar: Verbs of liking + V-ing', 'Pronunciation: Sounds /ə/ and /ɜː/'] },
      { id: 'en7u2', name: 'Unit 2: Healthy Living', topics: ['Vocabulary: Health problems & healthy habits', 'Grammar: Simple sentences & compound sentences with and/or/but/so', 'Pronunciation: Sounds /f/ and /v/'] },
      { id: 'en7u3', name: 'Unit 3: Community Service', topics: ['Vocabulary: Volunteer activities', 'Grammar: Past simple tense', 'Grammar: Present perfect vs Past simple', 'Pronunciation: Endings -ed (/t/, /d/, /ɪd/)'] },
      { id: 'en7u4', name: 'Unit 4: Music and Arts', topics: ['Vocabulary: Art forms & musical instruments', 'Grammar: Comparisons with as...as, the same as, different from', 'Pronunciation: Sounds /ʃ/ and /ʒ/'] },
      { id: 'en7u5', name: 'Unit 5: Food and Drink', topics: ['Vocabulary: Food & ingredients', 'Grammar: Countable & uncountable nouns, some/any/much/many', 'Grammar: How much / How many', 'Pronunciation: Sounds /ɒ/ and /ɔː/'] },
      { id: 'en7u6', name: 'Unit 6: A Visit to a School', topics: ['Vocabulary: School facilities', 'Grammar: Prepositions of time and place', 'Pronunciation: Sounds /tʃ/ and /dʒ/'] },
      { id: 'en7u7', name: 'Unit 7: Traffic', topics: ['Vocabulary: Means of transport & road safety', 'Grammar: It indicating distance', 'Grammar: Should / shouldn\'t for advice', 'Pronunciation: Sounds /e/ and /eɪ/'] },
      { id: 'en7u8', name: 'Unit 8: Films', topics: ['Vocabulary: Film genres & film reviews', 'Grammar: Connectors although / though, however', 'Grammar: -ed and -ing adjectives', 'Pronunciation: Sounds /ɪə/ and /eə/'] },
      { id: 'en7u9', name: 'Unit 9: Festivals around the World', topics: ['Vocabulary: Festival celebrations & traditions', 'Grammar: Yes/No questions & Wh-questions', 'Grammar: Adverbial clauses', 'Pronunciation: Stress in 2-syllable words'] },
      { id: 'en7u10', name: 'Unit 10: Energy Sources', topics: ['Vocabulary: Renewable & non-renewable energy', 'Grammar: Present continuous for future', 'Pronunciation: Stress in 3-syllable words'] },
      { id: 'en7u11', name: 'Unit 11: Travelling in the Future', topics: ['Vocabulary: Future transportation', 'Grammar: Future simple with will', 'Grammar: Possessive pronouns', 'Pronunciation: Sentence stress'] },
      { id: 'en7u12', name: 'Unit 12: English-speaking Countries', topics: ['Vocabulary: People & places in Anglosphere', 'Grammar: Articles a/an/the and zero article', 'Pronunciation: Stress in words ending in -ese and -ee'] },
    ],
    8: [
      { id: 'en8u1', name: 'Unit 1: Leisure Time', topics: ['Vocabulary: Leisure activities', 'Grammar: Verbs of liking/disliking + Gerunds/To-infinitive', 'Pronunciation: Sounds /ʊ/ and /uː/'] },
      { id: 'en8u2', name: 'Unit 2: Life in the Countryside', topics: ['Vocabulary: Country life & activities', 'Grammar: Comparative forms of adverbs', 'Pronunciation: Sounds /ə/ and /ɪ/'] },
      { id: 'en8u3', name: 'Unit 3: Teenagers', topics: ['Vocabulary: Teen clubs, forums & stress', 'Grammar: Simple and compound sentences', 'Grammar: Wh-question words before to-infinitives', 'Pronunciation: Sounds /ʊə/ and /ɔɪ/'] },
      { id: 'en8u4', name: 'Unit 4: Ethnic Groups of Viet Nam', topics: ['Vocabulary: Ethnic customs & traditions', 'Grammar: Yes/No and Wh-questions', 'Grammar: Articles a/an/the', 'Pronunciation: Sounds /k/ and /g/'] },
      { id: 'en8u5', name: 'Unit 5: Our Customs and Traditions', topics: ['Vocabulary: Traditional customs & manners', 'Grammar: Zero conditional & First conditional', 'Grammar: Modal verbs should / have to', 'Pronunciation: Sounds /n/ and /ŋ/'] },
      { id: 'en8u6', name: 'Unit 6: Lifestyles', topics: ['Vocabulary: Traditional and modern lifestyles', 'Grammar: First conditional with modal verbs', 'Pronunciation: Sounds /br/ and /pr/'] },
      { id: 'en8u7', name: 'Unit 7: Environmental Protection', topics: ['Vocabulary: Wildlife & environment', 'Grammar: Complex sentences with adverb clauses of reason & result', 'Pronunciation: Sounds /bl/ and /cl/'] },
      { id: 'en8u8', name: 'Unit 8: Shopping', topics: ['Vocabulary: Shopping centres & discount terms', 'Grammar: Adverbs of frequency', 'Grammar: Present simple for future events', 'Pronunciation: Sounds /sp/ and /st/'] },
      { id: 'en8u9', name: 'Unit 9: Natural Disasters', topics: ['Vocabulary: Types of disasters & warning systems', 'Grammar: Past continuous tense', 'Grammar: Past continuous vs Past simple with when/while', 'Pronunciation: Stress in words ending in -al and -ous'] },
      { id: 'en8u10', name: 'Unit 10: Communication in the Future', topics: ['Vocabulary: Holography, telepathy, social media', 'Grammar: Prepositions of time and place', 'Grammar: Possessive pronouns', 'Pronunciation: Stress in words ending in -ity and -itive'] },
      { id: 'en8u11', name: 'Unit 11: Science and Technology', topics: ['Vocabulary: Technological advancements & inventors', 'Grammar: Reported speech: Statements', 'Pronunciation: Stress in words ending in -logy and -graphy'] },
      { id: 'en8u12', name: 'Unit 12: Life on Other Planets', topics: ['Vocabulary: Solar system, aliens & space travel', 'Grammar: Reported speech: Questions', 'Grammar: Modal verbs may / might', 'Pronunciation: Stress in words ending in -ful and -less'] },
    ],
    9: [
      { id: 'en9u1', name: 'Unit 1: Local Community', topics: ['Vocabulary: Community helpers & places of interest', 'Grammar: Question words before to-infinitives', 'Grammar: Phrasal verbs', 'Pronunciation: Stress in 2-syllable words with prefixes'] },
      { id: 'en9u2', name: 'Unit 2: City Life', topics: ['Vocabulary: Urban features & problems', 'Grammar: Comparison of adjectives & adverbs', 'Grammar: Phrasal verbs in daily context', 'Pronunciation: Diphthongs in spoken English'] },
      { id: 'en9u3', name: 'Unit 3: Healthy Living for Teens', topics: ['Vocabulary: Physical & mental well-being', 'Grammar: Modal verbs in first conditional', 'Grammar: Modal verbs with wish clause', 'Pronunciation: Stress in 3-syllable words'] },
      { id: 'en9u4', name: 'Unit 4: Remembering the Past', topics: ['Vocabulary: Past life, games & memories', 'Grammar: Used to + Infinitive', 'Grammar: Wish for present & future', 'Grammar: Past continuous tense review'] },
      { id: 'en9u5', name: 'Unit 5: Wonders of Viet Nam', topics: ['Vocabulary: Natural & man-made wonders', 'Grammar: Impersonal passive (It is said that...)', 'Grammar: Suggest + V-ing / clause with should', 'Pronunciation: Intonation in invitations and suggestions'] },
      { id: 'en9u6', name: 'Unit 6: Viet Nam: Then and Now', topics: ['Vocabulary: Changes in infrastructure & society', 'Grammar: Past perfect tense', 'Grammar: Adjective + to-infinitive / that clause', 'Pronunciation: Intonation in tag questions'] },
      { id: 'en9u7', name: 'Unit 7: Natural Wonders of the World', topics: ['Vocabulary: World geography & ecosystems', 'Grammar: Defining relative clauses with who/which/that', 'Grammar: Non-defining relative clauses', 'Pronunciation: Sentence rhythm'] },
      { id: 'en9u8', name: 'Unit 8: Tourism', topics: ['Vocabulary: Eco-tourism & travel services', 'Grammar: Articles a/an/the and zero article', 'Grammar: Compound nouns', 'Pronunciation: Stress in compound nouns'] },
      { id: 'en9u9', name: 'Unit 9: English in the World', topics: ['Vocabulary: Varieties of English & language skills', 'Grammar: Conditional sentence type 2', 'Grammar: Relative clauses review', 'Pronunciation: Stress in words ending in -ic and -ical'] },
      { id: 'en9u10', name: 'Unit 10: Space Travel', topics: ['Vocabulary: Astronauts, orbit & ISS', 'Grammar: Past perfect vs Past simple', 'Grammar: Defining relative clauses', 'Pronunciation: Continuing and falling tones'] },
      { id: 'en9u11', name: 'Unit 11: Electronic Devices', topics: ['Vocabulary: Smart gadgets & digital literacy', 'Grammar: Passive voice in present & past simple', 'Grammar: Relative pronouns whose / whom / where', 'Pronunciation: Sentence stress with contrastive emphasis'] },
      { id: 'en9u12', name: 'Unit 12: My Future Career', topics: ['Vocabulary: Career paths & job requirements', 'Grammar: Phrasal verbs advanced', 'Grammar: Clauses of concession (despite, in spite of, although)', 'Pronunciation: High and low intonation'] },
    ],
  },
};

// ── Question Levels ──────────────────────────────────────────────
const LEVELS = [
  { id: 'NB', name: 'Nhận biết (Recognition)', color: 'tag-nb' },
  { id: 'TH', name: 'Thông hiểu (Comprehension)', color: 'tag-th' },
  { id: 'VD', name: 'Vận dụng (Application)', color: 'tag-vd' },
  { id: 'VDC', name: 'Vận dụng cao (High Application)', color: 'tag-vdc' },
];

// ── License Plans ────────────────────────────────────────────────
const LICENSE_PLANS = [
  { id: 'trial', name: 'Dùng thử', price: 0, period: 'month', examLimit: 10, userLimit: 1, days: 14, features: ['10 đề/tháng', 'Lớp 6-9 Global Success', 'Đề 15 phút, Giữa kỳ', 'Xuất Word & In PDF'], disabled: ['Phát âm Audio AI không giới hạn', 'Tải file nghe Audio offline', 'Admin panel'] },
  { id: 'basic', name: 'Cơ bản', price: 99000, period: 'month', examLimit: 50, userLimit: 1, days: 30, features: ['50 đề/tháng', 'Đầy đủ Lớp 6, 7, 8, 9', 'Đề 15p, Giữa kỳ, Cuối kỳ', 'Audio Player & Script nghe', 'Xuất Word Nghị định 30'], disabled: ['Admin panel', 'Tạo license key'] },
  { id: 'pro', name: 'Pro (Khuyên dùng)', price: 199000, period: 'month', examLimit: -1, userLimit: 1, days: 30, featured: true, features: ['Không giới hạn đề thi', 'Audio AI Voice bản xứ chuẩn UK/US', 'Ma trận & Bảng đặc tả chuẩn Bộ GD&ĐT', 'Làm bài thi Online tự chấm điểm', 'Tự thêm câu hỏi & Audio script'], disabled: ['Nhiều giáo viên', 'Tạo license key'] },
  { id: 'school', name: 'Nhóm trường THCS', price: 999000, period: 'month', examLimit: -1, userLimit: 15, days: 365, features: ['Không giới hạn toàn trường', 'Tối đa 15 Giáo viên Tiếng Anh', 'Đầy đủ tính năng Pro', 'Hỗ trợ kỹ thuật trực tiếp Thầy Đinh Văn Thành'], disabled: [] },
];

// ── Default Preset Exams for Global Success ──────────────────────
const EXAM_PRESETS = [
  {
    id: 'preset-mid1-g7',
    grade: 7,
    type: 'midterm',
    title: 'Đề kiểm tra Giữa Học kỳ I – Tiếng Anh 7 Global Success',
    time: 60,
    semester: 'Học kỳ I – 2024-2025',
    audioTitle: 'Listening Comprehension: Healthy living & Hobbies',
    audioScript: 'Narrator: Listen to a conversation between Nick and his doctor. Choose the correct answer A, B, or C.\n\nDoctor: Hello Nick. What seems to be the problem today?\nNick: Good morning, doctor. I feel very tired, and my eyes are hurting after studying on my computer.\nDoctor: How many hours a day do you spend in front of screens?\nNick: About five to six hours, especially in the evening.\nDoctor: That is too much. You should take a five-minute break every thirty minutes. Do you do any physical exercise?\nNick: Not really, doctor. I usually play video games on weekends.\nDoctor: You should join an outdoor sports club, like badminton or football. And remember to drink plenty of fresh water every day.\nNick: Thank you very much, doctor. I will follow your advice.',
    audioUrl: '',
  },
  {
    id: 'preset-final1-g8',
    grade: 8,
    type: 'final',
    title: 'Đề kiểm tra Cuối Học kỳ I – Tiếng Anh 8 Global Success',
    time: 60,
    semester: 'Học kỳ I – 2024-2025',
    audioTitle: 'Listening: Life in the countryside and traditional customs',
    audioScript: 'Narrator: Listen to an announcement about the Spring Cultural Festival. Decide whether the statements are True (T) or False (F).\n\nGood afternoon, teachers and students! We are very pleased to announce our annual Spring Cultural Festival, which will take place on Saturday, January 18th in the main school yard. This year, the festival features special performances by students representing different ethnic groups of Viet Nam. There will be delicious traditional food stalls, a folk game competition including bamboo dancing and tug of war, and an exhibition of handmade traditional costumes. Tickets are completely free for all students. Please gather in the school yard at 7:30 AM sharp. We hope to see all of you there!',
    audioUrl: '',
  },
  {
    id: 'preset-15m-g9',
    grade: 9,
    type: '15min',
    title: 'Đề kiểm tra 15 phút Unit 1: Local Community – Tiếng Anh 9',
    time: 15,
    semester: 'Học kỳ I – 2024-2025',
    audioTitle: 'Pronunciation and Grammar check',
    audioScript: '',
    audioUrl: '',
  }
];

// ── Question Bank: Tiếng Anh THCS Global Success (Lớp 6, 7, 8, 9) ──
const QUESTION_BANK = [
  // ============================================================
  // TIẾNG ANH LỚP 6 – GLOBAL SUCCESS
  // ============================================================
  // ── Pronunciation & Stress ──
  {
    id: 'en6-001', grade: 6, subject: 'english', chapterId: 'en6u1', skill: 'language',
    topic: 'Pronunciation: Sounds /ɑː/ and /ʌ/', level: 'NB',
    content: 'Choose the word whose underlined part is pronounced differently from the others:',
    options: ['A. cl<u>a</u>ss', 'B. f<u>a</u>ther', 'C. c<u>a</u>p', 'D. f<u>a</u>st'],
    answer: 'C',
    solution: 'Giải thích: class, father, fast phát âm là /ɑː/, trong khi cap phát âm là /æ/.'
  },
  {
    id: 'en6-002', grade: 6, subject: 'english', chapterId: 'en6u2', skill: 'language',
    topic: 'Pronunciation: Final sounds /s/ and /z/', level: 'NB',
    content: 'Choose the word whose underlined part is pronounced differently from the others:',
    options: ['A. book<u>s</u>', 'B. clock<u>s</u>', 'C. lamp<u>s</u>', 'D. room<u>s</u>'],
    answer: 'D',
    solution: 'Giải thích: books, clocks, lamps kết thúc bằng âm vô thanh nên phát âm là /s/. Rooms kết thúc bằng nguyên âm/phụ âm hữu thanh nên phát âm là /z/.'
  },
  {
    id: 'en6-003', grade: 6, subject: 'english', chapterId: 'en6u7', skill: 'language',
    topic: 'Pronunciation: Sounds /θ/ and /ð/', level: 'NB',
    content: 'Choose the word whose underlined part is pronounced differently from the others:',
    options: ['A. <u>th</u>ank', 'B. <u>th</u>ere', 'C. <u>th</u>ink', 'D. <u>th</u>eatre'],
    answer: 'B',
    solution: 'Giải thích: thank, think, theatre phát âm là /θ/, trong khi there phát âm là /ð/.'
  },
  // ── Vocabulary & Grammar ──
  {
    id: 'en6-004', grade: 6, subject: 'english', chapterId: 'en6u1', skill: 'language',
    topic: 'Grammar: Present simple', level: 'NB',
    content: 'My brother ________ to school by bicycle every morning.',
    options: ['A. go', 'B. goes', 'C. is going', 'D. went'],
    answer: 'B',
    solution: 'Giải thích: Chủ ngữ ngôi thứ 3 số ít "My brother" đi với động từ thêm -es ở thì hiện tại đơn: goes.'
  },
  {
    id: 'en6-005', grade: 6, subject: 'english', chapterId: 'en6u2', skill: 'language',
    topic: 'Grammar: Prepositions of place', level: 'TH',
    content: 'There is a beautiful clock hanging ________ the wall in the living room.',
    options: ['A. in', 'B. on', 'C. at', 'D. under'],
    answer: 'B',
    solution: 'Giải thích: Giới từ chỉ vị trí trên bề mặt tường là "on the wall".'
  },
  {
    id: 'en6-006', grade: 6, subject: 'english', chapterId: 'en6u4', skill: 'language',
    topic: 'Grammar: Comparative adjectives', level: 'TH',
    content: 'The street in the city centre is ________ than the one in my village.',
    options: ['A. noisy', 'B. noisiest', 'C. noisier', 'D. more noisy'],
    answer: 'C',
    solution: 'Giải thích: Noisy là tính từ hai âm tiết tận cùng bằng -y, dạng so sánh hơn đổi -y thành -ier: noisier.'
  },
  {
    id: 'en6-007', grade: 6, subject: 'english', chapterId: 'en6u5', skill: 'language',
    topic: 'Grammar: Modal verbs must / mustn\'t', level: 'TH',
    content: 'You ________ walk on the grass in the park. It is forbidden.',
    options: ['A. must', 'B. mustn\'t', 'C. can', 'D. should'],
    answer: 'B',
    solution: 'Giải thích: Diễn tả điều cấm đoán ("It is forbidden") ta dùng mustn\'t.'
  },
  {
    id: 'en6-008', grade: 6, subject: 'english', chapterId: 'en6u11', skill: 'language',
    topic: 'Grammar: First conditional (If + Present simple, will + V)', level: 'VD',
    content: 'If people ________ more trees, the air will be cleaner.',
    options: ['A. plant', 'B. will plant', 'C. planted', 'D. plants'],
    answer: 'A',
    solution: 'Giải thích: Mệnh đề If của câu điều kiện loại 1 chia thì Hiện tại đơn. Chủ ngữ "people" là số nhiều nên động từ nguyên thể: plant.'
  },
  // ── Listening (Lớp 6) ──
  {
    id: 'en6-lis-001', grade: 6, subject: 'english', chapterId: 'en6u1', skill: 'listening',
    topic: 'Listening: My New School', level: 'TH', type: 'mc',
    audioTitle: 'Track 1: Duy\'s first day at secondary school',
    audioScript: 'Hello, my name is Duy. Today is my first day at Quang Trung Lower Secondary School. My new school is large and modern. It has three floors and twenty classrooms. In the school yard, there are lots of tall green trees and colourful flowers. My favourite place is the computer room on the second floor because I love learning Information Technology. At lunchtime, I sit with my new classmate, Phong, in the canteen. Everyone is very kind and helpful.',
    content: '[Listening] Where is Duy\'s favourite computer room located?',
    options: ['A. On the first floor', 'B. On the second floor', 'C. On the third floor', 'D. In the school canteen'],
    answer: 'B',
    solution: 'Giải thích: Trong bài nghe Duy nói: "My favourite place is the computer room on the second floor".'
  },
  {
    id: 'en6-lis-002', grade: 6, subject: 'english', chapterId: 'en6u1', skill: 'listening',
    topic: 'Listening: My New School', level: 'TH', type: 'tf',
    audioTitle: 'Track 1: Duy\'s first day at secondary school',
    audioScript: 'Hello, my name is Duy. Today is my first day at Quang Trung Lower Secondary School. My new school is large and modern. It has three floors and twenty classrooms. In the school yard, there are lots of tall green trees and colourful flowers. My favourite place is the computer room on the second floor because I love learning Information Technology. At lunchtime, I sit with my new classmate, Phong, in the canteen. Everyone is very kind and helpful.',
    content: '[Listening] Listen to Duy talking about his new school. Decide whether each statement is True (T) or False (F):',
    items: [
      { label: 'a', text: 'Quang Trung School has twenty classrooms.', isTrue: true },
      { label: 'b', text: 'There are no trees in the school yard.', isTrue: false },
      { label: 'c', text: 'Duy has lunch with Phong in the canteen.', isTrue: true },
      { label: 'd', text: 'Duy dislikes studying Information Technology.', isTrue: false }
    ],
    solution: 'a) Đúng: "It has three floors and twenty classrooms."\nb) Sai: Trong sân có rất nhiều cây to: "lots of tall green trees".\nc) Đúng: "At lunchtime, I sit with my new classmate, Phong, in the canteen."\nd) Sai: Duy rất thích môn Tin học: "because I love learning Information Technology".'
  },
  // ── Reading (Lớp 6) ──
  {
    id: 'en6-read-001', grade: 6, subject: 'english', chapterId: 'en6u5', skill: 'reading',
    topic: 'Reading: Natural Wonders of Viet Nam', level: 'TH', type: 'mc',
    content: 'Read the passage and choose the best answer:\n\nHa Long Bay is one of the most famous natural wonders in Viet Nam. It is located in Quang Ninh Province, in the north-east of the country. The bay consists of thousands of limestone islands in various shapes and sizes. Many islands have magnificent caves, such as Thien Cung Cave and Sung Sot Cave. Tourists from all over the world come here to cruise along the emerald water, enjoy fresh seafood, and climb up the mountains for scenic views. In 1994, UNESCO recognized Ha Long Bay as a World Natural Heritage Site.\n\nAccording to the passage, where is Ha Long Bay located?',
    options: ['A. In central Viet Nam', 'B. In Quang Ninh Province', 'C. Near Da Nang City', 'D. In the south of Viet Nam'],
    answer: 'B',
    solution: 'Giải thích: Dẫn chứng trong bài: "It is located in Quang Ninh Province, in the north-east of the country."'
  },
  // ── Writing (Lớp 6) ──
  {
    id: 'en6-wri-001', grade: 6, subject: 'english', chapterId: 'en6u4', skill: 'writing',
    topic: 'Grammar: Comparative adjectives', level: 'VD', type: 'essay',
    content: 'Rewrite the sentence so that it means the same as the first one:\n"My old house is smaller than my new house."\n➔ My new house is ........................................................................',
    solution: 'My new house is bigger / larger than my old house.'
  },
  {
    id: 'en6-wri-002', grade: 6, subject: 'english', chapterId: 'en6u1', skill: 'writing',
    topic: 'Grammar: Present simple', level: 'VD', type: 'essay',
    content: 'Rearrange the words to make a complete and meaningful sentence:\n"usually / walks / Hoa / to / school / with / her best friend / ."\n➔ ..........................................................................................',
    solution: 'Hoa usually walks to school with her best friend.'
  },

  // ============================================================
  // TIẾNG ANH LỚP 7 – GLOBAL SUCCESS
  // ============================================================
  // ── Pronunciation & Stress ──
  {
    id: 'en7-001', grade: 7, subject: 'english', chapterId: 'en7u3', skill: 'language',
    topic: 'Pronunciation: Endings -ed (/t/, /d/, /ɪd/)', level: 'NB',
    content: 'Choose the word whose underlined part is pronounced differently from the others:',
    options: ['A. donat<u>ed</u>', 'B. provid<u>ed</u>', 'C. plant<u>ed</u>', 'D. clean<u>ed</u>'],
    answer: 'D',
    solution: 'Giải thích: donated, provided, planted tận cùng bằng âm /t/ hoặc /d/ nên đuôi -ed phát âm là /ɪd/. Cleaned phát âm là /d/.'
  },
  {
    id: 'en7-002', grade: 7, subject: 'english', chapterId: 'en7u9', skill: 'language',
    topic: 'Pronunciation: Stress in 2-syllable words', level: 'NB',
    content: 'Choose the word that has a different stress pattern from the others:',
    options: ['A. perform', 'B. music', 'C. dancer', 'D. artist'],
    answer: 'A',
    solution: 'Giải thích: perform nhấn trọng âm rơi vào âm tiết thứ 2 (per\'form), còn music (\'music), dancer (\'dancer), artist (\'artist) nhấn âm tiết thứ nhất.'
  },
  {
    id: 'en7-003', grade: 7, subject: 'english', chapterId: 'en7u8', skill: 'language',
    topic: 'Grammar: -ed and -ing adjectives', level: 'TH',
    content: 'We were all ________ when we watched the documentary about space exploration.',
    options: ['A. amazed', 'B. amazing', 'C. amaze', 'D. amazement'],
    answer: 'A',
    solution: 'Giải thích: Tính từ đuôi -ed (amazed) dùng để miêu tả cảm xúc của người đối với sự việc.'
  },
  // ── Vocabulary & Grammar ──
  {
    id: 'en7-004', grade: 7, subject: 'english', chapterId: 'en7u1', skill: 'language',
    topic: 'Grammar: Verbs of liking + V-ing', level: 'NB',
    content: 'My sister enjoys ________ photos of wild birds and animals at weekends.',
    options: ['A. take', 'B. taking', 'C. to take', 'D. took'],
    answer: 'B',
    solution: 'Giải thích: Sau động từ chỉ sở thích "enjoy" ta dùng danh động từ (V-ing): taking.'
  },
  {
    id: 'en7-005', grade: 7, subject: 'english', chapterId: 'en7u4', skill: 'language',
    topic: 'Grammar: Comparisons with as...as, the same as, different from', level: 'TH',
    content: 'Classical music is not as ________ modern pop music among young people.',
    options: ['A. popular than', 'B. popular as', 'C. more popular', 'D. most popular'],
    answer: 'B',
    solution: 'Giải thích: Cấu trúc so sánh bằng/không bằng: not as + adj + as.'
  },
  {
    id: 'en7-006', grade: 7, subject: 'english', chapterId: 'en7u7', skill: 'language',
    topic: 'Grammar: It indicating distance', level: 'TH',
    content: '________ is about 5 kilometres from my house to Dong Yen Secondary School.',
    options: ['A. There', 'B. This', 'C. It', 'D. That'],
    answer: 'C',
    solution: 'Giải thích: Chủ ngữ giả "It" được dùng để chỉ khoảng cách: It is about ... km from ... to ...'
  },
  {
    id: 'en7-007', grade: 7, subject: 'english', chapterId: 'en7u8', skill: 'language',
    topic: 'Grammar: Connectors although / though, however', level: 'VD',
    content: '________ the film was quite long and slow, we enjoyed the ending very much.',
    options: ['A. Because', 'B. Although', 'C. In spite of', 'D. However'],
    answer: 'B',
    solution: 'Giải thích: Mệnh đề chỉ sự tương phản có chủ ngữ và vị ngữ (the film was quite long...) ta dùng liên từ "Although".'
  },
  {
    id: 'en7-008', grade: 7, subject: 'english', chapterId: 'en7u10', skill: 'language',
    topic: 'Vocabulary: Renewable & non-renewable energy', level: 'TH',
    content: 'Solar energy and wind power are ________ sources of energy because they will not run out.',
    options: ['A. non-renewable', 'B. renewable', 'C. polluted', 'D. harmful'],
    answer: 'B',
    solution: 'Giải thích: Năng lượng mặt trời và gió là nguồn năng lượng tái tạo (renewable energy).'
  },
  // ── Listening (Lớp 7) ──
  {
    id: 'en7-lis-001', grade: 7, subject: 'english', chapterId: 'en7u2', skill: 'listening',
    topic: 'Listening: Healthy Living and Wellness', level: 'TH', type: 'mc',
    audioTitle: 'Track 2: A doctor giving healthy advice',
    audioScript: 'Narrator: Listen to Dr. Green talking about staying fit. Choose the correct answer.\n\nDr. Green: Good morning everyone. Today I would like to give you three essential tips for healthy living. First, never skip breakfast. A nutritious breakfast with eggs, milk, and whole grains provides energy for your entire morning at school. Second, teenagers need at least eight hours of sleep every night. If you stay up late using your smartphone, your brain cannot concentrate well the next morning. Finally, do at least thirty minutes of outdoor exercise daily, such as cycling, running, or skipping rope. It keeps your heart healthy and reduces academic stress.',
    content: '[Listening] According to Dr. Green, how much sleep do teenagers need each night?',
    options: ['A. Six hours', 'B. Seven hours', 'C. At least eight hours', 'D. Ten hours'],
    answer: 'C',
    solution: 'Giải thích: Dẫn chứng trong bài nghe: "teenagers need at least eight hours of sleep every night".'
  },
  {
    id: 'en7-lis-002', grade: 7, subject: 'english', chapterId: 'en7u3', skill: 'listening',
    topic: 'Listening: Community Service', level: 'TH', type: 'tf',
    audioTitle: 'Track 3: Green Club volunteer activities',
    audioScript: 'Narrator: Listen to Mai talking about her volunteer project. Decide whether statements are True or False.\n\nLast summer, our youth club organized a volunteer programme called Green Neighbours. We started by collecting plastic bottles and old paper from houses in our village. In two weeks, we collected over 500 kilograms of recyclable waste. We sold them to buy notebooks and warm jackets for poor children in the mountainous district. On Sunday mornings, we also helped elderly people sweep their yards and weed their vegetable gardens. It was hard work, but we felt very proud and happy.',
    content: '[Listening] Listen to Mai talking about the Green Neighbours project. Decide True (T) or False (F):',
    items: [
      { label: 'a', text: 'The volunteer programme was called Green Neighbours.', isTrue: true },
      { label: 'b', text: 'The students collected over 500 kilograms of recyclable waste.', isTrue: true },
      { label: 'c', text: 'They used the money to buy computer games.', isTrue: false },
      { label: 'd', text: 'They helped elderly people clean their yards on Sunday mornings.', isTrue: true }
    ],
    solution: 'a) Đúng.\nb) Đúng.\nc) Sai: Họ dùng tiền mua vở và áo ấm: "to buy notebooks and warm jackets for poor children".\nd) Đúng.'
  },
  // ── Reading (Lớp 7) ──
  {
    id: 'en7-read-001', grade: 7, subject: 'english', chapterId: 'en7u4', skill: 'reading',
    topic: 'Reading: Water puppetry – A traditional art form', level: 'TH', type: 'mc',
    content: 'Read the text and choose the best answer:\n\nWater puppetry (Mua roi nuoc) is a unique traditional art form of Viet Nam. It originated in the villages of the Red River Delta in northern Viet Nam in the 11th century. When the rice fields were flooded after heavy rains, villagers entertained themselves by standing in waist-deep water and controlling wooden puppets behind a bamboo screen. The puppets are made of fig wood and painted with waterproof lacquer. The stories in water puppet shows are often based on Vietnamese folk tales, rural life, and national legends.\n\nWhen did water puppetry originate?',
    options: ['A. In the 10th century', 'B. In the 11th century', 'C. In the 19th century', 'D. In the 20th century'],
    answer: 'B',
    solution: 'Giải thích: Dẫn chứng trong bài: "It originated in the villages of the Red River Delta in northern Viet Nam in the 11th century."'
  },
  // ── Writing (Lớp 7) ──
  {
    id: 'en7-wri-001', grade: 7, subject: 'english', chapterId: 'en7u4', skill: 'writing',
    topic: 'Grammar: Comparisons with as...as, the same as, different from', level: 'VD', type: 'essay',
    content: 'Rewrite the sentence using "different from":\n"His painting is not like my painting."\n➔ His painting is ........................................................................',
    solution: 'His painting is different from my painting (mine).'
  },
  {
    id: 'en7-wri-002', grade: 7, subject: 'english', chapterId: 'en7u8', skill: 'writing',
    topic: 'Grammar: Connectors although / though, however', level: 'VD', type: 'essay',
    content: 'Rewrite the sentence combining with "Although":\n"He was very tired. He still tried to complete all his English homework."\n➔ Although .................................................................................',
    solution: 'Although he was very tired, he still tried to complete all his English homework.'
  },

  // ============================================================
  // TIẾNG ANH LỚP 8 – GLOBAL SUCCESS
  // ============================================================
  // ── Pronunciation & Stress ──
  {
    id: 'en8-001', grade: 8, subject: 'english', chapterId: 'en8u10', skill: 'language',
    topic: 'Pronunciation: Stress in words ending in -ity and -itive', level: 'NB',
    content: 'Choose the word that has a different stress pattern from the others:',
    options: ['A. activity', 'B. ability', 'C. community', 'D. generation'],
    answer: 'D',
    solution: 'Giải thích: activity, ability, community nhấn trọng âm ở âm tiết thứ 3 từ cuối lên (âm thứ 2), còn generation nhấn trọng âm ở âm tiết thứ 3 (ge-ne-\'ra-tion).'
  },
  {
    id: 'en8-002', grade: 8, subject: 'english', chapterId: 'en8u9', skill: 'language',
    topic: 'Pronunciation: Stress in words ending in -al and -ous', level: 'NB',
    content: 'Choose the word whose underlined part is pronounced differently from the others:',
    options: ['A. pollut<u>ed</u>', 'B. erupt<u>ed</u>', 'C. protect<u>ed</u>', 'D. destroy<u>ed</u>'],
    answer: 'D',
    solution: 'Giải thích: polluted, erupted, protected tận cùng bằng /t/ nên -ed phát âm là /ɪd/. Destroyed phát âm là /d/.'
  },
  // ── Vocabulary & Grammar ──
  {
    id: 'en8-003', grade: 8, subject: 'english', chapterId: 'en8u2', skill: 'language',
    topic: 'Grammar: Comparative forms of adverbs', level: 'TH',
    content: 'In the countryside, farmers have to work ________ during the harvesting season than in winter.',
    options: ['A. more hard', 'B. harder', 'C. hardly', 'D. more hardly'],
    answer: 'B',
    solution: 'Giải thích: Trạng từ "hard" có dạng so sánh hơn là "harder" (không dùng more hard).'
  },
  {
    id: 'en8-004', grade: 8, subject: 'english', chapterId: 'en8u9', skill: 'language',
    topic: 'Grammar: Past continuous vs Past simple with when/while', level: 'TH',
    content: 'While my family ________ dinner yesterday evening, a violent thunderstorm struck our town.',
    options: ['A. had', 'B. was having', 'C. were having', 'D. are having'],
    answer: 'B',
    solution: 'Giải thích: Hành động đang xảy ra trong quá khứ dùng thì Quá khứ tiếp diễn (was having), hành động ngắn xen vào dùng Quá khứ đơn (struck).'
  },
  {
    id: 'en8-005', grade: 8, subject: 'english', chapterId: 'en8u11', skill: 'language',
    topic: 'Grammar: Reported speech: Statements', level: 'VD',
    content: 'The scientist said: "We will test the new solar car next month."\n➔ The scientist said that they ________ the new solar car the following month.',
    options: ['A. will test', 'B. would test', 'C. tested', 'D. test'],
    answer: 'B',
    solution: 'Giải thích: Chuyển sang gián tiếp lùi thì: will test ➔ would test.'
  },
  {
    id: 'en8-006', grade: 8, subject: 'english', chapterId: 'en8u7', skill: 'language',
    topic: 'Grammar: Complex sentences with adverb clauses of reason & result', level: 'TH',
    content: 'Many wild animals are losing their habitats ________ forests are being cleared for farmland.',
    options: ['A. so', 'B. because', 'C. although', 'D. despite'],
    answer: 'B',
    solution: 'Giải thích: Dùng "because" để chỉ nguyên nhân của sự việc.'
  },
  // ── Listening (Lớp 8) ──
  {
    id: 'en8-lis-001', grade: 8, subject: 'english', chapterId: 'en8u4', skill: 'listening',
    topic: 'Listening: Ethnic Groups of Viet Nam', level: 'TH', type: 'mc',
    audioTitle: 'Track 4: The Tay ethnic culture and Stilt Houses',
    audioScript: 'Narrator: Listen to a guide introducing the Tay ethnic group in Northern Viet Nam. Choose the best option.\n\nWelcome visitors to our community cultural house! The Tay are the second largest ethnic group in Viet Nam, living mostly in the valleys of Cao Bang, Lang Son, and Tuyen Quang provinces. The Tay build stilt houses made of wood and bamboo. These stilt houses protect family members from wild animals and damp weather during the rainy season. The space under the floor is traditionally used for keeping tools and weaving looms. The Tay women are famous for weaving brocade cloth with intricate geometric patterns.',
    content: '[Listening] What do the Tay people use to build their traditional stilt houses?',
    options: ['A. Bricks and concrete', 'B. Wood and bamboo', 'C. Stone and steel', 'D. Palm leaves and mud'],
    answer: 'B',
    solution: 'Giải thích: Dẫn chứng trong bài nghe: "The Tay build stilt houses made of wood and bamboo."'
  },
  {
    id: 'en8-lis-002', grade: 8, subject: 'english', chapterId: 'en8u9', skill: 'listening',
    topic: 'Listening: Natural Disasters in Asia', level: 'TH', type: 'tf',
    audioTitle: 'Track 5: Emergency weather broadcast',
    audioScript: 'Narrator: Listen to an emergency weather bulletin. Decide whether the statements are True (T) or False (F).\n\nAttention all residents of the coastal areas. Typhoon Vamco is moving rapidly toward our province at a speed of 120 kilometres per hour. Heavy torrential rains and high sea waves are expected to hit the mainland starting from 6:00 PM tonight. Local authorities urge all fishermen to anchor their boats in safe harbours immediately. Residents living in low-lying areas must evacuate to designated shelters before 4:00 PM. Please make sure you have sufficient bottled water, flashlights, and canned food for at least three days.',
    content: '[Listening] Listen to the emergency weather broadcast. Decide True (T) or False (F):',
    items: [
      { label: 'a', text: 'Typhoon Vamco is moving at 120 kilometres per hour.', isTrue: true },
      { label: 'b', text: 'The typhoon will hit the mainland around noon.', isTrue: false },
      { label: 'c', text: 'Fishermen must anchor their boats in safe harbours.', isTrue: true },
      { label: 'd', text: 'Residents are advised to prepare food and water for three days.', isTrue: true }
    ],
    solution: 'a) Đúng.\nb) Sai: Bắt đầu từ 6 giờ tối: "starting from 6:00 PM tonight".\nc) Đúng.\nd) Đúng.'
  },
  // ── Reading (Lớp 8) ──
  {
    id: 'en8-read-001', grade: 8, subject: 'english', chapterId: 'en8u7', skill: 'reading',
    topic: 'Reading: Protecting Endangered Marine Life', level: 'TH', type: 'mc',
    content: 'Read the text and choose the correct answer:\n\nPlastic pollution is one of the greatest threats to marine life today. Every year, over eight million tons of plastic waste end up in the oceans. Sea turtles, dolphins, and seabirds often mistake plastic bags for jellyfish or other prey and eat them. This blocks their digestive system and causes fatal illness. Furthermore, microplastics are consumed by small fish, entering the human food chain. To solve this critical problem, schools and communities must promote the 3Rs: reducing disposable plastic cups, reusing containers, and recycling plastic waste whenever possible.\n\nWhy do sea turtles and dolphins eat plastic bags?',
    options: ['A. Because they love the taste of plastic', 'B. Because they mistake them for jellyfish or prey', 'C. Because there is no other food in the sea', 'D. Because plastic is soft and colourful'],
    answer: 'B',
    solution: 'Giải thích: Dẫn chứng trong bài: "Sea turtles, dolphins, and seabirds often mistake plastic bags for jellyfish or other prey and eat them."'
  },
  // ── Writing (Lớp 8) ──
  {
    id: 'en8-wri-001', grade: 8, subject: 'english', chapterId: 'en8u11', skill: 'writing',
    topic: 'Grammar: Reported speech: Statements', level: 'VD', type: 'essay',
    content: 'Change the sentence into reported speech:\n"I am doing a science project on renewable energy," Nam told me.\n➔ Nam told me that ........................................................................',
    solution: 'Nam told me that he was doing a science project on renewable energy.'
  },
  {
    id: 'en8-wri-002', grade: 8, subject: 'english', chapterId: 'en8u9', skill: 'writing',
    topic: 'Grammar: Past continuous vs Past simple with when/while', level: 'VD', type: 'essay',
    content: 'Combine two sentences using "WHEN":\n"The students were doing an experiment in the lab. The power went out."\n➔ ..........................................................................................',
    solution: 'The students were doing an experiment in the lab when the power went out.'
  },

  // ============================================================
  // TIẾNG ANH LỚP 9 – GLOBAL SUCCESS
  // ============================================================
  // ── Pronunciation & Stress ──
  {
    id: 'en9-001', grade: 9, subject: 'english', chapterId: 'en9u9', skill: 'language',
    topic: 'Pronunciation: Stress in words ending in -ic and -ical', level: 'NB',
    content: 'Choose the word that has a different stress pattern from the others:',
    options: ['A. economic', 'B. historic', 'C. electronic', 'D. scientific'],
    answer: 'B',
    solution: 'Giải thích: his\'toric có trọng âm ở âm tiết thứ 2. Các từ economic, electronic, scientific có trọng âm rơi vào âm tiết thứ 3 (trước đuôi -ic).'
  },
  {
    id: 'en9-002', grade: 9, subject: 'english', chapterId: 'en9u1', skill: 'language',
    topic: 'Pronunciation: Stress in 2-syllable words with prefixes', level: 'NB',
    content: 'Choose the word whose underlined part is pronounced differently from the others:',
    options: ['A. poll<u>u</u>tion', 'B. prod<u>u</u>ce', 'C. comm<u>u</u>nity', 'D. red<u>u</u>ce'],
    answer: 'A',
    solution: 'Giải thích: pollution phát âm là /uː/, trong khi produce, community, reduce phát âm âm /juː/.'
  },
  // ── Vocabulary & Grammar ──
  {
    id: 'en9-003', grade: 9, subject: 'english', chapterId: 'en9u1', skill: 'language',
    topic: 'Grammar: Phrasal verbs', level: 'TH',
    content: 'Before you submit your final English exam, please ________ your answers carefully.',
    options: ['A. look up', 'B. look through', 'C. look forward', 'D. look after'],
    answer: 'B',
    solution: 'Giải thích: Cụm động từ "look through" nghĩa là rà soát, kiểm tra lại cẩn thận.'
  },
  {
    id: 'en9-004', grade: 9, subject: 'english', chapterId: 'en9u4', skill: 'language',
    topic: 'Grammar: Wish for present & future', level: 'TH',
    content: 'I wish I ________ speak English as fluently as a native speaker right now.',
    options: ['A. can', 'B. could', 'C. will be able to', 'D. am able to'],
    answer: 'B',
    solution: 'Giải thích: Câu ước ở hiện tại (Wish for present) dùng thì Quá khứ đơn / could + V-inf.'
  },
  {
    id: 'en9-005', grade: 9, subject: 'english', chapterId: 'en9u7', skill: 'language',
    topic: 'Grammar: Defining relative clauses with who/which/that', level: 'TH',
    content: 'The foreign tourist ________ asked me for directions to the craft village was very polite.',
    options: ['A. which', 'B. who', 'C. whom', 'D. whose'],
    answer: 'B',
    solution: 'Giải thích: Đại từ quan hệ chỉ người làm chủ ngữ đứng trước động từ "asked" là "who".'
  },
  {
    id: 'en9-006', grade: 9, subject: 'english', chapterId: 'en9u9', skill: 'language',
    topic: 'Grammar: Conditional sentence type 2', level: 'VD',
    content: 'If I ________ a lot of money, I would travel around the world to practice my English.',
    options: ['A. have', 'B. had', 'C. will have', 'D. would have'],
    answer: 'B',
    solution: 'Giải thích: Mệnh đề If của câu điều kiện loại 2 chia thì Quá khứ đơn (had).'
  },
  {
    id: 'en9-007', grade: 9, subject: 'english', chapterId: 'en9u5', skill: 'language',
    topic: 'Grammar: Suggest + V-ing / clause with should', level: 'VD',
    content: 'Our teacher suggested that we ________ more English books and newspapers to enrich our vocabulary.',
    options: ['A. read', 'B. reading', 'C. to read', 'D. must read'],
    answer: 'A',
    solution: 'Giải thích: Cấu trúc giả định thức: suggest that S + (should) + V-nguyên thể ➔ read.'
  },
  // ── Listening (Lớp 9) ──
  {
    id: 'en9-lis-001', grade: 9, subject: 'english', chapterId: 'en9u1', skill: 'listening',
    topic: 'Listening: Traditional Craft Villages in Hanoi', level: 'TH', type: 'mc',
    audioTitle: 'Track 6: Bat Trang ceramic village tour',
    audioScript: 'Narrator: Listen to a podcast about Bat Trang ceramic village. Choose the best answer.\n\nBat Trang is an ancient pottery village located on the banks of the Red River, about 13 kilometres southeast of Hanoi centre. Established in the 14th century, the village is renowned worldwide for its exquisite porcelain and ceramic products. Today, visitors can not only purchase bowls, vases, and tea sets, but also participate in hands-on workshops where master artisans guide them on how to mould clay on a potter’s wheel and paint their own creations. Bat Trang pottery has been exported to numerous countries across Europe, America, and Asia.',
    content: '[Listening] How far is Bat Trang ceramic village from Hanoi city centre?',
    options: ['A. About 3 kilometres', 'B. About 13 kilometres', 'C. About 30 kilometres', 'D. About 40 kilometres'],
    answer: 'B',
    solution: 'Giải thích: Dẫn chứng trong bài nghe: "about 13 kilometres southeast of Hanoi centre".'
  },
  {
    id: 'en9-lis-002', grade: 9, subject: 'english', chapterId: 'en9u2', skill: 'listening',
    topic: 'Listening: City Life Challenges for Teenagers', level: 'TH', type: 'tf',
    audioTitle: 'Track 7: Discussion on urbanization and youth',
    audioScript: 'Narrator: Listen to Minh and Elena discussing life in major cities. Decide whether each statement is True or False.\n\nMinh: Hi Elena. How are you finding living in such a crowded city?\nElena: Well, I love the convenience, Minh! There are fantastic public libraries, cinema complexes, and shopping malls everywhere. But traffic congestion during peak hours is a real nightmare. It takes me nearly an hour to travel five kilometres to school.\nMinh: I agree. Air pollution and lack of green parks are also serious concerns for young people. Many of my classmates feel overwhelmed and exhausted by noise and pace of city life.\nElena: Yes, urban planners definitely need to create more pedestrian zones and plant more green trees.',
    content: '[Listening] Listen to Minh and Elena discussing city life. Decide True (T) or False (F):',
    items: [
      { label: 'a', text: 'Elena enjoys the convenience of public libraries and shopping malls.', isTrue: true },
      { label: 'b', text: 'Traffic congestion is never a problem in Elena\'s city.', isTrue: false },
      { label: 'c', text: 'Air pollution and lack of green spaces concern young citizens.', isTrue: true },
      { label: 'd', text: 'Both speakers think cities need more pedestrian zones and trees.', isTrue: true }
    ],
    solution: 'a) Đúng.\nb) Sai: Giao thông tắc nghẽn là cơn ác mộng: "traffic congestion during peak hours is a real nightmare".\nc) Đúng.\nd) Đúng.'
  },
  // ── Reading (Lớp 9) ──
  {
    id: 'en9-read-001', grade: 9, subject: 'english', chapterId: 'en9u9', skill: 'reading',
    topic: 'Reading: English as a Global Language', level: 'TH', type: 'mc',
    content: 'Read the text and choose the correct answer:\n\nEnglish is currently recognized as the global lingua franca of the 21st century. Over 1.5 billion people around the globe speak English either as their mother tongue, second language, or foreign language. In science, international business, diplomacy, and aviation, English serves as the dominant working medium. Furthermore, more than eighty percent of digital data stored on the internet is in English. Mastering English opens up boundless academic opportunities, international scholarships, and diverse career prospects for young Vietnamese students.\n\nWhat percentage of digital data stored on the internet is estimated to be in English?',
    options: ['A. Over 50%', 'B. Around 60%', 'C. More than 80%', 'D. Exactly 100%'],
    answer: 'C',
    solution: 'Giải thích: Dẫn chứng trong bài: "more than eighty percent of digital data stored on the internet is in English."'
  },
  // ── Writing (Lớp 9) ──
  {
    id: 'en9-wri-001', grade: 9, subject: 'english', chapterId: 'en9u9', skill: 'writing',
    topic: 'Grammar: Conditional sentence type 2', level: 'VD', type: 'essay',
    content: 'Rewrite the sentence using Conditional Sentence Type 2:\n"I don\'t have enough free time, so I cannot participate in the English Speaking Club."\n➔ If I ......................................................................................',
    solution: 'If I had enough free time, I could participate in the English Speaking Club.'
  },
  {
    id: 'en9-wri-002', grade: 9, subject: 'english', chapterId: 'en9u5', skill: 'writing',
    topic: 'Grammar: Impersonal passive (It is said that...)', level: 'VD', type: 'essay',
    content: 'Rewrite the sentence using the passive voice:\n"People believe that Phong Nha Cave has the longest underground river."\n➔ It is believed that .....................................................................',
    solution: 'It is believed that Phong Nha Cave has the longest underground river.'
  }
];

// ── Users & Auth ─────────────────────────────────────────────────
const DEFAULT_USERS = [
  {
    id: 'u001', username: 'dinhvanthanh', password: 'Admin@2024!', name: 'Thầy Đinh Văn Thành',
    role: 'superadmin', email: 'dinhvanthanh@thcsdongyen.edu.vn', school: 'Trường THCS Đồng Yên',
    license: 'school', licenseExpiry: '2030-12-31', examCount: 28,
    avatar: '👨‍🏫', color: '#2563eb', createdAt: '2024-01-01',
    bio: 'Giáo viên Tiếng Anh – Trường THCS Đồng Yên. Tác giả & Quản trị viên hệ thống EnglishExam Pro.'
  },
  {
    id: 'u002', username: 'admin', password: 'admin123', name: 'Thầy Đinh Văn Thành (Admin)',
    role: 'admin', email: 'thanhdv@dongyen.edu.vn', school: 'Trường THCS Đồng Yên',
    license: 'school', licenseExpiry: '2030-12-31', examCount: 15,
    avatar: '⭐', color: '#7c3aed', createdAt: '2024-01-01',
  },
  {
    id: 'u003', username: 'teacher_lan', password: 'giaovien123', name: 'Cô Mai Thị Lan',
    role: 'teacher', email: 'lanmai@dongyen.edu.vn', school: 'Trường THCS Đồng Yên',
    license: 'pro', licenseExpiry: '2026-12-31', examCount: 8,
    avatar: '👩‍🏫', color: '#0ea5e9', createdAt: '2024-05-01',
  },
  {
    id: 'u004', username: 'demo', password: 'demo123', name: 'Giáo viên Trải nghiệm',
    role: 'teacher', email: 'demo@englishexam.vn', school: 'THCS Thực Nghiệm',
    license: 'trial', licenseExpiry: '2026-10-31', examCount: 2,
    avatar: '🎓', color: '#10b981', createdAt: '2026-09-15',
  },
];

// ── License Keys ─────────────────────────────────────────────────
const DEFAULT_LICENSE_KEYS = [
  { key: 'ENG-PRO-2024-THANH', plan: 'pro', createdBy: 'u001', usedBy: null, usedAt: null, expiresDays: 365, createdAt: '2024-06-01' },
  { key: 'ENG-SCH-2024-DONGYEN', plan: 'school', createdBy: 'u001', usedBy: null, usedAt: null, expiresDays: 365, createdAt: '2024-06-01' },
  { key: 'ENG-BAS-2024-GLOBAL', plan: 'basic', createdBy: 'u001', usedBy: null, usedAt: null, expiresDays: 90, createdAt: '2024-06-01' },
];

// ── Exam Records (history) ───────────────────────────────────────
const DEFAULT_EXAM_RECORDS = [
  { id: 'e001', userId: 'u001', title: 'Đề kiểm tra 15 phút Unit 1: Hobbies – Tiếng Anh 7', grade: 7, subject: 'english', questionCount: 15, examType: '15 phút', createdAt: '2026-09-10T08:30:00' },
  { id: 'e002', userId: 'u001', title: 'Đề thi Giữa kỳ I môn Tiếng Anh 8 (Kèm Audio Script)', grade: 8, subject: 'english', questionCount: 30, examType: '45 phút', createdAt: '2026-09-18T10:00:00' },
  { id: 'e003', userId: 'u001', title: 'Đề kiểm tra Cuối Học kỳ I môn Tiếng Anh 9 chuẩn CV 7991', grade: 9, subject: 'english', questionCount: 40, examType: '60 phút', createdAt: '2026-09-25T14:20:00' },
];

// ── Quản lý Lớp học của Thầy Đinh Văn Thành ────────────────────────
const DEFAULT_CLASSES = [
  { id: 'cls-7a1', name: 'Lớp 7A1', grade: 7, teacherId: 'u001', school: 'Trường THCS Đồng Yên', code: 'DY7A1', studentCount: 38, year: '2024-2025' },
  { id: 'cls-7a2', name: 'Lớp 7A2', grade: 7, teacherId: 'u001', school: 'Trường THCS Đồng Yên', code: 'DY7A2', studentCount: 36, year: '2024-2025' },
  { id: 'cls-8b',  name: 'Lớp 8B',  grade: 8, teacherId: 'u001', school: 'Trường THCS Đồng Yên', code: 'DY8B',  studentCount: 35, year: '2024-2025' },
  { id: 'cls-9a',  name: 'Lớp 9A',  grade: 9, teacherId: 'u001', school: 'Trường THCS Đồng Yên', code: 'DY9A',  studentCount: 40, year: '2024-2025' },
  { id: 'cls-6a',  name: 'Lớp 6A',  grade: 6, teacherId: 'u001', school: 'Trường THCS Đồng Yên', code: 'DY6A',  studentCount: 34, year: '2024-2025' },
];

// ── Tài khoản Học sinh mẫu ─────────────────────────────────────────
const DEFAULT_STUDENTS = [
  { id: 'st-01', username: 'nguyenvanan', password: '123', name: 'Nguyễn Văn An', grade: 7, class: '7A1', classCode: 'DY7A1', role: 'student', school: 'THCS Đồng Yên', points: 420, completedExams: 6 },
  { id: 'st-02', username: 'tranthimai', password: '123', name: 'Trần Thị Mai', grade: 7, class: '7A1', classCode: 'DY7A1', role: 'student', school: 'THCS Đồng Yên', points: 510, completedExams: 7 },
  { id: 'st-03', username: 'lehongphuc', password: '123', name: 'Lê Hồng Phúc', grade: 8, class: '8B', classCode: 'DY8B', role: 'student', school: 'THCS Đồng Yên', points: 380, completedExams: 5 },
  { id: 'st-04', username: 'hoangminhkhang', password: '123', name: 'Hoàng Minh Khang', grade: 9, class: '9A', classCode: 'DY9A', role: 'student', school: 'THCS Đồng Yên', points: 640, completedExams: 9 },
];

// ── Ngân hàng Từ vựng Flashcards chuẩn SGK Global Success ─────────
const GLOBAL_SUCCESS_VOCABULARY = [
  // LỚP 6
  { id: 'v6-01', grade: 6, unit: 'Unit 1: My New School', word: 'uniform', pos: 'n', ipa: '/ˈjuːnɪfɔːm/', meaning: 'đồng phục', example: 'We wear our school uniform on Mondays and Fridays.' },
  { id: 'v6-02', grade: 6, unit: 'Unit 1: My New School', word: 'equipment', pos: 'n', ipa: '/ɪˈkwɪpmənt/', meaning: 'thiết bị, dụng cụ', example: 'The school science lab has lots of modern equipment.' },
  { id: 'v6-03', grade: 6, unit: 'Unit 2: My Home', word: 'dishwasher', pos: 'n', ipa: '/ˈdɪʃwɒʃə(r)/', meaning: 'máy rửa bát', example: 'Our modern kitchen is equipped with a dishwasher.' },
  { id: 'v6-04', grade: 6, unit: 'Unit 3: My Friends', word: 'confident', pos: 'adj', ipa: '/ˈkɒnfɪdənt/', meaning: 'tự tin', example: 'Lan is a confident girl who speaks English very fluently.' },
  { id: 'v6-05', grade: 6, unit: 'Unit 4: My Neighbourhood', word: 'convenient', pos: 'adj', ipa: '/kənˈviːniənt/', meaning: 'tiện lợi, thuận tiện', example: 'Living near supermarkets is very convenient for my family.' },
  { id: 'v6-06', grade: 6, unit: 'Unit 5: Natural Wonders', word: 'magnificent', pos: 'adj', ipa: '/mæɡˈnɪfɪsnt/', meaning: 'tráng lệ, lộng lẫy', example: 'Ha Long Bay has magnificent limestone islands.' },

  // LỚP 7
  { id: 'v7-01', grade: 7, unit: 'Unit 1: Hobbies', word: 'gardening', pos: 'n', ipa: '/ˈɡɑːdnɪŋ/', meaning: 'việc làm vườn', example: 'My grandparents find gardening very relaxing and peaceful.' },
  { id: 'v7-02', grade: 7, unit: 'Unit 2: Healthy Living', word: 'vegetarian', pos: 'n/adj', ipa: '/ˌvedʒəˈteəriən/', meaning: 'người ăn chay / chay', example: 'Eating vegetarian dishes once a week is good for your health.' },
  { id: 'v7-03', grade: 7, unit: 'Unit 3: Community Service', word: 'donate', pos: 'v', ipa: '/dəʊˈneɪt/', meaning: 'quyên góp, ủng hộ', example: 'Students donated warm clothes and books to children in need.' },
  { id: 'v7-04', grade: 7, unit: 'Unit 4: Music and Arts', word: 'composer', pos: 'n', ipa: '/kəmˈpəʊzə(r)/', meaning: 'nhà soạn nhạc', example: 'Trinh Cong Son was one of the most famous Vietnamese composers.' },
  { id: 'v7-05', grade: 7, unit: 'Unit 7: Traffic', word: 'pedestrian', pos: 'n', ipa: '/pəˈdestriən/', meaning: 'người đi bộ', example: 'Pedestrians should always use the zebra crossing to cross streets.' },
  { id: 'v7-06', grade: 7, unit: 'Unit 10: Energy Sources', word: 'renewable', pos: 'adj', ipa: '/rɪˈnjuːəbl/', meaning: 'có thể tái tạo', example: 'Solar and wind energy are clean renewable resources.' },

  // LỚP 8
  { id: 'v8-01', grade: 8, unit: 'Unit 1: Leisure Time', word: 'origami', pos: 'n', ipa: '/ˌɒrɪˈɡɑːmi/', meaning: 'nghệ thuật gấp giấy Nhật Bản', example: 'Folding paper origami trains patience and creativity.' },
  { id: 'v8-02', grade: 8, unit: 'Unit 2: Life in Countryside', word: 'picturesque', pos: 'adj', ipa: '/ˌpɪktʃəˈresk/', meaning: 'đẹp như tranh vẽ', example: 'Dong Yen village looks picturesque with golden rice terraces.' },
  { id: 'v8-03', grade: 8, unit: 'Unit 3: Teenagers', word: 'peer pressure', pos: 'n', ipa: '/pɪə ˈpreʃə(r)/', meaning: 'áp lực từ bạn bè đồng trang lứa', example: 'Teens need strong guidance to overcome peer pressure.' },
  { id: 'v8-04', grade: 8, unit: 'Unit 4: Ethnic Groups', word: 'stilt house', pos: 'n', ipa: '/stɪlt haʊs/', meaning: 'nhà sàn', example: 'The Tay and Nung people live in traditional wooden stilt houses.' },
  { id: 'v8-05', grade: 8, unit: 'Unit 7: Environment', word: 'biodiversity', pos: 'n', ipa: '/ˌbaɪəʊdaɪˈvɜːsəti/', meaning: 'đa dạng sinh học', example: 'Protecting rainforests preserves global biodiversity.' },
  { id: 'v8-06', grade: 8, unit: 'Unit 9: Natural Disasters', word: 'evacuate', pos: 'v', ipa: '/ɪˈvækjueɪt/', meaning: 'sơ tán, di tản', example: 'Local residents had to evacuate immediately before the typhoon arrived.' },

  // LỚP 9
  { id: 'v9-01', grade: 9, unit: 'Unit 1: Local Community', word: 'artisan', pos: 'n', ipa: '/ˌɑːtɪˈzæn/', meaning: 'thợ thủ công lành nghề', example: 'Skilled artisans in Bat Trang mold pottery with great care.' },
  { id: 'v9-02', grade: 9, unit: 'Unit 2: City Life', word: 'metropolis', pos: 'n', ipa: '/məˈtrɒpəlɪs/', meaning: 'đô thị lớn, siêu thành phố', example: 'Tokyo is a bustling metropolis with high-tech transport systems.' },
  { id: 'v9-03', grade: 9, unit: 'Unit 4: Past Memories', word: 'illiterate', pos: 'adj', ipa: '/ɪˈlɪtərət/', meaning: 'mù chữ, không biết đọc viết', example: 'Decades ago, many rural villagers were unfortunately illiterate.' },
  { id: 'v9-04', grade: 9, unit: 'Unit 8: Tourism', word: 'ecotourism', pos: 'n', ipa: '/ˈiːkəʊtʊərɪzəm/', meaning: 'du lịch sinh thái', example: 'Ecotourism encourages travellers to respect local wildlife.' },
  { id: 'v9-05', grade: 9, unit: 'Unit 9: English in World', word: 'lingua franca', pos: 'n', ipa: '/ˌlɪŋɡwə ˈfræŋkə/', meaning: 'ngôn ngữ chung toàn cầu', example: 'English has become the international lingua franca in aviation.' },
  { id: 'v9-06', grade: 9, unit: 'Unit 12: Future Career', word: 'qualification', pos: 'n', ipa: '/ˌkwɒlɪfɪˈkeɪʃn/', meaning: 'bằng cấp, năng lực chuyên môn', example: 'A degree in computer science is an important qualification for software engineers.' },
];

// ── Luyện Nghe theo Unit (Listening Studio cho Học sinh) ─────────
const GLOBAL_SUCCESS_LISTENING_LAB = [
  {
    id: 'lab-01',
    grade: 7,
    unit: 'Unit 1: Hobbies',
    title: 'An and Mi talking about unusual hobbies',
    audioScript: 'Mi: Hi An, what do you like doing in your free time?\nAn: I enjoy carving eggshells, Mi! It sounds unusual, but it requires patience and a steady hand.\nMi: Wow, isn\'t that very difficult?\nAn: Yes, at first I broke many shells. But my father taught me how to empty the egg carefully and use small carving tools. Now I have created more than twenty carved eggshell lamps.',
    questions: [
      { q: 'What is An\'s hobby?', options: ['A. Collecting stamps', 'B. Carving eggshells', 'C. Painting portraits', 'D. Building models'], answer: 'B' },
      { q: 'Who taught An how to carve eggshells?', options: ['A. His mother', 'B. His art teacher', 'C. His father', 'D. His best friend'], answer: 'C' }
    ]
  },
  {
    id: 'lab-02',
    grade: 8,
    unit: 'Unit 2: Life in the Countryside',
    title: 'Nguyen sharing his summer trip to the village',
    audioScript: 'Last summer, my parents took me to my grandparents\' farm in Ha Giang province. Life in the village was surprisingly peaceful compared to the city. Every morning, I woke up to birds singing and roosters crowing. I learned how to herd buffaloes in the pasture and fly colourful kites with village kids. The villagers were incredibly hospitable, often inviting us to taste fresh honey and sticky rice cakes.',
    questions: [
      { q: 'Where did Nguyen spend his summer holiday?', options: ['A. In Ha Giang province', 'B. In Da Nang city', 'C. In Nha Trang', 'D. In Can Tho'], answer: 'A' },
      { q: 'How does Nguyen describe the village people?', options: ['A. Shy', 'B. Incredibly hospitable', 'C. Busy', 'D. Strict'], answer: 'B' }
    ]
  },
  {
    id: 'lab-03',
    grade: 9,
    unit: 'Unit 1: Local Community',
    title: 'Podcast: Preserving Traditional Handicrafts',
    audioScript: 'Good evening listeners. Today we visit Van Phuc Silk Village, located along the Nhue River in Ha Dong district. Famous for over a thousand years, Van Phuc silk is renowned for its lightness, softness, and vibrant colours. Although modern textile machines produce fabric faster, handmade silk remains irreplaceable. The village artisans are opening workshops to teach young apprentices how to preserve this cultural heritage.',
    questions: [
      { q: 'What is Van Phuc village famous for?', options: ['A. Ceramic pottery', 'B. Traditional silk', 'C. Bronze casting', 'D. Conical hats'], answer: 'B' },
      { q: 'How long has Van Phuc silk been famous?', options: ['A. For over 100 years', 'B. For about 500 years', 'C. For over 1000 years', 'D. For 200 years'], answer: 'C' }
    ]
  }
];

