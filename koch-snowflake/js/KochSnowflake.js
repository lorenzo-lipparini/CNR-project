'use strict'

class KochSnowflake {

  constructor(center, side, iterations) {
    this.center = center;
    this.side = side;
    this.iterations = iterations;

    this.childCurves = [];
    this._createChildCurves();
  }

  _createChildCurves() {
    
    const csc60 = 1.1547005383792515;
    
    let previousX = 0;
    let previousY = this.side / 2 * csc60;


    let addCurve = (relativeEndX, relativeEndY) => {
      this.childCurves.push(new KochCurve(
        new p5.Vector(this.center.x + previousX, this.center.y + previousY),
        new p5.Vector(this.center.x + (previousX = relativeEndX), this.center.y + (previousY = relativeEndY)),
        this.iterations
      ));
    };

    const cot60 = 0.5773502691896257;
    
    addCurve(this.side / 2, -this.side / 2 * cot60);

    addCurve(-this.side / 2, -this.side / 2 * cot60);
    
    addCurve(0, this.side / 2 * csc60);

  }

  show() {
    beginShape();

    for (let curve of this.childCurves) {
      curve._addVertices();
    }

    endShape(CLOSE);
  }

  incrementIterations() {
    for (let curve of this.childCurves) {
      curve.incrementIterations();
    }
  }

}
