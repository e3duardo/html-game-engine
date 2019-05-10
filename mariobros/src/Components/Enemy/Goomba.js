import Object from '~/engine/Object';
import Assets from '../Assets';

class Goomba extends Object{
	constructor(){
		super();
	}

	static setupWebComponent(){
		const tagName = 'enemy-goomba';
		const bgx = 0;
		const bgy = 1;

		Object.setupWebComponent(tagName, {
			x: 0,
			y: 2,
		  	render: (tag) => {
				tag.style.position = 'absolute';
				tag.style.width = '16px';
				tag.style.height = '16px';
				tag.style.left = tag.x*16+'px';
				tag.style.bottom = tag.y*16+'px';
				tag.style.zIndex = 2;

				return Object.html`
		  		<style>
					.m{
						background-image: url('${Assets.enemies}');
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

export default Goomba;
