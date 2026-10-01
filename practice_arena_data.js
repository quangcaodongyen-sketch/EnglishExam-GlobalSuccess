// ================================================================
// practice_arena_data.js – Đấu Trường Luyện Tập Thực Hành Đa Dạng
// 5 Dạng Bài Tập Tương Tác Cốt Lõi THCS Global Success (Lớp 6, 7, 8, 9)
// Tác giả & Bản quyền: Thầy Đinh Văn Thành – Trường THCS Đồng Yên
// ================================================================

// ── 1. DẠNG 1: WORD SCRAMBLE / SENTENCE BUILDER (Ghép từ thành câu) ──
const PRACTICE_SCRAMBLE_DATA = [
  // LỚP 6
  {
    id: 'sc-6-1', grade: 6, unit: 'Unit 1: My New School',
    hint: 'Sắp xếp các từ để tạo thành câu hoàn chỉnh về hoạt động ở trường:',
    words: ['We', 'wear', 'our', 'school', 'uniform', 'on', 'Mondays.'],
    correctSentence: 'We wear our school uniform on Mondays.',
    meaning: 'Chúng tôi mặc đồng phục học sinh vào các ngày thứ Hai.',
    grammarRule: 'Thì Hiện tại đơn: S + V(nguyên mẫu) + tân ngữ + trạng từ thời gian.'
  },
  {
    id: 'sc-6-2', grade: 6, unit: 'Unit 2: My Home',
    hint: 'Sắp xếp các từ để miêu tả ngôi nhà tương lai:',
    words: ['There', 'will', 'be', 'solar', 'panels', 'on', 'the', 'roof.'],
    correctSentence: 'There will be solar panels on the roof.',
    meaning: 'Sẽ có những tấm pin năng lượng mặt trời trên mái nhà.',
    grammarRule: 'Cấu trúc tương lai đơn với There will be + Danh từ số nhiều.'
  },
  {
    id: 'sc-6-3', grade: 6, unit: 'Unit 4: My Neighbourhood',
    hint: 'Sắp xếp câu so sánh hơn giữa hai địa điểm:',
    words: ['Living', 'in', 'the', 'city', 'is', 'busier', 'than', 'in', 'the', 'country.'],
    correctSentence: 'Living in the city is busier than in the country.',
    meaning: 'Sống ở thành phố bận rộn hơn ở nông thôn.',
    grammarRule: 'So sánh hơn tính từ ngắn: busy -> busier than.'
  },
  {
    id: 'sc-6-4', grade: 6, unit: 'Unit 8: Sports & Games',
    hint: 'Sắp xếp câu lời khuyên với modal verb should:',
    words: ['You', 'should', 'do', 'exercise', 'every', 'morning', 'to', 'stay', 'healthy.'],
    correctSentence: 'You should do exercise every morning to stay healthy.',
    meaning: 'Bạn nên tập thể dục mỗi buổi sáng để giữ gìn sức khỏe.',
    grammarRule: 'Khuyên bảo: S + should + V_inf.'
  },

  // LỚP 7
  {
    id: 'sc-7-1', grade: 7, unit: 'Unit 1: Hobbies',
    hint: 'Sắp xếp câu với động từ chỉ sở thích (verbs of liking):',
    words: ['My', 'brother', 'enjoys', 'collecting', 'rare', 'stamps', 'in', 'his', 'free', 'time.'],
    correctSentence: 'My brother enjoys collecting rare stamps in his free time.',
    meaning: 'Anh trai tôi thích sưu tầm tem hiếm vào thời gian rảnh.',
    grammarRule: 'Enjoy + V-ing (động từ chỉ sở thích đi với danh động từ).'
  },
  {
    id: 'sc-7-2', grade: 7, unit: 'Unit 3: Community Service',
    hint: 'Sắp xếp câu thì Quá khứ đơn về thiện nguyện:',
    words: ['We', 'donated', 'warm', 'clothes', 'to', 'poor', 'children', 'last', 'winter.'],
    correctSentence: 'We donated warm clothes to poor children last winter.',
    meaning: 'Chúng tôi đã quyên góp quần áo ấm cho trẻ em nghèo vào mùa đông năm ngoái.',
    grammarRule: 'Thì Quá khứ đơn: donate -> donated + mốc thời gian quá khứ last winter.'
  },
  {
    id: 'sc-7-3', grade: 7, unit: 'Unit 7: Traffic',
    hint: 'Sắp xếp câu chỉ khoảng cách với It takes:',
    words: ['It', 'takes', 'me', 'fifteen', 'minutes', 'to', 'walk', 'to', 'school.'],
    correctSentence: 'It takes me fifteen minutes to walk to school.',
    meaning: 'Tôi mất 15 phút để đi bộ đến trường.',
    grammarRule: 'Cấu trúc thời gian: It takes + someone + time + to V_inf.'
  },
  {
    id: 'sc-7-4', grade: 7, unit: 'Unit 10: Energy Sources',
    hint: 'Sắp xếp câu liên từ chỉ nguyên nhân:',
    words: ['We', 'should', 'save', 'energy', 'because', 'fossil', 'fuels', 'are', 'running', 'out.'],
    correctSentence: 'We should save energy because fossil fuels are running out.',
    meaning: 'Chúng ta nên tiết kiệm năng lượng vì nhiên liệu hóa thạch đang cạn kiệt.',
    grammarRule: 'Mệnh đề trạng ngữ chỉ nguyên nhân bắt đầu bằng liên từ Because.'
  },

  // LỚP 8
  {
    id: 'sc-8-1', grade: 8, unit: 'Unit 1: Leisure Time',
    hint: 'Sắp xếp câu với cụm từ chỉ sự hào hứng:',
    words: ['Teenagers', 'are', 'very', 'keen', 'on', 'hanging', 'out', 'with', 'their', 'close', 'friends.'],
    correctSentence: 'Teenagers are very keen on hanging out with their close friends.',
    meaning: 'Thanh thiếu niên rất thích đi chơi cùng bạn thân của mình.',
    grammarRule: 'Cụm tính từ: To be keen on + V-ing (rất thích, say mê).'
  },
  {
    id: 'sc-8-2', grade: 8, unit: 'Unit 2: Life in Countryside',
    hint: 'Sắp xếp câu so sánh hơn của trạng từ:',
    words: ['People', 'in', 'the', 'village', 'work', 'harder', 'than', 'ever', 'during', 'harvest', 'time.'],
    correctSentence: 'People in the village work harder than ever during harvest time.',
    meaning: 'Người dân trong làng làm việc chăm chỉ hơn bao giờ hết vào mùa thu hoạch.',
    grammarRule: 'So sánh hơn của trạng từ hard -> harder than.'
  },
  {
    id: 'sc-8-3', grade: 8, unit: 'Unit 7: Environmental Protection',
    hint: 'Sắp xếp câu điều kiện loại 1:',
    words: ['If', 'we', 'plant', 'more', 'green', 'trees,', 'our', 'air', 'will', 'become', 'cleaner.'],
    correctSentence: 'If we plant more green trees, our air will become cleaner.',
    meaning: 'Nếu chúng ta trồng nhiều cây xanh, không khí sẽ trở nên trong lành hơn.',
    grammarRule: 'Câu điều kiện loại 1: Mệnh đề If (Hiện tại đơn), mệnh đề chính (Will + V_inf).'
  },
  {
    id: 'sc-8-4', grade: 8, unit: 'Unit 11: Science & Technology',
    hint: 'Sắp xếp câu tường thuật gián tiếp:',
    words: ['The', 'teacher', 'told', 'us', 'that', 'robots', 'would', 'assist', 'humans', 'in', 'space.'],
    correctSentence: 'The teacher told us that robots would assist humans in space.',
    meaning: 'Giáo viên nói với chúng tôi rằng robot sẽ hỗ trợ con người ngoài không gian.',
    grammarRule: 'Câu tường thuật: S + told + O + that + S + V(lùi thì: will -> would).'
  },

  // LỚP 9
  {
    id: 'sc-9-1', grade: 9, unit: 'Unit 1: Local Community',
    hint: 'Sắp xếp câu với cụm động từ (Phrasal Verb):',
    words: ['Traditional', 'craft', 'skills', 'have', 'been', 'passed', 'down', 'through', 'many', 'generations.'],
    correctSentence: 'Traditional craft skills have been passed down through many generations.',
    meaning: 'Các kỹ năng thủ công truyền thống đã được truyền lại qua nhiều thế hệ.',
    grammarRule: 'Cụm động từ Pass down (truyền lại) chia ở bị động Hiện tại hoàn thành.'
  },
  {
    id: 'sc-9-2', grade: 9, unit: 'Unit 2: City Life',
    hint: 'Sắp xếp câu so sánh kép (The more... the more...):',
    words: ['The', 'more', 'modern', 'a', 'city', 'becomes,', 'the', 'more', 'convenient', 'people', 'live.'],
    correctSentence: 'The more modern a city becomes, the more convenient people live.',
    meaning: 'Một thành phố càng trở nên hiện đại, con người sống càng tiện nghi.',
    grammarRule: 'So sánh kép: The + comp. adj/adv + S + V, the + comp. adj/adv + S + V.'
  },
  {
    id: 'sc-9-3', grade: 9, unit: 'Unit 3: Teen Stress',
    hint: 'Sắp xếp câu từ để hỏi kết hợp To-Infinitive:',
    words: ['I', 'do', 'not', 'know', 'how', 'to', 'manage', 'my', 'study', 'time', 'effectively.'],
    correctSentence: 'I do not know how to manage my study time effectively.',
    meaning: 'Tôi không biết làm thế nào để quản lý thời gian học tập hiệu quả.',
    grammarRule: 'Cấu trúc Wh-word + to V-inf (how to manage).'
  },
  {
    id: 'sc-9-4', grade: 9, unit: 'Unit 6: Viet Nam Then & Now',
    hint: 'Sắp xếp câu bị động khách quan (Impersonal Passive):',
    words: ['It', 'is', 'widely', 'believed', 'that', 'education', 'plays', 'a', 'vital', 'role', 'in', 'development.'],
    correctSentence: 'It is widely believed that education plays a vital role in development.',
    meaning: 'Người ta tin tưởng rộng rãi rằng giáo dục đóng vai trò sống còn trong phát triển.',
    grammarRule: 'Bị động khách quan: It is + P2 (believed/reported) + that + S + V.'
  }
];

