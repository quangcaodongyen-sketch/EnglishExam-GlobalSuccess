// ================================================================
// knowledge_bank.js – Tinh Hoa Tri Thức Tiếng Anh THCS Global Success (6 - 9)
// Tác giả & Bản quyền: Thầy Đinh Văn Thành – Trường THCS Đồng Yên (0915.213717)
// Tích hợp: Ngữ pháp Thần tốc, Bí kíp Ngữ âm & Trọng âm, Kho Đoạn văn mẫu điểm 9-10
// ================================================================

// ── 1. CẨM NANG NGỮ PHÁP THẦN TỐC (GRAMMAR MASTERY HUB) ───────────
const GLOBAL_GRAMMAR_MASTER = [
  {
    id: 'gm-01',
    grade: 6,
    unit: 'Unit 1 & 2',
    title: '1. Thì Hiện Tại Đơn (Present Simple)',
    tag: 'Cốt lõi Lớp 6',
    formula: '• Khẳng định: S + V(s/es) | S (he/she/it) + V-s/es; S (I/we/you/they) + V-inf\n• Phủ định: S + do not / does not + V-inf\n• Nghi vấn: Do / Does + S + V-inf?',
    magicRule: '🎯 Thần chú nhận biết: "Always, usually, often, sometimes, never, every day/week/year, in the morning". Dùng cho sự thật hiển nhiên, thói quen lặp đi lặp lại.',
    keyPoints: [
      'Động từ tận cùng o, s, z, ch, x, sh thêm "-es" (Mẹo: Ông Sáu Zà Chạy Xe Sh).',
      'Động từ tận cùng phụ âm + y ➞ đổi y thành -ies (study ➞ studies).'
    ],
    example: 'He usually walks to school every morning. / My sister studies English very hard.',
    quiz: [
      {
        q: 'Lan ________ cycling around the lake with her best friends every weekend.',
        opts: ['A. enjoy', 'B. enjoys', 'C. enjoying', 'D. enjoyed'],
        ans: 'B',
        exp: 'Chủ ngữ "Lan" là ngôi thứ 3 số ít, có dấu hiệu "every weekend" ➞ dùng động từ thêm -s: "enjoys".'
      },
      {
        q: 'Look! The students ________ uniform today because it is Monday.',
        opts: ['A. wears', 'B. wear', 'C. are wearing', 'D. wore'],
        ans: 'C',
        exp: 'Dấu hiệu "Look!" chỉ hành động đang diễn ra tại thời điểm nói ➞ dùng Hiện tại tiếp diễn: "are wearing".'
      }
    ]
  },
  {
    id: 'gm-02',
    grade: 6,
    unit: 'Unit 4 & 5',
    title: '2. Cấu Trúc So Sánh Tính Từ (Comparatives & Superlatives)',
    tag: 'Cốt lõi Lớp 6-7',
    formula: '• So sánh hơn ngắn: S1 + be + adj-er + than + S2\n• So sánh hơn dài: S1 + be + more + adj + than + S2\n• So sánh nhất: S + be + the + adj-est (ngắn) / the most + adj (dài)',
    magicRule: '🎯 Thần chú: Ngắn thêm -er, dài thêm more. Có "than" dùng so sánh hơn; có "the" hoặc "of all / in the world" dùng so sánh nhất!',
    keyPoints: [
      'Tính từ đặc biệt: good ➞ better ➞ the best; bad ➞ worse ➞ the worst; far ➞ farther/further ➞ the farthest/furthest.',
      'Tính từ 2 âm tiết tận cùng -y coi như ngắn: happy ➞ happier; noisy ➞ noisier.'
    ],
    example: 'Da Nang is cleaner than Hai Phong. / Mount Everest is the highest mountain in the world.',
    quiz: [
      {
        q: 'Living in the countryside is ________ peaceful than living in a crowded metropolis.',
        opts: ['A. much', 'B. more', 'C. most', 'D. as'],
        ans: 'B',
        exp: '"peaceful" là tính từ dài, phía sau có "than" ➞ dùng "more peaceful".'
      },
      {
        q: 'Which city is the ________ modern in Viet Nam?',
        opts: ['A. more', 'B. most', 'C. best', 'D. much'],
        ans: 'B',
        exp: 'Trước tính từ dài "modern" có mạo từ "the" ➞ so sánh nhất dùng "the most modern".'
      }
    ]
  },
  {
    id: 'gm-03',
    grade: 6,
    unit: 'Unit 10 & 11',
    title: '3. Động Từ Khuyết Thiếu & Tương Lai Đơn (Will & Conditional Type 1)',
    tag: 'Trọng tâm Lớp 6-7',
    formula: '• Will: S + will / won\'t + V-inf (Dự đoán, lời hứa, quyết định tức thì)\n• If loại 1: If + S + V(hiện tại đơn), S + will / can + V-inf',
    magicRule: '🎯 Thần chú: Mệnh đề If dùng HIỆN TẠI ĐƠN, Mệnh đề chính dùng WILL + NGUYÊN THỂ. Tuyệt đối không dùng will ngay sau If!',
    keyPoints: [
      'Unless = If ... not (Trừ khi / Nếu không). Ví dụ: Unless you study hard = If you don\'t study hard.',
      'should/shouldn\'t: Lời khuyên (You should eat more vegetables).',
      'must/mustn\'t: Bắt buộc hoặc cấm đoán (You mustn\'t litter).'
    ],
    example: 'If we plant more green trees, our living environment will be fresher.',
    quiz: [
      {
        q: 'If we ________ electricity, we will help save natural energy resources.',
        opts: ['A. save', 'B. saved', 'C. will save', 'D. saving'],
        ans: 'A',
        exp: 'Mệnh đề If loại 1 chia thì hiện tại đơn với chủ ngữ "we" ➞ chọn "save".'
      }
    ]
  },
  {
    id: 'gm-04',
    grade: 7,
    unit: 'Unit 1 & 2',
    title: '4. Động Từ Chỉ Sự Yêu Thích & Quá Khứ Đơn (Verbs of Liking & Past Simple)',
    tag: 'Trọng tâm Lớp 7',
    formula: '• Liking: S + like / love / enjoy / fancy / adore / prefer + V-ing\n• Disliking: S + hate / dislike / detest + V-ing\n• Past Simple: S + V2/ed | S + didn\'t + V-inf | Did + S + V-inf?',
    magicRule: '🎯 Thần chú: Cứ sau "like/enjoy/fond of/keen on" là phải có ĐUÔI -ING! Dấu hiệu Quá khứ: "yesterday, last, ago, in + năm quá khứ".',
    keyPoints: [
      'Tương đương: like V-ing = be interested in V-ing = be fond of V-ing = be keen on V-ing.',
      'Cấu trúc used to + V-inf: Đã từng làm gì trong quá khứ (nay không còn nữa).'
    ],
    example: 'She enjoys arranging flowers in her spare time. / Lan used to walk to school when she was small.',
    quiz: [
      {
        q: 'My younger brother is keen on ________ models of smart robots from recycled cardboard.',
        opts: ['A. to make', 'B. making', 'C. make', 'D. made'],
        ans: 'B',
        exp: 'Sau cụm "be keen on" (thích) đi với V-ing ➞ chọn "making".'
      },
      {
        q: 'They ________ hundreds of warm coats to poor mountain children last winter.',
        opts: ['A. donate', 'B. donated', 'C. will donate', 'D. are donating'],
        ans: 'B',
        exp: 'Dấu hiệu "last winter" (mùa đông năm ngoái) ➞ thì Quá khứ đơn: "donated".'
      }
    ]
  },
  {
    id: 'gm-05',
    grade: 7,
    unit: 'Unit 7 & 8',
    title: '5. Liên Từ Chỉ Nhượng Bộ & Nguyên Nhân (Although, Despite, Because, So)',
    tag: 'Trọng tâm Lớp 7-8',
    formula: '• Although / Even though / Though + Mệnh đề (S + V)\n• Despite / In spite of + Noun Phrase (Cụm danh từ) / V-ing\n• Because + Mệnh đề (Nguyên nhân) ➞ So + Mệnh đề (Kết quả)',
    magicRule: '🎯 Thần chú: Có Although thì KHÔNG DÙNG BUT; Có Because thì KHÔNG DÙNG SO! After Although là CÂU (S+V), after Despite là CỤM TỪ (Noun/V-ing).',
    keyPoints: [
      'Chuyển đổi: Although it rained heavily ➞ Despite the heavy rain.',
      'Chuyển đổi: Because it was cold, we wore warm coats ➞ It was cold, so we wore warm coats.'
    ],
    example: 'Although the weather was freezing, they still participated in the school sports festival.',
    quiz: [
      {
        q: '________ the film was nominated for Oscars, many viewers found it quite slow.',
        opts: ['A. Although', 'B. Because', 'C. Despite', 'D. However'],
        ans: 'A',
        exp: 'Phía sau là mệnh đề đầy đủ "the film was nominated..." chỉ sự tương phản ➞ dùng "Although".'
      },
      {
        q: 'It was very noisy outside, ________ I could not focus on my English revision.',
        opts: ['A. because', 'B. so', 'C. although', 'D. but'],
        ans: 'B',
        exp: 'Mệnh đề sau chỉ kết quả "vì vậy" ➞ chọn "so".'
      }
    ]
  },
  {
    id: 'gm-06',
    grade: 8,
    unit: 'Unit 1 & 2',
    title: '6. So Sánh Phó Từ & Câu Ghép, Câu Phức (Adverbs Comparison & Compound Sentences)',
    tag: 'Trọng tâm Lớp 8',
    formula: '• So sánh phó từ: S1 + V(thường) + more + adv + than + S2 (nhanh hơn: faster, chăm hơn: harder)\n• Câu ghép FANBOYS: For, And, Nor, But, Or, Yet, So (ngăn cách bằng dấu phẩy)\n• Quá khứ tiếp diễn: S + was/were + V-ing (hành động đang xảy ra tại thời điểm xác định)',
    magicRule: '🎯 Thần chú: Động từ to be đi với Tính từ (is beautiful); Động từ thường đi với Phó từ (sings beautifully). Khi While/When kết hợp: Hành động đang diễn ra chia Tiếp diễn (was/were V-ing), hành động chen ngang chia Quá khứ đơn (V2/ed).',
    keyPoints: [
      'Phó từ đặc biệt: fast ➞ faster; hard ➞ harder; early ➞ earlier; well ➞ better; badly ➞ worse.',
      'Công thức While: While S1 + was/were + V-ing, S2 + was/were + V-ing (hai hành động song song).'
    ],
    example: 'Farmers in the village work much harder than city workers during harvest time.',
    quiz: [
      {
        q: 'While my mother was cooking dinner in the kitchen, my father ________ the newspaper.',
        opts: ['A. is reading', 'B. was reading', 'C. read', 'D. reads'],
        ans: 'B',
        exp: 'Hai hành động diễn ra song song trong quá khứ với "While" ➞ chia Quá khứ tiếp diễn: "was reading".'
      }
    ]
  },
  {
    id: 'gm-07',
    grade: 8,
    unit: 'Unit 11 & 12',
    title: '7. Câu Gián Tiếp / Tường Thuật (Reported Speech)',
    tag: 'Trọng tâm Lớp 8-9',
    formula: '• Câu kể: S + said (that) + S\' + V (lùi 1 thì)\n• Câu hỏi Yes/No: S + asked + O + if / whether + S\' + V (lùi thì)\n• Câu hỏi Wh-: S + asked + O + Wh-word + S\' + V (lùi thì)',
    magicRule: '🎯 Thần chú 3 bước: 1. Đổi đại từ nhân xưng; 2. Lùi 1 thì (Hiện tại ➞ Quá khứ; will ➞ would; can ➞ could); 3. Đổi trạng từ chỉ thời gian/nơi chốn (now ➞ then; today ➞ that day; tomorrow ➞ the following day; here ➞ there).',
    keyPoints: [
      'Câu hỏi gián tiếp KHÔNG đảo ngữ trợ động từ (trật tự là S + V, không có do/does/did).',
      'said to me ➞ told me.'
    ],
    example: '"I will travel to Mars next year," said Tom. ➞ Tom said that he would travel to Mars the following year.',
    quiz: [
      {
        q: 'Nick asked Mary if she ________ any traditional festivals in the northern mountains.',
        opts: ['A. visits', 'B. visited', 'C. will visit', 'D. is visiting'],
        ans: 'B',
        exp: 'Trong câu gián tiếp lùi thì từ Hiện tại đơn về Quá khứ đơn ➞ chọn "visited".'
      }
    ]
  },
  {
    id: 'gm-08',
    grade: 9,
    unit: 'Unit 1 & 2',
    title: '8. Cụm Động Từ & So Sánh Kép (Phrasal Verbs & Double Comparatives)',
    tag: 'Đặc sản Lớp 9',
    formula: '• Phrasal Verbs: V + Preposition (mang nghĩa mới hoàn toàn)\n• So sánh kép: The + comp (adj/adv) + S1 + V1, the + comp (adj/adv) + S2 + V2 (Càng... thì càng...)',
    magicRule: '🎯 Thần chú: "The more... the more...". Nhớ các cụm hay thi: pass down (truyền lại), look forward to V-ing (mong đợi), deal with (giải quyết), live on (sống dựa vào), face up to (đối mặt).',
    keyPoints: [
      'The harder you study, the higher marks you will get.',
      'The older we grow, the more experienced we become.'
    ],
    example: 'Traditional craft skills have been passed down from generation to generation.',
    quiz: [
      {
        q: 'The more English books you read, the ________ your vocabulary becomes.',
        opts: ['A. rich', 'B. richer', 'C. richest', 'D. more rich'],
        ans: 'B',
        exp: 'Cấu trúc so sánh kép "The + so sánh hơn, the + so sánh hơn" với tính từ ngắn "rich" ➞ "the richer".'
      },
      {
        q: 'Many traditional pottery villages in our province are at risk of dying ________.',
        opts: ['A. out', 'B. in', 'C. on', 'D. of'],
        ans: 'A',
        exp: 'Cụm động từ "die out" nghĩa là tuyệt chủng, mai một, biến mất.'
      }
    ]
  },
  {
    id: 'gm-09',
    grade: 9,
    unit: 'Unit 3 & 4',
    title: '9. Từ Để Hỏi Trước To-Infinitive & Câu Ước Wish (Wh-words + To-inf & Wish)',
    tag: 'Đặc sản Lớp 9',
    formula: '• Wh-word + to-inf: S + know / tell / decide / wonder + what/where/how/who + to-V\n• Wish ở hiện tại: S + wish(es) + S\' + V-past (to be dùng "were" cho mọi ngôi)',
    magicRule: '🎯 Thần chú: Sau wish ở hiện tại, động từ PHẢI LÙI VỀ QUÁ KHỨ (V2/ed hoặc were). Không bao giờ dùng thì hiện tại sau wish!',
    keyPoints: [
      'I don\'t know who to talk to about my study stress = I don\'t know who I should talk to.',
      'I wish I were taller. (Ước cho điều không có thật ở hiện tại).'
    ],
    example: 'She wishes she could speak English as fluently as a native speaker.',
    quiz: [
      {
        q: 'I cannot participate in the international debate competition. ➞ I wish I ________ participate in it.',
        opts: ['A. can', 'B. could', 'C. will', 'D. am able to'],
        ans: 'B',
        exp: 'Câu ước ở hiện tại với "can" ➞ lùi về "could".'
      },
      {
        q: 'She asked her teacher where ________ reliable reference materials for the project.',
        opts: ['A. to find', 'B. finding', 'C. found', 'D. find'],
        ans: 'A',
        exp: 'Cấu trúc Wh-word + to-infinitive: "where to find".'
      }
    ]
  },
  {
    id: 'gm-10',
    grade: 9,
    unit: 'Unit 5 & 6',
    title: '10. Câu Bị Động Khách Quan & Mệnh Đề Quan Hệ (Impersonal Passive & Relative Clauses)',
    tag: 'Đặc sản Lớp 9',
    formula: '• Bị động khách quan: It is said / believed / reported that + S + V\n• Mệnh đề quan hệ: Who (người, làm chủ ngữ), Whom (người, làm tân ngữ), Which (vật), That (thay thế cho cả who/which), Whose (sở hữu + danh từ)',
    magicRule: '🎯 Thần chú: "Người Who - Vật Which - Sở hữu Whose". Có dấu phẩy (mệnh đề không xác định) hoặc sau giới từ thì TUYỆT ĐỐI KHÔNG DÙNG THAT!',
    keyPoints: [
      'People say that Ha Long Bay is magnificent ➞ It is said that Ha Long Bay is magnificent.',
      'The artisan whose workshop we visited yesterday is very talented.'
    ],
    example: 'Da Nang is a coastal city which attracts millions of international tourists every year.',
    quiz: [
      {
        q: 'The dedicated teacher ________ teaches us English literature won the municipal excellent educator award.',
        opts: ['A. which', 'B. who', 'C. whom', 'D. whose'],
        ans: 'B',
        exp: 'Thay thế cho danh từ chỉ người "The dedicated teacher" làm chủ ngữ của mệnh đề ➞ dùng "who".'
      },
      {
        q: 'People believe that Son Doong is the largest cave on Earth. ➞ It ________ that Son Doong is the largest cave on Earth.',
        opts: ['A. is believed', 'B. was believed', 'C. believes', 'D. is believing'],
        ans: 'A',
        exp: 'Cấu trúc bị động khách quan thì hiện tại: "It is believed that...".'
      }
    ]
  }
];

