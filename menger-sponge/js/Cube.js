'use strict'

class Cube {

  constructor(pos, side) {
    this.pos = pos;
    this.side = side;
  }

  show() {
    translate(this.pos.x, this.pos.y, this.pos.z);
    
    box(this.side);
    
    translate(-this.pos.x, -this.pos.y, -this.pos.z);
  }

}