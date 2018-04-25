
import videoSpecs from '../../lib/videoSpecs.js';
import FrameCapture from '../../lib/FrameCapture.js';
import timer from '../../lib/timer.js';
import { LinearAnimation, HarmonicAnimation, animate, updateAnimations } from '../../lib/animation.js';

import KochCurve from '../KochCurve.js';


let kochCurve: KochCurve;


window.setup = () => {
  createCanvas(videoSpecs.resolution.x, videoSpecs.resolution.y);

  kochCurve = new KochCurve([- width / 3, 0], [ width / 3, 0], 3);

  main();

  FrameCapture.acquire();
};


async function main() {
  
  const bumpUp = new LinearAnimation<KochCurve, 'tanAngle'>('tanAngle', 3, 0, Math.tan(Math.PI / 3));

  let childCurve = kochCurve;
  let targetAngle = 0;

  for (let i = 0; i < 8; i++) {
    childCurve.incrementIterations();
    childCurve.animateIteration(childCurve.iterations, bumpUp);

    childCurve = childCurve.childCurves[1];

    const zoomCenter = childCurve.start.map((x, i) => (x + childCurve.end[i]) / 2);
    
    const previousAngle = targetAngle;
    targetAngle = Math.atan2(childCurve.end[1] - childCurve.start[1], childCurve.end[0] - childCurve.start[0]);
    // Make sure that the number of full turns in the previousAngle and the targetAngle match
    targetAngle += (2*Math.PI) * Math.ceil((previousAngle - targetAngle) / (2*Math.PI));
    
    const zoomAnimation = new HarmonicAnimation<typeof drawOptions, 'zoomPos'>('zoomPos', 3, zoomCenter)
                .parallel(new HarmonicAnimation<typeof drawOptions, 'zoomFactor'>('zoomFactor', 3, 3 * drawOptions.zoomFactor))
                .parallel(new HarmonicAnimation<typeof drawOptions, 'angle'>('angle', 3, targetAngle));

    await animate(drawOptions, zoomAnimation);
  }

  FrameCapture.stop();
}

const drawOptions = {
  zoomPos: [0, 0, 0],
  zoomFactor: 1,
  angle: 0
};

window.draw = () => {
  timer.update();
  updateAnimations();
  
  
  background(0);

  translate(width / 2, height / 2);
  scale(1, -1);

  scale(drawOptions.zoomFactor);
  rotate(-drawOptions.angle);
  translate(-drawOptions.zoomPos[0], -drawOptions.zoomPos[1]);

  noFill();
  stroke(255, 255, 255);
  strokeWeight(2 / drawOptions.zoomFactor);

  kochCurve.show();

  FrameCapture.update();
};
