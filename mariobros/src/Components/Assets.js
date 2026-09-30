import enemies from '../../assets/enemies.png';
import floor from '../../assets/floor.png';
import items from '../../assets/items.png';
import mario from '../../assets/mario.png';
import tileset from '../../assets/tileset.png';

class Assets {
	constructor() {
		this.enemies = enemies;
		this.floor = floor;
		this.items = items;
		this.mario = mario;
		this.tileset = tileset;
	}
}

export default new Assets();
