import HudBase from '~/engine/src/HudBase';

class Hud extends HudBase{
	constructor() {
		super();
	}

	set actor(v){
		document.querySelector('.hud-actor').innerHTML = v;
	}
	set score(v){
		const s = (""+v).substring(0, 6);
		const pad = "000000"
		const string = pad.substring(0, pad.length - s.length) + s;

		document.querySelector('.hud-score').innerHTML = string;
	}
	set coin(v){
		const s = (""+v).substring(0, 2);
		const pad = "00"
		const string = pad.substring(0, pad.length - s.length) + s;
		document.querySelector('.hud-coin').innerHTML = "."+string;
	}
	set stage(v){
		const s = (""+v).substring(0, 2);
		document.querySelector('.hud-stage').innerHTML = s[0]+'-'+s[1];
	}
	set time(v){
		const s = (""+v).substring(0, 3);
		const pad = "000"
		const string = pad.substring(0, pad.length - s.length) + s;
		document.querySelector('.hud-time').innerHTML = string;
	}
	get time(){
		return parseInt(document.querySelector('.hud-time').innerHTML);
	}

}

export {Hud as default};
