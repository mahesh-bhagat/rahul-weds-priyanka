/**
 * CENTRAL WEDDING CONTENT & CONFIGURATION
 * All editable wedding information lives here.
 * Extend gallery images and celebration events without touching other files.
 */
window.WEDDING_DATA = {

  /* ── COUPLE ────────────────────────────────────────────── */
  bride: 'Priyanka',
  groom: 'Rahul',
  initials: 'P & R',

  /* ── DATES ─────────────────────────────────────────────── */
  // Provisional noon; update with confirmed muhurt when available
  weddingDate: '2027-01-01T12:00:00+05:30',
  isTimeProvisional: true,
  ceremonyTimeNote: 'Auspicious ceremony muhurt to be announced',

  /* ── AUDIO ─────────────────────────────────────────────── */
  musicFile: 'assets/audio/background.mp3',

  /* ── IDENTITY ───────────────────────────────────────────── */
  culture: 'Maharashtrian',
  tagline: 'A Journey to Forever',

  /* ── ENGAGEMENT STORY ───────────────────────────────────── */
  story: {
    heading: 'A Promise Made',
    subtitle: 'Some moments are remembered. Others become the beginning of forever.'
  },

  /* ── GALLERY ────────────────────────────────────────────── */
  // Add or reorder items here; the gallery JS will render them automatically.
  // span: 'wide' | 'tall' | 'normal'  (controls editorial sizing on desktop)
  gallery: {
    heading: 'Moments to Remember',
    subtitle: 'A collection of little moments that became beautiful memories.',
    items: [
      {
        src: 'assets/photos/engagement-06.jpg',
        alt: 'The couple standing together outdoors in complementary attire',
        caption: 'Side by side',
        span: 'wide'
      },
      {
        src: 'assets/photos/engagement-09.jpg',
        alt: 'The couple walking through a lush garden pathway together',
        caption: 'A walk to remember',
        span: 'tall'
      },
      {
        src: 'assets/photos/engagement-04.jpg',
        alt: 'The couple in traditional Maharashtrian attire with flower garlands, smiling',
        caption: 'Adorned in heritage',
        span: 'normal'
      },
      {
        src: 'assets/photos/engagement-08.jpg',
        alt: 'The groom gently kissing the bride on the forehead in traditional attire',
        caption: 'A tender moment',
        span: 'normal'
      },
      {
        src: 'assets/photos/engagement-02.jpg',
        alt: 'The couple sharing an affectionate outdoor portrait moment',
        caption: 'Joy in togetherness',
        span: 'wide'
      },
      {
        src: 'assets/photos/engagement-03.jpg',
        alt: 'The couple holding hands while walking through a sunlit meadow',
        caption: 'Towards the horizon',
        span: 'normal'
      },
      {
        src: 'assets/photos/engagement-07.jpg',
        alt: "The groom kneeling on stage holding the bride's hands during the engagement",
        caption: 'The promise',
        span: 'tall'
      },
      {
        src: 'assets/photos/engagement-01.jpg',
        alt: "The groom kissing the bride's hand during the engagement ceremony",
        caption: 'A gesture of devotion',
        span: 'normal'
      },
      {
        src: 'assets/photos/engagement-05.jpg',
        alt: 'Intimate black and white close-up of the couple, foreheads together',
        caption: 'Eternal',
        span: 'wide'
      }
    ]
  },

  /* ── CELEBRATIONS ───────────────────────────────────────── */
  // Set `enabled: false` to hide a card entirely.
  // Leave date/time/venue as empty string '' to show "To be announced".
  // directionsUrl: set to a Google Maps URL when venue is confirmed.
  celebrations: [
    {
      id: 'haldi',
      enabled: true,
      name: 'Haldi',
      icon: '🌼',
      tagline: 'The golden beginning',
      description: 'Turmeric blessings mark the start of the auspicious journey.',
      date: '',
      time: '',
      venue: '',
      address: '',
      dressCode: 'Yellow & White — bright & joyful',
      directionsUrl: ''
    },
    {
      id: 'mehendi',
      enabled: true,
      name: 'Mehendi',
      icon: '🌿',
      tagline: 'Stories drawn in henna',
      description: 'An evening of music, laughter, and intricate designs that tell a love story.',
      date: '',
      time: '',
      venue: '',
      address: '',
      dressCode: 'Greens & Blues — earthy & vibrant',
      directionsUrl: ''
    },
    {
      id: 'sangeet',
      enabled: true,
      name: 'Sangeet',
      icon: '🎶',
      tagline: 'An evening of celebration',
      description: 'Music, dance, and the joyful coming together of two families.',
      date: '',
      time: '',
      venue: '',
      address: '',
      dressCode: 'Festive Indian wear',
      directionsUrl: ''
    },
    {
      id: 'wedding',
      enabled: true,
      name: 'Wedding Ceremony',
      icon: '✦',
      tagline: 'The sacred union',
      description: 'Two souls, one promise, witnessed by those they love most.',
      date: '01 January 2027',
      time: '',   // Muhurt to be announced
      venue: '',
      address: '',
      dressCode: 'Traditional Indian wear',
      directionsUrl: ''
    }
  ]
};
