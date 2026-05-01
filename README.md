// ================================
// admin.js — Admin Dashboard Logic
// Mobile Ads Van
// ================================

const API = 'http://localhost:5000/api';
let token = localStorage.getItem('mavToken');
let currentAdmin = null;
let allMedia = [];
let allEnquiries = [];

// ================================
// INIT
// ================================
document.addEventListener('DOMContentLoaded', () => {
  if (token) verifyAndInit();
  else showLogin();
});

function showLogin() {
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('dashboard').style.display = 'none';
  document.body.classList.add('login-page');
}

async function verifyAndInit() {
  try {
    const res = await api('GET', '/auth/verify');
    if (res.success) {
      currentAdmin = res.admin;
      initDashboard();
    } else {
      localStorage.removeItem('mavToken');
      token = null;
      showLogin();
    }
  } catch {
    localStorage.removeItem('mavToken');
    token = null;
    showLogin();
  }
}

function initDashboard() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('dashboard').style.display = 'flex';
  document.body.classList.remove('login-page');

  // Set admin name
  const initial = currentAdmin.username[0].toUpperCase();
  document.getElementById('sidebarAvatar').textContent = initial;
  document.getElementById('sidebarName').textContent = currentAdmin.username;
  document.getElementById('topbarAvatar').textContent = initial;
  document.getElementById('topbarName').textContent = currentAdmin.username;

  loadDashboard();
}

// ================================
// LOGIN
// ================================
async function login() {
  const username = document.getElementById('loginUser').value.trim();
  const password = document.getElementById('loginPass').value;
  const errEl = document.getElementById('loginError');
  const btnText = document.getElementById('loginBtnText');
  const btnLoad = document.getElementById('loginBtnLoad');

  errEl.style.display = 'none';
  btnText.style.display = 'none';
  btnLoad.style.display = 'inline';

  try {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();

    if (data.success) {
      token = data.token;
      localStorage.setItem('mavToken', token);
      currentAdmin = data.admin;
      initDashboard();
    } else {
      errEl.style.display = 'block';
    }
  } catch {
    errEl.style.display = 'block';
    errEl.textContent = '❌ Cannot connect to server. Is the backend running?';
  } finally {
    btnText.style.display = 'inline';
    btnLoad.style.display = 'none';
  }
}

function logout() {
  localStorage.removeItem('mavToken');
  token = null;
  currentAdmin = null;
  showLogin();
  document.getElementById('loginUser').value = '';
  document.getElementById('loginPass').value = '';
}

function togglePw() {
  const inp = document.getElementById('loginPass');
  const icon = document.getElementById('eyeIcon');
  if (inp.type === 'password') {
    inp.type = 'text';
    icon.className = 'fas fa-eye-slash';
  } else {
    inp.type = 'password';
    icon.className = 'fas fa-eye';
  }
}

