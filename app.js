// ================================================================
// app.js – EnglishExam Pro: Nền tảng Học tập & Đánh giá Tiếng Anh THCS
// Bám sát chương trình SGK Global Success (Lớp 6, 7, 8, 9)
// Bản quyền & Phát triển: Thầy Đinh Văn Thành – Trường THCS Đồng Yên
// Điện thoại / Zalo: 0915.213717
// ================================================================

// ── Global UI Helpers ─────────────────────────────────────────────
const UI = {
  toast(msg, type = 'info', duration = 3500) {
    const root = document.getElementById('toast-root');
    if (!root) return;
    const t = document.createElement('div');
    t.className = `toast toast-${type} slide-up`;
    const icons = { success: '✅', error: '❌', warn: '⚠️', info: 'ℹ️' };
    t.innerHTML = `<span class="toast-icon">${icons[type] || 'ℹ️'}</span><span>${msg}</span>`;
    root.appendChild(t);
    setTimeout(() => {
      t.style.opacity = '0';
      t.style.transition = 'opacity .3s';
      setTimeout(() => t.remove(), 300);
    }, duration);
  },

  showModal(title, bodyHtml, buttons = []) {
    const root = document.getElementById('modal-root');
    root.innerHTML = `
    <div class="modal-overlay" id="modal-overlay">
      <div class="modal scale-in" id="modal-box">
        <div class="modal-header">
          <div class="modal-title">${title}</div>
          <button class="modal-close" onclick="UI.closeModal()">×</button>
        </div>
        <div class="modal-body">${bodyHtml}</div>
        <div class="modal-footer">
          ${buttons.map((b, i) => `<button class="btn ${b.cls || 'btn-outline'}" id="modal-btn-${i}">${b.label}</button>`).join('')}
        </div>
      </div>
    </div>`;
    buttons.forEach((b, i) => {
      document.getElementById('modal-btn-' + i)?.addEventListener('click', b.action);
    });
    document.getElementById('modal-overlay')?.addEventListener('click', e => {
      if (e.target === e.currentTarget) UI.closeModal();
    });
  },

  closeModal() {
    const root = document.getElementById('modal-root');
    if (root) root.innerHTML = '';
  },
};

function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function formatExamText(s) {
  if (!s) return '';
  let str = String(s);
  str = str
    .replace(/&amp;lt;/gi, '&lt;')
    .replace(/&amp;gt;/gi, '&gt;')
    .replace(/&amp;quot;/gi, '&quot;');
  let safe = esc(str);
  return safe
    .replace(/&lt;u&gt;/gi, '<u style="text-decoration:underline;text-underline-offset:3px;font-weight:700;color:#1e40af">')
    .replace(/&lt;\/u&gt;/gi, '</u>')
    .replace(/&lt;b&gt;/gi, '<b>')
    .replace(/&lt;\/b&gt;/gi, '</b>')
    .replace(/&lt;i&gt;/gi, '<i>')
    .replace(/&lt;\/i&gt;/gi, '</i>')
    .replace(/&lt;br\s*\/?&gt;/gi, '<br/>')
    .replace(/&lt;mark&gt;/gi, '<mark>')
    .replace(/&lt;\/mark&gt;/gi, '</mark>');
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function levelTag(level) {
  const map = { NB: 'tag-nb', TH: 'tag-th', VD: 'tag-vd', VDC: 'tag-vdc' };
  const names = { NB: 'Nhận biết', TH: 'Thông hiểu', VD: 'Vận dụng', VDC: 'Vận dụng cao' };
  return `<span class="tag ${map[level] || ''}">${names[level] || level}</span>`;
}

function gradeTag(grade) {
  return `<span class="badge badge-g${grade}">Lớp ${grade} Global Success</span>`;
}

// ── Audio Engine (AI Speech Synthesis & Audio Player) ──────────────
const AudioEngine = {
  speaking: false,
  utterance: null,
  audioEl: null,

  playAudioUrl(url, onEnd) {
    if (!url) return false;
    if (!this.audioEl) this.audioEl = new Audio();
    this.audioEl.src = url;
    this.audioEl.onended = () => {
      this.speaking = false;
      if (onEnd) onEnd();
    };
    this.audioEl.play().catch(e => {
      console.warn('Audio play error:', e);
      UI.toast('Chuyển sang giọng đọc AI bản ngữ chuẩn', 'info');
    });
    this.speaking = true;
    return true;
  },

  playScript(text, rate = 0.88, onEnd) {
    if (!('speechSynthesis' in window)) {
      UI.toast('Trình duyệt không hỗ trợ Web Speech API', 'warn');
      return false;
    }
    window.speechSynthesis.cancel();
    if (!text || !text.trim()) {
      UI.toast('Chưa có nội dung âm thanh để phát', 'warn');
      return false;
    }

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'en-US';
    utter.rate = rate; // Tốc độ điều chỉnh linh hoạt
    utter.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const enVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Zira') || v.name.includes('English')));
    if (enVoice) utter.voice = enVoice;

    this.speaking = true;
    utter.onend = () => {
      this.speaking = false;
      if (onEnd) onEnd();
    };
    utter.onerror = () => {
      this.speaking = false;
      if (onEnd) onEnd();
    };

    this.utterance = utter;
    window.speechSynthesis.speak(utter);
    return true;
  },

  stop() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (this.audioEl) {
      this.audioEl.pause();
      this.audioEl.currentTime = 0;
    }
    this.speaking = false;
  },

  playChime(type = 'success') {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (type === 'success') {
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.08);
          osc.stop(ctx.currentTime + idx * 0.08 + 0.35);
        });
      } else if (type === 'celebrate') {
        const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.5);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.1);
          osc.stop(ctx.currentTime + idx * 0.1 + 0.5);
        });
        if (typeof confetti === 'function') {
          confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
        }
      } else {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.22);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.22);
      }
    } catch (e) {
      // AudioContext not started
    }
  }
};

// ── Application Core ──────────────────────────────────────────────
const App = {
  state: {
    user: null, // Giáo viên hoặc Học sinh đã đăng nhập
    userRole: 'teacher', // 'teacher' | 'student'
    view: 'login',

    // Student Learning Hub State
    studentActiveGrade: 7,
    studentActiveUnit: 'Unit 1: Hobbies',
    vocabCardIndex: 0,
    vocabFlipped: false,
    listeningSpeed: 0.9,
    quizScore: 0,
    quizAnswers: {},

    // Student Exam Portal State
    studentExamId: null,
    studentExam: null,
    studentStarted: false,
    studentInfo: { name: '', class: '', id: '' },
    studentAnswers: {},
    studentTimeRemaining: 0,
    studentTimerInterval: null,
    studentAudioPlays: 0,
    studentAudioPlaying: false,

    // Teacher Wizard State
    wizard: {
      step: 1,
      grade: 7,
      subject: 'english',
      examFormat: 'cv7991',
      examTitle: 'Đề kiểm tra Giữa Học kỳ I – Tiếng Anh 7 Global Success',
      examClass: '7A1',
      examTime: 45,
      examSemester: 'Học kỳ I – 2024-2025',
      examType: 'Giữa kỳ',
      schoolName: 'TRƯỜNG THCS ĐỒNG YÊN',
      teacherName: 'Thầy Đinh Văn Thành',
      audioTitle: 'Track 1: Listening Comprehension',
      audioScript: 'Narrator: Listen to a short conversation between Nick and his doctor. Choose the best answer A, B, or C.\n\nDoctor: Good morning Nick. How are you feeling today?\nNick: Good morning doctor. I feel very tired, and my eyes are hurting after studying on my computer.\nDoctor: How many hours a day do you spend in front of computer screens?\nNick: About five to six hours, especially in the evening.\nDoctor: That is too much. You should take a short break every thirty minutes. Do you play any outdoor sports?\nNick: Not really doctor. I usually play video games on weekends.\nDoctor: You should join an outdoor sports club, like badminton or football. And remember to drink plenty of fresh water every day.\nNick: Thank you very much, doctor. I will follow your advice.',
      audioUrl: '',
      showScript: false,
      sections: [
        {
          name: 'PART A. LISTENING (File nghe Audio)',
          skill: 'listening',
          type: 'mc',
          points: 2.0,
          slots: [
            { chapterId: '', topic: '', level: 'NB', count: 2 },
            { chapterId: '', topic: '', level: 'TH', count: 2 }
          ]
        },
        {
          name: 'PART B. LANGUAGE FOCUS (Phát âm, Trọng âm, Từ vựng, Ngữ pháp)',
          skill: 'language',
          type: 'mc',
          points: 3.5,
          slots: [
            { chapterId: '', topic: '', level: 'NB', count: 3 },
            { chapterId: '', topic: '', level: 'TH', count: 4 }
          ]
        },
        {
          name: 'PART C. READING (Đọc hiểu & Điền khuyết)',
          skill: 'reading',
          type: 'mc',
          points: 2.5,
          slots: [
            { chapterId: '', topic: '', level: 'TH', count: 3 },
            { chapterId: '', topic: '', level: 'VD', count: 2 }
          ]
        },
        {
          name: 'PART D. WRITING (Sắp xếp từ & Viết lại câu)',
          skill: 'writing',
          type: 'essay',
          points: 2.0,
          slots: [
            { chapterId: '', topic: '', level: 'VD', count: 2 }
          ]
        }
      ],
      selectedSections: [],
      previewMode: 'student',
    },

    // Bank Filters
    bankFilter: { grade: '', skill: '', chapter: '', level: '', search: '', source: 'all' },
    sidebarOpen: false,
    previewAudioPlaying: false,

    // ── 15-Minute Exam Generator State (Chuẩn 48 Units - 05 Global 15 mins) ──
    quiz15m: {
      grade: '6',
      unitNum: 1,
      code1: '601',
      code2: '602',
      seed1: 42,
      seed2: 99,
      previewFace: 1,
      previewCodeIndex: 1,
      school: localStorage.getItem('cfg_school_name') || 'TRƯỜNG THCS ĐỒNG YÊN',
      parent: localStorage.getItem('cfg_parent_agency') || 'UBND XÃ ĐỒNG YÊN',
      year: localStorage.getItem('cfg_school_year') || '2025 - 2026'
    },

    // ── Official Periodic Exams State (Chuẩn CV 7991 - Tạo đề Tiếng Anh THCS Using) ──
    officialExams: {
      grade: '6',
      term: 'GK1',
      school: localStorage.getItem('cfg_school_name') || 'TRƯỜNG THCS ĐỒNG YÊN',
      parent: localStorage.getItem('cfg_parent_agency') || 'UBND XÃ ĐỒNG YÊN'
    },

    // ── Student 15m Practice State (Luyện thi 15 phút trực tuyến) ──
    student15m: {
      grade: '7',
      unitNum: 1,
      started: false,
      answers: {},
      timeRemaining: 900,
      timer: null,
      submitted: false,
      score: 0,
      model: null
    },

    // ── Knowledge Hub & Elite Modules State ──
    grammarFilterGrade: 'all',
    grammarSearchQuery: '',
    grammarQuizAnswers: {},
    phoneticsActiveTab: 's_es',
    phoneticsQuizAnswers: {},
    writingFilterGrade: 'all',
    writingSearchQuery: '',
    writingShowVi: {},
    answerSheetConfig: {
      school: localStorage.getItem('cfg_school_name') || 'TRƯỜNG THCS ĐỒNG YÊN',
      examTitle: 'BÀI KIỂM TRA ĐỊNH KỲ TIẾNG ANH THCS',
      examCode: '701'
    },

    // ── Đấu Trường Luyện Tập (5 Dạng Bài Thực Hành) ──
    practiceArena: {
      activeTab: 'scramble',
      grade: 7,
      scrambleIndex: 0,
      scramblePicked: [],
      scrambleChecked: false,
      scrambleIsCorrect: false,
      mistakeIndex: 0,
      mistakeSelected: null,
      transformIndex: 0,
      transformSelected: null,
      matchSelected: null,
      matchPairsDone: [],
      matchShuffledTiles: null,
      clozeSelections: {},
      clozeChecked: false,
    },
  },

  init() {
    Auth.initStorage();

    // Áp dụng Theme (Sáng / Tối) đã lưu
    const savedTheme = localStorage.getItem('app_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.body.setAttribute('data-theme', savedTheme);

    // Kiểm tra nếu mở link làm bài thi (?mode=student&examId=...)
    const urlParams = new URLSearchParams(window.location.search);
    const examId = urlParams.get('examId') || urlParams.get('exam');
    if ((urlParams.get('mode') === 'student' || urlParams.get('student') === '1') && examId) {
      this.state.studentExamId = examId;
      this.state.view = 'student-exam';
      this.renderStudentPortal(examId);
      setTimeout(() => {
        document.querySelector('.splash')?.remove();
      }, 300);
      return;
    }

    // Kiểm tra session đăng nhập
    const user = Auth.getSession();
    if (user) {
      this.state.user = user;
      this.state.userRole = user.role === 'student' ? 'student' : 'teacher';
      this.state.view = this.state.userRole === 'student' ? 'student-hub' : 'dashboard';
    }

    // Khởi tạo sẵn đề chuẩn 100% Khối 7 GK1 cho Wizard
    if (typeof OFFICIAL_EXAM_SUITES !== 'undefined' || window.OFFICIAL_EXAM_SUITES) {
      this.syncWizardOfficialTemplate('7', 'GK1');
    }

    this.render();

    setTimeout(() => {
      const splash = document.querySelector('.splash');
      if (splash) {
        splash.style.opacity = '0';
        splash.style.transition = 'opacity .35s';
        setTimeout(() => splash.remove(), 350);
      }
    }, 400);
  },

  render() {
    const root = document.getElementById('root');
    if (this.state.view === 'student-exam') {
      this.renderStudentPortal(this.state.studentExamId);
      return;
    }
    if (!this.state.user) {
      root.innerHTML = this.renderLogin();
      this.bindLogin();
      return;
    }
    root.innerHTML = this.renderShell();
    this.renderPage();
    this.bindSidebar();
  },

  navigate(view) {
    AudioEngine.stop();
    this.state.view = view;
    if (view === 'generate') {
      const curG = String((this.state.wizard && this.state.wizard.grade) || '7');
      const curT = this.getWizardTermKey ? this.getWizardTermKey() : 'GK1';
      this.syncWizardOfficialTemplate(curG, curT);
    }
    this.renderPage();
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.view === view);
    });
    window.scrollTo(0, 0);
  },

  renderShell() {
    const u = this.state.user;
    const isStudent = this.state.userRole === 'student';
    const canAdmin = Auth.canAccess(u, 'admin_panel');
    const remaining = Auth.getRemainingExams(u);
    const subCount = Auth.getSubmissions().length;

    // Menu cho Giáo viên
    const teacherNav = [
      { view: 'dashboard', icon: '🏠', label: 'Bàn làm việc' },
      { view: 'practice-arena', icon: '🎮', label: 'Đấu Trường Luyện Tập (5 Dạng)' },
      { view: 'quiz-15m', icon: '⚡', label: 'Tạo Đề 15 Phút (48 Units)' },
      { view: 'official-exams', icon: '🏛️', label: 'Bộ Đề Chuẩn (GK, CK, KSCL)' },
      { view: 'generate', icon: '📝', label: 'Soạn đề Tùy biến (CV 7991)', badge: remaining === Infinity ? null : remaining },
      { view: 'answer-sheet', icon: '🖨️', label: 'Phiếu Tô Trắc Nghiệm BGD' },
      { view: 'grammar-studio', icon: '⚡', label: 'Cẩm nang Ngữ pháp SGK' },
      { view: 'writing-lab', icon: '✍️', label: 'Kho Đoạn Văn Mẫu CV 7991' },
      { view: 'classrooms', icon: '🏫', label: 'Quản lý Lớp học' },
      { view: 'submissions', icon: '📥', label: 'Thu bài & Chấm điểm', badge: subCount > 0 ? subCount : null },
      { view: 'bank', icon: '📚', label: 'Ngân hàng Global Success' },
      { view: 'history', icon: '🕐', label: 'Đề đã tạo' },
    ];
    if (canAdmin) teacherNav.push({ view: 'admin', icon: '⚙️', label: 'Quản trị' });
    teacherNav.push({ view: 'settings', icon: '🔧', label: 'Cài đặt & Bản quyền' });

    // Menu cho Học sinh
    const studentNav = [
      { view: 'student-hub', icon: '🌟', label: 'Góc học tập' },
      { view: 'practice-arena', icon: '🎮', label: 'Đấu Trường Luyện Tập (5 Dạng)' },
      { view: 'student-15m-practice', icon: '⚡', label: 'Luyện Đề 15 Phút (48 Units)' },
      { view: 'grammar-studio', icon: '⚡', label: 'Cẩm nang Ngữ pháp Thần tốc' },
      { view: 'phonetics-lab', icon: '🎯', label: 'Bí kíp Ngữ âm & Trọng âm' },
      { view: 'writing-lab', icon: '✍️', label: 'Kho Văn Mẫu 80-100 Từ' },
      { view: 'vocab-studio', icon: '📖', label: 'Luyện Từ vựng (Flashcards)' },
      { view: 'listening-lab', icon: '🎧', label: 'Luyện Nghe (Audio Lab)' },
      { view: 'student-exams-list', icon: '✍️', label: 'Phòng thi trực tuyến' },
      { view: 'student-badges', icon: '🏆', label: 'Thành tích & Bảng điểm' },
    ];

    const currentNav = isStudent ? studentNav : teacherNav;

    return `
    <div class="shell">
      <!-- Sidebar -->
      <aside class="sidebar" id="sidebar">
        <div class="sidebar-logo">
          <div class="sidebar-logo-icon">🇬🇧</div>
          <div class="sidebar-logo-text">
            <strong>EnglishExam Pro</strong>
            <small>${isStudent ? 'Góc Học Sinh Global Success' : 'Global Success 6-9 · Đinh Văn Thành'}</small>
          </div>
        </div>

        <!-- Mode Switcher Badge -->
        <div style="padding:0 16px 12px">
          <div style="background:${isStudent ? 'linear-gradient(135deg,#059669,#10b981)' : 'linear-gradient(135deg,#1e3a8a,#2563eb)'};color:#fff;padding:8px 12px;border-radius:12px;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:space-between">
            <span>${isStudent ? '🎒 CỔNG HỌC SINH' : '👨‍🏫 CỔNG GIÁO VIÊN'}</span>
            <button onclick="App.switchPortalMode()" style="background:rgba(255,255,255,0.25);border:none;color:#fff;padding:2px 8px;border-radius:999px;font-size:10px;cursor:pointer;font-weight:700">
              Đổi vai trò
            </button>
          </div>
        </div>

        <nav class="sidebar-nav">
          <div class="nav-section-label">${isStudent ? 'Học tập & Luyện thi' : 'Hệ thống Quản lý & Soạn đề'}</div>
          ${currentNav.map(n => `
          <button class="nav-item ${this.state.view === n.view ? 'active' : ''}" data-view="${n.view}" onclick="App.navigate('${n.view}')">
            <span class="nav-icon">${n.icon}</span>
            <span>${n.label}</span>
            ${n.badge != null ? `<span class="nav-badge">${n.badge}</span>` : ''}
          </button>`).join('')}
        </nav>

        <!-- User Info Footer -->
        <div class="sidebar-footer">
          <div class="user-card" onclick="App.navigate(App.state.userRole==='student'?'student-badges':'settings')">
            <div class="user-avatar" style="background:${isStudent ? '#10b981' : (u.color || '#2563eb')}">
              ${isStudent ? '🎓' : (u.avatar || '👨‍🏫')}
            </div>
            <div class="user-info">
              <strong>${esc(u.name)}</strong>
              <small>
                ${isStudent ? `Lớp ${u.class || '7A1'} · ⭐ ${u.points || 100} điểm` : `GV · ${esc((u.school || 'THCS Đồng Yên').slice(0, 16))}`}
              </small>
            </div>
            <span class="user-more">›</span>
          </div>
        </div>
      </aside>

      <!-- Main Container -->
      <div class="main-content">
        <header class="topbar">
          <button class="btn btn-ghost btn-icon" id="sidebar-toggle" onclick="App.toggleSidebar()">☰</button>
          <div class="topbar-title" id="topbar-title">EnglishExam Pro</div>
          <div class="topbar-actions">
            <!-- Dark / Light Mode Switcher -->
            <button class="theme-toggle-btn" onclick="App.toggleTheme()" id="btn-theme-toggle" title="Chuyển chế độ Giao diện Sáng / Tối">
              <span id="theme-toggle-icon">${(document.documentElement.getAttribute('data-theme') === 'dark') ? '☀️' : '🌙'}</span>
              <span id="theme-toggle-text">${(document.documentElement.getAttribute('data-theme') === 'dark') ? 'Sáng' : 'Tối'}</span>
            </button>

            ${isStudent ? `
              <button class="btn btn-success" onclick="App.navigate('student-exams-list')">✍️ Làm bài thi</button>
            ` : `
              <button class="btn btn-primary" onclick="App.navigate('generate')">+ Tạo đề mới</button>
              <button class="btn btn-outline" onclick="App.showAssignExamModal()">🚀 Giao bài lớp</button>
            `}
            <button class="btn btn-ghost btn-icon" onclick="App.logout()" title="Đăng xuất">🚪</button>
          </div>
        </header>
        <div id="page-content"></div>
      </div>
    </div>`;
  },

  switchPortalMode() {
    if (this.state.userRole === 'teacher') {
      // Chuyển sang thử nghiệm giao diện học sinh
      const students = Auth.getStudents();
      const mockSt = students[0] || { name: 'Học sinh Trải nghiệm', grade: 7, class: '7A1', points: 200, role: 'student' };
      this.state.user = mockSt;
      this.state.userRole = 'student';
      this.state.view = 'student-hub';
      UI.toast('Đã chuyển sang Cổng Học Sinh trải nghiệm!', 'info');
    } else {
      // Chuyển về giáo viên
      const users = Auth.getUsers();
      const teacher = users.find(u => u.username === 'dinhvanthanh') || users[0];
      this.state.user = teacher;
      this.state.userRole = 'teacher';
      this.state.view = 'dashboard';
      UI.toast('Đã chuyển về Cổng Giáo Viên Thầy Đinh Văn Thành!', 'success');
    }
    this.render();
  },

  renderPage() {
    const el = document.getElementById('page-content');
    const titles = {
      'practice-arena': '🎮 Đấu Trường Luyện Tập 5 Dạng Bài Thực Hành – Global Success',
      'quiz-15m': '⚡ Tạo Đề 15 Phút Chuẩn 2 Mã Đề (48 Units) – Thầy Đinh Văn Thành',
      'official-exams': '🏛️ Bộ Đề Thi Chuẩn Định Kỳ (GK, CK, KSCL) CV 7991',
      'student-15m-practice': '⚡ Luyện Đề 15 Phút (48 Units) Global Success',
      dashboard: '🏠 Bàn làm việc Giáo viên',
      generate: '📝 Soạn đề Tiếng Anh THCS Global Success',
      classrooms: '🏫 Quản lý Lớp học & Học sinh',
      bank: '📚 Ngân hàng câu hỏi Global Success (Lớp 6–9)',
      history: '🕐 Danh sách đề thi đã tạo',
      submissions: '📥 Thu bài & Đánh giá kết quả học sinh',
      admin: '⚙️ Quản trị hệ thống EnglishExam Pro',
      settings: '🔧 Cài đặt & Bản quyền Thầy Đinh Văn Thành',
      preview: '📄 Xem trước đề thi Tiếng Anh',
      'student-hub': '🌟 Góc học tập Tiếng Anh Global Success',
      'vocab-studio': '📖 Flashcard Học Từ vựng SGK Global Success',
      'listening-lab': '🎧 Phòng Luyện Nghe Audio & Kịch bản',
      'student-exams-list': '✍️ Danh sách Đề thi trực tuyến',
      'student-badges': '🏆 Bảng thành tích & Điểm thưởng',
      'grammar-studio': '⚡ Cẩm nang Ngữ pháp Thần tốc SGK Global Success 6-9',
      'phonetics-lab': '🎯 Bí kíp Bất bại: Ngữ âm -s/ed & Trọng âm THCS',
      'writing-lab': '✍️ Kho Đoạn Văn Mẫu 80-100 Từ (Band 9-10) CV 7991',
      'answer-sheet': '🖨️ Phiếu Tô Trắc Nghiệm 36 Câu Chuẩn Bộ GD&ĐT',
    };
    if (document.getElementById('topbar-title')) {
      document.getElementById('topbar-title').textContent = titles[this.state.view] || 'EnglishExam Pro';
    }
    if (!el) return;

    const view = this.state.view;
    if (view === 'practice-arena') el.innerHTML = this.renderPracticeArena();
    else if (view === 'quiz-15m') el.innerHTML = this.renderQuiz15m();
    else if (view === 'official-exams') el.innerHTML = this.renderOfficialExams();
    else if (view === 'student-15m-practice') el.innerHTML = this.renderStudent15mPractice();
    else if (view === 'grammar-studio') el.innerHTML = this.renderGrammarStudio();
    else if (view === 'phonetics-lab') el.innerHTML = this.renderPhoneticsLab();
    else if (view === 'writing-lab') el.innerHTML = this.renderWritingLab();
    else if (view === 'answer-sheet') el.innerHTML = this.renderAnswerSheetView();
    else if (view === 'dashboard') el.innerHTML = this.renderDashboard();
    else if (view === 'generate') el.innerHTML = this.renderGenerate();
    else if (view === 'classrooms') el.innerHTML = this.renderClassrooms();
    else if (view === 'bank') el.innerHTML = this.renderBank();
    else if (view === 'history') el.innerHTML = this.renderHistory();
    else if (view === 'submissions') el.innerHTML = this.renderSubmissions();
    else if (view === 'admin') el.innerHTML = Admin.render(this.state.user);
    else if (view === 'settings') el.innerHTML = this.renderSettings();
    else if (view === 'preview') el.innerHTML = this.renderPreview();
    else if (view === 'student-hub') el.innerHTML = this.renderStudentHub();
    else if (view === 'vocab-studio') el.innerHTML = this.renderVocabStudio();
    else if (view === 'listening-lab') el.innerHTML = this.renderListeningLab();
    else if (view === 'student-exams-list') el.innerHTML = this.renderStudentExamsList();
    else if (view === 'student-badges') el.innerHTML = this.renderStudentBadges();
  },

  // ── Màn hình Đăng nhập & Đăng ký Học sinh ────────────────────────
  renderLogin() {
    return `
    <div style="min-height:100vh;display:flex;background:var(--bg)">
      <!-- Left Hero Banner -->
      <div style="flex:1;background:linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #0284c7 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:50px;color:#fff;min-height:100vh" class="no-print">
        <div style="font-size:68px;margin-bottom:16px;animation:audioPulse 2s infinite">🇬🇧</div>
        <h1 style="font-size:36px;font-weight:900;letter-spacing:-0.03em;margin-bottom:12px;text-align:center">EnglishExam Pro</h1>
        <p style="font-size:16px;opacity:0.95;text-align:center;max-width:480px;line-height:1.7">
          Nền tảng Học tập & Đánh giá Tiếng Anh THCS<br/>
          <strong>Bám sát giáo trình Global Success (Lớp 6, 7, 8, 9)</strong><br/>
          <span style="font-size:13.5px;color:#93c5fd;margin-top:6px;display:inline-block">Tác giả & Bản quyền: Thầy Đinh Văn Thành – THCS Đồng Yên (0915.213717)</span>
        </p>

        <div style="margin-top:36px;display:flex;gap:12px;flex-wrap:wrap;justify-content:center;max-width:520px">
          ${[
            ['📖', 'Học Từ vựng 3D'],
            ['🎧', 'Luyện Nghe Audio'],
            ['📱', 'Thi trực tiếp Mobile'],
            ['🏫', 'Quản lý Lớp học'],
            ['📊', 'Ma trận CV 7991'],
            ['📜', 'Nghị định 30']
          ].map(([icon, label]) => `
          <div style="text-align:center;background:rgba(255,255,255,0.18);padding:10px 16px;border-radius:14px;backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.25)">
            <div style="font-size:20px">${icon}</div>
            <div style="font-size:12px;margin-top:3px;font-weight:600">${label}</div>
          </div>`).join('')}
        </div>
      </div>

      <!-- Right Form Box -->
      <div style="width:500px;display:flex;align-items:center;justify-content:center;padding:40px;flex-shrink:0">
        <div style="width:100%;max-width:390px">
          <!-- Role Selector Tab -->
          <div class="tabs mb-20" style="padding:4px">
            <button class="tab-btn active" id="tab-login-teacher" onclick="App.switchLoginForm('teacher')">👨‍🏫 Giáo viên</button>
            <button class="tab-btn" id="tab-login-student" onclick="App.switchLoginForm('student')">🎒 Học sinh</button>
          </div>

          <div id="login-header-area">
            <h2 style="font-size:24px;font-weight:800;margin-bottom:6px;color:#0f172a">Đăng nhập Giáo viên</h2>
            <p style="color:var(--ink-soft);font-size:13.5px;margin-bottom:24px">Kính chào Thầy/Cô! Đăng nhập để quản lý lớp và tạo đề.</p>
          </div>

          <div id="login-err" style="display:none;background:var(--red-soft);border:1px solid #fca5a5;border-radius:12px;padding:12px 16px;font-size:13px;color:var(--red);font-weight:500;margin-bottom:16px"></div>

          <!-- Login Input Fields -->
          <div class="stack gap-14" id="login-fields">
            <div class="field">
              <label class="label">Tên đăng nhập</label>
              <div class="input-group">
                <span class="input-icon">👤</span>
                <input id="l-user" type="text" placeholder="Nhập tài khoản..." value="dinhvanthanh" autofocus/>
              </div>
            </div>
            <div class="field">
              <label class="label">Mật khẩu</label>
              <div class="input-group">
                <span class="input-icon">🔒</span>
                <input id="l-pass" type="password" placeholder="Nhập mật khẩu..." value="Admin@2024!"/>
              </div>
            </div>
            <button id="l-btn" class="btn btn-primary btn-lg w-full" style="margin-top:6px">
              🚀 Đăng nhập hệ thống
            </button>
          </div>

          <!-- Register Student Option -->
          <div id="student-register-prompt" style="display:none;margin-top:16px;text-align:center">
            <span style="font-size:13.5px;color:var(--ink-soft)">Chưa có tài khoản học sinh? </span>
            <a href="javascript:void(0)" onclick="App.showStudentRegisterModal()" style="font-size:13.5px;font-weight:700;color:#2563eb">Đăng ký ngay tại đây!</a>
          </div>

          <!-- Quick Accounts -->
          <div style="margin-top:24px;padding:14px;background:var(--surface-2);border-radius:12px;border:1px solid var(--line)">
            <p style="font-size:11.5px;font-weight:700;color:var(--ink-soft);margin-bottom:8px;text-transform:uppercase;letter-spacing:.05em">Tài khoản chuẩn</p>
            <div style="display:flex;align-items:center;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--line);font-size:12.5px;cursor:pointer"
                 onclick="App.quickLogin('dinhvanthanh','Admin@2024!','teacher')">
              <span>👨‍🏫 <strong>dinhvanthanh</strong> / Admin@2024!</span>
              <span class="tag tag-nb" style="font-size:10px">Thầy Thành</span>
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;padding:6px 0;font-size:12.5px;cursor:pointer"
                 onclick="App.quickLogin('nguyenvanan','123','student')">
              <span>🎒 <strong>nguyenvanan</strong> / 123</span>
              <span class="tag tag-th" style="font-size:10px">HS Lớp 7</span>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  },

  switchLoginForm(role) {
    const btnT = document.getElementById('tab-login-teacher');
    const btnS = document.getElementById('tab-login-student');
    const header = document.getElementById('login-header-area');
    const uInput = document.getElementById('l-user');
    const pInput = document.getElementById('l-pass');
    const regPrompt = document.getElementById('student-register-prompt');

    if (role === 'teacher') {
      btnT?.classList.add('active');
      btnS?.classList.remove('active');
      header.innerHTML = `
        <h2 style="font-size:24px;font-weight:800;margin-bottom:6px;color:#0f172a">Đăng nhập Giáo viên</h2>
        <p style="color:var(--ink-soft);font-size:13.5px;margin-bottom:24px">Kính chào Thầy/Cô! Đăng nhập để quản lý lớp và tạo đề.</p>`;
      uInput.value = 'dinhvanthanh';
      pInput.value = 'Admin@2024!';
      regPrompt.style.display = 'none';
      this.state.userRole = 'teacher';
    } else {
      btnS?.classList.add('active');
      btnT?.classList.remove('active');
      header.innerHTML = `
        <h2 style="font-size:24px;font-weight:800;margin-bottom:6px;color:#059669">Đăng nhập Học sinh</h2>
        <p style="color:var(--ink-soft);font-size:13.5px;margin-bottom:24px">Chào mừng em! Đăng nhập để học từ vựng, luyện nghe và làm bài thi.</p>`;
      uInput.value = 'nguyenvanan';
      pInput.value = '123';
      regPrompt.style.display = 'block';
      this.state.userRole = 'student';
    }
  },

  quickLogin(user, pass, role) {
    this.switchLoginForm(role);
    document.getElementById('l-user').value = user;
    document.getElementById('l-pass').value = pass;
    document.getElementById('l-btn')?.click();
  },

  bindLogin() {
    const doLogin = () => {
      const u = document.getElementById('l-user').value.trim();
      const p = document.getElementById('l-pass').value;

      if (this.state.userRole === 'student') {
        const student = Auth.loginStudent(u, p);
        if (student) {
          this.state.user = student;
          this.state.view = 'student-hub';
          this.render();
          return;
        }
      }

      // Đăng nhập giáo viên
      const user = Auth.login(u, p);
      if (user) {
        this.state.user = user;
        this.state.userRole = 'teacher';
        this.state.view = 'dashboard';
        this.render();
      } else {
        const err = document.getElementById('login-err');
        err.textContent = '❌ Sai tên đăng nhập hoặc mật khẩu. Vui lòng kiểm tra lại.';
        err.style.display = 'block';
      }
    };

    document.getElementById('l-btn')?.addEventListener('click', doLogin);
    document.getElementById('l-pass')?.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
  },

  // ── Đăng ký tài khoản Học sinh ──────────────────────────────────
  showStudentRegisterModal() {
    const classes = Auth.getClasses();
    const bodyHtml = `
      <div class="stack gap-12">
        <div class="field">
          <label class="label">Họ và tên học sinh <span style="color:#ef4444">*</span></label>
          <input id="reg-name" type="text" placeholder="Ví dụ: Hoàng Tuấn Kiệt" autofocus />
        </div>
        <div class="grid grid-2 gap-12">
          <div class="field">
            <label class="label">Khối lớp</label>
            <select id="reg-grade">
              <option value="6">Lớp 6 Global Success</option>
              <option value="7" selected>Lớp 7 Global Success</option>
              <option value="8">Lớp 8 Global Success</option>
              <option value="9">Lớp 9 Global Success</option>
            </select>
          </div>
          <div class="field">
            <label class="label">Lớp học / Mã lớp</label>
            <input id="reg-class" type="text" placeholder="Ví dụ: 7A1 hoặc mã DY7A1" value="7A1" />
          </div>
        </div>
        <div class="field">
          <label class="label">Trường học</label>
          <input id="reg-school" type="text" value="Trường THCS Đồng Yên" />
        </div>
        <div class="grid grid-2 gap-12">
          <div class="field">
            <label class="label">Tên đăng nhập <span style="color:#ef4444">*</span></label>
            <input id="reg-username" type="text" placeholder="tuankiet7a" />
          </div>
          <div class="field">
            <label class="label">Mật khẩu <span style="color:#ef4444">*</span></label>
            <input id="reg-password" type="password" placeholder="Tối thiểu 3 ký tự..." />
          </div>
        </div>
      </div>
    `;

    UI.showModal('🎒 Đăng ký tài khoản Học sinh', bodyHtml, [
      {
        label: 'Tạo tài khoản ngay',
        cls: 'btn-primary',
        action: () => {
          const name = document.getElementById('reg-name')?.value?.trim();
          const username = document.getElementById('reg-username')?.value?.trim();
          const password = document.getElementById('reg-password')?.value;
          const grade = parseInt(document.getElementById('reg-grade')?.value) || 7;
          const cls = document.getElementById('reg-class')?.value?.trim() || '7A1';
          const school = document.getElementById('reg-school')?.value?.trim() || 'Trường THCS Đồng Yên';

          if (!name || !username || !password) {
            alert('Vui lòng điền đầy đủ các thông tin bắt buộc (*)');
            return;
          }

          const res = Auth.registerStudent({ name, username, password, grade, class: cls, school });
          if (res.ok) {
            UI.closeModal();
            UI.toast('🎉 Chúc mừng em đã đăng ký tài khoản thành công! Tặng em 100 điểm thưởng.', 'success', 4500);
            this.state.user = res.student;
            this.state.userRole = 'student';
            this.state.view = 'student-hub';
            this.render();
          } else {
            alert(res.msg);
          }
        }
      },
      { label: 'Hủy', cls: 'btn-outline', action: () => UI.closeModal() }
    ]);
  },

  logout() {
    AudioEngine.stop();
    Auth.logout();
    this.state.user = null;
    this.state.view = 'login';
    this.render();
  },

  toggleSidebar() {
    document.getElementById('sidebar')?.classList.toggle('open');
  },

  bindSidebar() {
    document.addEventListener('click', (e) => {
      const sidebar = document.getElementById('sidebar');
      const toggle = document.getElementById('sidebar-toggle');
      if (sidebar && !sidebar.contains(e.target) && e.target !== toggle) {
        sidebar.classList.remove('open');
      }
    }, { once: false, capture: false });
  },

  // ================================================================
  // CỔNG HỌC SINH (STUDENT LEARNING HUB)
  // ================================================================
  renderStudentHub() {
    const st = this.state.user;
    const grade = st.grade || 7;
    const chapters = CHAPTERS.english[grade] || [];

    return `
    <div class="page-body slide-up">
      <!-- Student Hero Welcome -->
      <div class="welcome-banner" style="background:linear-gradient(135deg,#065f46 0%,#059669 50%,#10b981 100%)">
        <div>
          <h2>Chào em, ${esc(st.name)}! 🌟</h2>
          <p>Lớp: <b>${esc(st.class || '7A1')}</b> – ${esc(st.school || 'THCS Đồng Yên')} | Chương trình Tiếng Anh Global Success</p>
          <div class="row gap-8 mt-12">
            <span style="background:rgba(255,255,255,0.22);color:#fff;padding:4px 14px;border-radius:999px;font-size:12.5px;font-weight:700">
              ⭐ Điểm thưởng: ${st.points || 100} XP
            </span>
            <span style="background:rgba(255,255,255,0.22);color:#fff;padding:4px 14px;border-radius:999px;font-size:12.5px;font-weight:600">
              🏆 Danh hiệu: Học sinh Chăm chỉ
            </span>
          </div>
        </div>
        <button class="btn btn-xl" onclick="App.navigate('student-exams-list')"
          style="background:rgba(255,255,255,0.25);color:#fff;border-color:rgba(255,255,255,0.5);backdrop-filter:blur(8px);font-weight:800">
          ✍️ Vào Phòng Thi Online
        </button>
      </div>

      <!-- Đấu Trường Luyện Tập Thực Hành 5 Dạng Bài -->
      <div class="card mb-24" style="background:linear-gradient(135deg,#1e1b4b 0%,#312e81 40%,#4338ca 70%,#6366f1 100%);color:#fff;border:none;padding:26px 30px;border-radius:18px;box-shadow:0 12px 30px rgba(67,56,202,0.3);position:relative;overflow:hidden">
        <div style="position:relative;z-index:2;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:18px">
          <div>
            <div style="display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,0.2);padding:4px 12px;border-radius:999px;font-size:12px;font-weight:700;margin-bottom:10px">
              <span>🔥 TÍNH NĂNG MỚI ĐẶC SẮC</span>
              <span>•</span>
              <span>5 DẠNG BÀI TẬP THỰC HÀNH TƯƠNG TÁC</span>
            </div>
            <h2 style="font-size:24px;font-weight:900;color:#fff;margin:0 0 6px">🎮 Đấu Trường Luyện Tập Thực Hành</h2>
            <p style="color:#e0e7ff;font-size:14px;max-width:580px;line-height:1.5;margin:0">
              Đa dạng hóa bài tập: <b>Ghép từ thành câu</b>, <b>Bắt lỗi sai ngữ pháp</b>, <b>Viết lại câu tương đương</b>, <b>Ghép thẻ bài tương tác</b> và <b>Điền từ đoạn văn</b> kèm âm thanh hiệu ứng & pháo hoa rực rỡ!
            </p>
          </div>
          <div class="row gap-10">
            <button class="btn btn-xl" onclick="App.navigate('practice-arena')"
              style="background:#f59e0b;color:#1e1b4b;font-weight:900;border:none;box-shadow:0 6px 16px rgba(245,158,11,0.4);border-radius:12px">
              ⚡ Vào Đấu Trường Ngay
            </button>
          </div>
        </div>
      </div>

      <!-- Feature Grid for Student -->
      <div class="grid grid-3 gap-16 mb-24">
        <!-- 1. Luyện Đề 15 Phút -->
        <div class="card" style="border-top:4px solid #f59e0b;cursor:pointer;transition:transform .2s" onclick="App.navigate('student-15m-practice')">
          <div style="font-size:32px;margin-bottom:8px">⚡</div>
          <div style="font-weight:800;font-size:16px;color:var(--ink)">Luyện Đề 15 Phút (48 Units)</div>
          <p style="font-size:13px;color:var(--ink-soft);margin-top:6px">Luyện nhanh 20 câu trắc nghiệm từ vựng & ngữ pháp chuẩn SGK, có đồng hồ bấm giờ và chấm điểm tự động.</p>
          <div style="margin-top:12px;font-size:13px;font-weight:700;color:#d97706">Bắt đầu làm đề 15P →</div>
        </div>

        <!-- 2. Cẩm nang Ngữ pháp -->
        <div class="card" style="border-top:4px solid #6366f1;cursor:pointer;transition:transform .2s" onclick="App.navigate('grammar-studio')">
          <div style="font-size:32px;margin-bottom:8px">⚡</div>
          <div style="font-weight:800;font-size:16px;color:var(--ink)">Cẩm nang Ngữ pháp Thần tốc</div>
          <p style="font-size:13px;color:var(--ink-soft);margin-top:6px">Bí kíp công thức chuẩn, mẹo nhớ thần tốc độc quyền và trắc nghiệm thực chiến bám sát SGK 6-9.</p>
          <div style="margin-top:12px;font-size:13px;font-weight:700;color:#4f46e5">Xem cẩm nang ngữ pháp →</div>
        </div>

        <!-- 3. Bí kíp Ngữ âm & Trọng âm -->
        <div class="card" style="border-top:4px solid #10b981;cursor:pointer;transition:transform .2s" onclick="App.navigate('phonetics-lab')">
          <div style="font-size:32px;margin-bottom:8px">🎯</div>
          <div style="font-weight:800;font-size:16px;color:var(--ink)">Bí kíp Ngữ âm & Trọng âm</div>
          <p style="font-size:13px;color:var(--ink-soft);margin-top:6px">Quy tắc -s/es, -ed, trọng âm 2 & 3 âm tiết. Bấm nghe phát âm AI chuẩn bản xứ và làm bài tập trắc nghiệm.</p>
          <div style="margin-top:12px;font-size:13px;font-weight:700;color:#059669">Luyện âm & trọng âm →</div>
        </div>

        <!-- 4. Kho Đoạn Văn Mẫu 80-100 Từ -->
        <div class="card" style="border-top:4px solid #ea580c;cursor:pointer;transition:transform .2s" onclick="App.navigate('writing-lab')">
          <div style="font-size:32px;margin-bottom:8px">✍️</div>
          <div style="font-weight:800;font-size:16px;color:var(--ink)">Kho Văn Mẫu 80-100 Từ (Band 9-10)</div>
          <p style="font-size:13px;color:var(--ink-soft);margin-top:6px">12 bài mẫu tự luận chuẩn CV 7991, công thức 3 bước vàng, cụm từ vựng nâng cao và bản dịch song ngữ.</p>
          <div style="margin-top:12px;font-size:13px;font-weight:700;color:#c2410c">Khám phá văn mẫu →</div>
        </div>

        <!-- 5. Học từ vựng Flashcards -->
        <div class="card" style="border-top:4px solid #3b82f6;cursor:pointer;transition:transform .2s" onclick="App.navigate('vocab-studio')">
          <div style="font-size:32px;margin-bottom:8px">📖</div>
          <div style="font-weight:800;font-size:16px;color:var(--ink)">Học Từ vựng Flashcards 3D</div>
          <p style="font-size:13px;color:var(--ink-soft);margin-top:6px">Tra cứu từ vựng chuẩn SGK Global Success, nghe phát âm giọng bản xứ và lật thẻ 3D ghi nhớ sâu.</p>
          <div style="margin-top:12px;font-size:13px;font-weight:700;color:#2563eb">Mở thẻ từ vựng →</div>
        </div>

        <!-- 6. Luyện nghe Audio Lab -->
        <div class="card" style="border-top:4px solid #0ea5e9;cursor:pointer;transition:transform .2s" onclick="App.navigate('listening-lab')">
          <div style="font-size:32px;margin-bottom:8px">🎧</div>
          <div style="font-weight:800;font-size:16px;color:var(--ink)">Phòng Luyện Nghe Audio Lab</div>
          <p style="font-size:13px;color:var(--ink-soft);margin-top:6px">Luyện nghe hội thoại và bài đọc theo từng Unit, kèm phụ đề kịch bản và câu hỏi trắc nghiệm tương tác.</p>
          <div style="margin-top:12px;font-size:13px;font-weight:700;color:#0284c7">Bắt đầu luyện nghe →</div>
        </div>
      </div>

      <!-- Units Roadmap -->
      <div class="card">
        <div class="section-header">
          <div class="section-title">📚 Danh mục 12 Units SGK Tiếng Anh ${grade} Global Success</div>
          <span class="tag tag-nb">Lớp ${grade}</span>
        </div>
        <div class="grid grid-3 gap-12 mt-12">
          ${chapters.map((ch, idx) => `
            <div class="card" style="padding:14px;background:#f8fafc;border:1px solid var(--line)">
              <div style="display:flex;align-items:center;justify-content:space-between">
                <span class="tag tag-th" style="font-size:11px">Unit ${idx + 1}</span>
                <span style="font-size:12px;color:#64748b">4 chủ đề</span>
              </div>
              <div style="font-weight:700;font-size:14px;color:#0f172a;margin:8px 0 4px">${esc(ch.name)}</div>
              <ul style="font-size:12px;color:#475569;padding-left:16px;line-height:1.6">
                ${ch.topics.slice(0, 2).map(tp => `<li>${esc(tp)}</li>`).join('')}
              </ul>
              <div class="row gap-8 mt-12">
                <button class="btn btn-outline btn-sm" onclick="App.openUnitVocab('${ch.name}')">📖 Học từ</button>
                <button class="btn btn-primary btn-sm" onclick="App.navigate('student-exams-list')">✍️ Làm đề</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>`;
  },

  openUnitVocab(unitName) {
    this.state.studentActiveUnit = unitName;
    this.navigate('vocab-studio');
  },

  // ── Khu Luyện Từ Vựng Flashcards 3D ──────────────────────────────
  renderVocabStudio() {
    const grade = this.state.studentActiveGrade;
    const words = GLOBAL_SUCCESS_VOCABULARY.filter(w => w.grade === grade);
    const currWord = words[this.state.vocabCardIndex % (words.length || 1)] || words[0];

    return `
    <div class="page-body slide-up" style="max-width:900px;margin:0 auto">
      <div class="section-header">
        <div>
          <div class="section-title">📖 Flashcard Học Từ Vựng SGK Global Success (12 Units)</div>
          <div style="font-size:13px;color:var(--ink-soft);margin-top:4px">Chọn lớp và bấm để lật thẻ ghi nhớ, nghe phát âm chuẩn bản ngữ AI Voice</div>
        </div>
        <div class="row gap-8">
          ${[6, 7, 8, 9].map(g => `
          <button class="btn btn-sm ${grade === g ? 'btn-primary' : 'btn-outline'}" onclick="App.setVocabGrade(${g})">
            Lớp ${g}
          </button>`).join('')}
        </div>
      </div>

      <!-- Shortcut to Practice Arena -->
      <div class="card p-14 mb-20" style="background:linear-gradient(135deg,#eff6ff,#f5f3ff);border:1.5px solid #c7d2fe;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;border-radius:14px">
        <div class="row gap-10 align-center">
          <span style="font-size:24px">🎮</span>
          <div>
            <strong style="color:#312e81;font-size:14px">Muốn thực hành áp dụng ngay từ vựng này?</strong>
            <div style="font-size:12.5px;color:#4338ca">Thử sức tại Đấu Trường Luyện Tập với Ghép câu, Bắt lỗi sai, Ghép thẻ bài 3D và Điền từ!</div>
          </div>
        </div>
        <button class="btn btn-primary btn-sm" onclick="App.navigate('practice-arena')">
          🚀 Mở Đấu Trường Luyện Tập
        </button>
      </div>

      <!-- Flashcard Interactive 3D Card -->
      <div class="card text-center mb-24"
           style="padding:48px 32px;cursor:pointer;border:3px solid ${currWord.color || '#3b82f6'};background:linear-gradient(135deg,#ffffff,${(currWord.color || '#3b82f6')}11);box-shadow:0 12px 28px ${(currWord.color || '#3b82f6')}22;min-height:330px;display:flex;flex-direction:column;justify-content:center;align-items:center;border-radius:20px;transition:transform .2s"
           onclick="App.toggleVocabFlip()">
        <div class="row gap-8 mb-14 align-center">
          <span class="tag tag-nb">${esc(currWord.unit)}</span>
          <span style="background:${currWord.color || '#3b82f6'};color:#fff;padding:2px 10px;border-radius:999px;font-size:11px;font-weight:700">Lớp ${currWord.grade}</span>
        </div>

        ${!this.state.vocabFlipped ? `
          <!-- Front Side -->
          <div style="font-size:64px;margin-bottom:12px;line-height:1;filter:drop-shadow(0 4px 8px rgba(0,0,0,0.1))">
            ${currWord.icon || '📘'}
          </div>
          <div style="font-size:42px;font-weight:900;color:#1e3a8a;margin-bottom:8px">
            ${esc(currWord.word)}
          </div>
          <div style="font-size:18px;color:${currWord.color || '#0284c7'};font-family:monospace;font-weight:700">
            ${esc(currWord.ipa)} &nbsp;<span style="font-size:13.5px;color:#64748b;font-weight:600">(${esc(currWord.pos)})</span>
          </div>
          <div style="margin-top:20px;font-size:13px;color:#64748b">
            👉 Bấm vào thẻ để xem Nghĩa tiếng Việt & Câu ví dụ trong SGK
          </div>
        ` : `
          <!-- Back Side -->
          <div style="font-size:48px;margin-bottom:8px">${currWord.icon || '✨'}</div>
          <div style="font-size:30px;font-weight:900;color:#059669;margin-bottom:12px">
            ${esc(currWord.meaning)}
          </div>
          <div style="font-size:15px;color:#334155;max-width:540px;line-height:1.6;font-style:italic;background:#ffffff;padding:14px 20px;border-radius:14px;border:1.5px dashed ${(currWord.color || '#cbd5e1')}">
            "${esc(currWord.example)}"
          </div>
          <div style="margin-top:16px;font-size:12.5px;color:#64748b">
            🔄 Bấm lần nữa để lật lại mặt trước
          </div>
        `}
      </div>

      <!-- Controls Bar -->
      <div class="card flex-between" style="padding:16px 24px;border-radius:14px">
        <button class="btn btn-outline" onclick="App.prevVocabCard()">
          ← Từ trước
        </button>
        <div class="row gap-12" style="align-items:center">
          <button class="btn btn-primary" onclick="App.speakWord('${currWord.word}')">
            🔊 Nghe phát âm AI
          </button>
          <span style="font-size:13px;font-weight:700;color:#64748b">
            ${(this.state.vocabCardIndex % words.length) + 1} / ${words.length}
          </span>
        </div>
        <button class="btn btn-primary" onclick="App.nextVocabCard()">
          Từ tiếp theo →
        </button>
      </div>

      <!-- Full Vocabulary List -->
      <div class="card mt-24" style="border-radius:14px">
        <div class="section-title mb-16">📋 Kho Từ vựng trọng tâm SGK Lớp ${grade} Global Success</div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Từ vựng</th>
                <th>Phiên âm</th>
                <th>Nghĩa tiếng Việt</th>
                <th>Ví dụ trong SGK</th>
                <th>Phát âm</th>
              </tr>
            </thead>
            <tbody>
              ${words.map(w => `
              <tr>
                <td>
                  <span style="font-size:18px;margin-right:6px">${w.icon || '🔹'}</span>
                  <strong style="color:#1e3a8a;font-size:14.5px">${esc(w.word)}</strong>
                  <small style="color:#64748b;font-weight:600">(${w.pos})</small>
                </td>
                <td style="font-family:monospace;color:${w.color || '#0284c7'};font-weight:600">${esc(w.ipa)}</td>
                <td><b style="color:#059669">${esc(w.meaning)}</b></td>
                <td style="font-size:12.5px;color:#475569"><i>${esc(w.example)}</i></td>
                <td>
                  <button class="btn btn-sm btn-outline" onclick="App.speakWord('${w.word}')">🔊 Nghe</button>
                </td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>`;
  },

  setVocabGrade(g) {
    this.state.studentActiveGrade = g;
    this.state.vocabCardIndex = 0;
    this.state.vocabFlipped = false;
    this.renderPage();
  },

  toggleVocabFlip() {
    this.state.vocabFlipped = !this.state.vocabFlipped;
    this.renderPage();
  },

  nextVocabCard() {
    this.state.vocabCardIndex++;
    this.state.vocabFlipped = false;
    this.renderPage();
  },

  prevVocabCard() {
    if (this.state.vocabCardIndex > 0) this.state.vocabCardIndex--;
    this.state.vocabFlipped = false;
    this.renderPage();
  },

  speakWord(word) {
    AudioEngine.playScript(word, 0.85);
  },

  // ── Khu Luyện Nghe Audio Lab ─────────────────────────────────────
  renderListeningLab() {
    return `
    <div class="page-body slide-up" style="max-width:900px;margin:0 auto">
      <div class="section-header">
        <div>
          <div class="section-title">🎧 Phòng Luyện Nghe Audio Lab (Global Success)</div>
          <div style="font-size:13px;color:var(--ink-soft);margin-top:4px">Nghe các đoạn hội thoại chuẩn bản xứ, xem kịch bản và làm bài tập trắc nghiệm</div>
        </div>
      </div>

      <div class="stack gap-20">
        ${GLOBAL_SUCCESS_LISTENING_LAB.map((item, idx) => `
        <div class="card" style="border:1.5px solid #0ea5e9;padding:22px">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px">
            <div>
              <span class="tag tag-nb">Lớp ${item.grade} · ${esc(item.unit)}</span>
              <h3 style="font-size:16px;font-weight:800;color:#0369a1;margin-top:6px">${esc(item.title)}</h3>
            </div>
            <div class="row gap-8">
              <button class="btn btn-primary btn-sm" onclick="App.playLabAudio('${item.id}')">
                ▶ Nghe bài đọc (AI Voice)
              </button>
              <button class="btn btn-outline btn-sm" onclick="AudioEngine.stop()">
                ⏹ Dừng
              </button>
            </div>
          </div>

          <!-- Script Box -->
          <div style="background:#f8fafc;border:1px dashed #0284c7;border-radius:var(--r-md);padding:14px 18px;margin:14px 0;font-size:13.5px;line-height:1.7;color:#1e293b;white-space:pre-wrap">
            <b>📜 Audio Script / Lời bài nghe:</b>\n${esc(item.audioScript)}
          </div>

          <!-- Quiz Questions for Listening -->
          <div style="margin-top:16px;border-top:1px solid #e2e8f0;padding-top:12px">
            <div style="font-weight:700;font-size:13.5px;color:#0f172a;margin-bottom:8px">📝 Câu hỏi nghe hiểu:</div>
            ${item.questions.map((q, qi) => `
              <div style="margin-bottom:10px;font-size:13.5px">
                <b>${qi + 1}. ${esc(q.q)}</b>
                <div class="grid grid-2 gap-6 mt-6">
                  ${q.options.map(opt => `
                    <div style="background:#fff;border:1px solid #cbd5e1;padding:6px 12px;border-radius:8px;cursor:pointer"
                         onclick="alert('Đáp án đúng là: ${q.answer}')">
                      ${esc(opt)}
                    </div>`).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>`).join('')}
      </div>
    </div>`;
  },

  playLabAudio(labId) {
    const item = GLOBAL_SUCCESS_LISTENING_LAB.find(x => x.id === labId);
    if (!item) return;
    AudioEngine.playScript(item.audioScript, this.state.listeningSpeed || 0.9);
    UI.toast('Đang phát âm thanh bài nghe...', 'info');
  },

  // ── Danh sách Đề thi cho Học sinh làm bài ────────────────────────
  renderStudentExamsList() {
    const exams = Auth.getPublishedExams();

    return `
    <div class="page-body slide-up">
      <div class="section-header">
        <div>
          <div class="section-title">✍️ Phòng thi Trực tuyến & Bài tập Giáo viên giao</div>
          <div style="font-size:13px;color:var(--ink-soft);margin-top:4px">Chọn đề thi để làm bài trực tiếp trên điện thoại hoặc máy tính</div>
        </div>
      </div>

      <div class="grid grid-3 gap-16">
        ${exams.map(e => `
        <div class="card" style="border:1.5px solid var(--line);padding:20px;display:flex;flex-direction:column;justify-content:space-between">
          <div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
              <span class="badge badge-g${e.grade}">Lớp ${e.grade} Global Success</span>
              <span class="tag ${e.isOpen ? 'tag-nb' : 'tag-vdc'}">${e.isOpen ? 'Đang mở' : 'Đã đóng'}</span>
            </div>
            <h3 style="font-size:16px;font-weight:800;color:#0f172a;line-height:1.5;margin-bottom:6px">${esc(e.title)}</h3>
            <div style="font-size:12.5px;color:#64748b">
              Thời gian: <b>${e.examTime} phút</b> · Số câu: <b>${e.sections?.reduce((s, sec) => s + sec.questions.length, 0) || 20} câu</b>
            </div>
            <div style="font-size:12px;color:#475569;margin-top:4px">
              Giáo viên: <b>${esc(e.teacherName || 'Thầy Đinh Văn Thành')}</b>
            </div>
          </div>

          <div style="margin-top:20px">
            <button class="btn btn-primary w-full" onclick="App.openStudentExamDirect('${e.id}')" ${!e.isOpen ? 'disabled' : ''}>
              ${e.isOpen ? '🚀 Bắt đầu làm bài thi' : '🔒 Đề đã kết thúc'}
            </button>
          </div>
        </div>`).join('')}
      </div>
    </div>`;
  },

  openStudentExamDirect(examId) {
    this.state.studentExamId = examId;
    this.state.studentStarted = false;
    this.state.view = 'student-exam';
    this.renderStudentPortal(examId);
  },

  // ── Bảng thành tích học sinh ─────────────────────────────────────
  renderStudentBadges() {
    const st = this.state.user;
    const subs = Auth.getSubmissions().filter(s => s.studentName === st.name || s.studentId === st.id);

    return `
    <div class="page-body slide-up" style="max-width:800px;margin:0 auto">
      <div class="section-title mb-16">🏆 Bảng Thành tích & Lịch sử Học tập</div>

      <!-- Profile Summary -->
      <div class="card mb-20" style="padding:24px;border:1.5px solid #10b981;background:linear-gradient(135deg,#f0fdf4,#dcfce7)">
        <div style="display:flex;align-items:center;gap:16px">
          <div style="font-size:48px">🎓</div>
          <div>
            <h2 style="font-size:22px;font-weight:900;color:#065f46">${esc(st.name)}</h2>
            <div style="font-size:13.5px;color:#047857">
              Lớp: <b>${esc(st.class || '7A1')}</b> | Trường: <b>${esc(st.school || 'THCS Đồng Yên')}</b>
            </div>
            <div style="font-size:14px;font-weight:800;color:#059669;margin-top:6px">
              ⭐ Tổng điểm tích lũy: ${st.points || 100} XP · Đã làm ${subs.length} bài thi
            </div>
          </div>
        </div>
      </div>

      <!-- History Exams -->
      <div class="card">
        <div class="section-title mb-16">📋 Các bài thi đã hoàn thành (${subs.length})</div>
        ${subs.length === 0 ? `
          <div class="text-center text-soft py-24">Em chưa làm bài thi nào. Hãy vào "Phòng thi trực tuyến" để bắt đầu nhé!</div>
        ` : `
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Đề kiểm tra</th>
                  <th>Điểm số</th>
                  <th>Số câu đúng</th>
                  <th>Ngày nộp</th>
                </tr>
              </thead>
              <tbody>
                ${subs.map(s => `
                <tr>
                  <td><strong>${esc(s.examTitle)}</strong></td>
                  <td><span class="score-badge ${s.score >= 8 ? 'score-high' : (s.score >= 5 ? 'score-med' : 'score-low')}">${s.score} / 10</span></td>
                  <td>${s.correctCount || 0} / ${s.totalQuestions || 0}</td>
                  <td>${new Date(s.submittedAt).toLocaleDateString('vi-VN')}</td>
                </tr>`).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    </div>`;
  },

  // ================================================================
  // CỔNG GIÁO VIÊN (TEACHER & CLASSROOM MANAGEMENT)
  // ================================================================

  // ── Quản lý Lớp học (Classrooms Hub) ─────────────────────────────
  renderClassrooms() {
    const classes = Auth.getClasses();
    const students = Auth.getStudents();
    const subs = Auth.getSubmissions();

    return `
    <div class="page-body slide-up">
      <div class="section-header">
        <div>
          <div class="section-title">🏫 Quản lý Lớp học môn Tiếng Anh</div>
          <div style="font-size:13px;color:var(--ink-soft);margin-top:4px">
            Thầy Đinh Văn Thành – Trường THCS Đồng Yên (Tổng cộng: <b>${classes.length} lớp</b>)
          </div>
        </div>
        <button class="btn btn-primary" onclick="App.showAddClassModal()">+ Thêm lớp học mới</button>
      </div>

      <!-- Class Cards Grid -->
      <div class="grid grid-3 gap-16 mb-24">
        ${classes.map(cls => {
          const classStudents = students.filter(s => s.class === cls.name || s.classCode === cls.code);
          const classSubs = subs.filter(s => s.studentClass === cls.name);
          const avgScore = classSubs.length ? (classSubs.reduce((sum, x) => sum + (x.score || 0), 0) / classSubs.length).toFixed(1) : 'Chưa có';

          return `
          <div class="card" style="border:1.5px solid var(--line);padding:20px">
            <div style="display:flex;justify-content:space-between;align-items:flex-start">
              <div>
                <span class="badge badge-g${cls.grade}">Khối ${cls.grade}</span>
                <h3 style="font-size:18px;font-weight:800;color:#0f172a;margin-top:6px">${esc(cls.name)}</h3>
              </div>
              <span class="tag tag-nb" style="font-family:monospace;font-weight:700" title="Mã lớp">MÃ: ${esc(cls.code)}</span>
            </div>

            <div style="font-size:13px;color:var(--ink-soft);margin:12px 0">
              Sĩ số: <b>${cls.studentCount || classStudents.length} học sinh</b> &nbsp;|&nbsp;
              Điểm TB: <b style="color:#2563eb">${avgScore}</b>
            </div>

            <div class="row gap-8 mt-12">
              <button class="btn btn-outline btn-sm" onclick="App.copyClassLink('${cls.code}')">🔗 Copy mã lớp</button>
              <button class="btn btn-primary btn-sm" onclick="App.assignExamToClass('${cls.name}')">🚀 Giao bài</button>
              <button class="btn btn-danger btn-sm" onclick="App.deleteClassItem('${cls.id}')">🗑 Xóa</button>
            </div>
          </div>`;
        }).join('')}
      </div>

      <!-- Students in Class Table -->
      <div class="card">
        <div class="section-title mb-16">👥 Danh sách học sinh đăng ký trên hệ thống (${students.length} học sinh)</div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Họ và tên</th>
                <th>Lớp</th>
                <th>Khối</th>
                <th>Trường học</th>
                <th>Tên đăng nhập</th>
                <th>Điểm tích lũy</th>
                <th>Ngày tạo</th>
              </tr>
            </thead>
            <tbody>
              ${students.map(st => `
              <tr>
                <td><strong>${esc(st.name)}</strong></td>
                <td><span class="tag tag-nb">${esc(st.class || '7A1')}</span></td>
                <td>Lớp ${st.grade}</td>
                <td>${esc(st.school || 'THCS Đồng Yên')}</td>
                <td style="font-family:monospace;color:#2563eb">${esc(st.username)}</td>
                <td><b>⭐ ${st.points || 100} XP</b></td>
                <td>${st.createdAt ? new Date(st.createdAt).toLocaleDateString('vi-VN') : 'Mặc định'}</td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>`;
  },

  copyClassLink(code) {
    navigator.clipboard.writeText(code);
    UI.toast(`✅ Đã copy mã lớp ${code}! Hãy gửi mã này cho học sinh để tham gia lớp.`, 'success');
  },

  showAddClassModal() {
    const bodyHtml = `
      <div class="stack gap-12">
        <div class="field">
          <label class="label">Tên lớp học</label>
          <input id="ac-name" type="text" placeholder="Ví dụ: Lớp 7A3" autofocus />
        </div>
        <div class="grid grid-2 gap-12">
          <div class="field">
            <label class="label">Khối</label>
            <select id="ac-grade">
              <option value="6">Lớp 6</option>
              <option value="7" selected>Lớp 7</option>
              <option value="8">Lớp 8</option>
              <option value="9">Lớp 9</option>
            </select>
          </div>
          <div class="field">
            <label class="label">Mã lớp (Chia sẻ học sinh)</label>
            <input id="ac-code" type="text" placeholder="DY7A3" />
          </div>
        </div>
        <div class="field">
          <label class="label">Sĩ số dự kiến</label>
          <input id="ac-count" type="number" value="35" min="1" max="60" />
        </div>
      </div>
    `;

    UI.showModal('🏫 Thêm lớp học mới', bodyHtml, [
      {
        label: 'Tạo lớp ngay',
        cls: 'btn-primary',
        action: () => {
          const name = document.getElementById('ac-name')?.value?.trim();
          const grade = parseInt(document.getElementById('ac-grade')?.value) || 7;
          const code = document.getElementById('ac-code')?.value?.trim() || ('DY' + name.replace(/\s+/g, ''));
          const count = parseInt(document.getElementById('ac-count')?.value) || 35;

          if (!name) {
            alert('Vui lòng nhập tên lớp!');
            return;
          }

          Auth.addClass({ name, grade, code, studentCount: count, school: 'Trường THCS Đồng Yên' });
          UI.closeModal();
          this.renderPage();
          UI.toast('✅ Đã tạo lớp học mới thành công!', 'success');
        }
      },
      { label: 'Hủy', cls: 'btn-outline', action: () => UI.closeModal() }
    ]);
  },

  deleteClassItem(id) {
    if (confirm('Thầy có chắc chắn muốn xóa lớp học này không?')) {
      Auth.deleteClass(id);
      this.renderPage();
      UI.toast('Đã xóa lớp học', 'info');
    }
  },

  assignExamToClass(className) {
    const published = Auth.getPublishedExams();
    if (published.length === 0) {
      UI.toast('Thầy chưa có đề thi nào. Hãy tạo đề trước khi giao cho lớp!', 'warn');
      return;
    }
    const exam = published[0];
    const url = `${window.location.origin}${window.location.pathname}?mode=student&examId=${exam.id}`;
    const zaloMsg = `📢 THÔNG BÁO BÀI TẬP TIẾNG ANH - ${className}\nThầy Đinh Văn Thành giao bài kiểm tra: ${exam.title}\n👉 Các em bấm vào link sau để làm bài trực tiếp trên điện thoại:\n${url}\n* Chúc các em làm bài đạt kết quả tốt nhất!`;

    navigator.clipboard.writeText(zaloMsg);
    alert(`✅ ĐÃ SAO CHÉP MẪU TIN NHẮN ZALO GIAO BÀI CHO ${className}!\n\nThầy chỉ cần mở Zalo nhóm lớp và bấm Paste (Ctrl+V) để gửi cho học sinh.`);
  },

  showAssignExamModal() {
    const published = Auth.getPublishedExams();
    const classes = Auth.getClasses();

    const bodyHtml = `
      <div class="stack gap-12">
        <div class="field">
          <label class="label">Chọn Đề kiểm tra muốn giao</label>
          <select id="as-exam-select">
            ${published.map(e => `<option value="${e.id}">${esc(e.title)} (Lớp ${e.grade})</option>`).join('')}
          </select>
        </div>
        <div class="field">
          <label class="label">Chọn Lớp học nhận bài</label>
          <select id="as-class-select">
            ${classes.map(c => `<option value="${c.name}">${esc(c.name)} - Mã: ${c.code}</option>`).join('')}
          </select>
        </div>
        <div style="background:#eff6ff;padding:12px;border-radius:8px;font-size:12.5px;color:#1e40af">
          💡 Hệ thống sẽ tự động tạo link làm bài thi tối ưu cho màn hình điện thoại di động và soạn sẵn tin nhắn Zalo kèm hướng dẫn cho học sinh.
        </div>
      </div>
    `;

    UI.showModal('🚀 Giao bài kiểm tra cho Lớp học', bodyHtml, [
      {
        label: 'Tạo link & Copy tin nhắn Zalo',
        cls: 'btn-primary',
        action: () => {
          const examId = document.getElementById('as-exam-select')?.value;
          const clsName = document.getElementById('as-class-select')?.value;
          const exam = published.find(e => e.id === examId) || published[0];
          const url = `${window.location.origin}${window.location.pathname}?mode=student&examId=${exam.id}`;
          const msg = `📢 THÔNG BÁO BÀI THI TIẾNG ANH - ${clsName}\nThầy Đinh Văn Thành gửi đề: ${exam.title}\nThời gian làm bài: ${exam.examTime} phút (có phần nghe Audio).\n👉 Link làm bài: ${url}`;
          navigator.clipboard.writeText(msg);
          UI.closeModal();
          alert(`✅ ĐÃ SAO CHÉP TIN NHẮN GIAO BÀI CHO ${clsName}!\n\nThầy chỉ cần dán (Ctrl+V) vào nhóm Zalo lớp để học sinh làm bài.`);
        }
      },
      { label: 'Đóng', cls: 'btn-outline', action: () => UI.closeModal() }
    ]);
  },

  // ── Dashboard Giáo viên ──────────────────────────────────────────
  renderDashboard() {
    const u = this.state.user;
    const exams = Auth.getExamRecords().filter(e => e.userId === u.id);
    const allQ = Auth.getAllQuestions();
    const classes = Auth.getClasses();
    const students = Auth.getStudents();
    const subs = Auth.getSubmissions();

    return `
    <div class="page-body slide-up">
      <!-- Welcome Banner -->
      <div class="welcome-banner" style="background:linear-gradient(135deg,#1e3a8a,#2563eb);box-shadow:var(--shadow-md)">
        <div>
          <h2>Kính chào ${esc(u.name)}! 👋</h2>
          <p>Hệ thống Soạn đề, Đánh giá & Học tập Tiếng Anh THCS Global Success (Lớp 6, 7, 8, 9) – THCS Đồng Yên</p>
          <div class="row gap-8 mt-12">
            <span style="background:rgba(255,255,255,0.22);color:#fff;padding:4px 14px;border-radius:999px;font-size:12.5px;font-weight:700">
              👑 Bản quyền chính thức: Thầy Đinh Văn Thành
            </span>
            <span style="background:rgba(255,255,255,0.22);color:#fff;padding:4px 14px;border-radius:999px;font-size:12.5px;font-weight:600">
              🏫 ${classes.length} Lớp học · ${students.length} Học sinh trực tuyến
            </span>
          </div>
        </div>
        <div class="row gap-8 no-print">
          <button class="btn btn-xl" onclick="App.navigate('generate')"
            style="background:rgba(255,255,255,0.25);color:#fff;border-color:rgba(255,255,255,0.5);backdrop-filter:blur(10px);font-weight:800">
            ✨ Soạn đề mới
          </button>
          <button class="btn btn-xl" onclick="App.showAssignExamModal()"
            style="background:#10b981;color:#fff;border:none;font-weight:800">
            🚀 Giao bài Zalo
          </button>
        </div>
      </div>

      <!-- Quick Action Cards -->
      <div class="grid grid-3 gap-16 mb-24">
        <div class="card" style="border-left:4px solid #0ea5e9;cursor:pointer" onclick="App.applyPresetExam('15min')">
          <div style="font-size:24px;margin-bottom:8px">⏱️</div>
          <div style="font-weight:800;font-size:16px;color:#0f172a">Đề kiểm tra 15 phút</div>
          <p style="font-size:13px;color:var(--ink-soft);margin-top:4px">Đánh giá thường xuyên theo từng Unit: Ngữ âm, Từ vựng, Ngữ pháp, Giao tiếp nhanh.</p>
          <div style="margin-top:10px;font-size:12.5px;font-weight:700;color:#0ea5e9">⚡ Tạo nhanh 15 phút →</div>
        </div>

        <div class="card" style="border-left:4px solid #8b5cf6;cursor:pointer" onclick="App.applyPresetExam('midterm')">
          <div style="font-size:24px;margin-bottom:8px">📝</div>
          <div style="font-weight:800;font-size:16px;color:#0f172a">Đề thi Giữa kỳ (Kèm File nghe)</div>
          <p style="font-size:13px;color:var(--ink-soft);margin-top:4px">Định kỳ 45–60 phút chuẩn 4 kỹ năng: Listening, Language Focus, Reading, Writing.</p>
          <div style="margin-top:10px;font-size:12.5px;font-weight:700;color:#8b5cf6">🎧 Tạo đề Giữa kỳ + Audio →</div>
        </div>

        <div class="card" style="border-left:4px solid #10b981;cursor:pointer" onclick="App.applyPresetExam('final')">
          <div style="font-size:24px;margin-bottom:8px">🏆</div>
          <div style="font-weight:800;font-size:16px;color:#0f172a">Đề thi Cuối học kỳ (CV 7991)</div>
          <p style="font-size:13px;color:var(--ink-soft);margin-top:4px">Chuẩn ma trận và bảng đặc tả Bộ GD&ĐT, đầy đủ 4 mức độ nhận thức và Audio Script.</p>
          <div style="margin-top:10px;font-size:12.5px;font-weight:700;color:#10b981">📊 Xuất Ma trận & Đề Cuối kỳ →</div>
        </div>
      </div>

      <!-- System Stats -->
      <div class="grid grid-4 mb-24">
        <div class="stat-card">
          <div class="stat-icon" style="background:#eef2ff">📝</div>
          <div class="stat-body">
            <div class="stat-value grad-text">${exams.length}</div>
            <div class="stat-label">Đề thi đã tạo</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:#ecfdf5">👥</div>
          <div class="stat-body">
            <div class="stat-value" style="color:#059669;font-weight:800">${students.length}</div>
            <div class="stat-label">Học sinh đăng ký</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:#e0f2fe">📥</div>
          <div class="stat-body">
            <div class="stat-value" style="color:#0284c7;font-weight:800">${subs.length}</div>
            <div class="stat-label">Bài nộp trực tuyến</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:#fef9c3">📚</div>
          <div class="stat-body">
            <div class="stat-value" style="color:#ca8a04;font-weight:800">${allQ.length}</div>
            <div class="stat-label">Câu hỏi Global Success</div>
          </div>
        </div>
      </div>

      <!-- Recent Submissions Overview -->
      <div class="card mb-24">
        <div class="section-header">
          <div class="section-title">📥 Bài nộp của học sinh mới nhất</div>
          <button class="btn btn-outline btn-sm" onclick="App.navigate('submissions')">Xem tất cả bài nộp →</button>
        </div>
        ${subs.length === 0 ? `
          <div class="text-center text-soft py-24">Chưa có bài thi nào được nộp. Bấm "Giao bài Zalo" để gửi đề cho học sinh!</div>
        ` : `
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Học sinh</th>
                  <th>Lớp</th>
                  <th>Đề kiểm tra</th>
                  <th>Điểm số</th>
                  <th>Thời gian nộp</th>
                </tr>
              </thead>
              <tbody>
                ${subs.slice(0, 5).map(s => `
                <tr>
                  <td><strong>${esc(s.studentName)}</strong></td>
                  <td><span class="tag tag-nb">${esc(s.studentClass)}</span></td>
                  <td>${esc(s.examTitle)}</td>
                  <td>
                    <span class="score-badge ${s.score >= 8 ? 'score-high' : (s.score >= 5 ? 'score-med' : 'score-low')}">
                      ${s.score} / 10
                    </span>
                  </td>
                  <td>${new Date(s.submittedAt).toLocaleString('vi-VN')}</td>
                </tr>`).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    </div>`;
  },

  // ── Apply Preset Exam ───────────────────────────────────────────
  applyPresetExam(presetType) {
    const wiz = this.state.wizard;
    if (presetType === '15min') {
      wiz.grade = 7;
      wiz.examType = '15 phút';
      wiz.examTime = 15;
      wiz.examTitle = 'Đề kiểm tra 15 phút Unit 1: Hobbies – Tiếng Anh 7 Global Success';
      wiz.sections = [
        {
          name: 'Phần I. PRONUNCIATION & STRESS (Ngữ âm & Trọng âm)',
          skill: 'language',
          type: 'mc',
          points: 3.0,
          slots: [
            { chapterId: 'en7u1', topic: '', level: 'NB', count: 2 },
            { chapterId: 'en7u1', topic: '', level: 'TH', count: 2 }
          ]
        },
        {
          name: 'Phần II. VOCABULARY & GRAMMAR (Từ vựng & Ngữ pháp Unit 1)',
          skill: 'language',
          type: 'mc',
          points: 5.0,
          slots: [
            { chapterId: 'en7u1', topic: '', level: 'NB', count: 3 },
            { chapterId: 'en7u1', topic: '', level: 'TH', count: 3 },
            { chapterId: 'en7u1', topic: '', level: 'VD', count: 2 }
          ]
        },
        {
          name: 'Phần III. WRITING (Viết câu hoàn chỉnh)',
          skill: 'writing',
          type: 'essay',
          points: 2.0,
          slots: [
            { chapterId: 'en7u1', topic: '', level: 'VD', count: 2 }
          ]
        }
      ];
    } else if (presetType === 'midterm') {
      wiz.grade = 8;
      wiz.examType = 'Giữa kỳ';
      wiz.examTime = 45;
      wiz.examTitle = 'Đề kiểm tra Giữa Học kỳ I – Tiếng Anh 8 Global Success';
      wiz.audioTitle = 'Track: Life in the countryside and teen leisure activities';
      wiz.audioScript = 'Narrator: Listen to a short conversation between Nick and Lan talking about leisure activities. Decide whether statements are True or False.\n\nNick: Hi Lan, what do you usually do in your leisure time?\nLan: Hello Nick. I love making paper crafts and playing badminton with my classmates. Sometimes my brother and I help our parents in the orchard.\nNick: That sounds wonderful. In my hometown, teenagers spend lots of time surfing the internet and playing video games. I think outdoor activities are much healthier.\nLan: I agree. Breathing fresh air in the countryside helps us reduce stress after long studying hours.';
      wiz.sections = [
        {
          name: 'PART A. LISTENING (File nghe Audio)',
          skill: 'listening',
          type: 'mc',
          points: 2.0,
          slots: [
            { chapterId: '', topic: '', level: 'NB', count: 2 },
            { chapterId: '', topic: '', level: 'TH', count: 2 }
          ]
        },
        {
          name: 'PART B. LANGUAGE FOCUS (Phát âm, Từ vựng & Ngữ pháp)',
          skill: 'language',
          type: 'mc',
          points: 3.5,
          slots: [
            { chapterId: '', topic: '', level: 'NB', count: 3 },
            { chapterId: '', topic: '', level: 'TH', count: 4 }
          ]
        },
        {
          name: 'PART C. READING (Đọc hiểu & Điền khuyết)',
          skill: 'reading',
          type: 'mc',
          points: 2.5,
          slots: [
            { chapterId: '', topic: '', level: 'TH', count: 3 },
            { chapterId: '', topic: '', level: 'VD', count: 2 }
          ]
        },
        {
          name: 'PART D. WRITING (Sắp xếp từ & Viết lại câu)',
          skill: 'writing',
          type: 'essay',
          points: 2.0,
          slots: [
            { chapterId: '', topic: '', level: 'VD', count: 2 }
          ]
        }
      ];
    } else {
      wiz.grade = 9;
      wiz.examType = 'Cuối kỳ';
      wiz.examTime = 60;
      wiz.examTitle = 'Đề kiểm tra Cuối Học kỳ I – Tiếng Anh 9 chuẩn CV 7991/BGDĐT';
      wiz.examFormat = 'cv7991';
      wiz.sections = [
        {
          name: 'Phần I. Câu trắc nghiệm nhiều phương án lựa chọn (Nghe + Ngôn ngữ + Đọc)',
          skill: 'language',
          type: 'mc',
          points: 4.0,
          slots: [
            { chapterId: '', topic: '', level: 'NB', count: 4 },
            { chapterId: '', topic: '', level: 'TH', count: 6 },
            { chapterId: '', topic: '', level: 'VD', count: 2 }
          ]
        },
        {
          name: 'Phần II. Câu trắc nghiệm Đúng - Sai (Listening Comprehension)',
          skill: 'listening',
          type: 'tf',
          points: 3.0,
          slots: [
            { chapterId: '', topic: '', level: 'TH', count: 2 },
            { chapterId: '', topic: '', level: 'VD', count: 1 }
          ]
        },
        {
          name: 'Phần III. Câu trắc nghiệm trả lời ngắn (Language / Điền từ)',
          skill: 'language',
          type: 'sa',
          points: 1.5,
          slots: [
            { chapterId: '', topic: '', level: 'TH', count: 2 }
          ]
        },
        {
          name: 'Phần IV. Tự luận (Writing: Rewrite sentences & Guided writing)',
          skill: 'writing',
          type: 'essay',
          points: 1.5,
          slots: [
            { chapterId: '', topic: '', level: 'VD', count: 2 }
          ]
        }
      ];
    }
    this.navigate('generate');
    this.goStep2();
  },

  // ── Step 1, 2, 3 Wizard ─────────────────────────────────────────
  renderGenerate() {
    const wiz = this.state.wizard;
    return `
    <div class="page-body slide-up">
      <div class="steps-bar mb-24 no-print">
        <div class="step-item ${wiz.step >= 1 ? 'active' : ''} ${wiz.step > 1 ? 'done' : ''}">
          <div class="step-num">${wiz.step > 1 ? '✓' : '1'}</div>
          <div class="step-label">1. Cấu hình & Audio</div>
        </div>
        <div class="step-item ${wiz.step >= 2 ? 'active' : ''} ${wiz.step > 2 ? 'done' : ''}">
          <div class="step-num">${wiz.step > 2 ? '✓' : '2'}</div>
          <div class="step-label">2. Ma trận 4 Kỹ năng</div>
        </div>
        <div class="step-item ${wiz.step >= 3 ? 'active' : ''}">
          <div class="step-num">3</div>
          <div class="step-label">3. Xem trước & Xuất Word</div>
        </div>
      </div>

      ${wiz.step === 1 ? this.renderStep1() : ''}
      ${wiz.step === 2 ? this.renderStep2() : ''}
      ${wiz.step === 3 ? this.renderStep3() : ''}
    </div>`;
  },

  getWizardTermKey() {
    const wiz = this.state.wizard;
    const t = wiz.examType || 'Giữa kỳ';
    const sem = wiz.examSemester || '';
    const isSem2 = sem.includes('II');
    if (t === 'Cuối kỳ') return isSem2 ? 'CK2' : 'CK1';
    if (t === 'Khảo sát') return 'KSCL';
    if (t === 'Đề cương') return 'DECUONG';
    return isSem2 ? 'GK2' : 'GK1';
  },

  getOfficialExamSuite(grade = null, termKey = null) {
    const suites = (typeof window !== 'undefined' && window.OFFICIAL_EXAM_SUITES)
      || (typeof OFFICIAL_EXAM_SUITES !== 'undefined' ? OFFICIAL_EXAM_SUITES : null);
    if (!suites) return null;
    const g = String(grade || (this.state.officialExams && this.state.officialExams.grade) || (this.state.wizard && this.state.wizard.grade) || '7');
    const t = String(termKey || (this.state.officialExams && this.state.officialExams.term) || (this.getWizardTermKey ? this.getWizardTermKey() : 'GK1') || 'GK1');
    return (suites[g] && suites[g][t]) ? suites[g][t] : (suites['7'] ? suites['7']['GK1'] : null);
  },

  syncWizardOfficialTemplate(grade = null, termKey = null) {
    const wiz = this.state.wizard;
    const curG = String(grade || wiz.grade || '7');
    const curT = termKey || this.getWizardTermKey();
    const suite = this.getOfficialExamSuite(curG, curT);
    if (!suite) return;

    wiz.grade = parseInt(curG);
    wiz.term = curT;
    wiz.termTitle = suite.termTitle;
    wiz.examTitle = `BÀI KIỂM TRA ĐÁNH GIÁ ${suite.termTitle} – TIẾNG ANH ${curG} GLOBAL SUCCESS`;
    wiz.examClass = curG + 'A1';
    wiz.examTime = suite.timeMinutes || 60;
    wiz.examSemester = 'Năm học 2026 - 2027';
    wiz.schoolName = wiz.schoolName || localStorage.getItem('cfg_school_name') || 'TRƯỜNG THCS ĐỒNG YÊN';
    wiz.teacherName = wiz.teacherName || 'Thầy Đinh Văn Thành';
    wiz.code1 = suite.code1;
    wiz.code2 = suite.code2;
    wiz.previewCodeIndex = 1;
    wiz.audioTitle = `Track 1: Listening Comprehension - Tiếng Anh ${curG} (${suite.termTitle})`;
    wiz.audioScript = suite.fullAudioScript;
    wiz.hasSpeaking = suite.hasSpeaking;
    wiz.selectedSections = JSON.parse(JSON.stringify(suite.sections_code1));
    wiz.sections_code2 = JSON.parse(JSON.stringify(suite.sections_code2));
    wiz.answerKeyRows = suite.answerKeyRows;
    wiz.matrixRows = suite.matrixRows;
    wiz.specRows = suite.specRows;
    wiz.matrixSubtitle = suite.matrixSubtitle || '';
    wiz.specSubtitle = suite.specSubtitle || '';
    wiz.writingRubric = suite.writingRubric || '';
    wiz.sampleWritingText = suite.sampleWritingText || '';
    wiz.speakingScriptRows = suite.speakingScriptRows || [];
    wiz.finalScoreSummary = suite.finalScoreSummary || '';
  },

  generateRandomizedOfficialExam(grade = null, termKey = null) {
    const wiz = this.state.wizard;
    const curG = String(grade || wiz.grade || '7');
    const curT = termKey || this.getWizardTermKey();

    // Sử dụng Động cơ Tổ hợp Sinh Hàng Tỷ Đề Độc Bản (ExamGeneratorEngine)
    let newExam = null;
    if (typeof ExamGeneratorEngine !== 'undefined') {
      try {
        newExam = ExamGeneratorEngine.generateUniqueExam(parseInt(curG), curT, {
          schoolName: wiz.schoolName || localStorage.getItem('cfg_school_name'),
          teacherName: wiz.teacherName || 'Thầy Đinh Văn Thành'
        });
      } catch (err) {
        console.warn('ExamGeneratorEngine generation notice:', err);
      }
    }

    if (newExam) {
      wiz.grade = newExam.grade;
      wiz.term = newExam.term;
      wiz.termTitle = newExam.termTitle;
      wiz.examTitle = newExam.examTitle;
      wiz.code1 = newExam.code1;
      wiz.code2 = newExam.code2;
      wiz.previewCodeIndex = 1;
      wiz.examTime = newExam.timeMinutes || 60;
      wiz.audioTitle = newExam.audioTitle;
      wiz.audioScript = newExam.audioScript;
      wiz.hasSpeaking = newExam.hasSpeaking;
      wiz.selectedSections = newExam.sections_code1;
      wiz.sections_code2 = newExam.sections_code2;
      wiz.answerKeyRows = newExam.answerKeyRows;
      wiz.matrixRows = newExam.matrixRows;
      wiz.specRows = newExam.specRows;
      wiz.matrixSubtitle = newExam.matrixSubtitle || '';
      wiz.specSubtitle = newExam.specSubtitle || '';
      wiz.writingRubric = newExam.writingRubric || '';
      wiz.sampleWritingText = newExam.sampleWritingText || '';
      wiz.speakingScriptRows = newExam.speakingScriptRows || [];
      wiz.finalScoreSummary = newExam.finalScoreSummary || '';
      wiz.step = 3;
      wiz.id = newExam.id;

      Auth.publishExam({
        id: wiz.id,
        title: wiz.examTitle + ` (Mã đề ${wiz.code1} & ${wiz.code2})`,
        grade: wiz.grade,
        subject: 'english',
        examFormat: 'cv7991',
        examTime: wiz.examTime,
        examClass: wiz.examClass || (curG + 'A1'),
        schoolName: wiz.schoolName || 'TRƯỜNG THCS ĐỒNG YÊN',
        teacherName: wiz.teacherName || 'Thầy Đinh Văn Thành',
        audioTitle: wiz.audioTitle,
        audioScript: wiz.audioScript,
        sections: wiz.selectedSections,
        isOpen: true,
        publishedAt: new Date().toISOString()
      });

      this.renderPage();
      UI.toast(`🎲 Đã sinh đề mới thành công! Mã đề [${wiz.code1} & ${wiz.code2}] từ kho tổ hợp 10²⁸ biến thể độc bản`, 'success');
      return;
    }

    // Fallback: nếu chưa nạp kịp Engine
    const suite = this.getOfficialExamSuite(curG, curT);
    if (!suite) return;

    this.syncWizardOfficialTemplate(curG, curT);

    const baseCode = parseInt(curG) * 100 + (Math.floor(Math.random() * 20) + 2) * 2 - 1;
    const code1 = String(baseCode);
    const code2 = String(baseCode + 1);
    wiz.code1 = code1;
    wiz.code2 = code2;
    wiz.previewCodeIndex = 1;

    const clone1 = JSON.parse(JSON.stringify(suite.sections_code1));
    const clone2 = JSON.parse(JSON.stringify(suite.sections_code2));

    clone1.forEach(sec => {
      if (sec.questions) {
        sec.questions.forEach(q => {
          if (q.options && q.options.length >= 3 && q.type !== 'essay' && !q.options[0].includes('True')) {
            const rawOpts = q.options.map(o => o.replace(/^[A-D]\.\s*/, '').trim());
            const origAnsIdx = q.answer ? (q.answer.charCodeAt(0) - 65) : 0;
            const correctText = rawOpts[origAnsIdx] || rawOpts[0];

            const shuffledRaw = shuffle(rawOpts);
            const newAnsIdx = shuffledRaw.indexOf(correctText);
            const newAnsLetter = String.fromCharCode(65 + newAnsIdx);

            q.options = shuffledRaw.map((txt, i) => `${String.fromCharCode(65 + i)}. ${txt}`);
            q.answer = newAnsLetter;
          }
        });
      }
    });

    clone2.forEach(sec => {
      if (sec.questions) {
        sec.questions.forEach(q => {
          if (q.options && q.options.length >= 3 && q.type !== 'essay' && !q.options[0].includes('True')) {
            const rawOpts = q.options.map(o => o.replace(/^[A-D]\.\s*/, '').trim());
            const origAnsIdx = q.answer ? (q.answer.charCodeAt(0) - 65) : 0;
            const correctText = rawOpts[origAnsIdx] || rawOpts[0];

            const shuffledRaw = [...rawOpts].reverse();
            const newAnsIdx = shuffledRaw.indexOf(correctText);
            const newAnsLetter = String.fromCharCode(65 + newAnsIdx);

            q.options = shuffledRaw.map((txt, i) => `${String.fromCharCode(65 + i)}. ${txt}`);
            q.answer = newAnsLetter;
          }
        });
      }
    });

    wiz.selectedSections = clone1;
    wiz.sections_code2 = clone2;
    wiz.step = 3;

    // Lưu và xuất bản đề thi online
    wiz.id = 'eng-dyn-' + Date.now();
    Auth.publishExam({
      id: wiz.id,
      title: wiz.examTitle + ` (Mã đề ${code1} & ${code2})`,
      grade: wiz.grade,
      subject: 'english',
      examFormat: 'cv7991',
      examTime: wiz.examTime,
      examClass: wiz.examClass,
      schoolName: wiz.schoolName,
      teacherName: wiz.teacherName,
      audioTitle: wiz.audioTitle,
      audioScript: wiz.audioScript,
      sections: clone1,
      isOpen: true,
      publishedAt: new Date().toISOString()
    });

    this.renderPage();
    UI.toast(`⚡ Đã bốc ngẫu nhiên câu hỏi & sinh 02 mã đề mới: ${code1} & ${code2} (37 câu chuẩn 100%)!`, 'success');
  },

  renderStep1() {
    const wiz = this.state.wizard;
    const curG = String(wiz.grade || '7');
    const curT = this.getWizardTermKey();
    if (!wiz.selectedSections || wiz.selectedSections.length < 5) {
      this.syncWizardOfficialTemplate(curG, curT);
    }
    const examTypes = ['Giữa kỳ', 'Cuối kỳ', 'Khảo sát', 'Đề cương', '15 phút'];

    return `
    <div class="grid grid-2 gap-20">
      <div class="stack gap-16">
        <!-- Official standard guarantee badge -->
        <div class="card p-16" style="background:linear-gradient(135deg, #eff6ff, #f0fdf4);border:1.5px solid #2563eb">
          <div style="display:flex;align-items:center;gap:12px">
            <span style="font-size:32px">🏛️</span>
            <div>
              <div style="font-size:15px;font-weight:900;color:#1e3a8a">Chuẩn 100% Khảo Thí THCS Đồng Yên – Thầy Đinh Văn Thành</div>
              <div style="font-size:12px;color:#15803d;font-weight:700;margin-top:2px">
                ✓ GDPT 2018 · Công văn 7991/BGDĐT · 36 câu TNKQ + 1 câu Tự luận = 37 câu (10.0đ) · 02 mã đề tương đương
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="section-title mb-12">🎯 1. Chọn Khối lớp (SGK Global Success)</div>
          <div class="grid grid-4 gap-10">
            ${[6, 7, 8, 9].map(g => `
            <div class="grade-card ${wiz.grade === g ? 'active' : ''}" onclick="App.setWizardGrade(${g})" style="cursor:pointer;text-align:center;padding:12px;border:2.5px solid ${wiz.grade === g ? '#1d4ed8' : '#cbd5e1'};border-radius:12px;background:${wiz.grade === g ? '#eff6ff' : '#ffffff'};box-shadow:${wiz.grade === g ? '0 4px 12px rgba(29,78,216,0.2)' : 'none'}">
              <div style="font-size:24px;font-weight:900;color:${wiz.grade === g ? '#1d4ed8' : '#0f172a'}">${g}</div>
              <div style="font-size:12px;font-weight:800;color:${wiz.grade === g ? '#1e40af' : '#475569'}">LỚP ${g}</div>
            </div>`).join('')}
          </div>
        </div>

        <div class="card">
          <div class="section-title mb-12">⏱️ 2. Chọn Kỳ kiểm tra / Tài liệu</div>
          <div class="chip-group">
            ${examTypes.map(t => `
              <div class="chip ${wiz.examType === t ? 'selected' : ''}" onclick="App.setWizardExamType('${t}')" style="font-weight:700;padding:8px 14px">
                ${t === 'Giữa kỳ' ? '📘 Giữa kỳ (10đ Viết)' : (t === 'Cuối kỳ' ? '🎤 Cuối kỳ (8đ Viết + 2đ Nói)' : (t === 'Khảo sát' ? '📊 Khảo sát đầu năm' : (t === 'Đề cương' ? '📖 Đề cương 6 trang' : '⚡ 15 phút (48 Units)')))}
              </div>`).join('')}
          </div>
        </div>

        <!-- Audio Configuration -->
        <div class="card" style="border:1.5px solid #bfdbfe;background:#f8fafc">
          <div class="section-title mb-12" style="color:#1d4ed8">🎧 3. Thiết lập File nghe & Audio Script</div>
          <div class="stack gap-12">
            <div class="field">
              <label class="label">Tiêu đề bài nghe (Track title)</label>
              <input id="wiz-audio-title" type="text" value="${esc(wiz.audioTitle || `Track 1: Listening Comprehension - Tiếng Anh ${curG}`)}" />
            </div>
            <div class="field">
              <label class="label">Nội dung Audio Script (Dialogue + Monologue bài thi)</label>
              <textarea id="wiz-audio-script" rows="4" style="width:100%;font-family:inherit;padding:8px 12px;border:1px solid var(--line);border-radius:var(--r-md);font-size:12.5px;line-height:1.5">${esc(wiz.audioScript || '')}</textarea>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: School Config & Action Buttons -->
      <div class="stack gap-16">
        <div class="card">
          <div class="section-title mb-16">📋 Thông tin Đơn vị & Nghị định 30</div>
          <div class="stack gap-14">
            <div class="field">
              <label class="label">Tên đề kiểm tra</label>
              <input id="wiz-title" type="text" value="${esc(wiz.examTitle)}" />
            </div>
            <div class="grid grid-2 gap-12">
              <div class="field">
                <label class="label">Lớp thi</label>
                <input id="wiz-class" type="text" value="${esc(wiz.examClass || (curG + 'A1'))}" />
              </div>
              <div class="field">
                <label class="label">Thời gian (phút)</label>
                <input id="wiz-time" type="number" value="${wiz.examTime || 60}" min="15" max="180" />
              </div>
            </div>
            <div class="grid grid-2 gap-12">
              <div class="field">
                <label class="label">Cơ quan cấp trên</label>
                <input id="wiz-parent" type="text" value="${esc(localStorage.getItem('cfg_parent_agency') || 'UBND XÃ ĐỒNG YÊN')}" onchange="localStorage.setItem('cfg_parent_agency', this.value.toUpperCase())" />
              </div>
              <div class="field">
                <label class="label">Tên trường (Bản quyền)</label>
                <input id="wiz-school" type="text" value="${esc(wiz.schoolName || localStorage.getItem('cfg_school_name') || 'TRƯỜNG THCS ĐỒNG YÊN')}" onchange="localStorage.setItem('cfg_school_name', this.value.toUpperCase())" />
              </div>
            </div>
            <div class="field">
              <label class="label">Giáo viên ra đề / Tác giả</label>
              <input id="wiz-teacher" type="text" value="${esc(wiz.teacherName || 'Thầy Đinh Văn Thành')}" />
            </div>
          </div>
        </div>

        <!-- 3 Primary Action Paths -->
        <div class="card" style="border:2px solid #2563eb;background:#ffffff;box-shadow:0 6px 20px rgba(37,99,235,0.12);border-radius:16px;padding:20px">
          <div class="section-title mb-14" style="color:#0f172a;display:flex;align-items:center;justify-content:space-between">
            <span style="font-size:15px;font-weight:900;color:#1e3a8a">🚀 CHỌN HÌNH THỨC TẠO ĐỀ:</span>
            <span class="badge" style="background:#dbeafe;color:#1e40af;font-size:11.5px;font-weight:800;padding:4px 10px;border:1px solid #bfdbfe">Kho tổ hợp > 10²⁸ Đề</span>
          </div>
          <div class="stack gap-12">
            <!-- Nút 1: Bốc đề độc bản -->
            <button class="btn btn-success btn-lg" onclick="App.generateRandomizedOfficialExam('${curG}', '${curT}')"
              style="width:100%;padding:14px 16px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;background:linear-gradient(135deg, #047857, #065f46) !important;color:#ffffff !important;border:1.5px solid #064e3b !important;border-radius:12px;box-shadow:0 4px 14px rgba(4,120,87,0.4);cursor:pointer">
              <span style="font-size:16px;font-weight:900;color:#ffffff !important;letter-spacing:0.3px;text-shadow:0 1px 3px rgba(0,0,0,0.5)">🎲 BỐC ĐỀ MỚI ĐỘC BẢN (KHÔNG LẶP LẠI)</span>
              <span style="font-size:12px;font-weight:700;color:#a7f3d0 !important;text-shadow:0 1px 2px rgba(0,0,0,0.4)">✨ Động cơ tổ hợp 10²⁸ đề: Tự động đổi câu hỏi Ngữ pháp, Từ vựng, Biển báo & Đọc hiểu</span>
            </button>

            <!-- Nút 2: Nạp mẫu đề chuẩn -->
            <button class="btn btn-primary btn-lg" onclick="App.syncWizardOfficialTemplate('${curG}', '${curT}'); App.goStep3();"
              style="width:100%;padding:13px 16px;font-size:14.5px;display:flex;align-items:center;justify-content:center;gap:10px;background:linear-gradient(135deg, #1d4ed8, #1e40af) !important;color:#ffffff !important;border:1.5px solid #1e3a8a !important;border-radius:12px;box-shadow:0 4px 14px rgba(29,78,216,0.35);cursor:pointer">
              <span style="color:#ffffff !important;font-weight:900;font-size:14.5px;text-shadow:0 1px 2px rgba(0,0,0,0.3)">🎯 NẠP MẪU ĐỀ CHUẨN THCS ĐỒNG YÊN</span>
              <span style="font-size:12px;color:#bfdbfe !important;font-weight:700">(37 câu chuẩn CV 7991)</span>
            </button>

            <!-- Nút 3: Xem & tùy biến -->
            <button class="btn btn-outline btn-lg" onclick="App.goStep2()"
              style="width:100%;font-weight:800;padding:12px 16px;font-size:13.5px;background:#f8fafc;color:#0f172a !important;border:2px solid #64748b;border-radius:12px;cursor:pointer">
              📊 Xem & Tùy biến chi tiết Ma trận 8 Phần →
            </button>
          </div>
        </div>
      </div>
    </div>`;
  },

  setWizardGrade(g) {
    this.state.wizard.grade = g;
    this.syncWizardOfficialTemplate(g, this.getWizardTermKey());
    this.renderPage();
  },

  setWizardExamType(t) {
    this.state.wizard.examType = t;
    if (t === '15 phút') {
      this.state.wizard.examTime = 15;
      this.navigate('quiz-15m');
      return;
    }
    this.syncWizardOfficialTemplate(this.state.wizard.grade, this.getWizardTermKey());
    this.renderPage();
  },

  setWizardExamFormat(fmt) {
    this.state.wizard.examFormat = fmt;
    this.renderPage();
  },

  goStep2() {
    const wiz = this.state.wizard;
    wiz.examTitle = document.getElementById('wiz-title')?.value || wiz.examTitle;
    wiz.examClass = document.getElementById('wiz-class')?.value || wiz.examClass;
    wiz.examTime = parseInt(document.getElementById('wiz-time')?.value) || wiz.examTime;
    wiz.schoolName = document.getElementById('wiz-school')?.value || wiz.schoolName;
    wiz.teacherName = document.getElementById('wiz-teacher')?.value || wiz.teacherName;
    wiz.audioTitle = document.getElementById('wiz-audio-title')?.value || wiz.audioTitle;
    wiz.audioScript = document.getElementById('wiz-audio-script')?.value || wiz.audioScript;
    if (document.getElementById('wiz-parent')?.value) {
      localStorage.setItem('cfg_parent_agency', document.getElementById('wiz-parent').value.toUpperCase());
    }
    if (document.getElementById('wiz-school')?.value) {
      localStorage.setItem('cfg_school_name', document.getElementById('wiz-school').value.toUpperCase());
    }
    wiz.step = 2;
    this.renderPage();
  },

  goStep1() {
    this.state.wizard.step = 1;
    this.renderPage();
  },

  renderStep2() {
    const wiz = this.state.wizard;
    const curG = String(wiz.grade || '7');
    const curT = this.getWizardTermKey();
    if (!wiz.selectedSections || wiz.selectedSections.length < 5) {
      this.syncWizardOfficialTemplate(curG, curT);
    }
    const secs = wiz.selectedSections;
    const totalQ = secs.reduce((s, sec) => s + (sec.questions ? sec.questions.length : 0), 0);

    return `
    <div class="stack gap-20">
      <div class="card flex-between" style="background:#f8fafc;padding:16px 20px;border-left:4px solid #2563eb">
        <div>
          <h3 style="font-size:16px;color:#0f172a;font-weight:800">
            📊 Ma trận cấu trúc đề chuẩn 100%: ${esc(wiz.examTitle)}
          </h3>
          <p style="font-size:13px;color:var(--ink-soft);margin-top:4px">
            Khối: <b>Lớp ${curG} Global Success</b> · <b>${totalQ} câu hỏi (36 TNKQ + 1 Tự luận)</b> · Thang điểm: <b>10.0 điểm</b> · Thời gian: <b>${wiz.examTime} phút</b>
          </p>
        </div>
        <div class="row gap-8">
          <button class="btn btn-outline btn-sm" onclick="App.goStep1()">← Đổi khối lớp & kỳ thi</button>
          <button class="btn btn-success btn-sm" onclick="App.generateRandomizedOfficialExam('${curG}', '${curT}')" style="font-weight:700">🎲 Bốc đề mới khác (10²⁸ biến thể)</button>
        </div>
      </div>

      <!-- Real 8 Sections of the Exam -->
      ${secs.map((sec, si) => {
        const qCount = sec.questions ? sec.questions.length : 0;
        return `
        <div class="card p-18" style="border:1px solid #e2e8f0;background:#ffffff">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
            <div>
              <strong style="color:#1e3a8a;font-size:15px">${esc(sec.title || sec.name || `Phần ${si + 1}`)}</strong>
              <div style="font-size:12px;color:#64748b;margin-top:2px">
                Kỹ năng: <span class="tag tag-nb">${sec.skill ? sec.skill.toUpperCase() : 'SKILL'}</span> · Số câu: <b>${qCount} câu</b> · Điểm: <b>${sec.points || ''}</b>
              </div>
            </div>
            <span class="badge" style="background:#e0f2fe;color:#0369a1;font-weight:700">Part ${si + 1}</span>
          </div>

          ${sec.passage ? `
          <div style="background:#f8fafc;border:1px dashed #94a3b8;padding:8px 12px;border-radius:8px;font-size:12px;font-style:italic;color:#334155;margin-bottom:8px">
            <b>Đoạn văn đọc hiểu:</b> ${formatExamText(sec.passage.slice(0, 180))}...
          </div>` : ''}

          <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(260px, 1fr));gap:6px">
            ${(sec.questions || []).map((q, qi) => `
              <div style="background:#f8fafc;padding:6px 10px;border-radius:6px;font-size:12px;display:flex;justify-content:space-between;align-items:center;border:1px solid #f1f5f9">
                <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:210px">
                  <b>${q.num || (qi + 1)}.</b> ${formatExamText(q.content || '')}
                </span>
                ${q.answer ? `<span class="badge" style="background:#dcfce7;color:#15803d;font-weight:800">${q.answer}</span>` : ''}
              </div>
            `).join('')}
          </div>
        </div>`;
      }).join('')}

      <div class="card flex-between" style="padding:16px 20px">
        <button class="btn btn-outline" onclick="App.goStep1()">← Quay lại Bước 1</button>
        <button class="btn btn-primary btn-lg" onclick="App.generateExam()">
          ⚡ Hoàn thành & Xem trước đề thi (Bước 3) →
        </button>
      </div>
    </div>`;
  },

  updateSlot(si, sli, field, val) {
    this.renderPage();
  },

  addSlot(si) {
    this.renderPage();
  },

  removeSlot(si, sli) {
    this.renderPage();
  },

  removeSection(si) {
    this.renderPage();
  },

  generateExam() {
    const wiz = this.state.wizard;
    const curG = String(wiz.grade || '7');
    const curT = this.getWizardTermKey();
    if (!wiz.selectedSections || wiz.selectedSections.length < 5) {
      this.syncWizardOfficialTemplate(curG, curT);
    }

    wiz.id = wiz.id || ('eng-' + Date.now());
    wiz.step = 3;

    Auth.publishExam({
      id: wiz.id,
      title: wiz.examTitle,
      grade: wiz.grade,
      subject: 'english',
      examFormat: 'cv7991',
      examTime: wiz.examTime,
      examClass: wiz.examClass,
      schoolName: wiz.schoolName,
      teacherName: wiz.teacherName,
      audioTitle: wiz.audioTitle,
      audioScript: wiz.audioScript,
      sections: wiz.selectedSections,
      isOpen: true,
      publishedAt: new Date().toISOString()
    });

    const record = {
      id: wiz.id,
      userId: this.state.user?.id || 'dinhvanthanh',
      title: wiz.examTitle,
      grade: wiz.grade,
      subject: 'english',
      examType: wiz.examType || 'Giữa kỳ',
      questionCount: wiz.selectedSections.reduce((s, sec) => s + (sec.questions ? sec.questions.length : 0), 0),
      createdAt: new Date().toISOString()
    };
    Auth.saveExamRecord(record);

    this.renderPage();
    UI.toast('🎯 Đã tạo thành công Đề thi chuẩn 100% (37 câu - 8 phần chuẩn CV 7991)!', 'success');
  },

  goStep3() {
    this.generateExam();
  },

  renderStep3() {
    return this.renderPreview();
  },

  setPreviewCode(codeIdx) {
    this.state.wizard.previewCodeIndex = codeIdx;
    this.renderPage();
  },

  assignWizardExamOnline() {
    const wiz = this.state.wizard;
    const url = `${window.location.origin}${window.location.pathname}?mode=student&examId=${wiz.id}`;
    UI.showModal('🚀 Giao Bài Thi Tiếng Anh Online Cho Học Sinh', `
      <div class="stack gap-14">
        <div style="font-size:13.5px;color:#1e293b">
          Học sinh có thể mở link này trên điện thoại hoặc máy tính để làm bài thi trực tiếp:
        </div>
        <div class="input-group">
          <input type="text" id="share-wiz-url" value="${url}" readonly style="font-weight:600;font-size:13px;width:100%" />
        </div>
        <div style="display:flex;gap:10px">
          <button class="btn btn-primary" onclick="navigator.clipboard.writeText(document.getElementById('share-wiz-url').value); UI.toast('Đã copy link bài thi!', 'success');">📋 Copy Link</button>
          <button class="btn btn-outline" onclick="window.open('${url}', '_blank')">🌐 Mở trang thi thử</button>
        </div>
      </div>
    `, [{ label: 'Đóng', cls: 'btn-outline', action: () => UI.closeModal() }]);
  },

  // ── Hệ thống Xuất File Word (.doc) Chuẩn 100% Theo App Thầy Đinh Văn Thành ──────────
  wrapDocHtml(contentHtml, title = 'De thi Tieng Anh') {
    return `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>${esc(title)}</title>
  <style>
    @page Section1 { size: 21.0cm 29.7cm; margin: 1.27cm 1.52cm 1.27cm 1.52cm; mso-page-orientation: portrait; }
    div.Section1 { page: Section1; }
    body { font-family: 'Times New Roman', Times, serif; font-size: 13pt; line-height: 1.15; color: #000; }
    table { width: 100%; border-collapse: collapse; font-family: 'Times New Roman', Times, serif; }
    p { margin: 2pt 0; padding: 0; line-height: 1.15; }
    .page-break { page-break-before: always; mso-break-type: page-break; }
  </style>
</head>
<body>
<div class="Section1">
  ${contentHtml}
</div>
</body>
</html>`;
  },

  // 1. Trụ cột 1: MA TRẬN 15 CỘT CHUẨN CÔNG VĂN 7991/BGDĐT
  buildMatrixWordHtml(cfg) {
    const parentAgency = (cfg.parentAgency || 'UBND XÃ ĐỒNG YÊN').toUpperCase();
    const schoolName = (cfg.schoolName || 'TRƯỜNG THCS ĐỒNG YÊN').toUpperCase();
    const titleUpper = (cfg.titleUpper || 'GIỮA HỌC KÌ I').toUpperCase();
    const schoolYear = cfg.schoolYear || '2026 - 2027';
    const grade = cfg.grade || '7';
    const timeMinutes = cfg.timeMinutes || 60;
    const subtitle = cfg.subtitle || 'Hình thức: 100% Bài kiểm tra Viết trên giấy (Thang điểm: 10,0 điểm - Giữa kỳ không thi Nói)';
    const rows = cfg.matrixRows || [];

    return `
    <div style="text-align:center;margin-bottom:8pt">
      <div style="font-size:11.5pt;font-weight:bold;line-height:1.2">${esc(parentAgency)} - ${esc(schoolName)}</div>
      <div style="font-size:12pt;font-weight:bold;margin-top:2pt;line-height:1.25">MA TRẬN ĐỀ KIỂM TRA ĐÁNH GIÁ ${esc(titleUpper)} - NĂM HỌC ${esc(schoolYear)}</div>
      <div style="font-size:11pt;font-weight:bold;line-height:1.2">MÔN: TIẾNG ANH ${esc(grade)} (GLOBAL SUCCESS) - THỜI GIAN LÀM BÀI: ${esc(timeMinutes)} PHÚT</div>
      <div style="font-size:9.5pt;font-style:italic;line-height:1.2">${esc(subtitle)}</div>
    </div>

    <table style="width:100%;border-collapse:collapse;font-size:8pt;margin-top:6pt">
      <thead>
        <tr style="background:#e8eef5;font-weight:bold;text-align:center">
          <th rowspan="2" style="border:1pt solid #000;padding:3pt 2pt;width:3.5%">TT</th>
          <th rowspan="2" style="border:1pt solid #000;padding:3pt 2pt;width:15%">Chủ đề / Kĩ năng</th>
          <th rowspan="2" style="border:1pt solid #000;padding:3pt 2pt;width:21.5%">Nội dung / Đơn vị kiến thức</th>
          <th colspan="3" style="border:1pt solid #000;padding:3pt 2pt;width:15%">TNKQ nhiều lựa chọn</th>
          <th colspan="3" style="border:1pt solid #000;padding:3pt 2pt;width:15%">TNKQ Đúng/Sai</th>
          <th colspan="3" style="border:1pt solid #000;padding:3pt 2pt;width:15%">Tự luận</th>
          <th colspan="3" style="border:1pt solid #000;padding:3pt 2pt;width:15%">Tổng</th>
        </tr>
        <tr style="background:#e8eef5;font-weight:bold;text-align:center">
          <th style="border:1pt solid #000;padding:2pt 1pt;width:5%">Biết</th>
          <th style="border:1pt solid #000;padding:2pt 1pt;width:5%">Hiểu</th>
          <th style="border:1pt solid #000;padding:2pt 1pt;width:5%">VD</th>
          <th style="border:1pt solid #000;padding:2pt 1pt;width:5%">Biết</th>
          <th style="border:1pt solid #000;padding:2pt 1pt;width:5%">Hiểu</th>
          <th style="border:1pt solid #000;padding:2pt 1pt;width:5%">VD</th>
          <th style="border:1pt solid #000;padding:2pt 1pt;width:5%">Biết</th>
          <th style="border:1pt solid #000;padding:2pt 1pt;width:5%">Hiểu</th>
          <th style="border:1pt solid #000;padding:2pt 1pt;width:5%">VD</th>
          <th style="border:1pt solid #000;padding:2pt 1pt;width:5%">Biết</th>
          <th style="border:1pt solid #000;padding:2pt 1pt;width:5%">Hiểu</th>
          <th style="border:1pt solid #000;padding:2pt 1pt;width:5%">VD</th>
        </tr>
      </thead>
      <tbody>
        ${rows.map(r => {
          const isTotal = (r[0] || '').startsWith('TỔNG');
          return `
          <tr style="${isTotal ? 'background:#f4f6f9;font-weight:bold' : ''}">
            ${r.map((val, ci) => `
              <td style="border:1pt solid #000;padding:2pt 3pt;font-size:8pt;text-align:${ci === 1 || ci === 2 ? 'left' : 'center'};${isTotal ? 'font-weight:bold' : ''}">
                ${esc(val || '').replace(/\n/g, '<br/>')}
              </td>
            `).join('')}
          </tr>`;
        }).join('')}
      </tbody>
    </table>`;
  },

  // 2. Trụ cột 2: BẢN ĐẶC TẢ KỸ THUẬT 7 CỘT CHUẨN CÔNG VĂN 7991/BGDĐT
  buildSpecWordHtml(cfg) {
    const titleUpper = (cfg.titleUpper || 'GIỮA HỌC KÌ I').toUpperCase();
    const grade = cfg.grade || '7';
    const subtitle = cfg.subtitle || 'CHƯƠNG TRÌNH GLOBAL SUCCESS';
    const rows = cfg.specRows || [];

    return `
    <div style="text-align:center;margin-bottom:8pt">
      <div style="font-size:11.5pt;font-weight:bold;line-height:1.25">BẢN ĐẶC TẢ KỸ THUẬT ĐỀ KIỂM TRA ${esc(titleUpper)} - TIẾNG ANH ${esc(grade)}</div>
      <div style="font-size:9.5pt;font-style:italic;line-height:1.2">${esc(subtitle)}</div>
    </div>

    <table style="width:100%;border-collapse:collapse;font-size:8pt;margin-top:6pt">
      <thead>
        <tr style="background:#e8eef5;font-weight:bold;text-align:center">
          <th style="border:1pt solid #000;padding:3pt 2pt;width:5%">TT</th>
          <th style="border:1pt solid #000;padding:3pt 4pt;width:15%">Chủ đề / Kĩ năng</th>
          <th style="border:1pt solid #000;padding:3pt 4pt;width:18%">Đơn vị kiến thức</th>
          <th style="border:1pt solid #000;padding:3pt 4pt;width:38%">Yêu cầu cần đạt</th>
          <th style="border:1pt solid #000;padding:3pt 2pt;width:8%">TNKQ (MCQs)</th>
          <th style="border:1pt solid #000;padding:3pt 2pt;width:8%">TNKQ (Đúng/Sai)</th>
          <th style="border:1pt solid #000;padding:3pt 2pt;width:8%">Tự luận</th>
        </tr>
      </thead>
      <tbody>
        ${rows.map(r => `
          <tr>
            ${r.map((val, ci) => `
              <td style="border:1pt solid #000;padding:3pt 4pt;font-size:8pt;text-align:${ci === 0 || ci >= 4 ? 'center' : 'left'}">
                ${esc(val || '').replace(/\n/g, '<br/>')}
              </td>
            `).join('')}
          </tr>
        `).join('')}
      </tbody>
    </table>`;
  },

  // 3 & 4. Trụ cột 3 & 4: NỘI DUNG TỜ ĐỀ THI CHÍNH THỨC (Header 2x2, Marks box 4 cols, 8 Parts, 10 dòng chấm)
  buildExamWordContentHtml(cfg) {
    const parentAgency = (cfg.parentAgency || 'UBND XÃ ĐỒNG YÊN').toUpperCase();
    const schoolName = (cfg.schoolName || 'TRƯỜNG THCS ĐỒNG YÊN').toUpperCase();
    const titleUpper = (cfg.titleUpper || 'GIỮA HỌC KÌ I').toUpperCase();
    const schoolYear = cfg.schoolYear || '2026 - 2027';
    const grade = cfg.grade || '7';
    const examClass = cfg.examClass || (grade + 'A___');
    const timeMinutes = cfg.timeMinutes || 60;
    const code = cfg.code || (grade + '01');
    const sections = cfg.sections || [];
    const showAnswer = !!cfg.showAnswer;

    let globalQNum = 1;

    return `
    <!-- HEADER 2x2 CHUẨN THCS ĐỒNG YÊN -->
    <table style="width:100%;border:none;margin-bottom:4pt">
      <tr>
        <td style="width:38%;text-align:center;vertical-align:top;border:none;line-height:1.2">
          <div style="font-size:11.5pt;font-weight:bold">${esc(parentAgency)}</div>
          <div style="font-size:11.5pt;font-weight:bold;text-decoration:underline">${esc(schoolName)}</div>
        </td>
        <td style="width:62%;text-align:center;vertical-align:top;border:none;line-height:1.25">
          <div style="font-size:12.5pt;font-weight:bold">BÀI KIỂM TRA ĐÁNH GIÁ ${esc(titleUpper)}</div>
          <div style="font-size:11.5pt;font-weight:bold">NĂM HỌC: ${esc(schoolYear)}</div>
          <div style="font-size:12.5pt;font-weight:bold">Môn: Tiếng Anh ${esc(grade)}</div>
          <div style="font-size:11.5pt;font-style:italic">Thời gian làm bài: ${esc(timeMinutes)} phút (không kể thời gian giao đề)</div>
        </td>
      </tr>
    </table>

    <!-- DÒNG FULL NAME, CLASS, MÃ ĐỀ -->
    <table style="width:100%;border:none;margin:4pt 0 6pt 0;font-size:13pt">
      <tr>
        <td style="width:55%;border:none"><b>Full name:</b> __________________________,</td>
        <td style="width:25%;border:none"><b>Class:</b> ${esc(examClass)}</td>
        <td style="width:20%;text-align:right;border:none"><b style="color:#b91c1c;font-size:13pt">Mã đề: ${esc(code)}</b></td>
      </tr>
    </table>

    <!-- BẢNG MARKS AUTO FIT TO WINDOW 4 CỘT -->
    <table style="width:100%;border-collapse:collapse;margin-bottom:10pt;font-size:11.5pt">
      <tr style="text-align:center;font-weight:bold">
        <td colspan="2" style="border:1pt solid #000;width:22%;padding:4pt">Marks</td>
        <td rowspan="3" style="border:1pt solid #000;width:14%;padding:4pt;vertical-align:middle">Total</td>
        <td rowspan="3" style="border:1pt solid #000;width:64%;padding:4pt 8pt;text-align:left;vertical-align:top">
          <div style="text-align:center;font-weight:bold;margin-bottom:3pt">Teacher’s remarks</div>
          <div style="color:#000;font-size:11pt">________________________________________________</div>
          <div style="color:#000;font-size:11pt;margin-top:3pt">________________________________________________</div>
        </td>
      </tr>
      <tr style="text-align:center;font-weight:bold">
        <td style="border:1pt solid #000;width:11%;padding:3pt">Speak</td>
        <td style="border:1pt solid #000;width:11%;padding:3pt">Write</td>
      </tr>
      <tr style="height:36pt;text-align:center">
        <td style="border:1pt solid #000">&nbsp;</td>
        <td style="border:1pt solid #000">&nbsp;</td>
      </tr>
    </table>

    <!-- NỘI DUNG 8 PHẦN THI -->
    ${sections.map((sec, si) => {
      const secHeading = (sec.title || sec.name || `Part ${si + 1}`);

      if (sec.type === 'speaking' || sec.scriptRows) {
        return `
        <div style="font-size:13pt;font-weight:bold;margin-top:12pt;margin-bottom:4pt">
          ${esc(secHeading)}
        </div>
        <table style="width:100%;border-collapse:collapse;margin-top:6pt;font-size:11.5pt">
          <thead>
            <tr style="background:#f1f5f9;text-align:center;font-weight:bold">
              <th style="border:1pt solid #000;padding:4pt;width:15%">Phần thi (Task)</th>
              <th style="border:1pt solid #000;padding:4pt;width:40%">Kịch bản Giám khảo (Examiner's Script)</th>
              <th style="border:1pt solid #000;padding:4pt;width:30%">Câu trả lời mong đợi của HS</th>
              <th style="border:1pt solid #000;padding:4pt;width:15%">Thang điểm</th>
            </tr>
          </thead>
          <tbody>
            ${(sec.scriptRows || []).map(r => `
              <tr>
                <td style="border:1pt solid #000;padding:4pt;font-weight:bold;vertical-align:top">${esc(r[0] || '').replace(/\n/g, '<br/>')}</td>
                <td style="border:1pt solid #000;padding:4pt;vertical-align:top">${esc(r[1] || '').replace(/\n/g, '<br/>')}</td>
                <td style="border:1pt solid #000;padding:4pt;vertical-align:top">${esc(r[2] || '').replace(/\n/g, '<br/>')}</td>
                <td style="border:1pt solid #000;padding:4pt;vertical-align:top;font-size:10pt">${esc(r[3] || '').replace(/\n/g, '<br/>')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>`;
      }

      return `
      <div style="font-size:13pt;font-weight:bold;margin-top:10pt;margin-bottom:4pt">
        ${esc(secHeading)}
      </div>
      ${sec.passage ? `
      <div style="font-size:13pt;text-align:justify;text-indent:0.5in;line-height:1.25;margin:4pt 0 6pt 0">
        ${formatExamText(sec.passage)}
      </div>` : ''}

      ${(sec.questions || []).map((q, qi) => {
        const qNum = q.num || globalQNum++;
        const isEssay = q.type === 'essay';

        if (isEssay) {
          return `
          <div style="font-size:13pt;margin-bottom:10pt;line-height:1.25">
            <div><b>${qNum}.</b> ${formatExamText(q.content).replace(/\n/g, '<br/>')}</div>
            <div style="margin-top:8pt;color:#000;font-size:12pt;line-height:2.0;letter-spacing:1px">
              ...................................................................................................................................................................<br/>
              ...................................................................................................................................................................<br/>
              ...................................................................................................................................................................<br/>
              ...................................................................................................................................................................<br/>
              ...................................................................................................................................................................<br/>
              ...................................................................................................................................................................<br/>
              ...................................................................................................................................................................<br/>
              ...................................................................................................................................................................<br/>
              ...................................................................................................................................................................<br/>
              ...................................................................................................................................................................
            </div>
            ${showAnswer && q.sampleText ? `
            <div style="margin-top:6pt;padding:6pt 10pt;background:#eff6ff;font-size:11.5pt;color:#1e40af;line-height:1.3">
              📝 <b>Bài viết mẫu tham khảo:</b><br/>${esc(q.sampleText)}
            </div>` : ''}
          </div>`;
        }
        let qOpts = q.options;
        if (!qOpts || !Array.isArray(qOpts) || qOpts.length === 0) {
          if (q.type === 'tf') {
            qOpts = ['A. True', 'B. False'];
          }
        }
        const maxLen = qOpts ? Math.max(...qOpts.map(o => o.length)) : 0;

        return `
        <div style="font-size:13pt;margin-bottom:6pt;line-height:1.25">
          <div><b>${qNum}.</b> ${formatExamText(q.content)}</div>
          ${qOpts ? (maxLen > 30 || qOpts.length > 3 ? `
          <div style="padding-left:14pt;margin-top:2pt">
            ${qOpts.map(opt => `
              <div style="margin:2pt 0;font-size:13pt;${showAnswer && opt.charAt(0) === q.answer ? 'font-weight:bold;color:#b91c1c' : ''}">
                <b>${esc(opt.charAt(0))}.</b> ${formatExamText(opt.slice(3) || opt)} ${showAnswer && opt.charAt(0) === q.answer ? ' ✓' : ''}
              </div>
            `).join('')}
          </div>` : `
          <table style="width:100%;border:none;margin-top:2pt">
            <tr>
              ${qOpts.map(opt => `
                <td style="border:none;font-size:13pt;padding:1pt 4pt;${showAnswer && opt.charAt(0) === q.answer ? 'font-weight:bold;color:#b91c1c' : ''}">
                  <b>${esc(opt.charAt(0))}.</b> ${formatExamText(opt.slice(3) || opt)} ${showAnswer && opt.charAt(0) === q.answer ? ' ✓' : ''}
                </td>
              `).join('')}
            </tr>
          </table>`) : ''}
          ${showAnswer && q.solution ? `
          <div style="margin-top:2pt;padding:3pt 8pt;background:#eff6ff;font-size:11pt;color:#1e40af">
            💡 <b>Giải thích:</b> ${esc(q.solution)}
          </div>` : ''}
        </div>`;
      }).join('')}
      `;
    }).join('')}

    <div style="text-align:center;font-weight:bold;font-size:13pt;margin-top:16pt">
      ------The end------
    </div>`;
  },

  // 5. Trụ cột 5: HƯỚNG DẪN ĐÁP ÁN VÀ BIỂU ĐIỂM (Audio Scripts, Bảng TNKQ 4 cột 18 dòng so sánh 2 mã đề, Rubric tự luận, Kịch bản nói)
  buildAnswerKeyWordHtml(cfg) {
    const parentAgency = (cfg.parentAgency || 'UBND XÃ ĐỒNG YÊN').toUpperCase();
    const schoolName = (cfg.schoolName || 'TRƯỜNG THCS ĐỒNG YÊN').toUpperCase();
    const titleUpper = (cfg.titleUpper || 'GIỮA HỌC KÌ I').toUpperCase();
    const schoolYear = cfg.schoolYear || '2026 - 2027';
    const grade = cfg.grade || '7';
    const code1 = cfg.code1 || (grade + '01');
    const code2 = cfg.code2 || (grade + '02');
    const ans1 = cfg.ans1 || [];
    const ans2 = cfg.ans2 || [];
    const mcqTotalPts = cfg.mcqTotalPts || (cfg.hasSpeaking ? '7.2' : '8.5');
    const part8Points = cfg.part8Points || (cfg.hasSpeaking ? '0.8 điểm' : '1.5 điểm');
    const rubric = cfg.rubric || '';
    const sampleWritingText = cfg.sampleWritingText || '';
    const hasSpeaking = !!cfg.hasSpeaking;
    const speakingScriptRows = cfg.speakingScriptRows || [];
    const finalScoreSummary = cfg.finalScoreSummary || (hasSpeaking ? 'Tổng điểm toàn bài: 10,0 điểm (Trong đó: Viết 8.0 điểm + Nói 2.0 điểm). Điểm số quy về thang điểm 10 theo đúng quy định Thông tư 22/BGDĐT.' : 'Tổng điểm toàn bài: 10,0 điểm (36 câu TNKQ = 8.5 điểm + 1 câu Viết tự luận = 1.5 điểm). Điểm số làm tròn đến 0,1 theo quy định Bộ GD&ĐT.');

    return `
    <div style="text-align:left;line-height:1.2;font-size:12pt;font-weight:bold;margin-bottom:6pt">
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${esc(parentAgency)}<br/>
      &nbsp;&nbsp;&nbsp;&nbsp;${esc(schoolName)}
    </div>
    <div style="text-align:center;margin-bottom:12pt">
      <div style="font-size:13.5pt;font-weight:bold;line-height:1.25">HƯỚNG DẪN ĐÁP ÁN VÀ BIỂU ĐIỂM</div>
      <div style="font-size:13.5pt;font-weight:bold;line-height:1.25">KIỂM TRA ĐÁNH GIÁ ${esc(titleUpper)}</div>
      <div style="font-size:12.5pt;font-weight:bold;margin-top:2pt">NĂM HỌC: ${esc(schoolYear)} - MÔN: TIẾNG ANH ${esc(grade)} (MÃ ĐỀ ${esc(code1)} & ${esc(code2)})</div>
    </div>

    <!-- Audio scripts -->
    ${cfg.audioScript ? `
    <div style="font-size:13pt;font-weight:bold;margin-top:10pt;margin-bottom:4pt">
      NỘI DUNG BÀI NGHE (AUDIO SCRIPTS - DÙNG CHO CẢ 2 MÃ ĐỀ)
    </div>
    <div style="font-size:12pt;line-height:1.35;border:1pt dashed #0284c7;background:#fafafa;padding:8pt 12pt;margin-bottom:12pt">
      ${esc(cfg.audioScript).replace(/\n/g, '<br/>')}
    </div>` : ''}

    <!-- I. TRẮC NGHIỆM KHÁCH QUAN 4 CỘT SO SÁNH 2 MÃ ĐỀ CHUẨN THẦY THÀNH -->
    <div style="font-size:13pt;font-weight:bold;margin-top:12pt;margin-bottom:6pt">
      I. PHẦN TRẮC NGHIỆM KHÁCH QUAN (36 CÂU = ${mcqTotalPts} ĐIỂM TRÊN ĐỀ VIẾT)
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:12pt;margin-bottom:12pt">
      <thead>
        <tr style="background:#e8eef5;font-weight:bold;text-align:center">
          <th style="border:1pt solid #000;padding:5pt;width:12%">Câu</th>
          <th style="border:1pt solid #000;padding:5pt;width:38%">Đáp án MÃ ĐỀ ${esc(code1)}</th>
          <th style="border:1pt solid #000;padding:5pt;width:12%">Câu</th>
          <th style="border:1pt solid #000;padding:5pt;width:38%">Đáp án MÃ ĐỀ ${esc(code2)}</th>
        </tr>
      </thead>
      <tbody>
        ${(() => {
          let rowsHtml = '';
          for (let i = 0; i < 18; i++) {
            const q1 = i + 1;
            const a1 = ans1[i] || '';
            const q2 = i + 19;
            const a2 = ans2[i + 18] || '';
            rowsHtml += `
              <tr style="text-align:center">
                <td style="border:1pt solid #000;padding:4pt;font-weight:bold">${q1}</td>
                <td style="border:1pt solid #000;padding:4pt;font-weight:bold;color:#b91c1c">${esc(a1)}</td>
                <td style="border:1pt solid #000;padding:4pt;font-weight:bold">${q2}</td>
                <td style="border:1pt solid #000;padding:4pt;font-weight:bold;color:#0369a1">${esc(a2)}</td>
              </tr>
            `;
          }
          return rowsHtml;
        })()}
      </tbody>
    </table>

    <!-- II. TỰ LUẬN VIẾT -->
    <div style="font-size:13pt;font-weight:bold;margin-top:12pt;margin-bottom:4pt">
      II. PHẦN TỰ LUẬN VIẾT (PART 8: ${part8Points})
    </div>
    ${rubric ? `
    <div style="font-size:12pt;line-height:1.35;margin-bottom:6pt">
      ${esc(rubric).replace(/\n/g, '<br/>')}
    </div>` : ''}

    ${sampleWritingText ? `
    <div style="font-size:12.5pt;font-weight:bold;font-style:italic;margin-top:6pt;margin-bottom:2pt">
      * Đoạn văn mẫu tham khảo (Sample writing):
    </div>
    <div style="font-size:12.5pt;line-height:1.35;text-align:justify;text-indent:0.5in;margin-bottom:12pt">
      ${esc(sampleWritingText)}
    </div>` : ''}

    <!-- III. THI NÓI (NẾU CÓ) -->
    ${hasSpeaking && speakingScriptRows && speakingScriptRows.length ? `
    <div style="font-size:13pt;font-weight:bold;margin-top:12pt;margin-bottom:6pt">
      III. PHẦN THI NÓI (SPEAKING TEST: 2.0 ĐIỂM)
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:9.5pt;margin-bottom:12pt">
      <thead>
        <tr style="background:#e8eef5;font-weight:bold;text-align:center">
          <th style="border:1pt solid #000;padding:4pt;width:15%">To do</th>
          <th style="border:1pt solid #000;padding:4pt;width:35%">To say (Examiner)</th>
          <th style="border:1pt solid #000;padding:4pt;width:30%">Response (Students)</th>
          <th style="border:1pt solid #000;padding:4pt;width:20%">Back-up</th>
        </tr>
      </thead>
      <tbody>
        ${speakingScriptRows.map(row => `
          <tr>
            <td style="border:1pt solid #000;padding:4pt;font-weight:bold;text-align:center;vertical-align:top">${esc(row[0] || '').replace(/\n/g, '<br/>')}</td>
            <td style="border:1pt solid #000;padding:4pt;vertical-align:top">${esc(row[1] || '').replace(/\n/g, '<br/>')}</td>
            <td style="border:1pt solid #000;padding:4pt;vertical-align:top">${esc(row[2] || '').replace(/\n/g, '<br/>')}</td>
            <td style="border:1pt solid #000;padding:4pt;vertical-align:top;font-size:9pt">${esc(row[3] || '').replace(/\n/g, '<br/>')}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>` : ''}

    <div style="font-size:12.5pt;font-weight:bold;margin-top:12pt;line-height:1.3">
      ${esc(finalScoreSummary)}
    </div>
    <div style="margin-top:20pt;text-align:right;padding-right:20pt;font-size:11.5pt">
      <b>GIÁO VIÊN RA ĐỀ</b><br/><br/><br/>
      <b>${esc(cfg.teacher || 'Thầy Đinh Văn Thành')}</b>
    </div>`;
  },

  // ── XUẤT TRỌN BỘ 5 PHẦN CHUẨN CÔNG VĂN 7991 (App Thầy Đinh Văn Thành) ──────────
  exportFullBundleWord() {
    const wiz = this.state.wizard;
    const curG = String(wiz.grade || '7');
    const curT = this.getWizardTermKey ? this.getWizardTermKey() : (wiz.term || 'GK1');
    const suite = this.getOfficialExamSuite(curG, curT);

    const parentAgency = (localStorage.getItem('cfg_parent_agency') || 'UBND XÃ ĐỒNG YÊN').toUpperCase();
    const schoolName = (wiz.schoolName || localStorage.getItem('cfg_school_name') || 'TRƯỜNG THCS ĐỒNG YÊN').toUpperCase();
    const schoolYear = localStorage.getItem('cfg_school_year') || '2026 - 2027';
    const titleUpper = (wiz.termTitle || (suite ? suite.termTitle : curT)).toUpperCase();
    const timeMinutes = wiz.examTime || (suite ? suite.timeMinutes : 60);

    const code1 = wiz.code1 || (suite ? suite.code1 : (curG + '01'));
    const code2 = wiz.code2 || (suite ? suite.code2 : (curG + '02'));
    const sec1 = wiz.selectedSections || (suite ? suite.sections_code1 : []);
    const sec2 = wiz.sections_code2 || (suite ? suite.sections_code2 : sec1);

    const matrixRows = (wiz.matrixRows && wiz.matrixRows.length) ? wiz.matrixRows : (suite ? suite.matrixRows : []);
    const specRows = (wiz.specRows && wiz.specRows.length) ? wiz.specRows : (suite ? suite.specRows : []);

    const ans1 = (suite && suite.answers_code1) || sec1.flatMap(s => s.questions || []).filter(q => q.type !== 'essay').map(q => q.answer || 'A');
    const ans2 = (suite && suite.answers_code2) || sec2.flatMap(s => s.questions || []).filter(q => q.type !== 'essay').map(q => q.answer || 'B');

    const p8q = sec1.flatMap(s => s.questions || []).find(q => q.type === 'essay');
    const rubric = wiz.writingRubric || (suite ? suite.writingRubric : (p8q ? p8q.rubric : ''));
    const sampleWritingText = wiz.sampleWritingText || (suite ? suite.sampleWritingText : (p8q ? p8q.sampleText : ''));
    const hasSpeaking = wiz.hasSpeaking !== undefined ? wiz.hasSpeaking : (suite ? suite.hasSpeaking : false);
    const speakingScriptRows = wiz.speakingScriptRows || (suite ? suite.speakingScriptRows : []);
    const finalScoreSummary = wiz.finalScoreSummary || (suite ? suite.finalScoreSummary : '');

    // 1. Ma trận 15 cột
    const part1Html = this.buildMatrixWordHtml({
      parentAgency, schoolName, examYear: schoolYear, titleUpper, grade: curG, timeMinutes,
      subtitle: wiz.matrixSubtitle || (suite ? suite.matrixSubtitle : ''),
      matrixRows
    });

    // 2. Bản đặc tả 7 cột
    const part2Html = this.buildSpecWordHtml({
      titleUpper, grade: curG,
      subtitle: wiz.specSubtitle || (suite ? suite.specSubtitle : ''),
      specRows
    });

    // 3. Đề thi Mã 1
    const part3Html = this.buildExamWordContentHtml({
      sections: sec1, titleUpper, code: code1, schoolYear, parentAgency, schoolName,
      grade: curG, examClass: wiz.examClass || (curG + 'A1'), timeMinutes
    });

    // 4. Đề thi Mã 2
    const part4Html = this.buildExamWordContentHtml({
      sections: sec2, titleUpper, code: code2, schoolYear, parentAgency, schoolName,
      grade: curG, examClass: wiz.examClass || (curG + 'A1'), timeMinutes
    });

    // 5. Hướng dẫn đáp án và biểu điểm
    const part5Html = this.buildAnswerKeyWordHtml({
      parentAgency, schoolName, examYear: schoolYear, titleUpper, grade: curG,
      code1, code2, audioScript: wiz.audioScript || (suite ? suite.fullAudioScript : ''),
      ans1, ans2, mcqTotalPts: hasSpeaking ? '7.2' : '8.5',
      part8Points: hasSpeaking ? '0.8 điểm' : '1.5 điểm',
      rubric, sampleWritingText, hasSpeaking, speakingScriptRows,
      finalScoreSummary, teacher: wiz.teacherName || 'Thầy Đinh Văn Thành'
    });

    const pageBreak = '<br clear="all" style="page-break-before:always;mso-break-type:page-break"/>';
    const fullHtml = this.wrapDocHtml([part1Html, part2Html, part3Html, part4Html, part5Html].join(pageBreak), `${curT} - Anh ${curG} Tron Bo 5 Phan Chuan CV7991`);

    const blob = new Blob(['\ufeff' + fullHtml], { type: 'application/msword;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${curT}_Anh_${curG}_Tron_Bo_5_Phan_Chuan_CV7991_${code1}_${code2}.doc`;
    link.click();
    UI.toast(`📦 Đã xuất trọn bộ 5 phần chuẩn CV 7991 (.doc)!`, 'success');
  },

  // ── XUẤT MA TRẬN & BẢN ĐẶC TẢ (.DOC) ──────────
  exportMatrixAndSpecWord() {
    const wiz = this.state.wizard;
    const curG = String(wiz.grade || '7');
    const curT = this.getWizardTermKey ? this.getWizardTermKey() : (wiz.term || 'GK1');
    const suite = this.getOfficialExamSuite(curG, curT);

    const parentAgency = (localStorage.getItem('cfg_parent_agency') || 'UBND XÃ ĐỒNG YÊN').toUpperCase();
    const schoolName = (wiz.schoolName || localStorage.getItem('cfg_school_name') || 'TRƯỜNG THCS ĐỒNG YÊN').toUpperCase();
    const schoolYear = localStorage.getItem('cfg_school_year') || '2026 - 2027';
    const titleUpper = (wiz.termTitle || (suite ? suite.termTitle : curT)).toUpperCase();
    const timeMinutes = wiz.examTime || (suite ? suite.timeMinutes : 60);

    const matrixRows = (wiz.matrixRows && wiz.matrixRows.length) ? wiz.matrixRows : (suite ? suite.matrixRows : []);
    const specRows = (wiz.specRows && wiz.specRows.length) ? wiz.specRows : (suite ? suite.specRows : []);

    const part1Html = this.buildMatrixWordHtml({
      parentAgency, schoolName, examYear: schoolYear, titleUpper, grade: curG, timeMinutes,
      subtitle: wiz.matrixSubtitle || (suite ? suite.matrixSubtitle : ''),
      matrixRows
    });

    const part2Html = this.buildSpecWordHtml({
      titleUpper, grade: curG,
      subtitle: wiz.specSubtitle || (suite ? suite.specSubtitle : ''),
      specRows
    });

    const pageBreak = '<br clear="all" style="page-break-before:always;mso-break-type:page-break"/>';
    const fullHtml = this.wrapDocHtml([part1Html, part2Html].join(pageBreak), `${curT} - Anh ${curG} Ma Tran va Ban Dac Ta`);

    const blob = new Blob(['\ufeff' + fullHtml], { type: 'application/msword;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${curT}_Anh_${curG}_Ma_Tran_Va_Ban_Dac_Ta_7991.doc`;
    link.click();
    UI.toast(`📊 Đã xuất Ma trận 15 cột & Bản đặc tả 7 cột (.doc)!`, 'success');
  },

  // ── XUẤT ĐÁP ÁN & HƯỚNG DẪN CHẤM (.DOC) ──────────
  exportAnswerKeyWord() {
    const wiz = this.state.wizard;
    const curG = String(wiz.grade || '7');
    const curT = this.getWizardTermKey ? this.getWizardTermKey() : (wiz.term || 'GK1');
    const suite = this.getOfficialExamSuite(curG, curT);

    const parentAgency = (localStorage.getItem('cfg_parent_agency') || 'UBND XÃ ĐỒNG YÊN').toUpperCase();
    const schoolName = (wiz.schoolName || localStorage.getItem('cfg_school_name') || 'TRƯỜNG THCS ĐỒNG YÊN').toUpperCase();
    const schoolYear = localStorage.getItem('cfg_school_year') || '2026 - 2027';
    const titleUpper = (wiz.termTitle || (suite ? suite.termTitle : curT)).toUpperCase();
    const code1 = wiz.code1 || `${curG}01`;
    const code2 = wiz.code2 || `${curG}02`;

    const sec1 = wiz.sections || [];
    const sec2 = wiz.sectionsCode2 && wiz.sectionsCode2.length ? wiz.sectionsCode2 : sec1;

    const ans1 = sec1.flatMap(s => (s.questions || []).map((q, idx) => ({ num: idx + 1, ans: q.correctAnswer || 'A' })));
    const ans2 = sec2.flatMap(s => (s.questions || []).map((q, idx) => ({ num: idx + 1, ans: q.correctAnswer || 'A' })));

    const p8q = sec1.flatMap(s => s.questions || []).find(q => q.type === 'essay');
    const rubric = wiz.writingRubric || (suite ? suite.writingRubric : (p8q ? p8q.rubric : ''));
    const sampleWritingText = wiz.sampleWritingText || (suite ? suite.sampleWritingText : (p8q ? p8q.sampleText : ''));
    const hasSpeaking = wiz.hasSpeaking !== undefined ? wiz.hasSpeaking : (suite ? suite.hasSpeaking : false);
    const speakingScriptRows = wiz.speakingScriptRows || (suite ? suite.speakingScriptRows : []);
    const finalScoreSummary = wiz.finalScoreSummary || (suite ? suite.finalScoreSummary : '');

    const ansHtml = this.buildAnswerKeyWordHtml({
      parentAgency, schoolName, examYear: schoolYear, titleUpper, grade: curG,
      code1, code2, audioScript: wiz.audioScript || (suite ? suite.fullAudioScript : ''),
      ans1, ans2, mcqTotalPts: hasSpeaking ? '7.2' : '8.5',
      part8Points: hasSpeaking ? '0.8 điểm' : '1.5 điểm',
      rubric, sampleWritingText, hasSpeaking, speakingScriptRows,
      finalScoreSummary, teacher: wiz.teacherName || 'Thầy Đinh Văn Thành'
    });

    const fullHtml = this.wrapDocHtml(ansHtml, `${curT} - Anh ${curG} Dap An va Huong Dan Cham`);
    const blob = new Blob(['\ufeff' + fullHtml], { type: 'application/msword;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${curT}_Anh_${curG}_Dap_An_Va_Huong_Dan_Cham_${code1}_${code2}.doc`;
    link.click();
    UI.toast(`👩‍🏫 Đã xuất Đáp án & Hướng dẫn chấm (.doc)!`, 'success');
  },

  renderPreview() {
    const wiz = this.state.wizard;
    const curG = String(wiz.grade || '7');
    const curT = this.getWizardTermKey ? this.getWizardTermKey() : (wiz.term || 'GK1');
    const suite = this.getOfficialExamSuite(curG, curT);
    const parentAgency = (localStorage.getItem('cfg_parent_agency') || 'UBND XÃ ĐỒNG YÊN').toUpperCase();
    const schoolName = (wiz.schoolName || localStorage.getItem('cfg_school_name') || 'TRƯỜNG THCS ĐỒNG YÊN').toUpperCase();
    const examYear = localStorage.getItem('cfg_school_year') || '2026 - 2027';
    const isCode2 = (wiz.selectedPreviewCode === 2);
    const curCode = isCode2 ? (wiz.code2 || `${curG}02`) : (wiz.code1 || `${curG}01`);
    const secs = isCode2 && wiz.sectionsCode2 && wiz.sectionsCode2.length ? wiz.sectionsCode2 : (wiz.sections || []);
    const hasAudio = !!(wiz.audioUrl || wiz.audioScript);

    // Dữ liệu đáp án và bổ trợ
    const sec1 = wiz.sections || [];
    const sec2 = wiz.sectionsCode2 && wiz.sectionsCode2.length ? wiz.sectionsCode2 : sec1;
    const ans1 = sec1.flatMap(s => (s.questions || []).map((q, idx) => ({ num: idx + 1, ans: q.correctAnswer || 'A' })));
    const ans2 = sec2.flatMap(s => (s.questions || []).map((q, idx) => ({ num: idx + 1, ans: q.correctAnswer || 'A' })));
    const p8q = sec1.flatMap(s => s.questions || []).find(q => q.type === 'essay');
    const rubric = wiz.writingRubric || (suite ? suite.writingRubric : (p8q ? p8q.rubric : ''));
    const sampleWritingText = wiz.sampleWritingText || (suite ? suite.sampleWritingText : (p8q ? p8q.sampleText : ''));
    const hasSpeaking = wiz.hasSpeaking !== undefined ? wiz.hasSpeaking : (suite ? suite.hasSpeaking : false);
    const speakingScriptRows = wiz.speakingScriptRows || (suite ? suite.speakingScriptRows : []);
    const finalScoreSummary = wiz.finalScoreSummary || (suite ? suite.finalScoreSummary : '');

    return `
    <div class="page-body slide-up">
      <!-- Toolbar -->
      <div class="card mb-20 flex-between no-print" style="padding:14px 20px;flex-wrap:wrap;gap:10px">
        <button class="btn btn-outline" onclick="App.goStep2()">← Sửa ma trận</button>
        <div class="row" style="flex-wrap:wrap;gap:8px">
          <div class="tabs" style="padding:3px">
            <button class="tab-btn ${(!isCode2 && wiz.previewMode !== 'teacher' && wiz.previewMode !== 'matrix') ? 'active' : ''}" onclick="App.setPreviewCode(1); App.setPreviewMode('student')">👨‍🎓 Đề Mã 1 (${wiz.code1 || (curG + '01')})</button>
            <button class="tab-btn ${(isCode2 && wiz.previewMode !== 'teacher' && wiz.previewMode !== 'matrix') ? 'active' : ''}" onclick="App.setPreviewCode(2); App.setPreviewMode('student')">🔀 Đề Mã 2 (${wiz.code2 || (curG + '02')})</button>
            <button class="tab-btn ${wiz.previewMode === 'teacher' ? 'active' : ''}" onclick="App.setPreviewMode('teacher')">👩‍🏫 Kèm Đáp án & HDG</button>
            <button class="tab-btn ${wiz.previewMode === 'matrix' ? 'active' : ''}" onclick="App.setPreviewMode('matrix')">📊 Ma Trận & Bản Đặc Tả 7991</button>
          </div>
          <button class="btn btn-warn" onclick="App.generateRandomizedOfficialExam('${curG}', '${curT}')" title="Bốc một đề thi hoàn toàn khác từ kho tổ hợp 10^28 đề">🎲 Bốc Đề Khác</button>
          <button class="btn btn-primary" onclick="App.exportWord(null, null, '${esc(curCode)}', false)">📄 Xuất Đề Mã ${isCode2 ? '2' : '1'} (.doc)</button>
          <button class="btn" style="background:#0284c7;color:#fff;font-weight:700" onclick="App.exportMatrixAndSpecWord()" title="Xuất riêng Ma trận 15 cột và Bản đặc tả 7 cột (.doc)">📊 Xuất Ma Trận & Đặc Tả (.doc)</button>
          <button class="btn" style="background:#d97706;color:#fff;font-weight:700" onclick="App.exportAnswerKeyWord()" title="Xuất Audio Script, bảng so sánh 4 cột và hướng dẫn chấm (.doc)">👩‍🏫 Xuất Đáp Án & HD Chấm (.doc)</button>
          <button class="btn btn-success" onclick="App.exportFullBundleWord()" title="Xuất trọn bộ 5 phần chuẩn Công văn 7991 như app Desktop">📦 Trọn Bộ 5 Phần Chuẩn App (.doc)</button>
          <button class="btn" style="background:#7c3aed;color:#fff;font-weight:700" onclick="App.assignWizardExamOnline()">🚀 Giao bài Online</button>
          <button class="btn btn-outline" onclick="window.print()">🖨️ In đề A4</button>
        </div>
      </div>

      <!-- Audio Player Toolbar -->
      ${hasAudio ? `
      <div class="card mb-20 no-print" style="border:1.5px solid #0284c7;background:linear-gradient(135deg,#f0f9ff,#e0f2fe);padding:16px 20px">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">
          <div style="display:flex;align-items:center;gap:12px">
            <div style="font-size:32px">🎧</div>
            <div>
              <div style="font-weight:800;font-size:15px;color:#0369a1">${esc(wiz.audioTitle || `Track 1: Listening Comprehension - Tiếng Anh ${curG}`)}</div>
              <div style="font-size:12px;color:#0284c7">Trình phát Audio bài thi & Giọng đọc AI bản ngữ (UK/US Accent)</div>
            </div>
          </div>
          <div class="row gap-8">
            <button class="btn btn-primary btn-sm" id="btn-audio-play" onclick="App.togglePreviewAudio()">
              ${this.state.previewAudioPlaying ? '⏸ Tạm dừng Audio' : '▶ Phát Audio Nghe Thử'}
            </button>
            <button class="btn btn-outline btn-sm" onclick="App.togglePreviewScript()">
              👁️ ${wiz.showScript ? 'Ẩn Audio Script' : 'Hiện Audio Script'}
            </button>
          </div>
        </div>

        ${wiz.showScript && wiz.audioScript ? `
        <div style="margin-top:14px;padding:12px 16px;background:#ffffff;border:1px dashed #0284c7;border-radius:var(--r-md);font-size:13px;line-height:1.6;color:#1e293b;white-space:pre-wrap">
          <b>📜 Audio Script / Transcript bài nghe:</b>\n${esc(wiz.audioScript)}
        </div>` : ''}
      </div>` : ''}

      <!-- Exam Sheet: Chuẩn 100% Mẫu Thầy Đinh Văn Thành (THCS Đồng Yên) -->
      ${wiz.previewMode === 'matrix' ? `
        <div class="card p-24" style="background:#fff">
          <div style="text-align:center;margin-bottom:14px">
            <div style="font-size:12pt;font-weight:bold;color:#1e293b">${esc(parentAgency)} - ${esc(schoolName)}</div>
            <div style="font-size:14pt;font-weight:bold;color:#1e3a8a;margin-top:3px">MA TRẬN ĐỀ KIỂM TRA ĐÁNH GIÁ ${esc((wiz.termTitle || curT).toUpperCase())} – NĂM HỌC ${esc(examYear)}</div>
            <div style="font-size:11.5pt;font-weight:bold;color:#334155">MÔN: TIẾNG ANH ${curG} (GLOBAL SUCCESS) - THỜI GIAN LÀM BÀI: ${wiz.examTime || 60} PHÚT</div>
            <div style="font-size:10.5pt;font-style:italic;color:#64748b">${esc(wiz.matrixSubtitle || (suite ? suite.matrixSubtitle : 'Hình thức: 100% Bài kiểm tra Viết trên giấy (Thang điểm: 10,0 điểm - Giữa kỳ không thi Nói)'))}</div>
          </div>

          <!-- Bảng 1: Ma trận 15 cột chuẩn CV 7991 -->
          <div style="overflow-x:auto;margin-bottom:24px">
            <table style="width:100%;border-collapse:collapse;font-size:9.5pt;min-width:900px">
              <thead>
                <tr style="background:#e8eef5;font-weight:bold;text-align:center">
                  <th rowspan="2" style="border:1px solid #000;padding:6px 4px;width:4%">TT</th>
                  <th rowspan="2" style="border:1px solid #000;padding:6px 4px;width:15%">Chủ đề / Kĩ năng</th>
                  <th rowspan="2" style="border:1px solid #000;padding:6px 4px;width:21%">Nội dung / Đơn vị kiến thức</th>
                  <th colspan="3" style="border:1px solid #000;padding:6px 4px">TNKQ nhiều lựa chọn</th>
                  <th colspan="3" style="border:1px solid #000;padding:6px 4px">TNKQ Đúng/Sai</th>
                  <th colspan="3" style="border:1px solid #000;padding:6px 4px">Tự luận</th>
                  <th colspan="3" style="border:1px solid #000;padding:6px 4px">Tổng</th>
                </tr>
                <tr style="background:#e8eef5;font-weight:bold;text-align:center">
                  <th style="border:1px solid #000;padding:4px 2px;width:4.5%">Biết</th>
                  <th style="border:1px solid #000;padding:4px 2px;width:4.5%">Hiểu</th>
                  <th style="border:1px solid #000;padding:4px 2px;width:4.5%">VD</th>
                  <th style="border:1px solid #000;padding:4px 2px;width:4.5%">Biết</th>
                  <th style="border:1px solid #000;padding:4px 2px;width:4.5%">Hiểu</th>
                  <th style="border:1px solid #000;padding:4px 2px;width:4.5%">VD</th>
                  <th style="border:1px solid #000;padding:4px 2px;width:4.5%">Biết</th>
                  <th style="border:1px solid #000;padding:4px 2px;width:4.5%">Hiểu</th>
                  <th style="border:1px solid #000;padding:4px 2px;width:4.5%">VD</th>
                  <th style="border:1px solid #000;padding:4px 2px;width:5%">Biết</th>
                  <th style="border:1px solid #000;padding:4px 2px;width:5%">Hiểu</th>
                  <th style="border:1px solid #000;padding:4px 2px;width:5%">VD</th>
                </tr>
              </thead>
              <tbody>
                ${(wiz.matrixRows || (suite ? suite.matrixRows : [])).map(r => {
                  const isTotal = (r[0] || '').startsWith('TỔNG');
                  return `
                  <tr style="${isTotal ? 'background:#f4f6f9;font-weight:bold' : ''}">
                    ${r.map((val, ci) => `
                      <td style="border:1px solid #000;padding:5px 4px;text-align:${ci === 1 || ci === 2 ? 'left' : 'center'};${isTotal ? 'font-weight:bold' : ''}">
                        ${esc(val || '').replace(/\n/g, '<br/>')}
                      </td>
                    `).join('')}
                  </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>

          <!-- Bảng 2: Bản đặc tả 7 cột chuẩn CV 7991 -->
          <div style="text-align:center;margin:20px 0 12px 0">
            <div style="font-size:13.5pt;font-weight:bold;color:#1e3a8a">BẢN ĐẶC TẢ KỸ THUẬT ĐỀ KIỂM TRA ${esc((wiz.termTitle || curT).toUpperCase())} - TIẾNG ANH ${curG}</div>
            <div style="font-size:10.5pt;font-style:italic;color:#64748b">${esc(wiz.specSubtitle || (suite ? suite.specSubtitle : 'CHƯƠNG TRÌNH GLOBAL SUCCESS'))}</div>
          </div>
          <div style="overflow-x:auto">
            <table style="width:100%;border-collapse:collapse;font-size:9.5pt;min-width:900px">
              <thead>
                <tr style="background:#e8eef5;font-weight:bold;text-align:center">
                  <th style="border:1px solid #000;padding:6px 4px;width:4%">TT</th>
                  <th style="border:1px solid #000;padding:6px 6px;width:15%">Chủ đề / Kĩ năng</th>
                  <th style="border:1px solid #000;padding:6px 6px;width:18%">Đơn vị kiến thức</th>
                  <th style="border:1px solid #000;padding:6px 8px;width:37%">Yêu cầu cần đạt</th>
                  <th style="border:1px solid #000;padding:6px 4px;width:8.5%">TNKQ (MCQs)</th>
                  <th style="border:1px solid #000;padding:6px 4px;width:8.5%">TNKQ (Đúng/Sai)</th>
                  <th style="border:1px solid #000;padding:6px 4px;width:9%">Tự luận</th>
                </tr>
              </thead>
              <tbody>
                ${(wiz.specRows || (suite ? suite.specRows : [])).map(r => `
                  <tr>
                    ${r.map((val, ci) => `
                      <td style="border:1px solid #000;padding:5px 6px;text-align:${ci === 0 || ci >= 4 ? 'center' : 'left'}">
                        ${esc(val || '').replace(/\n/g, '<br/>')}
                      </td>
                    `).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      ` : `
      <div class="exam-preview-wrap">
        <div class="exam-sheet" id="exam-sheet" style="font-family:'Times New Roman',serif;font-size:13pt;line-height:1.25">
          <!-- 1. Header Table (2x2) -->
          <table style="width:100%;border:none;margin-bottom:6pt;font-family:'Times New Roman',serif">
            <tr>
              <td style="width:38%;text-align:center;vertical-align:top;border:none;line-height:1.2">
                <div style="font-size:11.5pt;font-weight:bold">${esc(parentAgency)}</div>
                <div style="font-size:11.5pt;font-weight:bold;text-decoration:underline">${esc(schoolName)}</div>
              </td>
              <td style="width:62%;text-align:center;vertical-align:top;border:none;line-height:1.25">
                <div style="font-size:12.5pt;font-weight:bold">${esc((wiz.examTitle || wiz.termTitle || 'BÀI KIỂM TRA ĐÁNH GIÁ').toUpperCase())}</div>
                <div style="font-size:11.5pt;font-weight:bold">NĂM HỌC: ${esc(examYear)}</div>
                <div style="font-size:12.5pt;font-weight:bold">Môn: Tiếng Anh ${curG}</div>
                <div style="font-size:11.5pt;font-style:italic">Thời gian làm bài: ${wiz.examTime || 60} phút (không kể thời gian giao đề)</div>
              </td>
            </tr>
          </table>

          <!-- 2. Dòng Full Name, Class, Mã đề -->
          <div style="font-size:13pt;margin:6pt 0 8pt 0;display:flex;justify-content:space-between;align-items:center">
            <span><b>Full name:</b> ____________________________________,</span>
            <span><b>Class:</b> ${esc(wiz.examClass || (curG + 'A1'))}</span>
            <span><b style="color:#b91c1c;font-size:13pt">Mã đề: ${esc(curCode)}</b></span>
          </div>

          <!-- 3. Bảng Điểm Marks Box (Auto fit to window - Chuẩn THCS Đồng Yên) -->
          <table style="width:100%;border-collapse:collapse;margin-bottom:12pt;font-family:'Times New Roman',serif;font-size:11.5pt">
            <tr style="text-align:center;font-weight:bold">
              <td colspan="2" style="border:1px solid #000;width:22%;padding:4px">Marks</td>
              <td rowspan="3" style="border:1px solid #000;width:14%;padding:4px;vertical-align:middle">Total</td>
              <td rowspan="3" style="border:1px solid #000;width:64%;padding:6px 12px;text-align:left;vertical-align:top">
                <div style="text-align:center;font-weight:bold;margin-bottom:6px">Teacher’s remarks</div>
                <div style="color:#000;font-size:11pt">____________________________________________________________________</div>
                <div style="color:#000;font-size:11pt;margin-top:6px">____________________________________________________________________</div>
              </td>
            </tr>
            <tr style="text-align:center;font-weight:bold">
              <td style="border:1px solid #000;width:11%;padding:3px">Speak</td>
              <td style="border:1px solid #000;width:11%;padding:3px">Write</td>
            </tr>
            <tr style="height:38px;text-align:center">
              <td style="border:1px solid #000">&nbsp;</td>
              <td style="border:1px solid #000">&nbsp;</td>
            </tr>
          </table>

          <!-- 4. Nội dung câu hỏi theo chuẩn CV 7991 (Cỡ chữ 13 Times New Roman) -->
          ${(() => {
            let globalQNum = 1;
            return secs.map((sec, si) => {
              const secHeading = (sec.title || sec.name || `Part ${si + 1}`);

              if (sec.type === 'speaking' || sec.scriptRows) {
                return `
                <div style="font-size:13pt;font-weight:bold;margin-top:14pt;margin-bottom:6pt;color:#1e3a8a">
                  ${esc(secHeading)}
                </div>
                <table style="width:100%;border-collapse:collapse;margin-top:6pt;font-size:11.5pt">
                  <thead>
                    <tr style="background:#f1f5f9;text-align:center;font-weight:bold">
                      <th style="border:1px solid #000;padding:6px;width:15%">Phần thi (Task)</th>
                      <th style="border:1px solid #000;padding:6px;width:40%">Kịch bản Giám khảo (Examiner's Script)</th>
                      <th style="border:1px solid #000;padding:6px;width:30%">Câu trả lời mong đợi của HS</th>
                      <th style="border:1px solid #000;padding:6px;width:15%">Thang điểm</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${(sec.scriptRows || []).map(r => `
                      <tr>
                        <td style="border:1px solid #000;padding:6px;font-weight:bold;vertical-align:top">${esc(r[0]).replace(/\n/g, '<br/>')}</td>
                        <td style="border:1px solid #000;padding:6px;vertical-align:top">${esc(r[1]).replace(/\n/g, '<br/>')}</td>
                        <td style="border:1px solid #000;padding:6px;vertical-align:top">${esc(r[2]).replace(/\n/g, '<br/>')}</td>
                        <td style="border:1px solid #000;padding:6px;vertical-align:top;font-size:10pt">${esc(r[3] || '').replace(/\n/g, '<br/>')}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>`;
              }

              return `
              <div style="font-size:13pt;font-weight:bold;margin-top:12pt;margin-bottom:4pt">
                ${esc(secHeading)}
              </div>
              ${sec.passage ? `
              <div style="font-size:12.5pt;font-style:italic;background:#f8fafc;border:1px dashed #64748b;padding:10px 14px;margin-bottom:10px;line-height:1.4">
                ${formatExamText(sec.passage)}
              </div>` : ''}

              ${(sec.questions || []).map((q, qi) => {
                const qNum = q.num || globalQNum++;
                const isEssay = q.type === 'essay';

                if (isEssay) {
                  return `
                  <div style="font-size:13pt;margin-bottom:12pt;line-height:1.3">
                    <div><b>${qNum}.</b> ${formatExamText(q.content).replace(/\n/g, '<br/>')}</div>
                    <!-- 10 dòng kẻ chấm chuẩn bài thi viết Thầy Đinh Văn Thành -->
                    <div style="margin-top:8pt;color:#000;font-size:12pt;line-height:2.0;letter-spacing:1px">
                      ...................................................................................................................................................................<br/>
                      ...................................................................................................................................................................<br/>
                      ...................................................................................................................................................................<br/>
                      ...................................................................................................................................................................<br/>
                      ...................................................................................................................................................................<br/>
                      ...................................................................................................................................................................<br/>
                      ...................................................................................................................................................................<br/>
                      ...................................................................................................................................................................<br/>
                      ...................................................................................................................................................................<br/>
                      ...................................................................................................................................................................
                    </div>
                  </div>`;
                }

                let qOpts = q.options;
                if (!qOpts || !Array.isArray(qOpts) || qOpts.length === 0) {
                  if (q.type === 'tf' || q.type !== 'essay') {
                    qOpts = ['A. True', 'B. False'];
                  }
                }

                return `
                <div style="font-size:13pt;margin-bottom:8pt;line-height:1.25">
                  <div><b>${qNum}.</b> ${formatExamText(q.content)}</div>
                  ${qOpts ? `
                  <div style="padding-left:16pt;margin-top:3pt;display:grid;grid-template-columns:1fr 1fr;gap:4pt;font-size:13pt">
                    ${qOpts.map(opt => `
                    <div class="${wiz.previewMode === 'teacher' && opt.charAt(0) === (q.correctAnswer || q.answer) ? 'correct-answer' : ''}">
                      ${formatExamText(opt)} ${wiz.previewMode === 'teacher' && opt.charAt(0) === (q.correctAnswer || q.answer) ? ' ✓' : ''}
                    </div>`).join('')}
                  </div>` : ''}
                  ${wiz.previewMode === 'teacher' && (q.solution || q.explanation) ? `
                  <div style="margin-top:4pt;padding:4pt 10pt;background:#eff6ff;border-left:3px solid #2563eb;font-size:11pt;color:#1e40af">
                    💡 <b>Giải thích:</b> ${formatExamText(q.solution || q.explanation)}
                  </div>` : ''}
                </div>`;
              }).join('')}
              `;
            }).join('');
          })()}

          <div style="text-align:center;font-weight:bold;font-style:italic;margin-top:20pt;font-size:12pt">
            ------The end------
          </div>

          <!-- Nếu ở chế độ Giáo viên: Hiện Đáp Án & Hướng Dẫn Chấm chi tiết chuẩn Thầy Thành -->
          ${wiz.previewMode === 'teacher' ? `
          <div style="margin-top:30pt;border-top:2px dashed #0284c7;padding-top:20pt">
            <div style="text-align:center;margin-bottom:14pt">
              <div style="font-size:12pt;font-weight:bold">${esc(parentAgency)} - ${esc(schoolName)}</div>
              <div style="font-size:14pt;font-weight:bold;color:#b91c1c;margin-top:4pt">
                HƯỚNG DẪN CHẤM, ĐÁP ÁN VÀ BIỂU ĐIỂM CHI TIẾT
              </div>
              <div style="font-size:11.5pt;font-style:italic">Môn: Tiếng Anh ${curG} • ${esc(wiz.termTitle || curT)} • Năm học ${esc(examYear)}</div>
            </div>

            <!-- 1. Audio Scripts -->
            ${(wiz.audioScript || (suite ? suite.fullAudioScript : '')) ? `
            <div style="font-size:12.5pt;font-weight:bold;color:#0284c7;margin:12pt 0 6pt 0">
              I. NỘI DUNG BÀI NGHE (AUDIO SCRIPTS - DÙNG CHO CẢ 2 MÃ ĐỀ)
            </div>
            <div style="border:1.5px dashed #0284c7;background:#f8fafc;padding:12px 16px;border-radius:8px;font-size:11.5pt;line-height:1.5;white-space:pre-wrap;margin-bottom:16pt">
${esc(wiz.audioScript || (suite ? suite.fullAudioScript : ''))}
            </div>` : ''}

            <!-- 2. Bảng Đáp Án TNKQ Đối Chiếu 4 Cột 18 Hàng -->
            <div style="font-size:12.5pt;font-weight:bold;color:#1e3a8a;margin-bottom:6pt">
              II. BẢNG ĐÁP ÁN TRẮC NGHIỆM ĐỐI CHIẾU 2 MÃ ĐỀ (${hasSpeaking ? '7.2 điểm' : '8.5 điểm'})
            </div>
            <div style="font-size:10.5pt;font-style:italic;color:#64748b;margin-bottom:6pt">
              * Gồm 36 câu trắc nghiệm khách quan (Mỗi câu đúng = ${hasSpeaking ? '0.2 điểm' : '0.236 điểm'})
            </div>
            <div style="overflow-x:auto;margin-bottom:16pt">
              <table style="width:100%;border-collapse:collapse;font-size:11pt">
                <thead>
                  <tr style="background:#e8eef5;text-align:center;font-weight:bold">
                    <th style="border:1px solid #000;padding:6px;width:12%">Câu</th>
                    <th style="border:1px solid #000;padding:6px;width:38%;color:#1e3a8a">Đáp án MÃ ĐỀ ${esc(wiz.code1 || curG + '01')}</th>
                    <th style="border:1px solid #000;padding:6px;width:12%">Câu</th>
                    <th style="border:1px solid #000;padding:6px;width:38%;color:#b91c1c">Đáp án MÃ ĐỀ ${esc(wiz.code2 || curG + '02')}</th>
                  </tr>
                </thead>
                <tbody>
                  ${(() => {
                    let rHtml = '';
                    for (let i = 0; i < 18; i++) {
                      const c1 = ans1[i];
                      const c2 = ans2[i];
                      const c3 = ans1[i + 18];
                      const c4 = ans2[i + 18];
                      rHtml += `
                      <tr>
                        <td style="border:1px solid #000;text-align:center;font-weight:bold;padding:5px">${c1 ? c1.num : (i + 1)}</td>
                        <td style="border:1px solid #000;text-align:center;font-weight:bold;color:#1e3a8a;padding:5px">${c1 ? c1.ans : ''}</td>
                        <td style="border:1px solid #000;text-align:center;font-weight:bold;padding:5px">${c3 ? c3.num : (i + 19)}</td>
                        <td style="border:1px solid #000;text-align:center;font-weight:bold;color:#b91c1c;padding:5px">${c4 ? c4.ans : ''}</td>
                      </tr>`;
                    }
                    return rHtml;
                  })()}
                </tbody>
              </table>
            </div>

            <!-- 3. Hướng dẫn chấm tự luận Writing -->
            <div style="font-size:12.5pt;font-weight:bold;color:#1e3a8a;margin-bottom:6pt">
              III. HƯỚNG DẪN CHẤM BÀI VIẾT (WRITING - ${hasSpeaking ? '0.8 điểm' : '1.5 điểm'})
            </div>
            ${rubric ? `
            <div style="border:1px solid #cbd5e1;background:#f8fafc;padding:10px 14px;border-radius:6px;font-size:11pt;line-height:1.5;margin-bottom:10pt">
              <b>1. Tiêu chí chấm điểm (Rubric):</b><br/>
              ${esc(rubric).replace(/\n/g, '<br/>')}
            </div>` : ''}

            ${sampleWritingText ? `
            <div style="border:1px solid #cbd5e1;background:#eff6ff;padding:10px 14px;border-radius:6px;font-size:11pt;line-height:1.5;margin-bottom:16pt">
              <b>2. Bài viết mẫu tham khảo (Sample Model Paragraph):</b><br/>
              ${esc(sampleWritingText).replace(/\n/g, '<br/>')}
            </div>` : ''}

            <!-- 4. Kịch bản thi nói Speaking Test (nếu có thi học kỳ) -->
            ${(hasSpeaking && speakingScriptRows && speakingScriptRows.length) ? `
            <div style="font-size:12.5pt;font-weight:bold;color:#7c3aed;margin:14pt 0 6pt 0">
              IV. KỊCH BẢN KHẢO THÍ BÀI THI NÓI (SPEAKING TEST - 2.0 ĐIỂM)
            </div>
            <div style="overflow-x:auto;margin-bottom:16pt">
              <table style="width:100%;border-collapse:collapse;font-size:10.5pt">
                <thead>
                  <tr style="background:#ede9fe;text-align:center;font-weight:bold">
                    <th style="border:1px solid #000;padding:6px;width:15%">Phần thi (Task)</th>
                    <th style="border:1px solid #000;padding:6px;width:40%">Kịch bản Giám khảo (Examiner's Script)</th>
                    <th style="border:1px solid #000;padding:6px;width:30%">Câu trả lời mong đợi của HS</th>
                    <th style="border:1px solid #000;padding:6px;width:15%">Thang điểm & Gợi ý</th>
                  </tr>
                </thead>
                <tbody>
                  ${speakingScriptRows.map(r => `
                    <tr>
                      <td style="border:1px solid #000;padding:6px;font-weight:bold;vertical-align:top">${esc(r[0]).replace(/\n/g, '<br/>')}</td>
                      <td style="border:1px solid #000;padding:6px;vertical-align:top">${esc(r[1]).replace(/\n/g, '<br/>')}</td>
                      <td style="border:1px solid #000;padding:6px;vertical-align:top">${esc(r[2]).replace(/\n/g, '<br/>')}</td>
                      <td style="border:1px solid #000;padding:6px;vertical-align:top">${esc(r[3] || '').replace(/\n/g, '<br/>')}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>` : ''}

            <!-- 5. Tóm tắt biểu điểm tổng -->
            ${finalScoreSummary ? `
            <div style="font-size:12pt;font-weight:bold;color:#15803d;margin-top:10pt">
              ${esc(finalScoreSummary)}
            </div>` : ''}

            <div style="margin-top:24pt;text-align:right;font-size:11pt">
              <b>GIÁO VIÊN RA ĐỀ</b><br/>
              <span style="font-style:italic;font-size:10pt;color:#64748b">(Ký và ghi rõ họ tên)</span><br/><br/><br/>
              <b>${esc(wiz.teacherName || 'Thầy Đinh Văn Thành')}</b>
            </div>
          </div>` : ''}

          <div style="margin-top:20pt;border-top:1pt solid #000;padding-top:8pt;font-size:10.5pt;display:flex;justify-content:space-between;color:#475569">
            <span>Bản quyền: <b>Thầy Đinh Văn Thành – Trường THCS Đồng Yên (0915.213717)</b></span>
            <span>EnglishExam Pro • Chuẩn SGK Global Success</span>
          </div>
        </div>
      </div>
      `}
    </div>`;
  },


  setPreviewMode(mode) {
    this.state.wizard.previewMode = mode;
    this.renderPage();
  },

  togglePreviewScript() {
    this.state.wizard.showScript = !this.state.wizard.showScript;
    this.renderPage();
  },

  togglePreviewAudio() {
    const wiz = this.state.wizard;
    if (this.state.previewAudioPlaying) {
      AudioEngine.stop();
      this.state.previewAudioPlaying = false;
      this.renderPage();
    } else {
      if (wiz.audioUrl) {
        AudioEngine.playAudioUrl(wiz.audioUrl, () => {
          this.state.previewAudioPlaying = false;
          this.renderPage();
        });
      } else {
        const textToRead = wiz.audioScript || 'Hello students, this is the English listening test.';
        AudioEngine.playScript(textToRead, 0.88, () => {
          this.state.previewAudioPlaying = false;
          this.renderPage();
        });
      }
      this.state.previewAudioPlaying = true;
      this.renderPage();
    }
  },

  // ── Xuất Word (.doc) chuẩn 100% Mẫu Thầy Đinh Văn Thành (THCS Đồng Yên) ──────────
  generateDocHtml(sections, title, examCode = '', showAnswer = false) {
    const wiz = this.state.wizard;
    const parentAgency = (localStorage.getItem('cfg_parent_agency') || 'UBND XÃ ĐỒNG YÊN').toUpperCase();
    const school = (wiz.schoolName || localStorage.getItem('cfg_school_name') || 'TRƯỜNG THCS ĐỒNG YÊN').toUpperCase();
    const schoolYear = localStorage.getItem('cfg_school_year') || '2026 - 2027';
    const curGrade = wiz.grade || '6';
    const examClass = wiz.examClass || (curGrade + 'A___');
    const examTime = wiz.examTime || 60;
    const teacher = wiz.teacherName || 'Thầy Đinh Văn Thành';
    const code = examCode || (curGrade + '01');

    return `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>${esc(title)}</title>
  <style>
    @page Section1 { size: 21.0cm 29.7cm; margin: 1.5cm 1.5cm 1.5cm 2.0cm; mso-page-orientation: portrait; }
    div.Section1 { page: Section1; }
    body { font-family: 'Times New Roman', Times, serif; font-size: 13pt; line-height: 1.15; color: #000; }
    table { width: 100%; border-collapse: collapse; font-family: 'Times New Roman', Times, serif; }
    p { margin: 2pt 0; padding: 0; line-height: 1.15; }
  </style>
</head>
<body>
<div class="Section1">
  <!-- 1. HEADER TABLE 2x2 CHUẨN THCS ĐỒNG YÊN -->
  <table style="width:100%;border:none;margin-bottom:4pt">
    <tr>
      <td style="width:38%;text-align:center;vertical-align:top;border:none;line-height:1.2">
        <div style="font-size:11.5pt;font-weight:bold">${esc(parentAgency)}</div>
        <div style="font-size:11.5pt;font-weight:bold;text-decoration:underline">${esc(school)}</div>
      </td>
      <td style="width:62%;text-align:center;vertical-align:top;border:none;line-height:1.25">
        <div style="font-size:12.5pt;font-weight:bold">${esc((title || 'BÀI KIỂM TRA ĐÁNH GIÁ GIỮA HỌC KÌ I').toUpperCase())}</div>
        <div style="font-size:11.5pt;font-weight:bold">NĂM HỌC: ${esc(schoolYear)}</div>
        <div style="font-size:12.5pt;font-weight:bold">Môn: Tiếng Anh ${curGrade}</div>
        <div style="font-size:11.5pt;font-style:italic">Thời gian làm bài: ${examTime} phút (không kể thời gian giao đề)</div>
      </td>
    </tr>
  </table>

  <!-- 2. DÒNG FULL NAME, CLASS, MÃ ĐỀ (CỠ CHỮ 13) -->
  <table style="width:100%;border:none;margin:4pt 0 6pt 0;font-size:13pt">
    <tr>
      <td style="width:55%;border:none"><b>Full name:</b> __________________________,</td>
      <td style="width:25%;border:none"><b>Class:</b> ${esc(examClass)}</td>
      <td style="width:20%;text-align:right;border:none"><b style="color:#b91c1c;font-size:13pt">Mã đề: ${esc(code)}</b></td>
    </tr>
  </table>

  <!-- 3. BẢNG MARKS AUTO FIT TO WINDOW 100% (CHUẨN 2 DÒNG LỜI PHÊ GỌN GÀNG) -->
  <table style="width:100%;border-collapse:collapse;margin-bottom:10pt;font-size:11.5pt">
    <tr style="text-align:center;font-weight:bold">
      <td colspan="2" style="border:1pt solid #000;width:22%;padding:4pt">Marks</td>
      <td rowspan="3" style="border:1pt solid #000;width:14%;padding:4pt;vertical-align:middle">Total</td>
      <td rowspan="3" style="border:1pt solid #000;width:64%;padding:4pt 8pt;text-align:left;vertical-align:top">
        <div style="text-align:center;font-weight:bold;margin-bottom:3pt">Teacher’s remarks</div>
        <div style="color:#000;font-size:11pt">________________________________________________</div>
        <div style="color:#000;font-size:11pt;margin-top:3pt">________________________________________________</div>
      </td>
    </tr>
    <tr style="text-align:center;font-weight:bold">
      <td style="border:1pt solid #000;width:11%;padding:3pt">Speak</td>
      <td style="border:1pt solid #000;width:11%;padding:3pt">Write</td>
    </tr>
    <tr style="height:36pt;text-align:center">
      <td style="border:1pt solid #000">&nbsp;</td>
      <td style="border:1pt solid #000">&nbsp;</td>
    </tr>
  </table>

  <!-- 4. NỘI DUNG CÁC PHẦN THI (CỠ CHỮ 13 TIMES NEW ROMAN) -->
  ${(() => {
    let globalQNum = 1;
    return sections.map((sec, si) => {
      const secHeading = (sec.title || sec.name || `Part ${si + 1}`);

      if (sec.type === 'speaking' || sec.scriptRows) {
        return `
        <div style="font-size:13pt;font-weight:bold;margin-top:12pt;margin-bottom:4pt">
          ${esc(secHeading)}
        </div>
        <table style="width:100%;border-collapse:collapse;margin-top:6pt;font-size:11.5pt">
          <thead>
            <tr style="background:#f1f5f9;text-align:center;font-weight:bold">
              <th style="border:1pt solid #000;padding:4pt;width:15%">Phần thi (Task)</th>
              <th style="border:1pt solid #000;padding:4pt;width:40%">Kịch bản Giám khảo (Examiner's Script)</th>
              <th style="border:1pt solid #000;padding:4pt;width:30%">Câu trả lời mong đợi của HS</th>
              <th style="border:1pt solid #000;padding:4pt;width:15%">Thang điểm</th>
            </tr>
          </thead>
          <tbody>
            ${(sec.scriptRows || []).map(r => `
              <tr>
                <td style="border:1pt solid #000;padding:4pt;font-weight:bold;vertical-align:top">${esc(r[0]).replace(/\n/g, '<br/>')}</td>
                <td style="border:1pt solid #000;padding:4pt;vertical-align:top">${esc(r[1]).replace(/\n/g, '<br/>')}</td>
                <td style="border:1pt solid #000;padding:4pt;vertical-align:top">${esc(r[2]).replace(/\n/g, '<br/>')}</td>
                <td style="border:1pt solid #000;padding:4pt;vertical-align:top;font-size:10pt">${esc(r[3] || '').replace(/\n/g, '<br/>')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>`;
      }

      return `
      <div style="font-size:13pt;font-weight:bold;margin-top:10pt;margin-bottom:4pt">
        ${esc(secHeading)}
      </div>
      ${sec.passage ? `
      <div style="font-size:12.5pt;font-style:italic;background:#f8fafc;border:1pt dashed #64748b;padding:8pt 12pt;margin-bottom:8pt;line-height:1.35">
        ${formatExamText(sec.passage)}
      </div>` : ''}

      ${sec.questions.map((q, qi) => {
        const qNum = q.num || globalQNum++;
        const isEssay = q.type === 'essay';

        if (isEssay) {
          return `
          <div style="font-size:13pt;margin-bottom:10pt;line-height:1.25">
            <div><b>${qNum}.</b> ${formatExamText(q.content).replace(/\n/g, '<br/>')}</div>
            <div style="margin-top:8pt;color:#000;font-size:12pt;line-height:2.0;letter-spacing:1px">
              ...................................................................................................................................................................<br/>
              ...................................................................................................................................................................<br/>
              ...................................................................................................................................................................<br/>
              ...................................................................................................................................................................<br/>
              ...................................................................................................................................................................<br/>
              ...................................................................................................................................................................<br/>
              ...................................................................................................................................................................<br/>
              ...................................................................................................................................................................<br/>
              ...................................................................................................................................................................<br/>
              ...................................................................................................................................................................
            </div>
            ${showAnswer && q.sampleText ? `
            <div style="margin-top:6pt;padding:6pt 10pt;background:#eff6ff;font-size:11.5pt;color:#1e40af;line-height:1.3">
              📝 <b>Bài viết mẫu tham khảo:</b><br/>${esc(q.sampleText)}
            </div>` : ''}
          </div>`;
        }
        let qOpts = q.options;
        if (!qOpts || !Array.isArray(qOpts) || qOpts.length === 0) {
          if (q.type === 'tf') {
            qOpts = ['A. True', 'B. False'];
          }
        }
        const maxLen = qOpts ? Math.max(...qOpts.map(o => o.length)) : 0;

        return `
        <div style="font-size:13pt;margin-bottom:6pt;line-height:1.25">
          <div><b>${qNum}.</b> ${formatExamText(q.content)}</div>
          ${qOpts ? (maxLen > 30 || qOpts.length > 3 ? `
          <div style="padding-left:14pt;margin-top:2pt">
            ${qOpts.map(opt => `
              <div style="margin:2pt 0;font-size:13pt;${showAnswer && opt.charAt(0) === q.answer ? 'font-weight:bold;color:#b91c1c' : ''}">
                <b>${esc(opt.charAt(0))}.</b> ${formatExamText(opt.slice(3) || opt)} ${showAnswer && opt.charAt(0) === q.answer ? ' ✓' : ''}
              </div>
            `).join('')}
          </div>` : `
          <table style="width:100%;border:none;margin-top:2pt">
            <tr>
              ${qOpts.map(opt => `
                <td style="border:none;font-size:13pt;padding:1pt 4pt;${showAnswer && opt.charAt(0) === q.answer ? 'font-weight:bold;color:#b91c1c' : ''}">
                  <b>${esc(opt.charAt(0))}.</b> ${formatExamText(opt.slice(3) || opt)} ${showAnswer && opt.charAt(0) === q.answer ? ' ✓' : ''}
                </td>
              `).join('')}
            </tr>
          </table>`) : ''}
          ${showAnswer && q.solution ? `
          <div style="margin-top:2pt;padding:3pt 8pt;background:#eff6ff;font-size:11pt;color:#1e40af">
            💡 <b>Giải thích:</b> ${esc(q.solution)}
          </div>` : ''}
        </div>`;
      }).join('')}
      `;
    }).join('');
  })()}

  <div style="text-align:center;font-weight:bold;font-size:13pt;margin-top:16pt">
    ------The end------
  </div>

  ${wiz.audioScript ? `
  <br clear="all" style="page-break-before:always;mso-break-type:page-break"/>
  <div style="text-align:center;margin-bottom:12pt">
    <div style="font-size:12pt;font-weight:bold">${esc(parentAgency)} - ${esc(school)}</div>
    <div style="font-size:13.5pt;font-weight:bold;color:#1e3a8a;margin-top:4pt">NỘI DUNG BÀI NGHE (AUDIO SCRIPTS - DÙNG CHO CẢ 2 MÃ ĐỀ)</div>
  </div>
  <div style="border:1pt dashed #0066cc;background:#fafafa;padding:10pt 14pt;font-size:12pt;line-height:1.4">
    ${esc(wiz.audioScript).replace(/\n/g, '<br/>')}
  </div>
  ` : ''}

  ${showAnswer ? `
  <br clear="all" style="page-break-before:always;mso-break-type:page-break"/>
  <div style="text-align:center;margin-bottom:12pt">
    <div style="font-size:12pt;font-weight:bold">${esc(parentAgency)} - ${esc(school)}</div>
    <div style="font-size:13.5pt;font-weight:bold;color:#b91c1c;margin-top:4pt">HƯỚNG DẪN ĐÁP ÁN VÀ BIỂU ĐIỂM</div>
    <div style="font-size:12pt;font-style:italic">Môn: Tiếng Anh ${curGrade} • Mã đề: ${esc(code)}</div>
  </div>

  <table style="width:100%;border-collapse:collapse;font-size:11.5pt">
    <thead>
      <tr style="background:#e8eef5;text-align:center;font-weight:bold">
        <th style="border:1pt solid #000;padding:4pt;width:12%">Câu</th>
        <th style="border:1pt solid #000;padding:4pt;width:18%">Đáp án</th>
        <th style="border:1pt solid #000;padding:4pt;width:15%">Điểm</th>
        <th style="border:1pt solid #000;padding:4pt;width:55%">Giải thích / Ghi chú</th>
      </tr>
    </thead>
    <tbody>
      ${(() => {
        let qNum = 1;
        let rowsHtml = '';
        const totalQ = sections.reduce((acc, s) => acc + s.questions.length, 0) || 40;
        const ptPerQ = (10 / totalQ).toFixed(2);
        sections.forEach(sec => {
          rowsHtml += `
            <tr style="background:#f1f5f9;font-weight:bold">
              <td colspan="4" style="border:1pt solid #000;padding:3pt 6pt">${esc(sec.name)}</td>
            </tr>
          `;
          sec.questions.forEach(q => {
            rowsHtml += `
              <tr>
                <td style="border:1pt solid #000;text-align:center;font-weight:bold;padding:3pt">${qNum++}</td>
                <td style="border:1pt solid #000;text-align:center;font-weight:bold;color:#b91c1c;padding:3pt">${esc(q.answer || '')}</td>
                <td style="border:1pt solid #000;text-align:center;padding:3pt">${ptPerQ} đ</td>
                <td style="border:1pt solid #000;padding:3pt 6pt">${esc(q.solution || '')}</td>
              </tr>
            `;
          });
        });
        return rowsHtml;
      })()}
    </tbody>
  </table>

  <div style="margin-top:20pt;text-align:right;padding-right:20pt;font-size:11.5pt">
    <b>GIÁO VIÊN RA ĐỀ</b><br/><br/><br/>
    <b>${esc(teacher)}</b>
  </div>
  ` : ''}
</div>
</body>
</html>`;
  },

  exportWord(sections = null, title = null, examCode = '', showAnswer = false) {
    const wiz = this.state.wizard;
    const s = sections || wiz.selectedSections;
    const t = title || wiz.examTitle;
    const html = this.generateDocHtml(s, t, examCode, showAnswer || wiz.previewMode === 'teacher');
    const blob = new Blob(['\ufeff' + html], { type: 'application/msword;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${t.replace(/\s+/g, '_')}${examCode ? '_Code_' + examCode : ''}.doc`;
    link.click();
    UI.toast('📥 Đã xuất file Word (.doc) có Audio Script!', 'success');
  },

  printExam() {
    window.print();
  },

  showShareLinkModal() {
    const wiz = this.state.wizard;
    const url = `${window.location.origin}${window.location.pathname}?mode=student&examId=${wiz.id}`;

    const bodyHtml = `
      <div class="stack gap-16">
        <div style="font-size:13.5px;color:var(--ink-soft)">
          Học sinh có thể truy cập link bên dưới từ điện thoại để làm bài thi trực tuyến:
        </div>
        <div class="input-group">
          <input type="text" id="share-link-input" value="${url}" readonly style="font-weight:600;font-size:13px" />
          <button class="btn btn-primary" onclick="App.copyShareLink()">📋 Copy link</button>
        </div>
        <div class="row gap-8">
          <button class="btn btn-outline btn-sm" onclick="window.open('${url}','_blank')">
            🚀 Mở thử giao diện học sinh trên điện thoại
          </button>
        </div>
      </div>
    `;

    UI.showModal('🔗 Link làm bài thi Online cho Học sinh', bodyHtml, [
      { label: 'Đóng', cls: 'btn-outline', action: () => UI.closeModal() }
    ]);
  },

  copyShareLink() {
    const input = document.getElementById('share-link-input');
    if (input) {
      input.select();
      navigator.clipboard.writeText(input.value);
      UI.toast('✅ Đã sao chép link làm bài!', 'success');
    }
  },

  showShuffleModal() {
    const codes = ['101', '102', '103', '104'];
    const originalSecs = this.state.wizard.selectedSections;

    const shuffledExams = codes.map(code => {
      const newSecs = originalSecs.map(sec => {
        const shuffledQs = shuffle(sec.questions);
        return { ...sec, questions: shuffledQs };
      });
      return { code, sections: newSecs };
    });

    this._lastShuffled = shuffledExams;
    UI.showModal('🔀 Đã trộn 4 mã đề (101, 102, 103, 104)', `
      <div class="grid grid-2 gap-12">
        ${shuffledExams.map((it, idx) => `
          <div class="card p-12">
            <b>Mã đề: ${it.code}</b>
            <button class="btn btn-outline btn-sm mt-8 w-full" onclick="App.exportWord(App._lastShuffled[${idx}].sections, App.state.wizard.examTitle, '${it.code}', false)">
              Tải mã ${it.code} (.doc)
            </button>
          </div>
        `).join('')}
      </div>
    `, [{ label: 'Đóng', cls: 'btn-outline', action: () => UI.closeModal() }]);
  },

  showCV7991Modals() {
    alert('Ma trận & Bảng đặc tả chuẩn Công văn 7991/BGDĐT-GDTrH đã được tích hợp đầy đủ.');
  },

  // ── Student Exam Portal (Làm bài trực tuyến trên điện thoại) ─────
  renderStudentPortal(examId) {
    const exam = Auth.getPublishedExam(examId);
    const root = document.getElementById('root');
    if (!exam || !exam.isOpen) {
      root.innerHTML = `
        <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f8fafc;padding:20px">
          <div class="card text-center" style="max-width:440px;padding:36px">
            <div style="font-size:54px;margin-bottom:12px">🔒</div>
            <h2>Đề thi không mở hoặc đã kết thúc</h2>
            <p style="color:var(--ink-soft);margin-top:8px">Vui lòng liên hệ Thầy Đinh Văn Thành để được hỗ trợ.</p>
          </div>
        </div>`;
      return;
    }

    this.state.studentExam = exam;

    // Chuẩn hóa ID duy nhất cho tất cả các câu hỏi trong đề thi
    let qCounter = 0;
    (exam.sections || []).forEach((sec, sIdx) => {
      (sec.questions || []).forEach((q, qIdx) => {
        qCounter++;
        if (!q.id) {
          q.id = `q_${exam.id || 'exam'}_s${sIdx + 1}_${qCounter}`;
        }
      });
    });

    if (!this.state.studentStarted) {
      const defaultName = this.state.user?.name || '';
      const defaultClass = this.state.user?.class || exam.examClass || '7A1';

      root.innerHTML = `
        <div class="student-portal">
          <div class="student-topbar">
            <div class="brand" style="font-weight:800;font-size:16px;color:#2563eb">🇬🇧 EnglishExam Online</div>
            <div style="font-size:13px;color:#64748b">${esc(exam.schoolName || 'THCS Đồng Yên')}</div>
          </div>
          <div style="flex:1;display:flex;align-items:center;justify-content:center;padding:20px">
            <div class="card fade-in" style="max-width:480px;width:100%;padding:28px;box-shadow:var(--shadow-lg)">
              <div style="text-align:center;margin-bottom:20px">
                <span class="tag tag-nb mb-8">Lớp ${exam.grade} Global Success</span>
                <h2 style="font-size:18px;font-weight:800;color:#0f172a;margin-top:4px">${esc(exam.title)}</h2>
                <div style="font-size:13px;color:#64748b;margin-top:4px">
                  GV: <b>${esc(exam.teacherName || 'Thầy Đinh Văn Thành')}</b> · Thời gian: <b>${exam.examTime} phút</b>
                </div>
              </div>

              <div class="stack gap-12">
                <div class="field">
                  <label class="label">Họ và tên học sinh <span style="color:#ef4444">*</span></label>
                  <input id="st-name" type="text" value="${esc(defaultName)}" placeholder="Nhập họ và tên..." autofocus />
                </div>
                <div class="grid grid-2 gap-12">
                  <div class="field">
                    <label class="label">Lớp <span style="color:#ef4444">*</span></label>
                    <input id="st-class" type="text" value="${esc(defaultClass)}" />
                  </div>
                  <div class="field">
                    <label class="label">SBD / Mã HS</label>
                    <input id="st-id" type="text" placeholder="SBD01" />
                  </div>
                </div>

                <div style="background:#eff6ff;padding:12px;border-radius:10px;font-size:12px;color:#1e40af">
                  🎧 <b>Lưu ý:</b> Đề thi có phần nghe Audio (được nghe 02 lần). Đồng hồ tính giờ đếm ngược sẽ bắt đầu chạy ngay khi bấm nút.
                </div>

                <button class="btn btn-primary btn-lg mt-6" onclick="App.startStudentExam()" style="width:100%">
                  🚀 Bắt đầu làm bài thi Tiếng Anh
                </button>
              </div>
            </div>
          </div>
        </div>`;
      return;
    }

    this.renderStudentExamView();
  },

  startStudentExam() {
    const name = document.getElementById('st-name')?.value?.trim();
    const cls = document.getElementById('st-class')?.value?.trim();
    const id = document.getElementById('st-id')?.value?.trim() || 'SBD01';
    if (!name || !cls) {
      alert('Vui lòng nhập Họ tên và Lớp của bạn!');
      return;
    }
    this.state.studentInfo = { name, class: cls, id };
    this.state.studentStarted = true;
    this.state.studentAnswers = {};
    this.state.studentAudioPlays = 0;
    this.state.studentTimeRemaining = (this.state.studentExam.examTime || 45) * 60;
    this.startStudentTimer();
    this.renderStudentExamView();
  },

  startStudentTimer() {
    if (this.state.studentTimerInterval) clearInterval(this.state.studentTimerInterval);
    this.state.studentTimerInterval = setInterval(() => {
      this.state.studentTimeRemaining--;
      const el = document.getElementById('student-timer-display');
      if (el) {
        const m = Math.floor(this.state.studentTimeRemaining / 60);
        const s = this.state.studentTimeRemaining % 60;
        el.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      }
      if (this.state.studentTimeRemaining <= 0) {
        clearInterval(this.state.studentTimerInterval);
        alert('⏰ Đã hết thời gian làm bài! Hệ thống tự động nộp bài thi.');
        this.submitStudentExam();
      }
    }, 1000);
  },

  renderStudentExamView() {
    const exam = this.state.studentExam;
    const st = this.state.studentInfo;
    const allQ = exam.sections.flatMap(s => s.questions);
    const m = Math.floor(this.state.studentTimeRemaining / 60);
    const s = this.state.studentTimeRemaining % 60;
    const timeStr = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    const hasAudio = exam.audioScript || exam.audioUrl || exam.sections.some(s => s.skill === 'listening');

    let qGlobalIndex = 0;
    const root = document.getElementById('root');

    root.innerHTML = `
      <div class="student-portal">
        <header class="student-topbar">
          <div>
            <div style="font-weight:800;font-size:15px;color:#1e293b">${esc(exam.title)}</div>
            <div style="font-size:12px;color:#64748b">
              Thí sinh: <b>${esc(st.name)}</b> – Lớp: <b>${esc(st.class)}</b> | GV: ${esc(exam.teacherName || 'Thầy Đinh Văn Thành')}
            </div>
          </div>
          <div class="student-timer-box">
            <span>⏱️</span>
            <span id="student-timer-display">${timeStr}</span>
          </div>
        </header>

        <div class="student-container">
          <div>
            ${hasAudio ? `
            <div class="student-card" style="border:1.5px solid #0284c7;background:#f0f9ff">
              <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px">
                <div style="display:flex;align-items:center;gap:10px">
                  <div style="font-size:28px">🎧</div>
                  <div>
                    <div style="font-weight:800;font-size:14px;color:#0369a1">${esc(exam.audioTitle || 'Phần thi Nghe')}</div>
                    <div style="font-size:12px;color:#0284c7">Lượt nghe: <b>${this.state.studentAudioPlays} / 2 lượt</b></div>
                  </div>
                </div>
                <button class="btn btn-primary" id="btn-st-audio" onclick="App.playStudentAudio()"
                  ${this.state.studentAudioPlays >= 2 && !this.state.studentAudioPlaying ? 'disabled style="opacity:0.6"' : ''}>
                  ${this.state.studentAudioPlaying ? '⏸ Tạm dừng' : (this.state.studentAudioPlays >= 2 ? '🔒 Hết lượt nghe' : '▶ Bắt đầu Nghe Audio')}
                </button>
              </div>
            </div>` : ''}

            ${exam.sections.map(sec => `
              <div style="font-size:15px;font-weight:800;color:#1e293b;margin:20px 0 10px;padding-bottom:6px;border-bottom:2px solid #e2e8f0">
                ${esc(sec.name)}
              </div>
              ${sec.questions.map(q => {
                qGlobalIndex++;
                const isCompoundTF = (q.type === 'tf' || q.type === 'compound_tf') && Array.isArray(q.items) && q.items.length > 0;
                const isEssay = q.type === 'essay';
                const isMC = !isCompoundTF && !isEssay;
                const qi = qGlobalIndex;
                const qId = q.id || `q_${qi}`;

                // Chuẩn hóa danh sách lựa chọn: nếu là câu hỏi trắc nghiệm hoặc TF đơn lẻ mà thiếu options thì tự động bổ sung A. True / B. False
                let qOptions = q.options;
                if (!qOptions || !Array.isArray(qOptions) || qOptions.length === 0) {
                  if (q.type === 'tf' || (!isEssay && !isCompoundTF)) {
                    qOptions = ['A. True', 'B. False'];
                  } else {
                    qOptions = [];
                  }
                }

                return `
                <div class="student-card" id="st-q-${qId}">
                  <div style="font-size:14.5px;font-weight:700;color:#0f172a;line-height:1.6">
                    Câu ${qi}: ${formatExamText(q.content)}
                  </div>
                  ${isMC ? `
                  <div class="student-opt-list">
                    ${qOptions.map((opt, optIdx) => {
                      const match = String(opt).match(/^([A-Da-d])[\.\:\)]\s*(.*)$/);
                      const letter = match ? match[1].toUpperCase() : (String(opt).toUpperCase().startsWith('TRUE') || String(opt).toUpperCase().startsWith('ĐÚNG') ? 'A' : (String(opt).toUpperCase().startsWith('FALSE') || String(opt).toUpperCase().startsWith('SAI') ? 'B' : String.fromCharCode(65 + optIdx)));
                      const text = match ? match[2] : opt;
                      const isSel = this.state.studentAnswers[qId] === letter;
                      return `
                      <div class="student-opt-btn ${isSel ? 'selected' : ''}" onclick="App.selectStudentMCOption('${qId}','${letter}')">
                        <div class="student-opt-indicator">${letter}</div>
                        <div>${formatExamText(text)}</div>
                      </div>`;
                    }).join('')}
                  </div>` : ''}

                  ${isCompoundTF ? `
                  <div style="margin-top:10px;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden">
                    ${(q.items || []).map(it => {
                      const curVal = this.state.studentAnswers[qId + '_' + it.label];
                      return `
                      <div class="student-tf-row" data-tf-label="${it.label}">
                        <div style="font-size:13.5px;flex:1"><b>${it.label})</b> ${formatExamText(it.text)}</div>
                        <div class="student-tf-pills">
                          <button class="student-tf-pill btn-tf-true ${curVal === true ? 'active-true' : ''}" onclick="App.selectStudentTF('${qId}','${it.label}',true)">Đúng</button>
                          <button class="student-tf-pill btn-tf-false ${curVal === false ? 'active-false' : ''}" onclick="App.selectStudentTF('${qId}','${it.label}',false)">Sai</button>
                        </div>
                      </div>`;
                    }).join('')}
                  </div>` : ''}

                  ${isEssay ? `
                  <div style="margin-top:10px">
                    <textarea rows="3" placeholder="Nhập câu trả lời..." oninput="App.inputStudentEssay('${qId}',this.value)"
                      style="width:100%;padding:10px;border:1.5px solid #cbd5e1;border-radius:10px;font-family:inherit">${esc(this.state.studentAnswers[qId] || '')}</textarea>
                  </div>` : ''}
                </div>`;
              }).join('')}
            `).join('')}
          </div>

          <div>
            <div class="palette-card">
              <div style="font-weight:800;font-size:14px;margin-bottom:8px">Danh sách câu hỏi</div>
              <div class="palette-grid">
                ${allQ.map((q, idx) => {
                  const qId = q.id || `q_${idx + 1}`;
                  return `
                <button class="palette-btn ${this.isQuestionAnswered(q, qId) ? 'done' : ''}" id="pal-btn-${qId}" onclick="document.getElementById('st-q-${qId}')?.scrollIntoView({behavior:'smooth'})">
                  ${idx + 1}
                </button>`;
                }).join('')}
              </div>
              <button class="btn btn-primary" onclick="App.confirmSubmitExam()" style="width:100%;padding:12px;font-weight:800">
                📝 NỘP BÀI THI
              </button>
            </div>
          </div>
        </div>
      </div>`;
  },

  playStudentAudio() {
    const exam = this.state.studentExam;
    if (this.state.studentAudioPlaying) {
      AudioEngine.stop();
      this.state.studentAudioPlaying = false;
      this.renderStudentExamView();
      return;
    }
    if (this.state.studentAudioPlays >= 2) {
      alert('Em đã sử dụng hết 02 lượt nghe bài thi!');
      return;
    }
    this.state.studentAudioPlays++;
    this.state.studentAudioPlaying = true;

    if (exam.audioUrl) {
      AudioEngine.playAudioUrl(exam.audioUrl, () => {
        this.state.studentAudioPlaying = false;
        this.renderStudentExamView();
      });
    } else {
      AudioEngine.playScript(exam.audioScript || 'Listening exam track', 0.88, () => {
        this.state.studentAudioPlaying = false;
        this.renderStudentExamView();
      });
    }
    this.renderStudentExamView();
  },

  selectStudentMCOption(qId, letter) {
    if (!qId || qId === 'undefined') return;
    this.state.studentAnswers[qId] = letter;

    // Cập nhật giao diện trực tiếp tại đúng thẻ câu hỏi được chọn
    const card = document.getElementById(`st-q-${qId}`);
    if (card) {
      card.querySelectorAll('.student-opt-btn').forEach(btn => {
        const ind = btn.querySelector('.student-opt-indicator')?.textContent?.trim();
        if (ind === letter) {
          btn.classList.add('selected');
        } else {
          btn.classList.remove('selected');
        }
      });
    }

    // Cập nhật trạng thái câu đã làm trên thanh danh sách câu hỏi
    const palBtn = document.getElementById(`pal-btn-${qId}`);
    if (palBtn) {
      palBtn.classList.add('done');
    }
  },

  selectStudentTF(qId, label, val) {
    if (!qId || qId === 'undefined') return;
    this.state.studentAnswers[qId + '_' + label] = val;
    const card = document.getElementById(`st-q-${qId}`);
    if (card) {
      const row = card.querySelector(`[data-tf-label="${label}"]`);
      if (row) {
        const btnTrue = row.querySelector('.btn-tf-true');
        const btnFalse = row.querySelector('.btn-tf-false');
        if (btnTrue && btnFalse) {
          if (val === true) {
            btnTrue.classList.add('active-true');
            btnFalse.classList.remove('active-false');
          } else {
            btnFalse.classList.add('active-false');
            btnTrue.classList.remove('active-true');
          }
        }
      }
    }

    const palBtn = document.getElementById(`pal-btn-${qId}`);
    if (palBtn) {
      const allQ = this.state.studentExam?.sections?.flatMap(s => s.questions) || [];
      const q = allQ.find(x => (x.id || '') === qId);
      if (q && this.isQuestionAnswered(q, qId)) {
        palBtn.classList.add('done');
      }
    }
  },

  inputStudentEssay(qId, val) {
    if (!qId || qId === 'undefined') return;
    this.state.studentAnswers[qId] = val;
    const palBtn = document.getElementById(`pal-btn-${qId}`);
    if (palBtn) {
      if (val && val.trim().length > 0) {
        palBtn.classList.add('done');
      } else {
        palBtn.classList.remove('done');
      }
    }
  },

  isQuestionAnswered(q, qId) {
    const key = qId || q?.id;
    if (!key) return false;
    if ((q.type === 'tf' || q.type === 'compound_tf') && Array.isArray(q.items) && q.items.length > 0) {
      return q.items.every(it => this.state.studentAnswers[key + '_' + it.label] !== undefined);
    }
    return !!this.state.studentAnswers[key];
  },

  confirmSubmitExam() {
    if (confirm('Em có chắc chắn muốn nộp bài thi không?')) {
      this.submitStudentExam();
    }
  },

  submitStudentExam() {
    AudioEngine.stop();
    if (this.state.studentTimerInterval) clearInterval(this.state.studentTimerInterval);

    const exam = this.state.studentExam;
    const st = this.state.studentInfo;
    const answers = this.state.studentAnswers;
    const allQ = exam.sections.flatMap(s => s.questions);

    let totalScore = 0;
    let correctCount = 0;
    const perQ = 10 / (allQ.length || 1);

    let qCounter = 0;
    allQ.forEach(q => {
      qCounter++;
      const qId = q.id || `q_${qCounter}`;
      if ((q.type === 'tf' || q.type === 'compound_tf') && Array.isArray(q.items) && q.items.length > 0) {
        const itemResults = (q.items || []).map(it => answers[qId + '_' + it.label] === it.isTrue);
        const corrects = itemResults.filter(Boolean).length;
        if (corrects === (q.items || []).length) {
          totalScore += perQ;
          correctCount++;
        } else {
          totalScore += perQ * (corrects / (q.items?.length || 1));
        }
      } else if (q.type === 'essay') {
        if ((answers[qId] || '').trim().length > 10) totalScore += perQ;
      } else {
        const expected = String(q.correctAnswer || q.answer || '').trim();
        const studentAns = String(answers[qId] || '').trim();
        const isMatch = studentAns === expected ||
          (expected === 'A' && (studentAns === 'True' || studentAns === 'T')) ||
          (expected === 'B' && (studentAns === 'False' || studentAns === 'F')) ||
          (studentAns === 'A' && (expected === 'True' || expected === 'T')) ||
          (studentAns === 'B' && (expected === 'False' || expected === 'F'));
        if (isMatch) {
          totalScore += perQ;
          correctCount++;
        }
      }
    });

    const finalScore = Math.min(10, Math.round(totalScore * 10) / 10);

    // Lưu kết quả gửi về cho Giáo viên quản lý
    Auth.saveSubmission({
      examId: exam.id,
      examTitle: exam.title,
      studentName: st.name,
      studentClass: st.class,
      studentId: st.id,
      score: finalScore,
      correctCount,
      totalQuestions: allQ.length,
      answers,
      submittedAt: new Date().toISOString(),
    });

    // Cộng điểm cho học sinh
    if (this.state.user && this.state.user.role === 'student') {
      this.state.user.points = (this.state.user.points || 100) + Math.round(finalScore * 10);
    }

    const root = document.getElementById('root');
    root.innerHTML = `
      <div class="student-portal">
        <header class="student-topbar">
          <div style="font-weight:800;font-size:16px;color:#2563eb">🇬🇧 Kết quả bài kiểm tra Tiếng Anh</div>
          <div style="font-size:13px;color:#64748b">${esc(exam.schoolName || 'THCS Đồng Yên')}</div>
        </header>

        <div style="max-width:600px;margin:32px auto;padding:0 16px">
          <div class="card text-center" style="padding:36px;box-shadow:var(--shadow-lg);border-top:6px solid #10b981">
            <div style="font-size:52px;margin-bottom:8px">🎉</div>
            <h2 style="font-size:22px;font-weight:900;color:#0f172a">Chúc mừng em đã hoàn thành bài thi!</h2>
            <div style="font-size:14px;color:#64748b;margin-top:4px">
              Thí sinh: <b>${esc(st.name)}</b> – Lớp: <b>${esc(st.class)}</b>
            </div>

            <div style="margin:24px 0">
              <div style="font-size:58px;font-weight:900;color:#10b981">${finalScore} <span style="font-size:24px;color:#64748b">/ 10</span></div>
              <div style="font-size:15px;font-weight:700;margin-top:6px">Số câu làm đúng: ${correctCount} / ${allQ.length} câu</div>
            </div>

            <div style="display:flex;justify-content:center;gap:12px">
              <button class="btn btn-primary" onclick="window.location.href=window.location.pathname">
                🏠 Về trang học tập
              </button>
              <button class="btn btn-outline" onclick="window.print()">
                🖨️ In bảng điểm
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // ── History & Submissions View ──────────────────────────────────
  renderHistory() {
    const exams = Auth.getExamRecords().filter(e => e.userId === this.state.user.id);
    return `
    <div class="page-body slide-up">
      <div class="section-header">
        <div class="section-title">🕐 Danh sách đề thi Tiếng Anh đã tạo</div>
        <button class="btn btn-primary" onclick="App.navigate('generate')">+ Tạo đề mới</button>
      </div>
      <div class="table-wrap card">
        <table>
          <thead><tr><th>Tên đề</th><th>Khối</th><th>Số câu</th><th>Ngày tạo</th><th>Hành động</th></tr></thead>
          <tbody>
            ${exams.map(e => `
            <tr>
              <td><strong>${esc(e.title)}</strong></td>
              <td>${gradeTag(e.grade)}</td>
              <td><b>${e.questionCount} câu</b></td>
              <td>${new Date(e.createdAt).toLocaleDateString('vi-VN')}</td>
              <td><button class="btn btn-outline btn-sm" onclick="App.viewExam('${e.id}')">Xem lại</button></td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
  },

  viewExam(examId) {
    const pub = Auth.getPublishedExam(examId);
    if (pub && pub.sections) {
      this.state.wizard = { ...this.state.wizard, ...pub, selectedSections: pub.sections, step: 3 };
    }
    this.navigate('preview');
  },

  renderSubmissions() {
    const subs = Auth.getSubmissions();
    return `
    <div class="page-body slide-up">
      <div class="section-header">
        <div>
          <div class="section-title">📥 Thu bài thi & Quản lý điểm số học sinh</div>
          <div style="font-size:13px;color:var(--ink-soft);margin-top:4px">Dữ liệu nộp bài trực tiếp từ điện thoại của học sinh</div>
        </div>
        <button class="btn btn-primary" onclick="App.exportSubmissionsCsv()">📊 Xuất bảng điểm Excel / CSV</button>
      </div>
      <div class="card table-wrap">
        <table>
          <thead><tr><th>Học sinh</th><th>Lớp</th><th>Đề kiểm tra</th><th>Điểm số</th><th>Số câu đúng</th><th>Thời gian nộp</th></tr></thead>
          <tbody>
            ${subs.map(s => `
            <tr>
              <td><strong>${esc(s.studentName)}</strong></td>
              <td><span class="tag tag-nb">${esc(s.studentClass)}</span></td>
              <td>${esc(s.examTitle)}</td>
              <td><span class="score-badge ${s.score >= 8 ? 'score-high' : 'score-med'}">${s.score} / 10</span></td>
              <td>${s.correctCount || 0} / ${s.totalQuestions || 0}</td>
              <td>${new Date(s.submittedAt).toLocaleString('vi-VN')}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
  },

  exportSubmissionsCsv() {
    const subs = Auth.getSubmissions();
    let csv = '\ufeffHọc sinh,Lớp,Đề thi,Điểm,Số câu đúng,Thời gian\n';
    subs.forEach(s => {
      csv += `"${s.studentName}","${s.studentClass}","${s.examTitle}",${s.score},${s.correctCount},"${new Date(s.submittedAt).toLocaleString('vi-VN')}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Bang_Diem_Tieng_Anh_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    UI.toast('📊 Đã xuất bảng điểm Excel/CSV!', 'success');
  },

  // ── Bank & Settings ─────────────────────────────────────────────
  renderBank() {
    const allQ = Auth.getAllQuestions();
    return `
    <div class="page-body slide-up">
      <div class="section-header">
        <div class="section-title">📚 Ngân hàng câu hỏi Global Success (Lớp 6–9)</div>
      </div>
      <div class="stack gap-12">
        ${allQ.slice(0, 50).map((q, idx) => `
        <div class="card p-16">
          <div class="row gap-8">
            <span class="badge badge-g${q.grade}">Lớp ${q.grade}</span>
            <span class="tag tag-nb">${esc(q.topic || 'Chủ đề')}</span>
            ${q.skill ? `<span class="tag" style="background:#e0f2fe;color:#0284c7;font-weight:700">${esc(q.skill.toUpperCase())}</span>` : ''}
          </div>
          <div style="font-weight:700;margin:8px 0;font-size:14.5px;color:#0f172a">${idx + 1}. ${formatExamText(q.content)}</div>
          ${q.options ? `<div class="grid grid-2 gap-8">${q.options.map(opt => `<div style="background:#f8fafc;padding:8px 12px;border-radius:8px;border:1px solid #e2e8f0;font-size:13.5px">${formatExamText(opt)}</div>`).join('')}</div>` : ''}
          ${q.solution ? `<div style="font-size:13px;color:#15803d;margin-top:8px;background:#f0fdf4;padding:8px 12px;border-radius:6px;border-left:3px solid #22c55e">💡 ${formatExamText(q.solution)}</div>` : ''}
        </div>`).join('')}
      </div>
    </div>`;
  },

  renderSettings() {
    const u = this.state.user;
    return `
    <div class="page-body slide-up" style="max-width:800px;margin:0 auto">
      <div class="card mb-20" style="border:1.5px solid #2563eb;background:linear-gradient(135deg,#eff6ff,#dbeafe);padding:24px">
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:12px">
          <div style="font-size:36px">👨‍🏫</div>
          <div>
            <h3 style="font-size:18px;font-weight:900;color:#1e3a8a">BẢN QUYỀN HỆ THỐNG: THẦY ĐINH VĂN THÀNH</h3>
            <div style="font-size:13.5px;color:#1d4ed8;font-weight:600">Trường THCS Đồng Yên – Điện thoại / Zalo: 0915.213717</div>
          </div>
        </div>
        <p style="font-size:13.5px;color:#1e40af;line-height:1.6">
          Hệ thống chuyên sâu cho bộ SGK Tiếng Anh Global Success (Lớp 6, 7, 8, 9). Hỗ trợ toàn diện cho giáo viên soạn đề, quản lý lớp và học sinh học tập trực tuyến trên điện thoại.
        </p>
      </div>

      <div class="card">
        <div class="section-title mb-16">Thông tin tài khoản</div>
        <div class="stack gap-12">
          <div class="field"><label class="label">Họ và tên</label><input type="text" value="${esc(u.name)}" id="set-name"/></div>
          <div class="field"><label class="label">Đơn vị công tác</label><input type="text" value="${esc(u.school || 'Trường THCS Đồng Yên')}" id="set-school"/></div>
          <button class="btn btn-primary" onclick="UI.toast('Đã lưu thông tin','success')">Lưu thay đổi</button>
        </div>
      </div>
    </div>`;
  },

  // ================================================================
  // ── MÔ-ĐUN 1: TẠO ĐỀ KIỂM TRA 15 PHÚT (48 UNITS GLOBAL SUCCESS) ─
  // ================================================================
  build15mQuizModel(grade, uNum, code, seed) {
    const gData = (window.QUIZ_15M_DATA && window.QUIZ_15M_DATA[grade]) || {};
    const uInfo = gData[uNum] || gData[1] || { vocab: [], grammar: [], title: `Unit ${uNum}` };
    const letters = ['A', 'B', 'C', 'D'];

    function pseudoShuffle(arr, s) {
      const copy = [...(arr || [])];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.abs(Math.sin(s + i * 37)) * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    }

    const shuffledVocab = pseudoShuffle(uInfo.vocab || [], seed).slice(0, 10);
    const shuffledGrammar = pseudoShuffle(uInfo.grammar || [], seed + 101).slice(0, 10);

    const vocabItems = shuffledVocab.map((item, idx) => {
      let opts = [...(item.opts || [])];
      opts.sort((a, b) => Math.sin(seed + idx * 13 + (a[0] ? a[0].length : 0)) - 0.5);
      let correctLetter = 'A';
      const formattedOpts = opts.map((opt, oIdx) => {
        const l = letters[oIdx];
        if (opt[1] === true) correctLetter = l;
        return { letter: l, text: opt[0] };
      });
      const vItem = {
        num: idx + 1,
        q: item.q,
        opts: formattedOpts,
        ans: correctLetter,
        exp: item.exp || '',
        lvl: item.lvl || 'TH'
      };
      if (item.passage_title) vItem.passage_title = item.passage_title;
      if (item.passage_text) vItem.passage_text = item.passage_text;
      return vItem;
    });

    const grammarItems = shuffledGrammar.map((item, idx) => {
      let opts = [...(item.opts || [])];
      opts.sort((a, b) => Math.cos(seed + idx * 17 + (a[0] ? a[0].length : 0)) - 0.5);
      let correctLetter = 'A';
      const formattedOpts = opts.map((opt, oIdx) => {
        const l = letters[oIdx];
        if (opt[1] === true) correctLetter = l;
        return { letter: l, text: opt[0] };
      });
      const gItem = {
        num: idx + 11,
        q: item.q,
        opts: formattedOpts,
        ans: correctLetter,
        exp: item.exp || '',
        lvl: item.lvl || 'TH'
      };
      if (item.passage_title) gItem.passage_title = item.passage_title;
      if (item.passage_text) gItem.passage_text = item.passage_text;
      return gItem;
    });

    return {
      grade: String(grade),
      unitNum: Number(uNum),
      title: uInfo.title || `Unit ${uNum}`,
      sub: uInfo.sub || '',
      code: code,
      vocabItems: vocabItems,
      grammarItems: grammarItems
    };
  },

  renderQuiz15m() {
    const qState = this.state.quiz15m;
    const curGrade = qState.grade;
    const curUnit = qState.unitNum;
    const gData = (window.QUIZ_15M_DATA && window.QUIZ_15M_DATA[curGrade]) || {};
    const uInfo = gData[curUnit] || { title: `Unit ${curUnit}`, sub: '' };

    const curCode = qState.previewCodeIndex === 1 ? qState.code1 : qState.code2;
    const curSeed = qState.previewCodeIndex === 1 ? qState.seed1 : qState.seed2;
    const model = this.build15mQuizModel(curGrade, curUnit, curCode, curSeed);

    const m1 = this.build15mQuizModel(curGrade, curUnit, qState.code1, qState.seed1);
    const m2 = this.build15mQuizModel(curGrade, curUnit, qState.code2, qState.seed2);

    return `
    <div class="page-body slide-up" style="max-width:1200px;margin:0 auto">
      <!-- Header Banner -->
      <div class="card mb-16 no-print" style="background:linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%);color:#fff;border:none;padding:20px 24px">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px">
          <div>
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
              <span style="font-size:24px">⚡</span>
              <h2 style="font-size:20px;font-weight:900;letter-spacing:-0.02em">CÔNG CỤ TẠO ĐỀ KIỂM TRA 15 PHÚT TIẾNG ANH THCS</h2>
              <span class="badge" style="background:rgba(255,255,255,0.2);color:#fff;font-weight:700">48 UNITS GLOBAL SUCCESS</span>
            </div>
            <p style="font-size:13px;opacity:0.9">
              Bản quyền: <strong>Thầy Đinh Văn Thành – THCS Đồng Yên</strong> (0915.213717) • Quy chuẩn 5 trang in ấn A4 (Đề 1 - Phiếu - Đề 2 - Phiếu - Đáp án).
            </p>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button onclick="window.print()" class="btn btn-outline" style="background:rgba(255,255,255,0.15);color:#fff;border-color:rgba(255,255,255,0.3)">
              🖨️ In đề A4
            </button>
            <button onclick="App.export15mWord(1)" class="btn btn-primary" style="background:#0284c7;border:none">
              📥 Xuất Word 3 Mặt (.doc)
            </button>
            <button onclick="App.export15mWord('full')" class="btn btn-success" style="background:#10b981;border:none">
              📦 Trọn Bộ 2 Mã Đề 5 Trang (.doc)
            </button>
            <button onclick="App.export15mWord('solution')" class="btn" style="background:#f59e0b;color:#fff;font-weight:700;border:none">
              💡 Kèm Lời Giải 4 Cột (.doc)
            </button>
            <button onclick="App.share15mZalo()" class="btn" style="background:#0284c7;color:#fff;font-weight:700">
              💬 Giao qua Zalo
            </button>
          </div>
        </div>
      </div>

      <!-- Grade & Unit Selector -->
      <div class="card mb-16 no-print" style="padding:16px 20px">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:14px">
          <div style="display:flex;gap:8px">
            ${['6', '7', '8', '9'].map(g => `
              <button onclick="App.selectQuiz15mGrade('${g}')" class="btn ${curGrade === g ? 'btn-primary' : 'btn-outline'}" style="font-weight:800">
                🇬🇧 TIẾNG ANH ${g}
              </button>
            `).join('')}
          </div>
          <div style="font-size:12.5px;color:var(--ink-soft);font-weight:600">
            Mã đề mặc định: <span style="color:#2563eb;font-weight:800">Mã ${qState.code1}</span> & <span style="color:#0284c7;font-weight:800">Mã ${qState.code2}</span>
          </div>
        </div>

        <!-- 12 Units Pills -->
        <div style="display:flex;flex-wrap:wrap;gap:8px">
          ${Array.from({ length: 12 }, (_, i) => i + 1).map(u => {
            const uData = gData[u] || {};
            const title = uData.title || `Unit ${u}`;
            const isAct = curUnit === u;
            return `
              <button onclick="App.selectQuiz15mUnit(${u})" class="unit-pill-btn ${isAct ? 'active' : ''}">
                ${isAct ? '✓ ' : ''}${title.length > 20 ? title.slice(0, 20) + '...' : title}
              </button>
            `;
          }).join('')}
        </div>
      </div>

      <!-- School & Unit Configuration (Editable) -->
      <div class="card mb-16 no-print" style="background:#f8fafc;border:1.5px dashed var(--line);padding:14px 18px">
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)) 120px;gap:12px;align-items:end">
          <div>
            <label class="label" style="font-size:11px;color:var(--ink-soft)">CƠ QUAN CẤP TRÊN:</label>
            <input type="text" id="cfg15mParent" value="${esc(qState.parent)}" class="input" style="font-weight:700" onchange="App.save15mSchoolConfig()"/>
          </div>
          <div>
            <label class="label" style="font-size:11px;color:var(--ink-soft)">TÊN TRƯỜNG HỌC:</label>
            <input type="text" id="cfg15mSchool" value="${esc(qState.school)}" class="input" style="font-weight:700" onchange="App.save15mSchoolConfig()"/>
          </div>
          <div>
            <label class="label" style="font-size:11px;color:var(--ink-soft)">NĂM HỌC:</label>
            <input type="text" id="cfg15mYear" value="${esc(qState.year)}" class="input" style="font-weight:700" onchange="App.save15mSchoolConfig()"/>
          </div>
          <div>
            <button onclick="App.save15mSchoolConfig()" class="btn btn-outline" style="width:100%">
              💾 Lưu lại
            </button>
          </div>
        </div>
      </div>

      <!-- Preview Mode Subtabs -->
      <div class="card mb-16 no-print" style="padding:10px 16px">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px">
          <div style="display:flex;gap:8px">
            <button onclick="App.switchQuiz15mPreviewFace(1)" id="btnTab15mFace1" class="btn ${qState.previewFace === 1 ? 'btn-primary' : 'btn-ghost'}" style="font-weight:700">
              📄 Mặt 1: Đề thi 20 câu (A4)
            </button>
            <button onclick="App.switchQuiz15mPreviewFace(2)" id="btnTab15mFace2" class="btn ${qState.previewFace === 2 ? 'btn-primary' : 'btn-ghost'}" style="font-weight:700">
              📝 Mặt 2: Phiếu trắc nghiệm 20 câu
            </button>
            <button onclick="App.switchQuiz15mPreviewFace(3)" id="btnTab15mFace3" class="btn ${qState.previewFace === 3 ? 'btn-primary' : 'btn-ghost'}" style="font-weight:700">
              📊 Mặt 3: Bảng đáp án rút gọn
            </button>
            <button onclick="App.switchQuiz15mPreviewFace(4)" id="btnTab15mFace4" class="btn ${qState.previewFace === 4 ? 'btn-primary' : 'btn-ghost'}" style="font-weight:700">
              💡 Mặt 4: Lời giải chi tiết 4 cột
            </button>
          </div>

          <!-- Code Switcher for Face 1 & Face 4 -->
          ${(qState.previewFace === 1 || qState.previewFace === 4) ? `
            <div style="display:flex;align-items:center;gap:6px">
              <span style="font-size:12px;color:var(--ink-soft);font-weight:600">Xem mã đề:</span>
              <button onclick="App.switchQuiz15mCode(1)" class="btn ${qState.previewCodeIndex === 1 ? 'btn-primary' : 'btn-outline'}" style="padding:4px 10px;font-size:12px">
                Mã ${qState.code1}
              </button>
              <button onclick="App.switchQuiz15mCode(2)" class="btn ${qState.previewCodeIndex === 2 ? 'btn-primary' : 'btn-outline'}" style="padding:4px 10px;font-size:12px">
                Mã ${qState.code2}
              </button>
            </div>
          ` : ''}
        </div>
      </div>

      <!-- ── FACE 1 PREVIEW: ĐỀ THI 20 CÂU ── -->
      <div id="view15mFace1" class="${qState.previewFace === 1 ? '' : 'hidden'}">
        <div class="exam-paper-15m">
          <table style="width:100%;border:none;margin-bottom:4px;font-family:'Times New Roman',serif;font-size:10.5pt">
            <tr>
              <td style="width:50%;vertical-align:top;border:none">
                <div style="font-weight:bold;font-size:9.5pt">${esc((localStorage.getItem('cfg_parent_agency') || 'UBND XÃ ĐỒNG YÊN').toUpperCase())}</div>
                <div style="font-weight:bold;font-size:10.5pt;text-decoration:underline">${esc(qState.school.toUpperCase())}</div>
                Họ và tên: ....................................................<br/>
                Lớp: ${curGrade}A.....
              </td>
              <td style="width:50%;vertical-align:top;text-align:center;border:none">
                <b style="font-size:11pt">BÀI KIỂM TRA 15 PHÚT</b><br/>
                <i>Môn: Tiếng Anh ${curGrade} • ${esc(model.title)}</i><br/>
                <b style="color:#b91c1c;font-size:11.5pt">Mã đề: ${model.code}</b>
              </td>
            </tr>
          </table>
          <hr style="border:none;border-top:1px solid #000;margin:2px 0 6px 0"/>

          <p style="margin:2px 0;font-size:10.5pt;font-family:'Times New Roman',serif;font-weight:bold">
            Part I: Vocabulary & Communication. <span style="font-weight:normal;font-style:italic;font-size:10pt">Choose the best answer A, B, or C to complete the sentences.</span>
          </p>

          ${model.vocabItems.map(item => `
            ${item.passage_title ? `<div style="font-weight:bold;font-style:italic;font-size:10pt;color:#1e293b;margin-top:3px">${esc(item.passage_title)}</div>` : ''}
            ${item.passage_text ? `<div style="font-style:italic;font-size:9.5pt;background:#f8fafc;padding:4px 8px;border:1px solid #e2e8f0;border-radius:4px;margin-bottom:3px">${esc(item.passage_text)}</div>` : ''}
            <div style="font-size:10.5pt;line-height:1.25;margin-bottom:2px">
              <b>${item.num}.</b> ${esc(item.q)}
              <div style="padding-left:14px;display:flex;flex-wrap:wrap;gap:18px;font-size:10pt">
                ${item.opts.map(o => `<span><b>${o.letter}.</b> ${esc(o.text)}</span>`).join('')}
              </div>
            </div>
          `).join('')}

          <p style="margin:6px 0 2px 0;font-size:10.5pt;font-family:'Times New Roman',serif;font-weight:bold">
            Part II: Grammar & Reading. <span style="font-weight:normal;font-style:italic;font-size:10pt">Choose the best answer A, B, or C to complete the sentences.</span>
          </p>

          ${model.grammarItems.map(item => `
            ${item.passage_title ? `<div style="font-weight:bold;font-style:italic;font-size:10pt;color:#1e293b;margin-top:3px">${esc(item.passage_title)}</div>` : ''}
            ${item.passage_text ? `<div style="font-style:italic;font-size:9.5pt;background:#f8fafc;padding:4px 8px;border:1px solid #e2e8f0;border-radius:4px;margin-bottom:3px">${esc(item.passage_text)}</div>` : ''}
            <div style="font-size:10.5pt;line-height:1.25;margin-bottom:2px">
              <b>${item.num}.</b> ${esc(item.q)}
              <div style="padding-left:14px;display:flex;flex-wrap:wrap;gap:18px;font-size:10pt">
                ${item.opts.map(o => `<span><b>${o.letter}.</b> ${esc(o.text)}</span>`).join('')}
              </div>
            </div>
          `).join('')}

          <div style="text-align:center;font-weight:bold;font-style:italic;font-size:9.5pt;color:#64748b;margin-top:8px">
            --- HẾT ---
          </div>
        </div>
      </div>

      <!-- ── FACE 2 PREVIEW: PHIẾU CHẤM TRẮC NGHIỆM 20 CÂU ── -->
      <div id="view15mFace2" class="${qState.previewFace === 2 ? '' : 'hidden'}">
        <div class="card p-24 text-center">
          <div style="margin-bottom:12px;font-weight:700;color:var(--ink-soft)">
            PHIẾU TRẢ LỜI TRẮC NGHIỆM 20 CÂU TIÊU CHUẨN (ĐÃ LOẠI BỎ CHỮ 8C, CHÈN TỰ ĐỘNG VÀO WORD KHI XUẤT BẢN)
          </div>
          ${window.ANSWER_SHEET_PNG_BASE64 ? `
            <img src="${window.ANSWER_SHEET_PNG_BASE64}" style="max-width:700px;width:100%;height:auto;border:1px solid var(--line);border-radius:8px;box-shadow:var(--shadow-sm);margin:0 auto" alt="Phiếu trắc nghiệm 20 câu"/>
          ` : `
            <div style="padding:60px 20px;border:2px dashed var(--line);border-radius:12px;color:var(--ink-soft)">
              Phiếu trắc nghiệm 20 câu A4 tiêu chuẩn (Đã cấu hình chèn trực tiếp khi xuất file Word)
            </div>
          `}
        </div>
      </div>

      <!-- ── FACE 3 PREVIEW: BẢNG ĐÁP ÁN RÚT GỌN ── -->
      <div id="view15mFace3" class="${qState.previewFace === 3 ? '' : 'hidden'}">
        <div class="exam-paper-15m" style="max-width:800px;margin:0 auto">
          <div style="text-align:center;margin-bottom:14px">
            <h3 style="color:#b91c1c;font-size:14pt;font-weight:bold;margin-bottom:4px">BẢNG ĐÁP ÁN ĐỀ KIỂM TRA 15 PHÚT (RÚT GỌN)</h3>
            <div style="font-style:italic;font-size:10.5pt">
              Môn: Tiếng Anh ${curGrade} • ${esc(m1.title)} • Năm học ${esc(qState.year)}<br/>
              (Mỗi câu đúng 0.5 điểm • Thang điểm 10.0 • Dành cho Giáo viên chấm điểm)
            </div>
          </div>

          <table class="table-short-ans">
            <thead>
              <tr>
                <th style="width:14%">Câu</th>
                <th style="color:#dc2626">Mã ${m1.code}</th>
                <th style="color:#2563eb">Mã ${m2.code}</th>
                <th style="width:14%">Câu</th>
                <th style="color:#dc2626">Mã ${m1.code}</th>
                <th style="color:#2563eb">Mã ${m2.code}</th>
              </tr>
            </thead>
            <tbody>
              ${Array.from({ length: 10 }, (_, r) => {
                const allAns1 = [...m1.vocabItems.map(x => x.ans), ...m1.grammarItems.map(x => x.ans)];
                const allAns2 = [...m2.vocabItems.map(x => x.ans), ...m2.grammarItems.map(x => x.ans)];
                return `
                  <tr>
                    <td><b>${r + 1}</b></td>
                    <td style="color:#dc2626;font-weight:bold">${allAns1[r] || ''}</td>
                    <td style="color:#2563eb;font-weight:bold">${allAns2[r] || ''}</td>
                    <td><b>${r + 11}</b></td>
                    <td style="color:#dc2626;font-weight:bold">${allAns1[r + 10] || ''}</td>
                    <td style="color:#2563eb;font-weight:bold">${allAns2[r + 10] || ''}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <div style="margin-top:30px;text-align:right;padding-right:24px;font-size:11pt">
            <b>GIÁO VIÊN BỘ MÔN</b><br/>
            <span style="font-size:9.5pt;color:#64748b">(Ký và ghi rõ họ tên)</span>
          </div>
        </div>
      </div>

      <!-- ── FACE 4 PREVIEW: BẢNG LỜI GIẢI CHI TIẾT 4 CỘT CHUẨN ĐỒNG YÊN ── -->
      <div id="view15mFace4" class="${qState.previewFace === 4 ? '' : 'hidden'}">
        <div class="exam-paper-15m" style="max-width:920px;margin:0 auto">
          <div style="text-align:center;margin-bottom:14px">
            <h3 style="color:#1e3a8a;font-size:14pt;font-weight:bold;margin-bottom:4px">HƯỚNG DẪN CHẤM & LỜI GIẢI CHI TIẾT (4 CỘT)</h3>
            <div style="font-style:italic;font-size:10.5pt">
              Môn: Tiếng Anh ${curGrade} • ${esc(model.title)} • Mã đề ${model.code} • Năm học ${esc(qState.year)}<br/>
              (Thang điểm 10.0 • Mỗi câu đúng 0.5 điểm • Chuẩn mẫu THCS Đồng Yên)
            </div>
          </div>

          <table class="table-short-ans" style="width:100%;font-size:10pt">
            <thead>
              <tr style="background:#e2e8f0;font-weight:bold;text-align:center">
                <th style="width:8%;border:1px solid #000;padding:6px">Câu</th>
                <th style="width:10%;border:1px solid #000;padding:6px">Đáp án</th>
                <th style="width:12%;border:1px solid #000;padding:6px">Cấp độ</th>
                <th style="width:70%;border:1px solid #000;padding:6px;text-align:left">Giải thích (Nội dung cần nhớ)</th>
              </tr>
            </thead>
            <tbody>
              <tr style="background:#f8fafc;font-weight:bold"><td colspan="4" style="border:1px solid #000;padding:5px 8px;text-align:left">Part I: Vocabulary & Communication (10 câu - 5.0 điểm)</td></tr>
              ${model.vocabItems.map(item => `
                <tr>
                  <td style="border:1px solid #cbd5e1;text-align:center;font-weight:bold;padding:5px">${item.num}</td>
                  <td style="border:1px solid #cbd5e1;text-align:center;font-weight:bold;color:#b91c1c;padding:5px">${item.ans}</td>
                  <td style="border:1px solid #cbd5e1;text-align:center;padding:5px"><span class="badge" style="font-size:10px">${item.lvl || 'TH'}</span></td>
                  <td style="border:1px solid #cbd5e1;padding:5px 8px;text-align:left;line-height:1.4">${esc(item.exp || '')}</td>
                </tr>
              `).join('')}
              <tr style="background:#f8fafc;font-weight:bold"><td colspan="4" style="border:1px solid #000;padding:5px 8px;text-align:left">Part II: Grammar & Reading (10 câu - 5.0 điểm)</td></tr>
              ${model.grammarItems.map(item => `
                <tr>
                  <td style="border:1px solid #cbd5e1;text-align:center;font-weight:bold;padding:5px">${item.num}</td>
                  <td style="border:1px solid #cbd5e1;text-align:center;font-weight:bold;color:#b91c1c;padding:5px">${item.ans}</td>
                  <td style="border:1px solid #cbd5e1;text-align:center;padding:5px"><span class="badge" style="font-size:10px">${item.lvl || 'TH'}</span></td>
                  <td style="border:1px solid #cbd5e1;padding:5px 8px;text-align:left;line-height:1.4">${esc(item.exp || '')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div style="margin-top:30px;text-align:right;padding-right:24px;font-size:11pt">
            <b>GIÁO VIÊN BỘ MÔN</b><br/>
            <span style="font-size:9.5pt;color:#64748b">(Ký và ghi rõ họ tên)</span>
          </div>
        </div>
      </div>
    </div>`;
  },

  selectQuiz15mGrade(grade) {
    this.state.quiz15m.grade = String(grade);
    this.state.quiz15m.unitNum = 1;
    this.state.quiz15m.code1 = grade + '01';
    this.state.quiz15m.code2 = grade + '02';
    this.renderPage();
  },

  selectQuiz15mUnit(unitNum) {
    this.state.quiz15m.unitNum = Number(unitNum);
    this.renderPage();
  },

  switchQuiz15mPreviewFace(faceNum) {
    this.state.quiz15m.previewFace = faceNum;
    this.renderPage();
  },

  switchQuiz15mCode(codeIdx) {
    this.state.quiz15m.previewCodeIndex = codeIdx;
    this.renderPage();
  },

  save15mSchoolConfig() {
    const p = document.getElementById('cfg15mParent')?.value.trim().toUpperCase() || 'UBND XÃ ĐỒNG YÊN';
    const s = document.getElementById('cfg15mSchool')?.value.trim().toUpperCase() || 'TRƯỜNG THCS ĐỒNG YÊN';
    const y = document.getElementById('cfg15mYear')?.value.trim() || '2025 - 2026';

    this.state.quiz15m.parent = p;
    this.state.quiz15m.school = s;
    this.state.quiz15m.year = y;

    localStorage.setItem('cfg_parent_agency', p);
    localStorage.setItem('cfg_school_name', s);
    localStorage.setItem('cfg_school_year', y);
    UI.toast(`Đã lưu thông tin: ${s}`, 'success');
    this.renderPage();
  },

  export15mWord(type = 1) {
    const qState = this.state.quiz15m;
    const curGrade = qState.grade;
    const curUnit = qState.unitNum;
    const school = qState.school;
    const year = qState.year;
    const parentAgency = (localStorage.getItem('cfg_parent_agency') || 'UBND XÃ ĐỒNG YÊN').toUpperCase();

    const m1 = this.build15mQuizModel(curGrade, curUnit, qState.code1, qState.seed1);
    const m2 = this.build15mQuizModel(curGrade, curUnit, qState.code2, qState.seed2);

    function buildWordExamPage(m) {
      let vHtml = '';
      m.vocabItems.forEach(item => {
        const opts = item.opts.map(o => `<b>${o.letter}.</b> ${o.text}`).join('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;');
        let passHtml = '';
        if (item.passage_title) passHtml += `<p style="margin:1pt 0 0 0;line-height:11pt;font-size:10pt;font-family:'Times New Roman';font-weight:bold;font-style:italic">${item.passage_title}</p>`;
        if (item.passage_text) passHtml += `<p style="margin:0 0 1pt 0;line-height:11pt;font-size:9.5pt;font-family:'Times New Roman';font-style:italic">${item.passage_text}</p>`;
        vHtml += `
          ${passHtml}
          <p style="margin:0;padding:0;line-height:12pt;font-size:10.5pt;font-family:'Times New Roman'"><b>${item.num}.</b> ${item.q}</p>
          <p style="margin:0 0 1.5pt 14pt;padding:0;line-height:11pt;font-size:10pt;font-family:'Times New Roman'">${opts}</p>
        `;
      });

      let gHtml = '';
      m.grammarItems.forEach(item => {
        const opts = item.opts.map(o => `<b>${o.letter}.</b> ${o.text}`).join('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;');
        let passHtml = '';
        if (item.passage_title) passHtml += `<p style="margin:1pt 0 0 0;line-height:11pt;font-size:10pt;font-family:'Times New Roman';font-weight:bold;font-style:italic">${item.passage_title}</p>`;
        if (item.passage_text) passHtml += `<p style="margin:0 0 1pt 0;line-height:11pt;font-size:9.5pt;font-family:'Times New Roman';font-style:italic">${item.passage_text}</p>`;
        gHtml += `
          ${passHtml}
          <p style="margin:0;padding:0;line-height:12pt;font-size:10.5pt;font-family:'Times New Roman'"><b>${item.num}.</b> ${item.q}</p>
          <p style="margin:0 0 1.5pt 14pt;padding:0;line-height:11pt;font-size:10pt;font-family:'Times New Roman'">${opts}</p>
        `;
      });

      return `
        <table style="width:100%;border:none;margin-bottom:2pt;font-family:'Times New Roman';font-size:10pt">
          <tr>
            <td style="width:50%;vertical-align:top;border:none;line-height:1.2">
              <div style="font-weight:bold;font-size:9.5pt">${parentAgency}</div>
              <div style="font-weight:bold;font-size:10pt;text-decoration:underline">${school.toUpperCase()}</div>
              Họ và tên: ....................................................<br/>
              Lớp: ${m.grade}A.....
            </td>
            <td style="width:50%;vertical-align:top;text-align:center;border:none;line-height:1.25">
              <b style="font-size:11pt">BÀI KIỂM TRA 15 PHÚT</b><br/>
              <i>Môn: Tiếng Anh ${m.grade} • ${m.title}</i><br/>
              <b style="color:#b91c1c;font-size:11pt">Mã đề: ${m.code}</b>
            </td>
          </tr>
        </table>
        <hr style="border:none;border-top:0.75pt solid #000;margin:1pt 0 3pt 0"/>
        <p style="margin:1pt 0 1pt 0;font-size:10.5pt;font-family:'Times New Roman';font-weight:bold">Part I: Vocabulary & Communication. <span style="font-weight:normal;font-style:italic;font-size:10pt">Choose the best answer A, B, or C to complete the sentences.</span></p>
        ${vHtml}
        <p style="margin:1.5pt 0 1pt 0;font-size:10.5pt;font-family:'Times New Roman';font-weight:bold">Part II: Grammar & Reading. <span style="font-weight:normal;font-style:italic;font-size:10pt">Choose the best answer A, B, or C to complete the sentences.</span></p>
        ${gHtml}
        <p style="text-align:center;font-weight:bold;font-style:italic;margin-top:2pt;font-size:9.5pt;font-family:'Times New Roman';color:#475569">--- HẾT ---</p>
      `;
    }

    function buildWordShortAns(model1, model2) {
      const allAns1 = [...model1.vocabItems.map(x => x.ans), ...model1.grammarItems.map(x => x.ans)];
      const allAns2 = model2 ? [...model2.vocabItems.map(x => x.ans), ...model2.grammarItems.map(x => x.ans)] : [];

      let rows = '';
      for (let r = 0; r < 10; r++) {
        rows += `
          <tr>
            <td style="border:1px solid #000;text-align:center;font-weight:bold;padding:2px">${r + 1}</td>
            <td style="border:1px solid #000;text-align:center;font-weight:bold;color:red;padding:2px">${allAns1[r] || ''}</td>
            <td style="border:1px solid #000;text-align:center;font-weight:bold;color:blue;padding:2px">${allAns2[r] || ''}</td>
            <td style="border:1px solid #000;text-align:center;font-weight:bold;padding:2px">${r + 11}</td>
            <td style="border:1px solid #000;text-align:center;font-weight:bold;color:red;padding:2px">${allAns1[r + 10] || ''}</td>
            <td style="border:1px solid #000;text-align:center;font-weight:bold;color:blue;padding:2px">${allAns2[r + 10] || ''}</td>
          </tr>
        `;
      }

      return `
        <p style="text-align:center;font-weight:bold;font-size:13pt;color:#b91c1c;margin:4pt 0 1pt 0;font-family:'Times New Roman'">BẢNG ĐÁP ÁN ĐỀ KIỂM TRA 15 PHÚT (RÚT GỌN)</p>
        <p style="text-align:center;font-style:italic;font-size:10.5pt;margin:0 0 6pt 0;font-family:'Times New Roman'">
          Môn: Tiếng Anh ${model1.grade} • ${model1.title} • Năm học ${year}<br/>
          (Mỗi câu đúng 0.5 điểm • Thang điểm 10.0 • Dành cho Giáo viên chấm điểm)
        </p>
        <table style="width:100%;border-collapse:collapse;margin-top:4pt;font-size:10.5pt;font-family:'Times New Roman'">
          <tr style="background-color:#f1f5f9;text-align:center;font-weight:bold">
            <th style="border:1px solid #000;padding:3px;width:14%">Câu</th>
            <th style="border:1px solid #000;padding:3px;color:red">Mã ${model1.code}</th>
            <th style="border:1px solid #000;padding:3px;color:blue">Mã ${model2 ? model2.code : ''}</th>
            <th style="border:1px solid #000;padding:3px;width:14%">Câu</th>
            <th style="border:1px solid #000;padding:3px;color:red">Mã ${model1.code}</th>
            <th style="border:1px solid #000;padding:3px;color:blue">Mã ${model2 ? model2.code : ''}</th>
          </tr>
          ${rows}
        </table>
        <div style="margin-top:25pt;text-align:right;padding-right:20pt;font-size:10.5pt;font-family:'Times New Roman'">
          <b>GIÁO VIÊN BỘ MÔN</b><br/>
          <span style="font-size:9pt;color:#64748b">(Ký và ghi rõ họ tên)</span>
        </div>
      `;
    }

    function buildWordSolutionPage(m) {
      let rows = `
        <tr style="background:#f1f5f9;font-weight:bold">
          <td colspan="4" style="border:1px solid #000;padding:4px 8px;font-size:11pt">Part I: Vocabulary & Communication (10 câu - 5.0 điểm)</td>
        </tr>
      `;
      m.vocabItems.forEach(item => {
        rows += `
          <tr>
            <td style="border:1px solid #000;text-align:center;font-weight:bold;padding:4px">${item.num}</td>
            <td style="border:1px solid #000;text-align:center;font-weight:bold;color:#b91c1c;padding:4px">${item.ans}</td>
            <td style="border:1px solid #000;text-align:center;padding:4px">${item.lvl || 'TH'}</td>
            <td style="border:1px solid #000;padding:4px 8px;text-align:left">${item.exp || ''}</td>
          </tr>
        `;
      });
      rows += `
        <tr style="background:#f1f5f9;font-weight:bold">
          <td colspan="4" style="border:1px solid #000;padding:4px 8px;font-size:11pt">Part II: Grammar & Reading (10 câu - 5.0 điểm)</td>
        </tr>
      `;
      m.grammarItems.forEach(item => {
        rows += `
          <tr>
            <td style="border:1px solid #000;text-align:center;font-weight:bold;padding:4px">${item.num}</td>
            <td style="border:1px solid #000;text-align:center;font-weight:bold;color:#b91c1c;padding:4px">${item.ans}</td>
            <td style="border:1px solid #000;text-align:center;padding:4px">${item.lvl || 'TH'}</td>
            <td style="border:1px solid #000;padding:4px 8px;text-align:left">${item.exp || ''}</td>
          </tr>
        `;
      });

      return `
        <p style="text-align:center;font-weight:bold;font-size:13pt;color:#1e3a8a;margin:6pt 0 2pt 0;font-family:'Times New Roman'">HƯỚNG DẪN CHẤM & LỜI GIẢI CHI TIẾT</p>
        <p style="text-align:center;font-style:italic;font-size:10.5pt;margin:0 0 8pt 0;font-family:'Times New Roman'">
          Môn: Tiếng Anh ${m.grade} • ${m.title} • Mã đề ${m.code} • Năm học ${year}<br/>
          (Thang điểm 10.0 • Mỗi câu đúng 0.5 điểm • Chuẩn mẫu THCS Đồng Yên)
        </p>
        <table style="width:100%;border-collapse:collapse;margin-top:4pt;font-size:10.5pt;font-family:'Times New Roman'">
          <thead>
            <tr style="background-color:#e2e8f0;text-align:center;font-weight:bold">
              <th style="border:1px solid #000;padding:5px;width:10%">Câu</th>
              <th style="border:1px solid #000;padding:5px;width:12%">Đáp án</th>
              <th style="border:1px solid #000;padding:5px;width:12%">Cấp độ</th>
              <th style="border:1px solid #000;padding:5px;width:66%;text-align:left">Giải thích (Nội dung cần nhớ)</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
        <div style="margin-top:25pt;text-align:right;padding-right:20pt;font-size:10.5pt;font-family:'Times New Roman'">
          <b>GIÁO VIÊN BỘ MÔN</b><br/>
          <span style="font-size:9pt;color:#64748b">(Ký và ghi rõ họ tên)</span>
        </div>
      `;
    }

    const imgTag = window.ANSWER_SHEET_PNG_BASE64 ?
      `<img src="${window.ANSWER_SHEET_PNG_BASE64}" style="width:100%;max-width:680px;height:auto;margin:0 auto;display:block" />` :
      `<p style="text-align:center;font-weight:bold;margin-top:100px">[PHIẾU TRẢ LỜI TRẮC NGHIỆM 20 CÂU]</p>`;

    let fullBody = '';
    let fileName = '';

    if (type === 'full') {
      // Chuẩn 5 Trang in ấn A4
      fullBody = `
        <!-- TRANG 1: ĐỀ MÃ 1 -->
        ${buildWordExamPage(m1)}
        <br clear="all" style="page-break-before:always;mso-break-type:page-break"/>
        <!-- TRANG 2: PHIẾU CHẤM MÃ 1 -->
        ${imgTag}
        <br clear="all" style="page-break-before:always;mso-break-type:page-break"/>
        <!-- TRANG 3: ĐỀ MÃ 2 -->
        ${buildWordExamPage(m2)}
        <br clear="all" style="page-break-before:always;mso-break-type:page-break"/>
        <!-- TRANG 4: PHIẾU CHẤM MÃ 2 -->
        ${imgTag}
        <br clear="all" style="page-break-before:always;mso-break-type:page-break"/>
        <!-- TRANG 5: ĐÁP ÁN RÚT GỌN ĐỐI CHIẾU 2 MÃ ĐỀ -->
        ${buildWordShortAns(m1, m2)}
      `;
      fileName = `De_15P_Anh_${curGrade}_Unit_${curUnit}_Tron_Bo_5_Trang_Ma_${m1.code}_${m2.code}.doc`;
    } else if (type === 'solution') {
      // Chuẩn 3 Trang kèm Lời giải chi tiết 4 Cột
      fullBody = `
        <!-- TRANG 1: ĐỀ MÃ 1 -->
        ${buildWordExamPage(m1)}
        <br clear="all" style="page-break-before:always;mso-break-type:page-break"/>
        <!-- TRANG 2: PHIẾU CHẤM -->
        ${imgTag}
        <br clear="all" style="page-break-before:always;mso-break-type:page-break"/>
        <!-- TRANG 3: BẢNG LỜI GIẢI CHI TIẾT 4 CỘT -->
        ${buildWordSolutionPage(m1)}
      `;
      fileName = `De_15P_Anh_${curGrade}_Unit_${curUnit}_Ma_${m1.code}_Kem_Loi_Giai_4_Cot.doc`;
    } else {
      // Chuẩn 3 Trang đơn lẻ
      fullBody = `
        <!-- TRANG 1: ĐỀ MÃ 1 -->
        ${buildWordExamPage(m1)}
        <br clear="all" style="page-break-before:always;mso-break-type:page-break"/>
        <!-- TRANG 2: PHIẾU CHẤM -->
        ${imgTag}
        <br clear="all" style="page-break-before:always;mso-break-type:page-break"/>
        <!-- TRANG 3: ĐÁP ÁN RÚT GỌN -->
        ${buildWordShortAns(m1, null)}
      `;
      fileName = `De_15P_Anh_${curGrade}_Unit_${curUnit}_Ma_${m1.code}.doc`;
    }

    const docHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>${fileName}</title>
      <style>
        @page { size: 21.0cm 29.7cm; margin: 0.6cm 1.2cm 0.6cm 1.2cm; mso-page-orientation: portrait; }
        body { font-family: 'Times New Roman', serif; font-size: 10.5pt; line-height: 1.15; color: #000; margin: 0; padding: 0; }
        p { margin: 0; padding: 0; line-height: 1.15; }
      </style>
      </head>
      <body>
        ${fullBody}
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', docHtml], { type: 'application/msword;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(a.href); }, 100);
    UI.toast(`📥 Đã tải xuống file Word: ${fileName}`, 'success');
  },

  share15mZalo() {
    const q = this.state.quiz15m;
    const url = `${window.location.origin}${window.location.pathname}?mode=student15m&grade=${q.grade}&unit=${q.unitNum}`;
    const text = `Kính gửi Quý Phụ huynh và các em Học sinh lớp ${q.grade}!\nThầy Đinh Văn Thành gửi link làm Bài Kiểm Tra 15 Phút Tiếng Anh (Unit ${q.unitNum}) trực tiếp trên điện thoại:\n👉 ${url}\nCác em làm xong nộp bài sẽ có điểm ngay!`;

    navigator.clipboard?.writeText(text).then(() => {
      UI.toast(' Đã sao chép nội dung & link bài thi Zalo!', 'success');
      window.open(`https://zalo.me/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
    }).catch(() => {
      prompt('Sao chép link làm bài thi 15 phút:', url);
    });
  },

  // ================================================================
  // ── MÔ-ĐUN 2: BỘ ĐỀ THI CHUẨN ĐỊNH KỲ (GK, CK, KSCL - CV 7991) ──
  // ================================================================
  renderOfficialExams() {
    const oPaths = {
      '6': {
        'GK1': { f: 'GK1 - Anh 6.docx', p: 'exams_docx/Tieng_Anh_6/Giua_Ky_1/GK1 - Anh 6.docx', t: 'Unit 1: My New School, Unit 2: My House, Unit 3: My Friends', s: '100% Đề thi Viết (10.0 điểm). 36 câu TNKQ + 1 câu Viết.', spk: '❌ Không có Speaking ở bài thi Giữa kỳ.', pills: ['Thì hiện tại đơn', 'Tính từ miêu tả', 'Giới từ chỉ vị trí', 'Phát âm /s/, /z/'] },
        'CK1': { f: 'CK1 - Anh 6.docx', p: 'exams_docx/Tieng_Anh_6/Cuoi_Ky_1/CK1 - Anh 6.docx', t: 'Unit 1 đến Unit 6 (Tet holiday, Natural Wonders, Neighbourhood)', s: 'Đề viết 8.0đ + Bài thi Nói Speaking 2.0đ = 10.0đ.', spk: '🎤 Có Speaking 2.0đ: Picture Talk (1.0đ) + About You (1.0đ) kèm Examiner Script.', pills: ['So sánh hơn', 'should/shouldn\'t', 'must/mustn\'t', 'Countable/Uncountable'] },
        'GK2': { f: 'GK2 - Anh 6.docx', p: 'exams_docx/Tieng_Anh_6/Giua_Ky_2/GK2 - Anh 6.docx', t: 'Unit 7: Television, Unit 8: Sports and Games, Unit 9: Cities of the World', s: '100% Đề thi Viết (10.0 điểm). 36 câu TNKQ + 1 câu Viết.', spk: '❌ Không có Speaking ở bài thi Giữa kỳ.', pills: ['Quá khứ đơn', 'Liên từ and/but/so/because', 'So sánh nhất', 'Đại từ sở hữu'] },
        'CK2': { f: 'CK2 - Anh 6.docx', p: 'exams_docx/Tieng_Anh_6/Cuoi_Ky_2/CK2 - Anh 6.docx', t: 'Unit 7 đến Unit 12 (Future Houses, 3Rs Environment, Smart Robots)', s: 'Đề viết 8.0đ + Bài thi Nói Speaking 2.0đ = 10.0đ.', spk: '🎤 Có Speaking 2.0đ: Picture Talk (1.0đ) + About You (1.0đ) kèm Examiner Script.', pills: ['Câu điều kiện loại 1', 'will/won\'t & might', 'will be able to', 'Quy tắc 3Rs'] },
        'KSCL': { f: 'KSCL - Anh 6.docx', p: 'exams_docx/Tieng_Anh_6/Khao_Sat_Dau_Nam/KSCL - Anh 6.docx', t: 'Khảo sát chất lượng đầu năm / Ôn tập tổng hợp Tiếng Anh 6', s: '100% Đề thi Viết (10.0 điểm). 36 câu TNKQ + 1 câu Viết.', spk: '❌ Không có Speaking.', pills: ['Tổng hợp ngữ âm', 'Từ vựng cơ bản', 'Ngữ pháp then chốt', 'Đọc hiểu & Viết đoạn'] },
        'DECUONG': { f: 'De_Cuong_On_Tap_Anh_6.docx', p: 'exams_docx/Tieng_Anh_6/De_Cuong_On_Tap_Anh_6.docx', t: 'Đề cương ôn tập trọng tâm 6 trang (Mục tiêu 6.0+ điểm)', s: 'Ngữ âm, Từ vựng, 30 câu ngữ pháp, 2 bài đọc, 10 câu viết lại, 3 bài văn mẫu.', spk: '📖 Tài liệu ôn tập tự học chuẩn ma trận đạt điểm 6.0+.', pills: ['6 Trang chuẩn A4', 'Quy tắc phát âm -s/ed', 'Công thức thì & so sánh', 'Mẹo tìm keyword'] }
      },
      '7': {
        'GK1': { f: 'GK1 - Anh 7.docx', p: 'exams_docx/Tieng_Anh_7/Giua_Ky_1/GK1 - Anh 7.docx', t: 'Unit 1: Hobbies, Unit 2: Healthy Living, Unit 3: Community Service', s: '100% Đề thi Viết (10.0 điểm). 36 câu TNKQ + 1 câu Viết.', spk: '❌ Không có Speaking ở bài thi Giữa kỳ.', pills: ['like/enjoy + V-ing', 'Hiện tại & Quá khứ đơn', 'Từ vựng sức khỏe', 'Phát âm /s/, /z/, /t/, /d/'] },
        'CK1': { f: 'CK1 - Anh 7.docx', p: 'exams_docx/Tieng_Anh_7/Cuoi_Ky_1/CK1 - Anh 7.docx', t: 'Unit 1 đến Unit 6 (Music & Arts, Food & Drink, School)', s: 'Đề viết 8.0đ + Bài thi Nói Speaking 2.0đ = 10.0đ.', spk: '🎤 Có Speaking 2.0đ: Describe a Picture + Personal Topic kèm Examiner Script.', pills: ['as...as, the same as', 'some/any, how much/many', 'Music & Food'] },
        'GK2': { f: 'GK2 - Anh 7.docx', p: 'exams_docx/Tieng_Anh_7/Giua_Ky_2/GK2 - Anh 7.docx', t: 'Unit 7: Traffic, Unit 8: Films, Unit 9: Festivals around the World', s: '100% Đề thi Viết (10.0 điểm). 36 câu TNKQ + 1 câu Viết.', spk: '❌ Không có Speaking ở bài thi Giữa kỳ.', pills: ['It indicates distance', 'used to + V', 'although/despite/however', 'Traffic & Film'] },
        'CK2': { f: 'CK2 - Anh 7.docx', p: 'exams_docx/Tieng_Anh_7/Cuoi_Ky_2/CK2 - Anh 7.docx', t: 'Unit 7 đến Unit 12 (Energy sources, Travelling in future, English countries)', s: 'Đề viết 8.0đ + Bài thi Nói Speaking 2.0đ = 10.0đ.', spk: '🎤 Có Speaking 2.0đ: Describe a Picture + Personal Topic kèm Examiner Script.', pills: ['Future continuous', 'Possessive pronouns', 'Solar/Wind energy', 'Future vehicles'] },
        'KSCL': { f: 'KSCL - Anh 7.docx', p: 'exams_docx/Tieng_Anh_7/Khao_Sat_Dau_Nam/KSCL - Anh 7.docx', t: 'Khảo sát chất lượng đầu năm / Ôn tập tổng hợp Tiếng Anh 7', s: '100% Đề thi Viết (10.0 điểm). 36 câu TNKQ + 1 câu Viết.', spk: '❌ Không có Speaking.', pills: ['Tổng hợp ngữ âm', 'Từ vựng lớp 7', 'Cấu trúc so sánh & liên từ', 'Đọc hiểu & Viết đoạn'] },
        'DECUONG': { f: 'De_Cuong_On_Tap_Anh_7.docx', p: 'exams_docx/Tieng_Anh_7/De_Cuong_On_Tap_Anh_7.docx', t: 'Đề cương ôn tập trọng tâm 6 trang (Mục tiêu 6.0+ điểm)', s: 'Ngữ âm, Từ vựng, 30 câu ngữ pháp, 2 bài đọc, 10 câu viết lại, 3 bài văn mẫu.', spk: '📖 Tài liệu ôn tập tự học chuẩn ma trận đạt điểm 6.0+.', pills: ['6 Trang chuẩn A4', 'Quy tắc phát âm', 'used to & although', 'Mẹo tìm keyword'] }
      },
      '8': {
        'GK1': { f: 'GK1 - Anh 8.docx', p: 'exams_docx/Tieng_Anh_8/Giua_Ky_1/GK1 - Anh 8.docx', t: 'Unit 1: Leisure Time, Unit 2: Life in Countryside, Unit 3: Teenagers', s: '100% Đề thi Viết (10.0 điểm). 36 câu TNKQ + 1 câu Viết.', spk: '❌ Không có Speaking ở bài thi Giữa kỳ.', pills: ['Verbs of liking/disliking', 'Comparative adverbs', 'Compound sentences', 'Teenagers'] },
        'CK1': { f: 'CK1 - Anh 8.docx', p: 'exams_docx/Tieng_Anh_8/Cuoi_Ky_1/CK1 - Anh 8.docx', t: 'Unit 1 đến Unit 6 (Ethnic groups, Customs & Traditions, Lifestyles)', s: 'Đề viết 8.0đ + Bài thi Nói Speaking 2.0đ = 10.0đ.', spk: '🎤 Có Speaking 2.0đ: Short Topic Talk + Choose & Say Why kèm Examiner Script.', pills: ['Articles (a/an/the)', 'Wh-questions', 'should/have to', 'Customs'] },
        'GK2': { f: 'GK2 - Anh 8.docx', p: 'exams_docx/Tieng_Anh_8/Giua_Ky_2/GK2 - Anh 8.docx', t: 'Unit 7: Environment, Unit 8: Shopping, Unit 9: Natural Disasters', s: '100% Đề thi Viết (10.0 điểm). 36 câu TNKQ + 1 câu Viết.', spk: '❌ Không có Speaking ở bài thi Giữa kỳ.', pills: ['Complex sentences', 'Adverbs of frequency', 'Past continuous', 'Disasters'] },
        'CK2': { f: 'CK2 - Anh 8.docx', p: 'exams_docx/Tieng_Anh_8/Cuoi_Ky_2/CK2 - Anh 8.docx', t: 'Unit 7 đến Unit 12 (Communication, Science & Tech, Planets)', s: 'Đề viết 8.0đ + Bài thi Nói Speaking 2.0đ = 10.0đ.', spk: '🎤 Có Speaking 2.0đ: Short Topic Talk + Choose & Say Why kèm Examiner Script.', pills: ['Reported speech', 'May/might for possibility', 'Prepositions', 'Space'] },
        'KSCL': { f: 'KSCL - Anh 8.docx', p: 'exams_docx/Tieng_Anh_8/Khao_Sat_Dau_Nam/KSCL - Anh 8.docx', t: 'Khảo sát chất lượng đầu năm / Ôn tập tổng hợp Tiếng Anh 8', s: '100% Đề thi Viết (10.0 điểm). 36 câu TNKQ + 1 câu Viết.', spk: '❌ Không có Speaking.', pills: ['Tổng hợp ngữ âm', 'Từ vựng lớp 8', 'Câu ghép & câu phức', 'Đọc hiểu & Viết đoạn'] },
        'DECUONG': { f: 'De_Cuong_On_Tap_Anh_8.docx', p: 'exams_docx/Tieng_Anh_8/De_Cuong_On_Tap_Anh_8.docx', t: 'Đề cương ôn tập trọng tâm 6 trang (Mục tiêu 6.0+ điểm)', s: 'Ngữ âm, Từ vựng, 30 câu ngữ pháp, 2 bài đọc, 10 câu viết lại, 3 bài văn mẫu.', spk: '📖 Tài liệu ôn tập tự học chuẩn ma trận đạt điểm 6.0+.', pills: ['6 Trang chuẩn A4', 'Quy tắc phát âm & trọng âm', 'Câu điều kiện & gián tiếp', 'Mẹo keyword'] }
      },
      '9': {
        'GK1': { f: 'GK1 - Anh 9.docx', p: 'exams_docx/Tieng_Anh_9/Giua_Ky_1/GK1 - Anh 9.docx', t: 'Unit 1: Local Community, Unit 2: City Life, Unit 3: Teens Health', s: '100% Đề thi Viết (10.0 điểm). 36 câu TNKQ + 1 câu Viết.', spk: '❌ Không có Speaking ở bài thi Giữa kỳ.', pills: ['Phrasal verbs', 'Comparison of adjectives/adverbs', 'Wh-word + to-inf', 'Modal reported'] },
        'CK1': { f: 'CK1 - Anh 9.docx', p: 'exams_docx/Tieng_Anh_9/Cuoi_Ky_1/CK1 - Anh 9.docx', t: 'Unit 1 đến Unit 6 (Past memories, Wonders of VN, English in world)', s: 'Đề viết 8.0đ + Bài thi Nói Speaking 2.0đ = 10.0đ.', spk: '🎤 Có Speaking 2.0đ: Photo Talk + Compare & Choose kèm Examiner Script.', pills: ['Past continuous vs Past simple', 'Wish + Past simple', 'Impersonal passive', 'Relative clauses'] },
        'GK2': { f: 'GK2 - Anh 9.docx', p: 'exams_docx/Tieng_Anh_9/Giua_Ky_2/GK2 - Anh 9.docx', t: 'Unit 7: Natural World, Unit 8: Tourism, Unit 9: World Englishes', s: '100% Đề thi Viết (10.0 điểm). 36 câu TNKQ + 1 câu Viết.', spk: '❌ Không có Speaking ở bài thi Giữa kỳ.', pills: ['Conditional Type 2', 'Relative pronouns', 'Compound nouns', 'Tourism'] },
        'CK2': { f: 'CK2 - Anh 9.docx', p: 'exams_docx/Tieng_Anh_9/Cuoi_Ky_2/CK2 - Anh 9.docx', t: 'Unit 7 đến Unit 12 (Space Exploration, Society Roles, Careers)', s: 'Đề viết 8.0đ + Bài thi Nói Speaking 2.0đ = 10.0đ.', spk: '🎤 Có Speaking 2.0đ: Photo Talk + Compare & Choose kèm Examiner Script.', pills: ['Past perfect', 'Relative clauses', 'Future passive', 'Careers'] },
        'KSCL': { f: 'KSCL - Anh 9.docx', p: 'exams_docx/Tieng_Anh_9/Khao_Sat_Dau_Nam/KSCL - Anh 9.docx', t: 'Khảo sát chất lượng đầu năm / Ôn tập tổng hợp Tiếng Anh 9', s: '100% Đề thi Viết (10.0 điểm). 36 câu TNKQ + 1 câu Viết.', spk: '❌ Không có Speaking.', pills: ['Tổng hợp ngữ âm & trọng âm', 'Từ vựng lớp 9', 'Mệnh đề quan hệ & điều kiện', 'Đọc hiểu & Viết luận'] },
        'DECUONG': { f: 'De_Cuong_On_Tap_Anh_9.docx', p: 'exams_docx/Tieng_Anh_9/De_Cuong_On_Tap_Anh_9.docx', t: 'Đề cương ôn tập trọng tâm 6 trang (Mục tiêu 6.0+ điểm)', s: 'Ngữ âm, Từ vựng, 30 câu ngữ pháp, 2 bài đọc, 10 câu viết lại, 3 bài văn mẫu.', spk: '📖 Tài liệu ôn tập tự học chuẩn ma trận đạt điểm 6.0+.', pills: ['6 Trang chuẩn A4', 'Quy tắc phát âm & trọng âm', 'Câu ước Wish & Bị động', 'Mẹo keyword'] }
      }
    };

    const oState = this.state.officialExams;
    const curG = oState.grade || '7';
    const curT = oState.term || 'GK1';
    const activeTab = oState.activeTab || 'exam1';
    const item = (oPaths[curG] && oPaths[curG][curT]) || oPaths['7']['GK1'];
    const suite = this.getOfficialExamSuite(curG, curT);

    const code1 = suite ? suite.code1 : (curG + '01');
    const code2 = suite ? suite.code2 : (curG + '02');
    const hasSpk = suite ? suite.hasSpeaking : (curT.startsWith('CK'));

    const parentAgency = oState.parent || localStorage.getItem('cfg_parent_agency') || 'UBND XÃ ĐỒNG YÊN';
    const schoolName = oState.school || localStorage.getItem('cfg_school_name') || 'TRƯỜNG THCS ĐỒNG YÊN';
    const examYear = localStorage.getItem('cfg_school_year') || '2026 - 2027';

    return `
    <div class="page-body slide-up" style="max-width:1200px;margin:0 auto">
      <!-- 1. Stats Summary Bar -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:14px;margin-bottom:20px">
        <div class="card p-16" style="display:flex;align-items:center;gap:14px;border-left:4px solid #2563eb">
          <div style="font-size:28px">📚</div>
          <div><div style="font-size:16px;font-weight:900;color:#1e3a8a">20 Bộ Đề Chuẩn</div><div style="font-size:12px;color:var(--ink-soft)">Khối 6, 7, 8, 9 (GK, CK, KSCL)</div></div>
        </div>
        <div class="card p-16" style="display:flex;align-items:center;gap:14px;border-left:4px solid #0d9488">
          <div style="font-size:28px">📋</div>
          <div><div style="font-size:16px;font-weight:900;color:#0f766e">40 Mã Đề Hoán Vị</div><div style="font-size:12px;color:var(--ink-soft)">02 mã đề tương đương / bộ</div></div>
        </div>
        <div class="card p-16" style="display:flex;align-items:center;gap:14px;border-left:4px solid #d97706">
          <div style="font-size:28px">🏛️</div>
          <div><div style="font-size:16px;font-weight:900;color:#b45309">Chuẩn CV 7991/BGDĐT</div><div style="font-size:12px;color:var(--ink-soft)">Năm học 2026 - 2027</div></div>
        </div>
        <div class="card p-16" style="display:flex;align-items:center;gap:14px;border-left:4px solid #7c3aed">
          <div style="font-size:28px">🎓</div>
          <div><div style="font-size:16px;font-weight:900;color:#6d28d9">04 Đề Cương 6 Trang</div><div style="font-size:12px;color:var(--ink-soft)">Mục tiêu vững chắc 6.0+ điểm</div></div>
        </div>
      </div>

      <!-- 2. Main Config Grid -->
      <div style="display:grid;grid-template-columns:1.2fr 0.8fr;gap:20px;margin-bottom:20px">
        <!-- Left: Grade & Term Selector -->
        <div class="card p-24">
          <div class="section-title mb-16">BƯỚC 1: CHỌN KHỐI LỚP & KỲ KIỂM TRA</div>

          <!-- School config box -->
          <div style="background:#f1f5f9;padding:12px 16px;border-radius:12px;border:1px dashed #cbd5e1;margin-bottom:20px">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
              <span style="font-size:13px;font-weight:700;color:#1e293b">🏫 Thông Tin Đơn Vị & Trường Học (Lưu vĩnh viễn):</span>
              <button onclick="App.saveOfficialSchoolConfig()" class="btn btn-primary" style="padding:3px 10px;font-size:11px">Lưu</button>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
              <input type="text" id="cfgOfficialParent" value="${esc(parentAgency)}" class="input" style="font-size:12px;font-weight:600" placeholder="UBND XÃ ĐỒNG YÊN"/>
              <input type="text" id="cfgOfficialSchool" value="${esc(schoolName)}" class="input" style="font-size:12px;font-weight:600" placeholder="TRƯỜNG THCS ĐỒNG YÊN"/>
            </div>
          </div>

          <!-- Grade Selector -->
          <div style="margin-bottom:20px">
            <label class="label" style="font-weight:700">1. CHỌN KHỐI LỚP THCS:</label>
            <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:10px">
              ${['6', '7', '8', '9'].map(g => `
                <button onclick="App.selectOfficialGrade('${g}')" class="btn ${curG === g ? 'btn-primary' : 'btn-outline'}" style="padding:14px 10px;display:flex;flex-direction:column;align-items:center;border-radius:12px">
                  <span style="font-size:22px;font-weight:900">${g}</span>
                  <span style="font-size:11px;font-weight:700;opacity:0.8">LỚP ${g}</span>
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Exam Term Cards -->
          <div>
            <label class="label" style="font-weight:700">2. CHỌN KỲ KIỂM TRA / TÀI LIỆU:</label>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
              ${[
                ['GK1', 'Giữa Học kỳ I', '10.0đ Viết', 'Units 1-3. Đề viết 10.0 điểm, không thi Nói.'],
                ['CK1', 'Cuối Học kỳ I', '8.0đ + 2.0đ Nói', 'Units 1-6. Đề viết 8.0đ + Bài thi Speaking 2.0đ.'],
                ['GK2', 'Giữa Học kỳ II', '10.0đ Viết', 'Units 7-9. Đề viết 10.0 điểm, không thi Nói.'],
                ['CK2', 'Cuối Học kỳ II', '8.0đ + 2.0đ Nói', 'Units 7-12. Đề viết 8.0đ + Bài thi Speaking 2.0đ.'],
                ['KSCL', 'Khảo sát đầu năm', 'Tổng hợp 10đ', 'Đánh giá năng lực tổng hợp đầu năm học.'],
                ['DECUONG', 'Đề Cương Ôn Tập', '6 Trang ~ 6.0đ', 'Bộ tài liệu ôn tập cốt lõi 6 trang bám sát ma trận.']
              ].map(([tKey, tName, tTag, tDesc]) => `
                <div onclick="App.selectOfficialTerm('${tKey}')" class="official-exam-card ${curT === tKey ? 'active' : ''}">
                  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
                    <strong style="font-size:14px;color:#1e293b">${tName}</strong>
                    <span class="badge" style="background:#e0f2fe;color:#0369a1;font-size:10.5px">${tTag}</span>
                  </div>
                  <div style="font-size:11.5px;color:var(--ink-soft);line-height:1.4">${tDesc}</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Right: Specification Box -->
        <div class="card p-24" style="background:#ffffff">
          <div class="section-title mb-16">BƯỚC 2: THÔNG TIN CHI TIẾT & BẢN ĐẶC TẢ</div>
          
          <div class="spec-box mb-12">
            <div style="font-size:11px;font-weight:700;color:var(--ink-soft);text-transform:uppercase">Tên File Word Xuất Bản</div>
            <div style="font-size:15px;font-weight:800;color:#2563eb;margin-top:2px">${item.f}</div>
          </div>

          <div class="spec-box mb-12">
            <div style="font-size:11px;font-weight:700;color:var(--ink-soft);text-transform:uppercase">Phạm Vi Bài Học (SGK Global Success)</div>
            <div style="font-size:13.5px;font-weight:700;color:#1e293b;margin-top:2px">${item.t}</div>
            <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px">
              ${item.pills.map(p => `<span class="badge" style="background:#f1f5f9;color:#334155;font-size:11px">${p}</span>`).join('')}
            </div>
          </div>

          <div class="spec-box mb-12">
            <div style="font-size:11px;font-weight:700;color:var(--ink-soft);text-transform:uppercase">Cấu Trúc Đề & Thang Điểm</div>
            <div style="font-size:13.5px;font-weight:700;color:#1e293b;margin-top:2px">${item.s}</div>
          </div>

          <div class="spec-box mb-12">
            <div style="font-size:11px;font-weight:700;color:var(--ink-soft);text-transform:uppercase">Phần Thi Nói (Speaking Test)</div>
            <div style="font-size:13.5px;font-weight:700;color:#1e293b;margin-top:2px">${item.spk}</div>
          </div>

          <div class="spec-box">
            <div style="font-size:11px;font-weight:700;color:var(--ink-soft);text-transform:uppercase">Bảo Chứng Quy Chuẩn Khảo Thí</div>
            <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px">
              <span class="badge" style="background:#eff6ff;color:#1d4ed8">Times New Roman 13pt</span>
              <span class="badge" style="background:#eff6ff;color:#1d4ed8">Bảng Auto fit to window</span>
              <span class="badge" style="background:#eff6ff;color:#1d4ed8">02 Mã đề tương đương</span>
              <span class="badge" style="background:#eff6ff;color:#1d4ed8">Năm học 2026 - 2027</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. Interactive Toolbar & Action Buttons -->
      <div class="card mb-20 no-print" style="padding:16px 20px;border-top:3px solid #2563eb">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:12px">
          <!-- View Tabs -->
          <div class="tabs" style="padding:3px;flex-wrap:wrap;gap:4px">
            <button class="tab-btn ${activeTab === 'exam1' ? 'active' : ''}" onclick="App.setOfficialTab('exam1')">
              👨‍🎓 Đề Mã 1 (${code1})
            </button>
            <button class="tab-btn ${activeTab === 'exam2' ? 'active' : ''}" onclick="App.setOfficialTab('exam2')">
              🔀 Đề Mã 2 (${code2})
            </button>
            <button class="tab-btn ${activeTab === 'solutions' ? 'active' : ''}" onclick="App.setOfficialTab('solutions')">
              👩‍🏫 Đáp Án 4 Cột & Lời Giải
            </button>
            <button class="tab-btn ${activeTab === 'matrix' ? 'active' : ''}" onclick="App.setOfficialTab('matrix')">
              📊 Ma Trận & Bản Đặc Tả 7991
            </button>
            <button class="tab-btn ${activeTab === 'audio' ? 'active' : ''}" onclick="App.setOfficialTab('audio')">
              🎧 Audio Scripts & Luyện Nghe
            </button>
            ${hasSpk ? `
            <button class="tab-btn ${activeTab === 'speaking' ? 'active' : ''}" onclick="App.setOfficialTab('speaking')">
              🎤 Speaking Test (2.0đ)
            </button>` : ''}
          </div>

          <!-- Quick Action Buttons -->
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <a href="${item.p}" download="${item.f}" class="btn btn-primary" style="text-decoration:none;font-weight:700">
              📥 Tải File Gốc (.docx)
            </a>
            <button onclick="App.exportOfficialCustomWord(1)" class="btn btn-outline" title="Xuất file Word đề Mã 1 theo tên trường">
              📄 Xuất Đề Mã 1 (.doc)
            </button>
            <button onclick="App.exportOfficialCustomWord(2)" class="btn btn-outline" title="Xuất file Word đề Mã 2 theo tên trường">
              🔀 Xuất Đề Mã 2 (.doc)
            </button>
            <button onclick="App.exportOfficialMatrixAndSpecWord()" class="btn" style="background:#0284c7;color:#fff;font-weight:700" title="Xuất riêng Ma trận 15 cột và Bản đặc tả 7 cột (.doc)">
              📊 Xuất Ma Trận & Đặc Tả (.doc)
            </button>
            <button onclick="App.exportOfficialAnswerKeyWord()" class="btn" style="background:#d97706;color:#fff;font-weight:700" title="Xuất Audio Script, bảng so sánh 4 cột 18 hàng và hướng dẫn chấm (.doc)">
              👩‍🏫 Xuất Đáp Án & HD Chấm (.doc)
            </button>
            <button onclick="App.exportOfficialFullBundleWord()" class="btn btn-success" title="Xuất trọn bộ 5 phần chuẩn Công văn 7991 như app Desktop">
              📦 Trọn Bộ 5 Phần Chuẩn App (.doc)
            </button>
            <button onclick="App.assignOfficialExamOnline()" class="btn" style="background:#7c3aed;color:#fff;font-weight:700" title="Gửi link học sinh làm trực tiếp trên điện thoại">
              🚀 Giao Bài Thi Online
            </button>
            <button onclick="App.loadOfficialToWizard()" class="btn btn-warn" title="Nạp bộ câu hỏi này vào wizard để chỉnh sửa">
              ✏️ Nạp Vào Soạn Đề Tùy Biến
            </button>
            <button onclick="window.print()" class="btn btn-outline">
              🖨️ In A4
            </button>
          </div>
        </div>

        ${activeTab === 'audio' && suite ? `
        <div style="margin-top:12px;padding:12px 16px;background:#f0f9ff;border-radius:10px;border:1px solid #bae6fd;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px">
          <div style="display:flex;align-items:center;gap:10px">
            <span style="font-size:24px">🎧</span>
            <div>
              <strong style="color:#0369a1;font-size:13.5px">Audio Player: Bài nghe chuẩn SGK Global Success Tiếng Anh ${curG}</strong>
              <div style="font-size:12px;color:#64748b">Nghe phát âm bản ngữ chuẩn (Hội thoại Dialogue + Độc thoại Monologue)</div>
            </div>
          </div>
          <button onclick="App.toggleOfficialAudio()" class="btn ${oState.audioPlaying ? 'btn-danger' : 'btn-primary'}" style="font-size:12.5px">
            ${oState.audioPlaying ? '⏹️ Dừng phát âm thanh' : '▶️ Bắt đầu Nghe Audio'}
          </button>
        </div>` : ''}
      </div>

      <!-- 4. Real Exam Paper Preview Sheet (Times New Roman 13pt) -->
      ${this.renderOfficialPaperSheet(suite, curG, curT, activeTab, parentAgency, schoolName, examYear)}
    </div>`;
  },

  renderOfficialPaperSheet(suite, grade, term, tab, parentAgency, schoolName, examYear) {
    if (!suite) {
      return `
      <div class="card p-24 text-center" style="color:#64748b">
        Đang tải bộ dữ liệu chuẩn của Thầy Đinh Văn Thành...
      </div>`;
    }

    const curSections = tab === 'exam2' ? suite.sections_code2 : suite.sections_code1;
    const curCode = tab === 'exam2' ? suite.code2 : suite.code1;
    const examTitle = `BÀI KIỂM TRA ĐÁNH GIÁ ${suite.termTitle}`;

    // TAB 1 & 2: Đề thi Mã 1 hoặc Mã 2
    if (tab === 'exam1' || tab === 'exam2') {
      let globalQNum = 1;
      return `
      <div class="exam-preview-wrap">
        <div class="exam-sheet" style="font-family:'Times New Roman',serif;font-size:13pt;line-height:1.25">
          <!-- 1. Header 2x2 -->
          <table style="width:100%;border:none;margin-bottom:6pt;font-family:'Times New Roman',serif">
            <tr>
              <td style="width:38%;text-align:center;vertical-align:top;border:none;line-height:1.2">
                <div style="font-size:11.5pt;font-weight:bold">${esc(parentAgency.toUpperCase())}</div>
                <div style="font-size:11.5pt;font-weight:bold;text-decoration:underline">${esc(schoolName.toUpperCase())}</div>
              </td>
              <td style="width:62%;text-align:center;vertical-align:top;border:none;line-height:1.25">
                <div style="font-size:12.5pt;font-weight:bold">${esc(examTitle.toUpperCase())}</div>
                <div style="font-size:11.5pt;font-weight:bold">NĂM HỌC: ${esc(examYear)}</div>
                <div style="font-size:12.5pt;font-weight:bold">Môn: Tiếng Anh ${grade}</div>
                <div style="font-size:11.5pt;font-style:italic">Thời gian làm bài: ${suite.timeMinutes} phút (không kể thời gian giao đề)</div>
              </td>
            </tr>
          </table>

          <!-- 2. Dòng Full name, Class, Mã đề -->
          <div style="font-size:13pt;margin:6pt 0 8pt 0;display:flex;justify-content:space-between;align-items:center">
            <span><b>Full name:</b> ____________________________________,</span>
            <span><b>Class:</b> ${grade}A1</span>
            <span><b style="color:#b91c1c;font-size:13pt">Mã đề: ${curCode}</b></span>
          </div>

          <!-- 3. Bảng Điểm Marks Table 4 cột -->
          <table style="width:100%;border-collapse:collapse;margin-bottom:12pt;font-family:'Times New Roman',serif;font-size:11.5pt">
            <tr style="text-align:center;font-weight:bold">
              <td colspan="2" style="border:1px solid #000;width:22%;padding:4px">Marks</td>
              <td rowspan="3" style="border:1px solid #000;width:14%;padding:4px;vertical-align:middle">Total</td>
              <td rowspan="3" style="border:1px solid #000;width:64%;padding:6px 12px;text-align:left;vertical-align:top">
                <div style="text-align:center;font-weight:bold;margin-bottom:6px">Teacher’s remarks</div>
                <div style="color:#000;font-size:11pt">____________________________________________________________________</div>
                <div style="color:#000;font-size:11pt;margin-top:6px">____________________________________________________________________</div>
              </td>
            </tr>
            <tr style="text-align:center;font-weight:bold">
              <td style="border:1px solid #000;width:11%;padding:3px">Speak</td>
              <td style="border:1px solid #000;width:11%;padding:3px">Write</td>
            </tr>
            <tr style="height:38px;text-align:center">
              <td style="border:1px solid #000">&nbsp;</td>
              <td style="border:1px solid #000">&nbsp;</td>
            </tr>
          </table>

          <!-- 4. Nội dung câu hỏi tuần tự -->
          ${curSections.map((sec, si) => {
            if (sec.type === 'speaking' || sec.scriptRows) {
              return `
              <div style="font-size:13pt;font-weight:bold;margin-top:14pt;margin-bottom:6pt;color:#1e3a8a">
                ${esc(sec.title || sec.name)}
              </div>
              <table style="width:100%;border-collapse:collapse;margin-top:6pt;font-size:11.5pt">
                <thead>
                  <tr style="background:#f1f5f9;text-align:center;font-weight:bold">
                    <th style="border:1px solid #000;padding:6px;width:15%">Phần thi (Task)</th>
                    <th style="border:1px solid #000;padding:6px;width:40%">Kịch bản Giám khảo (Examiner's Script)</th>
                    <th style="border:1px solid #000;padding:6px;width:30%">Câu trả lời mong đợi của HS</th>
                    <th style="border:1px solid #000;padding:6px;width:15%">Thang điểm</th>
                  </tr>
                </thead>
                <tbody>
                  ${(sec.scriptRows || []).map(r => `
                    <tr>
                      <td style="border:1px solid #000;padding:6px;font-weight:bold;vertical-align:top">${esc(r[0]).replace(/\n/g, '<br/>')}</td>
                      <td style="border:1px solid #000;padding:6px;vertical-align:top">${esc(r[1]).replace(/\n/g, '<br/>')}</td>
                      <td style="border:1px solid #000;padding:6px;vertical-align:top">${esc(r[2]).replace(/\n/g, '<br/>')}</td>
                      <td style="border:1px solid #000;padding:6px;vertical-align:top;font-size:10pt">${esc(r[3] || '').replace(/\n/g, '<br/>')}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>`;
            }

            return `
            <div style="font-size:13pt;font-weight:bold;margin-top:12pt;margin-bottom:4pt">
              ${esc(sec.title || sec.name)}: (${sec.questions.length} câu)
            </div>
            ${sec.passage ? `
            <div style="font-size:12.5pt;font-style:italic;background:#f8fafc;border:1px dashed #64748b;padding:10px 14px;margin-bottom:10px;line-height:1.4">
              ${formatExamText(sec.passage)}
            </div>` : ''}

            ${sec.questions.map(q => {
              const qNum = q.num || globalQNum++;
              if (q.type === 'essay') {
                return `
                <div style="font-size:13pt;margin-bottom:12pt;line-height:1.3">
                  <div><b>${qNum}.</b> ${formatExamText(q.content).replace(/\n/g, '<br/>')}</div>
                  <div style="margin-top:8pt;color:#000;font-size:12pt;line-height:2.0;letter-spacing:1px">
                    ...................................................................................................................................................................<br/>
                    ...................................................................................................................................................................<br/>
                    ...................................................................................................................................................................<br/>
                    ...................................................................................................................................................................<br/>
                    ...................................................................................................................................................................<br/>
                    ...................................................................................................................................................................<br/>
                    ...................................................................................................................................................................<br/>
                    ...................................................................................................................................................................<br/>
                    ...................................................................................................................................................................<br/>
                    ...................................................................................................................................................................
                  </div>
                </div>`;
              }

              let qOpts = q.options;
              if (!qOpts || !Array.isArray(qOpts) || qOpts.length === 0) {
                if (q.type === 'tf' || q.type !== 'essay') {
                  qOpts = ['A. True', 'B. False'];
                }
              }

              const maxLen = qOpts ? Math.max(...qOpts.map(o => o.length)) : 0;
              return `
              <div style="font-size:13pt;margin-bottom:8pt;line-height:1.25">
                <div><b>${qNum}.</b> ${formatExamText(q.content)}</div>
                ${qOpts ? (maxLen > 30 || qOpts.length > 3 ? `
                <div style="padding-left:16pt;margin-top:3pt">
                  ${qOpts.map(opt => `
                    <div style="margin:2pt 0;font-size:13pt">
                      <b>${esc(opt.charAt(0))}.</b> ${formatExamText(opt.slice(3) || opt)}
                    </div>
                  `).join('')}
                </div>` : `
                <table style="width:100%;border:none;margin-top:2pt">
                  <tr>
                    ${qOpts.map(opt => `
                      <td style="border:none;font-size:13pt;padding:1pt 4pt">
                        <b>${esc(opt.charAt(0))}.</b> ${formatExamText(opt.slice(3) || opt)}
                      </td>
                    `).join('')}
                  </tr>
                </table>`) : ''}
              </div>`;
            }).join('')}
            `;
          }).join('')}

          <div style="text-align:center;font-weight:bold;font-size:13pt;margin-top:18pt">
            ------The end------
          </div>

          <div style="margin-top:20pt;border-top:1pt solid #000;padding-top:8pt;font-size:10.5pt;display:flex;justify-content:space-between;color:#475569">
            <span>Bản quyền: <b>Thầy Đinh Văn Thành – Trường THCS Đồng Yên (0915.213717)</b></span>
            <span>EnglishExam Pro • Chuẩn SGK Global Success</span>
          </div>
        </div>
      </div>`;
    }

    // TAB 3: Đáp án 4 cột & Lời giải
    if (tab === 'solutions') {
      const answers = suite.answers_code1 || [];
      const answers2 = suite.answers_code2 || [];
      return `
      <div class="exam-preview-wrap">
        <div class="exam-sheet" style="font-family:'Times New Roman',serif;font-size:12.5pt;line-height:1.25">
          <div style="text-align:center;margin-bottom:14pt">
            <div style="font-size:12pt;font-weight:bold">${esc(parentAgency.toUpperCase())} - ${esc(schoolName.toUpperCase())}</div>
            <div style="font-size:14pt;font-weight:bold;color:#b91c1c;margin-top:4pt">
              HƯỚNG DẪN CHẤM, ĐÁP ÁN VÀ BIỂU ĐIỂM CHI TIẾT
            </div>
            <div style="font-size:12pt;font-style:italic">Môn: Tiếng Anh ${grade} • ${esc(suite.termTitle)} • Năm học ${esc(examYear)}</div>
          </div>

          <!-- 1. Audio Scripts -->
          ${suite.fullAudioScript ? `
          <div style="font-size:12.5pt;font-weight:bold;color:#0284c7;margin:10pt 0 6pt 0">
            I. NỘI DUNG BÀI NGHE (AUDIO SCRIPTS - DÙNG CHO CẢ 2 MÃ ĐỀ)
          </div>
          <div style="border:1.5px dashed #0284c7;background:#f8fafc;padding:12px 16px;border-radius:8px;font-size:11.5pt;line-height:1.5;white-space:pre-wrap;margin-bottom:16pt">
${esc(suite.fullAudioScript)}
          </div>` : ''}

          <!-- 2. Bảng Đáp Án TNKQ Đối Chiếu 4 Cột 18 Hàng -->
          <div style="font-size:13pt;font-weight:bold;margin-bottom:6pt;color:#1e3a8a">
            II. BẢNG ĐÁP ÁN TRẮC NGHIỆM ĐỐI CHIẾU 2 MÃ ĐỀ (${suite.hasSpeaking ? '7.2 điểm' : '8.5 điểm'})
          </div>
          <div style="font-size:10.5pt;font-style:italic;color:#64748b;margin-bottom:6pt">
            * Bảng đối chiếu 4 cột gồm 18 hàng so sánh trực diện Mã đề ${esc(suite.code1)} và Mã đề ${esc(suite.code2)}
          </div>
          <table style="width:100%;border-collapse:collapse;font-size:11pt;margin-bottom:16pt">
            <thead>
              <tr style="background:#e8eef5;text-align:center;font-weight:bold">
                <th style="border:1px solid #000;padding:6px;width:12%">Câu</th>
                <th style="border:1px solid #000;padding:6px;width:38%;color:#1e3a8a">Đáp án MÃ ĐỀ ${esc(suite.code1)}</th>
                <th style="border:1px solid #000;padding:6px;width:12%">Câu</th>
                <th style="border:1px solid #000;padding:6px;width:38%;color:#b91c1c">Đáp án MÃ ĐỀ ${esc(suite.code2)}</th>
              </tr>
            </thead>
            <tbody>
              ${(() => {
                let rHtml = '';
                for (let i = 0; i < 18; i++) {
                  rHtml += `
                  <tr>
                    <td style="border:1px solid #000;text-align:center;font-weight:bold;padding:5px">${i + 1}</td>
                    <td style="border:1px solid #000;text-align:center;font-weight:bold;color:#1e3a8a;padding:5px">${esc(answers[i] || '')}</td>
                    <td style="border:1px solid #000;text-align:center;font-weight:bold;padding:5px">${i + 19}</td>
                    <td style="border:1px solid #000;text-align:center;font-weight:bold;color:#b91c1c;padding:5px">${esc(answers2[i + 18] || answers[i + 18] || '')}</td>
                  </tr>`;
                }
                return rHtml;
              })()}
            </tbody>
          </table>

          <!-- 3. Hướng Dẫn Chấm Writing -->
          <div style="font-size:13pt;font-weight:bold;margin-top:14pt;margin-bottom:6pt;color:#1e3a8a">
            III. HƯỚNG DẪN CHẤM BÀI VIẾT ĐOẠN VĂN (PARAGRAPH WRITING: ${suite.hasSpeaking ? '0.8' : '1.5'} ĐIỂM)
          </div>
          <div style="background:#f8fafc;border:1px solid #cbd5e1;padding:12px 16px;border-radius:8px;font-size:11.5pt;line-height:1.5;white-space:pre-wrap;margin-bottom:12pt">
            <b>1. Tiêu chí chấm điểm (Rubric):</b>\n${esc(suite.writingRubric)}
          </div>
          <div style="background:#eff6ff;border:1px solid #bfdbfe;padding:12px 16px;border-radius:8px;font-size:11.5pt;line-height:1.5;margin-bottom:16pt">
            <b>2. Bài viết mẫu tham khảo (Sample Writing):</b><br/>
            ${esc(suite.sampleWritingText)}
          </div>

          <!-- 4. Kịch bản thi nói Speaking Test (nếu có) -->
          ${(suite.hasSpeaking && suite.speakingScriptRows && suite.speakingScriptRows.length) ? `
          <div style="font-size:13pt;font-weight:bold;color:#7c3aed;margin:14pt 0 6pt 0">
            IV. KỊCH BẢN KHẢO THÍ BÀI THI NÓI (SPEAKING TEST - 2.0 ĐIỂM)
          </div>
          <div style="overflow-x:auto;margin-bottom:16pt">
            <table style="width:100%;border-collapse:collapse;font-size:10.5pt">
              <thead>
                <tr style="background:#ede9fe;text-align:center;font-weight:bold">
                  <th style="border:1px solid #000;padding:6px;width:15%">Phần thi (Task)</th>
                  <th style="border:1px solid #000;padding:6px;width:40%">Kịch bản Giám khảo (Examiner's Script)</th>
                  <th style="border:1px solid #000;padding:6px;width:30%">Câu trả lời mong đợi của HS</th>
                  <th style="border:1px solid #000;padding:6px;width:15%">Thang điểm & Gợi ý</th>
                </tr>
              </thead>
              <tbody>
                ${suite.speakingScriptRows.map(r => `
                  <tr>
                    <td style="border:1px solid #000;padding:6px;font-weight:bold;vertical-align:top">${esc(r[0]).replace(/\n/g, '<br/>')}</td>
                    <td style="border:1px solid #000;padding:6px;vertical-align:top">${esc(r[1]).replace(/\n/g, '<br/>')}</td>
                    <td style="border:1px solid #000;padding:6px;vertical-align:top">${esc(r[2]).replace(/\n/g, '<br/>')}</td>
                    <td style="border:1px solid #000;padding:6px;vertical-align:top">${esc(r[3] || '').replace(/\n/g, '<br/>')}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>` : ''}

          <!-- 5. Tóm tắt biểu điểm tổng -->
          <div style="font-size:12.5pt;font-weight:bold;color:#15803d;margin-top:12pt">
            ${esc(suite.finalScoreSummary)}
          </div>
        </div>
      </div>`;
    }

    // TAB 4: Ma trận & Bản đặc tả CV 7991
    if (tab === 'matrix') {
      return `
      <div class="exam-preview-wrap">
        <div class="exam-sheet" style="font-family:'Times New Roman',serif;font-size:11.5pt;line-height:1.2">
          <div style="text-align:center;margin-bottom:14pt">
            <div style="font-size:11.5pt;font-weight:bold">${esc(parentAgency.toUpperCase())} - ${esc(schoolName.toUpperCase())}</div>
            <div style="font-size:14pt;font-weight:bold;color:#1e3a8a;margin-top:3pt">
              MA TRẬN ĐỀ KIỂM TRA ĐÁNH GIÁ ${suite.termTitle.toUpperCase()} – NĂM HỌC ${esc(examYear)}
            </div>
            <div style="font-size:11pt;font-style:italic;color:#64748b">Môn: TIẾNG ANH ${grade} (GLOBAL SUCCESS) - THỜI GIAN LÀM BÀI: ${suite.timeMinutes || 60} PHÚT</div>
            <div style="font-size:10.5pt;font-style:italic;color:#64748b">${esc(suite.matrixSubtitle)}</div>
          </div>

          <!-- Bảng 1: Ma trận 15 cột chuẩn CV 7991 -->
          <div style="overflow-x:auto;margin-bottom:24px">
            <table style="width:100%;border-collapse:collapse;font-size:9.5pt;min-width:900px">
              <thead>
                <tr style="background:#e8eef5;font-weight:bold;text-align:center">
                  <th rowspan="2" style="border:1px solid #000;padding:6px 4px;width:4%">TT</th>
                  <th rowspan="2" style="border:1px solid #000;padding:6px 4px;width:15%">Chủ đề / Kĩ năng</th>
                  <th rowspan="2" style="border:1px solid #000;padding:6px 4px;width:21%">Nội dung / Đơn vị kiến thức</th>
                  <th colspan="3" style="border:1px solid #000;padding:6px 4px">TNKQ nhiều lựa chọn</th>
                  <th colspan="3" style="border:1px solid #000;padding:6px 4px">TNKQ Đúng/Sai</th>
                  <th colspan="3" style="border:1px solid #000;padding:6px 4px">Tự luận</th>
                  <th colspan="3" style="border:1px solid #000;padding:6px 4px">Tổng</th>
                </tr>
                <tr style="background:#e8eef5;font-weight:bold;text-align:center">
                  <th style="border:1px solid #000;padding:4px 2px;width:4.5%">Biết</th>
                  <th style="border:1px solid #000;padding:4px 2px;width:4.5%">Hiểu</th>
                  <th style="border:1px solid #000;padding:4px 2px;width:4.5%">VD</th>
                  <th style="border:1px solid #000;padding:4px 2px;width:4.5%">Biết</th>
                  <th style="border:1px solid #000;padding:4px 2px;width:4.5%">Hiểu</th>
                  <th style="border:1px solid #000;padding:4px 2px;width:4.5%">VD</th>
                  <th style="border:1px solid #000;padding:4px 2px;width:4.5%">Biết</th>
                  <th style="border:1px solid #000;padding:4px 2px;width:4.5%">Hiểu</th>
                  <th style="border:1px solid #000;padding:4px 2px;width:4.5%">VD</th>
                  <th style="border:1px solid #000;padding:4px 2px;width:5%">Biết</th>
                  <th style="border:1px solid #000;padding:4px 2px;width:5%">Hiểu</th>
                  <th style="border:1px solid #000;padding:4px 2px;width:5%">VD</th>
                </tr>
              </thead>
              <tbody>
                ${(suite.matrixRows || []).map(r => {
                  const isTotal = (r[0] || '').startsWith('TỔNG');
                  return `
                  <tr style="${isTotal ? 'background:#f4f6f9;font-weight:bold' : ''}">
                    ${r.map((val, ci) => `
                      <td style="border:1px solid #000;padding:5px 4px;text-align:${ci === 1 || ci === 2 ? 'left' : 'center'};${isTotal ? 'font-weight:bold' : ''}">
                        ${esc(val || '').replace(/\n/g, '<br/>')}
                      </td>
                    `).join('')}
                  </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>

          <!-- Bảng 2: Bản đặc tả 7 cột chuẩn CV 7991 -->
          <div style="text-align:center;margin:20px 0 12px 0">
            <div style="font-size:13.5pt;font-weight:bold;color:#1e3a8a">
              BẢN ĐẶC TẢ KỸ THUẬT ĐỀ KIỂM TRA ${suite.termTitle.toUpperCase()} - TIẾNG ANH ${grade}
            </div>
            <div style="font-size:10.5pt;font-style:italic;color:#64748b">${esc(suite.specSubtitle)}</div>
          </div>
          <div style="overflow-x:auto">
            <table style="width:100%;border-collapse:collapse;font-size:9.5pt;min-width:900px">
              <thead>
                <tr style="background:#e8eef5;font-weight:bold;text-align:center">
                  <th style="border:1px solid #000;padding:6px 4px;width:4%">TT</th>
                  <th style="border:1px solid #000;padding:6px 6px;width:15%">Chủ đề / Kĩ năng</th>
                  <th style="border:1px solid #000;padding:6px 6px;width:18%">Đơn vị kiến thức</th>
                  <th style="border:1px solid #000;padding:6px 8px;width:37%">Yêu cầu cần đạt</th>
                  <th style="border:1px solid #000;padding:6px 4px;width:8.5%">TNKQ (MCQs)</th>
                  <th style="border:1px solid #000;padding:6px 4px;width:8.5%">TNKQ (Đúng/Sai)</th>
                  <th style="border:1px solid #000;padding:6px 4px;width:9%">Tự luận</th>
                </tr>
              </thead>
              <tbody>
                ${(suite.specRows || []).map(r => `
                  <tr>
                    ${r.map((val, ci) => `
                      <td style="border:1px solid #000;padding:5px 6px;text-align:${ci === 0 || ci >= 4 ? 'center' : 'left'}">
                        ${esc(val || '').replace(/\n/g, '<br/>')}
                      </td>
                    `).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>`;
    }


    // TAB 5: Audio Scripts
    if (tab === 'audio') {
      return `
      <div class="exam-preview-wrap">
        <div class="exam-sheet" style="font-family:'Times New Roman',serif;font-size:13pt;line-height:1.4">
          <div style="text-align:center;margin-bottom:16pt">
            <div style="font-size:12pt;font-weight:bold">${esc(parentAgency.toUpperCase())} - ${esc(schoolName.toUpperCase())}</div>
            <div style="font-size:14pt;font-weight:bold;color:#1e3a8a;margin-top:4pt">
              NỘI DUNG BÀI NGHE (AUDIO SCRIPTS - DÙNG CHO CẢ 2 MÃ ĐỀ)
            </div>
            <div style="font-size:12pt;font-style:italic">Môn: Tiếng Anh ${grade} • ${esc(suite.termTitle)} • Năm học ${esc(examYear)}</div>
          </div>

          <div style="border:2px dashed #0284c7;background:#f8fafc;padding:16px 20px;border-radius:10px;font-size:12.5pt;line-height:1.6;white-space:pre-wrap">
${esc(suite.fullAudioScript)}
          </div>
        </div>
      </div>`;
    }

    // TAB 6: Speaking Test (nếu có)
    if (tab === 'speaking' && suite.speakingScriptRows) {
      return `
      <div class="exam-preview-wrap">
        <div class="exam-sheet" style="font-family:'Times New Roman',serif;font-size:13pt;line-height:1.3">
          <div style="text-align:center;margin-bottom:16pt">
            <div style="font-size:12pt;font-weight:bold">${esc(parentAgency.toUpperCase())} - ${esc(schoolName.toUpperCase())}</div>
            <div style="font-size:14pt;font-weight:bold;color:#7c3aed;margin-top:4pt">
              BÀI THI NÓI (SPEAKING TEST) - THANG ĐIỂM: 2.0 ĐIỂM
            </div>
            <div style="font-size:12pt;font-style:italic">Kịch bản Giám khảo khảo thí chuẩn GDPT 2018 Tiếng Anh ${grade}</div>
          </div>

          <table style="width:100%;border-collapse:collapse;font-size:11.5pt">
            <thead>
              <tr style="background:#ede9fe;text-align:center;font-weight:bold">
                <th style="border:1px solid #000;padding:6px;width:15%">Phần thi (Task)</th>
                <th style="border:1px solid #000;padding:6px;width:40%">Kịch bản Giám khảo (Teacher's Script)</th>
                <th style="border:1px solid #000;padding:6px;width:30%">Câu trả lời mong đợi của HS</th>
                <th style="border:1px solid #000;padding:6px;width:15%">Gợi ý nâng đỡ & Điểm</th>
              </tr>
            </thead>
            <tbody>
              ${suite.speakingScriptRows.map(r => `
                <tr>
                  <td style="border:1px solid #000;padding:6px;font-weight:bold;vertical-align:top">${esc(r[0]).replace(/\n/g, '<br/>')}</td>
                  <td style="border:1px solid #000;padding:6px;vertical-align:top">${esc(r[1]).replace(/\n/g, '<br/>')}</td>
                  <td style="border:1px solid #000;padding:6px;vertical-align:top">${esc(r[2]).replace(/\n/g, '<br/>')}</td>
                  <td style="border:1px solid #000;padding:6px;vertical-align:top;font-size:10pt">${esc(r[3] || '').replace(/\n/g, '<br/>')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>`;
    }

    return '';
  },

  selectOfficialGrade(grade) {
    this.state.officialExams.grade = String(grade);
    this.renderPage();
  },

  selectOfficialTerm(term) {
    this.state.officialExams.term = term;
    this.renderPage();
  },

  setOfficialTab(tab) {
    this.state.officialExams.activeTab = tab;
    this.renderPage();
  },

  saveOfficialSchoolConfig() {
    const p = document.getElementById('cfgOfficialParent')?.value.trim().toUpperCase() || 'UBND XÃ ĐỒNG YÊN';
    const s = document.getElementById('cfgOfficialSchool')?.value.trim().toUpperCase() || 'TRƯỜNG THCS ĐỒNG YÊN';

    this.state.officialExams.parent = p;
    this.state.officialExams.school = s;
    localStorage.setItem('cfg_parent_agency', p);
    localStorage.setItem('cfg_school_name', s);
    UI.toast(`Đã lưu cấu hình trường: ${s}`, 'success');
    this.renderPage();
  },

  toggleOfficialAudio() {
    const oState = this.state.officialExams;
    const curG = oState.grade || '7';
    const curT = oState.term || 'GK1';
    const suite = this.getOfficialExamSuite(curG, curT);
    if (!suite) return;

    if (oState.audioPlaying) {
      AudioEngine.stop();
      oState.audioPlaying = false;
      this.renderPage();
    } else {
      AudioEngine.playScript(suite.fullAudioScript, 0.88, () => {
        oState.audioPlaying = false;
        this.renderPage();
      });
      oState.audioPlaying = true;
      this.renderPage();
    }
  },

  exportOfficialCustomWord(codeIndex = 1) {
    const oState = this.state.officialExams;
    const curG = oState.grade || '7';
    const curT = oState.term || 'GK1';
    const suite = this.getOfficialExamSuite(curG, curT);
    if (!suite) {
      UI.toast('Chưa có dữ liệu đề chuẩn!', 'warn');
      return;
    }

    const sections = codeIndex === 2 ? suite.sections_code2 : suite.sections_code1;
    const code = codeIndex === 2 ? suite.code2 : suite.code1;
    const title = `BÀI KIỂM TRA ĐÁNH GIÁ ${suite.termTitle}`;

    const html = this.generateDocHtml(sections, title, code, false);
    const blob = new Blob(['\ufeff' + html], { type: 'application/msword;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${curT}_Anh_${curG}_Ma_${code}.doc`;
    link.click();
    UI.toast(`📥 Đã xuất file Word Mã ${code} (.doc)!`, 'success');
  },

  exportOfficialMatrixAndSpecWord() {
    const oState = this.state.officialExams;
    const curG = oState.grade || '7';
    const curT = oState.term || 'GK1';
    const suite = this.getOfficialExamSuite(curG, curT);
    if (!suite) return;

    const parentAgency = (localStorage.getItem('cfg_parent_agency') || 'UBND XÃ ĐỒNG YÊN').toUpperCase();
    const schoolName = (localStorage.getItem('cfg_school_name') || 'TRƯỜNG THCS ĐỒNG YÊN').toUpperCase();
    const examYear = localStorage.getItem('cfg_school_year') || '2026 - 2027';
    const titleUpper = `BÀI KIỂM TRA ĐÁNH GIÁ ${suite.termTitle}`.toUpperCase();

    const part1Html = this.buildMatrixWordHtml({
      parentAgency, schoolName, examYear, titleUpper, grade: curG,
      timeMinutes: suite.timeMinutes || 60,
      subtitle: suite.matrixSubtitle || '',
      matrixRows: suite.matrixRows || []
    });

    const part2Html = this.buildSpecWordHtml({
      titleUpper, grade: curG,
      subtitle: suite.specSubtitle || '',
      specRows: suite.specRows || []
    });

    const pageBreak = '<br clear="all" style="page-break-before:always;mso-break-type:page-break"/>';
    const fullHtml = this.wrapDocHtml([part1Html, part2Html].join(pageBreak), `${curT} - Anh ${curG} Ma Tran va Ban Dac Ta`);

    const blob = new Blob(['\ufeff' + fullHtml], { type: 'application/msword;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${curT}_Anh_${curG}_Ma_Tran_Va_Ban_Dac_Ta_7991.doc`;
    link.click();
    UI.toast(`📊 Đã xuất Ma trận 15 cột & Bản đặc tả 7 cột (.doc)!`, 'success');
  },

  exportOfficialAnswerKeyWord() {
    const oState = this.state.officialExams;
    const curG = oState.grade || '7';
    const curT = oState.term || 'GK1';
    const suite = this.getOfficialExamSuite(curG, curT);
    if (!suite) return;

    const parentAgency = (localStorage.getItem('cfg_parent_agency') || 'UBND XÃ ĐỒNG YÊN').toUpperCase();
    const schoolName = (localStorage.getItem('cfg_school_name') || 'TRƯỜNG THCS ĐỒNG YÊN').toUpperCase();
    const examYear = localStorage.getItem('cfg_school_year') || '2026 - 2027';
    const titleUpper = `BÀI KIỂM TRA ĐÁNH GIÁ ${suite.termTitle}`.toUpperCase();

    const ans1 = (suite.answers_code1 || []).map((ans, idx) => ({ num: idx + 1, ans }));
    const ans2 = (suite.answers_code2 || []).map((ans, idx) => ({ num: idx + 1, ans }));

    const ansHtml = this.buildAnswerKeyWordHtml({
      parentAgency, schoolName, examYear, titleUpper, grade: curG,
      code1: suite.code1, code2: suite.code2,
      audioScript: suite.fullAudioScript || '',
      ans1, ans2, mcqTotalPts: suite.hasSpeaking ? '7.2' : '8.5',
      part8Points: suite.hasSpeaking ? '0.8 điểm' : '1.5 điểm',
      rubric: suite.writingRubric || '',
      sampleWritingText: suite.sampleWritingText || '',
      hasSpeaking: suite.hasSpeaking,
      speakingScriptRows: suite.speakingScriptRows || [],
      finalScoreSummary: suite.finalScoreSummary || '',
      teacher: 'Thầy Đinh Văn Thành'
    });

    const fullHtml = this.wrapDocHtml(ansHtml, `${curT} - Anh ${curG} Dap An va Huong Dan Cham`);
    const blob = new Blob(['\ufeff' + fullHtml], { type: 'application/msword;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${curT}_Anh_${curG}_Dap_An_Va_Huong_Dan_Cham_${suite.code1}_${suite.code2}.doc`;
    link.click();
    UI.toast(`👩‍🏫 Đã xuất Đáp án & Hướng dẫn chấm (.doc)!`, 'success');
  },

  exportOfficialFullBundleWord() {
    const oState = this.state.officialExams;
    const curG = oState.grade || '7';
    const curT = oState.term || 'GK1';
    const suite = this.getOfficialExamSuite(curG, curT);
    if (!suite) return;

    const parentAgency = (localStorage.getItem('cfg_parent_agency') || 'UBND XÃ ĐỒNG YÊN').toUpperCase();
    const schoolName = (localStorage.getItem('cfg_school_name') || 'TRƯỜNG THCS ĐỒNG YÊN').toUpperCase();
    const examYear = localStorage.getItem('cfg_school_year') || '2026 - 2027';
    const titleUpper = `BÀI KIỂM TRA ĐÁNH GIÁ ${suite.termTitle}`.toUpperCase();

    // 1. Ma trận 15 cột
    const part1Html = this.buildMatrixWordHtml({
      parentAgency, schoolName, examYear, titleUpper, grade: curG,
      timeMinutes: suite.timeMinutes || 60,
      subtitle: suite.matrixSubtitle || '',
      matrixRows: suite.matrixRows || []
    });

    // 2. Bản đặc tả 7 cột
    const part2Html = this.buildSpecWordHtml({
      titleUpper, grade: curG,
      subtitle: suite.specSubtitle || '',
      specRows: suite.specRows || []
    });

    // 3. Đề thi Mã 1
    const part3Html = this.buildExamWordContentHtml({
      sections: suite.sections_code1, titleUpper, code: suite.code1, schoolYear: examYear,
      parentAgency, schoolName, grade: curG, examClass: curG + 'A1',
      timeMinutes: suite.timeMinutes || 60
    });

    // 4. Đề thi Mã 2
    const part4Html = this.buildExamWordContentHtml({
      sections: suite.sections_code2, titleUpper, code: suite.code2, schoolYear: examYear,
      parentAgency, schoolName, grade: curG, examClass: curG + 'A1',
      timeMinutes: suite.timeMinutes || 60
    });

    // 5. Hướng dẫn chấm & biểu điểm
    const ans1 = (suite.answers_code1 || []).map((ans, idx) => ({ num: idx + 1, ans }));
    const ans2 = (suite.answers_code2 || []).map((ans, idx) => ({ num: idx + 1, ans }));
    const part5Html = this.buildAnswerKeyWordHtml({
      parentAgency, schoolName, examYear, titleUpper, grade: curG,
      code1: suite.code1, code2: suite.code2,
      audioScript: suite.fullAudioScript || '',
      ans1, ans2, mcqTotalPts: suite.hasSpeaking ? '7.2' : '8.5',
      part8Points: suite.hasSpeaking ? '0.8 điểm' : '1.5 điểm',
      rubric: suite.writingRubric || '',
      sampleWritingText: suite.sampleWritingText || '',
      hasSpeaking: suite.hasSpeaking,
      speakingScriptRows: suite.speakingScriptRows || [],
      finalScoreSummary: suite.finalScoreSummary || '',
      teacher: 'Thầy Đinh Văn Thành'
    });

    const pageBreak = '<br clear="all" style="page-break-before:always;mso-break-type:page-break"/>';
    const fullHtml = this.wrapDocHtml([part1Html, part2Html, part3Html, part4Html, part5Html].join(pageBreak), `${curT} - Anh ${curG} Tron Bo 5 Phan Chuan CV7991`);

    const blob = new Blob(['\ufeff' + fullHtml], { type: 'application/msword;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${curT}_Anh_${curG}_Tron_Bo_5_Phan_Chuan_CV7991_${suite.code1}_${suite.code2}.doc`;
    link.click();
    UI.toast(`📦 Đã xuất trọn bộ 5 phần chuẩn CV 7991 (.doc)!`, 'success');
  },

  assignOfficialExamOnline() {
    const oState = this.state.officialExams;
    const curG = oState.grade || '7';
    const curT = oState.term || 'GK1';
    const suite = this.getOfficialExamSuite(curG, curT);
    if (!suite) {
      UI.toast('Đang tải dữ liệu bộ đề, vui lòng thử lại sau giây lát!', 'warn');
      return;
    }

    const examId = `official-${curG}-${curT.toLowerCase()}-${Date.now()}`;
    const clonedSections = JSON.parse(JSON.stringify(suite.sections_code1 || []));
    let qCount = 0;
    clonedSections.forEach((sec, sIdx) => {
      (sec.questions || []).forEach((q, qIdx) => {
        qCount++;
        q.id = `q_${curG}_${curT.toLowerCase()}_s${sIdx + 1}_${qCount}`;
      });
    });

    const examRecord = {
      id: examId,
      title: `BÀI KIỂM TRA ĐÁNH GIÁ ${suite.termTitle} – TIẾNG ANH ${curG} GLOBAL SUCCESS`,
      grade: parseInt(curG),
      subject: 'english',
      examFormat: 'cv7991',
      examTime: suite.timeMinutes || 60,
      examClass: curG + 'A1',
      schoolName: oState.school || 'TRƯỜNG THCS ĐỒNG YÊN',
      teacherName: 'Thầy Đinh Văn Thành',
      audioTitle: `Audio Script Tiếng Anh ${curG} (${suite.termTitle})`,
      audioScript: suite.fullAudioScript,
      sections: clonedSections,
      isOpen: true,
      publishedAt: new Date().toISOString()
    };

    Auth.publishExam(examRecord);
    Auth.saveExamRecord({
      id: examId,
      userId: this.state.user ? this.state.user.id : 'teacher-1',
      title: examRecord.title,
      grade: parseInt(curG),
      subject: 'english',
      examType: curT,
      questionCount: 37,
      createdAt: new Date().toISOString()
    });

    const url = `${window.location.origin}${window.location.pathname}?mode=student&examId=${examId}`;
    const bodyHtml = `
      <div class="stack gap-16">
        <div style="background:#eff6ff;padding:12px 16px;border-radius:10px;border-left:4px solid #2563eb">
          <strong style="color:#1e40af;font-size:14px">✅ Đã kích hoạt phòng thi trực tuyến cho Học sinh!</strong>
          <p style="font-size:12.5px;color:#334155;margin-top:4px">Đề thi: <b>${examRecord.title}</b> (36 câu TNKQ + 1 câu Viết tự luận, ${examRecord.examTime} phút).</p>
        </div>
        <div style="font-size:13px;color:var(--ink-soft)">
          Gửi link dưới đây cho học sinh làm bài trực tiếp trên điện thoại:
        </div>
        <div class="input-group">
          <input type="text" id="share-link-input" value="${url}" readonly style="font-weight:700;font-size:13px;color:#2563eb" />
          <button class="btn btn-primary" onclick="navigator.clipboard.writeText('${url}');UI.toast('Đã sao chép link!','success')">📋 Copy</button>
        </div>
        <div class="row gap-8" style="margin-top:8px">
          <button class="btn btn-success" onclick="window.open('${url}','_blank')">
            📱 Làm thử trên giao diện Học sinh
          </button>
          <button class="btn btn-outline" onclick="App.navigate('submissions'); UI.closeModal();">
            📥 Xem Bảng Thu bài & Chấm điểm
          </button>
        </div>
      </div>
    `;

    UI.showModal('🚀 Giao Đề Thi Trực Tuyến Thành Công', bodyHtml, [
      { label: 'Đóng', cls: 'btn-outline', action: () => UI.closeModal() }
    ]);
  },

  showAssignExamModal(preselectedExam = null) {
    const curG = (this.state.officialExams && this.state.officialExams.grade) || '7';
    const curT = (this.state.officialExams && this.state.officialExams.term) || 'GK1';
    const classrooms = (typeof Auth !== 'undefined' && Auth.getClassrooms) ? Auth.getClassrooms() : [];

    UI.showModal('🚀 Giao Bài Thi Trực Tuyến Cho Lớp Học', `
      <div class="stack gap-16">
        <div style="background:#eff6ff;padding:12px 16px;border-radius:10px;border-left:4px solid #2563eb">
          <div style="font-size:14px;font-weight:800;color:#1e40af">Học sinh làm trực tiếp trên điện thoại & Tự động chấm điểm</div>
          <div style="font-size:12.5px;color:#334155;margin-top:3px">Bám sát chuẩn SGK Global Success 6 - 9 · Chuẩn CV 7991 Thầy Đinh Văn Thành</div>
        </div>

        <div style="background:#f0fdf4;padding:10px 14px;border-radius:10px;border:1px solid #86efac;font-size:12.5px;color:#166534;display:flex;align-items:center;gap:10px">
          <span style="font-size:22px">🎲</span>
          <div>
            <b>Động cơ Tổ hợp > 10²⁸ biến thể:</b> Mỗi lần giao bài sẽ tự động bốc đề độc bản, câu hỏi được chọn ngẫu nhiên từ kho 48 Units & ngân hàng câu hỏi chuẩn, không trùng lặp!
          </div>
        </div>

        <div class="grid grid-2 gap-12">
          <div class="field">
            <label class="label">1. Chọn Khối lớp</label>
            <select id="modal-assign-grade" class="select">
              <option value="6" ${curG === '6' ? 'selected' : ''}>Khối 6 (Global Success 6)</option>
              <option value="7" ${curG === '7' ? 'selected' : ''}>Khối 7 (Global Success 7)</option>
              <option value="8" ${curG === '8' ? 'selected' : ''}>Khối 8 (Global Success 8)</option>
              <option value="9" ${curG === '9' ? 'selected' : ''}>Khối 9 (Global Success 9)</option>
            </select>
          </div>

          <div class="field">
            <label class="label">2. Kỳ kiểm tra / Dạng bài</label>
            <select id="modal-assign-term" class="select">
              <option value="GK1" ${curT === 'GK1' ? 'selected' : ''}>Giữa Học kỳ 1 (GK1 - 10đ Viết)</option>
              <option value="CK1" ${curT === 'CK1' ? 'selected' : ''}>Cuối Học kỳ 1 (CK1 - 8đ Viết + 2đ Nói)</option>
              <option value="GK2" ${curT === 'GK2' ? 'selected' : ''}>Giữa Học kỳ 2 (GK2 - 10đ Viết)</option>
              <option value="CK2" ${curT === 'CK2' ? 'selected' : ''}>Cuối Học kỳ 2 (CK2 - 8đ Viết + 2đ Nói)</option>
              <option value="KSCL" ${curT === 'KSCL' ? 'selected' : ''}>Khảo sát chất lượng đầu năm (10đ)</option>
              <option value="15M">Đề 15 phút (20 câu trắc nghiệm)</option>
            </select>
          </div>
        </div>

        <div class="grid grid-2 gap-12">
          <div class="field">
            <label class="label">3. Giao cho Lớp học</label>
            <select id="modal-assign-class" class="select">
              <option value="all">Tất cả học sinh khối</option>
              ${classrooms.map(c => `<option value="${c.name || c.id}">${c.name || c.id} (${c.grade ? ('Khối ' + c.grade) : ''})</option>`).join('')}
              <option value="6A1">Lớp 6A1</option>
              <option value="6A2">Lớp 6A2</option>
              <option value="7A1" selected>Lớp 7A1</option>
              <option value="7A2">Lớp 7A2</option>
              <option value="8A1">Lớp 8A1</option>
              <option value="8A2">Lớp 8A2</option>
              <option value="9A1">Lớp 9A1</option>
              <option value="9A2">Lớp 9A2</option>
            </select>
          </div>

          <div class="field">
            <label class="label">4. Thời gian làm bài</label>
            <select id="modal-assign-time" class="select">
              <option value="60" selected>60 Phút (Chuẩn bài thi định kỳ)</option>
              <option value="45">45 Phút (1 tiết học)</option>
              <option value="90">90 Phút</option>
              <option value="15">15 Phút</option>
            </select>
          </div>
        </div>

        <div id="modal-assign-result-box" style="display:none"></div>
      </div>
    `, [
      {
        label: '🚀 Sinh Đề Độc Bản & Giao Bài Ngay',
        cls: 'btn-primary',
        action: () => App.executeAssignExam()
      },
      {
        label: 'Đóng',
        cls: 'btn-outline',
        action: () => UI.closeModal()
      }
    ]);
  },

  executeAssignExam() {
    const grade = document.getElementById('modal-assign-grade')?.value || '7';
    const term = document.getElementById('modal-assign-term')?.value || 'GK1';
    const targetClass = document.getElementById('modal-assign-class')?.value || '7A1';
    const examTime = parseInt(document.getElementById('modal-assign-time')?.value || '60');

    let examId = '';
    let examTitle = '';
    let sections = [];
    let audioScript = '';

    if (term === '15M') {
      examId = `15m-g${grade}-u1-${Date.now()}`;
      examTitle = `ĐỀ KIỂM TRA 15 PHÚT TIẾNG ANH ${grade} GLOBAL SUCCESS`;
    } else {
      let synthExam = null;
      if (typeof ExamGeneratorEngine !== 'undefined') {
        try {
          synthExam = ExamGeneratorEngine.generateUniqueExam(parseInt(grade), term, {
            schoolName: localStorage.getItem('cfg_school_name') || 'TRƯỜNG THCS ĐỒNG YÊN',
            teacherName: 'Thầy Đinh Văn Thành'
          });
        } catch (e) {
          console.warn('Assign synthesis note:', e);
        }
      }

      if (synthExam) {
        examId = synthExam.id;
        examTitle = `BÀI KIỂM TRA ĐÁNH GIÁ ${synthExam.termTitle} – TIẾNG ANH ${grade} GLOBAL SUCCESS (Mã ${synthExam.code1})`;
        sections = synthExam.sections_code1;
        audioScript = synthExam.audioScript || '';
      } else {
        const suite = this.getOfficialExamSuite(grade, term);
        if (suite) {
          examId = `official-${grade}-${term.toLowerCase()}-${Date.now()}`;
          examTitle = `BÀI KIỂM TRA ĐÁNH GIÁ ${suite.termTitle} – TIẾNG ANH ${grade} GLOBAL SUCCESS`;
          sections = JSON.parse(JSON.stringify(suite.sections_code1 || []));
          let qCount = 0;
          sections.forEach((sec, sIdx) => {
            (sec.questions || []).forEach((q, qIdx) => {
              qCount++;
              q.id = `q_${grade}_${term.toLowerCase()}_s${sIdx + 1}_${qCount}`;
            });
          });
          audioScript = suite.fullAudioScript || '';
        } else {
          examId = `exam-${grade}-${Date.now()}`;
          examTitle = `BÀI KIỂM TRA TIẾNG ANH ${grade} GLOBAL SUCCESS`;
        }
      }
    }

    const examRecord = {
      id: examId,
      title: examTitle,
      grade: parseInt(grade),
      subject: 'english',
      examFormat: 'cv7991',
      examTime: examTime,
      examClass: targetClass,
      schoolName: localStorage.getItem('cfg_school_name') || 'TRƯỜNG THCS ĐỒNG YÊN',
      teacherName: 'Thầy Đinh Văn Thành',
      audioTitle: `Audio Script Tiếng Anh ${grade}`,
      audioScript: audioScript,
      sections: sections,
      isOpen: true,
      publishedAt: new Date().toISOString()
    };

    if (typeof Auth !== 'undefined') {
      Auth.publishExam(examRecord);
      Auth.saveExamRecord({
        id: examId,
        userId: (this.state.user ? this.state.user.id : 'teacher-1'),
        title: examTitle,
        grade: parseInt(grade),
        subject: 'english',
        examType: term,
        questionCount: sections.length > 0 ? 37 : 20,
        createdAt: new Date().toISOString()
      });
    }

    const url = `${window.location.origin}${window.location.pathname}?mode=student&examId=${examId}`;

    const resBox = document.getElementById('modal-assign-result-box');
    if (resBox) {
      resBox.style.display = 'block';
      resBox.innerHTML = `
        <div style="background:#f0fdf4;border:2px solid #22c55e;padding:14px;border-radius:10px;margin-top:12px">
          <div style="color:#166534;font-weight:800;font-size:14px;display:flex;align-items:center;gap:6px">
            <span>✅ ĐÃ TẠO PHÒNG THI THÀNH CÔNG!</span>
          </div>
          <div style="font-size:13px;color:#1e293b;margin:6px 0">
            Học sinh lớp <b>${esc(targetClass)}</b> có thể vào thi ngay qua đường link này:
          </div>
          <div class="input-group" style="margin-bottom:10px">
            <input type="text" id="modal-share-link" value="${url}" readonly style="font-size:13px;font-weight:700;color:#2563eb;background:#fff;width:100%" />
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn btn-primary" onclick="navigator.clipboard.writeText('${url}'); UI.toast('Đã sao chép link phòng thi!', 'success');">
              📋 Sao chép Link
            </button>
            <button class="btn btn-outline" onclick="window.open('${url}', '_blank')">
              🌐 Mở thử màn hình thi
            </button>
            <button class="btn btn-outline" onclick="App.navigate('submissions'); UI.closeModal();">
              📥 Xem Bảng Thu Bài
            </button>
          </div>
        </div>
      `;
    }

    UI.toast(' Đã giao bài thi thành công!', 'success');
  },

  loadOfficialToWizard() {
    const oState = this.state.officialExams;
    const curG = oState.grade || '7';
    const curT = oState.term || 'GK1';
    const suite = this.getOfficialExamSuite(curG, curT);
    if (!suite) {
      UI.toast('Đang tải dữ liệu bộ đề, vui lòng thử lại sau giây lát!', 'warn');
      return;
    }

    const wiz = this.state.wizard;
    wiz.grade = parseInt(curG);
    wiz.examTitle = `BÀI KIỂM TRA ĐÁNH GIÁ ${suite.termTitle} – TIẾNG ANH ${curG} GLOBAL SUCCESS`;
    wiz.examClass = curG + 'A1';
    wiz.examTime = suite.timeMinutes || 60;
    wiz.examType = curT.startsWith('GK') ? 'Giữa kỳ' : (curT.startsWith('CK') ? 'Cuối kỳ' : 'Khảo sát');
    wiz.audioScript = suite.fullAudioScript;
    wiz.selectedSections = JSON.parse(JSON.stringify(suite.sections_code1));
    wiz.sections_code2 = JSON.parse(JSON.stringify(suite.sections_code2));
    wiz.code1 = suite.code1;
    wiz.code2 = suite.code2;
    wiz.step = 3;

    this.navigate('generate');
    UI.toast(`🎯 Đã nạp thành công Đề chuẩn 100% Khối ${curG} (${suite.termTitle}) vào Bộ soạn đề!`, 'success');
  },

  // ================================================================
  // ── MÔ-ĐUN 3: PHÒNG LUYỆN ĐỀ 15 PHÚT TRỰC TUYẾN CHO HỌC SINH ──
  // ================================================================
  renderStudent15mPractice() {
    const st = this.state.student15m;
    const curG = st.grade;
    const curU = st.unitNum;
    const gData = (window.QUIZ_15M_DATA && window.QUIZ_15M_DATA[curG]) || {};
    const uInfo = gData[curU] || { title: `Unit ${curU}`, sub: '' };

    if (!st.model) {
      st.model = this.build15mQuizModel(curG, curU, curG + '01', 42);
    }
    const model = st.model;

    // View 1: Chưa bắt đầu
    if (!st.started && !st.submitted) {
      return `
      <div class="page-body slide-up" style="max-width:850px;margin:0 auto">
        <!-- Grade selection -->
        <div class="card p-16 mb-16 text-center">
          <div style="font-size:13px;font-weight:700;color:var(--ink-soft);margin-bottom:10px">1. CHỌN KHỐI LỚP CỦA EM:</div>
          <div style="display:flex;justify-content:center;gap:10px">
            ${['6', '7', '8', '9'].map(g => `
              <button onclick="App.selectStudent15mGrade('${g}')" class="btn ${curG === g ? 'btn-primary' : 'btn-outline'}" style="font-weight:800;padding:8px 18px">
                Lớp ${g}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- 12 Units grid -->
        <div class="card p-20 mb-20">
          <div style="font-size:13px;font-weight:700;color:var(--ink-soft);margin-bottom:12px">2. CHỌN BÀI HỌC (UNIT):</div>
          <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(220px, 1fr));gap:10px">
            ${Array.from({ length: 12 }, (_, i) => i + 1).map(u => {
              const uData = gData[u] || {};
              const title = uData.title || `Unit ${u}`;
              const isAct = curU === u;
              return `
                <div onclick="App.selectStudent15mUnit(${u})" style="cursor:pointer;padding:12px 14px;border-radius:12px;border:2px solid ${isAct ? '#2563eb' : 'var(--line)'};background:${isAct ? '#eff6ff' : '#fff'};transition:all .2s">
                  <div style="font-weight:800;font-size:13.5px;color:${isAct ? '#1d4ed8' : '#1e293b'}">${title}</div>
                  <div style="font-size:11px;color:var(--ink-soft);margin-top:2px">${uData.sub ? uData.sub.slice(0, 35) + '...' : '20 câu trắc nghiệm'}</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Start card -->
        <div class="card p-28 text-center" style="background:linear-gradient(135deg,#eff6ff,#dbeafe);border:2px solid #2563eb">
          <div style="font-size:42px;margin-bottom:8px">⚡</div>
          <h2 style="font-size:22px;font-weight:900;color:#1e3a8a;margin-bottom:6px">
            Bài Kiểm Tra 15 Phút: ${esc(uInfo.title)}
          </h2>
          <p style="font-size:14px;color:#1e40af;max-width:540px;margin:0 auto 20px">
            Gồm 20 câu hỏi trắc nghiệm (10 câu Từ vựng & Giao tiếp + 10 câu Ngữ pháp & Đọc hiểu). Thời gian làm bài: 15 phút.
          </p>
          <button onclick="App.startStudent15m()" class="btn btn-primary" style="padding:14px 36px;font-size:16px;font-weight:900;box-shadow:var(--shadow-md)">
            🚀 BẮT ĐẦU LÀM BÀI NGAY
          </button>
        </div>
      </div>`;
    }

    // View 2: Kết quả sau khi nộp bài
    if (st.submitted) {
      const allQuestions = [...model.vocabItems, ...model.grammarItems];
      let correctCount = 0;
      allQuestions.forEach(q => {
        if (st.answers[q.num] === q.ans) correctCount++;
      });
      const score = ((correctCount / allQuestions.length) * 10).toFixed(1);

      let badgeColor = '#10b981';
      let rankText = '🌟 XUẤT SẮC!';
      if (score < 5.0) { badgeColor = '#ef4444'; rankText = ' CẦN ÔN TẬP THÊM!'; }
      else if (score < 8.0) { badgeColor = '#f59e0b'; rankText = '👍 KHÁ TỐT!'; }

      return `
      <div class="page-body slide-up" style="max-width:850px;margin:0 auto">
        <div class="card p-28 text-center mb-20" style="background:#fff;border-top:6px solid ${badgeColor}">
          <div style="font-size:48px;margin-bottom:6px">${score >= 8 ? '🎉' : '📖'}</div>
          <h2 style="font-size:24px;font-weight:900;color:#1e293b;margin-bottom:4px">KẾT QUẢ BÀI THI 15 PHÚT</h2>
          <div style="font-size:14px;color:var(--ink-soft);margin-bottom:14px">${esc(model.title)} – Tiếng Anh ${curG}</div>

          <div style="display:inline-block;padding:12px 30px;border-radius:20px;background:${badgeColor}15;border:2px solid ${badgeColor};margin-bottom:14px">
            <span style="font-size:36px;font-weight:900;color:${badgeColor}">${score}</span>
            <span style="font-size:18px;font-weight:700;color:var(--ink-soft)"> / 10.0 Điểm</span>
          </div>

          <div style="font-size:16px;font-weight:800;color:${badgeColor};margin-bottom:16px">${rankText} (Đúng ${correctCount}/20 câu)</div>

          <div style="display:flex;justify-content:center;gap:12px">
            <button onclick="App.startStudent15m()" class="btn btn-primary">🔄 Làm lại bài này</button>
            <button onclick="App.resetStudent15m()" class="btn btn-outline">📚 Chọn bài khác</button>
          </div>
        </div>

        <!-- Chi tiết từng câu và lời giải sư phạm của Thầy Thành -->
        <div class="section-title mb-14">GIẢI THÍCH CHI TIẾT TỪ THẦY ĐINH VĂN THÀNH:</div>
        <div class="stack gap-12">
          ${allQuestions.map(q => {
            const userAns = st.answers[q.num];
            const isCorrect = userAns === q.ans;
            return `
              <div class="card p-18" style="border-left:4px solid ${isCorrect ? '#10b981' : '#ef4444'}">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
                  <strong>Câu ${q.num}:</strong>
                  <span class="badge" style="background:${isCorrect ? '#dcfce7' : '#fee2e2'};color:${isCorrect ? '#15803d' : '#b91c1c'};font-weight:800">
                    ${isCorrect ? '✓ Đúng (+0.5đ)' : `✗ Sai (Đáp án: ${q.ans})`}
                  </span>
                </div>
                <div style="font-size:14px;margin-bottom:8px">${esc(q.q)}</div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:13px;margin-bottom:10px">
                  ${q.opts.map(o => `
                    <div style="padding:6px 10px;border-radius:8px;background:${o.letter === q.ans ? '#dcfce7' : (o.letter === userAns ? '#fee2e2' : '#f8fafc')};border:1px solid ${o.letter === q.ans ? '#86efac' : '#e2e8f0'}">
                      <b>${o.letter}.</b> ${esc(o.text)} ${o.letter === q.ans ? '✓' : ''}
                    </div>
                  `).join('')}
                </div>
                ${q.exp ? `
                  <div style="background:#eff6ff;padding:10px 14px;border-radius:8px;border:1px dashed #93c5fd;font-size:12.5px;color:#1e40af">
                    💡 <b>Giải thích:</b> ${esc(q.exp)}
                  </div>
                ` : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>`;
    }

    // View 3: Đang làm bài thi (Interactive Test)
    const allQuestions = [...model.vocabItems, ...model.grammarItems];
    const answeredCount = Object.keys(st.answers).length;
    const mins = Math.floor(st.timeRemaining / 60);
    const secs = st.timeRemaining % 60;
    const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    return `
    <div class="page-body slide-up" style="max-width:850px;margin:0 auto">
      <!-- Fixed floating status bar -->
      <div class="card p-14 mb-16 sticky top-0 z-40" style="background:rgba(255,255,255,0.95);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:space-between;box-shadow:var(--shadow-md)">
        <div>
          <strong style="font-size:15px;color:#1e3a8a">${esc(model.title)}</strong>
          <div style="font-size:12px;color:var(--ink-soft)">Đã làm: ${answeredCount}/20 câu</div>
        </div>
        <div style="display:flex;align-items:center;gap:14px">
          <div style="font-size:18px;font-weight:900;color:${st.timeRemaining < 120 ? '#ef4444' : '#2563eb'};background:#f1f5f9;padding:6px 14px;border-radius:10px">
            ⏱️ ${timeStr}
          </div>
          <button onclick="App.submitStudent15m()" class="btn btn-success" style="font-weight:800">
            Nộp bài thi ➔
          </button>
        </div>
      </div>

      <!-- Question list -->
      <div class="stack gap-16">
        <div class="card p-14" style="background:#eff6ff;border:1px solid #bfdbfe;font-weight:700;color:#1e40af">
          Part I: Vocabulary & Communication (Câu 1 - 10)
        </div>
        ${model.vocabItems.map(item => `
          <div class="card p-18">
            ${item.passage_title ? `<div style="font-weight:bold;font-style:italic;font-size:13px;color:#1e293b;margin-bottom:4px">${esc(item.passage_title)}</div>` : ''}
            ${item.passage_text ? `<div style="font-style:italic;font-size:12.5px;background:#f8fafc;padding:6px 10px;border-radius:6px;border:1px solid #e2e8f0;margin-bottom:8px">${esc(item.passage_text)}</div>` : ''}
            <div style="font-weight:700;font-size:14.5px;margin-bottom:10px">
              Câu ${item.num}: ${esc(item.q)}
            </div>
            <div style="display:grid;grid-template-columns:1fr;gap:8px">
              ${item.opts.map(o => {
                const isSel = st.answers[item.num] === o.letter;
                return `
                  <div onclick="App.selectStudent15mAnswer(${item.num}, '${o.letter}')" style="cursor:pointer;padding:10px 14px;border-radius:10px;border:2px solid ${isSel ? '#2563eb' : 'var(--line)'};background:${isSel ? '#eff6ff' : '#fff'};display:flex;align-items:center;gap:10px;transition:all .15s">
                    <span style="width:24px;height:24px;border-radius:50%;background:${isSel ? '#2563eb' : '#f1f5f9'};color:${isSel ? '#fff' : '#334155'};display:flex;align-items:center;justify-content:center;font-weight:800;font-size:12px">
                      ${o.letter}
                    </span>
                    <span style="font-size:13.5px;font-weight:${isSel ? '700' : '500'}">${esc(o.text)}</span>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `).join('')}

        <div class="card p-14 mt-12" style="background:#eff6ff;border:1px solid #bfdbfe;font-weight:700;color:#1e40af">
          Part II: Grammar & Reading (Câu 11 - 20)
        </div>
        ${model.grammarItems.map(item => `
          <div class="card p-18">
            ${item.passage_title ? `<div style="font-weight:bold;font-style:italic;font-size:13px;color:#1e293b;margin-bottom:4px">${esc(item.passage_title)}</div>` : ''}
            ${item.passage_text ? `<div style="font-style:italic;font-size:12.5px;background:#f8fafc;padding:6px 10px;border-radius:6px;border:1px solid #e2e8f0;margin-bottom:8px">${esc(item.passage_text)}</div>` : ''}
            <div style="font-weight:700;font-size:14.5px;margin-bottom:10px">
              Câu ${item.num}: ${esc(item.q)}
            </div>
            <div style="display:grid;grid-template-columns:1fr;gap:8px">
              ${item.opts.map(o => {
                const isSel = st.answers[item.num] === o.letter;
                return `
                  <div onclick="App.selectStudent15mAnswer(${item.num}, '${o.letter}')" style="cursor:pointer;padding:10px 14px;border-radius:10px;border:2px solid ${isSel ? '#2563eb' : 'var(--line)'};background:${isSel ? '#eff6ff' : '#fff'};display:flex;align-items:center;gap:10px;transition:all .15s">
                    <span style="width:24px;height:24px;border-radius:50%;background:${isSel ? '#2563eb' : '#f1f5f9'};color:${isSel ? '#fff' : '#334155'};display:flex;align-items:center;justify-content:center;font-weight:800;font-size:12px">
                      ${o.letter}
                    </span>
                    <span style="font-size:13.5px;font-weight:${isSel ? '700' : '500'}">${esc(o.text)}</span>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `).join('')}

        <div style="text-align:center;padding:20px 0 40px">
          <button onclick="App.submitStudent15m()" class="btn btn-success" style="padding:14px 40px;font-size:16px;font-weight:900">
            ✓ HOÀN THÀNH & NỘP BÀI THI
          </button>
        </div>
      </div>
    </div>`;
  },

  selectStudent15mGrade(grade) {
    this.state.student15m.grade = String(grade);
    this.state.student15m.unitNum = 1;
    this.state.student15m.model = null;
    this.renderPage();
  },

  selectStudent15mUnit(unitNum) {
    this.state.student15m.unitNum = Number(unitNum);
    this.state.student15m.model = null;
    this.renderPage();
  },

  startStudent15m() {
    const st = this.state.student15m;
    st.model = this.build15mQuizModel(st.grade, st.unitNum, st.grade + '01', Date.now());
    st.started = true;
    st.submitted = false;
    st.answers = {};
    st.timeRemaining = 900;

    if (st.timer) clearInterval(st.timer);
    st.timer = setInterval(() => {
      st.timeRemaining--;
      if (st.timeRemaining <= 0) {
        clearInterval(st.timer);
        App.submitStudent15m();
      } else {
        const mins = Math.floor(st.timeRemaining / 60);
        const secs = st.timeRemaining % 60;
        const timeEl = document.querySelector('.sticky.top-0 div:last-child div:first-child');
        if (timeEl) timeEl.textContent = `⏱️ ${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      }
    }, 1000);

    this.renderPage();
    window.scrollTo(0, 0);
  },

  selectStudent15mAnswer(qNum, choice) {
    this.state.student15m.answers[qNum] = choice;
    this.renderPage();
  },

  submitStudent15m() {
    const st = this.state.student15m;
    if (st.timer) clearInterval(st.timer);

    const allQuestions = [...(st.model.vocabItems || []), ...(st.model.grammarItems || [])];
    let correctCount = 0;
    allQuestions.forEach(q => {
      if (st.answers[q.num] === q.ans) correctCount++;
    });
    const finalScore = parseFloat(((correctCount / allQuestions.length) * 10).toFixed(1));

    st.score = finalScore;
    st.submitted = true;
    st.started = false;

    // Lưu vào lịch sử học sinh
    const user = this.state.user || { name: 'Học sinh', class: `${st.grade}A1` };
    Auth.addSubmission({
      examId: `15m-g${st.grade}-u${st.unitNum}`,
      examTitle: `Đề 15P Tiếng Anh ${st.grade} - ${st.model.title}`,
      grade: st.grade,
      studentName: user.name || 'Học sinh',
      studentClass: user.class || `${st.grade}A1`,
      score: finalScore,
      correctCount: correctCount,
      totalQuestions: 20,
      submittedAt: new Date().toISOString()
    });

    UI.toast(` Đã nộp bài! Điểm của em: ${finalScore}/10`, 'success');
    this.renderPage();
    window.scrollTo(0, 0);
  },

  resetStudent15m() {
    this.state.student15m.started = false;
    this.state.student15m.submitted = false;
    this.state.student15m.answers = {};
    if (this.state.student15m.timer) clearInterval(this.state.student15m.timer);
    this.renderPage();
  },

  // ================================================================
  // GIAO DIỆN DARK / LIGHT MODE & TIỆN ÍCH ÂM THANH
  // ================================================================
  toggleTheme() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const next = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    document.body.setAttribute('data-theme', next);
    localStorage.setItem('app_theme', next);
    const icon = document.getElementById('theme-toggle-icon');
    const txt = document.getElementById('theme-toggle-text');
    if (icon) icon.textContent = next === 'dark' ? '☀️' : '🌙';
    if (txt) txt.textContent = next === 'dark' ? 'Sáng' : 'Tối';
    UI.toast(`Đã chuyển sang ${next === 'dark' ? 'Giao diện Tối (Dark Mode)' : 'Giao diện Sáng (Light Mode)'}!`, 'info');
  },

  speakWord(word) {
    if (!word) return;
    AudioEngine.playScript(word, 0.82);
    UI.toast(`🔊 Đang phát âm: "${word}"`, 'info', 1600);
  },

  // ================================================================
  // CẨM NANG NGỮ PHÁP THẦN TỐC GLOBAL SUCCESS (LỚP 6 - 9)
  // ================================================================
  renderGrammarStudio() {
    const data = typeof GLOBAL_GRAMMAR_MASTER !== 'undefined' ? GLOBAL_GRAMMAR_MASTER : [];
    const filterGrade = this.state.grammarFilterGrade || 'all';
    const query = (this.state.grammarSearchQuery || '').toLowerCase().trim();

    const filtered = data.filter(item => {
      const matchGrade = filterGrade === 'all' || String(item.grade) === String(filterGrade);
      const matchQuery = !query || item.title.toLowerCase().includes(query) || item.target.toLowerCase().includes(query) || item.formula.toLowerCase().includes(query);
      return matchGrade && matchQuery;
    });

    return `
    <div class="page-body slide-up">
      <!-- Header Banner -->
      <div class="welcome-banner" style="background:linear-gradient(135deg,#1e1b4b 0%,#4338ca 50%,#6366f1 100%)">
        <div>
          <h2>⚡ Cẩm Nang Ngữ Pháp Thần Tốc Global Success</h2>
          <p>Hệ thống toàn diện Lớp 6 – 9: Công thức chuẩn hóa, "thần chú ghi nhớ độc quyền", ví dụ thực tế và bài tập kiểm tra trúng điểm 10.</p>
          <div class="row gap-8 mt-12">
            <span class="badge" style="background:rgba(255,255,255,0.2);color:#fff">📚 ${data.length} Chuyên đề Cốt lõi</span>
            <span class="badge" style="background:rgba(255,255,255,0.2);color:#fff">🎯 Bám sát SGK & Đề thi BGD</span>
            <span class="badge" style="background:rgba(255,255,255,0.2);color:#fff">💡 Phương pháp Thần chú độc quyền</span>
          </div>
        </div>
      </div>

      <!-- Controls & Filter Bar -->
      <div class="card mb-16" style="padding:14px 20px">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap">
          <!-- Grade filter tabs -->
          <div class="btn-group">
            <button class="btn btn-sm ${filterGrade === 'all' ? 'btn-primary' : 'btn-outline'}" onclick="App.setGrammarGrade('all')">Tất cả (${data.length})</button>
            <button class="btn btn-sm ${filterGrade === '6' ? 'btn-primary' : 'btn-outline'}" onclick="App.setGrammarGrade('6')">Lớp 6</button>
            <button class="btn btn-sm ${filterGrade === '7' ? 'btn-primary' : 'btn-outline'}" onclick="App.setGrammarGrade('7')">Lớp 7</button>
            <button class="btn btn-sm ${filterGrade === '8' ? 'btn-primary' : 'btn-outline'}" onclick="App.setGrammarGrade('8')">Lớp 8</button>
            <button class="btn btn-sm ${filterGrade === '9' ? 'btn-primary' : 'btn-outline'}" onclick="App.setGrammarGrade('9')">Lớp 9</button>
          </div>

          <!-- Search input -->
          <div style="position:relative;min-width:260px">
            <input type="text" class="input input-sm" style="padding-left:32px" placeholder="Tìm kiếm chuyên đề ngữ pháp..."
              value="${esc(this.state.grammarSearchQuery || '')}"
              oninput="App.filterGrammarSearch(this.value)">
            <span style="position:absolute;left:10px;top:50%;transform:translateY(-50%);color:#94a3b8">🔍</span>
          </div>
        </div>
      </div>

      <!-- Grammar Cards List -->
      <div style="display:flex;flex-direction:column;gap:20px">
        ${filtered.length === 0 ? `
          <div class="card text-center" style="padding:48px 20px;color:var(--ink-soft)">
            <div style="font-size:40px;margin-bottom:12px">🔍</div>
            <div style="font-size:16px;font-weight:700">Không tìm thấy chuyên đề phù hợp</div>
            <p style="font-size:13px;margin-top:6px">Vui lòng thử chọn khối lớp khác hoặc xóa từ khóa tìm kiếm.</p>
          </div>
        ` : filtered.map(item => {
          const userAns = this.state.grammarQuizAnswers[item.id];
          const isAnswered = userAns !== undefined;
          const isCorrect = isAnswered && userAns === item.quiz.answer;

          return `
          <div class="grammar-card">
            <!-- Card Header -->
            <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:14px;flex-wrap:wrap">
              <div>
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
                  <span class="tag tag-nb" style="font-weight:800">LỚP ${item.grade}</span>
                  <span style="font-size:12px;color:var(--ink-soft);font-weight:600">SGK GLOBAL SUCCESS</span>
                </div>
                <h3 style="font-size:18px;font-weight:800;color:var(--ink);margin:0 0 4px">${esc(item.title)}</h3>
                <div style="font-size:13px;color:var(--primary);font-weight:600">🎯 Mục tiêu: ${esc(item.target)}</div>
              </div>
            </div>

            <!-- Formula Box -->
            <div class="formula-box">
              <div style="font-weight:800;color:var(--primary-dark);margin-bottom:6px;font-size:12px;letter-spacing:0.5px">📌 CÔNG THỨC CHUẨN:</div>
              <div style="font-family:'Courier New',Consolas,monospace;font-size:14px;font-weight:700;color:var(--ink);line-height:1.6">${esc(item.formula)}</div>
            </div>

            <!-- Magic Rule Callout -->
            <div class="magic-rule-pill">
              <span style="font-size:18px">💡</span>
              <div>
                <b style="color:#d97706">Thần chú nhớ nhanh: </b>
                <span>${esc(item.magicRule)}</span>
              </div>
            </div>

            <!-- Examples Section -->
            <div style="background:var(--surface-hover);padding:14px 16px;border-radius:12px;margin-bottom:16px;border:1px solid var(--line)">
              <div style="font-size:12px;font-weight:800;color:var(--ink-soft);text-transform:uppercase;margin-bottom:8px">📖 Ví dụ thực tế SGK:</div>
              <div style="display:flex;flex-direction:column;gap:8px">
                ${item.examples.map(ex => `
                  <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;background:var(--surface);padding:8px 12px;border-radius:8px">
                    <div style="font-size:13.5px">
                      <span style="font-weight:700;color:var(--ink)">${esc(ex.en)}</span>
                      <span style="color:var(--ink-soft);margin-left:8px">— <i>${esc(ex.vi)}</i></span>
                    </div>
                    <button class="word-audio-pill" onclick="App.speakWord('${esc(ex.en).replace(/'/g, "\\'")}')" title="Nghe phát âm">
                      🔊 Nghe
                    </button>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Interactive Quiz Section -->
            <div style="border-top:1px dashed var(--line);padding-top:14px">
              <div style="font-size:12.5px;font-weight:800;color:var(--ink);margin-bottom:8px;display:flex;align-items:center;gap:6px">
                <span>⚡ Thử thách nhanh:</span>
                <span style="font-weight:normal;color:var(--ink-soft)">Chọn phương án đúng nhất</span>
              </div>
              <div style="font-weight:700;font-size:14px;color:var(--ink);margin-bottom:10px">
                ${esc(item.quiz.question)}
              </div>
              <div class="grid grid-2 gap-8 mb-12">
                ${item.quiz.options.map((opt, optIdx) => {
                  let btnStyle = 'background:var(--surface);border:1px solid var(--line);color:var(--ink)';
                  if (isAnswered) {
                    if (optIdx === item.quiz.answer) {
                      btnStyle = 'background:#dcfce7;border:2px solid #16a34a;color:#166534;font-weight:800';
                    } else if (optIdx === userAns) {
                      btnStyle = 'background:#fee2e2;border:2px solid #dc2626;color:#991b1b;font-weight:700';
                    } else {
                      btnStyle = 'opacity:0.6;background:var(--surface);border:1px solid var(--line)';
                    }
                  }
                  return `
                  <button class="btn btn-sm" style="${btnStyle};text-align:left;justify-content:flex-start;padding:8px 12px;border-radius:8px"
                    ${isAnswered ? 'disabled' : ''}
                    onclick="App.answerGrammarQuiz('${item.id}', ${optIdx})">
                    <span>${esc(opt)}</span>
                  </button>`;
                }).join('')}
              </div>

              ${isAnswered ? `
                <div style="background:${isCorrect ? '#f0fdf4' : '#fef2f2'};border-left:4px solid ${isCorrect ? '#22c55e' : '#ef4444'};padding:10px 14px;border-radius:8px;font-size:13px;display:flex;align-items:flex-start;justify-content:space-between;gap:8px">
                  <div>
                    <b style="color:${isCorrect ? '#166534' : '#991b1b'}">${isCorrect ? '🎉 Chính xác!' : '❌ Chưa chính xác!'}</b>
                    <div style="color:var(--ink);margin-top:4px">${esc(item.quiz.explanation)}</div>
                  </div>
                  <button class="btn btn-xs btn-outline" onclick="App.resetGrammarQuiz('${item.id}')">Làm lại</button>
                </div>
              ` : ''}
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>`;
  },

  setGrammarGrade(grade) {
    this.state.grammarFilterGrade = grade;
    this.renderPage();
  },

  filterGrammarSearch(query) {
    this.state.grammarSearchQuery = query;
    this.renderPage();
  },

  answerGrammarQuiz(cardId, optionIndex) {
    this.state.grammarQuizAnswers[cardId] = optionIndex;
    const item = (typeof GLOBAL_GRAMMAR_MASTER !== 'undefined' ? GLOBAL_GRAMMAR_MASTER : []).find(x => x.id === cardId);
    if (item && optionIndex === item.quiz.answer) {
      UI.toast('🎉 Chính xác! Bạn được cộng +5 điểm XP!', 'success');
      if (this.state.user) this.state.user.points = (this.state.user.points || 0) + 5;
    } else {
      UI.toast('Chưa đúng rồi! Hãy đọc lại phần giải thích chi tiết nhé.', 'warn');
    }
    this.renderPage();
  },

  resetGrammarQuiz(cardId) {
    delete this.state.grammarQuizAnswers[cardId];
    this.renderPage();
  },

  // ================================================================
  // BÍ KÍP BẤT BẠI: NGỮ ÂM & TRỌNG ÂM THCS
  // ================================================================
  renderPhoneticsLab() {
    const data = typeof GLOBAL_PHONETICS_MASTER !== 'undefined' ? GLOBAL_PHONETICS_MASTER : { rules: {}, interactiveTest: [] };
    const activeTab = this.state.phoneticsActiveTab || 's_es';

    const tabConfig = {
      s_es: { label: 'Phát âm -s / -es', icon: '⚡', rule: data.rules.s_es },
      ed: { label: 'Phát âm -ed', icon: '🎯', rule: data.rules.ed },
      two_syllables: { label: 'Trọng âm 2 âm tiết', icon: '🔔', rule: data.rules.two_syllables },
      three_syllables: { label: 'Trọng âm 3 âm tiết & Hậu tố', icon: '🌟', rule: data.rules.three_syllables }
    };

    const currentRule = tabConfig[activeTab]?.rule;

    return `
    <div class="page-body slide-up">
      <!-- Header Banner -->
      <div class="welcome-banner" style="background:linear-gradient(135deg,#047857 0%,#059669 50%,#10b981 100%)">
        <div>
          <h2>🎯 Bí Kíp Bất Bại: Ngữ Âm & Trọng Âm THCS</h2>
          <p>Quy tắc chuẩn quốc tế, mẹo nhớ siêu nhanh độc quyền của Thầy Đinh Văn Thành. Bấm vào từ bất kỳ để AI đọc giọng bản ngữ!</p>
          <div class="row gap-8 mt-12">
            <span class="badge" style="background:rgba(255,255,255,0.25);color:#fff">🔊 Tích hợp Web Speech AI</span>
            <span class="badge" style="background:rgba(255,255,255,0.25);color:#fff">💡 Thần chú thời phong kiến & tiền đô</span>
            <span class="badge" style="background:rgba(255,255,255,0.25);color:#fff">✍️ 4 Dạng bài trắc nghiệm then chốt</span>
          </div>
        </div>
      </div>

      <!-- Rule Tabs -->
      <div class="tabs mb-20">
        ${Object.keys(tabConfig).map(k => `
          <button class="tab-btn ${activeTab === k ? 'active' : ''}" onclick="App.setPhoneticsTab('${k}')">
            <span>${tabConfig[k].icon}</span>
            <span>${tabConfig[k].label}</span>
          </button>
        `).join('')}
      </div>

      <!-- Main Rule Content Card -->
      ${currentRule ? `
        <div class="phonetics-card mb-24">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;flex-wrap:wrap">
            <h3 style="font-size:20px;font-weight:800;color:var(--ink);margin:0">${esc(currentRule.title)}</h3>
            <span class="tag tag-vd" style="font-weight:700">Chuẩn thi THCS Global Success</span>
          </div>

          <!-- Mnemonic Banner -->
          <div class="magic-rule-pill mb-16">
            <span style="font-size:20px">💡</span>
            <div>
              <b style="color:#d97706;font-size:14px">Thần chú nhớ bất bại:</b>
              <div style="font-size:14px;color:var(--ink);margin-top:2px;font-weight:700">${esc(currentRule.mnemonic)}</div>
            </div>
          </div>

          <!-- Groups -->
          <div style="display:flex;flex-direction:column;gap:16px">
            ${currentRule.groups.map(grp => `
              <div style="background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:16px">
                <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;flex-wrap:wrap">
                  ${grp.sound ? `<div class="sound-badge-large">${esc(grp.sound)}</div>` : ''}
                  ${grp.type ? `<span class="tag tag-nb" style="font-weight:800;font-size:13px">${esc(grp.type)}</span>` : ''}
                  ${grp.pattern ? `<span class="tag tag-th" style="font-weight:800;font-size:13px">${esc(grp.pattern)}</span>` : ''}
                  <div style="font-size:13px;font-weight:600;color:var(--ink)">${esc(grp.when || grp.rule || '')}</div>
                </div>

                <!-- Word pills with Audio TTS -->
                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px">
                  ${grp.examples.map(w => `
                    <button class="word-audio-pill" onclick="App.speakWord('${esc(w).replace(/'/g, "\\'")}')" title="Bấm để nghe phát âm giọng chuẩn">
                      <span>🔊</span>
                      <span>${esc(w)}</span>
                    </button>
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Interactive Practice Test Section -->
      <div class="card">
        <div class="section-header">
          <div>
            <div class="section-title">✍️ Đấu Trường Luyện Tập Ngữ Âm & Trọng Âm</div>
            <div class="section-desc">Trích từ ngân hàng đề kiểm tra chuẩn CV 7991 của Thầy Đinh Văn Thành</div>
          </div>
          <span class="tag tag-vd">4 Câu Tiêu Biểu</span>
        </div>

        <div style="display:flex;flex-direction:column;gap:16px;margin-top:16px">
          ${(data.interactiveTest || []).map((q, qIdx) => {
            const userAns = this.state.phoneticsQuizAnswers[qIdx];
            const isAnswered = userAns !== undefined;
            const isCorrect = isAnswered && userAns === q.answer;

            return `
            <div style="background:var(--surface-hover);border:1px solid var(--line);border-radius:12px;padding:16px">
              <div style="font-size:14.5px;font-weight:700;color:var(--ink);margin-bottom:12px">
                <span class="tag tag-th" style="margin-right:8px">Câu ${qIdx + 1}</span>
                <span>${esc(q.question)}</span>
              </div>

              <!-- Options -->
              <div class="grid grid-4 gap-8 mb-12">
                ${q.options.map((opt, optLetterIdx) => {
                  const letters = ['A', 'B', 'C', 'D'];
                  const letter = letters[optLetterIdx];
                  const word = opt.replace(/^[A-D]\.\s*/, '');
                  let btnCls = 'btn-outline';
                  let inlineBg = '';

                  if (isAnswered) {
                    if (letter === q.answer) {
                      inlineBg = 'background:#dcfce7;border-color:#16a34a;color:#166534;font-weight:800';
                    } else if (letter === userAns) {
                      inlineBg = 'background:#fee2e2;border-color:#dc2626;color:#991b1b;font-weight:700';
                    } else {
                      inlineBg = 'opacity:0.6';
                    }
                  }

                  return `
                  <button class="btn btn-sm ${btnCls}" style="${inlineBg};display:flex;align-items:center;justify-content:space-between;padding:10px 14px"
                    ${isAnswered ? 'disabled' : ''}
                    onclick="App.answerPhoneticsQuiz(${qIdx}, '${letter}')">
                    <span><b>${letter}.</b> ${esc(word)}</span>
                    <span onclick="event.stopPropagation();App.speakWord('${esc(word).replace(/'/g, "\\'")}')" style="cursor:pointer;padding:2px 4px" title="Nghe đọc">🔊</span>
                  </button>`;
                }).join('')}
              </div>

              ${isAnswered ? `
                <div style="background:${isCorrect ? '#f0fdf4' : '#fef2f2'};border-left:4px solid ${isCorrect ? '#22c55e' : '#ef4444'};padding:10px 14px;border-radius:8px;font-size:13px;display:flex;align-items:flex-start;justify-content:space-between;gap:8px">
                  <div>
                    <b style="color:${isCorrect ? '#166534' : '#991b1b'}">${isCorrect ? '🎉 Tuyệt vời! Bạn chọn đúng rồi!' : `❌ Chưa đúng! Đáp án đúng là: ${q.answer}`}</b>
                    <div style="color:var(--ink);margin-top:4px">${esc(q.explanation)}</div>
                  </div>
                  <button class="btn btn-xs btn-outline" onclick="App.resetPhoneticsQuiz(${qIdx})">Làm lại</button>
                </div>
              ` : ''}
            </div>`;
          }).join('')}
        </div>
      </div>
    </div>`;
  },

  setPhoneticsTab(tab) {
    this.state.phoneticsActiveTab = tab;
    this.renderPage();
  },

  answerPhoneticsQuiz(qIdx, letter) {
    this.state.phoneticsQuizAnswers[qIdx] = letter;
    const data = typeof GLOBAL_PHONETICS_MASTER !== 'undefined' ? GLOBAL_PHONETICS_MASTER : { interactiveTest: [] };
    const q = (data.interactiveTest || [])[qIdx];
    if (q && q.answer === letter) {
      UI.toast('🎉 Xuất sắc! Bạn được cộng +5 điểm XP!', 'success');
      if (this.state.user) this.state.user.points = (this.state.user.points || 0) + 5;
    } else {
      UI.toast(`Chưa chính xác! Đáp án đúng là ${q?.answer}. Hãy bấm biểu tượng loa để nghe lại nhé!`, 'warn');
    }
    this.renderPage();
  },

  resetPhoneticsQuiz(qIdx) {
    delete this.state.phoneticsQuizAnswers[qIdx];
    this.renderPage();
  },

  // ================================================================
  // KHO ĐOẠN VĂN MẪU 80 - 100 TỪ (BAND 9-10) CV 7991
  // ================================================================
  renderWritingLab() {
    const data = typeof GLOBAL_WRITING_MASTER !== 'undefined' ? GLOBAL_WRITING_MASTER : { formula: {}, topics: [] };
    const filterGrade = this.state.writingFilterGrade || 'all';
    const query = (this.state.writingSearchQuery || '').toLowerCase().trim();

    const filtered = (data.topics || []).filter(item => {
      const matchGrade = filterGrade === 'all' || String(item.grade) === String(filterGrade);
      const matchQuery = !query || item.title.toLowerCase().includes(query) || item.topic.toLowerCase().includes(query) || item.content.toLowerCase().includes(query);
      return matchGrade && matchQuery;
    });

    return `
    <div class="page-body slide-up">
      <!-- Header Banner -->
      <div class="welcome-banner" style="background:linear-gradient(135deg,#7c2d12 0%,#ea580c 50%,#f97316 100%)">
        <div>
          <h2>✍️ Kho Đoạn Văn Mẫu 80 – 100 Từ (Band 9-10)</h2>
          <p>Chuẩn dạng tự luận CV 7991: Công thức 3 phần đỉnh cao, từ nối mạch lạc, từ vựng nâng cao và bản dịch song ngữ chuẩn xác.</p>
          <div class="row gap-8 mt-12">
            <span class="badge" style="background:rgba(255,255,255,0.25);color:#fff">📝 12 Đoạn Văn Trọng Tâm 6-9</span>
            <span class="badge" style="background:rgba(255,255,255,0.25);color:#fff">💡 Cấu trúc Topic - Supporting - Concluding</span>
            <span class="badge" style="background:rgba(255,255,255,0.25);color:#fff">🔊 Tích hợp giọng đọc AI bản xứ</span>
          </div>
        </div>
      </div>

      <!-- Writing Formula Showcase -->
      <div class="card mb-20" style="background:linear-gradient(to right,var(--surface),var(--surface-hover));border-left:5px solid #ea580c">
        <div style="font-size:15px;font-weight:800;color:var(--ink);margin-bottom:8px">
          🏆 CÔNG THỨC VÀNG VIẾT ĐOẠN VĂN 80–100 TỪ (BGD THCS)
        </div>
        <div class="grid grid-3 gap-12 mt-12">
          <div style="background:var(--surface);padding:12px;border-radius:10px;border:1px solid var(--line)">
            <div style="font-weight:800;font-size:12px;color:#ea580c;margin-bottom:4px">1. CÂU MỞ ĐẦU (TOPIC SENTENCE)</div>
            <div style="font-size:12.5px;color:var(--ink);line-height:1.5">${esc(data.formula.structure?.split('\n')[0] || 'Nêu thẳng chủ đề bài viết bằng 1 câu rõ ràng')}</div>
          </div>
          <div style="background:var(--surface);padding:12px;border-radius:10px;border:1px solid var(--line)">
            <div style="font-weight:800;font-size:12px;color:#2563eb;margin-bottom:4px">2. THÂN ĐOẠN (SUPPORTING SENTENCES)</div>
            <div style="font-size:12.5px;color:var(--ink);line-height:1.5">${esc(data.formula.structure?.split('\n')[1] || 'Đưa 2-3 ý triển khai cùng ví dụ và từ nối')}</div>
          </div>
          <div style="background:var(--surface);padding:12px;border-radius:10px;border:1px solid var(--line)">
            <div style="font-weight:800;font-size:12px;color:#16a34a;margin-bottom:4px">3. KẾT ĐOẠN (CONCLUDING SENTENCE)</div>
            <div style="font-size:12.5px;color:var(--ink);line-height:1.5">${esc(data.formula.structure?.split('\n')[2] || 'Khẳng định lại cảm nghĩ hoặc tầm quan trọng')}</div>
          </div>
        </div>
        <div style="margin-top:12px;font-size:12.5px;color:var(--ink-soft);background:rgba(234,88,12,0.08);padding:8px 12px;border-radius:8px">
          💡 <b>Từ nối ăn điểm:</b> <code>First / Firstly</code>, <code>Second / In addition</code>, <code>Furthermore</code>, <code>Finally / In short</code>.
        </div>
      </div>

      <!-- Filters Bar -->
      <div class="card mb-16" style="padding:14px 20px">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap">
          <div class="btn-group">
            <button class="btn btn-sm ${filterGrade === 'all' ? 'btn-primary' : 'btn-outline'}" onclick="App.setWritingGrade('all')">Tất cả (${(data.topics || []).length})</button>
            <button class="btn btn-sm ${filterGrade === '6' ? 'btn-primary' : 'btn-outline'}" onclick="App.setWritingGrade('6')">Lớp 6</button>
            <button class="btn btn-sm ${filterGrade === '7' ? 'btn-primary' : 'btn-outline'}" onclick="App.setWritingGrade('7')">Lớp 7</button>
            <button class="btn btn-sm ${filterGrade === '8' ? 'btn-primary' : 'btn-outline'}" onclick="App.setWritingGrade('8')">Lớp 8</button>
            <button class="btn btn-sm ${filterGrade === '9' ? 'btn-primary' : 'btn-outline'}" onclick="App.setWritingGrade('9')">Lớp 9</button>
          </div>

          <div style="position:relative;min-width:260px">
            <input type="text" class="input input-sm" style="padding-left:32px" placeholder="Tìm theo chủ đề đoạn văn..."
              value="${esc(this.state.writingSearchQuery || '')}"
              oninput="App.filterWritingSearch(this.value)">
            <span style="position:absolute;left:10px;top:50%;transform:translateY(-50%);color:#94a3b8">🔍</span>
          </div>
        </div>
      </div>

      <!-- Essays List -->
      <div style="display:flex;flex-direction:column;gap:20px">
        ${filtered.length === 0 ? `
          <div class="card text-center" style="padding:48px 20px;color:var(--ink-soft)">
            <div style="font-size:40px;margin-bottom:12px">✍️</div>
            <div style="font-size:16px;font-weight:700">Chưa có bài văn mẫu cho bộ lọc này</div>
          </div>
        ` : filtered.map(item => {
          const isViShown = this.state.writingShowVi[item.id] !== false; // default true

          return `
          <div class="writing-card" id="writing-card-${item.id}">
            <!-- Header -->
            <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:14px;flex-wrap:wrap">
              <div>
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
                  <span class="tag tag-nb" style="font-weight:800">LỚP ${item.grade} · UNIT ${item.unit}</span>
                  <span class="tag tag-vd" style="font-weight:700">ĐỘ DÀI: ${item.wordCount} TỪ</span>
                  <span class="badge" style="background:#fef3c7;color:#92400e;font-weight:700">⭐ ĐIỂM 9-10</span>
                </div>
                <h3 style="font-size:18px;font-weight:800;color:var(--ink);margin:0 0 4px">${esc(item.title)}</h3>
                <div style="font-size:13px;color:var(--ink-soft)">Chủ đề tiếng Anh: <b>${esc(item.topic)}</b></div>
              </div>

              <!-- Quick action buttons -->
              <div class="row gap-8">
                <button class="btn btn-sm btn-outline" onclick="App.speakWritingEssay('${item.id}')" title="Nghe AI đọc cả đoạn văn">
                  🔊 Nghe đọc
                </button>
                <button class="btn btn-sm btn-outline" onclick="App.copyWritingEssay('${item.id}')" title="Sao chép bài mẫu">
                  📋 Sao chép
                </button>
                <button class="btn btn-sm btn-outline" onclick="App.toggleWritingVi('${item.id}')">
                  ${isViShown ? 'Ẩn bản dịch' : 'Hiện bản dịch'}
                </button>
              </div>
            </div>

            <!-- English Essay Paragraph -->
            <div style="background:var(--surface);border:1.5px solid var(--line);border-radius:12px;padding:16px;font-size:14.5px;line-height:1.75;color:var(--ink);font-weight:500;margin-bottom:14px">
              ${esc(item.content)}
            </div>

            <!-- Vietnamese Translation -->
            ${isViShown ? `
              <div style="background:var(--surface-hover);border-left:4px solid var(--primary);border-radius:8px;padding:12px 14px;font-size:13px;line-height:1.65;color:var(--ink-soft);margin-bottom:14px">
                <b style="color:var(--ink);display:block;margin-bottom:4px">🇻🇳 Bản dịch nghĩa tiếng Việt:</b>
                ${esc(item.vietnamese)}
              </div>
            ` : ''}

            <!-- Collocations Highlight -->
            <div style="border-top:1px dashed var(--line);padding-top:12px">
              <div style="font-size:12px;font-weight:800;color:var(--ink-soft);text-transform:uppercase;margin-bottom:8px">
                💎 Cụm từ vựng ghi điểm (Key Collocations):
              </div>
              <div style="display:flex;flex-wrap:wrap;gap:8px">
                ${(item.keyCollocations || []).map(c => `
                  <button class="collocation-tag" onclick="App.speakWord('${esc(c).replace(/'/g, "\\'")}')" title="Bấm để nghe đọc cụm từ">
                    <span>${esc(c)}</span>
                    <span style="font-size:11px">🔊</span>
                  </button>
                `).join('')}
              </div>
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>`;
  },

  setWritingGrade(grade) {
    this.state.writingFilterGrade = grade;
    this.renderPage();
  },

  filterWritingSearch(query) {
    this.state.writingSearchQuery = query;
    this.renderPage();
  },

  toggleWritingVi(id) {
    if (this.state.writingShowVi[id] === undefined) {
      this.state.writingShowVi[id] = false;
    } else {
      this.state.writingShowVi[id] = !this.state.writingShowVi[id];
    }
    this.renderPage();
  },

  copyWritingEssay(id) {
    const data = typeof GLOBAL_WRITING_MASTER !== 'undefined' ? GLOBAL_WRITING_MASTER : { topics: [] };
    const item = (data.topics || []).find(x => x.id === id);
    if (!item) return;
    navigator.clipboard.writeText(item.content).then(() => {
      UI.toast(` Đã sao chép đoạn văn "${item.title}" vào bộ nhớ tạm!`, 'success');
    }).catch(() => {
      UI.toast('Đã copy nội dung bài viết', 'info');
    });
  },

  speakWritingEssay(id) {
    const data = typeof GLOBAL_WRITING_MASTER !== 'undefined' ? GLOBAL_WRITING_MASTER : { topics: [] };
    const item = (data.topics || []).find(x => x.id === id);
    if (!item) return;
    AudioEngine.playScript(item.content, 0.85);
    UI.toast(`🔊 Đang đọc bài văn mẫu: "${item.title}"`, 'info', 3000);
  },

  // ================================================================
  // PHIẾU TÔ TRẮC NGHIỆM 36 CÂU CHUẨN BGD
  // ================================================================
  renderAnswerSheetView() {
    const cfg = this.state.answerSheetConfig || {
      school: localStorage.getItem('cfg_school_name') || 'TRƯỜNG THCS ĐỒNG YÊN',
      examTitle: 'BÀI KIỂM TRA ĐỊNH KỲ TIẾNG ANH THCS',
      examCode: '701'
    };

    const sheetHtml = typeof ANSWER_SHEET_HELPER !== 'undefined'
      ? ANSWER_SHEET_HELPER.generateAnswerSheetHTML(cfg)
      : '<p>Phiếu trả lời trắc nghiệm đang sẵn sàng...</p>';

    return `
    <div class="page-body slide-up">
      <!-- Toolbar (Hidden when printing) -->
      <div class="card mb-16 no-print">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap">
          <div>
            <div style="font-size:16px;font-weight:800;color:var(--ink)">🖨️ Phiếu Tô Trắc Nghiệm 36 Câu Chuẩn Bộ GD&ĐT</div>
            <div style="font-size:12.5px;color:var(--ink-soft)">Khổ giấy chuẩn A4 – Căn lề chuẩn mực cho học sinh luyện tập tô chì 2B và viết bài tự luận</div>
          </div>
          <div class="row gap-8">
            <button class="btn btn-primary" onclick="App.printAnswerSheet()">
              🖨️ In Phiếu Tô Ngay (Khổ A4)
            </button>
            <button class="btn btn-outline" onclick="App.navigate('dashboard')">
              ← Về Bàn làm việc
            </button>
          </div>
        </div>

        <!-- Sheet Config Inputs -->
        <div class="grid grid-3 gap-12 mt-16 pt-16" style="border-top:1px solid var(--line)">
          <div>
            <label class="form-label" style="font-size:12px">Tên Đơn Vị / Trường Học</label>
            <input type="text" class="input input-sm" value="${esc(cfg.school)}"
              onchange="App.updateAnswerSheetField('school', this.value)">
          </div>
          <div>
            <label class="form-label" style="font-size:12px">Tiêu Đề Bài Kiểm Tra</label>
            <input type="text" class="input input-sm" value="${esc(cfg.examTitle)}"
              onchange="App.updateAnswerSheetField('examTitle', this.value)">
          </div>
          <div>
            <label class="form-label" style="font-size:12px">Mã Đề Mặc Định (3 chữ số)</label>
            <input type="text" class="input input-sm" value="${esc(cfg.examCode)}" maxlength="3"
              onchange="App.updateAnswerSheetField('examCode', this.value)">
          </div>
        </div>
      </div>

      <!-- Printable Sheet Wrapper -->
      <div class="exam-preview-wrap" style="background:#e2e8f0;padding:24px;border-radius:12px;overflow-x:auto">
        <div class="exam-sheet" id="printable-answer-sheet" style="background:#fff;margin:0 auto;box-shadow:0 10px 25px rgba(0,0,0,0.1);max-width:210mm">
          ${sheetHtml}
        </div>
      </div>
    </div>`;
  },

  updateAnswerSheetField(field, val) {
    if (!this.state.answerSheetConfig) {
      this.state.answerSheetConfig = {
        school: 'TRƯỜNG THCS ĐỒNG YÊN',
        examTitle: 'BÀI KIỂM TRA ĐỊNH KỲ TIẾNG ANH THCS',
        examCode: '701'
      };
    }
    this.state.answerSheetConfig[field] = val;
    this.renderPage();
  },

  printAnswerSheet() {
    window.print();
  },

  // ================================================================
  // ĐẤU TRƯỜNG LUYỆN TẬP THỰC HÀNH 5 DẠNG BÀI (PRACTICE ARENA)
  // Tác giả & Bản quyền: Thầy Đinh Văn Thành – THCS Đồng Yên
  // ================================================================
  renderPracticeArena() {
    const pa = this.state.practiceArena;
    const grade = pa.grade || 7;
    const tab = pa.activeTab || 'scramble';

    const tabs = [
      { id: 'scramble', name: 'Ghép từ thành câu', icon: '🧩', badge: 'Word Scramble' },
      { id: 'mistake', name: 'Tìm & Sửa lỗi sai', icon: '🔍', badge: 'Mistake Hunter' },
      { id: 'transform', name: 'Viết lại câu', icon: '🔄', badge: 'Sentence Transform' },
      { id: 'match', name: 'Ghép thẻ bài 3D', icon: '🃏', badge: 'Match Game' },
      { id: 'cloze', name: 'Điền từ đoạn văn', icon: '📝', badge: 'Cloze Test' }
    ];

    return `
    <div class="page-body slide-up" style="max-width:1050px;margin:0 auto">
      <!-- Arena Hero Header -->
      <div class="arena-hero">
        <div style="display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,0.18);padding:5px 14px;border-radius:999px;font-size:12px;font-weight:700;margin-bottom:12px">
          <span>🏆 ĐẤU TRƯỜNG THỰC HÀNH TƯƠNG TÁC</span>
          <span>•</span>
          <span>GLOBAL SUCCESS (LỚP 6, 7, 8, 9)</span>
        </div>
        <h1 style="font-size:26px;font-weight:900;margin:0 0 8px;color:#fff">
          🎮 Đấu Trường Luyện Tập Tiếng Anh Thực Hành
        </h1>
        <p style="color:#e0e7ff;font-size:14px;max-width:720px;line-height:1.5;margin:0 0 18px">
          Hệ sinh thái bài tập thực hành tương tác chuyên sâu của <b>Thầy Đinh Văn Thành</b> (THCS Đồng Yên). Bứt phá tư duy ngữ pháp, từ vựng và kỹ năng làm bài thi thông qua 5 dạng bài tập hiện đại nhất có âm thanh và pháo hoa khen thưởng.
        </p>

        <!-- Grade Selection Bar -->
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
          <span style="font-size:13px;font-weight:700;color:#cbd5e1">Khối lớp thực hành:</span>
          ${[6, 7, 8, 9].map(g => `
          <button class="btn btn-sm" onclick="App.setArenaGrade(${g})"
            style="${grade === g ? 'background:#f59e0b;color:#1e1b4b;font-weight:900;border:none;box-shadow:0 4px 12px rgba(245,158,11,0.4)' : 'background:rgba(255,255,255,0.15);color:#fff;border:1px solid rgba(255,255,255,0.3)'}">
            Lớp ${g}
          </button>`).join('')}
        </div>
      </div>

      <!-- 5 Dạng Tab Navigation -->
      <div class="row gap-8 mb-20" style="overflow-x:auto;padding-bottom:6px">
        ${tabs.map(t => `
        <button class="btn ${tab === t.id ? 'btn-primary' : 'btn-outline'}" onclick="App.setArenaTab('${t.id}')"
          style="display:flex;align-items:center;gap:8px;padding:10px 16px;border-radius:12px;font-weight:700;white-space:nowrap">
          <span style="font-size:18px">${t.icon}</span>
          <span>${t.name}</span>
          <span style="font-size:10.5px;padding:2px 8px;border-radius:999px;background:${tab === t.id ? 'rgba(255,255,255,0.25)' : 'var(--surface-2)'};color:${tab === t.id ? '#fff' : 'var(--ink-soft)'}">
            ${t.badge}
          </span>
        </button>`).join('')}
      </div>

      <!-- Tab Content Renderers -->
      ${tab === 'scramble' ? this.renderArenaScramble(grade) : ''}
      ${tab === 'mistake' ? this.renderArenaMistake(grade) : ''}
      ${tab === 'transform' ? this.renderArenaTransform(grade) : ''}
      ${tab === 'match' ? this.renderArenaMatch(grade) : ''}
      ${tab === 'cloze' ? this.renderArenaCloze(grade) : ''}
    </div>`;
  },

  // ── Dạng 1: Word Scramble / Sentence Builder ──────────────────────
  renderArenaScramble(grade) {
    const list = (typeof PRACTICE_SCRAMBLE_DATA !== 'undefined' ? PRACTICE_SCRAMBLE_DATA : []).filter(item => item.grade === grade);
    if (!list.length) return `<div class="card p-24 text-center">Đang cập nhật dữ liệu Ghép từ Lớp ${grade}...</div>`;

    const pa = this.state.practiceArena;
    const curIdx = pa.scrambleIndex % list.length;
    const curItem = list[curIdx];

    const pickedIndices = pa.scramblePicked || [];
    const unpickedIndices = curItem.words.map((w, idx) => idx).filter(idx => !pickedIndices.includes(idx));

    return `
    <div class="card p-24" style="border-radius:16px">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:16px">
        <div class="row gap-8 align-center">
          <span class="tag tag-nb">Lớp ${grade} · ${esc(curItem.unit)}</span>
          <span style="font-size:13px;font-weight:700;color:var(--ink-soft)">Câu ${curIdx + 1} / ${list.length}</span>
        </div>
        <div class="row gap-8">
          <button class="btn btn-sm btn-outline" onclick="App.prevScramble()" ${curIdx === 0 ? 'disabled' : ''}>← Câu trước</button>
          <button class="btn btn-sm btn-outline" onclick="App.nextScramble()">Câu tiếp →</button>
        </div>
      </div>

      <div style="font-size:15px;font-weight:700;color:var(--ink);margin-bottom:12px">
        🧩 ${esc(curItem.hint)}
      </div>

      <!-- Scramble Target Tray -->
      <div class="scramble-target-tray ${pa.scrambleChecked ? (pa.scrambleIsCorrect ? 'correct' : 'incorrect') : ''}" id="scramble-tray">
        ${pickedIndices.length === 0 ? `
          <div style="color:#94a3b8;font-size:13px;font-style:italic;padding:8px">
            👉 Bấm vào các thẻ từ vựng bên dưới theo đúng thứ tự để xếp thành câu hoàn chỉnh...
          </div>
        ` : pickedIndices.map((origIdx, trayIdx) => `
          <div class="scramble-chip in-tray" onclick="App.unpickScrambleChip(${trayIdx})">
            ${esc(curItem.words[origIdx])} ✕
          </div>
        `).join('')}
      </div>

      <!-- Word Pool -->
      <div style="font-size:12.5px;font-weight:700;color:var(--ink-soft);margin-bottom:8px">Kho từ khả dụng (nhấp để đưa vào câu):</div>
      <div class="scramble-pool mb-20">
        ${unpickedIndices.length === 0 ? `
          <span style="color:#10b981;font-size:13px;font-weight:600;padding:6px">✓ Đã đưa hết các từ lên khay sắp xếp</span>
        ` : unpickedIndices.map(origIdx => `
          <div class="scramble-chip" onclick="App.pickScrambleChip(${origIdx})">
            ${esc(curItem.words[origIdx])}
          </div>
        `).join('')}
      </div>

      <!-- Action Buttons -->
      <div class="row gap-12 align-center flex-wrap mb-16">
        <button class="btn btn-primary" onclick="App.checkScramble()" ${pickedIndices.length === 0 ? 'disabled' : ''}>
          ✓ Kiểm tra đáp án
        </button>
        <button class="btn btn-outline" onclick="App.resetScramble()">
          🔄 Xếp lại từ đầu
        </button>
        <button class="btn btn-ghost" onclick="AudioEngine.playScript('${esc(curItem.correctSentence)}', 0.85)">
          🔊 Nghe đọc câu mẫu chuẩn
        </button>
      </div>

      <!-- Feedback / Grammar Rule Box -->
      ${pa.scrambleChecked ? `
        <div class="p-16 border-radius-12 mt-12"
          style="border-radius:12px;background:${pa.scrambleIsCorrect ? '#f0fdf4' : '#fef2f2'};border:1.5px solid ${pa.scrambleIsCorrect ? '#22c55e' : '#ef4444'}">
          <div style="font-weight:800;font-size:15px;color:${pa.scrambleIsCorrect ? '#166534' : '#991b1b'};margin-bottom:6px">
            ${pa.scrambleIsCorrect ? '🎉 Xuất sắc! Bạn đã sắp xếp câu hoàn toàn chính xác!' : '❌ Chưa chính xác rồi, hãy kiểm tra lại trật tự các từ nhé!'}
          </div>
          <div style="font-size:14px;color:#1e293b;margin-bottom:4px">
            <b>Đáp án chuẩn:</b> <span style="color:#0284c7;font-weight:700">${esc(curItem.correctSentence)}</span>
          </div>
          <div style="font-size:13.5px;color:#475569;margin-bottom:4px">
            <b>Dịch nghĩa:</b> ${esc(curItem.meaning)}
          </div>
          <div style="font-size:13px;color:#6366f1;font-weight:600">
            💡 <b>Quy tắc ngữ pháp:</b> ${esc(curItem.grammarRule)}
          </div>
        </div>
      ` : ''}
    </div>`;
  },

  // ── Dạng 2: Find & Correct The Mistake ───────────────────────────
  renderArenaMistake(grade) {
    const list = (typeof PRACTICE_MISTAKE_DATA !== 'undefined' ? PRACTICE_MISTAKE_DATA : []).filter(item => item.grade === grade);
    if (!list.length) return `<div class="card p-24 text-center">Đang cập nhật dữ liệu Tìm lỗi sai Lớp ${grade}...</div>`;

    const pa = this.state.practiceArena;
    const curIdx = pa.mistakeIndex % list.length;
    const curItem = list[curIdx];
    const selected = pa.mistakeSelected;

    let renderedSentence = curItem.sentence.replace(/\[([A-D]):\s*([^\]]+)\]/g, (match, part, word) => {
      let extraClass = '';
      if (selected) {
        if (selected === part) {
          extraClass = (part === curItem.wrongPart) ? 'selected-correct' : 'selected-wrong';
        } else if (part === curItem.wrongPart) {
          extraClass = 'selected-correct';
        }
      }
      return `<span class="mistake-choice ${extraClass}" onclick="App.selectMistakePart('${part}')"><u>(${part}) ${esc(word)}</u></span>`;
    });

    return `
    <div class="card p-24" style="border-radius:16px">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:16px">
        <div class="row gap-8 align-center">
          <span class="tag tag-nb">Lớp ${grade} · ${esc(curItem.unit)}</span>
          <span style="font-size:13px;font-weight:700;color:var(--ink-soft)">Câu ${curIdx + 1} / ${list.length}</span>
        </div>
        <div class="row gap-8">
          <button class="btn btn-sm btn-outline" onclick="App.prevMistake()" ${curIdx === 0 ? 'disabled' : ''}>← Câu trước</button>
          <button class="btn btn-sm btn-outline" onclick="App.nextMistake()">Câu tiếp →</button>
        </div>
      </div>

      <div style="font-size:15px;font-weight:700;color:var(--ink);margin-bottom:14px">
        🔍 Bấm trực tiếp vào 1 trong 4 phần gạch chân (A, B, C, D) chứa lỗi sai ngữ pháp:
      </div>

      <!-- Mistake sentence box -->
      <div class="card p-20 mb-20" style="background:var(--surface-2);border-left:5px solid #6366f1;border-radius:12px">
        <div class="mistake-sentence">
          ${renderedSentence}
        </div>
      </div>

      <!-- Feedback banner -->
      ${selected ? `
        <div class="p-16 mb-16" style="border-radius:12px;background:${selected === curItem.wrongPart ? '#f0fdf4' : '#fef2f2'};border:1.5px solid ${selected === curItem.wrongPart ? '#22c55e' : '#ef4444'}">
          <div style="font-weight:800;font-size:15px;color:${selected === curItem.wrongPart ? '#166534' : '#991b1b'};margin-bottom:6px">
            ${selected === curItem.wrongPart ? `🎉 Chính xác! Lỗi sai nằm ở đáp án [${curItem.wrongPart}]` : `❌ Chưa đúng! Phần [${selected}] đúng ngữ pháp. Lỗi sai thực tế nằm ở [${curItem.wrongPart}].`}
          </div>
          <div style="font-size:14px;color:#1e293b;margin-bottom:4px">
            <b>Cần sửa lại:</b> <span style="text-decoration:line-through;color:#ef4444">${esc(curItem.wrongWord)}</span> ➔ <b style="color:#16a34a">${esc(curItem.correctWord)}</b>
          </div>
          <div style="font-size:13.5px;color:#475569">
            💡 <b>Giải thích chi tiết:</b> ${esc(curItem.explanation)}
          </div>
        </div>
      ` : ''}

      <div class="row gap-12 align-center">
        <button class="btn btn-primary" onclick="App.nextMistake()">Câu tiếp theo →</button>
        <button class="btn btn-ghost" onclick="AudioEngine.playScript('${esc(curItem.sentence.replace(/\[[A-D]:\s*([^\]]+)\]/g, '$2'))}', 0.85)">
          🔊 Nghe đọc câu gốc
        </button>
      </div>
    </div>`;
  },

  // ── Dạng 3: Sentence Transformation ──────────────────────────────
  renderArenaTransform(grade) {
    const list = (typeof PRACTICE_TRANSFORM_DATA !== 'undefined' ? PRACTICE_TRANSFORM_DATA : []).filter(item => item.grade === grade);
    if (!list.length) return `<div class="card p-24 text-center">Đang cập nhật dữ liệu Viết lại câu Lớp ${grade}...</div>`;

    const pa = this.state.practiceArena;
    const curIdx = pa.transformIndex % list.length;
    const curItem = list[curIdx];
    const selected = pa.transformSelected;

    return `
    <div class="card p-24" style="border-radius:16px">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:16px">
        <div class="row gap-8 align-center">
          <span class="tag tag-nb">Lớp ${grade} · ${esc(curItem.unit)}</span>
          <span style="font-size:13px;font-weight:700;color:var(--ink-soft)">Câu ${curIdx + 1} / ${list.length}</span>
        </div>
        <div class="row gap-8">
          <button class="btn btn-sm btn-outline" onclick="App.prevTransform()" ${curIdx === 0 ? 'disabled' : ''}>← Câu trước</button>
          <button class="btn btn-sm btn-outline" onclick="App.nextTransform()">Câu tiếp →</button>
        </div>
      </div>

      <div style="font-size:13.5px;color:var(--ink-soft);margin-bottom:6px">Câu ban đầu:</div>
      <div class="transform-original-box">
        "${esc(curItem.original)}"
      </div>

      <div style="font-size:14.5px;font-weight:700;color:var(--ink);margin-bottom:14px">
        🔄 Chọn phần hoàn thành câu viết lại bắt đầu bằng: <span style="color:#2563eb;font-weight:800">"${esc(curItem.beginWith)} ..."</span>
      </div>

      <!-- 4 Multiple Choice Options -->
      <div class="stack gap-10 mb-20">
        ${curItem.options.map((opt, idx) => {
          const isCorrect = (opt.trim() === curItem.correctAnswer.trim());
          let optStyle = 'border:1.5px solid var(--line);background:var(--surface);';
          if (selected !== null) {
            if (idx === selected) {
              optStyle = isCorrect
                ? 'border:2px solid #22c55e;background:#f0fdf4;box-shadow:0 0 10px rgba(34,197,94,0.2);'
                : 'border:2px solid #ef4444;background:#fef2f2;';
            } else if (isCorrect) {
              optStyle = 'border:2px solid #22c55e;background:#f0fdf4;';
            }
          }
          return `
          <div class="card p-14" style="cursor:pointer;border-radius:10px;transition:all 0.15s;${optStyle}"
               onclick="App.selectTransformOption(${idx})">
            <div style="display:flex;align-items:flex-start;gap:10px">
              <span style="width:24px;height:24px;border-radius:50%;background:${selected === idx ? (isCorrect ? '#22c55e' : '#ef4444') : '#e2e8f0'};color:${selected === idx ? '#fff' : '#475569'};display:inline-flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;flex-shrink:0">
                ${String.fromCharCode(65 + idx)}
              </span>
              <div style="font-size:14.5px;font-weight:600;color:var(--ink);line-height:1.4">
                <b>${esc(curItem.beginWith)}</b> ${esc(opt)}
              </div>
            </div>
          </div>`;
        }).join('')}
      </div>

      <!-- Explanation banner -->
      ${selected !== null ? `
        <div class="p-16 mb-16" style="border-radius:12px;background:${curItem.options[selected].trim() === curItem.correctAnswer.trim() ? '#f0fdf4' : '#fef2f2'};border:1.5px solid ${curItem.options[selected].trim() === curItem.correctAnswer.trim() ? '#22c55e' : '#ef4444'}">
          <div style="font-weight:800;font-size:15px;color:${curItem.options[selected].trim() === curItem.correctAnswer.trim() ? '#166534' : '#991b1b'};margin-bottom:6px">
            ${curItem.options[selected].trim() === curItem.correctAnswer.trim() ? '🎉 Chính xác! Câu viết lại có nghĩa và cấu trúc tương đương chuẩn xác!' : '❌ Chưa chính xác! Hãy quan sát cấu trúc tương đương bên dưới:'}
          </div>
          <div style="font-size:14px;color:#1e293b;margin-bottom:4px">
            <b>Câu hoàn chỉnh:</b> <span style="color:#0284c7;font-weight:700">${esc(curItem.beginWith)} ${esc(curItem.correctAnswer)}</span>
          </div>
          <div style="font-size:13.5px;color:#475569">
            💡 <b>Giải thích cấu trúc:</b> ${esc(curItem.explanation)}
          </div>
        </div>
      ` : ''}

      <div class="row gap-12 align-center">
        <button class="btn btn-primary" onclick="App.nextTransform()">Câu tiếp theo →</button>
        <button class="btn btn-ghost" onclick="AudioEngine.playScript('${esc(curItem.beginWith)} ${esc(curItem.correctAnswer)}', 0.85)">
          🔊 Nghe đọc câu viết lại
        </button>
      </div>
    </div>`;
  },

  // ── Dạng 4: Match Pairs 3D Game ──────────────────────────────────
  renderArenaMatch(grade) {
    const list = (typeof PRACTICE_MATCHING_DATA !== 'undefined' ? PRACTICE_MATCHING_DATA : []).filter(item => item.grade === grade);
    if (!list.length) return `<div class="card p-24 text-center">Đang cập nhật dữ liệu Ghép thẻ Lớp ${grade}...</div>`;

    const matchSet = list[0];
    const pa = this.state.practiceArena;

    if (!pa.matchShuffledTiles || pa.matchShuffledTilesGrade !== grade) {
      const tiles = [];
      matchSet.pairs.forEach((p, idx) => {
        tiles.push({ id: `en-${idx}`, pairId: idx, text: p.en, icon: p.icon, type: 'en' });
        tiles.push({ id: `vi-${idx}`, pairId: idx, text: p.vi, icon: p.icon, type: 'vi' });
      });
      for (let i = tiles.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
      }
      pa.matchShuffledTiles = tiles;
      pa.matchShuffledTilesGrade = grade;
      pa.matchPairsDone = [];
      pa.matchSelected = null;
    }

    const doneCount = (pa.matchPairsDone || []).length;
    const totalPairs = matchSet.pairs.length;
    const isCompleted = doneCount === totalPairs;

    return `
    <div class="card p-24" style="border-radius:16px">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:16px">
        <div>
          <span class="tag tag-nb">Lớp ${grade} · Game Ghép Thẻ</span>
          <h3 style="font-size:16px;font-weight:800;color:var(--ink);margin-top:4px">${esc(matchSet.title)}</h3>
        </div>
        <div class="row gap-8 align-center">
          <span style="font-size:13px;font-weight:700;color:#10b981;background:#ecfdf5;padding:4px 12px;border-radius:999px">
            ⭐ Đã ghép: ${doneCount} / ${totalPairs} cặp
          </span>
          <button class="btn btn-sm btn-outline" onclick="App.resetMatchGame()">🔄 Chơi lại</button>
        </div>
      </div>

      <div style="font-size:14px;color:var(--ink-soft);margin-bottom:16px">
        👉 Bấm chọn 1 thẻ Tiếng Anh và 1 thẻ Tiếng Việt tương ứng để ghép đôi. Ghép đúng thẻ sẽ chuyển màu xanh!
      </div>

      ${isCompleted ? `
        <div class="p-20 text-center mb-20" style="background:linear-gradient(135deg,#ecfdf5,#d1fae5);border:2px solid #10b981;border-radius:16px">
          <div style="font-size:48px;margin-bottom:8px">🎉 🏆 🌟</div>
          <h2 style="font-size:22px;font-weight:900;color:#065f46;margin:0 0 6px">CHÚC MỪNG BẠN ĐÃ CHIẾN THẮNG!</h2>
          <p style="color:#047857;font-size:14px;margin:0 0 16px">Bạn đã ghép chính xác toàn bộ ${totalPairs} cặp từ vựng Lớp ${grade}!</p>
          <button class="btn btn-primary" onclick="App.resetMatchGame()">
            🎮 Chơi lại ván mới (Xáo trộn thẻ)
          </button>
        </div>
      ` : ''}

      <!-- Grid of 12 Tiles -->
      <div class="match-arena-grid">
        ${pa.matchShuffledTiles.map(tile => {
          const isDone = (pa.matchPairsDone || []).includes(tile.pairId);
          const isSelected = pa.matchSelected && pa.matchSelected.id === tile.id;
          let tileClass = 'match-tile';
          if (isDone) tileClass += ' matched';
          else if (isSelected) tileClass += ' selected';

          return `
          <div class="${tileClass}" onclick="App.selectMatchTile('${tile.id}', ${tile.pairId}, '${tile.type}')">
            <div style="font-size:26px;margin-bottom:6px">${tile.icon}</div>
            <div style="font-size:${tile.type === 'en' ? '15px' : '13px'};font-weight:700;color:${tile.type === 'en' ? '#1e3a8a' : '#059669'}">
              ${esc(tile.text)}
            </div>
            <small style="font-size:10px;color:#94a3b8;margin-top:4px">
              ${isDone ? '✓ Đã ghép' : (tile.type === 'en' ? 'English' : 'Tiếng Việt')}
            </small>
          </div>`;
        }).join('')}
      </div>
    </div>`;
  },

  // ── Dạng 5: Cloze Test / Word Bank ──────────────────────────────
  renderArenaCloze(grade) {
    const list = (typeof PRACTICE_CLOZE_DATA !== 'undefined' ? PRACTICE_CLOZE_DATA : []).filter(item => item.grade === grade);
    if (!list.length) return `<div class="card p-24 text-center">Đang cập nhật dữ liệu Điền từ Lớp ${grade}...</div>`;

    const curItem = list[0];
    const pa = this.state.practiceArena;
    const selections = pa.clozeSelections || {};
    const checked = pa.clozeChecked;

    let passageHtml = curItem.passageTemplate.replace(/\[([1-5])\]/g, (match, slotNum) => {
      const chosenWord = selections[slotNum] || '';
      const isCorrect = chosenWord.toLowerCase() === (curItem.answers[slotNum] || '').toLowerCase();
      let slotStyle = 'padding:4px 10px;font-size:14px;font-weight:700;border-radius:8px;margin:0 4px;';
      if (checked) {
        slotStyle += isCorrect ? 'background:#dcfce7;border:2px solid #22c55e;color:#166534;' : 'background:#fee2e2;border:2px solid #ef4444;color:#991b1b;'
      } else {
        slotStyle += 'background:#eff6ff;border:1.5px solid #3b82f6;color:#1d4ed8;'
      }

      return `
      <select style="${slotStyle}" onchange="App.selectClozeWord(${slotNum}, this.value)" ${checked ? 'disabled' : ''}>
        <option value="">-- [${slotNum}] Chọn từ --</option>
        ${curItem.wordBank.map(w => `
          <option value="${esc(w)}" ${chosenWord === w ? 'selected' : ''}>${esc(w)}</option>
        `).join('')}
      </select>`;
    });

    let score = 0;
    if (checked) {
      Object.keys(curItem.answers).forEach(slotNum => {
        if ((selections[slotNum] || '').toLowerCase() === curItem.answers[slotNum].toLowerCase()) {
          score++;
        }
      });
    }

    return `
    <div class="card p-24" style="border-radius:16px">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:16px">
        <div>
          <span class="tag tag-nb">Lớp ${grade} · Cloze Test</span>
          <h3 style="font-size:16px;font-weight:800;color:var(--ink);margin-top:4px">${esc(curItem.title)}</h3>
        </div>
        <div class="row gap-8 align-center">
          <button class="btn btn-sm btn-outline" onclick="App.resetCloze()">🔄 Làm lại</button>
        </div>
      </div>

      <!-- Word Bank Box -->
      <div class="cloze-bank-box mb-20">
        <div style="font-size:12.5px;font-weight:700;color:#1e3a8a;margin-bottom:8px">
          📦 NGÂN HÀNG TỪ VỰNG KHẢ DỤNG (WORD BANK):
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:8px">
          ${curItem.wordBank.map(w => `
            <span class="cloze-bank-word" onclick="AudioEngine.playScript('${w}', 0.85)">
              🔊 ${esc(w)}
            </span>
          `).join('')}
        </div>
      </div>

      <!-- Passage Box -->
      <div class="cloze-passage-box mb-20" style="line-height:2.2;font-size:16px">
        ${passageHtml}
      </div>

      <!-- Actions -->
      <div class="row gap-12 align-center flex-wrap mb-16">
        <button class="btn btn-primary" onclick="App.checkClozeAnswers()">
          ✓ Chấm điểm đoạn văn
        </button>
        <button class="btn btn-ghost" onclick="AudioEngine.playScript('${esc(curItem.passageTemplate.replace(/\[([1-5])\]/g, (m, s) => curItem.answers[s]))}', 0.85)">
          🔊 Nghe toàn bộ đoạn văn chuẩn (AI Voice)
        </button>
      </div>

      <!-- Result Banner -->
      ${checked ? `
        <div class="p-16 border-radius-12" style="border-radius:12px;background:${score === 5 ? '#f0fdf4' : '#fef2f2'};border:1.5px solid ${score === 5 ? '#22c55e' : '#ef4444'}">
          <div style="font-weight:800;font-size:15px;color:${score === 5 ? '#166534' : '#991b1b'};margin-bottom:6px">
            ${score === 5 ? '🎉 Hoàn hảo! Bạn đạt 5/5 điểm tuyệt đối!' : `Điểm số của bạn: ${score} / 5 vị trí đúng. Hãy xem đáp án chi tiết bên dưới:`}
          </div>
          <div style="font-size:13.5px;color:#334155">
            <b>Đáp án đúng:</b>
            ${Object.entries(curItem.answers).map(([k, v]) => `[${k}] <b>${esc(v)}</b>`).join(' &nbsp;•&nbsp; ')}
          </div>
        </div>
      ` : ''}
    </div>`;
  },

  // ── Arena Controller Methods ─────────────────────────────────────
  setArenaTab(tab) {
    this.state.practiceArena.activeTab = tab;
    this.renderPage();
  },

  setArenaGrade(grade) {
    this.state.practiceArena.grade = grade;
    this.state.practiceArena.scrambleIndex = 0;
    this.state.practiceArena.scramblePicked = [];
    this.state.practiceArena.scrambleChecked = false;
    this.state.practiceArena.mistakeIndex = 0;
    this.state.practiceArena.mistakeSelected = null;
    this.state.practiceArena.transformIndex = 0;
    this.state.practiceArena.transformSelected = null;
    this.state.practiceArena.matchShuffledTiles = null;
    this.state.practiceArena.matchPairsDone = [];
    this.state.practiceArena.clozeSelections = {};
    this.state.practiceArena.clozeChecked = false;
    this.renderPage();
  },

  pickScrambleChip(origIdx) {
    const pa = this.state.practiceArena;
    if (!pa.scramblePicked) pa.scramblePicked = [];
    if (!pa.scramblePicked.includes(origIdx)) {
      pa.scramblePicked.push(origIdx);
      pa.scrambleChecked = false;
      this.renderPage();
    }
  },

  unpickScrambleChip(trayIdx) {
    const pa = this.state.practiceArena;
    if (pa.scramblePicked) {
      pa.scramblePicked.splice(trayIdx, 1);
      pa.scrambleChecked = false;
      this.renderPage();
    }
  },

  checkScramble() {
    const pa = this.state.practiceArena;
    const list = (typeof PRACTICE_SCRAMBLE_DATA !== 'undefined' ? PRACTICE_SCRAMBLE_DATA : []).filter(item => item.grade === pa.grade);
    const curItem = list[pa.scrambleIndex % list.length];
    if (!curItem) return;

    const userSentence = (pa.scramblePicked || []).map(idx => curItem.words[idx]).join(' ').trim();
    const correctClean = curItem.correctSentence.trim();

    pa.scrambleChecked = true;
    pa.scrambleIsCorrect = (userSentence.toLowerCase() === correctClean.toLowerCase());

    if (pa.scrambleIsCorrect) {
      AudioEngine.playChime('celebrate');
      if (typeof confetti === 'function') {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
      }
      UI.toast('Chính xác! Xuất sắc!', 'success');
    } else {
      AudioEngine.playChime('error');
      UI.toast('Chưa đúng trật tự từ, hãy thử lại!', 'warn');
    }
    this.renderPage();
  },

  resetScramble() {
    const pa = this.state.practiceArena;
    pa.scramblePicked = [];
    pa.scrambleChecked = false;
    pa.scrambleIsCorrect = false;
    this.renderPage();
  },

  nextScramble() {
    const pa = this.state.practiceArena;
    pa.scrambleIndex++;
    pa.scramblePicked = [];
    pa.scrambleChecked = false;
    pa.scrambleIsCorrect = false;
    this.renderPage();
  },

  prevScramble() {
    const pa = this.state.practiceArena;
    if (pa.scrambleIndex > 0) pa.scrambleIndex--;
    pa.scramblePicked = [];
    pa.scrambleChecked = false;
    pa.scrambleIsCorrect = false;
    this.renderPage();
  },

  selectMistakePart(part) {
    const pa = this.state.practiceArena;
    const list = (typeof PRACTICE_MISTAKE_DATA !== 'undefined' ? PRACTICE_MISTAKE_DATA : []).filter(item => item.grade === pa.grade);
    const curItem = list[pa.mistakeIndex % list.length];
    if (!curItem) return;

    pa.mistakeSelected = part;
    if (part === curItem.wrongPart) {
      AudioEngine.playChime('success');
      UI.toast(`Chính xác! Lỗi sai ở [${part}]`, 'success');
    } else {
      AudioEngine.playChime('error');
      UI.toast(`Chưa đúng, [${part}] không có lỗi`, 'warn');
    }
    this.renderPage();
  },

  nextMistake() {
    const pa = this.state.practiceArena;
    pa.mistakeIndex++;
    pa.mistakeSelected = null;
    this.renderPage();
  },

  prevMistake() {
    const pa = this.state.practiceArena;
    if (pa.mistakeIndex > 0) pa.mistakeIndex--;
    pa.mistakeSelected = null;
    this.renderPage();
  },

  selectTransformOption(optIdx) {
    const pa = this.state.practiceArena;
    const list = (typeof PRACTICE_TRANSFORM_DATA !== 'undefined' ? PRACTICE_TRANSFORM_DATA : []).filter(item => item.grade === pa.grade);
    const curItem = list[pa.transformIndex % list.length];
    if (!curItem) return;

    pa.transformSelected = optIdx;
    const isCorrect = (curItem.options[optIdx].trim() === curItem.correctAnswer.trim());
    if (isCorrect) {
      AudioEngine.playChime('success');
      UI.toast('Chính xác! Câu viết lại chuẩn 100%', 'success');
    } else {
      AudioEngine.playChime('error');
      UI.toast('Chưa chính xác, hãy xem phân tích ngữ pháp', 'warn');
    }
    this.renderPage();
  },

  nextTransform() {
    const pa = this.state.practiceArena;
    pa.transformIndex++;
    pa.transformSelected = null;
    this.renderPage();
  },

  prevTransform() {
    const pa = this.state.practiceArena;
    if (pa.transformIndex > 0) pa.transformIndex--;
    pa.transformSelected = null;
    this.renderPage();
  },

  selectMatchTile(tileId, pairId, type) {
    const pa = this.state.practiceArena;
    if (!pa.matchPairsDone) pa.matchPairsDone = [];

    if (pa.matchPairsDone.includes(pairId)) return;

    if (!pa.matchSelected) {
      pa.matchSelected = { id: tileId, pairId, type };
      this.renderPage();
      return;
    }

    if (pa.matchSelected.id === tileId) {
      pa.matchSelected = null;
      this.renderPage();
      return;
    }

    if (pa.matchSelected.type === type) {
      pa.matchSelected = { id: tileId, pairId, type };
      this.renderPage();
      return;
    }

    if (pa.matchSelected.pairId === pairId) {
      pa.matchPairsDone.push(pairId);
      pa.matchSelected = null;
      AudioEngine.playChime('success');

      const list = (typeof PRACTICE_MATCHING_DATA !== 'undefined' ? PRACTICE_MATCHING_DATA : []).filter(item => item.grade === pa.grade);
      const totalPairs = (list[0] && list[0].pairs.length) || 6;
      if (pa.matchPairsDone.length >= totalPairs) {
        AudioEngine.playChime('celebrate');
        if (typeof confetti === 'function') {
          confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
        }
        UI.toast('Tuyệt vời! Bạn đã hoàn thành toàn bộ ván ghép thẻ!', 'success');
      }
      this.renderPage();
    } else {
      AudioEngine.playChime('error');
      UI.toast('Chưa khớp nghĩa, hãy thử lại!', 'warn');
      pa.matchSelected = null;
      this.renderPage();
    }
  },

  resetMatchGame() {
    const pa = this.state.practiceArena;
    pa.matchShuffledTiles = null;
    pa.matchPairsDone = [];
    pa.matchSelected = null;
    this.renderPage();
  },

  selectClozeWord(slotNum, word) {
    if (!this.state.practiceArena.clozeSelections) {
      this.state.practiceArena.clozeSelections = {};
    }
    this.state.practiceArena.clozeSelections[slotNum] = word;
    this.state.practiceArena.clozeChecked = false;
    this.renderPage();
  },

  checkClozeAnswers() {
    const pa = this.state.practiceArena;
    pa.clozeChecked = true;
    const list = (typeof PRACTICE_CLOZE_DATA !== 'undefined' ? PRACTICE_CLOZE_DATA : []).filter(item => item.grade === pa.grade);
    const curItem = list[0];
    if (!curItem) return;

    let score = 0;
    Object.keys(curItem.answers).forEach(slotNum => {
      if ((pa.clozeSelections[slotNum] || '').toLowerCase() === curItem.answers[slotNum].toLowerCase()) {
        score++;
      }
    });

    if (score === 5) {
      AudioEngine.playChime('celebrate');
      if (typeof confetti === 'function') {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      }
      UI.toast('Tuyệt đối 5/5! Bạn quá thông minh!', 'success');
    } else {
      AudioEngine.playChime('error');
      UI.toast(`Bạn làm đúng ${score}/5 vị trí`, 'info');
    }
    this.renderPage();
  },

  resetCloze() {
    this.state.practiceArena.clozeSelections = {};
    this.state.practiceArena.clozeChecked = false;
    this.renderPage();
  }
};

// ── Khởi động ứng dụng ───────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
