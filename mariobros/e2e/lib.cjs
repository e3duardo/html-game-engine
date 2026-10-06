// Shared bits for the Playwright scripts in this folder.
//
// The game must be served already (`npm run preview`, after a build, or
// `npm start`); override the address with GAME_URL, e.g.
//   GAME_URL=http://localhost:5173/html-game-engine/mariobros/ node e2e/t1.cjs
const { chromium } = require('playwright');

const GAME_URL = process.env.GAME_URL || 'http://localhost:4174/html-game-engine/mariobros/';

// ?debug=1 exposes window.__inject (the scripts poke at it), ?automated=1
// hides everything but the .Stage (no buttons/panels in screenshots/videos)
function url(hash = '', extraQuery = '') {
	return `${GAME_URL}?debug=1&automated=1${extraQuery}${hash ? '#' + hash : ''}`;
}

module.exports = { chromium, url, GAME_URL };
