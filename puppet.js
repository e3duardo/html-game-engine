class Puppet {
  constructor() {
	 this.tag = document.querySelector('.Puppet');
  }

	colide = (previewX, previewY)=>{
		const collidables = document.querySelectorAll('.collidable');

		for (var i = 0; i < collidables.length; i++) {
			const collidable = collidables[i];

			//console.log(previewY, this.tag.clientHeight+this.tag.offsetTop+previewY > collidable.offsetTop, this.tag.clientHeight+this.tag.offsetTop+previewY, collidable.offsetTop)
			const colideTop = this.tag.clientHeight+this.tag.offsetTop+previewY > collidable.offsetTop;
			const colideLeft = this.tag.offsetLeft+this.tag.clientWidth+previewX > collidable.offsetLeft;
			const colideRight = this.tag.offsetLeft+previewX < collidable.offsetLeft+collidable.clientWidth;

			if(colideTop && colideLeft && colideRight){
				return true
			}
		}

		return false;
	}

  gravity = ()=>{
	if(gravitySpeed<0 || !this.colide(0, speedY+gravitySpeed)){
		gravitySpeed += gravity;
		this.tag.style.top = (this.tag.offsetTop + (speedY+gravitySpeed)) + 'px';
	}
  }

  goAhead = ()=>{
		if(!this.colide(speedX, 0)){
			this.tag.style.left = (this.tag.offsetLeft + speedX) + 'px';
			if(this.tag.offsetLeft>100){
				scene.style.left = (scene.offsetLeft - speedX) + 'px';
			}
		}
  }
  goBack = ()=>{
	  console.log()
	  if(!this.colide(-speedX, 0)  && (this.tag.offsetLeft - speedX)>0 && this.tag.offsetLeft > -(scene.offsetLeft) ){
		  this.tag.style.left = (this.tag.offsetLeft - speedX) + 'px';
	  }
  }
  jump = ()=>{
	  console.log(gravitySpeed);
	  gravitySpeed = -20;
	  //gravity = 0;
	  // if(this.colide(0, scale)){
		//   this.tag.style.top = (this.tag.offsetTop - (scale*10)) + 'px';
	  // }
  }
}
