
import videoSpecs from '../../lib/videoSpecs.js';
import FrameCapture from '../../lib/FrameCapture.js';
import { LinearAnimation } from '../../lib/animation.js';
import timer from '../../lib/timer.js';
import Scene from '../../lib/Scene.js';

import MengerSponge from '../MengerSponge.js';
import Cube from '../Cube.js';


const scene = new Scene();

window.setup = async () => {
  createCanvas(videoSpecs.resolution.x, videoSpecs.resolution.y, WEBGL);

  FrameCapture.acquire();

  await main();

  FrameCapture.stop();
};

async function main() {
  const spongeNumber = 4;

  const mengerSponges: MengerSponge[] = [];

  const margin = width/10;
  const spongeSide = (width - 2 * margin) / spongeNumber / 1.3;
  let x = -width/2 + margin + spongeSide / 2;
  for (let i = 0; i < spongeNumber; i++) {
    const sponge = new MengerSponge([x, 0, 0], spongeSide, [50, 100, 255], 0);
    
    mengerSponges.push(sponge);
    scene.add(sponge);

    sponge.showExcludedCubes = true;

    x += (width - 2 * (margin + spongeSide / 2)) / (spongeNumber - 1);
  }

  const scaleDown = new LinearAnimation<Cube, 'side'>('side', 2, 0);
  
  await timer(1);

  for (let i = 0; i < mengerSponges.length; i++) {
    await timer(1);

    let promise;
    for (let j = i; j < mengerSponges.length; j++) {
      const sponge = mengerSponges[j];

      sponge.incrementIterations();
      promise = sponge.animateExcludedCubes(i + 1, scaleDown);
    }
    await promise;
  }

  await timer(1);
}

window.draw = () => {
  timer.update();


  background(0);

  ortho();

  rotateY(-0.2);
  rotateX(-0.2)

  ambientLight(50, 50, 50);
  directionalLight(255, 255, 255, 0, -1, -1);

  noStroke();

  scene.render();


  FrameCapture.update();
}
