import Collidable from '~/engine/src/Collidable';
import Inject from '~/engine/src/Inject';
import bumpEnemiesAbove from '../../bumpEnemiesAbove';
import Assets from '../Assets';
import brickSound from '../../../sounds/brick.wav';
import bumpSound from '../../../sounds/bump.wav';
import coinSound from '../../../sounds/coin.wav';
import itemSound from '../../../sounds/item.wav';

class Brick extends Collidable {
	static tagName = 'item-brick';

	constructor(tag) {
		super(tag);

		this.bumping = false;
		this.dead = false;
		// two disguised variants that look like a plain brick but never
		// break (big mario included - see collide()) and instead do
		// something once, from below: `coin` dispenses coins for a short
		// window (see bounce()/dispenseCoin(), matches the original's
		// BrickCoinTimer - "hit it until it's spent"), `star` spawns an
		// item-star once, matching the disguised star brick right after it
		// in the original World 1-1 layout
		this.isCoinBrick = tag.hasAttribute('coin');
		this.isStarBrick = tag.hasAttribute('star');
		this.spent = false;
		this._coinTimer = null;

		// a broken brick's tag goes away, but the object itself stays in the
		// scene's collision map until reset() - without this it kept acting
		// as an invisible solid (ceiling/wall) wherever it used to be
		// (Collidable.collides is an instance field, so wrap it rather than
		// calling super)
		const collides = this.collides;
		this.collides = (from) =>
			this.dead ? { top: false, bottom: false, left: false, right: false } : collides(from);
	}

	reset = () => {
		this.dead = false;
		this.bumping = false;
		this.spent = false;
		clearTimeout(this._coinTimer);
		this._coinTimer = null;
		this.tag.classList.remove('breaking', 'spent');
		this.originalParent.appendChild(this.tag);
	};

	// head hits from below bump it (the player's speed goes to 0, not 1 as against plain ground)
	get bumpable() {
		return true;
	}

	collide = (from, collisions) => {
		super.collide(from, collisions);

		if (this.dead) return;

		if (!this.bumping && collisions.top && this.border.bottom == 'solid') {
			if (this.isCoinBrick || this.isStarBrick) {
				if (this.spent) return;
				if (this.isCoinBrick) this.dispenseCoin();
				else this.spawnStar();
				this.bounce();
				return;
			}
			// big mario's 'super' power-up grants the ability to break
			// plain bricks outright instead of just bumping them
			if (from.big) {
				this.break();
				return;
			}
			// a plain brick small mario can't break just thuds - no coin,
			// no item, unlike the disguised variants above (which already
			// played their own coin/item SFX before reaching this branch)
			Inject.audio.play(bumpSound);
			this.bounce();
		}
	};

	// the bump-and-settle wiggle shared by every non-breaking hit (a plain
	// brick bumped by small mario, or either disguised variant above)
	bounce = () => {
		this.bumping = true;
		bumpEnemiesAbove(this);
		const startY = this.y;
		let i = 0;
		let interval;
		interval = setInterval(() => {
			i++;
			// triangle wave: 10 steps up, 10 steps back down - always lands
			// back on startY exactly, instead of drifting from rounding
			// visual only: the collision box stays put (a bumping block must not
				// shove a goomba walking next to it sideways - the bump
				// is a separate object that never touches the metatile)
				this.tag.style.transform = `translateY(${i <= 10 ? -i : -(20 - i)}px)`;
			if (i >= 20) {
				clearInterval(interval);
				this.tag.style.transform = '';
				this.bumping = false;
			}
		}, 5);
	};

	// matches the original: the first hit opens a window where every hit
	// gives another coin, then the brick goes flat for good - so hitting
	// it fast gets you several coins, hitting it slow only gets you one or
	// two. The window's timer is set to 11, but it's one of the game's
	// *interval* timers (only counting down once every 20 frames, not
	// every frame like most timers) - 11 * 20 = 220 frames, ~3.66s at
	// 60.0988fps, not the ~180ms a naive "11 frames" reading would give.
	dispenseCoin = () => {
		Inject.hud.addCoin();
		Inject.hud.showScorePopup(this.tag, '200');
		Inject.audio.play(coinSound);
		this.popCoin();
		// the window starts on the FIRST hit only and is never extended -
		// matches BrickCoinTimerFlag in the original, a hard cutoff rather
		// than "keep hitting to keep it alive forever"
		if (!this._coinTimer) {
			this._coinTimer = setTimeout(() => {
				this.spent = true;
				this.tag.classList.add('spent');
			}, 3661);
		}
	};

	// the coin that visually pops out and falls back out of view - same
	// .BlockCoinPop element Question.js's own popCoin() uses, purely
	// cosmetic (unrelated to the score/coin tally, already awarded above)
	popCoin = () => {
		const coin = document.createElement('div');
		coin.className = 'BlockCoinPop';
		coin.style.left = this.tag.offsetLeft + 'px';
		coin.style.top = this.tag.offsetTop + 'px';
		Inject.scene.addTag(coin);
		setTimeout(() => coin.remove(), 500);
	};

