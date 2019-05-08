import KoopaTroopaShell from './Enemy/KoopaTroopaShell';
import KoopaTroopa from './Enemy/KoopaTroopa';

import Question from './Item/Question';
import Rotation from './Item/Rotation';
import Switch from './Item/Switch';

import CollidableFactoryBase from '~/engine/CollidableFactoryBase';

class CollidableFactory extends CollidableFactoryBase{
	constructor(){
		super();
	}

	from(tag){
		if(tag.classList.contains('KoopaTroopaShell')){
			return new KoopaTroopaShell(tag);
		}
		if(tag.classList.contains('KoopaTroopa')){
			return new KoopaTroopa(tag);
		}
		if(tag.classList.contains('Question')){
			return new Question(tag);
		}
		if(tag.classList.contains('Plate')){
			return new Rotation(tag);
		}
		if(tag.classList.contains('Switch')){
			return new Switch(tag);
		}
		return super.from(tag);
	}
}

export {CollidableFactory as default};
