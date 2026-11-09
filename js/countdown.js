/**
 * WEDDING COUNTDOWN TIMER
 * Tracks the moments until 1 January 2027 in Asia/Kolkata timezone.
 */
window.startCountdown = function() {
  const elements = {
    days: document.getElementById('days'),
    hours: document.getElementById('hours'),
    minutes: document.getElementById('minutes'),
    seconds: document.getElementById('seconds'),
    container: document.getElementById('countdown'),
    note: document.querySelector('.story-note')
  };

  if (!elements.days || !elements.hours || !elements.minutes || !elements.seconds) {
    return;
  }

  // Parse target date (ensures ISO string with +05:30 is parsed properly)
  const targetDate = new Date(window.WEDDING_DATA.weddingDate).getTime();

  function update() {
    const now = Date.now();
    const diff = targetDate - now;

    if (diff <= 0) {
      elements.days.textContent = '00';
      elements.hours.textContent = '00';
      elements.minutes.textContent = '00';
      elements.seconds.textContent = '00';

      if (elements.note) {
        elements.note.textContent = 'The sacred day is here. Forever begins today. ✨';
      }
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    elements.days.textContent = String(days).padStart(2, '0');
    elements.hours.textContent = String(hours).padStart(2, '0');
    elements.minutes.textContent = String(minutes).padStart(2, '0');
    elements.seconds.textContent = String(seconds).padStart(2, '0');
  }

  // Initial immediate run to avoid layout shifts or delayed numbers
  update();
  const timerId = setInterval(update, 1000);

  // Return cleanup in case page unloads
  return () => clearInterval(timerId);
};
