import Tag from './Tag';

class Object extends Tag {
	constructor(tag) {
		super(tag);
		this.ax = 0;
		this.ay = 0;
		this.velocity_x = 1;
		this.velocity_x_jump = 1.2;
		this.velocity_y = 22;
		this.friction = 0.8;
		// halved from 10 - per-tick cap, tied to Game.fps (now 60, see Game.js)
		this.speed_limit_y = 5;

		this._speedX = 0;
		this._speedY = 0;
	}

	static setupWebComponent(tagName, descriptor) {
		const { render, ...defaults } = descriptor;

		class Element extends HTMLElement {
			connectedCallback() {
				if (this.__rendered) return;
				this.__rendered = true;

				for (const key in defaults) {
					if (this[key] !== undefined) continue;
					const value = defaults[key];
					const attr = this.getAttribute(key);
					if (attr === null) this[key] = value;
					else if (typeof value === 'number') this[key] = Number(attr);
					else if (typeof value === 'boolean') this[key] = attr !== 'false';
					else this[key] = attr;
				}

				this.innerHTML = render(this);
			}
		}

		if (!customElements.get(tagName)) customElements.define(tagName, Element);
	}

	static html(strings, ...values) {
		return strings.reduce((out, part, i) => {
			let value = i > 0 ? values[i - 1] : '';
			if (Array.isArray(value)) value = value.join('');
			else if (value === false || value === undefined || value === null) value = '';
			else value = String(value);
			return out + value + part;
		}, '');
	}

	animation = (classe) => {
		this.tag.classList = 'Puppet ' + classe;
	};

	get speedX() {
		return this._speedX;
	}
	set speedX(speedx) {
		this._speedX = parseFloat(speedx.toFixed(1));
	}

	get speedY() {
		return this._speedY;
	}
	set speedY(speedy) {
		this._speedY = parseFloat(speedy.toFixed(1));
	}
}

export { Object as default };
