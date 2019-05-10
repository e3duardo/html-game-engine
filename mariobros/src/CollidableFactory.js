import Mario from './Components/Actor/Mario';

import Goomba from './Components/Enemy/Goomba';
import KoopaTropa from './Components/Enemy/KoopaTropa';

import Brick from './Components/Item/Brick';
import Flag from './Components/Item/Flag';
import Pipe from './Components/Item/Pipe';
import Question from './Components/Item/Question';

import Block from './Components/Scenario/Block';
import Castle from './Components/Scenario/Castle';
import Cloud from './Components/Scenario/Cloud';
import Montain from './Components/Scenario/Montain';
import Pole from './Components/Scenario/Pole';
import Stuff from './Components/Scenario/Stuff';

import CollidableFactoryBase from '~/engine/CollidableFactoryBase';

class CollidableFactory extends CollidableFactoryBase{
	constructor(){
		super();
	}

	from(tag){
		console.warn(tag);
		if(tag.tagName == 'item-question'){
			return new Question(tag);
		}
		return super.from(tag);
	}
}

export {CollidableFactory as default};
