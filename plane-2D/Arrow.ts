
import { Animatable, LinearAnimation, HarmonicAnimation } from '../lib/animation.js';

import Plane2D from './Plane2D.js';


/**
 * Represents an arrow which can be drawn onto the canvas.
 */
export default class Arrow extends Animatable {

  /**
   * The arrows generated during animations, which should be drawn whenever this arrow is shown.
   */
  private animationArrows: Arrow[] = [];

  public alpha = 255;

  public drawFromTailProgress = 1;
  
  // Properties used in angle animations
  public drawnAngleFraction = 0; // Fraction of the angle displayed on the screen (see showAngle())
  public drawnAngleAlphaRatio = 0; // Ratio between the alpha of the angle and the alpha of the arrow


  /**
   * @param color The color of the arrow, in the form [R, G, B]
   * @param head The end point of the arrow
   * @param tail The starting point of the arrow, [0, 0] by default
   */
  public constructor(private plane: Plane2D, public color: number[], public head: number[], public tail: number[] = [0, 0]) {
    super();
  }

  /**
   * The angle between the arrow and the x-axis.
   */
  public get angle(): number {
    let angle = Math.atan2(this.head[1] - this.tail[1], this.head[0] - this.tail[0]);
    
    // Always return a positive value
    if (angle <= 0) {
      angle += 2 * Math.PI;
    }

    return angle;
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
    this.updateAnimations();

    push();

    // Calculate the position of the head of the arrow during drawFromTail() animations
    const currentHead = [
      this.tail[0] + (this.head[0] - this.tail[0]) * this.drawFromTailProgress,
      this.tail[1] + (this.head[1] - this.tail[1]) * this.drawFromTailProgress
    ];

    // Change this value to choose the size of the tips of the arrows
    const tipHeight = this.drawFromTailProgress * 20 * this.plane.pixelLength;

    // Remember that performance is not the priority since just a few arrows will be shown simultaneously
    const showColor = color(this.color[0], this.color[1], this.color[2], this.alpha);

    // Body of the arrow

    strokeCap(SQUARE);
    stroke(showColor);
    strokeWeight(5 * this.plane.pixelLength);

    line(this.tail[0], this.tail[1], currentHead[0] - tipHeight * Math.cos(this.angle), currentHead[1] - tipHeight * Math.sin(this.angle));


    // Tip of the arrow

    noStroke();
    fill(showColor);

    translate(currentHead[0], currentHead[1]);
    
    const tipSize = tipHeight / Math.cos(Math.PI/6);
    triangle(
      0, 0,
      tipSize * Math.cos(this.angle + 5/6 * Math.PI), tipSize * Math.sin(this.angle + 5/6 * Math.PI),
      tipSize * Math.cos(this.angle - 5/6 * Math.PI), tipSize * Math.sin(this.angle - 5/6 * Math.PI)
    );

    translate(-currentHead[0], -currentHead[1]);


    // Angle between the arrow and the x-axis

    // Change this value to choose the size of the arc which displays the angle
    const angleRadius = 0.2;

    strokeWeight(2 * this.plane.pixelLength);
    // Set the alpha of the angle, which is never bigger than that of the arrow
    stroke(this.color[0], this.color[1], this.color[2], this.drawnAngleAlphaRatio * this.alpha);
    noFill();

    arc(this.tail[0], this.tail[1], angleRadius, angleRadius, 0, this.drawnAngleFraction * this.angle);

    // Show all the arrows generated during animations
    for (const arrow of this.animationArrows) {
      arrow.show();
    }

    pop();

  }

  /**
   * Plays an animation where the arrow starts collapsed onto its tail and then stretches towards the head.
   */
  public drawFromTail(): Promise<void> {
    return this.animate(new HarmonicAnimation<Arrow, 'drawFromTailProgress'>('drawFromTailProgress', 2, 0, 1));
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

    this.animationArrows.push(addend1, addend2);

    // Since the current arrow should take the value of the sum at then end, use it to represent the sum during the animation
    
    this.alpha = 0;
    this.color = resultColor;

    await addend2.moveTo(addend1.head);
    this.head = addend2.head;
    this.tail = addend1.tail;

    this.alpha = 255;
    await this.drawFromTail();

    addend1.fadeOut();
    await addend2.fadeOut();

    this.animationArrows = [];
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
    this.drawnAngleAlphaRatio = 1; // Make sure that the angle will be shown

    // Gradually draw the arc from the x-axis to the the arrow
    // Using a percentage instead of an absolute angle value makes the arc respond to later changes in the value of the angle
    return this.animate(new HarmonicAnimation<Arrow, 'drawnAngleFraction'>('drawnAngleFraction', 1, 0, 1));
  }

  /**
   * Fades out the representation of the angle.
   */
  public hideAngle(): Promise<void> {
    return this.animate(new LinearAnimation<Arrow, 'drawnAngleAlphaRatio'>('drawnAngleAlphaRatio', 1, 0));
  }

  /**
   * Creates a copy of the arrow;
   * the animations will only continue to play on the original arrow.
   */
  public copy(): Arrow {
    const copy = new Arrow(this.plane, this.color.slice(), this.head.slice(), this.tail.slice());
    copy.alpha = this.alpha;
    copy.drawnAngleFraction = this.drawnAngleFraction;
    copy.drawnAngleAlphaRatio = this.drawnAngleAlphaRatio;

    return copy;
  }

}
