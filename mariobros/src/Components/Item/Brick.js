import Object from '~/engine/Object';
import Assets from '../Assets';

class Brick extends Object{
	constructor(){
		super();
	}

	static setupWebComponent(){
		const tagName = 'item-brick';
		const bgx = 1;
		const bgy = 0;

		Object.setupWebComponent(tagName, {
			x: 0,
			y: 5,
		  	render: (tag) => {
				tag.classList+=('Collidable solid');
				tag.style.position = 'absolute';
				tag.style.width = '16px';
				tag.style.height = '16px';
				tag.style.left = tag.x*16+'px';
				tag.style.bottom = tag.y*16+'px';
				tag.style.zIndex = 2;
				return Object.html`
		  		<style>
					.m{
						background-image: url('${Assets.tileset}');
						background-position: -${bgx*16}px -${bgy*16}px;
						background-repeat: no-repeat;
						position: absolute;
						width: 16px;
						height: 16px;
						top: 0;
						left: 0;
					}
				</style>
				<div class="m"></div>
		  `},
		});
	}
}

export default Brick;
