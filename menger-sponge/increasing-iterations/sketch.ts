
import videoSpecs from '../../lib/videoSpecs.js';
import FrameCapture from '../../lib/FrameCapture.js';
import timer from '../../lib/timer.js';
import { PropertyAnimation, LinearAnimation, Animation } from '../../lib/animation.js';

import Cube from '../Cube.js';
import MengerSponge from '../MengerSponge.js';


const angularVelocity = 1/30 * (2 * Math.PI / 60);

let mengerSponge: MengerSponge;


window.setup = () => {
  createCanvas(videoSpecs.resolution.x, videoSpecs.resolution.y, WEBGL);

  mengerSponge = new MengerSponge([0, 0, 0], height / 2, [50, 100, 255], 0);

  main();

  FrameCapture.acquire();
};

async function main() {

  mengerSponge.showExcludedCubes = true;

  const scaleDown = new LinearAnimation<Cube, 'side'>('side', 1.5, 0);

  const flashColor = lerpColor(color(mengerSponge.color), color('white'), 0.2);
  const flashColorV = [red(flashColor), green(flashColor), blue(flashColor)];
  const flash = new PropertyAnimation<Cube, 'color'>('color', 3, (progress, initialColor) =>
    progress <= 0.25 ? flashColorV  :
    progress <= 0.50 ? initialColor :
    progress <= 0.75 ? flashColorV  :
                       initialColor
  );

  const cubeAnimation = flash.concat(scaleDown);


  await timer(1);

  while (mengerSponge.iterations < 3) {
    mengerSponge.incrementIterations();

    await mengerSponge.animateExcludedCubes(mengerSponge.iterations, cubeAnimation);

    await timer(1/3);
  }


  FrameCapture.stop();
}


let angle = 0;

window.draw = () => {
  timer.update();


  background(0);

  ambientLight(50, 50, 50);
  directionalLight(255, 255, 255, 0, -1, -1);

  rotateX(-0.2);
  rotateY(angle);
  angle += angularVelocity;

  noStroke();
  
  mengerSponge.show();


  FrameCapture.update();
};
