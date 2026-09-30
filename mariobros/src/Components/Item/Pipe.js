import Collidable from '~/engine/src/Collidable';
import Portal from '~/engine/src/Portal';
import Inject from '~/engine/src/Inject';
import Assets from '../Assets';
import pipeSound from '../../../sounds/pipepowerdown.wav';

// solid collision already worked before this class existed, via the
// engine's generic Collidable fallback (any element with kind="solid" gets
// treated as scenery) - extending Portal (not Collidable directly) is what
// gives this its warpId, same as a bare invisible warp-marker div gets (see
// Portal.js) - this class only adds on top of that: reading warp-to and,
// when present, teleporting mario into the matching destination. how he
// triggers that depends on which way the pipe actually opens (see
// collide() below) - a sideways pipe answers to walking into its mouth,
// not standing on top of it.
class Pipe extends Portal {
	constructor(tag) {
		super(tag);
		this.warpTo = tag.getAttribute('warp-to');
		this.orientation = tag.orientation;
	}

	collide = (from, collisions) => {
		super.collide(from, collisions);

		if (!this.warpTo || from.warpLocked) return;
		if (this.orientation === 'left') {
			// mouth opens toward -x (mario approaches walking right, stops
			// against its left face - see Collidable.collides()'s own
			// "approaching from the left" comment for why that's `right`
			// on the collision, not `left`) - walking further into a wall
			// that's already stopped him is the same gesture as entering a
			// real horizontal pipe, so this doesn't need a solid-vs-open
			// distinction the way standing-on-top does.
			if (collisions.right && Inject.control.right) {
				Inject.audio.play(pipeSound);
				Inject.scene.warp(this.warpTo, from);
			}
		} else if (collisions.bottom && Inject.control.down) {
			Inject.audio.play(pipeSound);
			Inject.scene.warp(this.warpTo, from);
		}
	};

