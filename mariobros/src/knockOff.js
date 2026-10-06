import Inject from '~/engine/src/Inject';

// SMBDIS ShellOrBlockDefeat -> ChkToStunEnemies (SetStun): an enemy killed by
// a fireball, a star touch or a shell isn't removed on the spot - it's flipped
// upside down, thrown up and away from the player, and falls out of the level
// without colliding with anything. `enemy.update` calls stepKnockedOff() first
// thing while `knocked` is set.
//
// Same apex as the original (v=-3 under 0x1c/256 gravity, ~41px) under this
// engine's gravity, and the same 1/2 px per frame sideways.
const LAUNCH_SPEED = -6.4;
const KNOCK_SPEED_X = 0.5;

export function knockOff(enemy) {
	enemy.knocked = true;
	enemy.dead = true; // no more collisions, scoring or fireball hits
	enemy.speedX = (enemy.x < Inject.puppet.x ? -1 : 1) * KNOCK_SPEED_X;
	enemy.speedY = LAUNCH_SPEED;
	enemy.tag.classList.add('knocked');
}

export function stepKnockedOff(enemy) {
	enemy.x = enemy.x + enemy.speedX;
	enemy.speedY += Inject.scene.gravity;
	enemy.y = enemy.y + enemy.speedY;
	if (enemy.y > Inject.scene.height) {
		enemy.knocked = false;
		enemy.tag.remove();
	}
}

export function resetKnockOff(enemy) {
	enemy.knocked = false;
	enemy.tag.classList.remove('knocked');
}
