import Object from '~/engine/src/Object';
import Inject from '~/engine/src/Inject';

const TILE = 16;
const SCREEN_HEIGHT = 240;
const ROWS = SCREEN_HEIGHT / TILE;

// 16x16 tile grid with numbers, to read off the `x`/`y` attributes while
// writing a scene: columns are numbered left to right (x), rows bottom to
// top (y), same as the attributes - the floor's top edge is y=2. Only
// exists in ?debug mode.
//
//   <debug-grid tiles="256"></debug-grid>
//
// Column numbers are printed on the top and bottom rows of every tile,
// row numbers every 8th column (a label in every cell is ~4000 nodes). Lines
// are a repeating gradient; every 16th column gets a stronger one.
class DebugGrid {
	static tagName = 'debug-grid';

	static setupWebComponent() {
		Object.setupWebComponent(this.tagName, {
			tiles: 256,
			render: (tag) => {
				if (!Inject.debug.enabled) {
					tag.style.display = 'none';
					return '';
				}
				const line = 'rgba(255,255,255,.19)';
				const strong = 'rgba(255,255,0,.45)';
				tag.style.cssText = `
					position: absolute;
					left: 0;
					bottom: 0;
					width: ${tag.tiles * TILE}px;
					height: ${SCREEN_HEIGHT}px;
					pointer-events: none;
					z-index: 1001;
					font: 5px/6px monospace;
					color: #ffffff;
					background-image:
						repeating-linear-gradient(to right, ${strong} 0 1px, transparent 1px ${TILE * 16}px),
						repeating-linear-gradient(to right, ${line} 0 1px, transparent 1px ${TILE}px),
						repeating-linear-gradient(to top, ${line} 0 1px, transparent 1px ${TILE}px);
				`;

				const label = (text, left, bottom) =>
					`<i style="position:absolute;left:${left}px;bottom:${bottom}px;font:normal 6px/6px monospace!important;letter-spacing:0!important;text-shadow:0 0 1px #000,0 0 1px #000;">${text}</i>`;
				const labels = [];
				for (let x = 0; x < tag.tiles; x++) {
					labels.push(label(x, x * TILE + 1, SCREEN_HEIGHT - 6));
					labels.push(label(x, x * TILE + 1, 1));
					if (x % 8 === 0) {
						for (let y = 1; y < ROWS; y++) labels.push(label(y, x * TILE + 1, y * TILE + 1));
					}
				}
				return labels.join('');
			},
		});
	}
}

export default DebugGrid;
