// ─── STORAGE ──────────────────────────────────────────────
function getPatients() {
  return JSON.parse(localStorage.getItem('patients') || '[]');
}

function savePatients(p) {
  localStorage.setItem('patients', JSON.stringify(p));
}

// ─── REGISTRAR PACIENTE ───────────────────────────────────
function registerPatient() {
  const name    = document.getElementById('pat-name').value.trim();
  const id      = document.getElementById('pat-id').value.trim();
  const birth   = document.getElementById('pat-birth').value;
  const phone   = document.getElementById('pat-phone').value.trim();
  const email   = document.getElementById('pat-email').value.trim();
  const eps     = document.getElementById('pat-eps').value;
  const address = document.getElementById('pat-address').value.trim();
  const history = document.getElementById('pat-history').value.trim();

  if (!name || !id || !birth || !phone || !email) {
    showToast('Por favor completa los campos obligatorios', 'error'); return;
  }
  const patients = getPatients();
  if (patients.find(p => p.id === id)) {
    showToast('Ya existe un paciente con esa cédula', 'error'); return;
  }

  patients.push({ id, name, birth, phone, email, eps, address, history,
                  registeredAt: new Date().toISOString() });
  savePatients(patients);
  showToast(`Paciente ${name} registrado exitosamente ✅`);
  clearForm('register');
  renderPatients();
  updateDashboard();
}

// ─── RENDERIZAR TABLA ─────────────────────────────────────
function renderPatients(list) {
  const patients = list || getPatients();
  const container = document.getElementById('patients-list');
  if (!patients.length) {
    container.innerHTML = '<p style="padding:1rem;color:#64748b">No hay pacientes registrados.</p>'; return;
  }
  container.innerHTML = `
    <table>
      <thead><tr>
        <th>Cédula</th><th>Nombre</th><th>Teléfono</th><th>Email</th><th>EPS</th><th>Acciones</th>
      </tr></thead>
      <tbody>${patients.map(p => `
        <tr>
          <td>${p.id}</td>
          <td><strong>${p.name}</strong></td>
          <td>${p.phone}</td>
          <td>${p.email}</td>
          <td><span class="badge badge-info">${p.eps || 'N/A'}</span></td>
          <td>
            <button class="btn btn-sm btn-outline" onclick="editPatient('${p.id}')"><i class="fas fa-edit"></i></button>
            <button class="btn btn-sm btn-danger"  onclick="deletePatient('${p.id}')"><i class="fas fa-trash"></i></button>
          </td>
        </tr>`).join('')}
      </tbody>
    </table>`;
}

function searchPatients() {
  const q = document.getElementById('search-patient').value.toLowerCase();
  renderPatients(getPatients().filter(p =>
    p.name.toLowerCase().includes(q) || p.id.includes(q) || p.email.toLowerCase().includes(q)
  ));
}

function deletePatient(id) {
  if (!confirm('¿Eliminar este paciente?')) return;
  savePatients(getPatients().filter(p => p.id !== id));
  showToast('Paciente eliminado');
  renderPatients();
  updateDashboard();
}

function editPatient(id) {
  const p = getPatients().find(p => p.id === id);
  if (!p) return;
  document.getElementById('pat-name').value    = p.name;
  document.getElementById('pat-id').value      = p.id;
  document.getElementById('pat-birth').value   = p.birth;
  document.getElementById('pat-phone').value   = p.phone;
  document.getElementById('pat-email').value   = p.email;
  document.getElementById('pat-eps').value     = p.eps;
  document.getElementById('pat-address').value = p.address;
  document.getElementById('pat-history').value = p.history;
  deletePatient(id);
  showToast('Edita los datos y guarda de nuevo', 'info');
}

function populatePatientDropdown() {
  const sel = document.getElementById('apt-patient');
  sel.innerHTML = '<option value="">Seleccionar paciente...</option>';
  getPatients().forEach(p => {
    const o = document.createElement('option');
    o.value = p.id; o.textContent = `${p.name} (${p.id})`;
    sel.appendChild(o);
  });
}
