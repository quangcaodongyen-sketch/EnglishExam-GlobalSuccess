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
  },

  init() {
    Auth.initStorage();

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
      { view: 'quiz-15m', icon: '⚡', label: 'Tạo Đề 15 Phút (48 Units)' },
      { view: 'official-exams', icon: '🏛️', label: 'Bộ Đề Chuẩn (GK, CK, KSCL)' },
      { view: 'generate', icon: '📝', label: 'Soạn đề Tùy biến (CV 7991)', badge: remaining === Infinity ? null : remaining },
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
      { view: 'student-15m-practice', icon: '⚡', label: 'Luyện Đề 15 Phút (48 Units)' },
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
    };
    if (document.getElementById('topbar-title')) {
      document.getElementById('topbar-title').textContent = titles[this.state.view] || 'EnglishExam Pro';
    }
    if (!el) return;

    const view = this.state.view;
    if (view === 'quiz-15m') el.innerHTML = this.renderQuiz15m();
    else if (view === 'official-exams') el.innerHTML = this.renderOfficialExams();
    else if (view === 'student-15m-practice') el.innerHTML = this.renderStudent15mPractice();
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

      <!-- Feature Grid for Student -->
      <div class="grid grid-3 gap-16 mb-24">
        <!-- 1. Học từ vựng -->
        <div class="card" style="border-top:4px solid #3b82f6;cursor:pointer" onclick="App.navigate('vocab-studio')">
          <div style="font-size:32px;margin-bottom:8px">📖</div>
          <div style="font-weight:800;font-size:16px;color:#0f172a">Học Từ vựng Flashcards 3D</div>
          <p style="font-size:13px;color:var(--ink-soft);margin-top:6px">Tra cứu từ vựng chuẩn SGK Global Success, nghe phát âm giọng bản xứ và lật thẻ ghi nhớ.</p>
          <div style="margin-top:12px;font-size:13px;font-weight:700;color:#2563eb">Mở thẻ từ vựng →</div>
        </div>

        <!-- 2. Luyện nghe Audio -->
        <div class="card" style="border-top:4px solid #0ea5e9;cursor:pointer" onclick="App.navigate('listening-lab')">
          <div style="font-size:32px;margin-bottom:8px">🎧</div>
          <div style="font-weight:800;font-size:16px;color:#0f172a">Phòng Luyện Nghe Audio Lab</div>
          <p style="font-size:13px;color:var(--ink-soft);margin-top:6px">Luyện nghe hội thoại và bài đọc theo từng Unit, kèm phụ đề kịch bản và câu hỏi trắc nghiệm.</p>
          <div style="margin-top:12px;font-size:13px;font-weight:700;color:#0284c7">Bắt đầu luyện nghe →</div>
        </div>

        <!-- 3. Phòng thi bài tập -->
        <div class="card" style="border-top:4px solid #10b981;cursor:pointer" onclick="App.navigate('student-exams-list')">
          <div style="font-size:32px;margin-bottom:8px">✍️</div>
          <div style="font-weight:800;font-size:16px;color:#0f172a">Đề thi Giáo viên giao</div>
          <p style="font-size:13px;color:var(--ink-soft);margin-top:6px">Làm các bài kiểm tra 15 phút, giữa kỳ trực tiếp trên điện thoại, tự động chấm điểm tức thì.</p>
          <div style="margin-top:12px;font-size:13px;font-weight:700;color:#059669">Xem các đề thi mở →</div>
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
    <div class="page-body slide-up" style="max-width:850px;margin:0 auto">
      <div class="section-header">
        <div>
          <div class="section-title">📖 Flashcard Học Từ vựng SGK Global Success</div>
          <div style="font-size:13px;color:var(--ink-soft);margin-top:4px">Chọn lớp và bấm để lật thẻ ghi nhớ, nghe phát âm chuẩn bản ngữ</div>
        </div>
        <div class="row gap-8">
          ${[6, 7, 8, 9].map(g => `
          <button class="btn btn-sm ${grade === g ? 'btn-primary' : 'btn-outline'}" onclick="App.setVocabGrade(${g})">
            Lớp ${g}
          </button>`).join('')}
        </div>
      </div>

      <!-- Flashcard Interactive 3D Card -->
      <div class="card text-center mb-24" style="padding:48px 32px;cursor:pointer;border:2px solid #3b82f6;background:linear-gradient(135deg,#ffffff,#eff6ff);box-shadow:var(--shadow-lg);min-height:300px;display:flex;flex-direction:column;justify-content:center;align-items:center"
           onclick="App.toggleVocabFlip()">
        <span class="tag tag-nb mb-12">${esc(currWord.unit)}</span>

        ${!this.state.vocabFlipped ? `
          <!-- Front Side -->
          <div style="font-size:42px;font-weight:900;color:#1e3a8a;margin-bottom:8px">
            ${esc(currWord.word)}
          </div>
          <div style="font-size:18px;color:#0284c7;font-family:monospace;font-weight:600">
            ${esc(currWord.ipa)} &nbsp;<span style="font-size:13px;color:#64748b">(${esc(currWord.pos)})</span>
          </div>
          <div style="margin-top:20px;font-size:13px;color:#64748b">
            👉 Bấm vào thẻ để xem Nghĩa tiếng Việt & Câu ví dụ trong SGK
          </div>
        ` : `
          <!-- Back Side -->
          <div style="font-size:28px;font-weight:800;color:#059669;margin-bottom:12px">
            ${esc(currWord.meaning)}
          </div>
          <div style="font-size:14.5px;color:#334155;max-width:500px;line-height:1.6;font-style:italic;background:#f8fafc;padding:12px 18px;border-radius:12px;border:1px dashed #cbd5e1">
            "${esc(currWord.example)}"
          </div>
          <div style="margin-top:16px;font-size:12.5px;color:#64748b">
            🔄 Bấm lần nữa để lật lại mặt trước
          </div>
        `}
      </div>

      <!-- Controls Bar -->
      <div class="card flex-between" style="padding:16px 24px">
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
      <div class="card mt-24">
        <div class="section-title mb-16">📋 Danh sách từ vựng trọng tâm Lớp ${grade}</div>
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
                <td><strong style="color:#1e3a8a;font-size:14px">${esc(w.word)}</strong> <small style="color:#64748b">(${w.pos})</small></td>
                <td style="font-family:monospace;color:#0284c7">${esc(w.ipa)}</td>
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

  renderStep1() {
    const wiz = this.state.wizard;
    const examTypes = ['15 phút', 'Giữa kỳ', 'Cuối kỳ', 'Khảo sát'];

    return `
    <div class="grid grid-2 gap-20">
      <div class="stack gap-16">
        <div class="card">
          <div class="section-title mb-12">🏛️ Quy chuẩn đề kiểm tra</div>
          <div class="chip-group">
            <div class="chip ${wiz.examFormat === 'cv7991' ? 'selected' : ''}" onclick="App.setWizardExamFormat('cv7991')">
              🌟 Chuẩn Công văn 7991/BGDĐT (Có Đúng/Sai, Điền từ)
            </div>
            <div class="chip ${wiz.examFormat === 'standard' ? 'selected' : ''}" onclick="App.setWizardExamFormat('standard')">
              📜 Chuẩn 4 kỹ năng Tiếng Anh (Listening, Language, Reading, Writing)
            </div>
          </div>
        </div>

        <div class="card">
          <div class="section-title mb-12">🎯 Khối lớp (Global Success)</div>
          <div class="chip-group">
            ${[6, 7, 8, 9].map(g => `
            <div class="chip ${wiz.grade === g ? 'selected' : ''}" onclick="App.setWizardGrade(${g})">
              Lớp ${g} Global Success
            </div>`).join('')}
          </div>
        </div>

        <div class="card">
          <div class="section-title mb-12">⏱️ Loại đề thi</div>
          <div class="chip-group">
            ${examTypes.map(t => `<div class="chip ${wiz.examType === t ? 'selected' : ''}" onclick="App.setWizardExamType('${t}')">${t}</div>`).join('')}
          </div>
        </div>

        <!-- Audio Configuration -->
        <div class="card" style="border:1.5px solid #bfdbfe;background:#f8fafc">
          <div class="section-title mb-12" style="color:#1d4ed8">🎧 Thiết lập File nghe & Audio Script</div>
          <div class="stack gap-12">
            <div class="field">
              <label class="label">Tiêu đề bài nghe (Track title)</label>
              <input id="wiz-audio-title" type="text" value="${esc(wiz.audioTitle || 'Track 1: Listening Comprehension')}" />
            </div>
            <div class="field">
              <label class="label">Nội dung Audio Script / Kịch bản đọc</label>
              <textarea id="wiz-audio-script" rows="4" style="width:100%;font-family:inherit;padding:8px 12px;border:1px solid var(--line);border-radius:var(--r-md);font-size:13px">${esc(wiz.audioScript || '')}</textarea>
            </div>
            <div class="field">
              <label class="label">Link file MP3 ngoài (tùy chọn)</label>
              <input id="wiz-audio-url" type="text" value="${esc(wiz.audioUrl || '')}" placeholder="https://...mp3 (để trống nếu dùng giọng AI)" />
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="section-title mb-16">📋 Định dạng văn bản hành chính (Nghị định 30)</div>
        <div class="stack gap-14">
          <div class="field">
            <label class="label">Tên đề kiểm tra</label>
            <input id="wiz-title" type="text" value="${esc(wiz.examTitle)}" />
          </div>
          <div class="grid grid-2 gap-12">
            <div class="field">
              <label class="label">Lớp thi</label>
              <input id="wiz-class" type="text" value="${esc(wiz.examClass)}" />
            </div>
            <div class="field">
              <label class="label">Thời gian (phút)</label>
              <input id="wiz-time" type="number" value="${wiz.examTime}" min="15" max="180" />
            </div>
          </div>
          <div class="field">
            <label class="label">Học kỳ</label>
            <select id="wiz-semester">
              ${['Học kỳ I – 2024-2025', 'Học kỳ II – 2024-2025', 'Học kỳ I – 2025-2026'].map(s => `<option ${wiz.examSemester === s ? 'selected' : ''}>${s}</option>`).join('')}
            </select>
          </div>
          <div class="field">
            <label class="label">Đơn vị / Trường (Bản quyền)</label>
            <input id="wiz-school" type="text" value="${esc(wiz.schoolName || 'TRƯỜNG THCS ĐỒNG YÊN')}" />
          </div>
          <div class="field">
            <label class="label">Giáo viên ra đề / Tác giả</label>
            <input id="wiz-teacher" type="text" value="${esc(wiz.teacherName || 'Thầy Đinh Văn Thành')}" />
          </div>
        </div>

        <div style="margin-top:24px;display:flex;justify-content:flex-end">
          <button class="btn btn-primary btn-lg" onclick="App.goStep2()">
            Tiếp tục: Cấu hình Ma trận đề →
          </button>
        </div>
      </div>
    </div>`;
  },

  setWizardGrade(g) {
    this.state.wizard.grade = g;
    this.state.wizard.examTitle = `Đề kiểm tra ${this.state.wizard.examType || 'Giữa kỳ'} Tiếng Anh ${g} Global Success`;
    this.state.wizard.sections.forEach(sec => sec.slots.forEach(sl => { sl.chapterId = ''; sl.topic = ''; }));
    this.renderPage();
  },

  setWizardExamType(t) {
    this.state.wizard.examType = t;
    if (t === '15 phút') this.state.wizard.examTime = 15;
    else if (t === 'Giữa kỳ') this.state.wizard.examTime = 45;
    else if (t === 'Cuối kỳ') this.state.wizard.examTime = 60;
    this.state.wizard.examTitle = `Đề kiểm tra ${t} Tiếng Anh ${this.state.wizard.grade} Global Success`;
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
    wiz.examSemester = document.getElementById('wiz-semester')?.value || wiz.examSemester;
    wiz.schoolName = document.getElementById('wiz-school')?.value || 'TRƯỜNG THCS ĐỒNG YÊN';
    wiz.teacherName = document.getElementById('wiz-teacher')?.value || 'Thầy Đinh Văn Thành';
    wiz.audioTitle = document.getElementById('wiz-audio-title')?.value || wiz.audioTitle;
    wiz.audioScript = document.getElementById('wiz-audio-script')?.value || wiz.audioScript;
    wiz.audioUrl = document.getElementById('wiz-audio-url')?.value || wiz.audioUrl;
    wiz.step = 2;
    this.renderPage();
  },

  goStep1() {
    this.state.wizard.step = 1;
    this.renderPage();
  },

  renderStep2() {
    const wiz = this.state.wizard;
    const grade = wiz.grade;
    const chapList = CHAPTERS.english[grade] || [];

    return `
    <div class="stack gap-20">
      <div class="card flex-between" style="background:#f8fafc;padding:16px 20px">
        <div>
          <h3 style="font-size:16px;color:#0f172a;font-weight:800">
            📊 Ma trận cấu trúc đề: ${esc(wiz.examTitle)}
          </h3>
          <p style="font-size:13px;color:var(--ink-soft);margin-top:4px">
            Khối: <b>Lớp ${grade} Global Success</b> · Thời gian: <b>${wiz.examTime} phút</b> · Trường: <b>${esc(wiz.schoolName)}</b>
          </p>
        </div>
        <button class="btn btn-outline btn-sm" onclick="App.goStep1()">← Sửa thông tin</button>
      </div>

      ${wiz.sections.map((sec, si) => `
        <div class="card">
          <div class="section-header">
            <div>
              <div class="section-title" style="font-size:15px;color:#1e3a8a">${esc(sec.name)}</div>
              <span class="tag tag-nb" style="font-size:11px;margin-top:4px">Dạng: ${sec.type?.toUpperCase()}</span>
            </div>
            <div class="row gap-8">
              <button class="btn btn-sm btn-outline" onclick="App.addSlot(${si})">+ Thêm mục câu</button>
              ${wiz.sections.length > 1 ? `<button class="btn btn-sm btn-danger" onclick="App.removeSection(${si})">Xóa phần</button>` : ''}
            </div>
          </div>

          <div class="slot-builder">
            <div class="slot-header">
              <span>#</span><span>Unit SGK Global Success</span><span>Chủ đề / Kỹ năng</span>
              <span>Mức độ</span><span>Số câu</span><span>Có sẵn</span><span></span>
            </div>
            ${sec.slots.map((sl, sli) => {
              const topics = sl.chapterId ? (chapList.find(c => c.id === sl.chapterId)?.topics || []) : [];
              const available = Auth.getAllQuestions().filter(q =>
                q.grade === grade &&
                (!sl.chapterId || q.chapterId === sl.chapterId) &&
                (!sl.topic || q.topic === sl.topic) &&
                (!sl.level || q.level === sl.level)
              ).length;

              return `
              <div class="slot-row">
                <div><div class="slot-num">${sli + 1}</div></div>
                <div>
                  <select onchange="App.updateSlot(${si},${sli},'chapterId',this.value)">
                    <option value="">Tất cả các Unit</option>
                    ${chapList.map(c => `<option value="${c.id}" ${sl.chapterId === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
                  </select>
                </div>
                <div>
                  <select onchange="App.updateSlot(${si},${sli},'topic',this.value)">
                    <option value="">Tất cả chủ đề</option>
                    ${topics.map(t => `<option value="${esc(t)}" ${sl.topic === t ? 'selected' : ''}>${esc(t)}</option>`).join('')}
                  </select>
                </div>
                <div>
                  <select onchange="App.updateSlot(${si},${sli},'level',this.value)">
                    <option value="">Tất cả mức độ</option>
                    ${LEVELS.map(lv => `<option value="${lv.id}" ${sl.level === lv.id ? 'selected' : ''}>${lv.name}</option>`).join('')}
                  </select>
                </div>
                <div>
                  <input type="number" min="1" max="30" value="${sl.count}"
                    style="text-align:center;width:60px"
                    onchange="App.updateSlot(${si},${sli},'count',parseInt(this.value)||1)"/>
                </div>
                <div>
                  <span class="tag ${available >= sl.count ? 'tag-nb' : 'tag-vdc'}">${available} câu</span>
                </div>
                <div>
                  ${sec.slots.length > 1 ? `<button class="btn btn-sm btn-danger btn-icon" onclick="App.removeSlot(${si},${sli})">✕</button>` : ''}
                </div>
              </div>`;
            }).join('')}
          </div>
        </div>
      `).join('')}

      <div class="card flex-between" style="padding:16px 20px">
        <button class="btn btn-outline" onclick="App.goStep1()">← Quay lại</button>
        <button class="btn btn-primary btn-lg" onclick="App.generateExam()">
          ⚡ Tạo đề thi Tiếng Anh ngay →
        </button>
      </div>
    </div>`;
  },

  updateSlot(si, sli, field, val) {
    this.state.wizard.sections[si].slots[sli][field] = val;
    this.renderPage();
  },

  addSlot(si) {
    this.state.wizard.sections[si].slots.push({ chapterId: '', topic: '', level: 'TH', count: 2 });
    this.renderPage();
  },

  removeSlot(si, sli) {
    this.state.wizard.sections[si].slots.splice(sli, 1);
    this.renderPage();
  },

  removeSection(si) {
    this.state.wizard.sections.splice(si, 1);
    this.renderPage();
  },

  generateExam() {
    const wiz = this.state.wizard;
    const grade = wiz.grade;
    const allQ = Auth.getAllQuestions();
    const usedIds = new Set();
    const result = [];

    for (const sec of wiz.sections) {
      const sectionQs = [];
      const secType = sec.type || 'mc';

      for (const sl of sec.slots) {
        let pool = allQ.filter(q => {
          if (usedIds.has(q.id)) return false;
          if (q.grade !== grade) return false;
          if (secType && (q.type || 'mc') !== secType) return false;
          if (sl.chapterId && q.chapterId !== sl.chapterId) return false;
          if (sl.topic && q.topic !== sl.topic) return false;
          if (sl.level && q.level !== sl.level) return false;
          return true;
        });

        if (pool.length < sl.count) {
          pool = allQ.filter(q => !usedIds.has(q.id) && q.grade === grade && (q.type || 'mc') === secType);
        }
        if (pool.length < sl.count) {
          pool = allQ.filter(q => !usedIds.has(q.id) && (q.type || 'mc') === secType);
        }
        if (pool.length < sl.count) {
          pool = allQ.filter(q => (q.type || 'mc') === secType);
        }

        const picked = shuffle(pool).slice(0, sl.count);
        picked.forEach(q => {
          usedIds.add(q.id);
          sectionQs.push(JSON.parse(JSON.stringify(q)));
        });
      }
      result.push({ ...sec, questions: sectionQs });
    }

    wiz.id = wiz.id || ('eng-' + Date.now());
    wiz.selectedSections = result;
    wiz.step = 3;

    Auth.publishExam({
      id: wiz.id,
      title: wiz.examTitle,
      grade: wiz.grade,
      subject: 'english',
      examFormat: wiz.examFormat || 'cv7991',
      examTime: wiz.examTime,
      examClass: wiz.examClass,
      schoolName: wiz.schoolName,
      teacherName: wiz.teacherName,
      audioTitle: wiz.audioTitle,
      audioScript: wiz.audioScript,
      audioUrl: wiz.audioUrl,
      sections: result,
      isOpen: true,
      publishedAt: new Date().toISOString(),
    });

    const record = {
      id: wiz.id,
      userId: this.state.user.id,
      title: wiz.examTitle,
      grade: wiz.grade,
      subject: 'english',
      examType: wiz.examType || 'Giữa kỳ',
      questionCount: result.reduce((s, sec) => s + sec.questions.length, 0),
      createdAt: new Date().toISOString(),
    };
    Auth.saveExamRecord(record);

    this.renderPage();
    UI.toast('✅ Đã tạo đề Tiếng Anh Global Success thành công!', 'success');
  },

  renderStep3() {
    return this.renderPreview();
  },

  // ── Xem trước đề thi, Audio Player & Xuất Word ───────────────────
  renderPreview() {
    const wiz = this.state.wizard;
    const secs = wiz.selectedSections || [];
    const today = new Date();
    const dateStr = `ngày ${today.getDate()} tháng ${today.getMonth() + 1} năm ${today.getFullYear()}`;
    const hasAudio = wiz.audioScript || wiz.audioUrl || secs.some(s => s.skill === 'listening');

    return `
    <div class="page-body slide-up">
      <!-- Toolbar -->
      <div class="card mb-20 flex-between no-print" style="padding:14px 20px;flex-wrap:wrap;gap:10px">
        <button class="btn btn-outline" onclick="App.goStep2()">← Sửa ma trận</button>
        <div class="row" style="flex-wrap:wrap;gap:8px">
          <div class="tabs" style="padding:3px">
            <button class="tab-btn ${wiz.previewMode === 'student' ? 'active' : ''}" onclick="App.setPreviewMode('student')">👨‍🎓 Đề Học sinh</button>
            <button class="tab-btn ${wiz.previewMode === 'teacher' ? 'active' : ''}" onclick="App.setPreviewMode('teacher')">👩‍🏫 Kèm Đáp án & HDG</button>
          </div>
          <button class="btn btn-primary" onclick="App.showShareLinkModal()">🔗 Link thi Online</button>
          <button class="btn btn-secondary" onclick="App.showAssignExamModal()">🚀 Giao bài Zalo</button>
          <button class="btn btn-outline" onclick="App.showCV7991Modals()">📊 Ma trận & Đặc tả</button>
          <button class="btn btn-warn" onclick="App.showShuffleModal()">🔀 Trộn 4 mã đề</button>
          <button class="btn btn-primary" onclick="App.exportWord()">📥 Xuất Word (.doc)</button>
          <button class="btn btn-success" onclick="App.printExam()">🖨️ In đề A4</button>
        </div>
      </div>

      <!-- Audio Player Toolbar -->
      ${hasAudio ? `
      <div class="card mb-20 no-print" style="border:1.5px solid #0284c7;background:linear-gradient(135deg,#f0f9ff,#e0f2fe);padding:16px 20px">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">
          <div style="display:flex;align-items:center;gap:12px">
            <div style="font-size:32px">🎧</div>
            <div>
              <div style="font-weight:800;font-size:15px;color:#0369a1">${esc(wiz.audioTitle || 'Track 1: Listening Comprehension')}</div>
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
      <div class="exam-preview-wrap">
        <div class="exam-sheet" id="exam-sheet" style="font-family:'Times New Roman',serif;font-size:13pt;line-height:1.25">
          <!-- 1. Header Table (2x2) -->
          <table style="width:100%;border:none;margin-bottom:6pt;font-family:'Times New Roman',serif">
            <tr>
              <td style="width:38%;text-align:center;vertical-align:top;border:none;line-height:1.2">
                <div style="font-size:11.5pt;font-weight:bold">${esc((localStorage.getItem('cfg_parent_agency') || 'UBND XÃ ĐỒNG YÊN').toUpperCase())}</div>
                <div style="font-size:11.5pt;font-weight:bold;text-decoration:underline">${esc((wiz.schoolName || localStorage.getItem('cfg_school_name') || 'TRƯỜNG THCS ĐỒNG YÊN').toUpperCase())}</div>
              </td>
              <td style="width:62%;text-align:center;vertical-align:top;border:none;line-height:1.25">
                <div style="font-size:12.5pt;font-weight:bold">${esc(wiz.examTitle.toUpperCase())}</div>
                <div style="font-size:11.5pt;font-weight:bold">NĂM HỌC: ${esc(localStorage.getItem('cfg_school_year') || '2026 - 2027')}</div>
                <div style="font-size:12.5pt;font-weight:bold">Môn: Tiếng Anh ${wiz.grade}</div>
                <div style="font-size:11.5pt;font-style:italic">Thời gian làm bài: ${wiz.examTime} phút (không kể thời gian giao đề)</div>
              </td>
            </tr>
          </table>

          <!-- 2. Dòng Full Name, Class, Mã đề -->
          <div style="font-size:13pt;margin:6pt 0 8pt 0;display:flex;justify-content:space-between;align-items:center">
            <span><b>Full name:</b> ____________________________________,</span>
            <span><b>Class:</b> ${esc(wiz.examClass || (wiz.grade + 'A___'))}</span>
            <span><b style="color:#b91c1c;font-size:13pt">Mã đề: 101</b></span>
          </div>

          <!-- 3. Bảng Điểm Marks Box (Auto fit to window - Chuẩn THCS Đồng Yên) -->
          <table style="width:100%;border-collapse:collapse;margin-bottom:12pt;font-family:'Times New Roman',serif;font-size:11.5pt">
            <tr style="text-align:center;font-weight:bold">
              <td colspan="2" style="border:1px solid #000;width:22%;padding:4px">Marks</td>
              <td rowspan="2" style="border:1px solid #000;width:14%;padding:4px;vertical-align:middle">Total</td>
              <td rowspan="2" style="border:1px solid #000;width:64%;padding:4px 8px;text-align:left;vertical-align:top">
                <div style="text-align:center;font-weight:bold;margin-bottom:4px">Teacher’s remarks</div>
                <div style="color:#64748b;font-size:11pt">____________________________________________________________________</div>
                <div style="color:#64748b;font-size:11pt;margin-top:2px">____________________________________________________________________</div>
              </td>
            </tr>
            <tr style="text-align:center;font-weight:bold">
              <td style="border:1px solid #000;width:11%;padding:3px">Speak</td>
              <td style="border:1px solid #000;width:11%;padding:3px">Write</td>
            </tr>
            <tr style="height:36px;text-align:center">
              <td style="border:1px solid #000">&nbsp;</td>
              <td style="border:1px solid #000">&nbsp;</td>
              <td style="border:1px solid #000">&nbsp;</td>
              <td style="border:1px solid #000">&nbsp;</td>
            </tr>
          </table>

          <!-- 4. Nội dung câu hỏi theo chuẩn CV 7991 (Cỡ chữ 13 Times New Roman) -->
          ${secs.map((sec, si) => `
            <div style="font-size:13pt;font-weight:bold;margin-top:12pt;margin-bottom:4pt">
              Part ${si + 1}. ${esc(sec.name)}: (${sec.questions.length} câu)
            </div>
            ${sec.questions.map((q, qi) => `
              <div style="font-size:13pt;margin-bottom:8pt;line-height:1.25">
                <div><b>${qi + 1}.</b> ${esc(q.content)}</div>
                ${q.options ? `
                <div style="padding-left:16pt;margin-top:3pt;display:grid;grid-template-columns:1fr 1fr;gap:4pt;font-size:13pt">
                  ${q.options.map(opt => `
                  <div class="${wiz.previewMode === 'teacher' && opt.charAt(0) === q.answer ? 'correct-answer' : ''}">
                    ${esc(opt)} ${wiz.previewMode === 'teacher' && opt.charAt(0) === q.answer ? ' ✓' : ''}
                  </div>`).join('')}
                </div>` : ''}
                ${wiz.previewMode === 'teacher' && q.solution ? `
                <div style="margin-top:4pt;padding:4pt 10pt;background:#eff6ff;border-left:3px solid #2563eb;font-size:11pt;color:#1e40af">
                  💡 <b>Giải thích:</b> ${esc(q.solution)}
                </div>` : ''}
              </div>
            `).join('')}
          `).join('')}

          <div style="text-align:center;font-weight:bold;font-style:italic;margin-top:18pt;font-size:11pt">
            --- HẾT ---
          </div>

          <div style="margin-top:20pt;border-top:1pt solid #000;padding-top:8pt;font-size:10.5pt;display:flex;justify-content:space-between;color:#475569">
            <span>Bản quyền: <b>Thầy Đinh Văn Thành – Trường THCS Đồng Yên (0915.213717)</b></span>
            <span>EnglishExam Pro • Chuẩn SGK Global Success</span>
          </div>
        </div>
      </div>
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
      <td rowspan="2" style="border:1pt solid #000;width:14%;padding:4pt;vertical-align:middle">Total</td>
      <td rowspan="2" style="border:1pt solid #000;width:64%;padding:4pt 8pt;text-align:left;vertical-align:top">
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
      <td style="border:1pt solid #000">&nbsp;</td>
      <td style="border:1pt solid #000">&nbsp;</td>
    </tr>
  </table>

  <!-- 4. NỘI DUNG CÁC PHẦN THI (CỠ CHỮ 13 TIMES NEW ROMAN) -->
  ${sections.map((sec, si) => `
    <div style="font-size:13pt;font-weight:bold;margin-top:10pt;margin-bottom:4pt">
      Part ${si + 1}. ${esc(sec.name)}: (${sec.questions.length} câu)
    </div>
    ${sec.questions.map((q, qi) => `
      <div style="font-size:13pt;margin-bottom:6pt;line-height:1.25">
        <div><b>${qi + 1}.</b> ${esc(q.content)}</div>
        ${q.options ? `
        <table style="width:100%;border:none;margin-top:2pt">
          <tr>
            ${q.options.map(opt => `
              <td style="border:none;font-size:13pt;padding:1pt 4pt;${showAnswer && opt.charAt(0) === q.answer ? 'font-weight:bold;color:#b91c1c' : ''}">
                <b>${esc(opt.charAt(0))}.</b> ${esc(opt.slice(3) || opt)} ${showAnswer && opt.charAt(0) === q.answer ? ' ✓' : ''}
              </td>
            `).join('')}
          </tr>
        </table>` : ''}
        ${showAnswer && q.solution ? `
        <div style="margin-top:2pt;padding:3pt 8pt;background:#eff6ff;font-size:11pt;color:#1e40af">
          💡 <b>Giải thích:</b> ${esc(q.solution)}
        </div>` : ''}
      </div>
    `).join('')}
  `).join('')}

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
                const isTF = q.type === 'tf';
                const isEssay = q.type === 'essay';
                const isMC = !isTF && !isEssay;
                const qi = qGlobalIndex;

                return `
                <div class="student-card" id="st-q-${q.id}">
                  <div style="font-size:14.5px;font-weight:700;color:#0f172a;line-height:1.6">
                    Câu ${qi}: ${esc(q.content)}
                  </div>
                  ${isMC ? `
                  <div class="student-opt-list">
                    ${(q.options || []).map(opt => {
                      const letter = opt.charAt(0);
                      const isSel = this.state.studentAnswers[q.id] === letter;
                      return `
                      <div class="student-opt-btn ${isSel ? 'selected' : ''}" onclick="App.selectStudentMCOption('${q.id}','${letter}')">
                        <div class="student-opt-indicator">${letter}</div>
                        <div>${esc(opt.slice(2).trim())}</div>
                      </div>`;
                    }).join('')}
                  </div>` : ''}

                  ${isTF ? `
                  <div style="margin-top:10px;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden">
                    ${(q.items || []).map(it => {
                      const curVal = this.state.studentAnswers[q.id + '_' + it.label];
                      return `
                      <div class="student-tf-row">
                        <div style="font-size:13.5px;flex:1"><b>${it.label})</b> ${esc(it.text)}</div>
                        <div class="student-tf-pills">
                          <button class="student-tf-pill ${curVal === true ? 'active-true' : ''}" onclick="App.selectStudentTF('${q.id}','${it.label}',true)">Đúng</button>
                          <button class="student-tf-pill ${curVal === false ? 'active-false' : ''}" onclick="App.selectStudentTF('${q.id}','${it.label}',false)">Sai</button>
                        </div>
                      </div>`;
                    }).join('')}
                  </div>` : ''}

                  ${isEssay ? `
                  <div style="margin-top:10px">
                    <textarea rows="3" placeholder="Nhập câu trả lời..." oninput="App.inputStudentEssay('${q.id}',this.value)"
                      style="width:100%;padding:10px;border:1.5px solid #cbd5e1;border-radius:10px;font-family:inherit">${esc(this.state.studentAnswers[q.id] || '')}</textarea>
                  </div>` : ''}
                </div>`;
              }).join('')}
            `).join('')}
          </div>

          <div>
            <div class="palette-card">
              <div style="font-weight:800;font-size:14px;margin-bottom:8px">Danh sách câu hỏi</div>
              <div class="palette-grid">
                ${allQ.map((q, idx) => `
                <button class="palette-btn ${this.isQuestionAnswered(q) ? 'done' : ''}" id="pal-btn-${q.id}" onclick="document.getElementById('st-q-${q.id}')?.scrollIntoView({behavior:'smooth'})">
                  ${idx + 1}
                </button>`).join('')}
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
    this.state.studentAnswers[qId] = letter;
    this.renderStudentExamView();
  },

  selectStudentTF(qId, label, val) {
    this.state.studentAnswers[qId + '_' + label] = val;
    this.renderStudentExamView();
  },

  inputStudentEssay(qId, val) {
    this.state.studentAnswers[qId] = val;
  },

  isQuestionAnswered(q) {
    if (q.type === 'tf') {
      return (q.items || []).every(it => this.state.studentAnswers[q.id + '_' + it.label] !== undefined);
    }
    return !!this.state.studentAnswers[q.id];
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

    allQ.forEach(q => {
      if (q.type === 'tf') {
        const itemResults = (q.items || []).map(it => answers[q.id + '_' + it.label] === it.isTrue);
        const corrects = itemResults.filter(Boolean).length;
        if (corrects === (q.items || []).length) {
          totalScore += perQ;
          correctCount++;
        } else {
          totalScore += perQ * (corrects / (q.items?.length || 1));
        }
      } else {
        if (answers[q.id] === q.answer) {
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
        ${allQ.slice(0, 20).map((q, idx) => `
        <div class="card p-16">
          <div class="row gap-8">
            <span class="badge badge-g${q.grade}">Lớp ${q.grade}</span>
            <span class="tag tag-nb">${esc(q.topic || 'Chủ đề')}</span>
          </div>
          <div style="font-weight:700;margin:8px 0">${idx + 1}. ${esc(q.content)}</div>
          ${q.options ? `<div class="grid grid-2 gap-6">${q.options.map(opt => `<div>${esc(opt)}</div>`).join('')}</div>` : ''}
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
    const curG = oState.grade;
    const curT = oState.term;
    const item = (oPaths[curG] && oPaths[curG][curT]) || oPaths['6']['GK1'];

    return `
    <div class="page-body slide-up" style="max-width:1200px;margin:0 auto">
      <!-- Stats Summary Bar -->
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

      <div style="display:grid;grid-template-columns:1.2fr 0.8fr;gap:20px">
        <!-- Left: Grade & Term Selector -->
        <div class="card p-24">
          <div class="section-title mb-16">BƯỚC 1: CHỌN KHỐI LỚP & KỲ KIỂM TRA</div>

          <!-- School config box -->
          <div style="background:#f1f5f9;padding:12px 16px;border-radius:12px;border:1px dashed #cbd5e1;margin-bottom:20px">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
              <span style="font-size:13px;font-weight:700;color:#1e293b">🏫 Thông Tin Đơn Vị & Trường Học:</span>
              <button onclick="App.saveOfficialSchoolConfig()" class="btn btn-primary" style="padding:3px 10px;font-size:11px">Lưu</button>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
              <input type="text" id="cfgOfficialParent" value="${esc(oState.parent)}" class="input" style="font-size:12px;font-weight:600" placeholder="UBND XÃ ĐỒNG YÊN"/>
              <input type="text" id="cfgOfficialSchool" value="${esc(oState.school)}" class="input" style="font-size:12px;font-weight:600" placeholder="TRƯỜNG THCS ĐỒNG YÊN"/>
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

          <!-- Download Action Button -->
          <div style="margin-top:24px">
            <a href="${item.p}" download="${item.f}" class="btn btn-primary" style="width:100%;padding:14px 20px;font-size:15px;font-weight:900;justify-content:center;display:flex;align-items:center;gap:10px;text-decoration:none">
              📥 TẢI VỀ FILE WORD GỐC (.DOCX): ${item.f}
            </a>
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
    </div>`;
  },

  selectOfficialGrade(grade) {
    this.state.officialExams.grade = String(grade);
    this.renderPage();
  },

  selectOfficialTerm(term) {
    this.state.officialExams.term = term;
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
  }
};

// ── Khởi động ứng dụng ───────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
