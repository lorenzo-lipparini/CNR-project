
import { Animatable } from '../lib/animation.js';

/**
 * Represents an animatable Cube in the scene.
 */
export default class Cube extends Animatable {

  /**
   * @param pos The 3D point relative to which the cube will be drawn
   * @param side The length of the side of the cube
   * @param color The color passed to ambientMaterial() when drawing the cube
   */
  public constructor(public pos: number[], public side: number, public color: number[]) {
    super();
  }

  public show(): void {
    // Let the animations change the state of the cube before it is drawn
    this.updateAnimations();

    translate(this.pos[0], this.pos[1], this.pos[2]);

    ambientMaterial(this.color);
    box(this.side);
    
    translate(-this.pos[0], -this.pos[1], -this.pos[2]);
  }

}
