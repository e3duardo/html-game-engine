import Collidable from '~/engine/Collidable';
import Inject from '~/engine/Inject';
import {boundMethod} from 'autobind-decorator'

class Switch extends Collidable{
	constructor(tag) {
		super(tag);
		this.updatable = true;
		this.type = 'item';
	}
}

export {Switch as default};
