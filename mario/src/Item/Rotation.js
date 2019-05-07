import Collidable from '~/engine/Collidable';
import Inject from '~/engine/Inject';

class Rotation extends Collidable{
	constructor(tag) {
		super(tag);

		this.disabled = false;
		this.border = {
			top: 'solid',
			bottom: 'solid',
			horizontal: 'solid'
		}
		this.static = tag.classList.contains('static');
	}

	rotate = ()=>{
		this.tag.classList.add('Rotation');
		this.border = {
			top: false,
			bottom: false,
			horizontal: false
		}
	}
	stop = ()=>{
		this.tag.classList.remove('Rotation');
		this.border = {
			top: 'solid',
			bottom: 'solid',
			horizontal: 'solid'
		}
	}

	disable = ()=>{
		this.disabled = true;
		this.tag.style.backgroundPosition = '-257px -97px';
		this.tag.style.animation = 'none';
	}

	collide = (from, collides)=>{
		super.collide(from, collides);

		if (!this.disabled && collides.top && this.border.bottom=='solid') {
			if(this.static){
				this.disable();
			}else{
				this.rotate();
				setTimeout(()=>{
					this.stop();
				},5000);
			}
		}
	}
}

export {Rotation as default};
