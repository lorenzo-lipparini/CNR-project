
import { Animatable, HarmonicAnimation } from '../lib/animation.js';

import Plane2D from './Plane2D.js';


/**
 * Class that makes it easy to draw the graph of a function, to be used in combination with Plane2D.
 */
export default class Graph extends Animatable {

  public interval: [number, number];
  private step: number;


  /**
   * @param f The function to plot
   * @param interval Array containing the two endpoints of the interval to show
   * @param step Determines the precision of the graph
   */
  public constructor(f: (x: number) => number, interval: [number, number], step?: number);
  /**
   * @param f The function to plot
   * @param plane The plane where the graph will be draw, the graph will cover the visible portion of the x-axis
   * @param step Determines the precision of the graph
   */
  public constructor(f: (x: number) => number, plane: Plane2D, step?: number);
  public constructor(private f: (x: number) => number, intervalOrPlane: [number, number] | Plane2D, step?: number) {
    super();

    if (intervalOrPlane instanceof Plane2D) {
      const { minX, maxX } = intervalOrPlane.minMaxValues;
      this.interval = [minX, maxX];
    } else {
      this.interval = intervalOrPlane;
    }

    // Choose a small step compared to the interval
    this.step = step || (this.interval[1] - this.interval[0]) / 1000;
  }

  /**
   * Plays an animation where the curve is gradually drawn on the plane.
   * 
   * @param origin Point on the interval where the curve starts to be drawn
   */
  public drawFrom(origin: 'left' | 'right' | 'center'): Promise<void> {
    const initialInterval: [number, number] =
      (origin === 'left')  ? [this.interval[0], this.interval[0]] :
      (origin === 'right') ? [this.interval[1], this.interval[1]] :
      [(this.interval[0] + this.interval[1]) / 2, (this.interval[0] + this.interval[1]) / 2];

    return this.animate(new HarmonicAnimation<Graph, 'interval'>('interval', 2, initialInterval, this.interval));
  }

  /**
   * Draws the graph of the function on the plane,
   * discontinuities of the graph generate vertical lines.
   */
  public show(): void {
    this.updateAnimations();

    noFill();
    strokeWeight(0.01);
    stroke(255, 255, 255);


    beginShape();

    for (let x = this.interval[0]; x <= this.interval[1]; x += this.step) {
      vertex(x, this.f(x));
    }
    // Always include the endpoints, so that animations look smoother
    vertex(this.interval[1], this.f(this.interval[1]));

    endShape();
  }


}
