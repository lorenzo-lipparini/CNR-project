
import videoSpecs from '../../lib/videoSpecs.js';
import timer from '../../lib/timer.js';

import KochCurve from '../KochCurve.js';
import KochSnowflake from '../KochSnowflake.js';


let kochSnowflake: KochSnowflake;

window.setup = () => {
  createCanvas(videoSpecs.resolution.x, videoSpecs.resolution.y);

  kochSnowflake = new KochSnowflake(new p5.Vector(0, 0), width / 3, 0);

  frameRate(60);

  main();
};

async function main() {

  function bumpUp(target: KochCurve, progress: number, scope: { originalTanAngle: number }) {
    if (!scope.originalTanAngle) {
      scope.originalTanAngle = target.tanAngle;
    }
    
    target.tanAngle = progress * scope.originalTanAngle;
  }


  
  await timer(1);

  while (kochSnowflake.iterations < 5) {
    kochSnowflake.incrementIterations();
    
    kochSnowflake.animateCurves(kochSnowflake.iterations, 2, bumpUp);
  }

}

window.draw = () => {
  timer.update();

  background(0);

  translate(width / 2, height / 2);
  scale(1, -1);

  stroke(255, 255, 255);
  noFill();

  kochSnowflake.show();  
};
