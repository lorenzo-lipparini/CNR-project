
import videoSpecs from '../../lib/videoSpecs.js';
import timer from '../../lib/timer.js';
import { PropertyAnimation, LinearAnimation, Animation, animate, updateAnimations } from '../../lib/animation.js';

import KochCurve from '../KochCurve.js';


let kochCurve: KochCurve;


window.setup = () => {
  createCanvas(videoSpecs.resolution.x, videoSpecs.resolution.y);

  kochCurve = new KochCurve([- width / 3, 0], [ width / 3, 0], 4);

  frameRate(60);

  main();
};


async function main() {
  
  const bumpUp = new LinearAnimation<KochCurve, 'tanAngle'>('tanAngle', 3, 0, Math.tan(Math.PI / 3));

  let childCurve = kochCurve;

  await animate(drawOptions, new LinearAnimation<typeof drawOptions, 'zoomPos'>('zoomPos', 4, kochCurve.start).toHarmonic());
  await timer(0.5);

  for (let i = 0; i < 5; i++) {
    childCurve.incrementIterations();

    childCurve = childCurve.childCurves[0];

    childCurve.animateIteration(childCurve.iterations, bumpUp);

    await animate(drawOptions, new LinearAnimation<typeof drawOptions, 'zoomFactor'>('zoomFactor', 3, 2.5 * drawOptions.zoomFactor).toHarmonic());
  }

}

const drawOptions = {
  zoomPos: [0, 0, 0],
  zoomFactor: 1
};

window.draw = () => {
  timer.update();
  updateAnimations();
  
  
  background(0);

  translate(width / 2, height / 2);
  scale(1, -1);

  scale(drawOptions.zoomFactor);
  translate(-drawOptions.zoomPos[0], -drawOptions.zoomPos[1]);

  noFill();
  stroke(255, 255, 255);
  strokeWeight(2 / drawOptions.zoomFactor);

  kochCurve.show();

};
