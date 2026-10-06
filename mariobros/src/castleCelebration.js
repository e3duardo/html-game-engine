import Inject from '~/engine/src/Inject';
import fireworkSound from '../sounds/billfirework.wav';
import Assets from './Components/Assets';

// SMBDIS (GameTimerFireworks / RaiseFlagSetoffFWorks / InitFireworks): once
// mario's inside, the castle raises its flag, and if the clock's last digit
// was 1, 3 or 6 that many fireworks go off, one every 32 frames, worth 500
// points each. Their spots are FireworksXPosData/FireworksYPosData relative
// to the flag (X: 48px left of it; Y: screen coordinates), read in the order
// the counter walks them.
const FIREWORKS_BY_DIGIT = { 1: 1, 3: 3, 6: 6 };
const STATE_BY_DIGIT = { 1: 5, 3: 3, 6: 0 };
const X_DATA = [0x00, 0x30, 0x60, 0x60, 0x00, 0x20];
const Y_DATA = [0x60, 0x40, 0x70, 0x40, 0x60, 0x30];
const BETWEEN_TICKS = 0x20;
const SCORE = 500;
// RunFireworks: ExplosionTiles $68, $67, $66 (small -> big), 8 frames each.
// items.png cells (16px units, like every component): column BGX, one row
// per frame. Drawn 16x16 centred on the spot.
const BURST_FRAMES = 3;
const FRAME_TICKS = 8;
const FRAME_SIZE = 16;
const BGX = 7;
const BGY = [9, 10, 11];

// castle: the <building-castle> element mario just entered. digit: the
// clock's last digit when he got there. done: called once it's all over.
export default function castleCelebration(castle, digit, done) {
	const flag = castle && castle.querySelector('.star-flag');
	if (flag) flag.classList.add('raised');

	const count = FIREWORKS_BY_DIGIT[digit] || 0;
	const state = STATE_BY_DIGIT[digit] || 0;
	const flagX = castle ? castle.offsetLeft + 32 : 0;

	let remaining = count;
	const next = () => {
		if (remaining <= 0) {
			// DelayToAreaEnd: a beat for the flag/last burst before moving on
			setTimeout(done, 1000);
			return;
		}
		remaining--;
		const index = remaining + state;
		burst(flagX - 48 + X_DATA[index], Y_DATA[index]);
		setTimeout(next, (BETWEEN_TICKS * Inject.game.tickInterval));
	};
	// the flag has to be all the way up first (30 frames, 1px each)
	setTimeout(next, 520);
}

function burst(x, y) {
	Inject.hud.addScore(SCORE);
	Inject.audio.play(fireworkSound);
	const burstMs = BURST_FRAMES * FRAME_TICKS * Inject.game.tickInterval;
	const el = document.createElement('div');
	el.className = 'Fireworks';
	el.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:${FRAME_SIZE}px;height:${FRAME_SIZE}px;margin:-${FRAME_SIZE / 2}px 0 0 -${FRAME_SIZE / 2}px;z-index:5;pointer-events:none;background:url('${Assets.items}') no-repeat;background-position:-${BGX * 16}px -${BGY[0] * 16}px;animation:fireworks-burst ${burstMs}ms steps(1) forwards`;
	Inject.scene.addTag(el);
	setTimeout(() => el.remove(), burstMs);
}

// a global rule - the burst isn't a custom element with its own <style>
if (!document.getElementById('fireworks-style')) {
	const style = document.createElement('style');
	style.id = 'fireworks-style';
	const frames = BGY.map((by, i) => `${(i * 100) / BURST_FRAMES}%{background-position:-${BGX * 16}px -${by * 16}px}`).join('');
	style.textContent = `@keyframes fireworks-burst{${frames}}`;
	document.head.appendChild(style);
}
