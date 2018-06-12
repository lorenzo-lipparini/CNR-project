
import { Animatable, HarmonicAnimation } from '../lib/animation.js';

import Plane2D from './Plane2D.js';


/**
 * Class that makes it easy to draw the graph of a function, to be used in combination with Plane2D.
 */
export default class Graph extends Animatable {

  /**
   * True if a drawFrom animation is currently playing.
   */
  private animating: boolean = false;

  /**
   * Stores the currently displayed interval during drawFrom animations.
   */
  public interval: [number, number];


  /**
   * @param plane The plane where the graph will be draw, the graph will cover the visible portion of the x-axis by default
   * @param f The function to plot
   */
  public constructor(public readonly plane: Plane2D, public f: (x: number) => number) {
    super();

    const { minX, maxX } = this.plane.minMaxValues;
    this.interval = [minX, maxX];
  }

  /**
   * Plays an animation where the curve is gradually drawn on the plane.
   * Changing the unitLength of the plane in the middle of this animation leads to undefined behavior.
   * 
   * @param origin Point on the interval where the curve starts to be drawn
   */
  public async drawFrom(origin: 'left' | 'right' | 'center'): Promise<void> {
    const initialInterval: [number, number] =
      (origin === 'left')  ? [this.interval[0], this.interval[0]] :
      (origin === 'right') ? [this.interval[1], this.interval[1]] :
      [(this.interval[0] + this.interval[1]) / 2, (this.interval[0] + this.interval[1]) / 2];

    this.animating = true;
    await this.animate(new HarmonicAnimation<Graph, 'interval'>('interval', 2, initialInterval, this.interval));
    this.animating = false;
  }

  /**
   * Draws the graph of the function on the plane,
   * discontinuities of the function correspond to vertical lines in the graph.
   */
  public show(): void {
    this.updateAnimations();

    noFill();

    strokeWeight(2 * this.plane.pixelLength);
    stroke(255, 255, 255);

    const { minX, maxX } = this.plane.minMaxValues;
    // Choose a small step compared to the visible interval
    const step = (maxX - minX) / 1000;

    // Except while a drawFrom animation is playing,
    // the interval should always correspond to the visible portion of the x-axis
    if (!this.animating) {
      this.interval = [minX, maxX];
    }

    beginShape();

    for (let x = this.interval[0]; x <= this.interval[1]; x += step) {
      vertex(x, this.f(x));
    }
    // Always include the endpoints, so that animations look smoother
    vertex(this.interval[1], this.f(this.interval[1]));

    endShape();
  }

}