// ── 2. BÍ KÍP NGỮ ÂM & TRỌNG ÂM ĐIỂM 10 (PHONETICS & STRESS) ──────
const GLOBAL_PHONETICS_MASTER = {
  rules: [
    {
      title: 'Quy tắc 1: Phát âm đuôi -s / -es (Phổ biến nhất trong đề thi)',
      tag: 'Bắt buộc nhớ',
      explanation: 'Khi thêm đuôi -s / -es vào danh từ số nhiều hoặc động từ ngôi thứ 3 số ít, có 3 cách phát âm:',
      cases: [
        {
          sound: '/s/',
          rule: 'Sau các âm vô thanh: /p/, /t/, /k/, /f/, /θ/',
          mnemonic: '💡 Thần chú: "Thời phong kiến phương Tây" (Th-P-K-Ph-T)',
          words: ['stops /s/', 'hats /s/', 'books /s/', 'laughs /f/ ➞ /s/', 'months /θ/ ➞ /s/']
        },
        {
          sound: '/iz/',
          rule: 'Sau các âm xuýt / gió: /s/, /z/, /ʃ/, /tʃ/, /dʒ/, /ʒ/ (tận cùng: s, ss, ch, sh, x, z, ge, ce)',
          mnemonic: '💡 Thần chú: "Sông sâu sóng sánh chán sợ zì"',
          words: ['watches /iz/', 'boxes /iz/', 'classes /iz/', 'washes /iz/', 'bridges /iz/', 'places /iz/']
        },
        {
          sound: '/z/',
          rule: 'Sau tất cả các nguyên âm và phụ âm hữu thanh còn lại (b, d, g, v, m, n, l, r, w, y...)',
          mnemonic: '💡 Âm rung cổ họng',
          words: ['plays /z/', 'pens /z/', 'rooms /z/', 'bags /z/', 'cars /z/', 'dogs /z/']
        }
      ]
    },
    {
      title: 'Quy tắc 2: Phát âm đuôi -ed (Quá khứ & Phân từ)',
      tag: 'Bắt buộc nhớ',
      explanation: 'Đuôi -ed có 3 cách phát âm cực kỳ rõ ràng, không bao giờ nhầm lẫn:',
      cases: [
        {
          sound: '/id/',
          rule: 'Sau hai âm: /t/ và /d/',
          mnemonic: '💡 Thần chú: "Tiền Đô" (T-Đ)',
          words: ['wanted /id/', 'needed /id/', 'decided /id/', 'visited /id/', 'started /id/']
        },
        {
          sound: '/t/',
          rule: 'Sau các âm vô thanh: /p/, /k/, /f/, /s/, /ʃ/, /tʃ/',
          mnemonic: '💡 Thần chú: "Chính phủ Pháp không sợ thua" (Ch-P-Ph-K-S-Th)',
          words: ['stopped /t/', 'looked /t/', 'laughed /t/', 'washed /t/', 'watched /t/', 'danced /t/']
        },
        {
          sound: '/d/',
          rule: 'Sau tất cả các nguyên âm và phụ âm hữu thanh còn lại',
          mnemonic: '💡 Âm rung cổ họng',
          words: ['played /d/', 'cleaned /d/', 'lived /d/', 'opened /d/', 'studied /d/']
        }
      ]
    },
    {
      title: 'Quy tắc 3: Trọng âm từ 2 âm tiết',
      tag: 'Quy luật cốt lõi',
      explanation: 'Xác định từ loại để tìm trọng âm chính xác:',
      cases: [
        {
          sound: 'Âm tiết 1',
          rule: 'Hầu hết Danh từ (Noun) và Tính từ (Adj) 2 âm tiết có trọng âm rơi vào âm tiết THỨ NHẤT.',
          mnemonic: '💡 Ví dụ: \'teacher, \'student, \'village, \'mountain, \'happy, \'clever, \'famous',
          words: ['\'standard', '\'custom', '\'culture', '\'peaceful', '\'healthy']
        },
        {
          sound: 'Âm tiết 2',
          rule: 'Hầu hết Động từ (Verb) 2 âm tiết có trọng âm rơi vào âm tiết THỨ HAI.',
          mnemonic: '💡 Ví dụ: re\'ceive, de\'cide, pro\'tect, re\'duce, en\'joy, ar\'rive',
          words: ['in\'vent', 'pre\'pare', 'don\'ate', 'for\'get']
        },
        {
          sound: '⚠️ Ngoại lệ',
          rule: 'Các từ cần ghi nhớ đặc biệt vì hay xuất hiện để bẫy điểm 10:',
          mnemonic: '💡 Danh từ nhấn âm 2: ma\'chine, ho\'tel, po\'lice, gui\'tar. Động từ nhấn âm 1: \'visit, \'happen, \'listen, \'open.',
          words: ['ma\'chine (n, âm 2)', 'ho\'tel (n, âm 2)', '\'visit (v, âm 1)', '\'listen (v, âm 1)']
        }
      ]
    },
    {
      title: 'Quy tắc 4: Trọng âm từ 3 âm tiết & Hậu tố',
      tag: 'Nâng cao Lớp 8-9',
      explanation: 'Nhìn vào đuôi hậu tố để định vị ngay trọng âm:',
      cases: [
        {
          sound: 'Rơi vào âm trước nó',
          rule: 'Từ tận cùng bằng: -tion, -sion, -ic, -ity, -ance, -ence ➞ trọng âm rơi vào âm TIẾT NGAY TRƯỚC NÓ.',
          mnemonic: '💡 Ví dụ: pol\'lution, de\'cision, tra\'dition, e\'lectric, a\'ctivity, im\'portance',
          words: ['pro\'tection', 'sci\'entific', 'com\'munity', 'per\'formance']
        },
        {
          sound: 'Rơi vào âm thứ 3 từ dưới lên',
          rule: 'Từ tận cùng bằng: -ate, -ise/-ize, -y, -cal ➞ trọng âm rơi vào âm tiết THỨ 3 TỪ PHẢI SANG TRÁI.',
          mnemonic: '💡 Ví dụ: \'celebrate, \'organise, \'generous, \'difficult',
          words: ['\'participate', '\'celebrate', '\'chemistry']
        }
      ]
    }
  ],
  exercises: [
    {
      q: 'Chọn từ có phần gạch chân phát âm khác với các từ còn lại:',
      opts: ['A. play<u>ed</u>', 'B. clean<u>ed</u>', 'C. help<u>ed</u>', 'D. open<u>ed</u>'],
      ans: 'C',
      exp: 'helped đuôi /t/ (vì sau /p/), các từ còn lại đuôi /d/.'
    },
    {
      q: 'Chọn từ có phần gạch chân phát âm khác với các từ còn lại:',
      opts: ['A. book<u>s</u>', 'B. cat<u>s</u>', 'C. dog<u>s</u>', 'D. stop<u>s</u>'],
      ans: 'C',
      exp: 'dogs đuôi /z/, các từ còn lại đuôi /s/ (sau phụ âm vô thanh k, t, p).'
    },
    {
      q: 'Chọn từ có trọng âm chính rơi vào vị trí khác với các từ còn lại:',
      opts: ['A. \'culture', 'B. \'village', 'C. re\'duce', 'D. \'famous'],
      ans: 'C',
      exp: 'reduce là động từ 2 âm tiết nhấn âm 2; culture, village, famous là danh từ/tính từ nhấn âm 1.'
    },
    {
      q: 'Chọn từ có trọng âm chính rơi vào vị trí khác với các từ còn lại:',
      opts: ['A. pol\'lution', 'B. tra\'dition', 'C. \'celebrate', 'D. pro\'tection'],
      ans: 'C',
      exp: 'celebrate nhấn âm 1 (-ate âm 3 từ dưới); pollution, tradition, protection có đuôi -tion nhấn âm ngay trước (âm 2).'
    }
  ]
};

