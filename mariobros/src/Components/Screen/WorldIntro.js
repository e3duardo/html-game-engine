import Object from '~/engine/src/Object';
import Assets from '../Assets';

// the "WORLD 1-1" title card - shown on entering the stage and again after
// every death (see Hud.showIntro + SuperMarioBros.play). Sits below the
// <game-hud> z-index (10000) on purpose, so the score/coin/world/time row
// stays visible on top of this black background, same as the original NES
// title card.
class WorldIntro {
	static tagName = 'world-intro';

	static setupWebComponent() {
		Object.setupWebComponent(this.tagName, {
			render: () => Object.html`
				<style>
					${this.tagName} {
						width: 256px;
						height: 240px;
						position: absolute;
						z-index: 100;
						background: #000;
						color: #fff;
						display: none;
						flex-direction: column;
						align-items: center;
						padding-top: 90px;
					}
					${this.tagName} .${this.tagName}-title {
						margin-bottom: 30px;
					}
					${this.tagName} .${this.tagName}-lives {
						display: flex;
						align-items: center;
						gap: 6px;
					}
					${this.tagName} .${this.tagName}-icon {
						width: 11px;
						height: 16px;
						/* same standing-right crop player-mario itself uses (see
						   Mario.js) - duplicated here rather than shared since this
						   element isn't a player-mario tag */
						background-image: url('${Assets.mario}');
						background-position: -83px -34px;
						background-repeat: no-repeat;
						image-rendering: pixelated;
					}
				</style>
				<div class="${this.tagName}-title">
					world <span class="${this.tagName}-stage">1-1</span>
				</div>
				<div class="${this.tagName}-lives">
					<span class="${this.tagName}-icon"></span>
					<span>. <span class="${this.tagName}-lives-count">3</span></span>
				</div>
			`,
		});
	}

	static show(stage, lives) {
		const tag = document.querySelector(this.tagName);
		tag.querySelector(`.${this.tagName}-stage`).textContent = stage;
		tag.querySelector(`.${this.tagName}-lives-count`).textContent = lives;
		tag.style.display = 'flex';
	}

	static hide() {
		document.querySelector(this.tagName).style.display = 'none';
	}
}

export default WorldIntro;
