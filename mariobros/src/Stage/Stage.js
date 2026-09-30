import Inject from '~/engine/src/Inject';
import SceneBase from '~/engine/src/SceneBase';

// shared by every mariobros World*.js stage - holds the "what happens at
// the edges of this stage" decisions (what plays before the player gets
// control, what stage comes after this one is cleared). That's stage/level
// knowledge, not the player puppet's - see engine/src/SceneBase.js's own
// onLevelComplete/openingCutscene hooks, no-ops there precisely so a game's
// Stage decides this instead.
//
// Each World*.js stage used to be its own subclass overriding these hooks
// with hardcoded logic (e.g. World2 hardcoding 1-2's pipe-intro directly in
// an openingCutscene() method). They're config instead now: a World*.js
// file just passes plain values/callbacks to this constructor, and this
// class is the only place that has to know HOW an opening cutscene or a
// stage transition actually plays out. A water or castle stage that needs
// genuinely different behavior (not just different config values) can still
// override these methods and call super() like any other overridable hook
// in this codebase - config isn't the only way in, just the easy path for
// the common case.
class Stage extends SceneBase {
	// `openingCutscene`: an optional no-arg callback run once control would
	// normally be handed to the player (e.g. World2's castle-init walk into
	// a pipe) - see engine/src/SceneBase.js's own opensWithCutscene/
	// openingCutscene for why this needs to be known immediately at
	// construction, not just once the cutscene itself starts running.
	// `nextStage`: an optional explicit route name this stage's
	// onLevelComplete should advance to - defaults to incrementing the
	// current route ('1-2' -> '1-3'), which is right for every linear stage
	// today but not necessarily for e.g. a bonus/water stage that should
	// lead somewhere other than "the next number".
	constructor({ openingCutscene = null, nextStage = null } = {}) {
		super();
		this._openingCutscene = openingCutscene;
		this.opensWithCutscene = !!openingCutscene;
		this._nextStage = nextStage;
	}

	openingCutscene() {
		if (this._openingCutscene) this._openingCutscene();
	}

	// advances to the next stage once the COURSE CLEAR card has had a moment
	// on screen - derives "next" from the current route name ('1-2' -> '1-3')
	// unless this stage's own config named an explicit one (see
	// `nextStage` above). Router.goTo() itself no-ops if that next route
	// doesn't exist yet (see Router.js), so finishing the last real stage
	// just stays on the COURSE CLEAR card. The 3s pause isn't a precise
	// measured value, just a reasonable beat.
	onLevelComplete() {
		setTimeout(() => {
			if (this._nextStage) {
				Inject.router.goTo(this._nextStage);
				return;
			}
			const [world, stage] = Inject.router.current.split('-').map(Number);
			Inject.router.goTo(`${world}-${stage + 1}`);
		}, 3000);
	}
}

export default Stage;
