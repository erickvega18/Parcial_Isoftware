const DOCTORS = {
  general:     [{ id:'d1', name:'Dr. Carlos Gómez' },    { id:'d2', name:'Dra. Laura Ruiz' }],
  cardiology:  [{ id:'d3', name:'Dr. Andrés Torres' },   { id:'d4', name:'Dra. María López' }],
  pediatrics:  [{ id:'d5', name:'Dr. Felipe Vargas' },   { id:'d6', name:'Dra. Ana Martínez' }],
  dermatology: [{ id:'d7', name:'Dra. Sandra Castro' },  { id:'d8', name:'Dr. Julio Herrera' }],
  orthopedics: [{ id:'d9', name:'Dr. Roberto Díaz' },    { id:'d10', name:'Dra. Valentina Ríos' }],
  neurology:   [{ id:'d11', name:'Dr. Esteban Mora' },   { id:'d12', name:'Dra. Camila Peña' }],
};


const ALL_TIMES = ['07:00','08:00','09:00','10:00','11:00','14:00','15:00','16:00','17:00'];

function getAppointments() { return JSON.parse(localStorage.getItem('appointments') || '[]'); }
function saveAppointments(a) { localStorage.setItem('appointments', JSON.stringify(a)); }

// ─── CARGAR MÉDICOS POR ESPECIALIDAD ─────────────────────
function loadDoctors() {
  const sp  = document.getElementById('apt-specialty').value;
  const sel = document.getElementById('apt-doctor');
  sel.innerHTML = '<option value="">Seleccionar médico...</option>';
  (DOCTORS[sp] || []).forEach(d => {
    const o = document.createElement('option');
    o.value = d.id; o.textContent = d.name; sel.appendChild(o);
  });
  document.getElementById('apt-time').innerHTML = '<option>Selecciona médico y fecha</option>';
}

// ─── CARGAR HORAS DISPONIBLES ─────────────────────────────
function loadAvailableTimes(targetSelect = 'apt-time') {
  const docId = document.getElementById('apt-doctor')?.value || document.getElementById('reschedule-date') && currentRescheduleId ? getAppointments().find(a => a.appointmentId === currentRescheduleId)?.doctorId : '';
  const date  = document.getElementById(targetSelect === 'apt-time' ? 'apt-date' : 'reschedule-date').value;
  const sel   = document.getElementById(targetSelect);
  if (!date) return;

  const taken = getAppointments()
    .filter(a => a.date === date && a.doctorId === docId && a.status === 'scheduled')
    .map(a => a.time);

  sel.innerHTML = '';
  const available = ALL_TIMES.filter(t => !taken.includes(t));
  if (!available.length) {
    sel.innerHTML = '<option>Sin horas disponibles</option>'; return;
  }
  available.forEach(t => {
    const o = document.createElement('option');
    o.value = t; o.textContent = t; sel.appendChild(o);
  });
}

function loadRescheduleTimes() { loadAvailableTimes('reschedule-time'); }

// ─── AGENDAR CITA ─────────────────────────────────────────
function scheduleAppointment() {
  const patId    = document.getElementById('apt-patient').value;
  const sp       = document.getElementById('apt-specialty').value;
  const docId    = document.getElementById('apt-doctor').value;
  const date     = document.getElementById('apt-date').value;
  const time     = document.getElementById('apt-time').value;
  const type     = document.getElementById('apt-type').value;
  const reason   = document.getElementById('apt-reason').value;
  const reminder = document.getElementById('apt-reminder').checked;

  if (!patId || !sp || !docId || !date || !time) {
    showToast('Completa todos los campos obligatorios', 'error'); return;
  }

  const patient = getPatients().find(p => p.id === patId);
  const doctor  = Object.values(DOCTORS).flat().find(d => d.id === docId);

  const apts = getAppointments();
  const newApt = {
    appointmentId: 'APT-' + Date.now(),
    patientId: patId, patientName: patient.name,
    doctorId: docId, doctorName: doctor.name,
    specialty: sp, date, time, type, reason,
    reminder, status: 'scheduled',
    createdAt: new Date().toISOString()
  };
  apts.push(newApt);
  saveAppointments(apts);

  if (reminder) scheduleReminder(newApt);
  showToast(`Cita confirmada para ${patient.name} el ${date} a las ${time} ✅`);
  clearForm('schedule');
  updateDashboard();
}

