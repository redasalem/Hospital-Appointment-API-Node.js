const APPOINTMENT_DURATION = 30;
const CANCEL_BEFORE = 24;

function isFuture(date) {
  return new Date(date) > new Date();
}

function addMinutes(date, minutes) {
  return new Date(new Date(date).getTime() + minutes * 60 * 1000);
}

function timeToMinutes(time) {
  const [hour, minute] = time.split(':').map(Number);
  return hour * 60 + minute;
}

function isInWorkingHours(startsAt, endsAt, workingHours) {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const day = days[start.getDay()];
  const schedule = workingHours.find((item) => item.day === day);

  if (!schedule || start.getDay() !== end.getDay()) return false;

  const startTime = start.getHours() * 60 + start.getMinutes();
  const endTime = end.getHours() * 60 + end.getMinutes();
  return startTime >= timeToMinutes(schedule.startTime) && endTime <= timeToMinutes(schedule.endTime);
}

function canDoctorChangeStatus(currentStatus, newStatus) {
  if (currentStatus === 'Pending') return ['Confirmed', 'Cancelled'].includes(newStatus);
  if (currentStatus === 'Confirmed') return ['Completed', 'Cancelled'].includes(newStatus);
  return false;
}

function canPatientCancel(appointment) {
  if (!['Pending', 'Confirmed'].includes(appointment.status)) return false;
  const deadline = new Date(appointment.startsAt).getTime() - CANCEL_BEFORE * 60 * 60 * 1000;
  return Date.now() <= deadline;
}

module.exports = { APPOINTMENT_DURATION, isFuture, addMinutes, isInWorkingHours, canDoctorChangeStatus, canPatientCancel };
