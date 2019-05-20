import Collidable from '~/engine/src/Collidable';
// import Inject from '~/engine/src/Inject';
// import {boundMethod} from 'autobind-decorator'

class Switch extends Collidable{
	constructor(tag) {
		super(tag);
		this.updatable = true;
		this.type = 'item';
	}
}

export {Switch as default};
