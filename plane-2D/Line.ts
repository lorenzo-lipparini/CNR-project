
import { Animatable, HarmonicAnimation } from '../lib/animation.js';

import { ConstantLength } from './Plane2D.js';


// The canvas will become available only after createCanvas() is called, so wa<it for lineDash() to be called to get the context
let ctx: CanvasRenderingContext2D | undefined = undefined;
/**
 * Sets a dashed line pattern for the stroke of the canvas;
 * push() and pop() calls also take into account this property.
 * 
 * @param segments An array describing the pattern to use for the dashed lines
 */
export function lineDash(segments: number[]): void {
  ctx = ctx || document.querySelector('canvas')!.getContext('2d')!;

  ctx.setLineDash(segments);
}

/**
 * Describes the style used to display a line.
 */
export type LineStyle = {
  rgb: [number, number, number];
  alpha: number;
  strokeWeight: number | ConstantLength;
  dash: (number | ConstantLength)[];
};

export namespace LineStyle {

  /**
   * Applies the style of the line using strokeWeight(), stroke(), lineDash().
   * 
   * @param style The style to apply
   */
  export function apply(style: LineStyle) {

    strokeWeight(style.strokeWeight.valueOf());
    stroke(style.rgb[0], style.rgb[1], style.rgb[2], style.alpha);
    lineDash(style.dash.map(x => x.valueOf()));

  }
}


/**
 * Represents a line with the given endpoints and some style.
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
      strokeWeight: style.strokeWeight,
      dash: [...style.dash]
    };
  }

  /**
   * Draws the line on the screen.
   */
  public show(): void {
    this.updateAnimations();

    push();

    LineStyle.apply(this.style);

    line(this.start[0], this.start[1], this.end[0], this.end[1]);

    pop();
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
