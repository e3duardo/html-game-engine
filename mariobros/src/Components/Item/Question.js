import Object from '~/engine/src/Object';
import Assets from '../Assets';

class Question extends Object{
	constructor(){
		super();
	}

	static setupWebComponent(){
		const tagName = 'item-question';
		const bgx = 24;
		const bgy = 0;

		Object.setupWebComponent(tagName, {
			x: 0,
			y: 5,
			hide: false,
		  	render: (tag) => {
				tag.classList+=('Collidable solid');
				tag.style.position = 'absolute';
				tag.style.width = '16px';
				tag.style.height = '16px';
				tag.style.left = tag.x*16+'px';
				tag.style.bottom = tag.y*16+'px';
				tag.style.zIndex = 2;
				if(tag.hide){
					tag.style.opacity = '0.2';
				}
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
						animation-timing-function: steps(1);
						animation-name: animation;
						animation-duration: .40s;
						animation-iteration-count: infinite;
					}
					@keyframes animation {
						0% { background-position: -${(bgx)*16}px -${bgy*16}px; }
						33% { background-position: -${(bgx+1)*16}px -${bgy*16}px; }
						66% { background-position: -${(bgx+2)*16}px -${bgy*16}px; }
						100% { background-position: -${(bgx+3)*16}px -${bgy*16}px; }
					}
				</style>
				<div class="m"></div>
		  `},
		});
	}
}

export default Question;
