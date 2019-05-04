import TurtleShell from './Enemy/TurtleShell';
import Turtle from './Enemy/Turtle';
import CollidableFactoryBase from '~/engine/CollidableFactoryBase';

class CollidableFactory extends CollidableFactoryBase{
	constructor(game){
		super(game);
	}

	from(tag){
		if(tag.classList.contains('TurtleShell')){
			return new TurtleShell(this.game, tag);
		}
		if(tag.classList.contains('Turtle')){
			return new Turtle(this.game, tag);
		}
		return super.from(tag);
	}
}

export {CollidableFactory as default};