// ── 3. KHO ĐOẠN VĂN MẪU ĐIỂM 9-10 & PHƯƠNG PHÁP VIẾT 80-100 TỪ ───
const GLOBAL_WRITING_MASTER = [
  {
    grade: 6,
    unit: 'Unit 1: My New School',
    topic: 'Write a paragraph (60-80 words) about your new school.',
    cues: 'Name of school, location, number of classes/students, facilities, teachers and classmates, your feelings.',
    vietnameseTranslation: 'Tôi là học sinh lớp 6 tại trường THCS Đồng Yên. Trường của tôi rất khang trang và sạch đẹp với sân chơi rộng rãi rợp bóng cây xanh. Có 16 phòng học sáng sủa, một phòng thực hành Tin học hiện đại và một thư viện lớn với hàng nghìn cuốn sách bổ ích. Các thầy cô giáo đều vô cùng tận tụy, luôn giảng bài dễ hiểu và yêu thương học sinh. Bạn bè trong lớp em rất hòa đồng và sẵn sàng giúp đỡ nhau trong học tập. Em vô cùng tự hào và yêu quý mái trường thân yêu của mình.',
    essay: `I am a grade 6 student at Dong Yen Secondary School. My school is large, modern, and beautiful with a green playground. There are sixteen bright classrooms, an advanced computer laboratory, and a library with thousands of fascinating books. All teachers are extremely dedicated and caring, while my classmates are friendly and helpful. I love my school very much because every school day is an exciting journey of discovery.`,
    collocations: ['advanced computer laboratory', 'fascinating books', 'extremely dedicated', 'friendly and helpful', 'journey of discovery'],
    tips: 'Bắt đầu bằng câu giới thiệu trường; sử dụng tính từ tích cực (large, modern, dedicated); kết đoạn bằng cảm nghĩ tự hào.'
  },
  {
    grade: 7,
    unit: 'Unit 1 & 2: Healthy Living & Hobbies',
    topic: 'Write a paragraph (70-90 words) about your favourite hobby and its health benefits.',
    cues: 'What your hobby is, when you started it, how often you do it, benefits for physical and mental health.',
    vietnameseTranslation: 'Sở thích lành mạnh nhất của em là chơi cầu lông cùng các bạn vào mỗi buổi chiều sau giờ học. Em bắt đầu chơi môn thể thao này cách đây hai năm khi lên lớp 6. Chơi cầu lông thường xuyên giúp em giữ vóc dáng cân đối, tăng cường sức bền và giải tỏa căng thẳng sau những giờ học tập căng thẳng. Ngoài ra, nó còn giúp em rèn luyện tinh thần đồng đội và kết thêm nhiều bạn tốt. Em tin rằng duy trì một sở thích thể thao là bí quyết vàng để có một lối sống khỏe mạnh.',
    essay: `My favourite hobby is playing badminton with my classmates every afternoon after school. I took up this exciting sport two years ago. Playing badminton regularly helps me stay in good shape, build muscle endurance, and relieve stress after busy study hours. Moreover, it teaches me valuable teamwork skills and connects me with great friends. In conclusion, maintaining an active sport hobby is a wonderful way to enjoy a balanced and energetic lifestyle.`,
    collocations: ['took up an exciting sport', 'stay in good shape', 'relieve stress', 'valuable teamwork skills', 'balanced and energetic lifestyle'],
    tips: 'Dùng cấu trúc take up a hobby (bắt đầu một sở thích); dùng liên từ Moreover, In conclusion để tạo mạch văn logic.'
  },
  {
    grade: 7,
    unit: 'Unit 3: Community Service',
    topic: 'Write a paragraph (70-90 words) about volunteer activities students can do to help the community.',
    cues: 'Name of activities (planting trees, donating books, cleaning streets), why they are important, how you feel.',
    vietnameseTranslation: 'Tham gia các hoạt động vì cộng đồng mang lại nhiều ý nghĩa thiết thực cho học sinh THCS. Hàng tháng, câu lạc bộ thanh niên trường em tổ chức các chiến dịch dọn vệ sinh đường phố và nhặt rác thải nhựa quanh làng. Chúng em cũng quyên góp sách vở cũ và quần áo ấm cho các bạn học sinh vùng cao khó khăn. Những hành động nhỏ này không chỉ giúp bảo vệ môi trường mà còn lan tỏa tình yêu thương và sự sẻ chia. Em cảm thấy rất hạnh phúc và trưởng thành hơn khi giúp ích được cho xã hội.',
    essay: `Participating in community service brings tremendous benefits to secondary students. Every month, our school volunteer club organizes campaigns to clean up village streets and collect plastic rubbish. We also donate warm clothes and used textbooks to poor children in mountainous areas. These practical activities not only protect our local environment but also nurture empathy and responsibility. I feel genuinely proud and joyful whenever I contribute to making our society a better place.`,
    collocations: ['participating in community service', 'tremendous benefits', 'nurture empathy and responsibility', 'generous donations', 'make our society a better place'],
    tips: 'Áp dụng cấu trúc: "These practical activities not only ... but also ..."'
  },
  {
    grade: 8,
    unit: 'Unit 7: Environmental Protection',
    topic: 'Write a paragraph (80-100 words) about solutions to reduce plastic pollution.',
    cues: 'Causes of plastic waste, practical solutions (3Rs: Reduce, Reuse, Recycle, cloth bags, refillable bottles), call to action.',
    vietnameseTranslation: 'Ô nhiễm rác thải nhựa là một trong những thách thức môi trường cấp bách nhất hiện nay. Để giải quyết vấn đề này, mỗi học sinh cần nghiêm túc thực hiện nguyên tắc 3Rs: Tiết giảm, Tái sử dụng và Tái chế. Thứ nhất, chúng ta nên mang theo túi vải và bình nước cá nhân khi đi học hoặc đi mua sắm thay vì dùng túi nilon một lần. Thứ hai, chúng ta cần phân loại rác thải tại nguồn để đưa đi tái chế hiệu quả. Chung tay hành động từ những việc nhỏ mỗi ngày sẽ giữ cho hành tinh của chúng ta luôn xanh, sạch và tươi đẹp.',
    essay: `Plastic pollution has become one of the most alarming environmental threats today. To address this urgent issue, every student should strictly follow the 3Rs rule: Reduce, Reuse, and Recycle. Firstly, we ought to carry reusable cloth bags and refillable water bottles to school instead of relying on single-use plastics. Secondly, sorting household waste properly at home and school helps support efficient recycling programs. If everyone takes small daily actions, we will undoubtedly preserve our planet for future generations.`,
    collocations: ['alarming environmental threats', 'strictly follow the 3Rs rule', 'single-use plastics', 'refillable water bottles', 'preserve our planet for future generations'],
    tips: 'Dùng các từ liên kết luận điểm: Firstly, Secondly, If everyone...'
  },
  {
    grade: 9,
    unit: 'Unit 1: Traditional Craft Villages',
    topic: 'Write a paragraph (80-100 words) about preserving traditional craft villages in Viet Nam.',
    cues: 'Significance of craft villages, problems they are facing, solutions to preserve them (tourism, modern designs, youth interest).',
    vietnameseTranslation: 'Các làng nghề truyền thống đóng vai trò quan trọng trong việc lưu giữ bản sắc văn hóa dân tộc Việt Nam. Tuy nhiên, nhiều làng nghề cổ truyền như gốm sứ hay dệt lụa đang có nguy cơ mai một do thiếu thợ trẻ kế nghiệp và sự cạnh tranh từ hàng công nghiệp. Để bảo tồn những di sản quý báu này, chính quyền và các nghệ nhân cần kết hợp phát triển du lịch làng nghề trải nghiệm nhằm thu hút du khách. Ngoài ra, việc cải tiến mẫu mã hiện đại và quảng bá sản phẩm trên nền tảng số sẽ giúp các làng nghề phát triển bền vững.',
    essay: `Traditional craft villages play an essential role in preserving the rich cultural heritage of Viet Nam. However, many ancient pottery and silk weaving villages are facing the risk of dying out due to industrial competition and a lack of young artisans. To safeguard these precious heritages, local authorities and master artisans should combine craft production with eco-tourism to attract domestic and international visitors. Furthermore, promoting traditional handicraft products on digital platforms will help craft villages thrive sustainably in the modern world.`,
    collocations: ['preserving rich cultural heritage', 'risk of dying out', 'safeguard precious heritages', 'combine with eco-tourism', 'thrive sustainably in the modern world'],
    tips: 'Sử dụng từ vựng đắt giá: cultural heritage, artisans, safeguard, thrive sustainably.'
  }
];

