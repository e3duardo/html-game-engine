import Object from '~/engine/src/Object';

// what Toad says once Bowser's bridge is gone (SMBDIS MarioThanksMessage /
// MushroomRetainerSaved), drawn over the level - not a full black screen.
// Hidden again as soon as the next scene boots, see
// SuperMarioBros._bootScene.
class ToadMessage {
	static tagName = 'toad-message';

	static setupWebComponent() {
		Object.setupWebComponent(this.tagName, {
			render: () => Object.html`
				<style>
					${this.tagName} {
						width: 256px;
						height: 240px;
						position: absolute;
						z-index: 100;
						color: #fff;
						display: none;
						pointer-events: none;
					}
					/* SMBDIS MarioThanksMessage / MushroomRetainerSaved: each line
					   is printed at its own nametable spot (8px cells) */
					${this.tagName} div {
						position: absolute;
						white-space: nowrap;
						/* same metrics as the HUD's text (see Hud.js): 8px per
						   character, so the lines land on the original's 8px cells */
						font-size: 7px !important;
						line-height: 9.1px !important;
						letter-spacing: -0.3px !important;
						word-spacing: 0 !important;
					}
				</style>
				<div style="left: 64px; top: 80px">thank you mario!</div>
				<div style="left: 40px; top: 112px">but our princess is in</div>
				<div style="left: 40px; top: 128px">another castle!</div>
			`,
		});
	}

	static show() {
		document.querySelector(this.tagName).style.display = 'block';
	}

	static hide() {
		document.querySelector(this.tagName).style.display = 'none';
	}
}

export default ToadMessage;
