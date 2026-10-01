// ================================================================
// data.js – Ngân hàng đề thi & câu hỏi mở rộng Tiếng Anh THCS Global Success
// Tác giả & Bản quyền: Thầy Đinh Văn Thành – Trường THCS Đồng Yên (0915.213717)
// Bám sát chương trình GDPT 2018 & CV 7991/BGDĐT-GDTrH
// ================================================================

const EXTRA_ENGLISH_QUESTIONS = [
  // ==============================================================
  // ── KHỐI 6: GLOBAL SUCCESS ────────────────────────────────────
  // ==============================================================
  // 1. Listening Grade 6 (Mi's future house - 5 MCQs)
  {
    id: 'en6-lis-003', grade: 6, subject: 'english', chapterId: 'en6u10', skill: 'listening',
    topic: 'Listening: Houses in the future', level: 'NB', type: 'mc',
    content: '[Listening] What type of house does Mi want to live in the future?',
    options: ['A. A comfortable country house with a big garden', 'B. A small apartment in the busy city', 'C. A houseboat on the river', 'D. A townhouse with two floors'],
    answer: 'A',
    solution: 'Giải thích: Dẫn chứng trong bài nghe: "I will live in a comfortable country house with a big green garden."'
  },
  {
    id: 'en6-lis-004', grade: 6, subject: 'english', chapterId: 'en6u10', skill: 'listening',
    topic: 'Listening: Houses in the future', level: 'TH', type: 'mc',
    content: '[Listening] Where will Mi\'s future house be located?',
    options: ['A. On the ocean', 'B. In a peaceful village', 'C. In the high mountains', 'D. In outer space'],
    answer: 'B',
    solution: 'Giải thích: Dẫn chứng bài nghe: "It will be in a peaceful village."'
  },
  {
    id: 'en6-lis-005', grade: 6, subject: 'english', chapterId: 'en6u10', skill: 'listening',
    topic: 'Listening: Houses in the future', level: 'TH', type: 'mc',
    content: '[Listening] How many bright rooms will there be in Mi\'s house?',
    options: ['A. Six', 'B. Seven', 'C. Eight', 'D. Five'],
    answer: 'A',
    solution: 'Giải thích: Dẫn chứng bài nghe: "There will be six bright rooms in the house with big windows."'
  },
  {
    id: 'en6-lis-006', grade: 6, subject: 'english', chapterId: 'en6u10', skill: 'listening',
    topic: 'Listening: Houses in the future', level: 'NB', type: 'mc',
    content: '[Listening] What will supply all the electricity for the house?',
    options: ['A. Coal and oil', 'B. Wind energy', 'C. Solar panels on the roof', 'D. Gas generator'],
    answer: 'C',
    solution: 'Giải thích: Dẫn chứng bài nghe: "Solar panels on the roof will supply all power."'
  },
  {
    id: 'en6-lis-007', grade: 6, subject: 'english', chapterId: 'en6u10', skill: 'listening',
    topic: 'Listening: Houses in the future', level: 'TH', type: 'mc',
    content: '[Listening] The future house will have a smart TV to ________.',
    options: ['A. play video games all day', 'B. contact friends easily', 'C. cook hot meals', 'D. clean the bedrooms'],
    answer: 'B',
    solution: 'Giải thích: Dẫn chứng bài nghe: "a smart TV will help me contact friends easily."'
  },

  // 2. Language Focus Grade 6
  {
    id: 'en6-ext-011', grade: 6, subject: 'english', chapterId: 'en6u10', skill: 'language',
    topic: 'Vocabulary: Future appliances', level: 'TH', type: 'mc',
    content: 'My future house will have a ________ to wash all my clothes automatically.',
    options: ['A. dishwasher', 'B. washing machine', 'C. wireless TV', 'D. smart clock'],
    answer: 'B',
    solution: 'Giải thích: Máy giặt quần áo là "washing machine".'
  },
  {
    id: 'en6-ext-012', grade: 6, subject: 'english', chapterId: 'en6u5', skill: 'language',
    topic: 'Vocabulary: Natural wonders', level: 'NB', type: 'mc',
    content: '"________" is the longest river in the world.',
    options: ['A. The Nile', 'B. The Amazon', 'C. The Mekong', 'D. The Red River'],
    answer: 'A',
    solution: 'Giải thích: Sông Nile (The Nile) là con sông dài nhất thế giới.'
  },
  {
    id: 'en6-ext-013', grade: 6, subject: 'english', chapterId: 'en6u8', skill: 'language',
    topic: 'Vocabulary: Sports & games', level: 'NB', type: 'mc',
    content: 'Pelé is considered one of the greatest ________ players in history.',
    options: ['A. football', 'B. tennis', 'C. chess', 'D. badminton'],
    answer: 'A',
    solution: 'Giải thích: Pelé là cầu thủ bóng đá (football player) huyền thoại của Brazil.'
  },
  {
    id: 'en6-ext-014', grade: 6, subject: 'english', chapterId: 'en6u10', skill: 'language',
    topic: 'Grammar: Future simple with will', level: 'TH', type: 'mc',
    content: '"Will robots cook our meals in the future?" - "________"',
    options: ['A. Yes, they do.', 'B. Yes, they will.', 'C. No, they aren\'t.', 'D. Yes, they are.'],
    answer: 'B',
    solution: 'Giải thích: Câu hỏi với "Will they...?" trả lời là "Yes, they will." hoặc "No, they won\'t."'
  },

  // ==============================================================
  // ── KHỐI 7: GLOBAL SUCCESS ────────────────────────────────────
  // ==============================================================
  // 1. Listening Grade 7 (Nick & Doctor - 5 MCQs)
  {
    id: 'en7-lis-003', grade: 7, subject: 'english', chapterId: 'en7u2', skill: 'listening',
    topic: 'Listening: Healthy Habits & Wellness', level: 'NB', type: 'mc',
    content: '[Listening] How does Nick feel when he visits the doctor?',
    options: ['A. He feels energetic', 'B. He feels very tired and his eyes hurt', 'C. He has a high fever', 'D. He has a stomachache'],
    answer: 'B',
    solution: 'Giải thích: Dẫn chứng trong bài nghe: "I feel very tired, and my eyes are hurting after studying on my computer."'
  },
  {
    id: 'en7-lis-004', grade: 7, subject: 'english', chapterId: 'en7u2', skill: 'listening',
    topic: 'Listening: Healthy Habits & Wellness', level: 'TH', type: 'mc',
    content: '[Listening] How many hours a day does Nick spend in front of computer screens?',
    options: ['A. One to two hours', 'B. About five to six hours', 'C. Only on weekends', 'D. Over ten hours'],
    answer: 'B',
    solution: 'Giải thích: Dẫn chứng trong bài nghe: "About five to six hours, especially in the evening."'
  },
  {
    id: 'en7-lis-005', grade: 7, subject: 'english', chapterId: 'en7u2', skill: 'listening',
    topic: 'Listening: Healthy Habits & Wellness', level: 'TH', type: 'mc',
    content: '[Listening] How often should Nick take a short break while studying on his computer?',
    options: ['A. Every thirty minutes', 'B. Every two hours', 'C. Once an evening', 'D. Every five minutes'],
    answer: 'A',
    solution: 'Giải thích: Bác sĩ khuyên: "You should take a short break every thirty minutes."'
  },
  {
    id: 'en7-lis-006', grade: 7, subject: 'english', chapterId: 'en7u2', skill: 'listening',
    topic: 'Listening: Healthy Habits & Wellness', level: 'NB', type: 'mc',
    content: '[Listening] What outdoor sports does the doctor advise Nick to join?',
    options: ['A. Swimming or judo', 'B. Badminton or football', 'C. Tennis or golf', 'D. Cycling or boxing'],
    answer: 'B',
    solution: 'Giải thích: Bác sĩ khuyên: "You should join an outdoor sports club, like badminton or football."'
  },
  {
    id: 'en7-lis-007', grade: 7, subject: 'english', chapterId: 'en7u2', skill: 'listening',
    topic: 'Listening: Healthy Habits & Wellness', level: 'NB', type: 'mc',
    content: '[Listening] What does the doctor remind Nick to drink plenty of each day?',
    options: ['A. Fruit soda', 'B. Fresh water', 'C. Coffee', 'D. Energy drinks'],
    answer: 'C',
    solution: 'Giải thích: Lời khuyên cuối của bác sĩ: "And remember to drink plenty of fresh water every day."'
  },

  // 2. Language Focus Grade 7 (Phát âm, Trọng âm, Từ vựng, Ngữ pháp)
  {
    id: 'en7-ext-011', grade: 7, subject: 'english', chapterId: 'en7u3', skill: 'language',
    topic: 'Pronunciation: Sound /t/, /d/, /ɪd/', level: 'NB', type: 'mc',
    content: 'Choose the word whose underlined part is pronounced differently from the others:',
    options: ['A. donat<u>ed</u>', 'B. plant<u>ed</u>', 'C. provid<u>ed</u>', 'D. clean<u>ed</u>'],
    answer: 'D',
    solution: 'Giải thích: donated, planted, provided tận cùng bằng /t/ hoặc /d/ nên -ed phát âm là /ɪd/. Cleaned phát âm là /d/.'
  },
  {
    id: 'en7-ext-012', grade: 7, subject: 'english', chapterId: 'en7u7', skill: 'language',
    topic: 'Pronunciation: Sound /e/ and /eɪ/', level: 'NB', type: 'mc',
    content: 'Choose the word whose underlined part is pronounced differently from the others:',
    options: ['A. s<u>a</u>fe', 'B. tr<u>a</u>ffic', 'C. pl<u>a</u>ne', 'D. st<u>a</u>tion'],
    answer: 'B',
    solution: 'Giải thích: safe, plane, station phát âm là /eɪ/. Traffic phát âm là /æ/.'
  },
  {
    id: 'en7-ext-013', grade: 7, subject: 'english', chapterId: 'en7u2', skill: 'language',
    topic: 'Vocabulary: Health & wellness', level: 'TH', type: 'mc',
    content: 'To prevent tooth decay, you should ________ your teeth twice a day.',
    options: ['A. brush', 'B. wash', 'C. sweep', 'D. tidy'],
    answer: 'A',
    solution: 'Giải thích: Đánh răng dùng cụm từ "brush one\'s teeth".'
  },
  {
    id: 'en7-ext-014', grade: 7, subject: 'english', chapterId: 'en7u7', skill: 'language',
    topic: 'Grammar: Distance with It', level: 'TH', type: 'mc',
    content: '________ is about 2 kilometres from my house to Dong Yen Secondary School.',
    options: ['A. There', 'B. This', 'C. It', 'D. Here'],
    answer: 'C',
    solution: 'Giải thích: Chủ ngữ giả "It" được dùng để chỉ khoảng cách: It is about ... km.'
  },
  {
    id: 'en7-ext-015', grade: 7, subject: 'english', chapterId: 'en7u8', skill: 'language',
    topic: 'Grammar: Connectors although', level: 'VD', type: 'mc',
    content: '________ he was exhausted, he still tried to complete all his English exercises.',
    options: ['A. Because', 'B. Although', 'C. However', 'D. Despite of'],
    answer: 'B',
    solution: 'Giải thích: Mệnh đề chỉ sự nhượng bộ / tương phản đi với "Although" + S + V.'
  },

  // 3. Reading Grade 7
  {
    id: 'en7-ext-021', grade: 7, subject: 'english', chapterId: 'en7u7', skill: 'reading',
    topic: 'Reading: Traffic and Road Safety', level: 'TH', type: 'mc',
    content: 'Read the passage and choose the best answer:\n\nRoad safety is an important issue for students everywhere. When walking to school, students should always use the pavement. If there is no pavement, they must walk on the left side of the road facing incoming vehicles. When riding a bicycle, cyclists should stay in the cycle lane and never carry more than one passenger. Wearing a certified safety helmet is compulsory for all motorbike passengers, including teenagers. By obeying these traffic rules strictly, students can protect themselves and reduce road accidents significantly.\n\nWhat should students do if there is no pavement to walk on?',
    options: ['A. Walk in the middle of the road', 'B. Walk on the left side facing traffic', 'C. Walk on the right side with traffic', 'D. Run as fast as possible across the street'],
    answer: 'B',
    solution: 'Giải thích: Dẫn chứng trong bài đọc: "If there is no pavement, they must walk on the left side of the road facing incoming vehicles."'
  },
  {
    id: 'en7-ext-022', grade: 7, subject: 'english', chapterId: 'en7u7', skill: 'reading',
    topic: 'Reading: Traffic and Road Safety', level: 'NB', type: 'mc',
    content: 'According to the passage, who must wear a certified safety helmet?',
    options: ['A. Only adult drivers', 'B. All motorbike passengers, including teenagers', 'C. Only bicycle riders', 'D. Only traffic policemen'],
    answer: 'B',
    solution: 'Giải thích: Dẫn chứng trong bài: "Wearing a certified safety helmet is compulsory for all motorbike passengers, including teenagers."'
  },

  // 4. Writing Grade 7
  {
    id: 'en7-ext-031', grade: 7, subject: 'english', chapterId: 'en7u4', skill: 'writing',
    topic: 'Grammar: Comparison with as...as', level: 'VD', type: 'essay',
    content: 'Rewrite the sentence using "as ... as":\n"Playing badminton is more popular than playing tennis in my school."\n➔ Playing tennis is not ...................................................................................',
    solution: 'Playing tennis is not as popular as playing badminton in my school.'
  },
  {
    id: 'en7-ext-032', grade: 7, subject: 'english', chapterId: 'en7u7', skill: 'writing',
    topic: 'Grammar: Sentence transformation with How far', level: 'VD', type: 'essay',
    content: 'Make a question for the underlined words:\n"It is <u>about 3 kilometres</u> from my village to the district hospital."\n➔ How far ....................................................................................................?',
    solution: 'How far is it from your village to the district hospital?'
  },

  // ==============================================================
  // ── KHỐI 8: GLOBAL SUCCESS ────────────────────────────────────
  // ==============================================================
  // 1. Listening Grade 8 (Tay ethnic stilt houses - 5 MCQs)
  {
    id: 'en8-lis-003', grade: 8, subject: 'english', chapterId: 'en8u4', skill: 'listening',
    topic: 'Listening: Ethnic Groups of Viet Nam', level: 'NB', type: 'mc',
    content: '[Listening] The Tay are the ________ largest ethnic group in Viet Nam.',
    options: ['A. first', 'B. second', 'C. third', 'D. fourth'],
    answer: 'B',
    solution: 'Giải thích: Dẫn chứng trong bài nghe: "The Tay are the second largest ethnic group in Viet Nam."'
  },
  {
    id: 'en8-lis-004', grade: 8, subject: 'english', chapterId: 'en8u4', skill: 'listening',
    topic: 'Listening: Ethnic Groups of Viet Nam', level: 'TH', type: 'mc',
    content: '[Listening] Where do the Tay people mainly live in Viet Nam?',
    options: ['A. In coastal provinces', 'B. In the valleys of Northern provinces', 'C. In the Central Highlands', 'D. In the Mekong Delta'],
    answer: 'B',
    solution: 'Giải thích: Dẫn chứng bài nghe: "living mostly in the valleys of Cao Bang, Lang Son, and Tuyen Quang provinces."'
  },
  {
    id: 'en8-lis-005', grade: 8, subject: 'english', chapterId: 'en8u4', skill: 'listening',
    topic: 'Listening: Ethnic Groups of Viet Nam', level: 'NB', type: 'mc',
    content: '[Listening] What do the Tay people use to build their traditional stilt houses?',
    options: ['A. Bricks and cement', 'B. Wood and bamboo', 'C. Steel and glass', 'D. Mud and straw'],
    answer: 'B',
    solution: 'Giải thích: Dẫn chứng bài nghe: "The Tay build stilt houses made of wood and bamboo."'
  },
  {
    id: 'en8-lis-006', grade: 8, subject: 'english', chapterId: 'en8u4', skill: 'listening',
    topic: 'Listening: Ethnic Groups of Viet Nam', level: 'TH', type: 'mc',
    content: '[Listening] Why do the Tay people build houses on stilts?',
    options: ['A. To protect family members from wild animals and damp weather', 'B. To look over the high mountains', 'C. To save construction time', 'D. To catch river fish easily'],
    answer: 'A',
    solution: 'Giải thích: Dẫn chứng bài nghe: "These stilt houses protect family members from wild animals and damp weather during the rainy season."'
  },
  {
    id: 'en8-lis-007', grade: 8, subject: 'english', chapterId: 'en8u4', skill: 'listening',
    topic: 'Listening: Ethnic Groups of Viet Nam', level: 'NB', type: 'mc',
    content: '[Listening] What are Tay women famously skilled at making?',
    options: ['A. Pottery bowls', 'B. Brocade cloth with intricate patterns', 'C. Bamboo flutes', 'D. Conical hats'],
    answer: 'B',
    solution: 'Giải thích: Dẫn chứng bài nghe: "The Tay women are famous for weaving brocade cloth with intricate geometric patterns."'
  },

  // ==============================================================
  // ── KHỐI 9: GLOBAL SUCCESS ────────────────────────────────────
  // ==============================================================
  // 1. Listening Grade 9 (Van Phuc Silk Village - 5 MCQs)
  {
    id: 'en9-lis-003', grade: 9, subject: 'english', chapterId: 'en9u1', skill: 'listening',
    topic: 'Listening: Local Community & Handicrafts', level: 'NB', type: 'mc',
    content: '[Listening] Where is Van Phuc Silk Village located?',
    options: ['A. In Bat Trang district', 'B. In Ha Dong district', 'C. In Dong Anh district', 'D. In Soc Son district'],
    answer: 'B',
    solution: 'Giải thích: Dẫn chứng bài nghe: "Today we visit Van Phuc Silk Village, located along the Nhue River in Ha Dong district."'
  },
  {
    id: 'en9-lis-004', grade: 9, subject: 'english', chapterId: 'en9u1', skill: 'listening',
    topic: 'Listening: Local Community & Handicrafts', level: 'TH', type: 'mc',
    content: '[Listening] How long has Van Phuc silk been famous for its fine quality?',
    options: ['A. For over 100 years', 'B. For about 500 years', 'C. For over a thousand years', 'D. For 200 years'],
    answer: 'C',
    solution: 'Giải thích: Dẫn chứng bài nghe: "Famous for over a thousand years, Van Phuc silk is renowned for its lightness, softness, and vibrant colours."'
  },
  {
    id: 'en9-lis-005', grade: 9, subject: 'english', chapterId: 'en9u1', skill: 'listening',
    topic: 'Listening: Local Community & Handicrafts', level: 'TH', type: 'mc',
    content: '[Listening] What are village artisans doing to preserve their traditional handicraft?',
    options: ['A. Moving to big cities', 'B. Opening workshops to teach young apprentices', 'C. Selling old machines', 'D. Closing their village shops'],
    answer: 'B',
    solution: 'Giải thích: Dẫn chứng bài nghe: "The village artisans are opening workshops to teach young apprentices how to preserve this cultural heritage."'
  }
];

// Nạp tự động vào QUESTION_BANK khi khởi chạy
if (typeof QUESTION_BANK !== 'undefined' && Array.isArray(QUESTION_BANK)) {
  EXTRA_ENGLISH_QUESTIONS.forEach(eq => {
    if (!QUESTION_BANK.some(q => q.id === eq.id)) {
      QUESTION_BANK.push(eq);
    }
  });
}
