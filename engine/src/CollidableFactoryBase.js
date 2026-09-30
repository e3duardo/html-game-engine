import Collidable from './Collidable';
import Portal from './Portal';

class CollidableFactoryBase {
	constructor() {}

	from(tag) {
		// a warp-id attribute is the signal that this needs Portal's own
		// warpId (see SceneBase.warp) - covers a bare marker div standing
		// in for a warp destination, not just a real visible pipe (a
		// game's own factory can still route that to its own subclass
		// before ever reaching here)
		if (tag.hasAttribute('warp-id')) return new Portal(tag);
		return new Collidable(tag);
	}
}

export { CollidableFactoryBase as default };
