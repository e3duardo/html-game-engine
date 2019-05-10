import Object from '~/engine/Object';
import Assets from '../Assets';

class Question extends Object{
	constructor(){
		super();
	}

	static setupWebComponent(){
		const tagName = 'item-question';

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
						background-position: -${24*16}px 0;
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

export default Question;