// ── 2. DẠNG 2: FIND & CORRECT THE MISTAKE (Tìm và sửa lỗi sai) ──
const PRACTICE_MISTAKE_DATA = [
  // LỚP 6
  {
    id: 'err-6-1', grade: 6, unit: 'Unit 1: My New School',
    sentence: 'Nam [A: do not] [B: have] [C: lunch] at school [D: on] Tuesdays.',
    wrongPart: 'A', wrongWord: 'do not', correctWord: 'does not',
    explanation: 'Chủ ngữ "Nam" là ngôi thứ 3 số ít, trợ động từ phủ định phải là "does not" (doesn\'t), không dùng "do not".'
  },
  {
    id: 'err-6-2', grade: 6, unit: 'Unit 4: My Neighbourhood',
    sentence: 'The streets [A: in] the old quarter [B: are] much [C: more narrow] [D: than] in the new area.',
    wrongPart: 'C', wrongWord: 'more narrow', correctWord: 'narrower',
    explanation: '"Narrow" là tính từ 2 âm tiết kết thúc bằng -ow, chia so sánh hơn như tính từ ngắn: narrower (không dùng more narrow).'
  },
  {
    id: 'err-6-3', grade: 6, unit: 'Unit 6: Our Tet Holiday',
    sentence: 'Children [A: should] [B: asking] for lucky money [C: when] visiting relatives [D: at] Tet.',
    wrongPart: 'B', wrongWord: 'asking', correctWord: 'ask',
    explanation: 'Sau động từ khuyết thiếu (should/shouldn\'t) luôn dùng động từ nguyên mẫu không "to": should ask.'
  },
  {
    id: 'err-6-4', grade: 6, unit: 'Unit 10: Our Houses in Future',
    sentence: 'In the future, [A: there] [B: will have] a smart robot [C: to do] all [D: the housework].',
    wrongPart: 'B', wrongWord: 'will have', correctWord: 'will be',
    explanation: 'Cấu trúc tồn tại ở tương lai là "There will be" (sẽ có), không dùng "There will have".'
  },

  // LỚP 7
  {
    id: 'err-7-1', grade: 7, unit: 'Unit 1: Hobbies',
    sentence: 'My sister [A: hates] [B: to waking up] [C: early] [D: on] cold winter mornings.',
    wrongPart: 'B', wrongWord: 'to waking up', correctWord: 'waking up (hoặc to wake up)',
    explanation: 'Sau động từ chỉ sở thích "hate", dùng "V-ing" hoặc "to V_inf". Dùng "to waking up" là sai ngữ pháp kết hợp.'
  },
  {
    id: 'err-7-2', grade: 7, unit: 'Unit 3: Community Service',
    sentence: 'Last summer, our youth club [A: has organized] a charity campaign [B: to support] [C: disabled] children [D: in] our town.',
    wrongPart: 'A', wrongWord: 'has organized', correctWord: 'organized',
    explanation: 'Có trạng từ chỉ thời gian quá khứ xác định "Last summer", phải dùng thì Quá khứ đơn (organized), không dùng Hiện tại hoàn thành.'
  },
  {
    id: 'err-7-3', grade: 7, unit: 'Unit 8: Films',
    sentence: '[A: Although] the film was [B: extremely long], [C: but] we stayed until [D: the very end].',
    wrongPart: 'C', wrongWord: 'but', correctWord: '(bỏ but)',
    explanation: 'Trong tiếng Anh, câu đã có liên từ "Although/Even though" thì TUYỆT ĐỐI không dùng liên từ "but" ở mệnh đề sau.'
  },
  {
    id: 'err-7-4', grade: 7, unit: 'Unit 10: Energy Sources',
    sentence: 'Solar energy [A: will use] [B: to heat] water and [C: generate] clean electricity [D: in] modern homes.',
    wrongPart: 'A', wrongWord: 'will use', correctWord: 'will be used',
    explanation: 'Năng lượng mặt trời không tự dùng được mà phải "được sử dụng" -> Câu bị động tương lai: will be used.'
  },

  // LỚP 8
  {
    id: 'err-8-1', grade: 8, unit: 'Unit 2: Life in Countryside',
    sentence: 'The local farmers [A: drive] their tractors [B: more careful] [C: than] the drivers [D: in] the city.',
    wrongPart: 'B', wrongWord: 'more careful', correctWord: 'more carefully',
    explanation: 'Bổ nghĩa cho động từ hành động "drive" (lái xe) phải dùng trạng từ "carefully", so sánh hơn là "more carefully".'
  },
  {
    id: 'err-8-2', grade: 8, unit: 'Unit 7: Environment',
    sentence: 'If we [A: will continue] [B: to dump] toxic waste into rivers, aquatic animals [C: will die] [D: rapidly].',
    wrongPart: 'A', wrongWord: 'will continue', correctWord: 'continue',
    explanation: 'Trong mệnh đề điều kiện "If" của câu điều kiện loại 1, động từ chia ở thì Hiện tại đơn, không dùng "will".'
  },
  {
    id: 'err-8-3', grade: 8, unit: 'Unit 11: Science & Technology',
    sentence: 'Nam [A: asked] his father [B: that] robots [C: could replace] human teachers [D: in] schools.',
    wrongPart: 'B', wrongWord: 'that', correctWord: 'if / whether',
    explanation: 'Câu gián tiếp của câu hỏi Yes/No dùng liên từ "if" hoặc "whether", không dùng "that".'
  },
  {
    id: 'err-8-4', grade: 8, unit: 'Unit 12: Life on Other Planets',
    sentence: 'Astronomers [A: wonder] [B: what] extraterrestrial creatures [C: look like] and [D: where do they live].',
    wrongPart: 'D', wrongWord: 'where do they live', correctWord: 'where they live',
    explanation: 'Trong mệnh đề danh từ / câu trần thuật gián tiếp, trật tự từ là "Từ để hỏi + S + V" (where they live), không đảo trợ động từ "do".'
  },

  // LỚP 9
  {
    id: 'err-9-1', grade: 9, unit: 'Unit 1: Local Community',
    sentence: 'The workshop [A: which] was established [B: fifty years ago] has been [C: closed off] [D: due to] financial difficulties.',
    wrongPart: 'C', wrongWord: 'closed off', correctWord: 'closed down',
    explanation: 'Cụm động từ chỉ doanh nghiệp / cơ sở đóng cửa ngừng hoạt động vĩnh viễn là "close down", "close off" là phong tỏa đường sá.'
  },
  {
    id: 'err-9-2', grade: 9, unit: 'Unit 2: City Life',
    sentence: '[A: The more] populated [B: the capital is], [C: the badder] [D: the traffic congestion] becomes.',
    wrongPart: 'C', wrongWord: 'the badder', correctWord: 'the worse',
    explanation: 'So sánh hơn của tính từ bất quy tắc "bad" là "worse" (the worse), trong tiếng Anh không có từ "badder".'
  },
  {
    id: 'err-9-3', grade: 9, unit: 'Unit 4: Past Memories',
    sentence: 'My grandfather [A: wishes] he [B: has] more opportunities to [C: travel] across the country [D: when] he was young.',
    wrongPart: 'B', wrongWord: 'has', correctWord: 'had (hoặc had had)',
    explanation: 'Câu ước cho điều không có thật / đã qua trong quá khứ phải lùi thì (Past simple / Past perfect), không được dùng thì hiện tại "has".'
  },
  {
    id: 'err-9-4', grade: 9, unit: 'Unit 9: English in World',
    sentence: 'The student [A: whom] won [B: the first prize] in the national English contest [C: studies] [D: at] our school.',
    wrongPart: 'A', wrongWord: 'whom', correctWord: 'who',
    explanation: 'Đại từ quan hệ làm chủ ngữ cho động từ "won" phía sau phải là "who", "whom" chỉ làm tân ngữ.'
  }
];

