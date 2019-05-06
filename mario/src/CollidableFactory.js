import KoopaTroopaShell from './Enemy/KoopaTroopaShell';
import KoopaTroopa from './Enemy/KoopaTroopa';

import Question from './Item/Question';

import CollidableFactoryBase from '~/engine/CollidableFactoryBase';

class CollidableFactory extends CollidableFactoryBase{
	constructor(){
		super();
	}

	from(tag){
		if(tag.classList.contains('TurtleShell')){
			return new KoopaTroopaShell(tag);
		}
		if(tag.classList.contains('Turtle')){
			return new KoopaTroopa(tag);
		}
		if(tag.classList.contains('Question')){
			return new Question(tag);
		}
		return super.from(tag);
	}
}

export {CollidableFactory as default};
