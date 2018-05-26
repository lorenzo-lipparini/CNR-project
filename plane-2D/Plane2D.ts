
import Line from './Line.js';


/**
 * Namespace containing functions that take care of the transformation of coordinates
 * from the 2D plane to the displayed canvas, as well as the visual representation of the plane itself. 
 */
namespace Plane2D {

  let unitLength = 0;

  let gridLines: {
    horizontals: Line[],
    verticals: Line[]
  };

  /**
   * Used to correctly map points on the plane to points on the canvas;
   * To be called in draw() after setting the background.
   * 
   * @param value Distance in pixels between two points which are 1 unit apart on the plane
   */
  export function setUnitLength(value: number): void {
    const needToUpdateGridLines = value !== unitLength;
    
    translate(width/2, height/2);
    scale(value, -value);

    unitLength = value;

    if (needToUpdateGridLines) {
      updateGridLines();
    }
  }

  /**
   * Creates new Line objects that make the grid.
   */
  function updateGridLines(): void {
    // Get rid of the previous lines
    gridLines = {
      horizontals: [],
      verticals: []
    };

    // Maximum coordinates which fit on the screen
    const maxX = width/2 / unitLength;
    const maxY = height/2 / unitLength;

    Line.defaultStyle = { rgb: [255, 255, 255], alpha: 100, strokeWeight: 0.01 };

    // Foreach integer value n visible on the axes
    for (let n = 1; n <= max(maxX, maxY); n++) {
      gridLines.horizontals.push(new Line(-maxX, n, maxX, n));
      gridLines.horizontals.push(new Line(-maxX, -n, maxX, -n));
      gridLines.verticals.push(new Line(n, -maxY, n, maxY));
      gridLines.verticals.push(new Line(-n, -maxY, -n, maxY));
    }
  }

  /**
   * Draws the x and y axes on the canvas.
   */
  export function showAxes(): void {

    strokeWeight(0.01);
    stroke(255, 255, 255, 100);

    // Maximum coordinates which fit on the screen
    const maxX = width/2 / unitLength;
    const maxY = height/2 / unitLength;

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

    for (const line of gridLines.horizontals.concat(gridLines.verticals)) {
      line.show();
    }

  }

  /**
   * Sets the alpha value of all the lines which are part of the grid.
   * 
   * @param value Alpha value to set
   */
  export function setGridAlpha(value: number): void {
    for (const line of gridLines.horizontals.concat(gridLines.verticals)) {
      line.style.alpha = value;
    }
  }

}


export default Plane2D;
