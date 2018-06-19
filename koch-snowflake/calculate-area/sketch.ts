
import videoSpecs from '../../lib/videoSpecs.js';
import FrameCapture from '../../lib/FrameCapture.js';
import { LinearAnimation, HarmonicAnimation, animate, updateAnimations } from '../../lib/animation.js';
import timer from '../../lib/timer.js';
import Scene from '../../lib/Scene.js';

import KochSnowflake from '../KochSnowflake.js';


const globals = {
  kochSnowflakeOptions: {
    alpha: 0
  },
  circleOptions: {
    radius: videoSpecs.resolution.x / 2,
    arcAngle: 0,
    alpha: 0
  }
};

const scene = new Scene();

window.setup = async () => {
  createCanvas(videoSpecs.resolution.x, videoSpecs.resolution.y);

  FrameCapture.acquire();

  await main();

  FrameCapture.stop();
};

async function main() {
  const kochSnowflake = new KochSnowflake([0, 0], width /3, 6);
  scene.add(kochSnowflake);
  
  const flashArea = new LinearAnimation<{ alpha: number; }, 'alpha'>('alpha', 0.5, 0, 150)
            .concat(new LinearAnimation<{ alpha: number; }, 'alpha'>('alpha', 0.5, 150, 0));

  await timer(1);

  await animate(globals.circleOptions, new HarmonicAnimation<typeof globals.circleOptions, 'arcAngle'>('arcAngle', 1, 0, 2 * Math.PI));

  await timer(1);

  await animate(globals.kochSnowflakeOptions, flashArea);
  await timer(0.5);
  await animate(globals.circleOptions, flashArea);

  await timer(1);
}

window.draw = () => {
  timer.update();
  updateAnimations();


  background(0);
  
  translate(width/2, height/2);

  const fillColor = [50, 100, 255];

  stroke(255, 255, 255);

  fill(fillColor[0], fillColor[1], fillColor[2], globals.circleOptions.alpha);
  arc(
    0,
    0,
    globals.circleOptions.radius, globals.circleOptions.radius,
    -Math.PI / 2,
    // arc() gives problems when the start and end angles differ by a multiple of 2pi, this is a quick fix
    -Math.PI / 2 + (
      (globals.circleOptions.arcAngle === 0)           ? 1/10**10  :
      (globals.circleOptions.arcAngle === 2 * Math.PI) ? -1/10**10 :
                                                         globals.circleOptions.arcAngle
    )
  );

  fill(fillColor[0], fillColor[1], fillColor[2], globals.kochSnowflakeOptions.alpha);
  scene.render();


  FrameCapture.update();
}
