import Object from '~/engine/Object';
import Assets from '../Assets';

class Mario extends Object{
	constructor(){
		super();
	}

	static setupWebComponent(){
		const tagName = 'player-mario';
		const bgx = 5;
		const bgy = 2.125;

		Object.setupWebComponent(tagName, {
			x: 0,
			y: 4,
		  	render: (tag) => {
				tag.style.position = 'absolute';
				tag.style.width = '16px';
				tag.style.height = '16px';
				tag.style.left = tag.x*16+'px';
				tag.style.top = '0px';
				tag.style.zIndex = 2;

				return Object.html`
		  		<style>
					.m{
						background-image: url('${Assets.mario}');
						background-position: -80px -34px;
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

export default Mario;