// ── 3. DẠNG 3: SENTENCE TRANSFORMATION (Viết lại câu đồng nghĩa) ──
const PRACTICE_TRANSFORM_DATA = [
  // LỚP 6
  {
    id: 'tr-6-1', grade: 6, unit: 'Unit 2: My Home',
    original: 'There are five comfortable rooms in my new apartment.',
    beginWith: 'My new apartment',
    correctAnswer: 'has five comfortable rooms.',
    options: [
      'has five comfortable rooms.',
      'have five comfortable rooms.',
      'is having five comfortable rooms.',
      'there is five comfortable rooms.'
    ],
    explanation: 'Chuyển đổi tương đương: There is/are + danh từ <-> S + have/has + danh từ.'
  },
  {
    id: 'tr-6-2', grade: 6, unit: 'Unit 3: My Friends',
    original: 'Linh has long black hair and sparkling brown eyes.',
    beginWith: 'Linh\'s hair',
    correctAnswer: 'is long and black, and her eyes are sparkling brown.',
    options: [
      'is long and black, and her eyes are sparkling brown.',
      'has long and black, and sparkling brown eyes.',
      'are long and black with sparkling brown eyes.',
      'is long black and her eyes sparkling brown.'
    ],
    explanation: 'Chuyển đổi miêu tả ngoại hình: S + have/has + adj + N <-> S\'s N + be + adj.'
  },
  {
    id: 'tr-6-3', grade: 6, unit: 'Unit 4: My Neighbourhood',
    original: 'The cinema is behind the local supermarket.',
    beginWith: 'The local supermarket',
    correctAnswer: 'is in front of the cinema.',
    options: [
      'is in front of the cinema.',
      'is next to the cinema.',
      'is opposite the cinema.',
      'is behind the cinema.'
    ],
    explanation: 'Chuyển đổi giới từ chỉ vị trí: behind (ở sau) <-> in front of (ở trước).'
  },
  {
    id: 'tr-6-4', grade: 6, unit: 'Unit 5: Natural Wonders',
    original: 'No mountain in Viet Nam is higher than Mount Fansipan.',
    beginWith: 'Mount Fansipan',
    correctAnswer: 'is the highest mountain in Viet Nam.',
    options: [
      'is the highest mountain in Viet Nam.',
      'is higher than all mountains in Viet Nam.',
      'is the most high mountain in Viet Nam.',
      'is very high mountain in Viet Nam.'
    ],
    explanation: 'So sánh hơn phủ định "No mountain is higher than X" <-> So sánh nhất: "X is the highest mountain".'
  },

  // LỚP 7
  {
    id: 'tr-7-1', grade: 7, unit: 'Unit 1: Hobbies',
    original: 'My mother likes preparing traditional meals for our family.',
    beginWith: 'My mother is fond',
    correctAnswer: 'of preparing traditional meals for our family.',
    options: [
      'of preparing traditional meals for our family.',
      'in preparing traditional meals for our family.',
      'with preparing traditional meals for our family.',
      'to preparing traditional meals for our family.'
    ],
    explanation: 'Cụm từ đồng nghĩa: like + V-ing <-> be fond of + V-ing.'
  },
  {
    id: 'tr-7-2', grade: 7, unit: 'Unit 7: Traffic',
    original: 'The distance between my house and school is about two kilometres.',
    beginWith: 'It is about',
    correctAnswer: 'two kilometres from my house to school.',
    options: [
      'two kilometres from my house to school.',
      'two kilometres between my house and school.',
      'two kilometres away my house to school.',
      'two kilometres long from my house to school.'
    ],
    explanation: 'Cấu trúc chỉ khoảng cách: It is + distance + from A to B.'
  },
  {
    id: 'tr-7-3', grade: 7, unit: 'Unit 8: Films',
    original: 'Although he was injured in the leg, the athlete finished the race.',
    beginWith: 'In spite of',
    correctAnswer: 'his injured leg, the athlete finished the race.',
    options: [
      'his injured leg, the athlete finished the race.',
      'he was injured in the leg, the athlete finished the race.',
      'of being injured, but the athlete finished the race.',
      'his leg was injured, the athlete finished the race.'
    ],
    explanation: 'Chuyển đổi liên từ nhượng bộ: Although + Clause <-> In spite of / Despite + Noun phrase / V-ing.'
  },
  {
    id: 'tr-7-4', grade: 7, unit: 'Unit 9: Festivals',
    original: 'When did people start celebrating the Mid-Autumn Festival?',
    beginWith: 'How long',
    correctAnswer: 'have people celebrated the Mid-Autumn Festival?',
    options: [
      'have people celebrated the Mid-Autumn Festival?',
      'did people celebrate the Mid-Autumn Festival?',
      'are people celebrating the Mid-Autumn Festival?',
      'have people start celebrating the Mid-Autumn Festival?'
    ],
    explanation: 'Chuyển đổi: When did + S + start/begin + V-ing? <-> How long + have/has + S + V3/ed?'
  },

  // LỚP 8
  {
    id: 'tr-8-1', grade: 8, unit: 'Unit 1: Leisure Time',
    original: 'Hung prefers listening to podcasts to watching television.',
    beginWith: 'Hung would rather',
    correctAnswer: 'listen to podcasts than watch television.',
    options: [
      'listen to podcasts than watch television.',
      'listening to podcasts than watching television.',
      'to listen to podcasts than to watch television.',
      'listen to podcasts to watch television.'
    ],
    explanation: 'Cấu trúc sở thích: Prefer V-ing to V-ing <-> Would rather V_inf than V_inf.'
  },
  {
    id: 'tr-8-2', grade: 8, unit: 'Unit 7: Environment',
    original: 'Unless people stop cutting down forests, many wild animals will lose their homes.',
    beginWith: 'If people',
    correctAnswer: 'do not stop cutting down forests, many wild animals will lose their homes.',
    options: [
      'do not stop cutting down forests, many wild animals will lose their homes.',
      'will not stop cutting down forests, many wild animals will lose their homes.',
      'stop cutting down forests, many wild animals will lose their homes.',
      'did not stop cutting down forests, many wild animals will lose their homes.'
    ],
    explanation: 'Quy tắc vàng: Unless = If ... not (Trừ khi = Nếu không).'
  },
  {
    id: 'tr-8-3', grade: 8, unit: 'Unit 11: Science & Technology',
    original: '"Will scientists invent flying cars in the near future?" asked Tom.',
    beginWith: 'Tom asked',
    correctAnswer: 'if scientists would invent flying cars in the near future.',
    options: [
      'if scientists would invent flying cars in the near future.',
      'that scientists will invent flying cars in the near future.',
      'whether would scientists invent flying cars in the near future.',
      'if scientists will invent flying cars in the near future.'
    ],
    explanation: 'Câu tường thuật câu hỏi Yes/No: S + asked + if/whether + S + would + V_inf.'
  },
  {
    id: 'tr-8-4', grade: 8, unit: 'Unit 4: Ethnic Groups',
    original: 'It is a custom for the Tay people to live in stilt houses.',
    beginWith: 'The Tay people customarily',
    correctAnswer: 'live in stilt houses.',
    options: [
      'live in stilt houses.',
      'living in stilt houses.',
      'to live in stilt houses.',
      'are living in stilt houses.'
    ],
    explanation: 'Chuyển đổi từ loại: It is a custom to V <-> S + customarily + V.'
  },

  // LỚP 9
  {
    id: 'tr-9-1', grade: 9, unit: 'Unit 2: City Life',
    original: 'As the city grows larger, the cost of living becomes higher.',
    beginWith: 'The larger the city',
    correctAnswer: 'grows, the higher the cost of living becomes.',
    options: [
      'grows, the higher the cost of living becomes.',
      'grows, the more high the cost of living becomes.',
      'is growing, the highest the cost of living is.',
      'grows, higher the cost of living becomes.'
    ],
    explanation: 'So sánh kép: The + comp. adj + S + V, the + comp. adj + S + V.'
  },
  {
    id: 'tr-9-2', grade: 9, unit: 'Unit 3: Teen Stress',
    original: '"I don\'t know what I should do to overcome exam anxiety," said Mai.',
    beginWith: 'Mai didn\'t know what',
    correctAnswer: 'to do to overcome exam anxiety.',
    options: [
      'to do to overcome exam anxiety.',
      'she should do to overcome exam anxiety.',
      'doing to overcome exam anxiety.',
      'to be done to overcome exam anxiety.'
    ],
    explanation: 'Rút gọn mệnh đề danh từ: Wh-word + S + should + V <-> Wh-word + to V.'
  },
  {
    id: 'tr-9-3', grade: 9, unit: 'Unit 6: Viet Nam Then & Now',
    original: 'People say that the old tram system in Ha Noi was very convenient.',
    beginWith: 'The old tram system in Ha Noi',
    correctAnswer: 'is said to have been very convenient.',
    options: [
      'is said to have been very convenient.',
      'is said to be very convenient.',
      'was said to be very convenient.',
      'is said that it was very convenient.'
    ],
    explanation: 'Bị động khách quan: People say that S + past V <-> S + is said to have + V3/ed.'
  },
  {
    id: 'tr-9-4', grade: 9, unit: 'Unit 4: Past Memories',
    original: 'I feel regret that I cannot attend the folk music performance tonight.',
    beginWith: 'I wish',
    correctAnswer: 'I could attend the folk music performance tonight.',
    options: [
      'I could attend the folk music performance tonight.',
      'I can attend the folk music performance tonight.',
      'I attended the folk music performance tonight.',
      'I would attend the folk music performance tonight.'
    ],
    explanation: 'Câu ước cho hiện tại/tương lai: I wish + S + could/would + V_inf.'
  }
];

