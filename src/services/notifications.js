// Local notifications via Notification API + Service Worker.
// Schedules daily reminders by computing the delay until the next target time
// and dispatching to the SW on page load. The SW uses setTimeout inside the
// current active lifetime — for reliable daily reminders on Android the PWA
// should be opened occasionally or use the Periodic Background Sync API
// (limited support).

export async function requestPermission() {
  if (!('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  return Notification.requestPermission();
}

function nextOccurrenceMs(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  const now = new Date();
  const target = new Date();
  target.setHours(h, m, 0, 0);
  if (target.getTime() <= now.getTime()) target.setDate(target.getDate() + 1);
  return target.getTime() - now.getTime();
}

export async function scheduleReminders(times) {
  const reg = await navigator.serviceWorker?.getRegistration();
  if (!reg || !reg.active) return;
  if (Notification.permission !== 'granted') return;

  for (const t of times || []) {
    const delay = nextOccurrenceMs(t);
    reg.active.postMessage({
      type: 'SCHEDULE_REMINDER',
      title: 'Noji Cards',
      body: 'Hora de repasar tus tarjetas 📚',
      delay,
    });
  }
}

export async function showTestNotification() {
  if (Notification.permission !== 'granted') return;
  const reg = await navigator.serviceWorker?.getRegistration();
  if (!reg) return;
  reg.showNotification('Noji Cards', {
    body: 'Notificaciones activadas ✅',
    icon: './icons/icon.svg',
    tag: 'noji-test',
  });
}
