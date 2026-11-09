/**
 * CINEMATIC ANIMATIONS ENGINE
 * Powered by GSAP 3 with reliable CSS fallbacks.
 *
 * Key design decisions:
 * - main.inert is removed IMMEDIATELY on click (not after animation)
 * - body.entered is added IMMEDIATELY so #main becomes visible via CSS
 * - GSAP only animates the welcome dismissal; CSS handles #main fade-in
 * - hero elements use CSS classes for reveal (not GSAP fromTo) so they
 *   are never stuck at opacity:0 if GSAP errors or is unavailable
 * - All paths are robust even if GSAP CDN fails to load
 */
window.WeddingAnimations = (function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── WELCOME ENTRANCE ──────────────────────────────────── */
  function initWelcomeAnimation() {
    if (prefersReducedMotion) return;
    if (!window.gsap) return;

    gsap.timeline({ defaults: { ease: 'power2.out' } })
      .from('.welcome-card', { opacity: 0, scale: 0.97, duration: 1.0, ease: 'power3.out' })
      .from('.corner-ornament', { opacity: 0, scale: 0.7, stagger: 0.08, duration: 0.7 }, '-=0.5')
      .from(['.welcome-crest', '.devanagari-auspicious', '.welcome-sub-eyebrow'],
        { opacity: 0, y: -10, stagger: 0.1, duration: 0.65 }, '-=0.4')
      .from('.welcome-title .couple-name', { opacity: 0, y: 16, stagger: 0.14, duration: 0.8 }, '-=0.3')
      .from('.welcome-title .amp', { opacity: 0, scale: 0.5, duration: 0.5 }, '-=0.55')
      .from('.welcome-tagline', { opacity: 0, y: 8, duration: 0.55 }, '-=0.3')
      .from('.royal-divider', { opacity: 0, scaleX: 0.5, duration: 0.6 }, '-=0.3')
      .from(['.welcome-date-badge', '.welcome-action-wrap', '.welcome-hint'],
        { opacity: 0, y: 10, stagger: 0.09, duration: 0.55 }, '-=0.25');
  }

  /* ── ENTER TRANSITION ──────────────────────────────────── */
  function transitionToHero(onCompleteCallback) {
    const welcome = document.getElementById('welcome');
    const main    = document.getElementById('main');

    // ── STEP 1: Immediately unlock the main content.
    // This must happen BEFORE any animation so the page is interactive
    // even during the welcome fade-out. The CSS transition on #main handles
    // the visual fade-in via the .entered class.
    main.inert = false;
    document.body.classList.add('entered');

    // ── Reduced-motion: instant swap, no animation
    if (prefersReducedMotion) {
      welcome.classList.add('dismissed');
      if (onCompleteCallback) onCompleteCallback();
      return;
    }

    // ── GSAP path: smooth welcome fade-out only
    if (window.gsap) {
      gsap.timeline({
        onComplete: () => {
          welcome.classList.add('dismissed');
          // Run hero text reveal after welcome is gone
          _revealHeroContent();
          if (onCompleteCallback) onCompleteCallback();
        }
      })
      .to('.welcome-inner', { opacity: 0, y: -12, duration: 0.5, ease: 'power2.in' })
      .to(welcome,          { opacity: 0, duration: 0.55, ease: 'power2.inOut' }, '-=0.2');

      return;
    }

    // ── CSS-only fallback: add dismissed class and let CSS transition handle it
    welcome.classList.add('dismissed');
    _revealHeroContent();
    if (onCompleteCallback) onCompleteCallback();
  }

  /* ── HERO CONTENT REVEAL ───────────────────────────────── */
  // Staggers hero text into view using GSAP if available,
  // otherwise CSS class reveal ensures elements are always visible.
  function _revealHeroContent() {
    // Always ensure hero elements are visible (CSS safety net)
    document.querySelectorAll('.hero-reveal').forEach(el => {
      el.classList.add('hero-reveal--visible');
    });

    if (!window.gsap || prefersReducedMotion) return;

    gsap.fromTo(
      ['.hero-content .eyebrow-royal', '.hero-title', '.hero-subtitle',
       '.hero-date-line', '.hero-scroll-btn'],
      { opacity: 0, y: 22 },
      { opacity: 1, y: 0, stagger: 0.12, duration: 0.85, ease: 'power3.out', delay: 0.1 }
    );
  }

  /* ── SCROLL WATCHER ────────────────────────────────────── */
  function initScrollWatcher() {
    const topbar = document.getElementById('topbar');
    if (!topbar) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          topbar.classList.toggle('scrolled', window.scrollY > 40);
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* ── STORY SECTION SCROLL REVEALS ─────────────────────── */
  function initStoryObserver() {
    if (prefersReducedMotion) {
      // Skip animation — make everything visible immediately
      document.querySelectorAll(
        '.chapter-split, .chapter-grand, .chapter-pair-card, .story-finale-block'
      ).forEach(el => el.classList.add('in-view'));
      return;
    }

    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll(
        '.chapter-split, .chapter-grand, .chapter-pair-card, .story-finale-block'
      ).forEach(el => el.classList.add('in-view'));
      return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          obs.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -60px 0px', threshold: 0.12 });

    document.querySelectorAll(
      '.chapter-split, .chapter-grand, .chapter-pair-card, .story-finale-block'
    ).forEach(el => observer.observe(el));
  }

  /* ── PUBLIC API ────────────────────────────────────────── */
  return {
    initWelcomeAnimation,
    transitionToHero,
    initScrollWatcher,
    initStoryObserver
  };

})();
