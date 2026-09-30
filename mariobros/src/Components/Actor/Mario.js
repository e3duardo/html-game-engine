import Object from '~/engine/src/Object';
import Assets from '../Assets';

class Mario extends Object {
	constructor() {
		super();
	}

	static setupWebComponent() {
		const tagName = 'player-mario';

		Object.setupWebComponent(tagName, {
			x: 0,
			y: 4,
			render: (tag) => {
				tag.style.position = 'absolute';
				tag.style.width = '16px';
				tag.style.height = '16px';
				tag.style.left = tag.x * 16 + 'px';
				tag.style.top = tag.y * 16 + 'px';
				// one above every scenery/item/enemy tag's shared z-index of
				// 2 (they all tie at that value, so which one wins is
				// whatever order they happen to sit in in index.html) -
				// mario should always draw in front of them, same as the
				// real game's sprite priority. Concretely: the flagpole
				// (item-pole) and its flag (item-flag) come later in the
				// markup than <player-mario>, so at a tied z-index they'd
				// paint over him while he slides down/stands at its base.
				tag.style.zIndex = 3;
				// purely visual smoothing between game ticks (the loop runs on
				// setInterval, which isn't synced to the browser's repaint, so
				// a slow/dropped tick would otherwise show as a visible hop) -
				// safe now that Puppet's x/y getters read back an internal
				// field instead of offsetLeft/offsetTop, so this no longer
				// corrupts the physics readback like it used to.
				tag.style.transition = 'left .0167s linear, top .0167s linear';

				return Object.html`
			  		<style>
						/* the sheet packs frames with uneven gaps (not a clean 16px
						   grid) - a full 16px window always shows a sliver of the
						   sheet's own grid border line next to mario, so .m is only
						   as wide as a frame actually is (11px small / 14-16px big) */
						player-mario .m{
							background-image: url('${Assets.mario}');
							background-position: -83px -34px;
							background-repeat: no-repeat;
							position: absolute;
							width: 11px;
							height: 16px;
							top: 0;
							left: 0;
						}

						player-mario.right .m,
						player-mario.lookup-right .m,
						player-mario.lower-right .m{ background-position: -83px -34px; }

						player-mario.walk-right-0 .m{ background-position: -99px -34px; }
						player-mario.walk-right-1 .m{ background-position: -134px -34px; }

						player-mario.jumping-right .m,
						player-mario.falling-right .m{ background-position: -169px -34px; }

						player-mario.skid-right .m,
						player-mario.skid-left .m{ background-position: -183px -34px; width: 14px; }

						player-mario.left .m,
						player-mario.lookup-left .m,
						player-mario.lower-left .m{ background-position: -83px -34px; transform: scaleX(-1); }

						player-mario.walk-left-0 .m{ background-position: -99px -34px; transform: scaleX(-1); }
						player-mario.walk-left-1 .m{ background-position: -134px -34px; transform: scaleX(-1); }

						player-mario.jumping-left .m,
						player-mario.falling-left .m{ background-position: -169px -34px; transform: scaleX(-1); }

						/* death reuses the jump frame rotated 180deg (like the original
						   NES animation) instead of a dedicated art frame - same look
						   regardless of which way mario was facing */
						player-mario.dying-right .m,
						player-mario.dying-left .m{ background-position: -169px -34px; transform: rotate(180deg); }

						/* big mario - real Super Mario frames, same sheet, one row up
						   (y=1, 32px tall) and a bit wider per frame than small mario */
						player-mario.big-right .m,
						player-mario.big-lookup-right .m{ background-position: -80px -1px; width: 16px; height: 32px; }
						player-mario.big-lower-right .m{ background-position: -182px -1px; width: 16px; height: 32px; }

						player-mario.big-walk-right-0 .m{ background-position: -97px -1px; width: 16px; height: 32px; }
						player-mario.big-walk-right-1 .m{ background-position: -115px -1px; width: 14px; height: 32px; }

						player-mario.big-jumping-right .m,
						player-mario.big-falling-right .m{ background-position: -165px -1px; width: 16px; height: 32px; }

						player-mario.big-skid-right .m,
						player-mario.big-skid-left .m{ background-position: -218px -1px; width: 14px; height: 32px; }

						player-mario.big-left .m,
						player-mario.big-lookup-left .m{ background-position: -80px -1px; width: 16px; height: 32px; transform: scaleX(-1); }
						player-mario.big-lower-left .m{ background-position: -182px -1px; width: 16px; height: 32px; transform: scaleX(-1); }

						player-mario.big-walk-left-0 .m{ background-position: -97px -1px; width: 16px; height: 32px; transform: scaleX(-1); }
						player-mario.big-walk-left-1 .m{ background-position: -115px -1px; width: 14px; height: 32px; transform: scaleX(-1); }

						player-mario.big-jumping-left .m,
						player-mario.big-falling-left .m{ background-position: -165px -1px; width: 16px; height: 32px; transform: scaleX(-1); }

						player-mario.big-dying-right .m,
						player-mario.big-dying-left .m{ background-position: -165px -1px; width: 16px; height: 32px; transform: rotate(180deg); }

						/* fire mario - same frame layout as big mario, one full
						   sheet section down (128px), just recolored (white
						   overalls/red top instead of green/red) */
						player-mario.fire-right .m,
						player-mario.fire-lookup-right .m{ background-position: -80px -129px; width: 16px; height: 32px; }
						player-mario.fire-lower-right .m{ background-position: -182px -129px; width: 16px; height: 32px; }

						player-mario.fire-walk-right-0 .m{ background-position: -97px -129px; width: 16px; height: 32px; }
						player-mario.fire-walk-right-1 .m{ background-position: -115px -129px; width: 14px; height: 32px; }

						player-mario.fire-jumping-right .m,
						player-mario.fire-falling-right .m{ background-position: -165px -129px; width: 16px; height: 32px; }

						player-mario.fire-skid-right .m,
						player-mario.fire-skid-left .m{ background-position: -218px -129px; width: 14px; height: 32px; }

						player-mario.fire-left .m,
						player-mario.fire-lookup-left .m{ background-position: -80px -129px; width: 16px; height: 32px; transform: scaleX(-1); }
						player-mario.fire-lower-left .m{ background-position: -182px -129px; width: 16px; height: 32px; transform: scaleX(-1); }

						player-mario.fire-walk-left-0 .m{ background-position: -97px -129px; width: 16px; height: 32px; transform: scaleX(-1); }
						player-mario.fire-walk-left-1 .m{ background-position: -115px -129px; width: 14px; height: 32px; transform: scaleX(-1); }

						player-mario.fire-jumping-left .m,
						player-mario.fire-falling-left .m{ background-position: -165px -129px; width: 16px; height: 32px; transform: scaleX(-1); }

						player-mario.fire-dying-right .m,
						player-mario.fire-dying-left .m{ background-position: -165px -129px; width: 16px; height: 32px; transform: rotate(180deg); }

						/* star power-up (see Puppet.activateStarPower) - the real
						   game cycles mario's sprite through several palettes every
						   frame; a fast hue-rotate over the existing art gets the
						   same rapid rainbow-flicker look without new sprites */
						player-mario.star-power .m{
							animation: star-power-flicker .1s steps(1) infinite;
						}
						@keyframes star-power-flicker{
							0% { filter: hue-rotate(0deg) saturate(3); }
							25% { filter: hue-rotate(90deg) saturate(3); }
							50% { filter: hue-rotate(180deg) saturate(3); }
							75% { filter: hue-rotate(270deg) saturate(3); }
						}

						/* brief grace period after getting hit while big/fire and
						   shrinking back to small (see Puppet.shrink()) - the
						   original just skips drawing mario's sprite on every
						   other frame for the same window, which reads as a
						   semi-transparent flicker rather than a solid blink */
						player-mario.hurt-flicker .m{
							animation: hurt-flicker-blink .0333s steps(1) infinite;
						}
						@keyframes hurt-flicker-blink{
							50% { opacity: 0; }
						}
					</style>
					<div class="m"></div>
			  `;
			},
		});
	}
}

export default Mario;
