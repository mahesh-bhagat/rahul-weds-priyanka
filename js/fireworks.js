/**
 * DECORATIVE WEDDING FIREWORKS
 * A bounded, event-driven canvas effect that never captures pointer input.
 */
window.WeddingFireworks = (function () {
  'use strict';

  const PALETTE = {
    gold: '#C5A46D',
    champagne: '#DFCCA6',
    antique: '#987844',
    rose: '#C98F7C',
    ivory: '#FAF6EF'
  };

  const SHOWS = {
    welcome: [
      { at: 0, x: 0.4, y: 0.34, size: 1.15, color: PALETTE.gold, accent: PALETTE.champagne },
      { at: 90, x: 0.6, y: 0.37, size: 1.08, color: PALETTE.champagne, accent: PALETTE.ivory },
      { at: 180, x: 0.5, y: 0.31, size: 1.2, color: PALETTE.rose, accent: PALETTE.champagne },
      { at: 270, x: 0.42, y: 0.45, size: 1.12, color: PALETTE.gold, accent: PALETTE.ivory },
      { at: 360, x: 0.58, y: 0.43, size: 1.1, color: PALETTE.rose, accent: PALETTE.champagne },
      { at: 450, x: 0.5, y: 0.49, size: 1.12, color: PALETTE.champagne, accent: PALETTE.gold },
      { at: 620, x: 0.17, y: 0.2, size: 0.76, color: PALETTE.gold, accent: PALETTE.champagne },
      { at: 760, x: 0.83, y: 0.22, size: 0.76, color: PALETTE.rose, accent: PALETTE.ivory },
      { at: 900, x: 0.82, y: 0.52, size: 0.72, color: PALETTE.champagne, accent: PALETTE.gold }
    ],
    celebration: [
      { at: 0, x: 0.4, y: 0.34, size: 0.98, color: PALETTE.gold, accent: PALETTE.champagne },
      { at: 760, x: 0.6, y: 0.37, size: 0.9, color: PALETTE.rose, accent: PALETTE.ivory },
      { at: 1520, x: 0.5, y: 0.31, size: 1.02, color: PALETTE.champagne, accent: PALETTE.gold },
      { at: 2320, x: 0.42, y: 0.45, size: 0.94, color: PALETTE.gold, accent: PALETTE.ivory },
      { at: 3100, x: 0.58, y: 0.43, size: 0.94, color: PALETTE.rose, accent: PALETTE.champagne },
      { at: 3900, x: 0.46, y: 0.36, size: 0.82, color: PALETTE.antique, accent: PALETTE.gold },
      { at: 4020, x: 0.54, y: 0.47, size: 1, color: PALETTE.gold, accent: PALETTE.champagne }
    ],
    intimate: [
      { at: 0, x: 0.42, y: 0.35, size: 0.68, color: PALETTE.gold, accent: PALETTE.champagne },
      { at: 900, x: 0.58, y: 0.4, size: 0.62, color: PALETTE.rose, accent: PALETTE.ivory },
      { at: 1750, x: 0.5, y: 0.32, size: 0.68, color: PALETTE.champagne, accent: PALETTE.gold }
    ]
  };

  const MAX_PARTICLES = 300;
  const MAX_POOL_SIZE = 640;
  const FRAME_INTERVAL = 1000 / 30;
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const particlePool = [];
  const particles = [];
  const rockets = [];

  let canvas;
  let context;
  let width = 0;
  let height = 0;
  let pixelRatio = 1;
  let frameId = 0;
  let lastFrameTime = 0;
  let lastRenderTime = 0;
  let activeShow = null;
  let celebrateButton;
  let celebrationSection;
  let statusMessage;
  let sectionObserver;
  let sectionSeen = false;
  let pendingSectionShow = false;
  let pendingCelebrationShow = false;
  let initialized = false;
  let resizeHandlerAdded = false;

  function isMobile() {
    return window.matchMedia('(max-width: 700px)').matches;
  }

  function ensureCanvas() {
    if (canvas) return Boolean(context);
    if (!document.createElement('canvas').getContext) return false;

    canvas = document.createElement('canvas');
    canvas.className = 'fireworks-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.setAttribute('role', 'presentation');
    document.body.appendChild(canvas);
    context = canvas.getContext('2d', { alpha: true });

    if (!context) {
      canvas.remove();
      canvas = null;
      return false;
    }

    resizeCanvas();
    if (!resizeHandlerAdded) {
      window.addEventListener('resize', resizeCanvas, { passive: true });
      resizeHandlerAdded = true;
    }
    return true;
  }

  function resizeCanvas() {
    if (!canvas || !context) return;

    width = window.innerWidth;
    height = window.innerHeight;
    pixelRatio = Math.min(window.devicePixelRatio || 1, isMobile() ? 1.5 : 2);

    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  }

  function acquireParticle() {
    return particlePool.pop() || {};
  }

  function releaseParticle(particle) {
    if (particlePool.length < MAX_POOL_SIZE) particlePool.push(particle);
  }

  function addParticle(x, y, vx, vy, options) {
    const particleLimit = isMobile() ? 120 : MAX_PARTICLES;
    if (particles.length >= particleLimit) return;

    const particle = acquireParticle();
    particle.x = x;
    particle.y = y;
    particle.vx = vx;
    particle.vy = vy;
    particle.life = options.life;
    particle.maxLife = options.life;
    particle.gravity = options.gravity;
    particle.drag = options.drag;
    particle.size = options.size;
    particle.color = options.color;
    particle.tail = options.tail;
    particle.twinkle = options.twinkle;
    particles.push(particle);
  }

  function burst(x, y, event) {
    const mobile = isMobile();
    const count = Math.round((mobile ? 32 : 52) * event.size);
    const angleOffset = Math.random() * Math.PI * 2;
    const colors = [event.color, event.color, event.accent, PALETTE.antique];

    for (let index = 0; index < count; index += 1) {
      const angle = angleOffset + (index / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.08;
      const speed = (mobile ? 32 : 64) + Math.random() * (mobile ? 26 : 48);
      const life = 1.15 + Math.random() * 0.45;

      addParticle(x, y, Math.cos(angle) * speed * event.size, Math.sin(angle) * speed * event.size, {
        life,
        gravity: 24 + Math.random() * 24,
        drag: 0.985 + Math.random() * 0.009,
        size: 1.2 + Math.random() * (mobile ? 0.7 : 1.1),
        color: index % 8 === 0 ? PALETTE.ivory : colors[index % colors.length],
        tail: 0.045 + Math.random() * 0.04,
        twinkle: 0.1 + Math.random() * 0.14
      });
    }

    const willowCount = mobile ? 7 : 12;
    for (let index = 0; index < willowCount; index += 1) {
      const angle = Math.PI * (0.12 + Math.random() * 0.76);
      const speed = (mobile ? 20 : 34) + Math.random() * (mobile ? 16 : 26);
      addParticle(x, y, Math.cos(angle) * speed * event.size, Math.sin(angle) * speed * event.size, {
        life: 1.55 + Math.random() * 0.4,
        gravity: 42 + Math.random() * 20,
        drag: 0.992,
        size: 1 + Math.random() * 0.9,
        color: index % 3 === 0 ? PALETTE.gold : event.accent,
        tail: 0.06 + Math.random() * 0.035,
        twinkle: 0.14
      });
    }

    const fleckCount = mobile ? 5 : 8;
    for (let index = 0; index < fleckCount; index += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (mobile ? 10 : 18) + Math.random() * (mobile ? 18 : 34);
      addParticle(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, {
        life: 1.1 + Math.random() * 0.4,
        gravity: 14 + Math.random() * 20,
        drag: 0.99,
        size: 1 + Math.random() * 1.3,
        color: index % 3 === 0 ? PALETTE.ivory : event.accent,
        tail: 0.035 + Math.random() * 0.035,
        twinkle: 0.12
      });
    }
  }

  function launchRocket(event) {
    const targetX = width * event.x;
    const targetY = height * Math.min(event.y, 0.55);

    rockets.push({
      startX: targetX,
      startY: Math.min(height * 0.72, targetY + Math.min(95, height * 0.12)),
      targetX,
      targetY,
      elapsed: 0,
      duration: 0.32 + Math.random() * 0.12,
      color: event.color,
      event
    });
  }

  function drawRocket(rocket, delta) {
    rocket.elapsed += delta;
    const progress = Math.min(1, rocket.elapsed / rocket.duration);
    const eased = 1 - (1 - progress) * (1 - progress);
    const x = rocket.startX + (rocket.targetX - rocket.startX) * eased;
    const y = rocket.startY + (rocket.targetY - rocket.startY) * eased;
    const tailProgress = Math.max(0, progress - 0.075);
    const tailEased = 1 - (1 - tailProgress) * (1 - tailProgress);
    const tailX = rocket.startX + (rocket.targetX - rocket.startX) * tailEased;
    const tailY = rocket.startY + (rocket.targetY - rocket.startY) * tailEased;

    context.beginPath();
    context.moveTo(tailX, tailY);
    context.lineTo(x, y);
    context.strokeStyle = rocket.color;
    context.lineWidth = 1.6;
    context.globalAlpha = 0.72;
    context.shadowColor = rocket.color;
    context.shadowBlur = 0;
    context.stroke();

    if (progress >= 1) burst(rocket.targetX, rocket.targetY, rocket.event);
    return progress < 1;
  }

  function updateParticles(delta, elapsedDelta) {
    let writeIndex = 0;

    for (let index = 0; index < particles.length; index += 1) {
      const particle = particles[index];
      particle.life -= elapsedDelta;

      if (particle.life <= 0) {
        releaseParticle(particle);
        continue;
      }

      const frameDrag = Math.pow(particle.drag, delta * 60);
      particle.vx *= frameDrag;
      particle.vy = particle.vy * frameDrag + particle.gravity * delta;
      particle.x += particle.vx * delta;
      particle.y += particle.vy * delta;

      const fade = Math.min(1, (particle.maxLife - particle.life) / 0.12, particle.life / 0.5);
      const shimmer = 1 - particle.twinkle + particle.twinkle * (0.5 + Math.sin((particle.maxLife - particle.life) * 12) * 0.5);
      const alpha = Math.max(0, fade * shimmer);

      context.globalAlpha = alpha * 0.35;
      context.strokeStyle = particle.color;
      context.lineWidth = Math.max(0.7, particle.size * 0.75);
      context.shadowColor = particle.color;
      context.shadowBlur = 0;
      context.beginPath();
      context.moveTo(particle.x - particle.vx * particle.tail, particle.y - particle.vy * particle.tail);
      context.lineTo(particle.x, particle.y);
      context.stroke();

      context.globalAlpha = alpha;
      context.fillStyle = particle.color;
      context.shadowBlur = 0;
      context.beginPath();
      context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      context.fill();

      particles[writeIndex] = particle;
      writeIndex += 1;
    }

    particles.length = writeIndex;
  }

  function completeShow() {
    if (frameId) window.cancelAnimationFrame(frameId);
    frameId = 0;
    lastFrameTime = 0;
    lastRenderTime = 0;
    particles.forEach(releaseParticle);
    particles.length = 0;
    rockets.length = 0;
    if (context) {
      context.clearRect(0, 0, width, height);
      context.globalAlpha = 1;
      context.globalCompositeOperation = 'source-over';
    }
    if (canvas) canvas.classList.remove('fireworks-canvas--active');

    if (activeShow && activeShow.button) {
      activeShow.button.setAttribute('aria-busy', 'false');
      activeShow.button.classList.remove('is-celebrating');
      if (statusMessage) statusMessage.textContent = 'The celebration fireworks have finished.';
    }
    activeShow = null;

    if (pendingSectionShow) {
      pendingSectionShow = false;
      startShow('intimate');
      return;
    }

    if (pendingCelebrationShow) {
      pendingCelebrationShow = false;
      startShow('celebration', celebrateButton);
    }
  }

  function makeContinuousEvent(size = 0.92, cornerIndex = null) {
    const positions = cornerIndex === null ? [
      { x: 0.4, y: 0.34 },
      { x: 0.6, y: 0.38 },
      { x: 0.5, y: 0.31 },
      { x: 0.42, y: 0.45 },
      { x: 0.58, y: 0.43 },
      { x: 0.46, y: 0.36 },
      { x: 0.54, y: 0.48 }
    ] : [
      { x: 0.2, y: 0.25 },
      { x: 0.8, y: 0.25 },
      { x: 0.2, y: 0.5 },
      { x: 0.8, y: 0.5 }
    ];
    const colors = [
      [PALETTE.gold, PALETTE.champagne],
      [PALETTE.champagne, PALETTE.ivory],
      [PALETTE.rose, PALETTE.champagne],
      [PALETTE.antique, PALETTE.gold]
    ];
    const position = cornerIndex === null
      ? positions[Math.floor(Math.random() * positions.length)]
      : positions[cornerIndex % positions.length];
    const color = colors[Math.floor(Math.random() * colors.length)];

    return {
      at: 0,
      x: position.x,
      y: position.y,
      size: size * (0.88 + Math.random() * 0.28),
      color: color[0],
      accent: color[1]
    };
  }

  function renderFrame(timestamp) {
    frameId = 0;
    if (!activeShow || document.hidden) return;

    if (lastRenderTime && timestamp - lastRenderTime < FRAME_INTERVAL) {
      frameId = window.requestAnimationFrame(renderFrame);
      return;
    }

    const elapsedDelta = lastFrameTime ? Math.min((timestamp - lastFrameTime) / 1000, 0.1) : 0;
    const delta = Math.min(elapsedDelta, 0.05);
    lastFrameTime = timestamp;
    lastRenderTime = timestamp;
    activeShow.elapsed += elapsedDelta * 1000;

    context.globalCompositeOperation = 'lighter';
    context.globalAlpha = 1;
    context.clearRect(0, 0, width, height);

    if (
      activeShow.nextEvent < activeShow.events.length &&
      activeShow.elapsed >= activeShow.events[activeShow.nextEvent].at
    ) {
      launchRocket(activeShow.events[activeShow.nextEvent]);
      activeShow.nextEvent += 1;
    }

    if (activeShow.continuous && activeShow.nextEvent >= activeShow.events.length) {
      if (activeShow.boostKind && activeShow.elapsed >= activeShow.boostUntil) {
        if (activeShow.button) {
          activeShow.button.setAttribute('aria-busy', 'false');
          activeShow.button.classList.remove('is-celebrating');
          if (statusMessage) statusMessage.textContent = 'The celebration fireworks continue softly.';
        }
        activeShow.boostKind = null;
        activeShow.button = null;
      }

      if (activeShow.elapsed >= activeShow.nextContinuousEvent) {
        const isButtonShow = activeShow.boostKind === 'button';
        const isSectionShow = activeShow.boostKind === 'section';
        launchRocket(makeContinuousEvent(isSectionShow ? 0.58 : isButtonShow ? 1.12 : 0.92));
        activeShow.nextContinuousEvent += isButtonShow
          ? 520
          : isSectionShow
            ? 1000
            : 750 + Math.random() * 150;
        if (activeShow.nextContinuousEvent <= activeShow.elapsed) {
          activeShow.nextContinuousEvent = activeShow.elapsed + 750;
        }
      }

      if (activeShow.elapsed >= activeShow.nextCornerEvent) {
        const isButtonShow = activeShow.boostKind === 'button';
        const isSectionShow = activeShow.boostKind === 'section';
        launchRocket(makeContinuousEvent(isSectionShow ? 0.68 : isButtonShow ? 0.98 : 0.88, activeShow.cornerIndex));
        activeShow.cornerIndex = (activeShow.cornerIndex + 1) % 4;
        activeShow.nextCornerEvent = activeShow.elapsed + (isButtonShow ? 700 : 1100);
      }
    }

    let rocketIndex = 0;
    for (let index = 0; index < rockets.length; index += 1) {
      if (drawRocket(rockets[index], elapsedDelta)) {
        rockets[rocketIndex] = rockets[index];
        rocketIndex += 1;
      }
    }
    rockets.length = rocketIndex;

    updateParticles(delta, elapsedDelta);
    context.globalAlpha = 1;
    context.globalCompositeOperation = 'source-over';

    const allEventsLaunched = !activeShow.continuous && activeShow.nextEvent >= activeShow.events.length;
    if (allEventsLaunched && rockets.length === 0 && particles.length === 0) {
      completeShow();
      return;
    }

    frameId = window.requestAnimationFrame(renderFrame);
  }

  function startShow(name, button) {
    if (activeShow) return false;

    const target = name === 'welcome' ? document.querySelector('.hero') : celebrationSection;

    if (reducedMotionQuery.matches) {
      showStaticCelebration(target, button);
      return false;
    }

    if (!ensureCanvas()) {
      showStaticCelebration(target, button);
      return false;
    }

    activeShow = {
      events: SHOWS[name],
      elapsed: 0,
      nextEvent: 0,
      continuous: name === 'welcome',
      nextContinuousEvent: name === 'welcome' ? 900 : 0,
      nextCornerEvent: name === 'welcome' ? 650 : 0,
      cornerIndex: 0,
      button: button || null
    };
    if (button) {
      button.setAttribute('aria-busy', 'true');
      button.classList.add('is-celebrating');
      if (statusMessage) statusMessage.textContent = 'Celebration fireworks are underway.';
    }
    canvas.classList.add('fireworks-canvas--active');
    lastFrameTime = 0;
    lastRenderTime = 0;

    if (!document.hidden) frameId = window.requestAnimationFrame(renderFrame);
    return true;
  }

  function showStaticCelebration(target, button) {
    if (target) target.classList.add('fireworks-static-glow');
    if (button) {
      button.setAttribute('aria-busy', 'false');
      button.classList.remove('is-celebrating');
      button.classList.add('is-static-glow');
    }
    if (statusMessage) statusMessage.textContent = 'A warm golden glow celebrates Rahul and Priyanka.';
  }

  function onVisibilityChange() {
    if (!activeShow) return;

    if (document.hidden) {
      if (frameId) window.cancelAnimationFrame(frameId);
      frameId = 0;
      lastFrameTime = 0;
      lastRenderTime = 0;
      return;
    }

    if (!frameId) {
      lastFrameTime = 0;
      lastRenderTime = 0;
      frameId = window.requestAnimationFrame(renderFrame);
    }
  }

  function onMotionPreferenceChange(event) {
    if (!event.matches || !activeShow) return;
    const target = activeShow.button ? celebrationSection : document.querySelector('.hero');
    const button = activeShow.button;
    pendingSectionShow = false;
    if (pendingCelebrationShow && celebrateButton) {
      pendingCelebrationShow = false;
      celebrateButton.setAttribute('aria-busy', 'false');
      celebrateButton.classList.remove('is-celebrating');
      showStaticCelebration(celebrationSection, celebrateButton);
    }
    completeShow();
    showStaticCelebration(target, button);
  }

  function onCelebrateClick() {
    if (activeShow && activeShow.continuous) {
      if (activeShow.boostKind === 'button') return;
      activeShow.boostKind = 'button';
      activeShow.boostUntil = activeShow.elapsed + 7000;
      activeShow.nextContinuousEvent = activeShow.elapsed + 520;
      activeShow.button = celebrateButton;
      celebrateButton.setAttribute('aria-busy', 'true');
      celebrateButton.classList.add('is-celebrating');
      if (statusMessage) statusMessage.textContent = 'A grand celebration finale is underway.';
      return;
    }

    if (!activeShow) {
      startShow('celebration', celebrateButton);
      return;
    }

    if (activeShow.button === celebrateButton || pendingCelebrationShow) return;

    pendingCelebrationShow = true;
    celebrateButton.setAttribute('aria-busy', 'true');
    celebrateButton.classList.add('is-celebrating');
    if (statusMessage) {
      statusMessage.textContent = 'The celebration show will begin after the current fireworks.';
    }
  }

  function sectionIsVisible() {
    if (!celebrationSection || sectionSeen || !document.body.classList.contains('entered')) return;
    const bounds = celebrationSection.getBoundingClientRect();
    if (bounds.top < window.innerHeight * 0.9 && bounds.bottom > 0) {
      sectionSeen = true;
      startSectionShow();
    }
  }

  function startSectionShow() {
    if (activeShow && activeShow.continuous) {
      activeShow.boostKind = 'section';
      activeShow.boostUntil = activeShow.elapsed + 2600;
      activeShow.nextContinuousEvent = activeShow.elapsed + 900;
      return;
    }

    if (activeShow && !reducedMotionQuery.matches) {
      pendingSectionShow = true;
      return;
    }
    startShow('intimate');
  }

  function observeCelebrationSection() {
    if (!celebrationSection || sectionSeen || sectionObserver) return;

    if ('IntersectionObserver' in window) {
      sectionObserver = new IntersectionObserver((entries, observer) => {
        if (entries.some(entry => entry.isIntersecting)) {
          sectionSeen = true;
          observer.disconnect();
          sectionObserver = null;
          startSectionShow();
        }
      }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
      sectionObserver.observe(celebrationSection);
      return;
    }

    const onScroll = () => {
      if (!sectionSeen) sectionIsVisible();
      if (sectionSeen) window.removeEventListener('scroll', onScroll);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    sectionIsVisible();
  }

  function init() {
    if (initialized) return;
    initialized = true;

    celebrateButton = document.getElementById('celebrate-couple');
    celebrationSection = document.getElementById('celebrations-section');
    statusMessage = document.getElementById('fireworks-status');

    if (celebrateButton) celebrateButton.addEventListener('click', onCelebrateClick);
    document.addEventListener('visibilitychange', onVisibilityChange);

    if (typeof reducedMotionQuery.addEventListener === 'function') {
      reducedMotionQuery.addEventListener('change', onMotionPreferenceChange);
    } else if (typeof reducedMotionQuery.addListener === 'function') {
      reducedMotionQuery.addListener(onMotionPreferenceChange);
    }
  }

  return {
    init,
    playWelcomeShow: () => startShow('welcome'),
    observeCelebrationSection
  };
})();