	spawnStar = () => {
		this.spent = true;
		this.tag.classList.add('spent');
		Inject.audio.play(itemSound);
		Inject.scene.spawn('item-star', { x: this.tag.x, y: this.tag.y + 1 }).startRise();
	};

	break = () => {
		this.dead = true;
		bumpEnemiesAbove(this);
		Inject.audio.play(brickSound);
		this.tag.classList.add('breaking');
		setTimeout(() => {
			this.tag.remove();
		}, 1100);
	};

	static setupWebComponent() {
		const { tagName } = this;
		const bgy = 0;

		Collidable.setupWebComponent(tagName, {
			x: 0,
			y: 5,
			// the tileset has two brick tiles side by side: column 1 with a
			// lighter mortar/cap line across its top edge (the default, used
			// everywhere on the main path), and column 13 which is the same
			// brick coursing without that line - that's the one the bonus
			// room/warp-zone screen use throughout (see index.html).
			line: true,
			render: (tag) => {
				const bgx = tag.line ? 1 : 13;
				tag.classList += 'Collidable';
				tag.setAttribute('kind', 'solid');
				tag.style.position = 'absolute';
				tag.style.width = '16px';
				tag.style.height = '16px';
				tag.style.left = tag.x * 16 + 'px';
				tag.style.bottom = tag.y * 16 + 'px';
				tag.style.zIndex = 2;
				return Collidable.html`
		  		<style>
					item-brick .m{
						background-image: url('${Assets.tileset}');
						background-position: -${bgx * 16}px -${bgy * 16}px;
						background-repeat: no-repeat;
						position: absolute;
						width: 16px;
						height: 16px;
						top: 0;
						left: 0;
					}
					item-brick.breaking .m{
						display: none;
					}
					/* the flat "used" look, shared with item-question's own
					   spent state (same tileset position) - shown once a
					   disguised coin/star brick has given up its content */
					item-brick.spent .m{
						background-position: -432px 0;
					}
					/* 4 quarter-tile shards (see break()) - hidden until '.breaking'
					   is set, then each pair (left/right) launches up-and-out and
					   arcs back down under the same keyframes, same shape as the
					   original NES brick-smash animation */
					item-brick .frag{
						display: none;
						position: absolute;
						width: 8px;
						height: 8px;
						background-image: url('${Assets.tileset}');
						background-repeat: no-repeat;
						image-rendering: pixelated;
						border-radius: 4px;
					}
					item-brick.breaking .frag{
						display: block;
					}
					item-brick .frag-tl{
						top: 0;
						left: 0;
						background-position: -${bgx * 16}px -${bgy * 16}px;
					}
					item-brick .frag-tr{
						top: 0;
						left: 8px;
						background-position: -${bgx * 16 + 8}px -${bgy * 16}px;
					}
					item-brick .frag-bl{
						top: 8px;
						left: 0;
						background-position: -${bgx * 16}px -${bgy * 16 + 8}px;
					}
					item-brick .frag-br{
						top: 8px;
						left: 8px;
						background-position: -${bgx * 16 + 8}px -${bgy * 16 + 8}px;
					}
					/* each of the 4 shards gets its own path (not a shared
					   left/right pair) so the top and bottom pieces on the same
					   side keep drifting apart from each other on the way up,
					   instead of staying locked at their original 8px gap */
					item-brick.breaking .frag-tl{
						animation: brick-frag-tl 1.1s ease-in forwards;
					}
					item-brick.breaking .frag-tr{
						animation: brick-frag-tr 1.1s ease-in forwards;
					}
					item-brick.breaking .frag-bl{
						animation: brick-frag-bl 1.1s ease-in forwards;
					}
					item-brick.breaking .frag-br{
						animation: brick-frag-br 1.1s ease-in forwards;
					}
					/* quick upward toss (peak at 15% = ~165ms), then a long
					   gravity-driven fall well past the bottom of the stage
					   (240px tall) so the shards actually leave the screen
					   instead of stopping mid-air */
					@keyframes brick-frag-tl{
						0% { transform: translate(0, 0) rotate(0deg); }
						15% { transform: translate(-22px, -40px) rotate(-160deg); }
						100% { transform: translate(-46px, 260px) rotate(-620deg); }
					}
					@keyframes brick-frag-tr{
						0% { transform: translate(0, 0) rotate(0deg); }
						15% { transform: translate(22px, -40px) rotate(160deg); }
						100% { transform: translate(46px, 260px) rotate(620deg); }
					}
					@keyframes brick-frag-bl{
						0% { transform: translate(0, 0) rotate(0deg); }
						15% { transform: translate(-10px, -12px) rotate(-90deg); }
						100% { transform: translate(-34px, 280px) rotate(-500deg); }
					}
					@keyframes brick-frag-br{
						0% { transform: translate(0, 0) rotate(0deg); }
						15% { transform: translate(10px, -12px) rotate(90deg); }
						100% { transform: translate(34px, 280px) rotate(500deg); }
					}
				</style>
				<div class="m"></div>
				<div class="frag frag-tl"></div>
				<div class="frag frag-tr"></div>
				<div class="frag frag-bl"></div>
				<div class="frag frag-br"></div>
		  `;
			},
		});
	}
}

export default Brick;
