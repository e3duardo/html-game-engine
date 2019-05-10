import {boundMethod} from 'autobind-decorator'

class Audio {
	constructor(){
		this.mute = true;
	}

	@boundMethod
	playBackground(sound){
		if(this.mute != true){
			const background1 = document.querySelector('.backgroundSound');
			if(background1){
				document.body.removeChild(background);
			}

			const background = document.createElement('audio');
			background.classList.add('backgroundSound')
			background.style.display = "none";
			background.src = sound;
			background.loop = true;
			document.body.appendChild(background);

			background.addEventListener('canplaythrough', ()=>{
				background.play();
			});
		}
	}

	@boundMethod
	stopBackground(){
		const background = document.querySelector('.backgroundSound');
		if(background){
			background.pause();
			document.body.removeChild(background);
		}
	}

	@boundMethod
	play(sound){
		if(this.mute != true){
			console.log('play: ',sound);
			const audio = document.createElement('audio');
			audio.style.display = "none";
			audio.src = sound;
			audio.play();
			// audio.autoplay = true;
			audio.onended = function(){
				audio.remove() //Remove when played.
			};
			document.body.appendChild(audio);
		}
	}
}

export default Audio;
