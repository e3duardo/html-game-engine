// plain <audio>/<video> elements are what trigger the OS-level "now
// playing" media notification on mobile (lock-screen transport controls,
// title card) - Chrome offers that to any playing HTMLMediaElement,
// regardless of whether it's actually music. Routing everything through
// the Web Audio API instead avoids it entirely: an AudioContext's output
// isn't tracked as a "media element" the OS offers remote/lock-screen
// control over, so background music/SFX just play as ordinary tab audio.
class Audio {
	constructor() {
		this.mute = true;
		this._ctx = null;
		// decoded AudioBuffers, cached by src so repeated SFX (coin, jump,
		// stomp...) only fetch+decode once
		this._buffers = {};
		this._backgroundSrc = null;
		this._backgroundSource = null;

		// nothing before this tied playback to whether the tab was even
		// visible - a background/hidden tab (backgrounded on mobile, or a
		// leftover tab from a previous test run that looks "closed" but
		// wasn't) would just keep making sound forever, detached from
		// anything actually on screen. Suspending the whole context is
		// enough to silence everything at once (background music AND any
		// one-shot SFX/jingle mid-playback), no need to track/stop each
		// source individually - and resuming on return is free, since
		// _getContext() already does the same resume() on the next play()
		// call anyway.
		document.addEventListener('visibilitychange', () => {
			if (!this._ctx) return;
			if (document.hidden) this._ctx.suspend();
			else if (!this.mute) this._ctx.resume();
		});
		window.addEventListener('pagehide', () => {
			if (this._ctx) this._ctx.suspend();
		});
	}

	_getContext = () => {
		if (!this._ctx) {
			this._ctx = new (window.AudioContext || window.webkitAudioContext)();
		}
		// browsers start a fresh AudioContext 'suspended' until a user
		// gesture - by the time this is first called (a keypress already
		// started the game), that gesture already happened, so this
		// resolves immediately
		if (this._ctx.state === 'suspended') this._ctx.resume();
		return this._ctx;
	};

	_getBuffer = async (sound) => {
		if (this._buffers[sound]) return this._buffers[sound];
		const response = await fetch(sound);
		const arrayBuffer = await response.arrayBuffer();
		const buffer = await this._getContext().decodeAudioData(arrayBuffer);
		this._buffers[sound] = buffer;
		return buffer;
	};

	playBackground = (sound) => {
		if (this.mute) return;
		// already playing (or already decoding) this same track - e.g.
		// play() re-running on every respawn - leave it alone instead of
		// restarting it from the top each time
		if (this._backgroundSrc === sound) return;

		this.stopBackground();
		this._backgroundSrc = sound;

		this._getBuffer(sound).then((buffer) => {
			// stopBackground()/a newer playBackground() call may have run
			// while this was still decoding
			if (this.mute || this._backgroundSrc !== sound) return;
			const ctx = this._getContext();
			const source = ctx.createBufferSource();
			source.buffer = buffer;
			source.loop = true;
			source.connect(ctx.destination);
			source.start(0);
			this._backgroundSource = source;
		});
	};

	stopBackground = () => {
		this._backgroundSrc = null;
		if (this._backgroundSource) {
			this._backgroundSource.stop();
			this._backgroundSource = null;
		}
	};

	// returns a promise resolving to the clip's duration (seconds), so a
	// caller can chain something after it finishes (e.g. starting a
	// level-complete theme only once a jingle has actually played out) -
	// most callers just fire this and ignore the return value, which is
	// fine, they just don't await it
	play = (sound) => {
		if (this.mute) return;
		return this._getBuffer(sound).then((buffer) => {
			if (this.mute) return;
			const ctx = this._getContext();
			const source = ctx.createBufferSource();
			source.buffer = buffer;
			source.connect(ctx.destination);
			source.start(0);
			return buffer.duration;
		});
	};
}

export default Audio;
