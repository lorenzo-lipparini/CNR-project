
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
}

async function main() {
  const mengerSponge = new MengerSponge([0, 0, 0], height/2, [50, 100, 255], 4);
  scene.add(mengerSponge);

  mengerSponge.showExcludedCubes = true;

  const scaleDown = new LinearAnimation<Cube, 'side'>('side', 3, 0);


  await timer(1);

  await mengerSponge.animateAllExcludedCubes(scaleDown);

  await timer(1);
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
}
