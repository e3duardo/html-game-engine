import TurtleShell from './Enemy/TurtleShell';
import Turtle from './Enemy/Turtle';
import Collidable from './Collidable';

class CollidableFactory {
	constructor(){
		throw 'not supposed to be instantiated';
	}
	static from(tag){
		if(tag.classList.contains('TurtleShell')){
			return new TurtleShell(tag);
		}
		if(tag.classList.contains('Turtle')){
			return new Turtle(tag);
		}
		return new Collidable(tag);
	}
}

export {CollidableFactory as default};
