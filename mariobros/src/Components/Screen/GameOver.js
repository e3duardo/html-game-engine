import Object from '~/engine/src/Object';

class GameOver {
	static tagName = 'game-over';

	static setupWebComponent() {
		Object.setupWebComponent(this.tagName, {
			render: (tag) => {
				// engine/src/Game.js's gameOver() reveals this screen by its
				// .GameOver class (the engine can't know this game's tag name)
				tag.classList.add('GameOver');

				return Object.html`
					<style>
						${this.tagName} {
							width: 256px;
							height: 240px;
							position: absolute;
							z-index: 100;
							background: #000;
							color: #fff;
							justify-content: center;
							align-items: center;
							display: none;
						}
					</style>
					game over
				`;
			},
		});
	}
}

export default GameOver;
