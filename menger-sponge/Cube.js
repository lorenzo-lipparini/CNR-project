
import { Animatable } from '/lib/animation.js';
import '/p5.js';


export default class Cube extends Animatable {

  constructor(pos, side, color) {
    super();

    this.pos = pos;
    this.side = side;
    this.color = color;

    // Keeps track of the ongoing animations
    this._animations = [];
  }

  show() {
    // Let the animations change the aspect of the cube before it is drawn
    this._updateAnimations();

    translate(this.pos.x, this.pos.y, this.pos.z);

    ambientMaterial(this.color);
    box(this.side);
    
    translate(-this.pos.x, -this.pos.y, -this.pos.z);
  }

}
