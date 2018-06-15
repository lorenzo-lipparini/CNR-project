
import timer from '../lib/timer.js';
import { Animatable, ExponentialAnimation, animate, updateAnimations, LinearAnimation } from '../lib/animation.js';

import Line, { LineStyle } from './Line.js';


/**
 * Class that takes care of the transformation of coordinates from the 2D plane to the displayed canvas,
 * as well as the visual representation of the plane itself. 
 */
export default class Plane2D extends Animatable {

  /**
   * The x and y axes of the plane;
   * This is an object which can be added to the scene.
   */
  public xyAxes: XYAxes;

  /**
   * A grid of orthogonal lines which intercept at points on the plane with integer coordinates;
   * This is an object which can be added to the scene.
   */
  public grid: Grid;

  /**
   * @param unitLength Distance in pixels between two points which are 1 unit apart on the plane
   * @param origin The point on the canvas where the two axes intercept
   */
  public constructor(public unitLength: number, private origin = [width / 2, height / 2]) {
    super();

    this.xyAxes = new XYAxes(this, {
      rgb: [255, 255, 255],
      alpha: 100,
      strokeWeight: this.constantLength(5 * this.pixelLength),
      dash: []
    });

    this.grid = new Grid(this, {
      rgb: [255, 255, 255],
      alpha: 25,
      strokeWeight: this.constantLength(5 * this.pixelLength),
      dash: [this.constantLength(10 * this.pixelLength)]
    });
  }

  /**
   * Gives a unit of length on the plane which always corresponds to one pixel on the screen;
   * This may be used for small measures which shouldn't depend on the resolution (such as stroke weight).
   */
  public get pixelLength(): number {
    return 1 / this.unitLength;
  }

  /**
   * An object containing the minimum and maximum coordinates which fit on the screen.
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
   * Required to correctly map points on the plane to points on the canvas according to the unit length;
   * To be called in draw() after setting the background.
   */
  public applyScale(): void {
    this.updateAnimations();

    translate(this.origin[0], this.origin[1]);
    scale(this.unitLength, -this.unitLength);
  }

  /**
   * Plays an animation where the unitLength is smoothly changed by the given factor.
   * 
   * @param duration Duration in seconds of the animation
   * @param factor Factor by which the unitLength is multiplied
   */
  public async zoom(duration: number, factor: number): Promise<void> {
    const { minX, maxX, minY, maxY } = this.minMaxValues;
    const newMinMaxValues = {
      minX: minX / factor,
      maxX: maxX / factor,
      minY: minY / factor,
      maxY: maxY / factor
    };

    // If this is a zoom out, extend the grid before playing the animation
    if (factor < 1) {
      this.grid.fitArea(newMinMaxValues);
    }

    await this.animate(new ExponentialAnimation<Plane2D, 'unitLength'>('unitLength', duration, factor * this.unitLength).harmonize());
  
    // If this is a zoom in, shrink the grid as soon as the animation ends
    if (factor > 1) {
      this.grid.fitArea(this.minMaxValues);
    }
  }

  /**
   * Creates a ConstantLength wrapper around the value which makes it compensate the changes to the scale
   * so that the resulting length on the screen does not change.
   * This is especially useful to define stroke weight and line dash values.
   */
  public constantLength(value: number): ConstantLength {
    return new ConstantLength(this, value);
  }

}


/**
 * Represents the x and y axes of a 2D plane.
 */
class XYAxes {

  public constructor(private readonly plane: Plane2D, public style: LineStyle) { }

  public show(): void {
    push();

    LineStyle.apply(this.style);

    const { minX, maxX, minY, maxY } = this.plane.minMaxValues;

    // X-axis
    line(minX, 0, maxX, 0);
    // Y-axis
    line(0, minY, 0, maxY);

    const tickLength = 15 * this.plane.pixelLength;

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

    pop();
  }

}


/**
 * Represents a unit grid on a 2D plane.
 */
class Grid {