// ================================
// NAVIGATION
// ================================
function showSection(name) {
  // Hide all sections
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  // Show selected
  document.getElementById(`section-${name}`).classList.add('active');
  document.getElementById('pageTitle').textContent =
    name.charAt(0).toUpperCase() + name.slice(1);

  // Mark nav active
  document.querySelectorAll('.nav-item').forEach(n => {
    if (n.getAttribute('onclick')?.includes(name)) n.classList.add('active');
  });

  // Close sidebar on mobile
  if (window.innerWidth <= 900) {
    document.getElementById('sidebar').classList.remove('open');
  }

  // Load section data
  if (name === 'enquiries') loadEnquiries();
  if (name === 'gallery') loadGallery();
  if (name === 'settings') loadSettings();
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

// ================================
// DASHBOARD OVERVIEW
// ================================
async function loadDashboard() {
  try {
    const res = await api('GET', '/dashboard/stats');
    if (res.success) {
      const d = res.data;
      document.getElementById('st-total').textContent = d.enquiries.total;
      document.getElementById('st-new').textContent = d.enquiries.new;
      document.getElementById('st-today').textContent = d.enquiries.today;
      document.getElementById('st-media').textContent = d.media.total;

      // Update nav badge
      const badge = document.getElementById('newBadge');
      badge.textContent = d.enquiries.new;
      badge.style.display = d.enquiries.new > 0 ? 'inline-flex' : 'none';
    }
    loadRecentEnquiries();
  } catch (err) {
    console.error('Dashboard load error:', err);
  }
}

async function loadRecentEnquiries() {
  try {
    const res = await api('GET', '/enquiries?limit=5');
    const el = document.getElementById('recentEnquiriesList');
    if (!res.success || !res.data.length) {
      el.innerHTML = '<p style="color:var(--gray);font-size:0.82rem;padding:10px 0">No enquiries yet.</p>';
      return;
    }
    el.innerHTML = res.data.map(e => `
      <div class="enq-mini-item" onclick="openEnquiry('${e.id}')">
        <div>
          <div class="enq-mini-name">${esc(e.name)}</div>
          <div class="enq-mini-phone">${esc(e.phone)} · ${esc(e.business_type)}</div>
        </div>
        <div class="enq-status-dot ${e.status}"></div>
      </div>`).join('');
  } catch {}
}

// ================================
// ENQUIRIES
// ================================
let currentFilter = 'all';

async function loadEnquiries(filter = currentFilter) {
  currentFilter = filter;
  try {
    const res = await api('GET', `/enquiries?status=${filter}&limit=100`);
    const el = document.getElementById('enquiriesTable');

    if (!res.success || !res.data.length) {
      el.innerHTML = '<p style="color:var(--gray);padding:24px;text-align:center">No enquiries found.</p>';
      return;
    }

    el.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Business</th>
            <th>Budget</th>
            <th>Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${res.data.map(e => `
            <tr>
              <td class="td-name">${esc(e.name)}</td>
              <td class="td-phone"><a href="tel:${e.phone}">${esc(e.phone)}</a></td>
              <td>${esc(e.business_type)}</td>
              <td>${esc(e.budget)}</td>
              <td>${formatDate(e.created_at)}</td>
              <td><span class="status-badge ${e.status}">${e.status}</span></td>
              <td>
                <div class="action-btns">
                  <button class="btn-view-enq" onclick="openEnquiry('${e.id}')" title="View">
                    <i class="fas fa-eye"></i>
                  </button>
                  <button class="btn-del-enq" onclick="deleteEnquiry('${e.id}')" title="Delete">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>`;
  } catch (err) {
    console.error(err);
  }
}

function filterEnquiries(filter, btn) {
  document.querySelectorAll('#enquiryFilters .filter-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  loadEnquiries(filter);
}

async function openEnquiry(id) {
  try {
    const res = await api('GET', `/enquiries/${id}`);
    if (!res.success) return;
    const e = res.data;

    document.getElementById('enquiryModalContent').innerHTML = `
      <h3 style="font-size:1.2rem;font-weight:800;margin-bottom:20px">
        Enquiry Details
      </h3>
      <div class="modal-field"><div class="label">Name</div><div class="value">${esc(e.name)}</div></div>
      <div class="modal-field"><div class="label">Phone</div>
        <div class="value"><a href="tel:${e.phone}" style="color:var(--yellow)">${esc(e.phone)}</a>
        &nbsp;<a href="https://wa.me/91${e.phone.replace(/\D/g,'')}" target="_blank"
          style="color:var(--green);font-size:0.8rem"><i class="fab fa-whatsapp"></i> WhatsApp</a>
        </div>
      </div>
      <div class="modal-field"><div class="label">Business Type</div><div class="value">${esc(e.business_type)}</div></div>
      <div class="modal-field"><div class="label">Budget</div><div class="value">${esc(e.budget)}</div></div>
      <div class="modal-field"><div class="label">Message</div><div class="value">${esc(e.message) || '—'}</div></div>
      <div class="modal-field"><div class="label">Received</div><div class="value">${formatDate(e.created_at)}</div></div>
      <hr class="modal-divider"/>
      <div class="modal-field">
        <div class="label">Status</div>
        <select class="modal-select" id="modalStatus" onchange="updateEnquiryStatus('${e.id}', this.value)">
          <option value="new"       ${e.status==='new'?'selected':''}>New</option>
          <option value="read"      ${e.status==='read'?'selected':''}>Read</option>
          <option value="contacted" ${e.status==='contacted'?'selected':''}>Contacted</option>
          <option value="closed"    ${e.status==='closed'?'selected':''}>Closed</option>
        </select>
      </div>
      <div class="modal-field">
        <div class="label">Admin Notes</div>
        <textarea class="modal-textarea" id="modalNotes"
          placeholder="Add notes...">${esc(e.notes)}</textarea>
        <button class="btn-sm" style="margin-top:8px" onclick="saveNotes('${e.id}')">
          <i class="fas fa-save"></i> Save Notes
        </button>
      </div>`;

    document.getElementById('enquiryModal').style.display = 'flex';
    loadDashboard(); // refresh badge count
  } catch {}
}

async function updateEnquiryStatus(id, status) {
  await api('PUT', `/enquiries/${id}`, { status });
  showToast('Status updated', 'success');
  loadEnquiries();
}

async function saveNotes(id) {
  const notes = document.getElementById('modalNotes').value;
  await api('PUT', `/enquiries/${id}`, { notes });
  showToast('Notes saved', 'success');
}

async function deleteEnquiry(id) {
  if (!confirm('Delete this enquiry? This cannot be undone.')) return;
  const res = await api('DELETE', `/enquiries/${id}`);
  if (res.success) {
    showToast('Enquiry deleted', 'success');
    loadEnquiries();
    loadDashboard();
  }
}

function closeEnquiryModal() {
  document.getElementById('enquiryModal').style.display = 'none';
}

function closeModal(e) {
  if (e.target.id === 'enquiryModal') closeEnquiryModal();
}

// ================================
// MEDIA UPLOAD
// ================================
function dragOver(e) {
  e.preventDefault();
  document.getElementById('uploadZone').classList.add('dragover');
}
function dragLeave() {
  document.getElementById('uploadZone').classList.remove('dragover');
}
function dropFiles(e) {
  e.preventDefault();
  document.getElementById('uploadZone').classList.remove('dragover');
  handleUpload(e.dataTransfer.files);
}

async function handleUpload(files) {
  if (!files.length) return;

  const caption = document.getElementById('uploadCaption').value;
  const category = document.getElementById('uploadCategory').value;

  const formData = new FormData();
  Array.from(files).forEach(f => formData.append('files', f));
  formData.append('caption', caption);
  formData.append('category', category);

  const progressWrap = document.getElementById('uploadProgressWrap');
  const progressBar = document.getElementById('uploadProgressBar');
  const feedback = document.getElementById('uploadFeedback');

  progressWrap.style.display = 'block';
  progressBar.style.width = '0%';
  feedback.innerHTML = '';

  try {
    // Simulate progress
    let prog = 0;
    const interval = setInterval(() => {
      prog = Math.min(prog + 10, 85);
      progressBar.style.width = prog + '%';
    }, 150);

    const res = await fetch(`${API}/media/upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    const data = await res.json();

    clearInterval(interval);
    progressBar.style.width = '100%';

    setTimeout(() => {
      progressWrap.style.display = 'none';
      progressBar.style.width = '0%';
    }, 600);

    if (data.success) {
      feedback.innerHTML = `<p style="color:var(--green);font-size:0.85rem;margin-top:8px">
        ✅ ${data.data.length} file(s) uploaded successfully!
      </p>`;
      // Show previews
      renderUploadPreviews(data.data);
      document.getElementById('uploadCaption').value = '';
      loadDashboard();
      setTimeout(() => { feedback.innerHTML = ''; }, 5000);
    } else {
      feedback.innerHTML = `<p style="color:var(--red);font-size:0.85rem">${data.message}</p>`;
    }
  } catch {
    progressWrap.style.display = 'none';
    feedback.innerHTML = `<p style="color:var(--red);font-size:0.85rem">Upload failed. Is the server running?</p>`;
  }
}

function renderUploadPreviews(items) {
  const el = document.getElementById('uploadPreview');
  el.innerHTML = '<p style="font-size:0.78rem;color:var(--gray);margin-bottom:8px">Just uploaded:</p>'
    + '<div class="upload-preview-grid">'
    + items.map(item => `
      <div class="gallery-thumb">
        <span class="thumb-type">${item.type === 'image' ? 'IMG' : 'VID'}</span>
        ${item.type === 'image'
          ? `<img src="http://localhost:5000${item.url}" alt="${item.original_name}"/>`
          : `<video src="http://localhost:5000${item.url}" muted></video>`
        }
        <div class="thumb-label">${item.original_name}</div>
      </div>`).join('')
    + '</div>';
}

// ================================
// GALLERY
// ================================
async function loadGallery(filter = 'all') {
  try {
    const query = filter === 'all' ? '' : `?type=${filter}`;
    const res = await api('GET', `/media${query}`);
    const el = document.getElementById('galleryGrid');

    if (!res.success || !res.data.length) {
      el.innerHTML = '<div class="gallery-empty"><i class="fas fa-images"></i><p>No media uploaded yet.</p></div>';
      return;
    }

    allMedia = res.data;
    el.innerHTML = res.data.map(item => `
      <div class="gallery-thumb" id="media-${item.id}">
        <span class="thumb-type">${item.type === 'image' ? 'IMG' : 'VID'}</span>
        ${item.type === 'image'
          ? `<img src="http://localhost:5000${item.url}" alt="${item.caption || item.original_name}"/>`
          : `<video src="http://localhost:5000${item.url}" muted></video>`
        }
        <div class="gallery-thumb-overlay">
          <button class="thumb-del" onclick="deleteMedia('${item.id}')">
            <i class="fas fa-trash"></i>
          </button>
        </div>
        <div class="thumb-label">${esc(item.caption || item.original_name)}</div>
      </div>`).join('');
  } catch (err) {
    console.error(err);
  }
}

function filterMedia(type, btn) {
  document.querySelectorAll('#section-gallery .filter-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  loadGallery(type);
}

async function deleteMedia(id) {
  if (!confirm('Delete this file permanently?')) return;
  const res = await api('DELETE', `/media/${id}`);
  if (res.success) {
    document.getElementById(`media-${id}`)?.remove();
    showToast('File deleted', 'success');
    loadDashboard();
  }
}

// ================================
// SETTINGS
// ================================
async function loadSettings() {
  try {
    const res = await api('GET', '/settings');
    if (!res.success) return;
    const s = res.data;
    document.getElementById('s-business_name').value = s.business_name || '';
    document.getElementById('s-tagline').value = s.tagline || '';
    document.getElementById('s-phone').value = s.phone || '';
    document.getElementById('s-whatsapp').value = s.whatsapp || '';
    document.getElementById('s-email').value = s.email || '';
    document.getElementById('s-price_per_van_day').value = s.price_per_van_day || 2000;
    document.getElementById('s-facebook_url').value = s.facebook_url || '';
    document.getElementById('s-instagram_url').value = s.instagram_url || '';
    document.getElementById('s-clients').value = s.hero_stats?.clients || 7;
    document.getElementById('s-areas').value = s.hero_stats?.areas || 8;
  } catch {}
}

async function saveSettings() {
  try {
    const body = {
      business_name: document.getElementById('s-business_name').value,
      tagline: document.getElementById('s-tagline').value,
      phone: document.getElementById('s-phone').value,
      whatsapp: document.getElementById('s-whatsapp').value,
      email: document.getElementById('s-email').value,
      price_per_van_day: parseInt(document.getElementById('s-price_per_van_day').value),
      facebook_url: document.getElementById('s-facebook_url').value,
      instagram_url: document.getElementById('s-instagram_url').value,
      hero_stats: {
        clients: parseInt(document.getElementById('s-clients').value),
        areas: parseInt(document.getElementById('s-areas').value),
        founded: 2025
      }
    };
    const res = await api('PUT', '/settings', body);
    if (res.success) {
      showToast('Settings saved!', 'success');
      document.getElementById('settingsFeedback').style.display = 'block';
      document.getElementById('settingsFeedback').textContent = '✅ Settings saved successfully!';
      setTimeout(() => { document.getElementById('settingsFeedback').style.display = 'none'; }, 3000);
    }
  } catch {}
}

// ================================
// CHANGE PASSWORD
// ================================
async function changePassword() {
  const cur = document.getElementById('curPw').value;
  const nw  = document.getElementById('newPw').value;
  const conf = document.getElementById('confPw').value;
  const fb = document.getElementById('pwFeedback');

  fb.style.display = 'none';

  if (!cur || !nw || !conf) {
    fb.style.display = 'block'; fb.textContent = 'All fields are required.'; return;
  }
  if (nw !== conf) {
    fb.style.display = 'block'; fb.textContent = 'New passwords do not match.'; return;
  }
  if (nw.length < 6) {
    fb.style.display = 'block'; fb.textContent = 'Password must be at least 6 characters.'; return;
  }

  const res = await api('PUT', '/auth/change-password', {
    current_password: cur, new_password: nw
  });

  if (res.success) {
    showToast('Password changed!', 'success');
    document.getElementById('curPw').value = '';
    document.getElementById('newPw').value = '';
    document.getElementById('confPw').value = '';
  } else {
    fb.style.display = 'block'; fb.textContent = res.message;
  }
}

// ================================
// HELPERS
// ================================
async function api(method, endpoint, body = null) {
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    }
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${API}${endpoint}`, opts);
  return res.json();
}

function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast show ${type}`;
  setTimeout(() => { t.className = 'toast'; }, 3000);
}
