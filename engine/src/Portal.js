import Collidable from './Collidable';

// any Collidable whose warp-id attribute matters - see SceneBase.warp(),
// which searches collisionMap for a matching warpId. Covers both a real
// visible pipe (extending this class) and this class's own <game-portal>
// element below - an invisible warp destination with no pipe artwork of
// its own. CollidableFactoryBase hands ANY warp-id-bearing tag to this
// class even without the <game-portal> tag, so a bare hand-written
// marker div works too.
class Portal extends Collidable {
	constructor(tag) {
		super(tag);
		this.warpId = tag.getAttribute('warp-id') || null;
	}

	static setupWebComponent() {
		const tagName = 'game-portal';

		Collidable.setupWebComponent(tagName, {
			x: 0,
			y: 0,
			width: 1,
			height: 1,
			render: (tag) => {
				tag.classList += 'Collidable';
				// pass-through, never solid - see Collidable.js's own note
				// on why `type` needs to be set explicitly, not left to
				// default to 'scenario' (solid-by-default): a portal is a
				// destination/trigger marker, never something the player
				// should be able to stand on
				tag.setAttribute('type', 'item');
				tag.style.position = 'absolute';
				tag.style.left = tag.x * 16 + 'px';
				tag.style.bottom = tag.y * 16 + 'px';
				tag.style.width = tag.width * 16 + 'px';
				tag.style.height = tag.height * 16 + 'px';
				return '';
			},
		});
	}
}

export default Portal;
