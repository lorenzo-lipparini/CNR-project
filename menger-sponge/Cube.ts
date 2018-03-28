
/// <reference path="../p5-typings/p5" />

import { Animatable } from '../lib/animation';


export default class Cube extends Animatable {

  public constructor(public pos: p5.Vector, public side: number, public color: p5.Color) {
    super();
  }

  public show() {
    // Let the animations change the aspect of the cube before it is drawn
    this.updateAnimations();

    translate(this.pos.x, this.pos.y, this.pos.z);

    ambientMaterial(this.color);
    box(this.side);
    
    translate(-this.pos.x, -this.pos.y, -this.pos.z);
  }

}