  /**
   * The lines that compose the grid.
   */
  private lines: {
    horizontals: Line[],
    verticals: Line[]
  } & Iterable<Line> = {
    horizontals: [],
    verticals: [],
    // Make it possible to iterate directly over the lines object
    [Symbol.iterator]: function* () {
      yield* this.horizontals;
      yield* this.verticals;
    }
  };
  
  /**
   * @param plane The plane where the grid will sit
   * @param style The style which will be applied to the lines which compose the grid
   */
  public constructor(plane: Plane2D, public readonly style: LineStyle) {
    // Cover the whole plane by default
    this.fitArea(plane.minMaxValues);
  }

  /**
   * Recalculates the lines which compose the grid so that they cover a given area.
   * 
   * @param minMaxValues The minimum and maximum coordinates which enclose the rectangular area to cover
   */
  public fitArea(minMaxValues: { minX: number; maxX: number; minY: number; maxY: number; }): void {
    // Get rid of the previous lines
    this.lines.horizontals = [];
    this.lines.verticals = [];

    const { minX, maxX, minY, maxY } = minMaxValues;
    // The maximum distance of any point on the axes from the origin
    const maxValue = Math.max(Math.abs(minX), Math.abs(maxX), Math.abs(minY), Math.abs(maxY));

    // Create the grid lines in pairs to make them easier to animate
    for (let n = 1; n <= maxValue; n++) {
      // Use maxValue to make sure that the midpoint of all the lines lies on one of the the axes,
      // so that the appear animation looks better
      this.lines.horizontals.push(new Line(-maxValue, n, maxValue, n, this.style));
      this.lines.horizontals.push(new Line(-maxValue, -n, maxValue, -n, this.style));
      this.lines.verticals.push(new Line(n, -maxValue, n, maxValue, this.style));
      this.lines.verticals.push(new Line(-n, -maxValue, -n, maxValue, this.style));
    }
  }

  public show(): void {
    updateAnimations(this.style);

    for (const line of this.lines) {
      line.show();
    }
  }

  /**
   * Plays an animation where the grid lines arise from the axes four at a time.
   */
  public async appear(): Promise<void> {
    this.style.alpha = 25;

    // Prevent lines from being drawn until their drawFrom animation has started
    for (const line of this.lines) {
      line.hidden = true;
    }
    
    const makeLinesAppear = async (lines: Line[]) => {
      for (let i = 0; i < lines.length; i += 2) {
        lines[i].hidden = false;
        lines[i].drawFrom('center', 0.5);

        lines[i + 1].hidden = false;
        lines[i + 1].drawFrom('center', 0.5);

        await timer(0.2);
      }
    };

    makeLinesAppear(this.lines.horizontals);
    await makeLinesAppear(this.lines.verticals);
  }

  /**
   * Plays an animation where the grid gradually fades out.
   */
  public fadeOut(): Promise<void> {
    return animate(this.style, new LinearAnimation<LineStyle, 'alpha'>('alpha', 2, 0));
  }

}


/**
 * Represents a variable value of length on a given plane which always corresponds to the same resulting length on the screen;
 * These values are constantly adjusted to respond to changes in the unit length of the plane.
 */
export class ConstantLength {

  /**
   * The resulting length on the screen, which should never change.
   */
  private readonly resultingLength: number;


  /**
   * @param plane The plane where the length will result constant
   * @param initialValue The value of the length at the current zoom level
   */
  public constructor(private readonly plane: Plane2D, initialValue: number) {
    // The formula follows from the fact that scale(plane.unitLength) is called at every frame,
    // meaning that the resulting lengths on the screen are always scaled by that factor
    this.resultingLength = plane.unitLength * initialValue;
  }

  public valueOf(): number {
    // Always take the expected result and divide it by the unitLength to compensate the effect of scale()
    // Doing the calculation every time makes the value respond to changes in unitLength
    return this.resultingLength / this.plane.unitLength;
  }

}
