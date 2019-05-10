import Collidable from '~/engine/Collidable';
import Inject from '~/engine/Inject';
import {boundMethod} from 'autobind-decorator'

class Question extends Collidable{
	constructor(tag) {
		super(tag);

		this.disabled = false;
		this.border = {
			top: 'solid',
			bottom: 'solid',
			horizontal: 'solid'
		}
		this.shouldReleaseYoshi = tag.classList.contains('releaseYoshi');

		this.type = 'item';
	}

	@boundMethod
	disable(){
		this.disabled = true;
		this.tag.style.backgroundPosition = '-257px -97px';
		this.tag.style.animation = 'none';
	}

	@boundMethod
	releaseCoin(){
		const coin = document.createElement('div');
		coin.className = 'Object Coin';
		coin.style.left= this.x+'px';
		coin.style.top= (this.y-16)+'px';
		Inject.scene.addTag(coin);

		for (var i = 0; i < 8; i++) {
			coin.style.top += (coin.style.offsetTop+1)+'px';
		}
		setTimeout(()=>{
			coin.style.opacity=0;
			coin.parentNode.removeChild(coin);
		}, 260);
	}

	@boundMethod
	releaseYoshi(){
		const coin = document.createElement('div');
		coin.className = 'Plant Egg';
		coin.style.left= this.x+'px';
		coin.style.top= (this.y-16)+'px';
		Inject.scene.addTag(coin);

		let i = 0;
		let interval;
		interval = setInterval(()=>{
			console.log(coin.offsetTop);
			i++;
			if(i<2){
				coin.style.top = (coin.offsetTop-1)+'px';
			}
			if(i>8){
				coin.style.top = (coin.offsetTop+1)+'px';
			}
			if(i>20){
				clearInterval(interval);
			}
		}, 15);
	}

	@boundMethod
	collide(from, collisions){
		super.collide(from, collisions);

		if (!this.disabled && collisions.top && this.border.bottom=='solid') {
			let i = 0;
			let interval;
			interval = setInterval(()=>{
				i++;
				if(i<10){
					this.y -= 1;
				}
				if(i==10){
					if(this.shouldReleaseYoshi){
						this.releaseYoshi();
					}else{
						this.releaseCoin();
					}
				}
				if(i>10){
					this.y += 1;
				}
				if(i>=20){
					clearInterval(interval);
					this.disable();
				}
			}, 5);
		}
	}
}

export {Question as default};
