
import videoSpecs from '../../lib/videoSpecs.js';
import timer from '../../lib/timer.js';
import { linearAnimation, animation } from '../../lib/animation.js';
import FrameCapture from '../../lib/FrameCapture.js';

import Cube from '../Cube.js';
import MengerSponge from '../MengerSponge.js';


const angularVelocity = 1/15 * (2 * Math.PI / 60);

let mengerSponge: MengerSponge;


window.setup = () => {
  createCanvas(videoSpecs.resolution.x, videoSpecs.resolution.y, WEBGL);

  mengerSponge = new MengerSponge(new p5.Vector(0, 0, 0), height / 2, color(50, 100, 255), 0);

  frameRate(60);

  main();

  FrameCapture.acquire();
};

async function main() {

  mengerSponge.showExcludedCubes = true;

  let scaleDown = linearAnimation<Cube, 'side'>('side', 1, 0);
  let flashColor = lerpColor(mengerSponge.color, color('white'), 0.2);
  let flash = animation<Cube, 'color'>('color', 3, (progress, initialColor) =>
    progress <= 0.25 ? flashColor   :
    progress <= 0.50 ? initialColor :
    progress <= 0.75 ? flashColor   :
                       initialColor
  );


  await timer(1);

  while (mengerSponge.iterations < 3) {
    mengerSponge.incrementIterations();

    await mengerSponge.animateExcludedCubes(mengerSponge.iterations, flash);
  
    await mengerSponge.animateExcludedCubes(mengerSponge.iterations, scaleDown);

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
