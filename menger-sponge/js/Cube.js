'use strict'

class Box {

  constructor(pos, side) {
    this.pos = pos;
    this.side = side;
  }

  show() {
    translate(pos.x, pos.y, pos.z);
    
    box(side);
    
    translate(-pos.x, -pos.y, -pos.z);
  }

}