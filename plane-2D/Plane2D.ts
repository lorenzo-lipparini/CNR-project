
import timer from '../lib/timer.js';
import { Animatable, ExponentialAnimation } from '../lib/animation.js';

import Line, { LineStyle } from './Line.js';


/**
 * Class that takes care of the transformation of coordinates from the 2D plane to the displayed canvas,
 * as well as the visual representation of the plane itself. 
 */
export default class Plane2D extends Animatable {

  private _unitLength!: number;

  /**
   * Gives a unit of length on the plane which always corresponds to one pixel on the screen;
   * This may be used for any kind of measure which shouldn't depend on the zoom level (such as stroke weight).
   */
  public pixelLength!: number;

  private gridLineStyle!: LineStyle;

  private gridLines!: {
    horizontals: Line[],
    verticals: Line[]
  };

  /**
   * @param unitLength Distance in pixels between two points which are 1 unit apart on the plane
   * @param origin The point on the canvas where the two axes intercept
   */
  public constructor(unitLength: number, private origin = [width / 2, height / 2]) {
    super();

    // The unitLength setter will give a value to all the instance fields
    this.unitLength = unitLength;
  }

  get unitLength(): number {
    return this._unitLength;
  }
  set unitLength(value: number) {
    // Prevent useless computation
    if (value === this._unitLength) {
      return;
    }

    this._unitLength = value;

    // Recalculate the pixelLength so that it always compensates the transformations of applyScale()
    this.pixelLength = 1 / this.unitLength;


    // Since the pixelLength has changed, gridLineStyle needs to be updated
    this.gridLineStyle = {
      rgb: [255, 255, 255],
      alpha: 25,
      strokeWeight: 2 * this.pixelLength
    };


    // Get rid of the previous lines
    this.gridLines = {
      horizontals: [],
      verticals: []
    };

    // Create the new lines which compose the grid

    const { minX, maxX, minY, maxY } = this.minMaxValues;

    // The maximum distance of any point on the axes from the origin
    const maxValue = Math.max(Math.abs(minX), Math.abs(maxX), Math.abs(minY), Math.abs(maxY));

    // Create the grid lines in pairs to make them easier to animate
    for (let n = 1; n <= maxValue; n++) {
      this.gridLines.horizontals.push(new Line(minX, n, maxX, n, this.gridLineStyle));
      this.gridLines.horizontals.push(new Line(minX, -n, maxX, -n, this.gridLineStyle));
      this.gridLines.verticals.push(new Line(n, minY, n, maxY, this.gridLineStyle));
      this.gridLines.verticals.push(new Line(-n, minY, -n, maxY, this.gridLineStyle));
    }

  }

  /**
   * Returns an object containing the maximum and minimum coordinates which fit on the screen.
   */
  public get minMaxValues() {
    return {
      minX: -this.origin[0]           / this.unitLength,
      maxX: (width - this.origin[0])  / this.unitLength,
      minY: (this.origin[1] - height) / this.unitLength,
      maxY: this.origin[1]            / this.unitLength,
    };
  }

  /**
   * Required to correctly map points on the plane to points on the canvas, according to the unit length;
   * To be called in draw() after setting the background.
   */
  public applyScale(): void {
    translate(this.origin[0], this.origin[1]);
    scale(this.unitLength, -this.unitLength);
  }

  /**
   * Draws the x and y axes on the canvas.
   */
  public showAxes(): void {
    this.updateAnimations();

    strokeWeight(2 * this.pixelLength);
    stroke(255, 255, 255, 100);

    const { minX, maxX, minY, maxY } = this.minMaxValues;

    // X-axis
    line(minX, 0, maxX, 0);
    // Y-axis
    line(0, minY, 0, maxY);
    

    const tickLength = 10 * this.pixelLength;

    // Foreach integer value n visible on the x-axis
    for (let n = Math.ceil(minX); n <= Math.floor(maxX); n++) {
      if (n !== 0) {
        line(n, -tickLength/2, n, tickLength/2);
      }
    }
    // Foreach integer value n visible on the y-axis
    for (let n = Math.ceil(minY); n <= Math.floor(maxY); n++) {
      if (n !== 0) {
        line(-tickLength/2, n, tickLength/2, n);
      }
    }

    for (const line of this.gridLines.horizontals.concat(this.gridLines.verticals)) {
      line.show();
    }

  }

  /**
   * Sets the alpha value of all the lines which are part of the grid.
   * 
   * @param value Alpha value to set
   */
  public setGridAlpha(value: number): void {
    for (const line of this.gridLines.horizontals.concat(this.gridLines.verticals)) {
      line.style.alpha = value;
    }
  }

  /**
   * Plays an animation where the grid lines arise from the axes in couples.
   */
  public async makeGridAppear(): Promise<void> {
    
    const makeLinesAppear = async (lines: Line[]) => {
      for (let i = 0; i < lines.length; i += 2) {
        lines[i].style.alpha = this.gridLineStyle.alpha;
        lines[i].stretchFromMiddle(0.5);

        lines[i + 1].style.alpha = this.gridLineStyle.alpha;
        lines[i + 1].stretchFromMiddle(0.5);

        await timer(0.3);
      }
    };

    makeLinesAppear(this.gridLines.horizontals);
    await timer(0.8);
    await makeLinesAppear(this.gridLines.verticals);
  }

  /**
   * Plays an animation where the unitLength is smoothly changed by the given factor.
   * 
   * @param duration Duration in seconds of the animation
   * @param factor Factor by which the unitLength is multiplied
   */
  public zoom(duration: number, factor: number): Promise<void> {
    return this.animate(new ExponentialAnimation<Plane2D, 'unitLength'>('unitLength', duration, factor * this.unitLength).harmonize());
  }

}
