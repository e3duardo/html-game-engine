import Object from '~/engine/src/Object';
import Inject from '~/engine/src/Inject';

const TILE = 16;
const SCREEN_HEIGHT = 240;

// "x / y / go" form to jump Mario anywhere in the level, in tiles - the
// numbers printed by <debug-grid>, multiplied by 16 here; y counts from the
// bottom like its rows (the floor's top edge is y=2).
// Lives inside .InfoBox-text, so it's desktop-only, and only exists in
// ?debug mode.
//
//   <debug-teleport></debug-teleport>
class DebugTeleport {
	static tagName = 'debug-teleport';

	static go(tag) {
		const puppet = Inject.puppet;
		const scene = Inject.scene;
		if (!puppet || !scene) return;
		const x = (Number(tag.querySelector('.tp-x').value) || 0) * TILE;
		const y = (Number(tag.querySelector('.tp-y').value) || 0) * TILE;
		puppet.x = x;
		puppet.y = SCREEN_HEIGHT - y - puppet.height;
		puppet.speedX = 0;
		puppet.speedY = 0;
		// the camera only ever follows forward on its own, so put it where
		// it would be for that x (centered, clamped to the level)
		scene.scroll_x = Math.max(0, Math.min(scene.width - Inject.stage.width, x - Inject.stage.width / 2));
	}

	static setupWebComponent() {
		Object.setupWebComponent(this.tagName, {
			render: (tag) => {
				if (!Inject.debug.enabled) {
					tag.style.display = 'none';
					return '';
				}
				requestAnimationFrame(() => {
					tag.querySelector('.tp-go').addEventListener('click', () => DebugTeleport.go(tag));
					// keep game keys (arrows, f, d) from moving Mario while typing
					tag.querySelectorAll('input').forEach((input) => {
						input.addEventListener('keydown', (e) => {
							e.stopPropagation();
							if (e.key === 'Enter') DebugTeleport.go(tag);
						});
						input.addEventListener('keyup', (e) => e.stopPropagation());
					});
				});
				return `
					<div style="display:flex;gap:6px;align-items:center;margin:8px 0;font:12px monospace;text-transform:none">
						<span style="font:12px monospace!important">x</span>
						<input class="tp-x" type="number" step="1" value="0" style="width:70px">
						<span style="font:12px monospace!important">y</span>
						<input class="tp-y" type="number" step="1" value="2" style="width:50px">
						<button class="tp-go" type="button">go</button>
					</div>`;
			},
		});
	}
}

export default DebugTeleport;
