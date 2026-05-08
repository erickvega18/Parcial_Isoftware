function scheduleReminder(appointment) {
  const reminders = JSON.parse(localStorage.getItem('reminders') || '[]');
  reminders.push({
    appointmentId: appointment.appointmentId,
    patientName:   appointment.patientName,
    doctorName:    appointment.doctorName,
    date:          appointment.date,
    time:          appointment.time,
    sentAt:        new Date().toISOString(),
    message: `Recordatorio: ${appointment.patientName}, tienes cita con ${appointment.doctorName} el ${appointment.date} a las ${appointment.time}.`
  });
  localStorage.setItem('reminders', JSON.stringify(reminders));
  console.log(`📧 Recordatorio agendado para: ${appointment.patientName}`);
}


function checkReminders() {
  const reminders = JSON.parse(localStorage.getItem('reminders') || '[]');
  const now  = new Date();
  const apts = getAppointments().filter(a => a.status === 'scheduled');
  apts.forEach(apt => {
    const aptDate = new Date(`${apt.date}T${apt.time}`);
    const diffHrs = (aptDate - now) / (1000 * 60 * 60);
    if (diffHrs > 0 && diffHrs <= 24) {
      const alreadySent = reminders.find(r =>
        r.appointmentId === apt.appointmentId &&
        new Date(r.sentAt) > new Date(now - 24 * 60 * 60 * 1000)
      );
      if (!alreadySent) {
        showToast(`🔔 Recordatorio: ${apt.patientName} tiene cita mañana a las ${apt.time}`, 'info');
        scheduleReminder(apt);
      }
    }
  });
  document.getElementById('total-reminders').textContent =
    JSON.parse(localStorage.getItem('reminders') || '[]').length;
}
