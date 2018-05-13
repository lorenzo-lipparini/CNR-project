
import { Animatable, LinearAnimation, HarmonicAnimation } from '../lib/animation.js';

// All the values related to the arrows are measured in units of the complex plane
// Use scale() before the arrows are drawn to obtain a sensible output

/**
 * Represents an arrow which can be drawn onto the canvas.
 */
export default class Arrow extends Animatable {

  static instances: Arrow[] = [];
  

  public alpha = 255;
  
  // Properties used in angle animations
  public drawnAnglePercent = 0;
  public drawnAngleAlpha = 0;


  /**
   * @param color The color of the arrow, in the form [R, G, B]
   * @param head The end point of the arrow
   * @param tail The starting point of the arrow, [0, 0] by default
   */
  public constructor(public color: number[], public head: number[], public tail: number[] = [0, 0]) {
    super();

    Arrow.instances.push(this);
  }

  /**
   * The angle between the arrow and the x-axis.
   */
  public get angle(): number {
    return Math.atan2(this.head[1] - this.tail[1], this.head[0] - this.tail[0]);
  }
  public set angle(value: number) {
    const l = this.length;

    this.head = [
      this.tail[0] + l * Math.cos(value),
      this.tail[1] + l * Math.sin(value)
    ];
  }

  /**
   * The distance between the head and the tail of the arrow.
   */
  public get length(): number {
    return Math.hypot(this.head[0] - this.tail[0], this.head[1] - this.tail[1]);
  }

  /**
   * Plays an animation which smoothly changes the length of the arrow by moving its head
   * without changing its tail or its direction.
   * 
   * @param newLength The length that the arrow will have at the end of the animation
   */
  public changeLength(newLength: number): Promise<void> {
    const oldLength = this.length;

    // Act directly on the components of the arrow, using a proportion
    return this.animate(new HarmonicAnimation<Arrow, 'head'>('head', 1, [
      this.tail[0] + newLength/oldLength * (this.head[0] - this.tail[0]),
      this.tail[1] + newLength/oldLength * (this.head[1] - this.tail[1])
    ]));
  }

  /**
   * Plays an animation which smoothly changes the angle between the arrow and the x-axis
   * while keeping its tail fixed.
   * 
   * @param newAngle The angle between the arrow and the x-axis at the end of the animation
   */
  public changeAngle(newAngle: number): Promise<void> {
    return this.animate(new HarmonicAnimation<Arrow, 'angle'>('angle', 2, newAngle));
  }

  public show(): void {

    // Change this value to choose the size of the tips of the arrows
    const tipHeight = 0.05;

    this.updateAnimations();

    // Remember that performance is not the priority since just a few arrows will be shown simultaneously
    const showColor = color(this.color[0], this.color[1], this.color[2], this.alpha);


    // Body of the arrow

    strokeCap(SQUARE);
    stroke(showColor);
    strokeWeight(0.01);

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


    // Angle between the arrow and the x-axis

    // Change this value to choose the size of the arc which displays the angle
    const angleRadius = 0.2;

    strokeWeight(0.005);
    stroke(255, 255, 255, this.drawnAngleAlpha);
    noFill();

    if (this.angle >= 0) {
      arc(this.tail[0], this.tail[1], angleRadius, angleRadius, 0, this.drawnAnglePercent * this.angle);
    } else {
      // Draw negative angles in clockwise direction
      arc(this.tail[0], this.tail[1], angleRadius, angleRadius, this.drawnAnglePercent * this.angle, 0)
    }

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
   * Plays an animation where two arrows are 'added' as vectors,
   * at the end the current arrow will equal the result of the sum;
   * The two arrows which are 'added' must have the same tail.
   * 
   * @param arrow The arrow to 'add' to the current one
   * @param resultColor The color that the arrow will have after the addition
   */
  public async add(arrow: Arrow, resultColor = this.color): Promise<void> {
    const addend1 = this.copy();
    const addend2 = arrow.copy();

    // Since the current arrow should take the value of the sum at then end, use it to represent the sum during the animation
    
    this.alpha = 0;
    this.color = resultColor;

    await addend2.moveTo(addend1.head);
    this.head = addend2.head;
    this.tail = addend1.tail;

    addend1.fadeOut();
    addend2.fadeOut();
    await this.fadeIn();

    addend1.delete();
    addend2.delete();
  }

  /**
   * Moves the arrow to a new position, whithout changing its length or its direction.
   * 
   * @param targetTail The point where the tail of the arrow will sit at the end of the animation
   */
  public moveTo(targetTail: number[]): Promise<void> {
    const targetHead = [
      this.head[0] + (targetTail[0] - this.tail[0]),
      this.head[1] + (targetTail[1] - this.tail[1])
    ];

    return this.animate(new HarmonicAnimation<Arrow, 'tail'>('tail', 2, targetTail)
              .parallel(new HarmonicAnimation<Arrow, 'head'>('head', 2, targetHead)));
  }

  /**
   * Displays on the screen an arc which represents the angle between the arrow and the x-axis.
   */
  public showAngle(): Promise<void> {
    // Using a percentage instead of an absolute angle value makes the arc respond to later changes in the value of the angle
    return this.animate(new HarmonicAnimation<Arrow, 'drawnAnglePercent'>('drawnAnglePercent', 1, 0, 1)
              .parallel(new LinearAnimation<Arrow, 'drawnAngleAlpha'>('drawnAngleAlpha', 1, 0, 255)));
  }

  /**
   * Creates a copy of the arrow;
   * the animations will only continue to play on the original arrow.
   */
  public copy(): Arrow {
    const copy = new Arrow(this.color.slice(), this.head.slice(), this.tail.slice());
    copy.alpha = this.alpha;

    return copy;
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
