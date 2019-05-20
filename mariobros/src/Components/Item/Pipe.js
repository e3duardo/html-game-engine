import Object from '~/engine/src/Object';
import Assets from '../Assets';

class Pipe extends Object{
	constructor(){
		super();
	}

	static setupWebComponent(){
		const tagName = 'item-pipe';
		// const bgx = 35;
		// const bgy = 2;
		const m11 = `background-position: ${-0*16}px ${-8*16}px`;
		const m12 = `background-position: ${-1*16}px ${-8*16}px`;
		const m21 = `background-position: ${-0*16}px ${-9*16}px`;
		const m22 = `background-position: ${-1*16}px ${-9*16}px`;

		Object.setupWebComponent(tagName, {
			size: 2,
			x: 0,
			y: 2,
		  	render: (tag) => {
				let width = 32;
				let height = 16*tag.size;
				tag.classList+=('Collidable solid');
				tag.style.position = 'absolute';
				tag.style.width = width+'px';
				tag.style.height = height+'px';
				tag.style.left = tag.x*16+'px';
				tag.style.bottom = tag.y*16+'px';

				return Object.html`
		  		<style>
					.g{
						position: relative;
						background: red;
					}
					.m{
						background-image: url('${Assets.tileset}');
						background-repeat: no-repeat;
						position: absolute;
						width: 16px;
						height: 16px;
					}
				</style>
				<div class="g">
					<div class="m" style="top: 0; left: 0; ${m11}"></div>
					<div class="m" style="top: 0; left: 16px; ${m12}"></div>

					${Array.from(Array(tag.size-1)).map((a,i) => Object.html`
						<div class="m" style="top: ${(i+1)*16}px; left: 0; ${m21}"></div>
						<div class="m" style="top: ${(i+1)*16}px; left: 16px; ${m22}"></div>
					`)}
				</div>
				<!-- <div class="m"></div> -->
		  `},
		});
	}
}

export default Pipe;
