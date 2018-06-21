
import videoSpecs from '../../lib/videoSpecs.js';
import FrameCapture from '../../lib/FrameCapture.js';
import { PropertyAnimation, LinearAnimation } from '../../lib/animation.js';
import timer from '../../lib/timer.js';
import Scene from '../../lib/Scene.js';

import Cube from '../Cube.js';
import MengerSponge from '../MengerSponge.js';


const scene = new Scene();

window.setup = async () => {
  createCanvas(videoSpecs.resolution.x, videoSpecs.resolution.y, WEBGL);

  FrameCapture.acquire();

  await main();

  FrameCapture.stop();
};

async function main() {
  const mengerSponge = new MengerSponge([0, 0, 0], height / 2, [50, 100, 255], 0);
  scene.add(mengerSponge);

  mengerSponge.showExcludedCubes = true;

  const scaleDown = new LinearAnimation<Cube, 'side'>('side', 1.5, 0);

  const flashColor = [90, 130, 255];
  const flash = new PropertyAnimation<Cube, 'color'>('color', 3, (progress, initialColor) =>
    progress <= 0.25 ? flashColor   :
    progress <= 0.50 ? initialColor :
    progress <= 0.75 ? flashColor   :
                       initialColor
  );

  const fadeFactor = 2;
  const fadeOut = new LinearAnimation<MengerSponge, 'color'>('color', 1.5, color => color.map(x => x / fadeFactor));


  await timer(1);

  while (mengerSponge.iterations < 4) {
    mengerSponge.incrementIterations();

    // (flash variant)
    // await mengerSponge.animateExcludedCubes(mengerSponge.iterations, flash);
    // (fade-out variant)
    // mengerSponge.animate(fadeOut);
    await mengerSponge.animateExcludedCubes(mengerSponge.iterations, scaleDown);

    await timer(1/3);
  }

}


let angle = 0;
const angularVelocity = 1/30 * (2 * Math.PI / 60);

window.draw = () => {
  timer.update();


  background(0);

  ambientLight(50, 50, 50);
  directionalLight(255, 255, 255, 0, -1, -1);

  rotateX(-0.2);
  rotateY(angle);
  angle += angularVelocity;

  noStroke();
  
  scene.render();


  FrameCapture.update();
};
