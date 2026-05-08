// ─── NAVEGACIÓN ───────────────────────────────────────────
function showSection(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  if (id === 'appointments') renderAppointments();
  if (id === 'register')     renderPatients();
  if (id === 'availability') checkAvailability();
  if (id === 'schedule')     populatePatientDropdown();
  if (id === 'dashboard')    updateDashboard();
}


// ─── TOAST ────────────────────────────────────────────────
function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast ${type}`;
  setTimeout(() => t.classList.add('hidden'), 3500);
}

// ─── LIMPIAR FORMULARIO ───────────────────────────────────
function clearForm(section) {
  const forms = { register: ['pat-name','pat-id','pat-birth','pat-phone','pat-email','pat-eps','pat-address','pat-history'],
                  schedule: ['apt-patient','apt-specialty','apt-doctor','apt-date','apt-time','apt-type','apt-reason'] };
  forms[section]?.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
}

// ─── DASHBOARD STATS ──────────────────────────────────────
function updateDashboard() {
  const patients = getPatients();
  const apts     = getAppointments();
  document.getElementById('total-patients').textContent     = patients.length;
  document.getElementById('total-appointments').textContent = apts.length;
  document.getElementById('pending-appointments').textContent = apts.filter(a => a.status === 'scheduled').length;
  document.getElementById('total-reminders').textContent   = apts.filter(a => a.reminder).length;
}

// ─── MODAL ────────────────────────────────────────────────
let currentRescheduleId = null;
function openRescheduleModal(id) {
  currentRescheduleId = id;
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('reschedule-date').min = today;
  document.getElementById('reschedule-modal').classList.remove('hidden');
}
function closeModal() {
  document.getElementById('reschedule-modal').classList.add('hidden');
  currentRescheduleId = null;
}

// ─── INIT ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('apt-date').min = today;
  document.getElementById('avail-date').value = today;
  showSection('dashboard');
  updateDashboard();
  checkReminders();
});
