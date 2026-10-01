// ================================================================
// auth.js – Authentication & Session Management
// ================================================================

const Auth = (() => {
  const STORAGE_KEYS = {
    SESSION: 'eduexam_session',
    USERS: 'eduexam_users',
    KEYS: 'eduexam_keys',
    EXAMS: 'eduexam_exams',
    CUSTOM_QUESTIONS: 'eduexam_custom_q',
    PUBLISHED_EXAMS: 'eduexam_published_exams',
    SUBMISSIONS: 'eduexam_submissions',
    STUDENTS: 'eduexam_students',
    CLASSES: 'eduexam_classes',
  };

  const VERSION_KEY = 'eduexam_app_version';
  const CURRENT_VERSION = '3.2.0_student_classroom';

  // ── Init storage ────────────────────────────────────────────
  function initStorage() {
    const savedVer = localStorage.getItem(VERSION_KEY);
    if (savedVer !== CURRENT_VERSION) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
      localStorage.setItem(STORAGE_KEYS.KEYS, JSON.stringify(DEFAULT_LICENSE_KEYS));
      localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(DEFAULT_EXAM_RECORDS));
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(DEFAULT_STUDENTS));
      localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(DEFAULT_CLASSES));
      localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
    } else {
      if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
      }
      if (!localStorage.getItem(STORAGE_KEYS.KEYS)) {
        localStorage.setItem(STORAGE_KEYS.KEYS, JSON.stringify(DEFAULT_LICENSE_KEYS));
      }
      if (!localStorage.getItem(STORAGE_KEYS.EXAMS)) {
        localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(DEFAULT_EXAM_RECORDS));
      }
      if (!localStorage.getItem(STORAGE_KEYS.STUDENTS)) {
        localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(DEFAULT_STUDENTS));
      }
      if (!localStorage.getItem(STORAGE_KEYS.CLASSES)) {
        localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(DEFAULT_CLASSES));
      }
    }
    if (!localStorage.getItem(STORAGE_KEYS.CUSTOM_QUESTIONS)) {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_QUESTIONS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PUBLISHED_EXAMS)) {
      localStorage.setItem(STORAGE_KEYS.PUBLISHED_EXAMS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SUBMISSIONS)) {
      localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify([]));
    }
  }

  // ── Students CRUD ───────────────────────────────────────────
  function getStudents() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.STUDENTS) || '[]');
  }
  function saveStudents(list) {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(list));
  }
  function registerStudent(studentData) {
    const list = getStudents();
    if (list.some(s => s.username === studentData.username)) {
      return { ok: false, msg: 'Tên đăng nhập đã tồn tại, vui lòng chọn tên khác!' };
    }
    const newStudent = {
      id: 'st-' + Date.now(),
      role: 'student',
      points: 100, // Thưởng 100 điểm khởi tạo tài khoản
      completedExams: 0,
      createdAt: new Date().toISOString(),
      ...studentData
    };
    list.push(newStudent);
    saveStudents(list);
    return { ok: true, student: newStudent };
  }
  function loginStudent(username, password) {
    const list = getStudents();
    return list.find(s => s.username === username && s.password === password) || null;
  }

  // ── Classes CRUD ────────────────────────────────────────────
  function getClasses() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CLASSES) || '[]');
  }
  function saveClasses(list) {
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(list));
  }
  function addClass(classData) {
    const list = getClasses();
    const newCls = {
      id: 'cls-' + Date.now(),
      studentCount: 0,
      year: '2024-2025',
      ...classData
    };
    list.unshift(newCls);
    saveClasses(list);
    return newCls;
  }
  function deleteClass(id) {
    let list = getClasses();
    list = list.filter(c => c.id !== id);
    saveClasses(list);
  }

  // ── User CRUD ───────────────────────────────────────────────
  function getUsers() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  }
  function saveUsers(users) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  // ── License Keys ────────────────────────────────────────────
  function getLicenseKeys() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.KEYS) || '[]');
  }
  function saveLicenseKeys(keys) {
    localStorage.setItem(STORAGE_KEYS.KEYS, JSON.stringify(keys));
  }

  // ── Exam Records ────────────────────────────────────────────
  function getExamRecords() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.EXAMS) || '[]');
  }
  function saveExamRecord(record) {
    const records = getExamRecords();
    records.unshift(record);
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(records));
  }

  // ── Custom Questions ────────────────────────────────────────
  function getCustomQuestions() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOM_QUESTIONS) || '[]');
  }
  function saveCustomQuestion(q) {
    const qs = getCustomQuestions();
    qs.push(q);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_QUESTIONS, JSON.stringify(qs));
  }
  function deleteCustomQuestion(id) {
    let qs = getCustomQuestions();
    qs = qs.filter(q => q.id !== id);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_QUESTIONS, JSON.stringify(qs));
  }

  // ── Published Exams (Chia sẻ link làm bài) ──────────────────
  function getPublishedExams() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PUBLISHED_EXAMS) || '[]');
  }
  function getPublishedExam(id) {
    const exam = getPublishedExams().find(e => e.id === id) || null;
    if (exam && exam.sections) {
      let qCount = 0;
      exam.sections.forEach((sec, sIdx) => {
        (sec.questions || []).forEach((q, qIdx) => {
          qCount++;
          if (!q.id) {
            q.id = `q_${exam.id || 'exam'}_s${sIdx + 1}_${qCount}`;
          }
        });
      });
    }
    return exam;
  }
  function publishExam(examData) {
    const list = getPublishedExams();
    const idx = list.findIndex(e => e.id === examData.id);
    const publishedItem = {
      ...examData,
      title: examData.title || examData.examTitle || 'Đề kiểm tra',
      isOpen: examData.isOpen !== undefined ? examData.isOpen : true,
      publishedAt: examData.publishedAt || new Date().toISOString(),
    };

    // Đảm bảo mỗi câu hỏi luôn có ID duy nhất tuyệt đối
    let qCount = 0;
    (publishedItem.sections || []).forEach((sec, sIdx) => {
      (sec.questions || []).forEach((q, qIdx) => {
        qCount++;
        if (!q.id) {
          q.id = `q_${publishedItem.id || 'exam'}_s${sIdx + 1}_${qCount}`;
        }
      });
    });

    if (idx >= 0) {
      list[idx] = publishedItem;
    } else {
      list.unshift(publishedItem);
    }
    localStorage.setItem(STORAGE_KEYS.PUBLISHED_EXAMS, JSON.stringify(list));
    return publishedItem;
  }
  function toggleExamStatus(id, isOpen) {
    const list = getPublishedExams();
    const item = list.find(e => e.id === id);
    if (item) {
      item.isOpen = isOpen !== undefined ? isOpen : !item.isOpen;
      localStorage.setItem(STORAGE_KEYS.PUBLISHED_EXAMS, JSON.stringify(list));
    }
    return item;
  }

  // ── Student Submissions (Thu bài & Quản lý điểm) ─────────────
  function getSubmissions(examId = null) {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.SUBMISSIONS) || '[]');
    if (examId) return all.filter(s => s.examId === examId);
    return all;
  }
  function saveSubmission(sub) {
    const list = getSubmissions();
    const newSub = {
      id: 'sub-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      submittedAt: new Date().toISOString(),
      ...sub
    };
    list.unshift(newSub);
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(list));
    return newSub;
  }
  function updateSubmission(id, updates) {
    const list = getSubmissions();
    const idx = list.findIndex(s => s.id === id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...updates };
      localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(list));
      return list[idx];
    }
    return null;
  }
  function deleteSubmission(id) {
    let list = getSubmissions();
    list = list.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(list));
  }

  // ── All questions (bank + custom) ───────────────────────────
  function getAllQuestions() {
    return [...QUESTION_BANK, ...getCustomQuestions()];
  }

  // ── Auth ────────────────────────────────────────────────────
  function login(username, password) {
    const users = getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) return null;

    // Check license expiry
    const today = new Date().toISOString().slice(0, 10);
    if (user.licenseExpiry < today && user.role !== 'superadmin') {
      user.license = 'trial';
    }

    const session = { userId: user.id, loginAt: Date.now() };
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
    return user;
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  }

  function getSession() {
    const s = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (!s) return null;
    const session = JSON.parse(s);
    // 8-hour session
    if (Date.now() - session.loginAt > 8 * 60 * 60 * 1000) {
      logout();
      return null;
    }
    const users = getUsers();
    return users.find(u => u.id === session.userId) || null;
  }

  function updateUser(id, fields) {
    const users = getUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx >= 0) {
      users[idx] = { ...users[idx], ...fields };
      saveUsers(users);
      return users[idx];
    }
    return null;
  }

  function addUser(userData) {
    const users = getUsers();
    const newUser = {
      id: 'u' + Date.now(),
      ...userData,
      examCount: 0,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    users.push(newUser);
    saveUsers(users);
    return newUser;
  }

  function deleteUser(id) {
    let users = getUsers();
    users = users.filter(u => u.id !== id);
    saveUsers(users);
  }

  // ── License Key Logic ───────────────────────────────────────
  function generateKey(plan, createdBy) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const seg = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    const key = `EDU-${seg()}-${seg()}-${seg()}`;
    const keys = getLicenseKeys();
    const planObj = LICENSE_PLANS.find(p => p.id === plan);
    keys.push({
      key, plan, createdBy,
      usedBy: null, usedAt: null,
      expiresDays: planObj?.days || 30,
      createdAt: new Date().toISOString().slice(0, 10),
    });
    saveLicenseKeys(keys);
    return key;
  }

  function activateKey(keyStr, userId) {
    const keys = getLicenseKeys();
    const k = keys.find(k => k.key === keyStr && !k.usedBy);
    if (!k) return { ok: false, msg: 'Key không hợp lệ hoặc đã được sử dụng' };
    k.usedBy = userId;
    k.usedAt = new Date().toISOString();
    saveLicenseKeys(keys);

    // Update user license
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + k.expiresDays);
    updateUser(userId, {
      license: k.plan,
      licenseExpiry: expiry.toISOString().slice(0, 10),
    });
    return { ok: true, plan: k.plan, expiry: expiry.toISOString().slice(0, 10) };
  }

  // ── Permission helpers ───────────────────────────────────────
  function canAccess(user, feature) {
    if (!user) return false;
    if (user.role === 'superadmin') return true;
    const plan = LICENSE_PLANS.find(p => p.id === user.license);
    if (!plan) return false;

    switch (feature) {
      case 'all_grades': return ['basic','pro','school'].includes(user.license);
      case 'science': return ['basic','pro','school'].includes(user.license);
      case 'unlimited_exams': return ['pro','school'].includes(user.license);
      case 'custom_questions': return ['pro','school'].includes(user.license);
      case 'admin_panel': return user.role === 'admin' || user.role === 'superadmin';
      case 'create_keys': return user.role === 'superadmin';
      case 'multi_user': return user.license === 'school' || user.role === 'superadmin';
      case 'statistics': return ['pro','school'].includes(user.license) || user.role === 'admin';
      default: return true;
    }
  }

  function getRemainingExams(user) {
    const plan = LICENSE_PLANS.find(p => p.id === user.license);
    if (!plan || plan.examLimit === -1) return Infinity;
    const records = getExamRecords().filter(r => r.userId === user.id);
    const thisMonth = records.filter(r => r.createdAt.slice(0, 7) === new Date().toISOString().slice(0, 7));
    return Math.max(0, plan.examLimit - thisMonth.length);
  }

  return {
    initStorage, login, logout, getSession,
    getUsers, saveUsers, addUser, updateUser, deleteUser,
    getStudents, saveStudents, registerStudent, loginStudent,
    getClasses, saveClasses, addClass, deleteClass,
    getLicenseKeys, generateKey, activateKey,
    getExamRecords, saveExamRecord,
    getCustomQuestions, saveCustomQuestion, deleteCustomQuestion,
    getPublishedExams, getPublishedExam, publishExam, toggleExamStatus,
    getSubmissions, saveSubmission, updateSubmission, deleteSubmission,
    getAllQuestions, canAccess, getRemainingExams,
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Auth;
}
