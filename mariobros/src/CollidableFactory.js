// import Mario from './Components/Actor/Mario';

import Goomba from './Components/Enemy/Goomba';
import KoopaTroopa from './Components/Enemy/KoopaTroopa';
import ParaTroopa from './Components/Enemy/ParaTroopa';
import FireBar from './Components/Enemy/FireBar';
import Axe from './Components/Item/Axe';
import Chain from './Components/Item/Chain';
import KoopaFire from './Components/Enemy/KoopaFire';
import Bowser from './Components/Enemy/Bowser';
import KoopaFireSpawner from './Components/Enemy/KoopaFireSpawner';
import Brick from './Components/Item/Brick';
import Coin from './Components/Item/Coin';
import Elevator from './Components/Scenario/Elevator';
import Fireball from './Components/Item/Fireball';
import Flower from './Components/Item/Flower';
import Mushroom from './Components/Item/Mushroom';
import Pipe from './Components/Item/Pipe';
import PiranhaPlant from './Components/Enemy/PiranhaPlant';
import Question from './Components/Item/Question';
import Star from './Components/Item/Star';
import Pole from './Components/Scenario/Pole';
import Lava from './Components/Scenario/Lava';
import Block from './Components/Scenario/Block';
import Bridge from './Components/Scenario/Bridge';
import Floor from './Components/Scenario/Floor';
import FloatingPlatform from './Components/Scenario/FloatingPlatform';

import CollidableFactoryBase from '~/engine/src/CollidableFactoryBase';

// every class that needs its own behaviour on top of a plain Collidable,
// keyed by its own static tagName - add a new one here and nothing else
const collidables = new Map(
	[Question, Brick, Goomba, KoopaTroopa, ParaTroopa, PiranhaPlant, FireBar, Bowser, Axe, Chain, KoopaFire, KoopaFireSpawner, Mushroom, Coin, Flower, Fireball, Pipe, Pole, Elevator, Star, Lava, Block, Bridge, Floor, FloatingPlatform].map((Component) => [Component.tagName, Component])
);

class CollidableFactory extends CollidableFactoryBase {
	constructor() {
		super();
	}

	from(tag) {
		// tagName is always uppercase for custom elements (DOM spec) -
		// compare against the lowercased form, not the literal tag name
		const Component = collidables.get(tag.tagName.toLowerCase());
		if (Component) return new Component(tag);
		return super.from(tag);
	}
}

export { CollidableFactory as default };
