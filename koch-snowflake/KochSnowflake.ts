
import { AnimationFunction } from '../lib/animation.js';

import KochCurve from './KochCurve.js';


export default class KochSnowflake {

  private childCurves: KochCurve[] = [];

  public constructor(public readonly center: p5.Vector, public readonly side: number, public iterations: number) {
    this.createChildCurves();
  }

  private createChildCurves() {
    
    const csc60 = 1.1547005383792515;
    
    let previousX = 0;
    let previousY = this.side / 2 * csc60;


    let addCurve = (relativeEndX: number, relativeEndY: number) => {
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

  public show() {
    beginShape();

    for (let curve of this.childCurves) {
      curve.addVertices();
    }

    endShape(CLOSE);
  }

  public incrementIterations() {
    this.iterations++;

    for (let curve of this.childCurves) {
      curve.incrementIterations();
    }
  }

  public animateCurves(iteration: number, duration: number, update: AnimationFunction<KochCurve>) {
    let returnPromise;

    for (let curve of this.childCurves) {
      returnPromise = curve.animateIteration(iteration, duration, update);
    }

    return returnPromise;
  }

}
