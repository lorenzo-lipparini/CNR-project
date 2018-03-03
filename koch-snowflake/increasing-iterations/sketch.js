
import videoSpecs from '/lib/videoSpecs.js';
import timer from '/lib/timer.js';
import '/p5.js';
import KochSnowflake from '../KochSnowflake.js';

let kochSnowflake;

window.setup = () => {
  createCanvas(videoSpecs.resolution.x, videoSpecs.resolution.y);

  kochSnowflake = new KochSnowflake(new p5.Vector(0, 0), width / 3, 0);

  frameRate(60);

  main();
};

async function main() {

  function bumpUp(target, progress) {
    if (!target.originalTanAngle) {
      target.originalTanAngle = target.tanAngle;
    }
    
    target.tanAngle = progress * target.originalTanAngle;
  }


  
  await timer(1);

  while (kochSnowflake.iterations < 5) {
    
    kochSnowflake.incrementIterations();
    
    await kochSnowflake.animateCurves(kochSnowflake.iterations, 1, bumpUp);

    await timer(1);
  }

}

window.draw = () => {
  timer.update();

  background(0);

  translate(width / 2, height / 2);
  scale(1, -1);

  stroke(255);
  noFill();

  kochSnowflake.show();  
};
