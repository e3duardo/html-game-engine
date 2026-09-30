import Inject from '~/engine/src/Inject';

import gameOverTheme from '../sounds/gameovertheme.mp3';

import Game from '~/engine/src/Game';

import Hud from './Hud';

// mariobros' own subclass (see Puppet.js) - not the bare engine one, so the
// death/fireball SFX it hangs off die()/throwFireball() actually fire
import Puppet from './Puppet';
import Control from './Control';
import CollidableFactory from './CollidableFactory';
import World1 from './Stage/World1';
import World2 from './Stage/World2';
import World3 from './Stage/World3';

import Mario from './Components/Actor/Mario';

import DebugBar from './Components/UI/DebugBar';
import TouchControls from './Components/UI/TouchControls';

import Goomba from './Components/Enemy/Goomba';
import KoopaTropa from './Components/Enemy/KoopaTropa';
import PiranhaPlant from './Components/Enemy/PiranhaPlant';

import Brick from './Components/Item/Brick';
import Coin from './Components/Item/Coin';
import Fireball from './Components/Item/Fireball';
import Flag from './Components/Item/Flag';
import Flower from './Components/Item/Flower';
import Mushroom from './Components/Item/Mushroom';
import Pipe from './Components/Item/Pipe';
import Question from './Components/Item/Question';
import Star from './Components/Item/Star';

import FloatingPlatform from './Components/Scenario/FloatingPlatform';
import Trunk from './Components/Scenario/Trunk';
import Block from './Components/Scenario/Block';
// air-cloud/building-castle register themselves as a side effect of these
// imports (see Cloud.js/Castle.js, both written as a plain object + an
// immediate Object.setupWebComponent() call, not a class with a static
// method) - the tags already in index.html just needed the custom element
// defined to be upgraded and actually render.
import './Components/Scenario/Cloud';
import './Components/Scenario/Castle';
// same self-registering plain-object pattern as Cloud/Castle above (not a
// class - Montain.setupWebComponent()/Stuff.setupWebComponent() don't
// exist, calling them throws) - these two were previously commented out
// entirely instead, which left <vegetation-mountain>/<vegetation-stuff>
// undefined custom elements (rendering as an empty 0x0 box, no style ever
// applied) anywhere they're used in a level's markup
import './Components/Scenario/Montain';
import './Components/Scenario/Stuff';
import './Components/Scenario/Floor';
import Elevator from './Components/Scenario/Elevator';
import Pole from './Components/Scenario/Pole';
import Portal from '~/engine/src/Portal';

class SuperMarioBros extends Game {
	constructor() {
		super(); //240px

		Mario.setupWebComponent();

		DebugBar.setupWebComponent();
		TouchControls.setupWebComponent();

		Goomba.setupWebComponent();
		KoopaTropa.setupWebComponent();
		PiranhaPlant.setupWebComponent();

		Brick.setupWebComponent();
		Coin.setupWebComponent();
		Fireball.setupWebComponent();
		Flag.setupWebComponent();
		Flower.setupWebComponent();
		Mushroom.setupWebComponent();
		Pipe.setupWebComponent();
		Question.setupWebComponent();
		Star.setupWebComponent();
		Pole.setupWebComponent();
		Elevator.setupWebComponent();

		Block.setupWebComponent();
		FloatingPlatform.setupWebComponent();
		Trunk.setupWebComponent();
		Portal.setupWebComponent();

		// opt-in only (?debug=1) - exposes the engine's internals on
		// window.__inject for external tooling to poke at
		// Inject.puppet/scene directly, without leaving that exposed by
		// default for every normal visit to the page
		if (new URLSearchParams(window.location.search).get('debug') === '1') {
			window.__inject = Inject;
		}
		console.log(Inject);

		Inject.collidableFactory = new CollidableFactory();
		Inject.control = new Control();
		Inject.game = this;

		// Audio.js defaults to muted and nothing in mariobros ever turned it on
		Inject.audio.mute = false;

		Inject.hud = new Hud();
		Inject.hud.actor = 'mario';
		// score/coin only ever get set here, once for the whole game session
		// - neither losing a life nor finishing a level touches them, only
		// a brand new game does - a Router scene swap (see _bootScene
		// below) never touches Inject.hud itself,
		// so they carry forward across every level transition and death for
		// free just by not being reset anywhere else
		Inject.hud.score = 0;
		Inject.hud.coin = 0;

		// this interval outlives any single scene (reads Inject.puppet/hud by
		// reference every tick, whichever ones are currently live) - it must
		// stay a one-time setup here, not move into _bootScene, or every
		// scene swap would stack another one and double-drain the clock.
		// Inject.puppet is still null for a brief moment on first boot now
		// (Router.goTo's fetch of the fragment hasn't resolved yet when this
		// interval is created), hence the extra guard below.
		setInterval(() => {
			if (
				!Inject.puppet ||
				Inject.hud.time <= 0 ||
				Inject.hud.introShowing ||
				Inject.puppet.winning
			)
				return;
			Inject.hud.time -= 1;
			// the original's "hurry up" event - see Puppet.js's
			// triggerHurryUp/currentLevelTheme
			if (Inject.hud.time === 100) {
				Inject.puppet.triggerHurryUp();
			}
			// running out of time kills mario same as falling off the bottom
			// or touching an enemy - respawnPlayer() resets the clock back to
			// 400 for the next attempt
			if (Inject.hud.time <= 0 && !Inject.puppet.dying) {
				Inject.puppet.die();
			}
		}, 1000);

		console.log('super mario bros');

		// gates only the very first play() call behind a Start press, same
		// as the original's title screen - see play() below. Every respawn
		// after that auto-continues with no Start needed, same as the
		// original (Start only gates the title screen, not a mid-game death).
		this._pressedStartOnce = false;
		// set true by _bootScene, right before a stage that opens on a
		// scripted cutscene (see Inject.scene.opensWithCutscene) - consumed
		// once by _startGameAfterIntro and cleared, so a mid-level respawn
		// (which calls play() directly, never through _bootScene again)
		// never replays the cutscene a second time
		this._openingCutscenePending = false;

		// registers each level with the engine's Router (see Router.js) -
		// generic, so marioworld or a future game can adopt the same
		// mechanism later without touching it. start() resolves whatever
		// route is already in location.hash (or '1-1' by default) and drives
		// the very first _bootScene()/play() call itself - see index.js,
		// which no longer calls play() directly.
		Inject.router.register('1-1', `${import.meta.env.BASE_URL}scenes/1-1.html`, (name) =>
			this._bootScene(World1, name)
		);
		Inject.router.register('1-2', `${import.meta.env.BASE_URL}scenes/1-2.html`, (name) =>
			this._bootScene(World2, name)
		);
		Inject.router.register('1-3', `${import.meta.env.BASE_URL}scenes/1-3.html`, (name) =>
			this._bootScene(World3, name)
		);
		Inject.router.start();
	}

