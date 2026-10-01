// ================================================================
// admin.js – Admin Panel Logic
// ================================================================

const Admin = (() => {

  // ── Render Admin Panel ───────────────────────────────────────
  function render(user) {
    return `
    <div class="page-body slide-up">
      <div class="page-header">
        <h1>⚙️ Bảng quản trị hệ thống</h1>
        <p>Quản lý giáo viên, license, thống kê doanh thu – Chỉ dành cho Admin</p>
      </div>

      <!-- Stat Row -->
      ${renderAdminStats()}

      <!-- Tabs -->
      <div class="tabs mb-24" id="admin-tabs" style="max-width:600px">
        <button class="tab-btn active" onclick="Admin.switchTab('users')" id="tab-users">👥 Người dùng</button>
        <button class="tab-btn" onclick="Admin.switchTab('keys')" id="tab-keys">🔑 License Keys</button>
        <button class="tab-btn" onclick="Admin.switchTab('stats')" id="tab-stats">📊 Thống kê</button>
        ${user.role === 'superadmin' ? '<button class="tab-btn" onclick="Admin.switchTab(\'plans\')" id="tab-plans">💎 Gói dịch vụ</button>' : ''}
      </div>

      <div id="admin-content">
        ${renderUsersTab(user)}
      </div>
    </div>`;
  }

  function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    const btn = document.getElementById('tab-' + tab);
    if (btn) btn.classList.add('active');

    const content = document.getElementById('admin-content');
    const user = App.state.user;
    if (tab === 'users') content.innerHTML = renderUsersTab(user);
    else if (tab === 'keys') content.innerHTML = renderKeysTab(user);
    else if (tab === 'stats') content.innerHTML = renderStatsTab();
    else if (tab === 'plans') content.innerHTML = renderPlansTab();
  }

  // ── Admin Stats ──────────────────────────────────────────────
  function renderAdminStats() {
    const users = Auth.getUsers();
    const exams = Auth.getExamRecords();
    const keys = Auth.getLicenseKeys();
    const thisMonth = exams.filter(e => e.createdAt.slice(0,7) === new Date().toISOString().slice(0,7));

    // Revenue estimate
    const revenue = users.reduce((sum, u) => {
      const plan = LICENSE_PLANS.find(p => p.id === u.license);
      return sum + (plan?.price || 0);
    }, 0);

    return `
    <div class="grid grid-4 mb-24">
      <div class="stat-card">
        <div class="stat-icon" style="background:#eef2ff">👥</div>
        <div class="stat-body">
          <div class="stat-value grad-text">${users.length}</div>
          <div class="stat-label">Tổng người dùng</div>
          <div class="stat-trend trend-up">+${users.filter(u=>u.createdAt>='2026-09-01').length} tháng này</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:#ecfdf5">📝</div>
        <div class="stat-body">
          <div class="stat-value" style="background:var(--grad-green);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent">${exams.length}</div>
          <div class="stat-label">Tổng đề đã tạo</div>
          <div class="stat-trend trend-up">+${thisMonth.length} tháng này</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:#fef9c3">🔑</div>
        <div class="stat-body">
          <div class="stat-value" style="background:var(--grad-gold);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent">${keys.filter(k=>!k.usedBy).length}</div>
          <div class="stat-label">Keys còn trống</div>
          <div class="stat-trend">${keys.filter(k=>k.usedBy).length} đã dùng</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:#fdf2f8">💰</div>
        <div class="stat-body">
          <div class="stat-value grad-text-warm">${(revenue/1000).toFixed(0)}k</div>
          <div class="stat-label">Doanh thu ước tính</div>
          <div class="stat-trend text-soft">VNĐ / tháng</div>
        </div>
      </div>
    </div>`;
  }

  // ── Users Tab ────────────────────────────────────────────────
  function renderUsersTab(currentUser) {
    const users = Auth.getUsers();
    const roleMap = { superadmin: '👑 Superadmin', admin: '🛡️ Admin', teacher: '👩‍🏫 Giáo viên', trial: '🎓 Dùng thử' };
    const licenseColors = { trial:'badge-g9', basic:'badge-math', pro:'badge-g7', school:'badge-g8' };

    return `
    <div>
      <div class="section-header">
        <div class="section-title">👥 Danh sách người dùng (${users.length})</div>
        <div class="row">
          <div class="search-bar" style="min-width:220px">
            <span class="search-icon">🔍</span>
            <input type="text" placeholder="Tìm tên, email..." oninput="Admin.filterUsers(this.value)" id="user-search"/>
          </div>
          <button class="btn btn-primary" onclick="Admin.showAddUserModal()">+ Thêm GV</button>
        </div>
      </div>

      <div class="table-wrap">
        <table id="users-table">
          <thead><tr>
            <th>Giáo viên</th><th>Trường</th><th>Vai trò</th>
            <th>Gói</th><th>Hết hạn</th><th>Đề đã tạo</th><th>Hành động</th>
          </tr></thead>
          <tbody id="users-tbody">
            ${users.map(u => `
            <tr data-name="${u.name.toLowerCase()} ${u.email.toLowerCase()}">
              <td>
                <div class="flex gap-12" style="align-items:center">
                  <div class="user-row-avatar" style="background:${u.color}">${u.avatar}</div>
                  <div>
                    <div style="font-weight:600;font-size:13.5px">${esc(u.name)}</div>
                    <div class="text-sm text-soft">${esc(u.email)}</div>
                  </div>
                </div>
              </td>
              <td class="text-sm">${esc(u.school)}</td>
              <td><span class="tag ${u.role==='superadmin'?'tag-vdc':u.role==='admin'?'tag-vd':'tag-nb'}">${roleMap[u.role]||u.role}</span></td>
              <td><span class="badge ${licenseColors[u.license]||''}">${u.license?.toUpperCase()}</span></td>
              <td class="text-sm ${u.licenseExpiry < new Date().toISOString().slice(0,10)?'text-red':''}">${u.licenseExpiry}</td>
              <td><span class="font-bold">${u.examCount}</span></td>
              <td>
                <div class="row gap-8">
                  <button class="btn btn-sm btn-secondary" onclick="Admin.showEditUserModal('${u.id}')">✏️ Sửa</button>
                  ${u.id !== currentUser.id && u.role !== 'superadmin' ? `<button class="btn btn-sm btn-danger" onclick="Admin.deleteUser('${u.id}')">🗑</button>` : ''}
                </div>
              </td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
  }

  // ── Keys Tab ─────────────────────────────────────────────────
  function renderKeysTab(user) {
    const keys = Auth.getLicenseKeys();
    const users = Auth.getUsers();
    const planColors = { trial:'badge-g9', basic:'badge-math', pro:'badge-g7', school:'badge-g8' };

    return `
    <div>
      <div class="section-header">
        <div class="section-title">🔑 License Keys (${keys.length})</div>
        ${Auth.canAccess(user,'create_keys') ? `
        <div class="row">
          <select id="key-plan-select" class="btn btn-outline" style="width:150px">
            ${LICENSE_PLANS.filter(p=>p.id!=='trial').map(p=>`<option value="${p.id}">${p.name}</option>`).join('')}
          </select>
          <button class="btn btn-primary" onclick="Admin.generateKey()">+ Tạo Key mới</button>
        </div>` : ''}
      </div>

      <div class="table-wrap">
        <table>
          <thead><tr><th>License Key</th><th>Gói</th><th>Trạng thái</th><th>Người dùng</th><th>Ngày dùng</th><th>Tạo bởi</th></tr></thead>
          <tbody>
            ${keys.map(k => {
              const usedUser = k.usedBy ? users.find(u => u.id === k.usedBy) : null;
              const creator = users.find(u => u.id === k.createdBy);
              return `<tr>
                <td>
                  <div class="key-code" onclick="copyKey('${k.key}')" title="Click để copy">${k.key}</div>
                </td>
                <td><span class="badge ${planColors[k.plan]||''}">${k.plan.toUpperCase()}</span></td>
                <td>
                  <span class="tag ${k.usedBy ? 'tag-vdc' : 'tag-nb'}">
                    ${k.usedBy ? '✅ Đã dùng' : '⏳ Còn trống'}
                  </span>
                </td>
                <td class="text-sm">${usedUser ? esc(usedUser.name) : '—'}</td>
                <td class="text-sm">${k.usedAt ? k.usedAt.slice(0,10) : '—'}</td>
                <td class="text-sm">${creator ? esc(creator.name) : '?'}</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- Activate key section -->
      <div class="card mt-24" style="max-width:480px">
        <h3 class="mb-16" style="font-size:16px;font-weight:700">🔓 Kích hoạt License Key</h3>
        <div class="field mb-16">
          <label class="label">Nhập License Key</label>
          <input id="activate-key-inp" type="text" placeholder="EDU-XXXX-XXXX-XXXX" />
        </div>
        <button class="btn btn-primary" onclick="Admin.activateKey()">🚀 Kích hoạt</button>
        <div id="activate-result" class="mt-12"></div>
      </div>
    </div>`;
  }

  // ── Stats Tab ────────────────────────────────────────────────
  function renderStatsTab() {
    const exams = Auth.getExamRecords();
    const users = Auth.getUsers();

    // By grade
    const byGrade = {};
    [6,7,8,9].forEach(g => { byGrade[g] = exams.filter(e=>e.grade===g).length; });
    const maxGrade = Math.max(...Object.values(byGrade), 1);

    // By subject
    const bySubject = { math: exams.filter(e=>e.subject==='math').length, science: exams.filter(e=>e.subject==='science').length };

    // By user
    const byUser = users.map(u => ({ user: u, count: exams.filter(e=>e.userId===u.id).length }))
      .filter(x => x.count > 0)
      .sort((a,b) => b.count - a.count)
      .slice(0,5);

    return `
    <div class="grid grid-2 gap-20">
      <!-- By grade -->
      <div class="card">
        <div class="section-title mb-16">📊 Đề tạo theo lớp</div>
        ${[6,7,8,9].map(g => `
        <div class="flex-between mb-12">
          <div class="flex gap-8" style="align-items:center;min-width:70px">
            <span class="badge badge-g${g}">Lớp ${g}</span>
          </div>
          <div style="flex:1;margin:0 12px">
            <div class="progress-wrap">
              <div class="progress-bar progress-indigo" style="width:${byGrade[g]/maxGrade*100}%"></div>
            </div>
          </div>
          <span class="font-bold text-sm">${byGrade[g]}</span>
        </div>`).join('')}
      </div>

      <!-- By subject -->
      <div class="card">
        <div class="section-title mb-16">📚 Đề theo môn học</div>
        <div class="flex gap-20 mb-16" style="justify-content:center">
          <div class="text-center">
            <div style="font-size:48px;font-weight:900;background:var(--grad-primary);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent">${bySubject.math}</div>
            <div class="text-soft text-sm">📐 Toán</div>
          </div>
          <div class="text-center">
            <div style="font-size:48px;font-weight:900;background:var(--grad-pink);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent">${bySubject.science}</div>
            <div class="text-soft text-sm">🔬 KHTN</div>
          </div>
        </div>
        ${byUser.length ? `
        <div class="divider"></div>
        <div class="section-title mb-12">🏆 Top GV tích cực</div>
        ${byUser.map((x,i) => `
        <div class="flex-between mb-8">
          <div class="flex gap-8" style="align-items:center">
            <div class="user-row-avatar" style="background:${x.user.color};width:28px;height:28px;font-size:12px">${x.user.avatar}</div>
            <span class="text-sm font-bold">${esc(x.user.name)}</span>
          </div>
          <span class="tag tag-${['vdc','vd','th','nb','nb'][i]}">${x.count} đề</span>
        </div>`).join('')}` : ''}
      </div>

      <!-- Exam history -->
      <div class="card" style="grid-column:1/-1">
        <div class="section-title mb-16">📋 Lịch sử tạo đề gần đây</div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Tên đề</th><th>Giáo viên</th><th>Lớp</th><th>Môn</th><th>Số câu</th><th>Thời gian</th></tr></thead>
            <tbody>
              ${exams.slice(0,10).map(e => {
                const u = users.find(u=>u.id===e.userId);
                return `<tr>
                  <td class="font-bold text-sm">${esc(e.title)}</td>
                  <td class="text-sm">${u ? esc(u.name) : '?'}</td>
                  <td><span class="badge badge-g${e.grade}">Lớp ${e.grade}</span></td>
                  <td><span class="badge ${e.subject==='math'?'badge-math':'badge-sci'}">${e.subject==='math'?'📐 Toán':'🔬 KHTN'}</span></td>
                  <td class="text-sm font-bold">${e.questionCount}</td>
                  <td class="text-sm text-soft">${new Date(e.createdAt).toLocaleString('vi-VN')}</td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>`;
  }

  // ── Plans Tab ─────────────────────────────────────────────────
  function renderPlansTab() {
    return `
    <div>
      <div class="section-title mb-20">💎 Bảng giá dịch vụ EnglishExam Pro (Global Success)</div>
      <div class="grid grid-4">
        ${LICENSE_PLANS.map(plan => `
        <div class="license-card ${plan.featured?'featured':''} ${plan.id}">
          ${plan.featured ? '<span class="license-badge">⭐ Phổ biến nhất</span>' : ''}
          <div style="font-size:36px;margin-bottom:8px">
            ${plan.id==='trial'?'🎓':plan.id==='basic'?'📘':plan.id==='pro'?'🚀':'🏫'}
          </div>
          <div class="license-name">${plan.name}</div>
          <div class="license-price grad-text">
            ${plan.price === 0 ? 'Miễn phí' : (plan.price/1000).toFixed(0)+'k'}
          </div>
          <div class="license-per">${plan.price ? 'VNĐ / tháng' : '14 ngày dùng thử'}</div>
          <ul class="license-features">
            ${plan.features.map(f=>`<li>${f}</li>`).join('')}
            ${plan.disabled.map(f=>`<li class="no text-mute">${f}</li>`).join('')}
          </ul>
          <button class="btn btn-primary w-full" onclick="Admin.copyPlanInfo('${plan.id}')">
            📋 Copy thông tin
          </button>
        </div>`).join('')}
      </div>

      <div class="card mt-24">
        <div class="section-title mb-16">🎯 Quản lý và cấp phát bản quyền (Thầy Đinh Văn Thành)</div>
        <div class="grid grid-2">
          <div>
            <h3 class="mb-8" style="font-size:15px">Quy trình cấp License:</h3>
            <ol style="padding-left:20px;line-height:2.2;font-size:14px;color:var(--ink-soft)">
              <li>Thoả thuận với giáo viên Tiếng Anh muốn sử dụng</li>
              <li>Vào <strong>tab License Keys</strong> → Bấm "Tạo Key mới"</li>
              <li>Gửi key cho giáo viên qua Zalo/Email kèm hướng dẫn</li>
              <li>Giáo viên vào mục <strong>Cài đặt → Kích hoạt License</strong> để kích hoạt</li>
            </ol>
          </div>
          <div>
            <h3 class="mb-8" style="font-size:15px">Mẫu tin nhắn gửi giáo viên:</h3>
            <div class="key-code" style="font-size:13px;font-family:inherit;line-height:1.8" id="sample-msg">
🇬🇧 EnglishExam Pro – Bản quyền Tiếng Anh Global Success (Thầy Đinh Văn Thành):<br/>
Mã kích hoạt: <strong>[KEY_HERE]</strong><br/>
Thời hạn: 1 năm (Lớp 6, 7, 8, 9 có Audio & Ma trận đặc tả)<br/>
Kích hoạt tại: Cài đặt → Kích hoạt License Key<br/>
Hỗ trợ tác giả: Thầy Đinh Văn Thành – THCS Đồng Yên
            </div>
            <button class="btn btn-sm btn-secondary mt-8" onclick="copySampleMsg()">📋 Copy mẫu</button>
          </div>
        </div>
      </div>
    </div>`;
  }

  // ── Add / Edit User Modal ────────────────────────────────────
  function showAddUserModal() {
    UI.showModal('Thêm giáo viên mới', `
      <div class="stack">
        <div class="grid grid-2">
          <div class="field"><label class="label">Họ và tên *</label><input id="mu-name" type="text" placeholder="Nguyễn Văn A"/></div>
          <div class="field"><label class="label">Tên đăng nhập *</label><input id="mu-username" type="text" placeholder="gv_nguyenvana"/></div>
        </div>
        <div class="grid grid-2">
          <div class="field"><label class="label">Email</label><input id="mu-email" type="email" placeholder="email@school.edu.vn"/></div>
          <div class="field"><label class="label">Trường</label><input id="mu-school" type="text" placeholder="THCS ..."/></div>
        </div>
        <div class="grid grid-2">
          <div class="field"><label class="label">Mật khẩu *</label><input id="mu-pass" type="password" placeholder="Ít nhất 6 ký tự"/></div>
          <div class="field">
            <label class="label">Gói license</label>
            <select id="mu-license">
              ${LICENSE_PLANS.map(p=>`<option value="${p.id}">${p.name}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="field">
          <label class="label">Vai trò</label>
          <select id="mu-role">
            <option value="teacher">👩‍🏫 Giáo viên</option>
            <option value="admin">🛡️ Admin</option>
          </select>
        </div>
        <div id="mu-err" class="text-red text-sm" style="display:none"></div>
      </div>
    `, [
      { label: 'Hủy', cls: 'btn-outline', action: UI.closeModal },
      { label: '✅ Thêm giáo viên', cls: 'btn-primary', action: doAddUser },
    ]);
  }

  function doAddUser() {
    const name = document.getElementById('mu-name').value.trim();
    const username = document.getElementById('mu-username').value.trim();
    const password = document.getElementById('mu-pass').value;
    const email = document.getElementById('mu-email').value.trim();
    const school = document.getElementById('mu-school').value.trim();
    const license = document.getElementById('mu-license').value;
    const role = document.getElementById('mu-role').value;
    const err = document.getElementById('mu-err');

    if (!name || !username || !password) { err.textContent = '⚠️ Vui lòng điền đầy đủ các trường có dấu *'; err.style.display='block'; return; }
    if (password.length < 6) { err.textContent = '⚠️ Mật khẩu tối thiểu 6 ký tự'; err.style.display='block'; return; }
    const existing = Auth.getUsers().find(u => u.username === username);
    if (existing) { err.textContent = '⚠️ Tên đăng nhập đã tồn tại'; err.style.display='block'; return; }

    const expiry = new Date();
    expiry.setDate(expiry.getDate() + (LICENSE_PLANS.find(p=>p.id===license)?.days || 30));
    const avatars = ['👩‍🏫','👨‍🏫','🎓','👩‍💼','👨‍💼'];
    const colors = ['#7c3aed','#0ea5e9','#10b981','#f97316','#ec4899'];
    const idx = Math.floor(Math.random() * 5);

    Auth.addUser({ name, username, password, email: email||`${username}@school.edu.vn`, school: school||'Chưa cập nhật', license, role, licenseExpiry: expiry.toISOString().slice(0,10), avatar: avatars[idx], color: colors[idx] });
    UI.closeModal();
    UI.toast('✅ Đã thêm giáo viên ' + name, 'success');
    // Re-render users tab
    const c = document.getElementById('admin-content');
    if (c) c.innerHTML = renderUsersTab(App.state.user);
  }

  function showEditUserModal(userId) {
    const user = Auth.getUsers().find(u => u.id === userId);
    if (!user) return;
    UI.showModal('Chỉnh sửa tài khoản', `
      <div class="stack">
        <div class="grid grid-2">
          <div class="field"><label class="label">Họ và tên</label><input id="eu-name" type="text" value="${esc(user.name)}"/></div>
          <div class="field"><label class="label">Email</label><input id="eu-email" type="email" value="${esc(user.email)}"/></div>
        </div>
        <div class="grid grid-2">
          <div class="field"><label class="label">Trường</label><input id="eu-school" type="text" value="${esc(user.school)}"/></div>
          <div class="field">
            <label class="label">Gói license</label>
            <select id="eu-license">
              ${LICENSE_PLANS.map(p=>`<option value="${p.id}" ${p.id===user.license?'selected':''}>${p.name}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="grid grid-2">
          <div class="field">
            <label class="label">Vai trò</label>
            <select id="eu-role">
              <option value="teacher" ${user.role==='teacher'?'selected':''}>👩‍🏫 Giáo viên</option>
              <option value="admin" ${user.role==='admin'?'selected':''}>🛡️ Admin</option>
            </select>
          </div>
          <div class="field"><label class="label">Hết hạn</label><input id="eu-expiry" type="date" value="${user.licenseExpiry}"/></div>
        </div>
        <div class="field"><label class="label">Đổi mật khẩu mới (để trống nếu không đổi)</label><input id="eu-pass" type="password" placeholder="Mật khẩu mới..."/></div>
      </div>
    `, [
      { label: 'Hủy', cls: 'btn-outline', action: UI.closeModal },
      { label: '💾 Lưu thay đổi', cls: 'btn-primary', action: () => doEditUser(userId) },
    ]);
  }

  function doEditUser(userId) {
    const fields = {
      name: document.getElementById('eu-name').value.trim(),
      email: document.getElementById('eu-email').value.trim(),
      school: document.getElementById('eu-school').value.trim(),
      license: document.getElementById('eu-license').value,
      role: document.getElementById('eu-role').value,
      licenseExpiry: document.getElementById('eu-expiry').value,
    };
    const pass = document.getElementById('eu-pass').value;
    if (pass) fields.password = pass;
    Auth.updateUser(userId, fields);
    UI.closeModal();
    UI.toast('✅ Đã cập nhật tài khoản', 'success');
    const c = document.getElementById('admin-content');
    if (c) c.innerHTML = renderUsersTab(App.state.user);
  }

  function deleteUser(userId) {
    if (!confirm('Bạn có chắc muốn xóa tài khoản này không?')) return;
    Auth.deleteUser(userId);
    UI.toast('🗑️ Đã xóa tài khoản', 'warn');
    const c = document.getElementById('admin-content');
    if (c) c.innerHTML = renderUsersTab(App.state.user);
  }

  function filterUsers(q) {
    q = q.toLowerCase();
    document.querySelectorAll('#users-tbody tr').forEach(row => {
      const name = row.dataset.name || '';
      row.style.display = name.includes(q) ? '' : 'none';
    });
  }

  function generateKey() {
    const plan = document.getElementById('key-plan-select')?.value || 'pro';
    const key = Auth.generateKey(plan, App.state.user.id);
    UI.toast(`🔑 Key mới: ${key}`, 'success');
    switchTab('keys');
  }

  function activateKey() {
    const key = document.getElementById('activate-key-inp')?.value.trim();
    if (!key) return;
    const result = Auth.activateKey(key, App.state.user.id);
    const el = document.getElementById('activate-result');
    if (el) {
      el.innerHTML = result.ok
        ? `<div class="text-green font-bold">✅ Kích hoạt thành công! Gói: ${result.plan.toUpperCase()} – Hết hạn: ${result.expiry}</div>`
        : `<div class="text-red font-bold">❌ ${result.msg}</div>`;
    }
  }

  function copyPlanInfo(planId) {
    const plan = LICENSE_PLANS.find(p => p.id === planId);
    if (!plan) return;
    const text = `EduExam Pro – Gói ${plan.name}\nGiá: ${plan.price ? plan.price.toLocaleString('vi')+'đ/tháng' : 'Miễn phí'}\nTính năng: ${plan.features.join(', ')}`;
    navigator.clipboard.writeText(text).then(() => UI.toast('📋 Đã copy thông tin gói ' + plan.name, 'success'));
  }

  return { render, switchTab, showAddUserModal, showEditUserModal, deleteUser, filterUsers, generateKey, activateKey, copyPlanInfo };
})();

// Global helpers referenced in templates
function copyKey(key) {
  navigator.clipboard.writeText(key).then(() => UI.toast('📋 Đã copy key: ' + key, 'success'));
}
function copySampleMsg() {
  const text = '🎓 EduExam Pro – License Key của bạn:\nKey: [KEY_HERE]\nGói: Pro – 1 tháng\nKích hoạt tại: Cài đặt → Kích hoạt License\nHỗ trợ: Zalo 0123.456.789';
  navigator.clipboard.writeText(text).then(() => UI.toast('📋 Đã copy mẫu tin nhắn', 'success'));
}
