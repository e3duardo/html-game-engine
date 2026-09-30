import HudBase from '~/engine/src/HudBase';
import Inject from '~/engine/src/Inject';

import beepSound from '../sounds/beep.wav';
import oneUpSound from '../sounds/1up.wav';

class Hud extends HudBase {
	constructor() {
		super();
		// score/coin/time are kept as plain fields, not read back from the
		// DOM (that anti-pattern is what corrupted mario's own position
		// physics earlier this session, see Puppet.js) - here it would just
		// mean re-parsing formatted/padded text every read, so track the
		// real numbers ourselves and only use the DOM as the display.
		this._score = 0;
		this._coin = 0;
		this._time = 0;
		this.introShowing = false;
	}

	// the "WORLD 1-1" title card - shown once entering the stage and again
	// after every death (see SuperMarioBros.play()), sitting on top of a
	// black screen until it's dismissed. `introShowing` is checked elsewhere
	// (the time countdown) so the clock doesn't run while it's up.
	showIntro = (lives) => {
		this.introShowing = true;
		document.querySelector('.WorldIntro-stage').innerHTML =
			document.querySelector('.hud-stage').innerHTML;
		document.querySelector('.WorldIntro-lives-count').innerHTML = lives;
		document.querySelector('.WorldIntro').style.display = 'flex';
	};

	hideIntro = () => {
		this.introShowing = false;
		document.querySelector('.WorldIntro').style.display = 'none';
	};

	// showLevelClear() below never dismisses itself - undoing it is only
	// ever needed once a next scene actually exists to show instead (see
	// SuperMarioBros._bootScene, called right as a Router-driven level
	// transition starts)
	hideLevelClear = () => {
		document.querySelector('.LevelClear').style.display = 'none';
	};

	// the floating "100"/"200" text that pops up and fades wherever a score
	// gain happened (an enemy stomp, a coin) - purely visual, doesn't touch
	// the actual score (see addScore/addCoin above, both already called by
	// the time this runs). `tag` is the DOM element to pop up from - its
	// offsetLeft/offsetTop are already in the same .Scene-local coordinate
	// space every Collidable renders into, so no unit conversion is needed.
	showScorePopup = (tag, text) => {
		const popup = document.createElement('div');
		popup.className = 'ScorePopup';
		popup.textContent = text;
		popup.style.left = tag.offsetLeft + 'px';
		popup.style.top = tag.offsetTop + 'px';
		Inject.scene.addTag(popup);
		setTimeout(() => popup.remove(), 700);
	};

	// the "COURSE CLEAR!" screen shown once Mario reaches the castle (see
	// Puppet.winLevel) - stays up (it's never dismissed here) until the next
	// scene actually boots and explicitly hides it, see hideLevelClear below
	showLevelClear = () => {
		document.querySelector('.LevelClear-score-value').innerHTML =
			document.querySelector('.hud-score').innerHTML;
		document.querySelector('.LevelClear').style.display = 'flex';
	};

	// the original converts whatever time is left into score right before
	// the level-clear screen, visibly counting the clock down to 0 (beeping
	// on every tick) rather than just silently adding a lump sum - 50 points
	// per unit of time. Called from Puppet.walkToCastle() once mario's walked in the door; `onComplete`
	// is showLevelClear() itself, so the screen only appears once the
	// countdown finishes, same as the original never showing it mid-count.
	playTimeBonus = (onComplete) => {
		const step = () => {
			if (this.time <= 0) {
				onComplete();
				return;
			}
			// 2 units/tick (not 1) so a nearly-full clock doesn't take
			// unreasonably long to count down - the real game also drains
			// several units per frame rather than one at a time
			const dec = Math.min(2, this.time);
			this.time -= dec;
			this.addScore(dec * 50);
			Inject.audio.play(beepSound);
			setTimeout(step, 20);
		};
		step();
	};

	set actor(v) {
		document.querySelector('.hud-actor').innerHTML = v;
	}

	get score() {
		return this._score;
	}
	set score(v) {
		this._score = v;
		const s = ('' + v).substring(0, 6);
		const pad = '000000';
		const string = pad.substring(0, pad.length - s.length) + s;

		document.querySelector('.hud-score').innerHTML = string;
	}
	// convenience used by whatever awards points (stomping an enemy,
	// collecting a coin, etc.) instead of every call site reading+writing
	// `score` itself
	addScore = (points) => {
		this.score = this.score + points;
	};

	get coin() {
		return this._coin;
	}
	set coin(v) {
		this._coin = v;
		const s = ('' + v).substring(0, 2);
		const pad = '00';
		const string = pad.substring(0, pad.length - s.length) + s;
		document.querySelector('.hud-coin').innerHTML = '.' + string;
	}
	// a coin is always worth the same 200 points in the original game, so
	// bundle that here rather than have every collector award both separately
	addCoin = () => {
		this.coin = this.coin + 1;
		this.addScore(200);
		// the original wraps the 2-digit coin counter back to 00 at 100 and
		// grants an extra life - reset happens in this same tick, before the
		// browser ever paints the intermediate `coin` setter's "10" (100
		// truncated to 2 digits), so the display never visibly glitches
		if (this.coin >= 100) {
			this.coin -= 100;
			Inject.puppet.addLife();
			Inject.audio.play(oneUpSound);
		}
	};

	get stage() {
		return this._stage;
	}
	set stage(v) {
		this._stage = v;
		const s = ('' + v).substring(0, 2);
		document.querySelector('.hud-stage').innerHTML = s[0] + '-' + s[1];
	}

	get time() {
		return this._time;
	}
	set time(v) {
		this._time = v;
		const s = ('' + v).substring(0, 3);
		const pad = '000';
		const string = pad.substring(0, pad.length - s.length) + s;
		document.querySelector('.hud-time').innerHTML = string;
	}
}

export { Hud as default };
