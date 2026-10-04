import Collidable from '~/engine/src/Collidable';
import Inject from '~/engine/src/Inject';
import Assets from '../Assets';
import coinSound from '../../../sounds/coin.wav';
import itemSound from '../../../sounds/item.wav';

class Question extends Collidable {
	static tagName = 'item-question';

	static bgx = 24;
	static bgy = 0;

	constructor(tag) {
		super(tag);

		// `disabled` markup attribute (see setupWebComponent's defaults):
		// starts the block already spent - render() draws it as the plain
		// "used" block, and reset() puts it back to that, not to a live '?'
		const disabledAttr = tag.getAttribute('disabled');
		this.disabledDefault = disabledAttr !== null && disabledAttr !== 'false';
		this.disabled = this.disabledDefault;
		this.bumping = false;
		// only set on the specific block(s) authored with these attributes in
		// the level markup - most question blocks stay coins/empty.
		// `mushroom`: always gives a mushroom, regardless of mario's size.
		// `powerup`: the "growth" block - gives a mushroom if mario is still
		// small, or a fire flower if he's already big (matches the original
		// game: a block never re-gives a mushroom to a mario who no longer
		// needs it).
		// `life`: gives a 1-up (green) mushroom, an extra life.
		this.hasMushroom = tag.hasAttribute('mushroom');
		this.hasPowerUp = tag.hasAttribute('powerup');
		this.hasLife = tag.hasAttribute('life');
		// the has* fields above get flipped to false once spent (see collide()
		// below) - these keep the original markup value so reset() knows what
		// to give back
		this.hasMushroomDefault = this.hasMushroom;
		this.hasPowerUpDefault = this.hasPowerUp;
		this.hasLifeDefault = this.hasLife;
		this.border = {
			top: 'solid',
			bottom: 'solid',
			horizontal: 'solid',
		};
		// 'scenario' (not 'item') so Puppet's auto solid-stop physics treats
		// it as a real wall/floor - stays true whether disabled or not, only
		// the bump reaction itself is gated by `disabled` in collide()
		this.type = 'scenario';
	}

	// a purely cosmetic coin sprite that pops up out of the block and falls
	// back out of view - unrelated to the collectible item-coin dotted
	// around the level (see Coin.js), matches the original's block-bump coin
	popCoin = () => {
		const coin = document.createElement('div');
		coin.className = 'BlockCoinPop';
		coin.style.left = this.tag.offsetLeft + 'px';
		coin.style.top = this.tag.offsetTop + 'px';
		Inject.scene.addTag(coin);
		setTimeout(() => coin.remove(), 500);
	};

	disable = () => {
		this.disabled = true;
		const m = this.tag.querySelector('.m');
		if (m) {
			m.style.animation = 'none';
			// the tileset's 4th column (bgx+3) is the plain "used" block, not
			// another flicker frame - the animation itself only cycles bgx..bgx+2
			const { bgx, bgy } = Question;
			m.style.backgroundPosition = `-${(bgx + 3) * 16}px -${bgy * 16}px`;
		}
	};

	reset = () => {
		this.bumping = false;
		this.hasMushroom = this.hasMushroomDefault;
		this.hasPowerUp = this.hasPowerUpDefault;
		this.hasLife = this.hasLifeDefault;
		if (this.disabledDefault) {
			this.disable();
			return;
		}
		this.disabled = false;
		const m = this.tag.querySelector('.m');
		if (m) {
			// undo disable()'s inline overrides so the stylesheet's own
			// question-anim keyframes (still defined in this component's
			// <style>, see setupWebComponent) take back over
			m.style.animation = '';
			m.style.backgroundPosition = '';
		}
	};

	collide = (from, collisions) => {
		super.collide(from, collisions);

		if (!this.disabled && !this.bumping && collisions.top && this.border.bottom == 'solid') {
			this.bumping = true;
			const startY = this.y;
			let i = 0;
			let interval;
			interval = setInterval(() => {
				i++;
				// triangle wave: 10 steps up, 10 steps back down - always lands
				// back on startY exactly, instead of drifting from rounding
				this.y = i <= 10 ? startY - i : startY - (20 - i);
				if (i >= 20) {
					clearInterval(interval);
					this.y = startY;
					this.bumping = false;
					if (this.hasMushroom) {
						this.hasMushroom = false;
						Inject.audio.play(itemSound);
						Inject.scene.spawn('item-mushroom', { x: this.tag.x, y: this.tag.y + 1 });
					} else if (this.hasPowerUp) {
						this.hasPowerUp = false;
						Inject.audio.play(itemSound);
						if (from.big) {
							Inject.scene.spawn('item-flower', { x: this.tag.x, y: this.tag.y + 1 });
						} else {
							Inject.scene.spawn('item-mushroom', { x: this.tag.x, y: this.tag.y + 1 });
						}
					} else if (this.hasLife) {
						this.hasLife = false;
						Inject.audio.play(itemSound);
						Inject.scene.spawn('item-mushroom', { x: this.tag.x, y: this.tag.y + 1, life: true });
					} else {
						// every other '?' block just holds a coin - awarded
						// straight away, same as the original (no walk-into step)
						Inject.hud.addCoin();
						Inject.hud.showScorePopup(this.tag, '200');
						Inject.audio.play(coinSound);
						this.popCoin();
					}
					this.disable();
				}
			}, 5);
		}
	};

	static setupWebComponent() {
		const { tagName } = this;
		const { bgx, bgy } = Question;

		Collidable.setupWebComponent(tagName, {
			x: 0,
			y: 5,
			hide: false,
			disabled: false,
			render: (tag) => {
				tag.classList += 'Collidable';
				tag.setAttribute('kind', 'solid');
				tag.style.position = 'absolute';
				tag.style.width = '16px';
				tag.style.height = '16px';
				tag.style.left = tag.x * 16 + 'px';
				tag.style.bottom = tag.y * 16 + 'px';
				tag.style.zIndex = 2;
				if (tag.hide) {
					tag.style.opacity = '0.2';
				}
				return Collidable.html`
		  		<style>
					item-question .m{
						background-image: url('${Assets.tileset}');
						background-position: -${bgx * 16}px -${bgy * 16}px;
						background-repeat: no-repeat;
						position: absolute;
						width: 16px;
						height: 16px;
						top: 0;
						left: 0;
						animation-timing-function: steps(1);
						animation-name: question-anim;
						animation-duration: .40s;
						animation-iteration-count: infinite;
					}
					/* only the first 3 columns are "?" flicker frames - the 4th
					   (bgx+3) is the plain "used" block, set directly by disable() */
					@keyframes question-anim {
						0% { background-position: -${bgx * 16}px -${bgy * 16}px; }
						33% { background-position: -${(bgx + 1) * 16}px -${bgy * 16}px; }
						66% { background-position: -${(bgx + 2) * 16}px -${bgy * 16}px; }
						100% { background-position: -${bgx * 16}px -${bgy * 16}px; }
					}
				</style>
				<div class="m" style="${tag.disabled ? `animation: none; background-position: -${(bgx + 3) * 16}px -${bgy * 16}px;` : ''}"></div>
		  `;
			},
		});
	}
}

export default Question;
