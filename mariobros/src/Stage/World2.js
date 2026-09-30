import Inject from '~/engine/src/Inject';
import Stage from './Stage';

// 1-2 opens on a decorative castle-init walk-up into a pipe, not a real
// checkpoint (see Puppet.js's respawnPlayer, which skips straight to the
// underground entrance on death instead of replaying this). Reuses the
// entrance pipe's own warp-to id (see mariobros/public/scenes/1-2.html)
// instead of a second hardcoded one, keeping the entrance and its cutscene
// trigger tied to the same markup element.
class World2 extends Stage {
	constructor() {
		super({
			openingCutscene: () => {
				const pipe = document.querySelector('item-pipe[warp-to="exit-a"]');
				if (pipe) Inject.puppet.walkIntoPipe(pipe, 'exit-a');
			},
		});
	}
}

export default World2;