	// runs once per Router.goTo() - the fragment for `routeName` is already
	// sitting inside .Scene by the time this fires (see Router.js). Builds
	// this scene's own Inject.scene/Inject.puppet (Puppet has to be
	// reconstructed: it binds to a <player-mario> tag, and the previous
	// scene's tag no longer exists once .Scene's innerHTML was replaced),
	// carrying forward whatever should survive a level transition - see
	// Puppet.captureState/restoreState. Inject.hud itself is never
	// recreated here: its own DOM (.hud-score etc.) lives in the shell,
	// outside .Scene, so score/coin already carry over for free.
	_bootScene(SceneClass, routeName) {
		const carry = Inject.puppet ? Inject.puppet.captureState() : null;
		Inject.hud.hideLevelClear();
		Inject.scene = new SceneClass();
		Inject.puppet = new Puppet(document.querySelector('player-mario'));
		if (carry) Inject.puppet.restoreState(carry);
		// a router scene swap never actually stops the previous scene's
		// game loop (unlike a death/win, which routes through
		// Inject.game.newGame() first) - it just keeps ticking against
		// whichever Inject.puppet is current. Without this, real input could
		// already be moving the freshly-built puppet during its own 2s intro
		// card, well before _startGameAfterIntro below ever gets to freeze it
		// via the scene's own openingCutscene() (see SceneBase.js)
		if (Inject.scene.opensWithCutscene) {
			Inject.puppet.scripted = true;
			this._openingCutscenePending = true;
		}
		// '1-2' -> 12, matching Hud.stage's own "s[0]+'-'+s[1]" display format
		Inject.hud.stage = Number(routeName.replace('-', ''));
		// dying restarts the whole level attempt from the beginning, and so
		// does moving to a new level entirely - neither is a checkpoint
		Inject.hud.time = 400;
		Inject.scene.constructCollisionMap();
		this.play();
	}

	// shows the "WORLD 1-1" title card (with the current life count) over a
	// black screen before actually starting the game loop - covers both
	// entering the stage (index.js calls this once at boot) and every
	// respawn after death (Puppet.die()'s timeout calls Inject.game.play()
	// the same way, once lives remain). Nothing moves and no input has any
	// effect while it's up, since gameInterval simply isn't running yet.
	play() {
		Inject.hud.showIntro(Inject.puppet.lives);

		if (this._pressedStartOnce) {
			this._startGameAfterIntro();
			return;
		}

		// first boot only: the original sits on its title screen until
		// Start is pressed - stay stuck on this same black screen until
		// Enter is pressed once.
		const unsubscribe = Inject.events.subscribe((event) => {
			if (event.type === 'key' && event.data.key === 'start' && event.data.pressed) {
				unsubscribe();
				this._pressedStartOnce = true;
				this._startGameAfterIntro();
			}
		});
	}

	// same ~2000ms gap the original has between Start being accepted and Mario
	// actually gaining control, whether that's the title screen (first
	// boot) or a mid-game respawn - see play() above.
	_startGameAfterIntro() {
		setTimeout(() => {
			Inject.hud.hideIntro();
			super.play();
			// picks the hurry-up theme instead of the normal one if hurryActive
			// is still true from before this life started (e.g. star power
			// ending mid-hurry) - always false right after a fresh respawn,
			// since respawnPlayer() just reset it
			Inject.audio.playBackground(Inject.puppet.currentLevelTheme());
			// only once per scene boot, never on a mid-level respawn - see
			// _openingCutscenePending above
			if (this._openingCutscenePending) {
				this._openingCutscenePending = false;
				Inject.scene.openingCutscene();
			}
		}, 2000);
	}

	// only the final death (lives hits 0, Game Over screen shown) gets the
	// game-over theme and stops the level music - every other death already
	// got its own death SFX from Puppet.js's die(), and the level/music just
	// keep going once respawnPlayer() runs
	gameOver() {
		super.gameOver();
		if (Inject.puppet.lives <= 0) {
			Inject.audio.stopBackground();
			// play(), not playBackground() - the original's game-over jingle
			// plays once and stops, it doesn't loop like the level themes
			Inject.audio.play(gameOverTheme);
		}
	}
}

export default new SuperMarioBros();