// ── 4. DẠNG 4: MATCH PAIRS GAME (Ghép thẻ tương tác) ──
const PRACTICE_MATCHING_DATA = [
  {
    id: 'mat-6', grade: 6, title: 'Ghép cặp Từ vựng & Định nghĩa Lớp 6',
    pairs: [
      { en: 'compass', vi: 'Com-pa vẽ hình tròn', icon: '📐' },
      { en: 'dishwasher', vi: 'Máy rửa chén bát', icon: '🍽️' },
      { en: 'confident', vi: 'Tự tin, mạnh dạn', icon: '😎' },
      { en: 'convenient', vi: 'Thuận tiện, tiện lợi', icon: '🏪' },
      { en: 'waterfall', vi: 'Thác nước tự nhiên', icon: '🌊' },
      { en: 'neighbourhood', vi: 'Khu phố, xóm giềng', icon: '🏘️' }
    ]
  },
  {
    id: 'mat-7', grade: 7, title: 'Ghép cặp Từ vựng & Định nghĩa Lớp 7',
    pairs: [
      { en: 'gardening', vi: 'Việc làm vườn thư giãn', icon: '🌱' },
      { en: 'vegetarian', vi: 'Người ăn chay trường', icon: '🥗' },
      { en: 'pedestrian', vi: 'Người đi bộ trên đường', icon: '🚶' },
      { en: 'renewable', vi: 'Năng lượng tái tạo', icon: '☀️' },
      { en: 'composer', vi: 'Nhà soạn nhạc tài ba', icon: '🎼' },
      { en: 'donate', vi: 'Quyên góp, ủng hộ', icon: '🎁' }
    ]
  },
  {
    id: 'mat-8', grade: 8, title: 'Ghép cặp Từ vựng & Đồng nghĩa/Trái nghĩa Lớp 8',
    pairs: [
      { en: 'picturesque', vi: 'Đẹp như tranh vẽ', icon: '🏞️' },
      { en: 'peer pressure', vi: 'Áp lực bạn đồng trang lứa', icon: '👥' },
      { en: 'biodiversity', vi: 'Đa dạng sinh học phong phú', icon: '🐾' },
      { en: 'evacuate', vi: 'Sơ tán khẩn cấp', icon: '🚨' },
      { en: 'stilt house', vi: 'Nhà sàn truyền thống', icon: '🏡' },
      { en: 'origami', vi: 'Nghệ thuật gấp giấy', icon: '📄' }
    ]
  },
  {
    id: 'mat-9', grade: 9, title: 'Ghép cặp Từ vựng Nâng cao Lớp 9',
    pairs: [
      { en: 'artisan', vi: 'Nghệ nhân thủ công', icon: '🏺' },
      { en: 'metropolis', vi: 'Siêu đô thị sầm uất', icon: '🌆' },
      { en: 'lingua franca', vi: 'Ngôn ngữ chung toàn cầu', icon: '🌐' },
      { en: 'ecotourism', vi: 'Du lịch sinh thái bền vững', icon: '🌲' },
      { en: 'qualification', vi: 'Văn bằng, năng lực chuyên môn', icon: '🎓' },
      { en: 'illiterate', vi: 'Không biết đọc viết', icon: '📖' }
    ]
  }
];

