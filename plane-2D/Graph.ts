
import { Animatable, LinearAnimation, HarmonicAnimation } from '../lib/animation.js';

import Plane2D from './Plane2D.js';
import Line, { LineStyle } from './Line.js';


/**
 * Represents a highlighted point on the plane;
 * Dashed lines parallel to the axes which intercept at the point may also be shown.
 */
class HighlightedPoint extends Animatable {

  public alpha: number = 255;

  public horizontalLine: Line;
  public verticalLine: Line;

  /**
   * @param plane The plane where the point will sit
   * @param x The x-coordinate of the point
   * @param y The y-coordinate of the point
   * @param showLines Decides whether the additional lines are shown or not
   */
  public constructor(private readonly plane: Plane2D, public x: number, public y: number, showLines = false) {
    super();

    const lineStyle: LineStyle = {
      rgb: [255, 255, 255],
      alpha: showLines ? 255 : 0, // Show the lines or not depending on the parameter
      strokeWeight: this.plane.constantLength(5 * this.plane.pixelLength),
      dash: [this.plane.constantLength(10 * this.plane.pixelLength)]
    };

    this.horizontalLine = new Line(0, y, x, y, lineStyle);
    this.verticalLine = new Line(x, 0, x, y, lineStyle);
  }

  public show(): void {
    this.updateAnimations();

    this.verticalLine.show();
    this.horizontalLine.show();

    noStroke();
    fill(255, 255, 255, this.alpha);
    ellipse(this.x, this.y, 15 * this.plane.pixelLength);
  }

  /**
   * Plays an animation where the point fades in while the additional lines are drawn from the axes to the point.
   */
  public appear(): Promise<void> {
    this.horizontalLine.drawFrom('start', 0.5);
    this.verticalLine.drawFrom('start', 0.5);

    return this.animate(new LinearAnimation<HighlightedPoint, 'alpha'>('alpha', 0.5, 0, 255));
  }

  /**
   * Plays an animation where both the point and the additional lines gradually fade out.
   */
  public fadeOut(): Promise<void> {
    this.horizontalLine.fadeOut(1);
    this.verticalLine.fadeOut(1);
    
    return this.animate(new LinearAnimation<HighlightedPoint, 'alpha'>('alpha', 1, 0));
  }

}

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

  private readonly highlightedPoints: HighlightedPoint[] = [];


  /**
   * @param plane The plane where the graph will be draw, the graph will cover the visible portion of the x-axis by default
   * @param f The function to plot
   * @param style The style which describes the stroke of the curve
   */
  public constructor(public readonly plane: Plane2D, public readonly f: (x: number) => number, public style: LineStyle) {
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

    push();

    LineStyle.apply(this.style);
    noFill();

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

    pop();

    for (const point of this.highlightedPoints) {
      point.show();
    }

  }

  /**
   * Plays an animation where a point at the given coordinate on the graph is highlighted;
   * Dashed lines parallel to the axes which intercept at the point can also be shown.
   * 
   * @param x The x-coordinate of the point to highlight
   * @param showLines Decides whether the lines parallel to the axes are shown or not
   */
  public highlightPoint(x: number, showLines: boolean = false): Promise<void> {
    const point = new HighlightedPoint(this.plane, x, this.f(x), showLines);
    this.highlightedPoints.push(point);

    return point.appear();
  }

  /**
   * Plays an animation where all the highlighted points on the graph fade out.
   */
  public removeHighlightedPoints(): Promise<void> {
    let returnPromise = Promise.resolve();

    for (const point of this.highlightedPoints) {
      returnPromise = point.fadeOut();
    }

    return returnPromise;
  }

}
