'use strict'

class KochCurve {

  constructor(start, end, iterations) {
    this.start = start;
    this.end = end;
    this.iterations = iterations;

    // 0-iterations Koch curves are just straight lines, so they have no child curves
    if (this.iterations === 0) {
      return;
    }

    this.childCurves = [];
    this._createChildCurves();
  }

  _createChildCurves() {

    let previousX = this.start.x;
    let previousY = this.start.y;

    // Helper function to create the child curves
    let addCurve = (endX, endY) => {
      this.childCurves.push(new KochCurve(
        new p5.Vector(previousX, previousY),
        new p5.Vector((previousX = endX), (previousY = endY)),
        this.iterations - 1
      ));
    };

    let deltaX = this.end.x - this.start.x;
    let deltaY = this.end.y - this.start.y;

    addCurve(this.start.x + deltaX / 3, this.start.y + deltaY / 3);

    const sin60 = 0.8660254037844386;
    const factor = 1 / 3 * (0.5 - sin60 * deltaY / deltaX);

    addCurve(
      previousX + deltaX * factor,
      previousY + deltaY * factor + sin60 / 3 * (deltaX + deltaY * deltaY / deltaX)
    );

    addCurve(this.start.x + 2/3 * deltaX, this.start.y + 2/3 * deltaY);

    addCurve(this.end.x, this.end.y);

  } 

  show() {
    beginShape();

    this._addVertices();

    // (*) Consecutive lines share a vertex, and in order to prevent it from being drawn two times
    //     only the start vertex of each line is drawn. That means that the last vertex of the curve
    //     won't be drawn by _addVertices(), so it has to be done manually.
    vertex(this.end.x, this.end.y);

    endShape();
  }

  _addVertices() {
    
    // 0-iterations Koch curves are just straight lines
    if (this.iterations === 0) {
      // See (*)
      vertex(this.start.x, this.start.y);
      return;
    }
    
    for (let curve of this.childCurves) {
      curve._addVertices();
    }

  }

}