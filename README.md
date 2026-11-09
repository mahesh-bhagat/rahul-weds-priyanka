# Priyanka & Rahul — A Journey to Forever

A premium, bespoke Maharashtrian wedding website built with HTML5, CSS3, and Vanilla JavaScript.

---

## Local Development

No build step required. Serve from any static HTTP server.

### Python 3 (recommended)

```bash
cd wedding-forever
python3 -m http.server 8080
```

Then open **http://localhost:8080** in your browser.

> **Note:** Opening `index.html` directly as a `file://` URL may block GSAP loading from the CDN due to browser CORS restrictions. Always use a local server.

---

## GitHub Pages Deployment

The site can be published from the `main` branch. Its planned public address is:

```
https://mahesh-bhagat.github.io/priyanka-rahul/
```

In the repository's **Settings → Pages**, set the source to **Deploy from a
branch**, select **main** and **/ (root)**, then save.

### Notes

- `.nojekyll` is included to prevent Jekyll processing, which could strip `_` prefixed files or interfere with asset paths.
- All asset references use **relative paths** (`assets/photos/...`, `css/...`, `js/...`) — no absolute or localhost URLs.
- Background music starts when a visitor selects **Enter Our Story**. Browsers block sound autoplay before a user interaction; the sound control can pause or resume playback.
- No backend, database, API keys or server-side code.
- The site works fully after a hard refresh (`Ctrl+Shift+R` / `Cmd+Shift+R`).
- Google Fonts and GSAP load from CDN — a live internet connection is required for the first load.

---

## Personalising Content

All editable wedding data is centralised in one file:

```
js/content.js
```

Update:
- `bride` and `groom` names (currently Priyanka and Rahul)
- `initials` for the monogram
- `weddingDate` with the confirmed muhurt (ISO 8601, Asia/Kolkata: `+05:30`)
- `musicFile` path when an audio track is added
- `gallery.items` array to add or reorder photos
- `celebrations` array to add event dates, times, venues and directions links

---

## Adding Photos

1. Place new photos inside `assets/photos/`.
2. Add entries to `gallery.items` in `js/content.js`:

```js
{
  src: 'assets/photos/your-photo.jpg',
  alt: 'Descriptive alt text for accessibility',
  caption: 'Short caption shown in the gallery',
  span: 'normal'   // 'normal' | 'wide' | 'tall'
}
```

---

## Project Structure

```
wedding-forever/
├── index.html              — Main HTML document
├── .nojekyll               — Prevents Jekyll on GitHub Pages
├── assets/
│   ├── photos/             — Engagement photographs
│   │   └── incoming/       — Archive of uploaded photos (not yet featured)
│   ├── audio/              — Background music (add background.mp3 here)
│   └── video/              — Wedding video (future use)
├── css/
│   ├── tokens.css          — Design tokens: colours, fonts, spacing
│   ├── base.css            — Resets and global HTML defaults
│   ├── components.css      — Reusable UI components
│   ├── sections.css        — Section-specific layouts (all stages)
│   └── responsive.css      — Breakpoint overrides
└── js/
    ├── content.js          — ✦ ALL WEDDING DATA LIVES HERE
    ├── countdown.js        — Countdown timer logic
    ├── audio.js            — Background music controller
    ├── animations.js       — GSAP entrance and scroll animations
    ├── gallery.js          — Photo gallery and lightbox
    ├── celebrations.js     — Wedding celebrations card renderer
    └── app.js              — Main entry point; wires everything together
```
