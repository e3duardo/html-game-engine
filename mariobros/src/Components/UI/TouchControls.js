import Object from '~/engine/src/Object';

function sendKey(type, key) {
	document.dispatchEvent(new KeyboardEvent(type, { key: key, bubbles: true }));
}

// short tactile buzz on press, standing in for the click a real
// button gives - no-op (silently, no error) wherever
// navigator.vibrate doesn't exist, which is every iOS browser:
// Apple has never implemented the Vibration API, even for a
// PWA added to the home screen
function hapticTap() {
	if (navigator.vibrate) navigator.vibrate(15);
}

class TouchControls {
	static setupWebComponent() {
		Object.setupWebComponent('touch-controls', {
			render: (tag) => {
				// render() runs before its return value becomes this element's
				// innerHTML (see Object.setupWebComponent) - the buttons don't
				// exist yet to query/wire up until that assignment happens, so
				// defer to a microtask, same reasoning as DebugBar.js.
				queueMicrotask(() => TouchControls._wire(tag));

				return Object.html`
					<style>
						/* a custom element defaults to display:inline unless told
						   otherwise - the old .TouchControls was a plain <div>
						   (block by default), so this is needed to keep the same
						   layout now that the wrapper itself is the custom tag */
						touch-controls {
							display: block;
							margin-top: 16px;
							user-select: none;
						}
						touch-controls .TouchControls-face {
							display: flex;
							align-items: center;
							gap: 80px;
						}
						touch-controls .TouchControls-system {
							display: flex;
							gap: 10px;
						}
						touch-controls .TouchControls-dpad {
							display: grid;
							grid-template-columns: 48px 48px 48px;
							grid-template-rows: 48px 48px 48px;
							gap: 2px;
						}
						touch-controls .TouchControls-btn {
							touch-action: none;
							user-select: none;
							-webkit-user-select: none;
							border: 2px solid #333;
							background: #ddd;
							border-radius: 6px;
							font-size: 18px;
							line-height: 1;
							padding: 0;
						}
						touch-controls .TouchControls-btn:active {
							background: #aaa;
						}
						touch-controls .TouchControls-btn--up {
							grid-column: 2;
							grid-row: 1;
						}
						touch-controls .TouchControls-btn--left {
							grid-column: 1;
							grid-row: 2;
						}
						touch-controls .TouchControls-btn--right {
							grid-column: 3;
							grid-row: 2;
						}
						touch-controls .TouchControls-btn--down {
							grid-column: 2;
							grid-row: 3;
						}
						touch-controls .TouchControls-actions {
							display: flex;
							flex-direction: column;
							gap: 8px;
						}
						touch-controls .TouchControls-btn--action {
							width: 72px;
							height: 48px;
							font-size: 14px;
							font-weight: bold;
						}
						touch-controls .TouchControls-btn--system {
							width: 64px;
							height: 22px;
							font-size: 10px;
							font-weight: bold;
							letter-spacing: 0.5px;
							border-radius: 11px;
						}
						@media (max-width: 600px) {
							/* on mobile, pin the controls to the bottom of the screen.
							   No housing/faceplate box anymore (that "beige"/"grey" look
							   was extra real estate a phone screen doesn't have to
							   spare) - the buttons sit directly on the page's own black
							   background, which is also why they can be sized bigger
							   than before. Layout: dpad bottom-left, action buttons
							   bottom-right, START/RESET centered on their own row above
							   both (see .TouchControls-face's grid-template-areas) -
							   every size below is a clamp(min, vw, max) rather than a
							   fixed px value so the whole thing scales down on narrow
							   phones instead of overflowing and getting clipped off-screen. */
							touch-controls {
								--dpad-cell: clamp(42px, calc(12vw + 4px), 62px);
								--action-size: clamp(58px, 19vw, 80px);
								--sys-w: clamp(30px, 9vw, 42px);
								--sys-h: clamp(12px, 3.2vw, 16px);
								position: fixed;
								left: 0;
								right: 0;
								bottom: 0;
								margin: 0;
								padding: 6px 8px calc(6px + env(safe-area-inset-bottom, 0px));
								z-index: 1000;
							}
							touch-controls .TouchControls-face {
								display: grid;
								grid-template-columns: 1fr 1fr;
								grid-template-areas:
									'dpad actions'
									'system system';
								align-items: center;
								row-gap: 10px;
								/* the base (desktop) rule above sets a shorthand
								   \`gap: 80px\`, which also sets column-gap - left alone,
								   that 80px leaked into this 2-column mobile layout as
								   dead space between the dpad and action buttons,
								   forcing the actions column past the right edge of the
								   screen. row-gap alone doesn't reset it, so column-gap
								   needs its own explicit override here. */
								column-gap: 0;
							}
							touch-controls .TouchControls-btn {
								background: #1c1c1c;
								border-color: #000;
								color: #cfcfcf;
							}
							touch-controls .TouchControls-btn:active {
								background: #3a3a3a;
							}
							touch-controls .TouchControls-dpad {
								grid-area: dpad;
								justify-self: start;
								grid-template-columns: var(--dpad-cell) var(--dpad-cell) var(--dpad-cell);
								grid-template-rows: var(--dpad-cell) var(--dpad-cell) var(--dpad-cell);
							}
							touch-controls .TouchControls-system {
								grid-area: system;
								justify-self: center;
								gap: 10px;
								margin-top: 3.5vh;
								margin-bottom: 7vh;
							}
							touch-controls .TouchControls-btn--system {
								width: var(--sys-w);
								height: var(--sys-h);
								font-size: 8px;
								background: #141414;
								border-color: #000;
								color: #e2573a;
							}
							touch-controls .TouchControls-actions {
								grid-area: actions;
								justify-self: end;
								flex-direction: row;
								align-items: center;
								gap: 20px;
							}
							touch-controls .TouchControls-btn--action {
								width: var(--action-size);
								height: var(--action-size);
								border-radius: 50%;
								font-size: 11px;
								background: radial-gradient(circle at 35% 30%, #ff5b4d, #c21f14 70%);
								border-color: #7a0f0a;
								color: #2a0705;
								text-shadow: 0 1px 0 rgba(255, 255, 255, 0.25);
							}
							touch-controls .TouchControls-btn--action:active {
								background: radial-gradient(circle at 35% 30%, #c21f14, #7a0f0a 70%);
							}
						}
					</style>
					<div class="TouchControls-face">
						<div class="TouchControls-dpad">
							<button
								type="button"
								class="TouchControls-btn TouchControls-btn--up"
								data-key="ArrowUp"
								aria-label="up"
							>
								▲
							</button>
							<button
								type="button"
								class="TouchControls-btn TouchControls-btn--left"
								data-key="ArrowLeft"
								aria-label="left"
							>
								◀
							</button>
							<button
								type="button"
								class="TouchControls-btn TouchControls-btn--right"
								data-key="ArrowRight"
								aria-label="right"
							>
								▶
							</button>
							<button
								type="button"
								class="TouchControls-btn TouchControls-btn--down"
								data-key="ArrowDown"
								aria-label="down"
							>
								▼
							</button>
						</div>
						<div class="TouchControls-system">
							<button
								type="button"
								class="TouchControls-btn TouchControls-btn--system TouchControls-btn--reset"
								aria-label="reset"
							>
								RESET
							</button>
							<button
								type="button"
								class="TouchControls-btn TouchControls-btn--system"
								data-key="Enter"
								aria-label="start"
							>
								START
							</button>
						</div>
						<div class="TouchControls-actions">
							<button
								type="button"
								class="TouchControls-btn TouchControls-btn--action"
								data-key="d"
								aria-label="run"
							>
								RUN
							</button>
							<button
								type="button"
								class="TouchControls-btn TouchControls-btn--action"
								data-key="f"
								aria-label="jump"
							>
								JUMP
							</button>
						</div>
					</div>
				`;
			},
		});
	}

	static _wire(tag) {
		tag.querySelectorAll('.TouchControls-btn[data-key]').forEach((button) => {
			const key = button.dataset.key;
			const press = (e) => {
				e.preventDefault();
				hapticTap();
				sendKey('keydown', key);
			};
			const release = (e) => {
				e.preventDefault();
				sendKey('keyup', key);
			};
			button.addEventListener('pointerdown', press);
			button.addEventListener('pointerup', release);
			button.addEventListener('pointercancel', release);
			button.addEventListener('pointerleave', release);
		});

		// RESET has no in-game equivalent to press (there's no restart
		// flow to hook into, see engine/src/Game.js's `restart` stub) -
		// on a real NES this button hard-resets the console, so just
		// reload the page, same effect.
		const resetButton = tag.querySelector('.TouchControls-btn--reset');
		if (resetButton) {
			resetButton.addEventListener('pointerdown', (e) => {
				e.preventDefault();
				hapticTap();
			});
			resetButton.addEventListener('pointerup', (e) => {
				e.preventDefault();
				location.reload();
			});
		}
	}
}

export default TouchControls;
