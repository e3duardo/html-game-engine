import Object from '~/engine/src/Object';
import Assets from '../Assets';

class Block extends Object{
	constructor(){
		super();
	}

	static setupWebComponent(){
		const tagName = 'item-block';
		const bgx = 0;
		const bgy = 1;

		Object.setupWebComponent(tagName, {
			size: 1,
			x: 0,
			y: 2,
		  	render: (tag) => {
				let width = 16;
				let height = 16*tag.size;
				tag.classList+=('Collidable solid');
				tag.style.position = 'absolute';
				tag.style.width = width+'px';
				tag.style.height = height+'px';
				tag.style.left = tag.x*16+'px';
				tag.style.bottom = tag.y*16+'px';
				tag.style.zIndex = 2;

				return Object.html`
		  		<style>
					.g{
						position: relative;
					}
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
				<div class="g">
					<div class="m"></div>
					${Array.from(Array(tag.size-1)).map((a,i) => Object.html`
						<div class="m" style="top: ${(i+1)*16}px;"></div>
					`)}
				</div>
		  `},
		});
	}
}

export default Block;
