
import { Animatable } from '/lib/animation.js';
import '/p5.js';


export default class KochCurve extends Animatable {

  constructor(start, end, iterations) {
    super();
    
    this.start = start;
    this.end = end;
    this.iterations = iterations;

    // 0-iterations Koch curves are just straight lines, so they have no child curves
    if (this.iterations !== 0) {
      this.childCurves = [];
      // No need to call _updateCurves here, since it will be called by the tanAngle setter

      // Used in the animation process to make the bumps come out of the line gradually
      this.tanAngle = 1.7320508075688767; // tan(60°)
    }

  }

  get tanAngle() {
    return this._tanAngle;
  }

  set tanAngle(value) {
    // Prevent useless computation
    if (value === this.tanAngle) {
      return;
    }

    this._tanAngle = value;

    this._updateChildCurves();
  }


  _updatePosition(start, end) {
    this.start = start;
    this.end = end;

    if (this.iterations !== 0) {
      this._updateChildCurves();
    }
  }

  // Creates the child curves or updates their position if they exist already
  // Reusing the old children instead of replacing them is important because
  // there might be animations bound to those objects, which would stop if they
  // were destroyed
  _updateChildCurves() {

    let previousX = this.start.x;
    let previousY = this.start.y;

    let addedCurves = 0;

    // Helper function to create/update the child curves, considers the positions as
    // relative to this.start and works basically like beginShape()
    let addCurve = (relativeEndX, relativeEndY) => {
      let start = new p5.Vector(previousX, previousY);
      let end = new p5.Vector((previousX = this.start.x + relativeEndX), (previousY = this.start.y + relativeEndY));
      
      if (this.childCurves[addedCurves] === undefined) {
        this.childCurves.push(new KochCurve(start, end, this.iterations - 1));
      } else {
        this.childCurves[addedCurves]._updatePosition(start, end);
      }

      addedCurves++; 
    };

    let deltaX = this.end.x - this.start.x;
    let deltaY = this.end.y - this.start.y;
    

    addCurve(1/3 * deltaX, 1/3 * deltaY);
    
    if (deltaX === 0) { // deltaY/deltaX = Infinity => angle of the base line = 90°
      addCurve(-deltaY/6 * this.tanAngle, deltaY / 2);
    } else {
      const k = (3 - this.tanAngle * deltaY/deltaX) / 6;
      addCurve(
        k * deltaX,
        k * deltaY + this.tanAngle / 6 * (deltaX*deltaX + deltaY*deltaY) / deltaX
      );
    }

    addCurve(2/3 * deltaX, 2/3 * deltaY);

    addCurve(deltaX, deltaY);

  }

  show() {

    beginShape();

    this._addVertices();

    // (*) Consecutive lines share a vertex, so in order to prevent it from being drawn two times
    //     only the start vertex of each line is drawn. That means that the last vertex of the curve
    //     won't be drawn by _addVertices(), so it has to be done manually.
    vertex(this.end.x, this.end.y);

    endShape();
  }

  _addVertices() {
    // Since KochSnowflake doesn't call show(), put _updateAnimations() here
    // to ensure it will be called
    this._updateAnimations();
    
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

  // A fractal might need a higher definition during the animation, use this method
  incrementIterations() {
    this.iterations++;

    // Simple case: this wasn't even a fractal
    if (this.iterations === 1) {
      this.childCurves = [];
      // No need to call _updateCurves here, since it will be called by the tanAngle setter

      this.tanAngle = 1.7320508075688767; // tan(60°)

      return;
    }

    // If this had child elements already, delegate the task to the child curves
    for (let curve of this.childCurves) {
      curve.incrementIterations();
    }

  }

  animate(iteration, ...params) {
    
    // 1-iteration animations just refer to the current object
    if (iteration === 1) {
      return super.animate(...params);
    }

    let returnPromise;
    
    // If it doesn't directly refer to this object, delegate the task to the child curves
    for (let curve of this.childCurves) {
      returnPromise = curve.animate(iteration - 1, ...params);
    }
    
    return returnPromise;

  }

}
