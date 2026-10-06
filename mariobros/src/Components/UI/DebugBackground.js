import Object from '~/engine/src/Object';
import Inject from '~/engine/src/Inject';

// Level-map reference image drawn over the scene (semi-transparent) to
// place things against the original. Only exists in ?debug mode - Inject.debug
// is read at render time, so outside of it the tag stays empty and hidden.
//
//   <debug-background src="SMB_World_1-2_NES_level_map.webp" x="256"
//     width="3072" height="720" bottom="-240"></debug-background>
//
// `src` is a file in public/mariobros/; x/width/height/bottom are in px.
class DebugBackground {
	static tagName = 'debug-background';

	static setupWebComponent() {
		Object.setupWebComponent(this.tagName, {
			src: '',
			x: 0,
			width: 3584,
			height: 240,
			bottom: 0,
			opacity: 0.5,
			render: (tag) => {
				if (!Inject.debug.enabled || !tag.src) {
					tag.style.display = 'none';
					return '';
				}
				tag.style.cssText = `
					position: absolute;
					left: ${tag.x}px;
					bottom: ${tag.bottom}px;
					width: ${tag.width}px;
					height: ${tag.height}px;
					opacity: ${tag.opacity};
					background-image: url('${import.meta.env.BASE_URL}mariobros/${tag.src}');
					background-repeat: no-repeat;
					pointer-events: none;
					z-index: 1000;
				`;
				return '';
			},
		});
	}
}

export default DebugBackground;
