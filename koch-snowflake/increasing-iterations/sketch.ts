
import videoSpecs from '../../lib/videoSpecs.js';
import FrameCapture from '../../lib/FrameCapture.js';
import timer from '../../lib/timer.js';
import { LinearAnimation } from '../../lib/animation.js';

import KochCurve from '../KochCurve.js';
import KochSnowflake from '../KochSnowflake.js';


let kochSnowflake: KochSnowflake;


window.setup = () => {
  createCanvas(videoSpecs.resolution.x, videoSpecs.resolution.y);

  kochSnowflake = new KochSnowflake([0, 0], width / 3, 0);

  main();

  FrameCapture.acquire();
};

async function main() {
  
  let bumpUp = new LinearAnimation<KochCurve, 'tanAngle'>('tanAngle', 1, 0, Math.tan(Math.PI / 3));

  
  await timer(1);

  while (kochSnowflake.iterations < 5) {
    kochSnowflake.incrementIterations();
    
    await kochSnowflake.animateCurves(kochSnowflake.iterations, bumpUp);
    
    await timer(1);
  }

  FrameCapture.stop();
}

window.draw = () => {
  timer.update();

  
  background(0);

  translate(width / 2, height / 2);
  scale(1, -1);

  stroke(255, 255, 255);
  noFill();

  kochSnowflake.show();


  FrameCapture.update();  
};
