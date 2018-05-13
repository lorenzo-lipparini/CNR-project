
import { Animatable, LinearAnimation } from '../lib/animation.js';


/**
 * Represents an arrow which can be drawn onto the canvas.
 */
export default class Arrow extends Animatable {

  static instances: Arrow[] = [];
  

  public alpha = 255;


  /**
   * @param color The color of the arrow
   * @param head The end point of the arrow
   * @param tail The starting point of the arrow, [0, 0] by default
   */
  public constructor(public color: [number, number, number], public head: [number, number], public tail: [number, number] = [0, 0]) {
    super();

    Arrow.instances.push(this);
  }

  /**
   * Returns the angle between the arrow and the x-axis.
   */
  public get angle(): number {
    return Math.atan2(this.head[1] - this.tail[1], this.head[0] - this.tail[0]);
  }

  public show(): void {
    // Change this value to choose the size of the tips of the arrows
    const tipHeight = 15;

    this.updateAnimations();

    // Remember that performance is not the priority since just a few arrows will be shown simultaneously
    const showColor = color(this.color[0], this.color[1], this.color[2], this.alpha);


    // Body of the arrow

    strokeCap(SQUARE);
    stroke(showColor);
    strokeWeight(3);

    line(this.tail[0], this.tail[1], this.head[0] - tipHeight * Math.cos(this.angle), this.head[1] - tipHeight * Math.sin(this.angle));


    // Tip of the arrow

    noStroke();
    fill(showColor);

    translate(this.head[0], this.head[1]);
    
    const tipSize = tipHeight / Math.cos(Math.PI/6);
    triangle(
      0, 0,
      tipSize * Math.cos(this.angle + 5/6 * Math.PI), tipSize * Math.sin(this.angle + 5/6 * Math.PI),
      tipSize * Math.cos(this.angle - 5/6 * Math.PI), tipSize * Math.sin(this.angle - 5/6 * Math.PI)
    );

    translate(-this.head[0], -this.head[1]);
  }

  /**
   * Smoothly brings the transparency of the arrow to the maximum value.
   */
  public fadeIn(): Promise<void> {
    return this.animate(new LinearAnimation<Arrow, 'alpha'>('alpha', 2, 255));
  }

  /**
   * Smoothly brings the transparency of the arrow to 0.
   */
  public fadeOut(): Promise<void> {
    return this.animate(new LinearAnimation<Arrow, 'alpha'>('alpha', 2, 0));
  }

  /**
   * After this method is called, the arrow won't be drawn in Arrow.showAll() anymore.
   */
  public delete(): void {
    Arrow.instances.splice(Arrow.instances.indexOf(this), 1);
  }


  /**
   * Draws all the arrows ever created onto the canvas, these include the arrows generated for the animations.
   */
  static showAll(): void {
    for (const instance of Arrow.instances) {
      instance.show();
    }
  }

}
