
import timer from '../lib/timer.js';

import Line from './Line.js';


/**
 * Class that takes care of the transformation of coordinates from the 2D plane to the displayed canvas,
 * as well as the visual representation of the plane itself. 
 */
export default class Plane2D {

  private gridLines: {
    horizontals: Line[],
    verticals: Line[]
  } = {
    horizontals: [],
    verticals: []
  };

  /**
   * @param unitLength Distance in pixels between two points which are 1 unit apart on the plane
   */
  public constructor(private unitLength: number) {
    // Create the lines which compose the grid

    // Maximum coordinates which fit on the screen
    const maxX = width/2 / this.unitLength;
    const maxY = height/2 / this.unitLength;

    Line.defaultStyle = { rgb: [255, 255, 255], alpha: 100, strokeWeight: 0.003 };

    // Foreach integer value n visible on the axes
    for (let n = 1; n <= max(maxX, maxY); n++) {
      this.gridLines.horizontals.push(new Line(-maxX, n, maxX, n));
      this.gridLines.horizontals.push(new Line(-maxX, -n, maxX, -n));
      this.gridLines.verticals.push(new Line(n, -maxY, n, maxY));
      this.gridLines.verticals.push(new Line(-n, -maxY, -n, maxY));
    }
  }

  /**
   * Required to correctly map points on the plane to points on the canvas, according to the unit length;
   * To be called in draw() after setting the background.
   */
  public applyScale(): void {
    translate(width/2, height/2);
    scale(this.unitLength, -this.unitLength);
  }

  /**
   * Draws the x and y axes on the canvas.
   */
  public showAxes(): void {

    strokeWeight(0.01);
    stroke(255, 255, 255, 100);

    // Maximum coordinates which fit on the screen
    const maxX = width/2 / this.unitLength;
    const maxY = height/2 / this.unitLength;

    // X-axis
    line(-maxX, 0, maxX, 0);
    // Y-axis
    line(0, -maxY, 0, maxY);

    // Foreach integer value n visible on the axes
    for (let n = 1; n <= max(maxX, maxY); n++) {
      const tickLength = 0.1;
      
      strokeWeight(0.01);
      stroke(255, 255, 255);
      
      line(-tickLength/2, n, tickLength/2, n);
      line(-tickLength/2, -n, tickLength/2, -n);
      line(n, -tickLength/2, n, tickLength/2);
      line(-n, -tickLength/2, -n, tickLength/2);
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
    async function makeLinesAppear(lines: Line[]) {
      for (let i = 0; i < lines.length; i += 2) {
        lines[i].style.alpha = Line.defaultStyle.alpha;
        lines[i].stretchFromMiddle(0.5);
         
        lines[i + 1].style.alpha = Line.defaultStyle.alpha;
        lines[i + 1].stretchFromMiddle(0.5);
         
        await timer(0.3);
      }
    }

    makeLinesAppear(this.gridLines.horizontals);
    await timer(0.8);
    makeLinesAppear(this.gridLines.verticals);
  }

}
