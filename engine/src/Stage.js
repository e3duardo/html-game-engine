class Stage {
	constructor() {
		this.tag = document.querySelector('.Stage');
	}

	get width (){ return this.tag.clientWidth; }
	get height (){ return this.tag.clientHeight; }
}
export default Stage;