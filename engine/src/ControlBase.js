import Inject from './Inject';
import { KeyEvent } from './GameEvents';

class ControlBase {
	// `keyMap`: physical keyboard key -> semantic button name (e.g.
	// `{ ArrowRight: 'right', f: 'a' }`). A directional pad (4 keys) plus
	// one action button is the genuinely universal minimum any game built
	// on this engine needs - even an Atari joystick has that much - so this
	// base derives everything (the `keys` state bag, one getter per button,
	// keyboard translation) straight from whatever map a game passes in,
	// instead of every game hand-writing its own `get up()`/`get a()`/...
	// pile. NES vs SNES (or any other console) mapping different physical
	// keys to the same buttons, or a game adding its own extra buttons
	// beyond that minimum (run, start, ...), is normal and expected - it's
	// just a bigger or differently-shaped map, not a reason to duplicate
	// this class. A subclass that needs input this map-based scheme can't
	// express can still override translateKeyboard() itself, same as
	// before.
	constructor(keyMap = {}) {
		this.keys = {};
		this._keyMap = keyMap;

		new Set(Object.values(keyMap)).forEach((name) => {
			this.keys[name] = false;
			Object.defineProperty(this, name, {
				get: () => this.keys[name],
				configurable: true,
			});
		});

		document.addEventListener('keydown', (e) => {
			if (!e.repeat) {
				const key = this.translateKeyboard(e.key);
				if (key) {
					this.keys[key] = true;
					Inject.events.emit(new KeyEvent(key, true));
				}
			}
		});
		document.addEventListener('keyup', (e) => {
			if (!e.repeat) {
				const key = this.translateKeyboard(e.key);
				if (key) {
					this.keys[key] = false;
					Inject.events.emit(new KeyEvent(key, false));
				}
			}
		});

		// losing focus (alt-tab, switching browser tabs, a devtools popup
		// stealing it, etc.) while a movement key is held never fires its
		// keyup - the key stays "pressed" in `this.keys` forever, and the
		// player keeps walking with nothing actually held down. Release everything
		// as soon as focus/visibility is lost so no key can get stuck.
		const releaseAll = () => {
			Object.keys(this.keys).forEach((key) => {
				this.keys[key] = false;
			});
		};
		window.addEventListener('blur', releaseAll);
		document.addEventListener('visibilitychange', () => {
			if (document.hidden) releaseAll();
		});
	}

	translateKeyboard = (key) => {
		return this._keyMap[key] || '';
	};

	// simulates pressing/releasing a named button without a real keyboard
	// event - e.g. an enemy that needs to fake a jump input programmatically
	press = (name) => {
		this.keys[name] = true;
	};
	release = (name) => {
		this.keys[name] = false;
	};
}

export default ControlBase;
