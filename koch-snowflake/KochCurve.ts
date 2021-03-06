
import { Animation, Animatable } from '../lib/animation.js';


/**
 * Represents an animatable Koch Curve fractal in the scene.
 */
export default class KochCurve extends Animatable {

  public childCurves: KochCurve[] = [];
  
  private _tanAngle: number = -1;


  /**
   * @param start One end point of the base
   * @param end The other end point of the base
   * @param iterations Integer number which determines the detail and complexity of the fractal
   */
  public constructor(public start: number[], public end: number[], public iterations: number) {
    super();

    // 0-iterations Koch curves are just straight lines, so they have no child curves
    if (this.iterations !== 0) {
      // No need to call updateCurves here, since it will be called by the tanAngle setter 
      this.tanAngle = 1.7320508075688767; // tan(60°)
    }
  }

  /**
   * Used in the animation process to change the height of the spikes.
   */
  public get tanAngle(): number {
    return this._tanAngle;
  }

  public set tanAngle(value: number) {
    // Prevent useless computation
    if (value === this.tanAngle) {
      return;
    }

    this._tanAngle = value;

    this.updateChildCurves();
  }

  private updatePosition(start: number[], end: number[]): void {
    this.start = start;
    this.end = end;

    if (this.iterations !== 0) {
      this.updateChildCurves();
    }
  }
  
  private updateChildCurves(): void {
    // Creates the child curves or updates their position if they exist already
    // Reusing the old children instead of replacing them is important because
    // there might be animations bound to those objects, which would stop if they
    // were destroyed

    let previousX = this.start[0];
    let previousY = this.start[1];

    let addedCurves = 0;

    // Helper function to create/update the child curves, considers the positions as
    // relative to this.start and works basically like beginShape()
    const addCurve = (relativeEndX: number, relativeEndY: number) => {
      const start = [previousX, previousY];
      const end = [previousX = this.start[0] + relativeEndX, previousY = this.start[1] + relativeEndY];
      
      if (this.childCurves[addedCurves] === undefined) {
        this.childCurves.push(new KochCurve(start, end, this.iterations - 1));
      } else {
        this.childCurves[addedCurves].updatePosition(start, end);
      }

      addedCurves++; 
    };

    const deltaX = this.end[0] - this.start[0];
    const deltaY = this.end[1] - this.start[1];
    

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

  public show(): void {

    beginShape();

    this.addVertices();

    // (*) Consecutive lines share a vertex, so in order to prevent it from being drawn two times
    //     only the start vertex of each line is drawn. That means that the last vertex of the curve
    //     won't be drawn by addVertices(), so it has to be done manually.
    vertex(this.end[0], this.end[1]);

    endShape();
  }

  /**
   * Calls p5's vertex() function for each of the vertices of the fractal excluding its end;
   * to be only invoked inside a beginShape()-endShape() block.
   */
  public addVertices(): void {
    // Since KochSnowflake doesn't call show(), put updateAnimations() here
    // to ensure it will be called
    this.updateAnimations();
    
    // 0-iterations Koch curves are just straight lines
    if (this.iterations === 0) {
      // See (*)
      vertex(this.start[0], this.start[1]);
      
      return;
    }
    
    for (const curve of this.childCurves) {
      curve.addVertices();
    }

  }

  /**
   * Increments the iterations of the fractal, adding further detail to its shape.
   */
  public incrementIterations(): void {
    this.iterations++;

    // Simple case: this wasn't even a fractal
    if (this.iterations === 1) {
      this.childCurves = [];
      // No need to call updateCurves here, since it will be called by the tanAngle setter

      this.tanAngle = 1.7320508075688767; // tan(60°)

      return;
    }

    // If this had child elements already, delegate the task to the child curves
    for (const curve of this.childCurves) {
      curve.incrementIterations();
    }

  }

  /**
   * Plays an animation on all the child curves of a given iteration.
   * 
   * @param iteration The iteration which identifies the curves
   * @param animation The animation to play on the curves
   */
  public animateIteration(iteration: number, animation: Animation<KochCurve, keyof KochCurve>): Promise<void> {
    
    // 1-iteration animations just refer to the current object
    if (iteration === 1) {
      return this.animate(animation);
    }

    let returnPromise: Promise<void> = Promise.resolve();
    
    // If it doesn't directly refer to this object, delegate the task to the child curves
    for (const curve of this.childCurves) {
      returnPromise = curve.animateIteration(iteration - 1, animation);
    }
    
    return returnPromise;

  }

}
