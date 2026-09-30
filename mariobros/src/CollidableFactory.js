// import Mario from './Components/Actor/Mario';

import Goomba from './Components/Enemy/Goomba';
import KoopaTropa from './Components/Enemy/KoopaTropa';
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

import CollidableFactoryBase from '~/engine/src/CollidableFactoryBase';

class CollidableFactory extends CollidableFactoryBase {
	constructor() {
		super();
	}

	from(tag) {
		// tagName is always uppercase for custom elements (DOM spec) -
		// compare against the lowercased form, not the literal tag name
		const tagName = tag.tagName.toLowerCase();
		if (tagName == 'item-question') {
			return new Question(tag);
		}
		if (tagName == 'item-brick') {
			return new Brick(tag);
		}
		if (tagName == 'enemy-goomba') {
			return new Goomba(tag);
		}
		if (tagName == 'enemy-koopa-tropa') {
			return new KoopaTropa(tag);
		}
		if (tagName == 'enemy-piranha-plant') {
			return new PiranhaPlant(tag);
		}
		if (tagName == 'item-mushroom') {
			return new Mushroom(tag);
		}
		if (tagName == 'item-coin') {
			return new Coin(tag);
		}
		if (tagName == 'item-flower') {
			return new Flower(tag);
		}
		if (tagName == 'item-fireball') {
			return new Fireball(tag);
		}
		if (tagName == 'item-pipe') {
			return new Pipe(tag);
		}
		if (tagName == 'item-pole') {
			return new Pole(tag);
		}
		if (tagName == 'scenario-elevator') {
			return new Elevator(tag);
		}
		if (tagName == 'item-star') {
			return new Star(tag);
		}
		return super.from(tag);
	}
}

export { CollidableFactory as default };
