
import { Animatable, HarmonicAnimation } from '../lib/animation.js';


export type LineStyle = {
  rgb: [number, number, number];
  alpha: number;
  strokeWeight: number;
};

/**
 * Represents a line with the given end points and some style.
 */
export default class Line extends Animatable {

  public start: [number, number];
  public end: [number, number];

  public style: LineStyle;
  

  /**
   * @param startX X-coordinate of the start point of the line 
   * @param startY Y-coordinate of the start point of the line 
   * @param endX X-coordinate of the endpoint of the line 
   * @param endY Y-coordinate of the endpoint of the line 
   */
  public constructor(startX: number, startY: number, endX: number, endY: number, style: LineStyle) {
    super();
    
    this.start = [startX, startY];
    this.end = [endX, endY];

    // Manual deep copy
    this.style = {
      rgb: [style.rgb[0], style.rgb[1], style.rgb[2]],
      alpha: style.alpha,
      strokeWeight: style.strokeWeight
    };
  }

  /**
   * Draws the line on the screen.
   */
  public show(): void {
    this.updateAnimations();

    strokeWeight(this.style.strokeWeight);
    stroke(this.style.rgb[0], this.style.rgb[1], this.style.rgb[2], this.style.alpha);

    line(this.start[0], this.start[1], this.end[0], this.end[1]);
  }

  /**
   * Plays an animation where the line starts all collapsed into a single point in the center,
   * and then the two extreme points of the line separate until they get to the right position. 
   */
  public stretchFromMiddle(duration: number): Promise<void> {
    const center: [number, number] = [
      (this.start[0] + this.end[0]) / 2,
      (this.start[1] + this.end[1]) / 2,
    ];

    return this.animate(new HarmonicAnimation<Line, 'start'>('start', duration, center, this.start)
              .parallel(new HarmonicAnimation<Line, 'end'>('end', duration, center, this.end)));
  }

}
