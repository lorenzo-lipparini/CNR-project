
import { Animatable, HarmonicAnimation } from '../lib/animation.js';


/**
 * Represents a line with the given end points and some style.
 */
export default class Line extends Animatable {

  public static defaultStyle = {
    rgb: [0, 0, 0],
    alpha: 255,
    strokeWeight: 2
  };

  public start: [number, number];
  public end: [number, number];

  public style = Line.defaultStyle;
  

  /**
   * @param startX X-coordinate of the start point of the line 
   * @param startY Y-coordinate of the start point of the line 
   * @param endX X-coordinate of the endpoint of the line 
   * @param endY Y-coordinate of the endpoint of the line 
   */
  public constructor(startX: number, startY: number, endX: number, endY: number) {
    super();
    
    this.start = [startX, startY];
    this.end = [endX, endY];
  }

  /**
   * Draws the line on the screen.
   */
  public show(): void {
    strokeWeight(this.style.strokeWeight);
    stroke(this.style.rgb[0], this.style.rgb[1], this.style.rgb[2], this.style.alpha);

    line(this.start[0], this.start[1], this.end[0], this.end[1]);
  }

}
