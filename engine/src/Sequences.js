import Inject from './Inject';
import fixedStepRaf from './fixedStepRaf';

// generic scripted cutscene helpers - anything here has to work for any
// Puppet-like object (x/y/width/height/animation(), see engine/src/Puppet.js)
// on top of any SceneBase (sceneMap/gravity), with no knowledge of any
// specific game's story beats. The actual choreography of a cutscene (the
// player walking into a pipe, or up to a castle door) belongs to whichever
// game owns that moment, built on top of scriptedWalk below.

// steps `puppet.x` toward targetX while still applying gravity and landing
// on whatever's actually solid under the puppet's CURRENT x each tick,
// rather than just setting x outright with y left untouched. That's only
// correct when the whole walk happens to sit at one constant floor height,
// and visibly wrong (the puppet sliding through the air at its starting y)
// the moment the path crosses a gap or a step up/down.
function scriptedWalk(puppet, targetX, { stepX = 0.6, onTick, onComplete } = {}) {
	const dir = targetX >= puppet.x ? 1 : -1;
	let speedY = 0;
	let frame = 0;
	const cancelWalk = fixedStepRaf(() => {
		puppet.x += stepX * dir;
		if ((dir > 0 && puppet.x >= targetX) || (dir < 0 && puppet.x <= targetX)) puppet.x = targetX;

		// only what's at or under his feet (allowing a step up of one tile):
		// without this a level with a ceiling over the path (a castle) made
		// the highest solid above him "the floor", and he snapped up to it
		const feet = puppet.y + puppet.height;
		const solids = Inject.scene.sceneMap.filter(
			(o) => o.solid && puppet.x + puppet.width > o.x && puppet.x < o.x + o.width && o.y >= feet - 16
		);
		const floor = solids.length ? solids.reduce((h, o) => (o.y < h.y ? o : h)) : null;
		const groundY = floor ? floor.y - puppet.height : null;
		if (groundY !== null && puppet.y >= groundY) {
			puppet.y = groundY;
			speedY = 0;
		} else {
			speedY += Inject.scene.gravity;
			puppet.y += speedY;
		}

		// 24-tick frame cycle keeps the walk animation's real-time speed
		// matched to the default stepX of 0.6 - see fixedStepRaf's own note
		// on why this runs on it instead of a plain setInterval
		frame = (frame + 1) % 24;
		puppet.animation('walk-' + (dir > 0 ? 'right' : 'left') + '-' + (frame < 12 ? 0 : 1));

		if (onTick) onTick();

		if (puppet.x === targetX) {
			cancelWalk();
			puppet.animation(dir > 0 ? 'right' : 'left');
			if (onComplete) onComplete();
		}
	}, Inject.game.tickInterval);
	return cancelWalk;
}

export { scriptedWalk };
