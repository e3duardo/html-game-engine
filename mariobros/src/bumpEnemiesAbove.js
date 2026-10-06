import Inject from '~/engine/src/Inject';

// SMBDIS (the block-bump -> enemy check, ChkToStunEnemies path): hitting a
// block from underneath knocks over whatever enemy is standing on top of it
// (a goomba is killed, a koopa is stunned into a shell, 100 points). Called
// by every block that bumps (Brick, Question). Enemies opt in with
// `bumpedFromBelow()`.
const TOLERANCE = 4;

export default function bumpEnemiesAbove(block) {
	const top = block.y;
	Inject.scene.collisionMap.forEach((object) => {
		if (!object.enemy || object.dead || !object.bumpedFromBelow) return;
		const standing = Math.abs(object.y + object.height - top) <= TOLERANCE;
		const overlapping = object.x + object.width > block.x && object.x < block.x + block.width;
		if (standing && overlapping) object.bumpedFromBelow();
	});
}
