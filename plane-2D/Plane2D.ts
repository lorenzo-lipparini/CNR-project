
/**
 * Namespace containing functions that take care of the transformation of coordinates
 * from the 2D plane to the displayed canvas, as well as the visual representation of the plane itself. 
 */
namespace Plane2D {

  let unitLength = 0;

  /**
   * Used to correctly map points on the plane to points on the canvas;
   * To be called in draw() after setting the background.
   * 
   * @param value Distance in pixels between two points which are 1 unit apart on the plane
   */
  export function setUnitLength(value: number): void {
    translate(width/2, height/2);
    scale(value, -value);

    unitLength = value;
  }

  /**
   * Draws the x and y axes on the canvas.
   * 
   * @param showGrid If set to true, an orthogonal grid which cuts the axes at all integer values is also drawn
   */
  export function showAxes(showGrid = false): void {

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

      if (showGrid) {
        strokeWeight(0.005);
        stroke(255, 255, 255, 100);

        line(-maxX, n, maxX, n);
        line(-maxX, -n, maxX, -n);
        line(n, -maxY, n, maxY);
        line(-n, -maxY, -n, maxY);
      }
    }

  }

}


export default Plane2D;
