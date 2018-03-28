
import { Animatable, AnimationFunction } from '../lib/animation.js';


export default class KochCurve extends Animatable {

  private childCurves: KochCurve[] = [];
  
  private _tanAngle: number = -1;

  public constructor(public start: p5.Vector, public end: p5.Vector, public iterations: number) {
    super();

    // 0-iterations Koch curves are just straight lines, so they have no child curves
    if (this.iterations !== 0) {
      // No need to call _updateCurves here, since it will be called by the tanAngle setter

      // Used in the animation process to make the bumps come out of the line gradually
      this.tanAngle = 1.7320508075688767; // tan(60°)
    }

  }

  public get tanAngle() {
    return this._tanAngle;
  }

  public set tanAngle(value) {
    // Prevent useless computation
    if (value === this.tanAngle) {
      return;
    }

    this._tanAngle = value;

    this.updateChildCurves();
  }


  private updatePosition(start: p5.Vector, end: p5.Vector) {
    this.start = start;
    this.end = end;

    if (this.iterations !== 0) {
      this.updateChildCurves();
    }
  }

  // Creates the child curves or updates their position if they exist already
  // Reusing the old children instead of replacing them is important because
  // there might be animations bound to those objects, which would stop if they
  // were destroyed
  private updateChildCurves() {

    let previousX = this.start.x;
    let previousY = this.start.y;

    let addedCurves = 0;

    // Helper function to create/update the child curves, considers the positions as
    // relative to this.start and works basically like beginShape()
    let addCurve = (relativeEndX: number, relativeEndY: number) => {
      let start = new p5.Vector(previousX, previousY);
      let end = new p5.Vector((previousX = this.start.x + relativeEndX), (previousY = this.start.y + relativeEndY));
      
      if (this.childCurves[addedCurves] === undefined) {
        this.childCurves.push(new KochCurve(start, end, this.iterations - 1));
      } else {
        this.childCurves[addedCurves].updatePosition(start, end);
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

  public show() {

    beginShape();

    this.addVertices();

    // (*) Consecutive lines share a vertex, so in order to prevent it from being drawn two times
    //     only the start vertex of each line is drawn. That means that the last vertex of the curve
    //     won't be drawn by _addVertices(), so it has to be done manually.
    vertex(this.end.x, this.end.y);

    endShape();
  }

  public addVertices() {
    // Since KochSnowflake doesn't call show(), put _updateAnimations() here
    // to ensure it will be called
    this.updateAnimations();
    
    // 0-iterations Koch curves are just straight lines
    if (this.iterations === 0) {
      // See (*)
      vertex(this.start.x, this.start.y);
      
      return;
    }
    
    for (let curve of this.childCurves) {
      curve.addVertices();
    }

  }

  // A fractal might need a higher definition during the animation, use this method
  public incrementIterations() {
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

  public animateIteration(iteration:  number, duration: number, update: AnimationFunction<KochCurve>): Promise<void> {
    
    // 1-iteration animations just refer to the current object
    if (iteration === 1) {
      return super.animate(duration, update);
    }

    let returnPromise: Promise<void> = Promise.resolve();
    
    // If it doesn't directly refer to this object, delegate the task to the child curves
    for (let curve of this.childCurves) {
      returnPromise = curve.animateIteration(iteration - 1, duration, update);
    }
    
    return returnPromise;

  }

}
