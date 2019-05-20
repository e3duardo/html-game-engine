import Collidable from './Collidable';

import {boundMethod} from 'autobind-decorator'

class CollidableFactoryBase {
	constructor(){
	}

	@boundMethod
	from(tag){
		return new Collidable(tag);
	}
}

export {CollidableFactoryBase as default};
