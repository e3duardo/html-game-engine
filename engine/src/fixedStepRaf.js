// a fixed-timestep requestAnimationFrame loop, shared by Game.js's main
// gameLoop and Puppet.js's own short scripted sequences (the death bounce)
// - anywhere that used to run on a plain setInterval(fn, 1000/fps). At
// 60fps each tick is only ~16.7ms, and setInterval has almost no slack
// before ordinary jitter (GC, layout, compositing) makes it fire late or
// in a catch-up burst - each burst call was forcing its own paint, which
// looked like the player randomly teleporting/freezing. This instead
// measures real elapsed time every animation frame
// and runs as many fixed-size ticks as needed to catch up (capped, to avoid
// a spiral of death), but the browser still only paints once per callback
// no matter how many ticks ran that frame.
//
// Returns a cancel function - call it to stop the loop (equivalent to
// clearInterval). Safe to call from inside `tick` itself: the cancel
// function is bound before the first tick can possibly run, since
// requestAnimationFrame always defers to the next frame.
// One switch for every loop built on this (the main game loop and each
// scripted sequence - a walk into a pipe, a flagpole slide, a power-up
// transformation): while set, none of them tick and none of them accumulate
// time to catch up on afterwards. A game's pause is just this.
let loopsPaused = false;
export function setLoopsPaused(paused) {
	loopsPaused = paused;
}

function fixedStepRaf(tick, tickInterval) {
	let rafId = null;
	let lastTime = null;
	let accumulator = 0;
	// tracks whether the cancel function has run - needed because `tick`
	// itself is allowed to cancel mid-loop (see the module comment above),
	// which happens *inside* the while loop below, before that loop would
	// otherwise go on running further catch-up ticks this same frame and
	// before the unconditional requestAnimationFrame(loop) at the end would
	// otherwise re-arm the next frame regardless. Without this flag, a
	// self-cancelling tick (e.g. a scripted sequence that cancels once it
	// reaches a target position) never actually stopped: cancelAnimationFrame
	// on the *current* rafId
	// is a no-op once we're already running inside that callback, so the
	// loop kept re-triggering the "reached the ground" branch every frame
	// forever (repeated score awards, runaway scripted-walk loops
	// stacking up).
	let cancelled = false;
	const maxTicksPerFrame = 5;

	const loop = (now) => {
		if (loopsPaused) {
			// stay alive, but keep the clock current so resuming doesn't
			// look like a long frame
			lastTime = now;
			rafId = requestAnimationFrame(loop);
			return;
		}
		if (lastTime === null) lastTime = now;
		let delta = now - lastTime;
		lastTime = now;
		// the tab was backgrounded, a debugger paused execution, etc. -
		// resync instead of running a huge burst of catch-up ticks
		if (delta > 250) delta = tickInterval;

		accumulator += delta;
		let ticksRun = 0;
		while (accumulator >= tickInterval && ticksRun < maxTicksPerFrame) {
			tick();
			if (cancelled) return;
			accumulator -= tickInterval;
			ticksRun++;
		}

		if (!cancelled) rafId = requestAnimationFrame(loop);
	};
	rafId = requestAnimationFrame(loop);

	return () => {
		cancelled = true;
		if (rafId !== null) cancelAnimationFrame(rafId);
	};
}

export default fixedStepRaf;
