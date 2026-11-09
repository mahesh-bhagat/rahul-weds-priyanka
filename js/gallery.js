/**
 * GALLERY — Premium Engagement Photo Gallery with Lightbox
 * Renders from WEDDING_DATA.gallery in content.js.
 * Zero external dependencies.
 */
(function () {
  'use strict';

  /* ── STATE ─────────────────────────────────────────── */
  let currentIndex = 0;
  let items = [];
  let isOpen = false;
  let touchStartX = 0;
  let touchStartY = 0;
  const SWIPE_THRESHOLD = 48;

  /* ── DOM REFS ──────────────────────────────────────── */
  let lightbox, lbImg, lbCaption, lbCounter, lbPrev, lbNext, lbClose;

  /* ── RENDER GALLERY GRID ───────────────────────────── */
  function renderGallery() {
    const data = window.WEDDING_DATA && window.WEDDING_DATA.gallery;
    if (!data || !Array.isArray(data.items) || !data.items.length) return;

    items = data.items;

    const section = document.getElementById('gallery-section');
    if (!section) return;

    // Inject heading/subtitle from data
    const headingEl = section.querySelector('[data-gallery-heading]');
    const subtitleEl = section.querySelector('[data-gallery-subtitle]');
    if (headingEl) headingEl.textContent = data.heading;
    if (subtitleEl) subtitleEl.textContent = data.subtitle;

    const grid = section.querySelector('.gallery-grid');
    if (!grid) return;

    items.forEach((item, i) => {
      const tile = document.createElement('figure');
      tile.className = 'gallery-tile' + (item.span ? ' gallery-tile--' + item.span : '');
      tile.setAttribute('data-index', i);
      tile.setAttribute('role', 'button');
      tile.setAttribute('tabindex', '0');
      tile.setAttribute('aria-label', 'View photo: ' + (item.caption || item.alt));

      const img = document.createElement('img');
      img.src = item.src;
      img.alt = item.alt || '';
      // Lazy-load all gallery images except the first two
      if (i > 1) img.loading = 'lazy';
      img.decoding = 'async';

      const overlay = document.createElement('div');
      overlay.className = 'gallery-tile-overlay';
      overlay.setAttribute('aria-hidden', 'true');

      if (item.caption) {
        const cap = document.createElement('figcaption');
        cap.className = 'gallery-tile-caption';
        cap.textContent = item.caption;
        overlay.appendChild(cap);
      }

      tile.appendChild(img);
      tile.appendChild(overlay);
      grid.appendChild(tile);

      tile.addEventListener('click', () => openLightbox(i));
      tile.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(i);
        }
      });
    });
  }

  /* ── LIGHTBOX CREATION ─────────────────────────────── */
  function createLightbox() {
    lightbox = document.createElement('div');
    lightbox.id = 'lightbox';
    lightbox.className = 'lightbox';
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.setAttribute('aria-label', 'Photo viewer');
    lightbox.setAttribute('aria-hidden', 'true');

    lightbox.innerHTML = `
      <div class="lightbox-backdrop"></div>
      <div class="lightbox-panel">
        <button class="lightbox-close" id="lb-close" aria-label="Close photo viewer">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
        <button class="lightbox-nav lightbox-prev" id="lb-prev" aria-label="Previous photo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        <div class="lightbox-img-wrap">
          <img class="lightbox-img" id="lb-img" src="" alt="" draggable="false">
        </div>
        <button class="lightbox-nav lightbox-next" id="lb-next" aria-label="Next photo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
        <div class="lightbox-footer">
          <p class="lightbox-caption" id="lb-caption"></p>
          <span class="lightbox-counter" id="lb-counter"></span>
        </div>
      </div>
    `;

    document.body.appendChild(lightbox);

    lbImg = lightbox.querySelector('#lb-img');
    lbCaption = lightbox.querySelector('#lb-caption');
    lbCounter = lightbox.querySelector('#lb-counter');
    lbPrev = lightbox.querySelector('#lb-prev');
    lbNext = lightbox.querySelector('#lb-next');
    lbClose = lightbox.querySelector('#lb-close');

    // Controls
    lbClose.addEventListener('click', closeLightbox);
    lbPrev.addEventListener('click', () => navigate(-1));
    lbNext.addEventListener('click', () => navigate(1));
    lightbox.querySelector('.lightbox-backdrop').addEventListener('click', closeLightbox);

    // Keyboard
    document.addEventListener('keydown', handleKeyboard);

    // Touch swipe
    lightbox.addEventListener('touchstart', onTouchStart, { passive: true });
    lightbox.addEventListener('touchend', onTouchEnd, { passive: true });
  }

  /* ── OPEN / CLOSE ──────────────────────────────────── */
  function openLightbox(index) {
    if (!lightbox) createLightbox();
    currentIndex = index;
    isOpen = true;
    updateLightboxContent();
    lightbox.setAttribute('aria-hidden', 'false');
    lightbox.classList.add('lightbox--open');
    document.documentElement.style.overflow = 'hidden';
    // Focus close button for accessibility
    requestAnimationFrame(() => lbClose.focus());
  }

  function closeLightbox() {
    if (!isOpen) return;
    isOpen = false;
    lightbox.classList.remove('lightbox--open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.documentElement.style.overflow = '';
    // Return focus to the gallery tile that was opened
    const tile = document.querySelector(`.gallery-tile[data-index="${currentIndex}"]`);
    if (tile) tile.focus();
  }

  /* ── NAVIGATE ──────────────────────────────────────── */
  function navigate(direction) {
    currentIndex = (currentIndex + direction + items.length) % items.length;
    updateLightboxContent();
  }

  function updateLightboxContent() {
    const item = items[currentIndex];
    if (!item) return;

    // Fade transition
    lbImg.style.opacity = '0';
    setTimeout(() => {
      lbImg.src = item.src;
      lbImg.alt = item.alt || '';
      lbImg.onload = () => { lbImg.style.opacity = '1'; };
      // Fallback if already cached
      if (lbImg.complete) lbImg.style.opacity = '1';
    }, 120);

    lbCaption.textContent = item.caption || '';
    lbCounter.textContent = (currentIndex + 1) + ' / ' + items.length;

    // Show/hide nav at boundaries (or loop, your choice)
    lbPrev.style.visibility = items.length > 1 ? 'visible' : 'hidden';
    lbNext.style.visibility = items.length > 1 ? 'visible' : 'hidden';
  }

  /* ── KEYBOARD ──────────────────────────────────────── */
  function handleKeyboard(e) {
    if (!isOpen) return;
    switch (e.key) {
      case 'Escape':   e.preventDefault(); closeLightbox(); break;
      case 'ArrowLeft':  e.preventDefault(); navigate(-1); break;
      case 'ArrowRight': e.preventDefault(); navigate(1);  break;
    }
  }

  /* ── TOUCH / SWIPE ─────────────────────────────────── */
  function onTouchStart(e) {
    touchStartX = e.changedTouches[0].clientX;
    touchStartY = e.changedTouches[0].clientY;
  }

  function onTouchEnd(e) {
    if (!isOpen) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > SWIPE_THRESHOLD) {
      navigate(dx < 0 ? 1 : -1);
    }
  }

  /* ── INIT ──────────────────────────────────────────── */
  window.initGallery = function () {
    renderGallery();
  };

})();
