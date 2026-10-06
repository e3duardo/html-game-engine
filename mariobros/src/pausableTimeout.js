// setTimeout that stops counting while the game is paused (the original's
// timers are frame counters, so pausing freezes them) - a plain setTimeout
// keeps running and e.g. the star would wear off during the pause screen.
// SuperMarioBros.togglePause calls pauseTimeouts()/resumeTimeouts().
const timers = new Set();

export function pausableTimeout(fn, ms) {
	const timer = { fn, remaining: ms, startedAt: performance.now(), id: null, paused: false };
	timer.id = setTimeout(() => {
		timers.delete(timer);
		fn();
	}, ms);
	timers.add(timer);
	return timer;
}

export function clearPausableTimeout(timer) {
	if (!timer) return;
	clearTimeout(timer.id);
	timers.delete(timer);
}

export function pauseTimeouts() {
	const now = performance.now();
	for (const timer of timers) {
		clearTimeout(timer.id);
		timer.remaining -= now - timer.startedAt;
	}
}

export function resumeTimeouts() {
	const now = performance.now();
	for (const timer of timers) {
		timer.startedAt = now;
		timer.id = setTimeout(() => {
			timers.delete(timer);
			timer.fn();
		}, Math.max(0, timer.remaining));
	}
}
