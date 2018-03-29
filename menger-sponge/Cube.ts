
import { Animatable } from '../lib/animation.js';

/**
 * Represents a Cube in the scene which may be animated.
 */
export default class Cube extends Animatable {

  /**
   * @param pos The 3D point relative to which the cube will be drawn
   * @param side The length of the side of the cube
   * @param color The color passed to ambientMaterial() when drawing the cube
   */
  public constructor(public pos: p5.Vector, public side: number, public color: p5.Color) {
    super();
  }

  public show(): void {
    // Let the animations change the state of the cube before it is drawn
    this.updateAnimations();

    translate(this.pos.x, this.pos.y, this.pos.z);

    ambientMaterial(this.color);
    box(this.side);
    
    translate(-this.pos.x, -this.pos.y, -this.pos.z);
  }

}
