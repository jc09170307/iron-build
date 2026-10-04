# Iron Build

Jon's 13-week lift / cardio / ballroom training log, as an installable PWA.
Start: Mon 05 Oct 2026. Finish: Sun 03 Jan 2027.

- Offline-first (service worker), data stays on your device (localStorage)
- Per-set logging, last-session lookup, rest timer, Sunday check-ins with body measurements
- Fuel tab: calorie/protein targets, daily weight + intake log with weekly trend, 17 meal ideas (omnivore), sample day
- Music page: paste a Spotify / YouTube / YouTube Music playlist link to play it in-app or open it in the app
- Backup/restore from Rules > Settings

Install: open the site on your phone, then Share / menu > Add to Home Screen.

## Changing the app icon
Replace these PNGs in `icons/` (same file names, square, subject centered):
- `icon-192.png` (192x192), `icon-512.png` (512x512)
- `maskable-512.png` (512x512, keep the subject inside the middle 60% so phone icon shapes don't crop it)
- `apple-touch-icon.png` (180x180, for iPhone)

Then bump `CACHE` in `sw.js` (e.g. `iron-build-v3`). To see the new icon, delete the app from your home screen and add it again.
