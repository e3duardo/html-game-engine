import Object from '~/engine/src/Object';
import Assets from '../Assets';

class Flag extends Object{
	constructor(){
		super();
	}

	static setupWebComponent(){
		const tagName = 'item-flag';
		const bgx = 35;
		const bgy = 2;

		Object.setupWebComponent(tagName, {
			x: 0,
			y: 5,
		  	render: (tag) => {
				tag.classList+=('Collidable');
				tag.style.position = 'absolute';
				tag.style.width = '16px';
				tag.style.height = '16px';
				tag.style.left = tag.x*16+'px';
				tag.style.bottom = tag.y*16+'px';
				tag.style.zIndex = 2;
				return Object.html`
		  		<style>
					.m{
						background-image: url('${Assets.items}');
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

export default Flag;