// ─── RENDERIZAR CITAS ─────────────────────────────────────
function renderAppointments() {
  const filter = document.getElementById('filter-status').value;
  let apts = getAppointments();
  if (filter !== 'all') apts = apts.filter(a => a.status === filter);

  const container = document.getElementById('appointments-list');
  if (!apts.length) {
    container.innerHTML = '<p style="color:#64748b;padding:1rem">No hay citas para mostrar.</p>'; return;
  }

  const statusBadge = { scheduled:'badge-info', cancelled:'badge-danger', completed:'badge-success' };
  const statusLabel = { scheduled:'Agendada', cancelled:'Cancelada', completed:'Completada' };
  const typeLabel   = { first:'Primera Vez', followup:'Control', urgency:'Urgencias' };

  container.innerHTML = apts.sort((a,b) => new Date(a.date+' '+a.time) - new Date(b.date+' '+b.time))
    .map(a => `
    <div class="appointment-card ${a.status}">
      <div class="apt-header">
        <div>
          <strong>${a.patientName}</strong>
          <p style="color:#64748b;font-size:.85rem">${a.doctorName}</p>
        </div>
        <span class="badge ${statusBadge[a.status]}">${statusLabel[a.status]}</span>
      </div>
      <p><i class="fas fa-calendar" style="color:#2563eb"></i> ${a.date} &nbsp;
         <i class="fas fa-clock" style="color:#2563eb"></i> ${a.time}</p>
      <p><i class="fas fa-stethoscope" style="color:#2563eb"></i> ${a.specialty} — <em>${typeLabel[a.type]}</em></p>
      ${a.reason ? `<p style="font-size:.85rem;color:#64748b;margin-top:.4rem">${a.reason}</p>` : ''}
      <p style="font-size:.8rem;margin-top:.5rem">${a.reminder ? '🔔 Recordatorio activo' : '🔕 Sin recordatorio'}</p>
      <div class="apt-actions">
        ${a.status === 'scheduled' ? `
          <button class="btn btn-sm btn-warning" onclick="openRescheduleModal('${a.appointmentId}')"><i class="fas fa-calendar-edit"></i> Reprogramar</button>
          <button class="btn btn-sm btn-danger"  onclick="cancelAppointment('${a.appointmentId}')"><i class="fas fa-times"></i> Cancelar</button>
          <button class="btn btn-sm btn-secondary" onclick="completeAppointment('${a.appointmentId}')"><i class="fas fa-check"></i> Completar</button>
        ` : ''}
      </div>
    </div>`).join('');
}

function filterAppointments() { renderAppointments(); }

function cancelAppointment(id) {
  if (!confirm('¿Cancelar esta cita?')) return;
  const apts = getAppointments();
  const apt  = apts.find(a => a.appointmentId === id);
  if (apt) { apt.status = 'cancelled'; apt.cancelledAt = new Date().toISOString(); }
  saveAppointments(apts);
  showToast('Cita cancelada', 'info');
  renderAppointments(); updateDashboard();
}

function completeAppointment(id) {
  const apts = getAppointments();
  const apt  = apts.find(a => a.appointmentId === id);
  if (apt) { apt.status = 'completed'; apt.completedAt = new Date().toISOString(); }
  saveAppointments(apts);
  showToast('Cita marcada como completada ✅');
  renderAppointments(); updateDashboard();
}

function confirmReschedule() {
  const newDate = document.getElementById('reschedule-date').value;
  const newTime = document.getElementById('reschedule-time').value;
  const reason  = document.getElementById('reschedule-reason').value;
  if (!newDate || !newTime) { showToast('Selecciona fecha y hora', 'error'); return; }

  const apts = getAppointments();
  const apt  = apts.find(a => a.appointmentId === currentRescheduleId);
  if (apt) {
    apt.date = newDate; apt.time = newTime;
    apt.rescheduleReason = reason;
    apt.rescheduledAt = new Date().toISOString();
  }
  saveAppointments(apts);
  if (apt?.reminder) scheduleReminder(apt);
  showToast('Cita reprogramada exitosamente ✅');
  closeModal(); renderAppointments(); updateDashboard();
}

// ─── DISPONIBILIDAD ───────────────────────────────────────
function checkAvailability() {
  const sp   = document.getElementById('avail-specialty').value;
  const date = document.getElementById('avail-date').value || new Date().toISOString().split('T')[0];
  const taken = getAppointments()
    .filter(a => a.date === date && a.status === 'scheduled')
    .reduce((acc, a) => {
      acc[a.doctorId] = acc[a.doctorId] || [];
      acc[a.doctorId].push(a.time); return acc;
    }, {});

  const doctors = sp ? DOCTORS[sp] : Object.values(DOCTORS).flat();
  const container = document.getElementById('availability-grid');
  container.innerHTML = doctors.map(d => {
    const takenSlots = taken[d.id] || [];
    const slots = ALL_TIMES.map(t =>
      `<span class="slot ${takenSlots.includes(t) ? 'taken' : 'available'}">${t}</span>`
    ).join('');
    const avCount = ALL_TIMES.length - takenSlots.length;
    return `
      <div class="doctor-card">
        <div class="doctor-avatar"><i class="fas fa-user-md"></i></div>
        <h3>${d.name}</h3>
        <span class="badge ${avCount > 0 ? 'badge-success' : 'badge-danger'}">
          ${avCount > 0 ? avCount + ' horas disponibles' : 'Sin disponibilidad'}
        </span>
        <div class="slots-list">${slots}</div>
      </div>`;
  }).join('');
}
