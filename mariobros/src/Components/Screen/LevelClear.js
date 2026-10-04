import Object from '~/engine/src/Object';

// the "COURSE CLEAR!" screen shown once Mario walks into the castle at the
// end of the flagpole sequence (see Puppet.winLevel) - never dismisses
// itself, only hide() once a next scene actually boots (see
// SuperMarioBros._bootScene)
class LevelClear {
	static tagName = 'level-clear';

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
						justify-content: center;
						gap: 20px;
					}
				</style>
				<div class="LevelClear-title">course clear!</div>
				<div class="LevelClear-score">score <span class="LevelClear-score-value">000000</span></div>
			`,
		});
	}

	static show(score) {
		const tag = document.querySelector(this.tagName);
		tag.querySelector('.LevelClear-score-value').textContent = score;
		tag.style.display = 'flex';
	}

	static hide() {
		document.querySelector(this.tagName).style.display = 'none';
	}
}

export default LevelClear;
