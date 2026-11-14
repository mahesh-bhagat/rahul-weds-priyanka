/**
 * APPLICATION ENTRY POINT
 * Coordinates DOM binding, content hydration, animations, and audio.
 */
document.addEventListener('DOMContentLoaded', () => {
  const data = window.WEDDING_DATA || {};

  // Hydrate couple names and initials from centralized data
  document.querySelectorAll('[data-bride]').forEach(el => {
    el.textContent = data.bride || 'The Bride';
  });

  document.querySelectorAll('[data-groom]').forEach(el => {
    el.textContent = data.groom || 'The Groom';
  });

  const initialsEl = document.querySelector('[data-initials]');
  if (initialsEl) {
    if (data.initials) {
      initialsEl.textContent = data.initials;
    } else {
      const bInit = (data.bride || 'B').trim().charAt(0);
      const gInit = (data.groom || 'G').trim().charAt(0);
      initialsEl.textContent = `${bInit} & ${gInit}`;
    }
  }

  // Start countdown timer
  if (typeof window.startCountdown === 'function') {
    window.startCountdown();
  }

  // Prepare audio handler
  let tryMusic = () => {};
  if (typeof window.setupAudio === 'function') {
    tryMusic = window.setupAudio();
  }

  // Initialize gallery (renders photo grid from content.js data)
  if (typeof window.initGallery === 'function') {
    window.initGallery();
  }

  // Initialize celebrations cards (renders from content.js data)
  if (typeof window.initCelebrations === 'function') {
    window.initCelebrations();
  }

  // Initialize animations and scroll watcher
  if (window.WeddingAnimations) {
    window.WeddingAnimations.initWelcomeAnimation();
    window.WeddingAnimations.initScrollWatcher();
    window.WeddingAnimations.initStoryObserver();
  }

  if (window.WeddingFireworks) {
    window.WeddingFireworks.init();
  }

  const celebrateAfterEntry = () => {
    if (!window.WeddingFireworks) return;
    window.WeddingFireworks.playWelcomeShow();
    window.WeddingFireworks.observeCelebrationSection();
  };

  // Handle "Enter Our Story" action
  const enterBtn = document.getElementById('enter');
  if (enterBtn) {
    let entryStarted = false;
    enterBtn.addEventListener('click', () => {
      if (entryStarted) return;
      entryStarted = true;
      enterBtn.disabled = true;
      tryMusic();

      if (window.WeddingAnimations) {
        window.WeddingAnimations.transitionToHero(() => {
          celebrateAfterEntry();
          const main = document.getElementById('main');
          if (main) {
            main.focus?.();
          }
        });
      } else {
        // Fallback
        document.body.classList.add('entered');
        const main = document.getElementById('main');
        const welcome = document.getElementById('welcome');
        if (main) main.inert = false;
        if (welcome) welcome.classList.add('dismissed');
        celebrateAfterEntry();
      }
    });
  }
});
