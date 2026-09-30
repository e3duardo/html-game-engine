import Object from '~/engine/src/Object';

// unlike item-brick/item-block, a floor tile never bumps, breaks, or pops
// anything - it's a static collision rectangle with no per-tile state, so
// unlike bricks (which have to stay one element per tile to keep their own
// independent bump/break/coin state) a whole stretch of floor is safely one
// tag, spanning `width` tiles at once - same x/y/size-in-tiles convention
// as every other scenery piece, instead of the raw left/width-in-px a plain
// <div class="Floor Collidable solid" style="..."> used to need.
export const Floor = {
	x: 0,
	y: 0,
	width: 1,
	height: 2,
	render: (tag) => {
		tag.classList += 'Floor Collidable';
		tag.setAttribute('kind', 'solid');
		tag.style.position = 'absolute';
		tag.style.left = tag.x * 16 + 'px';
		tag.style.bottom = tag.y * 16 + 'px';
		tag.style.width = tag.width * 16 + 'px';
		tag.style.height = tag.height * 16 + 'px';
		return '';
	},
};
Object.setupWebComponent('scene-floor', Floor);