// ── 4. BẢNG PHIẾU TRẢ LỜI TRẮC NGHIỆM CHUẨN BGD&ĐT (PRINTABLE TEMPLATE) ──
const ANSWER_SHEET_HELPER = {
  renderAnswerSheetHtml(examCode = '701', schoolName = 'TRƯỜNG THCS ĐỒNG YÊN') {
    return `
    <div style="font-family:'Times New Roman',serif;max-width:800px;margin:0 auto;padding:20px;border:1.5px solid #000;background:#fff;color:#000">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:1.5pt solid #000;padding-bottom:10px;margin-bottom:14px">
        <div style="text-align:center;font-weight:bold;font-size:12pt;line-height:1.3">
          UBND XÃ ĐỒNG YÊN<br/>
          <u>${schoolName.toUpperCase()}</u>
        </div>
        <div style="text-align:center;font-weight:bold;font-size:13pt;line-height:1.3">
          PHIẾU TRẢ LỜI TRẮC NGHIỆM<br/>
          <span style="font-size:11pt;font-weight:normal">BÀI KIỂM TRA ĐỊNH KỲ TIẾNG ANH THCS</span>
        </div>
        <div style="border:1pt solid #000;padding:6px 12px;text-align:center;font-weight:bold;font-size:12pt">
          MÃ ĐỀ THI<br/>
          <span style="color:#b91c1c;font-size:14pt">${examCode}</span>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:2fr 1fr;gap:12px;margin-bottom:14px;font-size:11pt;border-bottom:1pt dashed #666;padding-bottom:10px">
        <div>Họ và tên thí sinh: ............................................................................</div>
        <div>Lớp: ......................... SBD: ................</div>
      </div>

      <div style="font-size:10pt;font-style:italic;margin-bottom:12px;color:#333">
        * Hướng dẫn: Thí sinh dùng bút chì đen tô kín ô tròn tương ứng với phương án trả lời đúng.
      </div>

      <!-- Bubble Grid: 36 Questions divided into 3 columns of 12 questions -->
      <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:16px">
        ${[0, 12, 24].map(startIdx => `
          <div style="border:1pt solid #000;padding:8px;border-radius:4px">
            <table style="width:100%;border-collapse:collapse;font-size:10pt;text-align:center">
              <thead>
                <tr style="font-weight:bold;background:#f1f5f9;border-bottom:1pt solid #000">
                  <th style="padding:4px">Câu</th>
                  <th style="padding:4px">A</th>
                  <th style="padding:4px">B</th>
                  <th style="padding:4px">C</th>
                  <th style="padding:4px">D</th>
                </tr>
              </thead>
              <tbody>
                ${Array.from({ length: 12 }, (_, i) => startIdx + i + 1).map(qNum => `
                  <tr style="border-bottom:0.5pt solid #ddd">
                    <td style="padding:3px;font-weight:bold">${qNum}</td>
                    <td style="padding:3px"><span style="display:inline-block;width:14px;height:14px;border:1pt solid #000;border-radius:50%;line-height:13px;font-size:8pt">A</span></td>
                    <td style="padding:3px"><span style="display:inline-block;width:14px;height:14px;border:1pt solid #000;border-radius:50%;line-height:13px;font-size:8pt">B</span></td>
                    <td style="padding:3px"><span style="display:inline-block;width:14px;height:14px;border:1pt solid #000;border-radius:50%;line-height:13px;font-size:8pt">C</span></td>
                    <td style="padding:3px"><span style="display:inline-block;width:14px;height:14px;border:1pt solid #000;border-radius:50%;line-height:13px;font-size:8pt">D</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `).join('')}
      </div>

      <div style="margin-top:16px;border-top:1pt solid #000;padding-top:8px;font-size:9.5pt;display:flex;justify-content:space-between;color:#666">
        <span>Bản quyền: Thầy giáo Đinh Văn Thành – THCS Đồng Yên (0915.213717)</span>
        <span>Mẫu phiếu thi chuẩn khảo thí Bộ GD&ĐT</span>
      </div>
    </div>`;
  }
};
