import Object from '~/engine/src/Object';
import Inject from '~/engine/src/Inject';

const BASE_FPS = 30;
const MAX_LINES = 50;

// the script that used to own this logic ran before the game module had
// finished booting (it's an inline script, evaluated as soon as the parser
// reaches it, well before index.js's own module import chain resolves) - a
// custom element's connectedCallback fires even earlier than that (as soon
// as the tag is parsed/upgraded), so the same poll-until-ready guard is
// still needed here, not just a leftover from the old inline-script era.
function whenGameReady(callback) {
	if (Inject.game) {
		callback();
		return;
	}
	const check = setInterval(() => {
		if (Inject.game) {
			clearInterval(check);
			callback();
		}
	}, 50);
}

function formatEvent(event) {
	const t = new Date(event.timestamp).toLocaleTimeString();
	return `[${t}] ${event.type}: ${JSON.stringify(event.data)}`;
}

// the FPS readout/speed buttons (<debug-bar>) and the event log
// (<event-panel>) are two separate custom elements - not one - so that each
// can keep sitting exactly where its old plain <div> used to sit in
// index.html (.EventPanel used to be a sibling placed after .Stage, not
// right after .DebugBar, and both are normal-flow block boxes, so DOM order
// is what determined their on-page position). They're still one feature/one
// file: <debug-bar>'s wiring reaches across to <event-panel> the same way
// the original inline script did, via a DOM query, since eventsToggle and
// the panel it drives were always logically joined, just never physically
// nested.
class DebugBar {
	static setupWebComponent() {
		Object.setupWebComponent('debug-bar', {
			render: (tag) => {
				// render() runs before its return value becomes this element's
				// innerHTML (see Object.setupWebComponent) - defer the actual
				// querySelector/addEventListener wiring to a microtask so it
				// only ever runs once that assignment (and, in practice,
				// <event-panel>'s own synchronous upgrade right after it) has
				// already happened, instead of racing it.
				queueMicrotask(() => whenGameReady(() => DebugBar._wireDebugBar(tag)));

				return Object.html`
					<style>
						/* a custom element defaults to display:inline unless told
						   otherwise - the old .DebugBar was a plain <div> (block by
						   default), so display:flex here both matches the original
						   layout look and keeps this element block-level the way a
						   div would have been */
						debug-bar {
							display: flex;
							flex-wrap: wrap;
							align-items: center;
							gap: 8px;
							padding: 4px 8px;
							background: rgba(0, 0, 0, 0.75);
							color: #0f0;
							font-family: monospace;
							font-size: 12px;
							width: 380px;
							border-radius: 6px;
							margin-top: 8px;
						}
						debug-bar button {
							font-family: monospace;
							font-size: 12px;
							padding: 2px 6px;
						}
						debug-bar button.is-active {
							background: #0f0;
							color: #000;
							font-weight: bold;
						}
						@media (max-width: 600px) {
							debug-bar,
							event-panel {
								width: auto;
								max-width: calc(100vw - 16px);
							}
							debug-bar {
								background: #000;
							}
						}
					</style>
					<span class="DebugBar-fps">FPS: --</span>
					<button type="button" data-speed="1">1x</button>
					<button type="button" data-speed="0.5">0.5x</button>
					<button type="button" data-speed="0.25">0.25x</button>
					<button type="button" data-speed="0.1">0.1x</button>
					<button type="button" id="eventsToggle">events</button>
				`;
			},
		});

		Object.setupWebComponent('event-panel', {
			render: () => {
				return Object.html`
					<style>
						event-panel {
							display: none;
							width: 380px;
							background: rgba(0, 0, 0, 0.85);
							color: #0f0;
							font-family: monospace;
							font-size: 11px;
							border-radius: 6px;
							margin-top: 2px;
							padding: 4px 8px;
						}
						event-panel .EventPanel-filters {
							display: flex;
							gap: 10px;
							margin-bottom: 4px;
						}
						event-panel .EventPanel-log {
							max-height: 140px;
							overflow-y: auto;
							white-space: pre-wrap;
							word-break: break-all;
						}

						/*.Stage{
							overflow: visible;
						}
						.InfoBox, .WorldIntro{
							display: none!important;
						}*/
					</style>
					<div class="EventPanel-filters">
						<label><input type="checkbox" data-type="key" checked /> key</label>
						<label><input type="checkbox" data-type="move" checked /> move</label>
						<label><input type="checkbox" data-type="collision" checked /> collision</label>
					</div>
					<div class="EventPanel-log"></div>
				`;
			},
		});
	}

	static _wireDebugBar(tag) {
		const fpsLabel = tag.querySelector('.DebugBar-fps');
		setInterval(() => {
			const fps = Math.round(1000 / Inject.game.frameTime);
			fpsLabel.textContent = 'FPS: ' + (isFinite(fps) ? fps : '--');
		}, 500);

		const buttons = tag.querySelectorAll('button[data-speed]');
		buttons.forEach((button) => {
			button.addEventListener('click', () => {
				const speed = parseFloat(button.dataset.speed);
				const fps = Math.max(1, Math.round(BASE_FPS * speed));
				Inject.game.fps = fps;
				window.clearInterval(Inject.game.gameInterval);
				Inject.game.gameInterval = setInterval(Inject.game.gameLoop, 1000 / fps);
				buttons.forEach((b) => b.classList.remove('is-active'));
				button.classList.add('is-active');
			});
		});

		const eventsToggle = tag.querySelector('#eventsToggle');
		const eventPanel = document.querySelector('event-panel');
		const eventLog = eventPanel.querySelector('.EventPanel-log');
		let unsubscribeEvents = null;

		eventsToggle.addEventListener('click', () => {
			const showing = eventPanel.style.display === 'block';
			if (showing) {
				eventPanel.style.display = 'none';
				Inject.events.disable();
				if (unsubscribeEvents) {
					unsubscribeEvents();
					unsubscribeEvents = null;
				}
				eventsToggle.classList.remove('is-active');
			} else {
				eventPanel.style.display = 'block';
				Inject.events.enable();
				unsubscribeEvents = Inject.events.subscribe((event) => {
					const line = document.createElement('div');
					line.textContent = formatEvent(event);
					eventLog.appendChild(line);
					while (eventLog.children.length > MAX_LINES) {
						eventLog.removeChild(eventLog.firstChild);
					}
					eventLog.scrollTop = eventLog.scrollHeight;
				});
				eventsToggle.classList.add('is-active');
			}
		});

		eventPanel.querySelectorAll('.EventPanel-filters input').forEach((checkbox) => {
			checkbox.addEventListener('change', () => {
				const type = checkbox.dataset.type;
				if (checkbox.checked) {
					Inject.events.enableType(type);
				} else {
					Inject.events.disableType(type);
				}
			});
		});
	}
}

export default DebugBar;
