
import { Animation, Animatable } from '../lib/animation.js';

import KochCurve from './KochCurve.js';


/**
 * Represents an animatable Koch Snowflake fractal in the scene.
 */
export default class KochSnowflake extends Animatable {

  public childCurves: KochCurve[] = [];

 
  /**
   * @param center The circumcenter of the base triangle of the fractal
   * @param side The side of the base triangle of the fractal
   * @param iterations Integer number which determines the detail and complexity of the fractal
   */
  public constructor(public readonly center: number[], public readonly side: number, public iterations: number) {
    super();

    this.createChildCurves();
  }

  private createChildCurves(): void {
    
    const csc60 = 1.1547005383792515;
    
    let previousX = 0;
    let previousY = this.side / 2 * csc60;


    const addCurve = (relativeEndX: number, relativeEndY: number) => {
      this.childCurves.push(new KochCurve(
        [this.center[0] + previousX, this.center[1] + previousY],
        [this.center[0] + (previousX = relativeEndX), this.center[1] + (previousY = relativeEndY)],
        this.iterations
      ));
    };

    const cot60 = 0.5773502691896257;
    
    addCurve(this.side / 2, -this.side / 2 * cot60);

    addCurve(-this.side / 2, -this.side / 2 * cot60);
    
    addCurve(0, this.side / 2 * csc60);

  }

  public show(): void {
    beginShape();

    for (const curve of this.childCurves) {
      curve.addVertices();
    }

    endShape(CLOSE);
  }

  /**
   * Increments the iterations of the fractal, adding further detail to its shape.
   */
  public incrementIterations(): void {
    this.iterations++;

    for (const curve of this.childCurves) {
      curve.incrementIterations();
    }
  }

  /**
   * Plays an animation on all the curves of a given iteration.
   * 
   * @param iteration The iteration which identifies the curves
   * @param animation The animation to play on the curves
   */
  public animateCurves(iteration: number, animation: Animation<KochCurve, keyof KochCurve>): Promise<void> {
    let returnPromise = Promise.resolve();
    
    for (const curve of this.childCurves) {
      returnPromise = curve.animateIteration(iteration, animation);
    }

    return returnPromise;
  }

}
