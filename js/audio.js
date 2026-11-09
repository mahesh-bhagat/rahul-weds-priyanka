/**
 * AUDIO CONTROLLER
 * Handles graceful background audio playback, user preferences, and fallbacks.
 */
(function() {
  let audio = null;
  let isAvailable = false;
  let userPaused = false;

  // Initialize audio element with safe error traps
  try {
    if (window.WEDDING_DATA && window.WEDDING_DATA.musicFile) {
      audio = new Audio();
      audio.loop = true;
      audio.volume = 0.4;
      audio.preload = 'none';

      // Check for loading error (e.g. missing file)
      audio.addEventListener('error', function() {
        isAvailable = false;
        console.info('Wedding music track is not yet added to ' + window.WEDDING_DATA.musicFile + '. Player remains in gentle standby.');
        updateButtonUI(false, false);
      });

      audio.src = window.WEDDING_DATA.musicFile;
    }
  } catch (err) {
    console.info('Audio initialization deferred:', err);
  }

  function updateButtonUI(isPlaying, available = true) {
    const button = document.getElementById('sound');
    if (!button) return;

    const label = button.querySelector('.sound-label');

    if (!available) {
      button.setAttribute('aria-pressed', 'false');
      button.classList.remove('is-playing');
      if (label) label.textContent = 'Music off';
      return;
    }

    button.setAttribute('aria-pressed', String(isPlaying));
    if (isPlaying) {
      button.classList.add('is-playing');
      if (label) label.textContent = 'Music on';
    } else {
      button.classList.remove('is-playing');
      if (label) label.textContent = 'Music off';
    }
  }

  window.setupAudio = function() {
    const button = document.getElementById('sound');
    if (!button) return () => {};

    // Restore session preference if user had chosen during this session
    const sessionPref = sessionStorage.getItem('wedding_music_pref');
    if (sessionPref === 'paused') {
      userPaused = true;
    }

    button.addEventListener('click', async function() {
      if (!audio) return;

      if (!audio.paused) {
        audio.pause();
        userPaused = true;
        sessionStorage.setItem('wedding_music_pref', 'paused');
        updateButtonUI(false, isAvailable);
      } else {
        userPaused = false;
        sessionStorage.setItem('wedding_music_pref', 'playing');
        try {
          await audio.play();
          isAvailable = true;
          updateButtonUI(true, true);
        } catch (err) {
          isAvailable = false;
          updateButtonUI(false, false);
          console.info('Background music playback paused or file missing:', err.message);
        }
      }
    });

    if (audio) {
      audio.addEventListener('play', () => updateButtonUI(true, true));
      audio.addEventListener('pause', () => updateButtonUI(false, isAvailable));
    }

    // Return trigger function for initial site entrance
    return async function tryPlayOnEntry() {
      if (userPaused) return; // Respect user preference

      if (audio) {
        try {
          await audio.play();
          isAvailable = true;
          updateButtonUI(true, true);
        } catch (err) {
          // Normal browser autoplay restriction or missing file
          isAvailable = false;
          updateButtonUI(false, false);
          console.info('Audio autoplay on entry deferred or file not found.');
        }
      }
    };
  };
})();