// ── 5. DẠNG 5: CLOZE TEST / WORD BANK (Điền từ vào đoạn văn) ──
const PRACTICE_CLOZE_DATA = [
  {
    id: 'cloze-6', grade: 6,
    title: 'Điền từ vào đoạn văn: My Future Green School',
    wordBank: ['uniform', 'modern', 'solar', 'convenient', 'activities'],
    passageTemplate: 'My dream school will be very [1]. Students will wear comfortable [2] made from organic cotton. On the roof, there will be [3] panels to generate clean energy. Located near a peaceful park, it is very [4] for all students to walk to class. In the afternoon, we will participate in exciting outdoor [5].',
    answers: { 1: 'modern', 2: 'uniform', 3: 'solar', 4: 'convenient', 5: 'activities' }
  },
  {
    id: 'cloze-7', grade: 7,
    title: 'Điền từ vào đoạn văn: Healthy Lifestyle in Dong Yen',
    wordBank: ['gardening', 'habits', 'vegetarian', 'fresh', 'exercise'],
    passageTemplate: 'Living in the countryside offers many health benefits. Villagers eat [1] vegetables every day. Many elderly people enjoy [2] as a peaceful hobby. Having healthy eating [3] helps people live longer. Moreover, eating delicious [4] food once a week and doing morning [5] keeps our bodies strong.',
    answers: { 1: 'fresh', 2: 'gardening', 3: 'habits', 4: 'vegetarian', 5: 'exercise' }
  },
  {
    id: 'cloze-8', grade: 8,
    title: 'Điền từ vào đoạn văn: Protecting Environmental Biodiversity',
    wordBank: ['biodiversity', 'pollution', 'protect', 'extinction', 'awareness'],
    passageTemplate: 'Human activities have caused severe environmental [1]. Many rare animal species are facing [2] due to habitat loss. To preserve global [3], schools should raise students\' environmental [4]. Everyone must act together to [5] our precious planet for future generations.',
    answers: { 1: 'pollution', 2: 'extinction', 3: 'biodiversity', 4: 'awareness', 5: 'protect' }
  },
  {
    id: 'cloze-9', grade: 9,
    title: 'Điền từ vào đoạn văn: Preserving Traditional Handicrafts',
    wordBank: ['artisans', 'generations', 'heritage', 'preserve', 'attracts'],
    passageTemplate: 'Bat Trang pottery village is a famous cultural [1] of Viet Nam. For many [2], skilled local [3] have created delicate ceramic products. Today, the village [4] thousands of international tourists each year. The government is implementing policies to [5] these priceless traditional craft skills.',
    answers: { 1: 'heritage', 2: 'generations', 3: 'artisans', 4: 'attracts', 5: 'preserve' }
  }
];

if (typeof window !== 'undefined') {
  window.PRACTICE_SCRAMBLE_DATA = PRACTICE_SCRAMBLE_DATA;
  window.PRACTICE_MISTAKE_DATA = PRACTICE_MISTAKE_DATA;
  window.PRACTICE_TRANSFORM_DATA = PRACTICE_TRANSFORM_DATA;
  window.PRACTICE_MATCHING_DATA = PRACTICE_MATCHING_DATA;
  window.PRACTICE_CLOZE_DATA = PRACTICE_CLOZE_DATA;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    PRACTICE_SCRAMBLE_DATA,
    PRACTICE_MISTAKE_DATA,
    PRACTICE_TRANSFORM_DATA,
    PRACTICE_MATCHING_DATA,
    PRACTICE_CLOZE_DATA
  };
}
