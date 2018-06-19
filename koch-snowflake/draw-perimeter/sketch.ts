
import videoSpecs from '../../lib/videoSpecs.js';
import FrameCapture from '../../lib/FrameCapture.js';
import { HarmonicAnimation, animate, updateAnimations } from '../../lib/animation.js';
import timer from '../../lib/timer.js';
import Scene from '../../lib/Scene.js';

import KochSnowflake from '../KochSnowflake.js';


const globals = {
  hiddenAngle: 2 * Math.PI
};

const scene = new Scene();

window.setup = async () => {
  createCanvas(videoSpecs.resolution.x, videoSpecs.resolution.y);

  FrameCapture.acquire();

  await main();

  FrameCapture.stop();
};

async function main() {
  const kochSnowflake = new KochSnowflake([0, 0], width / 3, 6);
  scene.add(kochSnowflake);

  await timer(1);
  await animate(globals, new HarmonicAnimation<typeof globals, 'hiddenAngle'>('hiddenAngle', 2, 2 * Math.PI, 0));
  await timer(1);
}

window.draw = () => {
  timer.update();
  updateAnimations();


  background(0);

  translate(width/2, height/2);

  stroke(255, 255, 255);
  noFill();

  scene.render();

  noStroke();
  fill(0, 0, 0);

  arc(
    0,
    0,
    width,
    width,
    -Math.PI / 2,
    // arc() gives problems when the start and end angles differ by a multiple of 2pi, this is a quick fix
    -Math.PI / 2 + (
      (globals.hiddenAngle === 0)           ? 1/10**10  :
      (globals.hiddenAngle === 2 * Math.PI) ? -1/10**10 :
                                              globals.hiddenAngle
    )
  );


  FrameCapture.update();
};
