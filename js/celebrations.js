/**
 * WEDDING CELEBRATIONS SECTION
 * Renders celebration cards from WEDDING_DATA.celebrations in content.js.
 */
(function () {
  'use strict';

  const ICON_MAP = {
    haldi:    '🌼',
    mehendi:  '🌿',
    sangeet:  '🎶',
    wedding:  '✦'
  };

  function renderCelebrations() {
    const data = window.WEDDING_DATA && window.WEDDING_DATA.celebrations;
    if (!Array.isArray(data)) return;

    const grid = document.getElementById('celebrations-grid');
    if (!grid) return;

    data.forEach((event) => {
      if (!event.enabled) return;

      const hasDate    = event.date && event.date.trim();
      const hasTime    = event.time && event.time.trim();
      const hasVenue   = event.venue && event.venue.trim();
      const hasAddress = event.address && event.address.trim();
      const hasMap     = event.directionsUrl && event.directionsUrl.trim();
      const hasDress   = event.dressCode && event.dressCode.trim();

      const card = document.createElement('article');
      card.className = 'celebration-card';
      card.setAttribute('id', 'event-' + event.id);

      const icon = event.icon || ICON_MAP[event.id] || '✦';

      card.innerHTML = `
        <div class="celebration-card-header">
          <span class="celebration-icon" aria-hidden="true">${icon}</span>
          <div>
            <p class="celebration-eyebrow">${event.tagline || ''}</p>
            <h3 class="celebration-name">${event.name}</h3>
          </div>
        </div>

        <div class="celebration-divider" aria-hidden="true">
          <span></span><span class="motif">✦</span><span></span>
        </div>

        <p class="celebration-description">${event.description || ''}</p>

        <dl class="celebration-details">
          <div class="celebration-row">
            <dt>Date</dt>
            <dd>${hasDate ? event.date : '<em class="tba">To be announced</em>'}</dd>
          </div>
          <div class="celebration-row">
            <dt>Time</dt>
            <dd>${hasTime ? event.time : '<em class="tba">To be announced</em>'}</dd>
          </div>
          <div class="celebration-row">
            <dt>Venue</dt>
            <dd>
              ${hasVenue ? event.venue : '<em class="tba">To be announced</em>'}
              ${hasAddress ? '<span class="celebration-address">' + event.address + '</span>' : ''}
            </dd>
          </div>
          ${hasDress ? `<div class="celebration-row">
            <dt>Dress</dt>
            <dd>${event.dressCode}</dd>
          </div>` : ''}
        </dl>

        ${hasMap ? `<a href="${event.directionsUrl}" target="_blank" rel="noopener noreferrer" class="celebration-directions-link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            <circle cx="12" cy="9" r="2.5"/>
          </svg>
          Get Directions
        </a>` : ''}
      `;

      grid.appendChild(card);
    });
  }

  window.initCelebrations = function () {
    renderCelebrations();
  };

})();

