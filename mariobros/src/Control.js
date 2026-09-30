import ControlBase from '~/engine/src/ControlBase';

// NES-style layout: 4 directions + jump ('f') + run ('d', double-duties as
// throw-fireball, see Puppet.js) + start ('Enter', the title screen) - only
// the directional+jump pair is the genuinely universal minimum (see
// ControlBase); run/start are this game's own extras. Which physical keys
// mean what is entirely this file's call - marioworld's own Control.js maps
// a different, SNES-style layout to the same semantic buttons, and that's
// expected, not duplication.
const KEY_MAP = {
	ArrowUp: 'up',
	ArrowRight: 'right',
	ArrowDown: 'down',
	ArrowLeft: 'left',
	f: 'a',
	F: 'a',
	d: 'shift',
	D: 'shift',
	Enter: 'start',
};

class Control extends ControlBase {
	constructor() {
		super(KEY_MAP);
	}
}

export default Control;
