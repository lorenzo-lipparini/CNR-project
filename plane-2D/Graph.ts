
/**
 * Class that makes it easy to draw the graph of a function, to be used in combination with Plane2D.
 */
export default class Graph {

  /**
   * @param f The function to show on the graph
   * @param interval Array containing the two endpoints of the interval to show
   * @param step Detemines the precision of the curve
   */
  public constructor(private f: (x: number) => number, public interval: [number, number], private step = 0.05) { }

  public show(): void {
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
