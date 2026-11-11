# Ocha Party — A Morning of Tea & Togetherness

A small, static, mobile-first website for guests who scan the QR code on the printed invitation.

**Flow:** landing (tea room) → *See the itinerary* (shoji doors slide closed and open) → itinerary → Find the Sakura → doodle corner → event details (with a little rabbit hiding at the very bottom).

## What's inside

```
ocha-party/
├── index.html      all page content and the inline illustrations
├── style.css       styles, palette, animations, reduced-motion rules
├── script.js       accordion, transition, games, ambient music
├── assets/
│   ├── images/favicon.svg
│   └── illustrations/petal.svg
└── README.md
```

- Plain HTML, CSS and vanilla JavaScript. No frameworks, no backend, no build step.
- No data is collected. Doodles live only in the visitor's browser tab and vanish on reload.
- Fonts come from Google Fonts (Shippori Mincho B1, Cormorant Garamond). If they fail to load, the page falls back to system serif fonts and still works.
- Music: there is no audio file. The ambience (a soft drone with koto-like plucks in the Japanese *in* scale) is generated live in the browser with the Web Audio API, so it is original and needs no licence. It only starts when a guest taps the ♪ button (bottom-left, appears after entering). On iPhone, the ringer/silent switch must be off to hear it.
- Respects "Reduce motion": the door transition, falling petals and steam are switched off.

## Deploy on Netlify Drop (about one minute)

1. Unzip `ocha-party.zip`. You should get a folder named `ocha-party` with `index.html` directly inside it.
2. Go to https://app.netlify.com/drop and sign in (a free account is fine).
3. Drag the **`ocha-party` folder** (not the zip, and not a parent folder) onto the page.
4. Netlify gives you a URL like `https://random-name-123.netlify.app`. Open it on your phone and check it.
5. Optional: in **Site configuration → Change site name**, rename it (e.g. `ocha-party-njcsb`) so the URL is nicer.

**Important for the QR code:** generate the QR code only *after* you have the final URL (and after renaming the site, since renaming changes the URL). To update the site later without changing the URL, open the site in Netlify → **Deploys** → drag the updated folder onto the deploy area. Don't create a new site, or the printed QR code will point to the old one.

## Testing checklist

- Open the URL on an Android phone and an iPhone, in normal and private mode.
- Tap *See the itinerary*, open and close each activity.
- Find all five sakura (or use *Show me a hint*).
- Draw, undo, clear.
- Scroll to the very bottom and tap the rabbit's ears.
- Tap ♪ to play and pause the music.

## Editing

- Activity text: `index.html`, inside each `.stop-panel`.
- Event details: `index.html`, the `<footer class="details">` block.
- Colours: the variables at the top of `style.css`.