	static setupWebComponent() {
		const tagName = 'item-pipe';
		// const bgx = 35;
		// const bgy = 2;
		const m11 = `background-position: ${-0 * 16}px ${-8 * 16}px`;
		const m12 = `background-position: ${-1 * 16}px ${-8 * 16}px`;
		const m21 = `background-position: ${-0 * 16}px ${-9 * 16}px`;
		const m22 = `background-position: ${-1 * 16}px ${-9 * 16}px`;
		// a genuinely separate horizontal-pipe mouth, not a rotation of the
		// vertical one - tileset.png rows 8/9: col2 is the plain repeating
		// body wall; the stepped/pixelated rounded-rim edge only actually
		// shows up once col4 sits right next to col3, so the rim is those
		// two tiles together, not col3 alone (checked directly against the
		// raw tileset.png pixels - col3 by itself has a perfectly straight
		// right edge).
		const h1 = `background-position: ${-2 * 16}px ${-8 * 16}px`; // body, top
		const h2 = `background-position: ${-3 * 16}px ${-8 * 16}px`; // rim left-half, top
		const h3 = `background-position: ${-4 * 16}px ${-8 * 16}px`; // rim right-half, top
		const h1b = `background-position: ${-2 * 16}px ${-9 * 16}px`; // body, bottom
		const h2b = `background-position: ${-3 * 16}px ${-9 * 16}px`; // rim left-half, bottom
		const h3b = `background-position: ${-4 * 16}px ${-9 * 16}px`; // rim right-half, bottom

		Collidable.setupWebComponent(tagName, {
			size: 2,
			x: 0,
			y: 2,
			// a pipe taller than mario's own max jump height (~5 tiles, see
			// Puppet.js) can't actually be entered - nothing can ever stand
			// on a top surface that high up. for a pipe that needs to look
			// taller than that (e.g. one drawn running off the top of the
			// screen), split it into two <item-pipe> tags stacked flush: a
			// short real one (enterable, y/size picked so its own top stays
			// in jump range) with cap="false" so it doesn't draw its own rim
			// mid-pipe, plus a decorative="true" one on top (not Collidable,
			// not solid, just the visual continuation, capped as normal) -
			// see the warp-zone screen in index.html.
			cap: true,
			decorative: false,
			// every real pipe in this game is 2 tiles wide (standard NES
			// SMB1 pipe art, m11/m12 + m21/m22 are a matched left/right
			// pair). width=1 is only for the warp-zone screen's thin
			// smokestack riser (see index.html) - a single column, so it
			// just reuses the left-tile half of the pair on its own.
			width: 2,
			// 'up' (default, mouth on top), 'down' (mouth on the bottom -
			// a pipe hanging from a ceiling, mario drops out of its opening)
			// or 'left' (mouth facing left - a pipe lying on its side, its
			// opening pointing the way mario approaches from). 'down' just
			// reorders the same m11/m12/m21/m22 cap+body tiles (cap row
			// last instead of first); 'left' uses the tileset's own
			// separate horizontal tiles (h1/h2/h1b/h2b above) since that
			// rim's edge is a genuinely different shape, not just the
			// vertical cap turned sideways.
			orientation: 'up',
			render: (tag) => {
				const horizontal = tag.orientation === 'left';
				const flipped = tag.orientation === 'down';
				if (!tag.decorative) {
					tag.classList += 'Collidable';
					tag.setAttribute('kind', 'solid');
				}
				tag.style.position = 'absolute';
				tag.style.left = tag.x * 16 + 'px';
				tag.style.bottom = tag.y * 16 + 'px';

				let body;
				if (horizontal) {
					// always 2 tiles thick (top+bottom row) - that's all the
					// tileset draws for this piece - tag.size is the total
					// length; the rounded rim (h2+h3) is 2 tiles wide on its
					// own and sits at the far/right end, tag.size-2 plain
					// body columns repeat to its left (minimum size is 2).
					const rimStart = Math.max(0, tag.size - 2);
					tag.style.width = 16 * tag.size + 'px';
					tag.style.height = 32 + 'px';
					body = Collidable.html`
						${Array.from(Array(rimStart)).map(
							(a, i) => Collidable.html`
							<div class="m" style="top: 0; left: ${i * 16}px; ${h1}"></div>
							<div class="m" style="top: 16px; left: ${i * 16}px; ${h1b}"></div>
						`
						)}
						<div class="m" style="top: 0; left: ${rimStart * 16}px; ${h2}"></div>
						<div class="m" style="top: 16px; left: ${rimStart * 16}px; ${h2b}"></div>
						<div class="m" style="top: 0; left: ${(rimStart + 1) * 16}px; ${h3}"></div>
						<div class="m" style="top: 16px; left: ${(rimStart + 1) * 16}px; ${h3b}"></div>
					`;
				} else {
					let width = 16 * tag.width;
					let height = 16 * tag.size;
					tag.style.width = width + 'px';
					tag.style.height = height + 'px';
					const capRow = flipped ? tag.size - 1 : 0;
					const capCols =
						tag.width === 1
							? Collidable.html`<div class="m" style="top: ${capRow * 16}px; left: 0; ${tag.cap ? m11 : m21}"></div>`
							: Collidable.html`
								<div class="m" style="top: ${capRow * 16}px; left: 0; ${tag.cap ? m11 : m21}"></div>
								<div class="m" style="top: ${capRow * 16}px; left: 16px; ${tag.cap ? m12 : m22}"></div>
							`;
					body = Collidable.html`
						${capCols}
						${Array.from(Array(tag.size - 1)).map((a, i) => {
							const row = flipped ? i : i + 1;
							return tag.width === 1
								? Collidable.html`<div class="m" style="top: ${row * 16}px; left: 0; ${m21}"></div>`
								: Collidable.html`
							<div class="m" style="top: ${row * 16}px; left: 0; ${m21}"></div>
							<div class="m" style="top: ${row * 16}px; left: 16px; ${m22}"></div>
						`;
						})}
					`;
				}

				return Collidable.html`
			  		<style>
						item-pipe .g{
							position: relative;
						}
						item-pipe .m{
							background-image: url('${Assets.tileset}');
							background-repeat: no-repeat;
							position: absolute;
							width: 16px;
							height: 16px;
						}
					</style>
					<div class="g">${body}</div>
			  `;
				},
		});
	}
}

export default Pipe;
