# e2e (Playwright)

Ad-hoc scripts used to check behaviour in a real browser (`tNN.cjs` are
one-off investigations: physics traces, scene checks, screenshots; `rec*.cjs`
record video). They are not a test suite - they print numbers/take
screenshots for a human to read.

- Playwright is a devDependency (`npm install`; if the browser is missing,
  `npx playwright install chromium`).
- Serve the game first (`npm run build && npm run preview`, default port
  4174; `GAME_URL=... ` overrides it, see `lib.cjs`).
- Run: `node mariobros/e2e/t1.cjs [outDir]` (scripts that take screenshots
  write into `process.argv[2]`).
- `lib.cjs` opens the game with `?debug=1&automated=1`: `debug` exposes
  `window.__inject`, `automated` hides everything but the `.Stage`
  (debug bar, event panel, info box, touch controls).
- Screenshot `clip` coordinates in older scripts were measured with the
  debug bar visible; with `automated` the stage sits higher on the page.
