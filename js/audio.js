/**
 * AUDIO CONTROLLER
 * Handles graceful background audio playback, user preferences, and fallbacks.
 */
(function() {
  let audio = null;
  let isAvailable = false;
  let userPaused = false;
  let playRequest = null;
  let setupComplete = false;
  let entryPlaybackAttempted = false;

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

  function playIfNeeded() {
    if (!audio || userPaused) return Promise.resolve(false);

    if (!audio.paused && !audio.ended) {
      updateButtonUI(true, true);
      return Promise.resolve(true);
    }

    if (playRequest) return playRequest;

    try {
      playRequest = Promise.resolve(audio.play())
        .then(() => {
          isAvailable = true;
          if (userPaused) {
            audio.pause();
            updateButtonUI(false, true);
            return false;
          }
          updateButtonUI(true, true);
          return true;
        })
        .catch((err) => {
          isAvailable = false;
          updateButtonUI(false, false);
          console.info('Background music playback was blocked or unavailable:', err.message);
          return false;
        })
        .then((result) => {
          playRequest = null;
          return result;
        });
    } catch (err) {
      isAvailable = false;
      updateButtonUI(false, false);
      console.info('Background music playback was unavailable:', err.message);
      playRequest = null;
      return Promise.resolve(false);
    }

    return playRequest;
  }

  function playOnEntry() {
    if (entryPlaybackAttempted) return Promise.resolve(false);
    entryPlaybackAttempted = true;
    return playIfNeeded();
  }

  window.setupAudio = function() {
    const button = document.getElementById('sound');
    if (!button) return () => {};
    if (setupComplete) return playOnEntry;
    setupComplete = true;

    // Restore session preference if user had chosen during this session
    const sessionPref = sessionStorage.getItem('wedding_music_pref');
    if (sessionPref === 'paused') {
      userPaused = true;
    }

    button.addEventListener('click', async function() {
      if (!audio) return;

      if (!audio.paused || playRequest) {
        audio.pause();
        userPaused = true;
        sessionStorage.setItem('wedding_music_pref', 'paused');
        updateButtonUI(false, isAvailable);
      } else {
        userPaused = false;
        sessionStorage.setItem('wedding_music_pref', 'playing');
        await playIfNeeded();
      }
    });

    if (audio) {
      audio.addEventListener('play', () => {
        if (userPaused) {
          audio.pause();
          return;
        }
        updateButtonUI(true, true);
      });
      audio.addEventListener('pause', () => updateButtonUI(false, isAvailable));
    }

    return playOnEntry;
  };
})();
