
import videoSpecs from '../../lib/videoSpecs.js';
import FrameCapture from '../../lib/FrameCapture.js';
import { LinearAnimation, HarmonicAnimation, ExponentialAnimation, animate, updateAnimations } from '../../lib/animation.js';
import timer from '../../lib/timer.js';
import Scene from '../../lib/Scene.js';

import MengerSponge from '../MengerSponge.js';
import Cube from '../Cube.js';


const globals = {
  rotation: [0, 0, 0],
  zoomFactor: 1,
  xAxisTilt: -0.2,
  strokeWeight: 0
};

const scene = new Scene();

window.setup = async () => {
  createCanvas(videoSpecs.resolution.x, videoSpecs.resolution.y, WEBGL);

  FrameCapture.acquire();

  await main();

  FrameCapture.stop();
};

async function main() {
  const mengerSponge = new MengerSponge([0, 0, 0], height / 2, [50, 100, 255], 0);
  mengerSponge.incrementIterations();
  scene.add(mengerSponge);

  mengerSponge.showExcludedCubes = true;

  const rotateTo = (rotation: number[]) =>
    new HarmonicAnimation<typeof globals, 'rotation'>('rotation', 2, rotation);

  const scaleDown = new LinearAnimation<Cube, 'side'>('side', 1, 0);

  await timer(1);
  await animate(globals, new LinearAnimation<typeof globals, 'strokeWeight'>('strokeWeight', 1, 0, 5));

  // The sequence of the cubes which will be shown, and the rotation required to show them with the camera
  const sequence = [
    { cubeIndex: 4, rotation: [ 0,  0,  0] },
    { cubeIndex: 0, rotation: [ 0,  1,  0] },
    { cubeIndex: 2, rotation: [ 0,  2,  0] },
    { cubeIndex: 6, rotation: [ 0,  3,  0] },
    { cubeIndex: 5, rotation: [ 1,  3,  0] },
    { cubeIndex: 1, rotation: [ 3,  3,  0] }
  ].map(({ cubeIndex, rotation }) => ({ cubeIndex, rotation: rotation.map(x => x * Math.PI / 2) })); // Convert the numbers to angles

  for (const { cubeIndex, rotation } of sequence) {
    const cube = mengerSponge.excludedCubes[cubeIndex];

    await animate(globals, rotateTo(rotation));
    await cube.animate(scaleDown);
    await timer(0.1);
  }

  await animate(globals, new ExponentialAnimation<typeof globals, 'zoomFactor'>('zoomFactor', 2, 1.5).harmonize()
                  .parallel(new HarmonicAnimation<typeof globals, 'xAxisTilt'>('xAxisTilt', 2, -0.1)));
  
  await timer(0.5);
  
  // Remove the cube in the center
  await mengerSponge.excludedCubes[3].animate(scaleDown);

  await timer(1);

}

window.draw = () => {
  timer.update();
  updateAnimations();


  background(0);

  rotateX(globals.xAxisTilt);

  rotateX(globals.rotation[0]);
  rotateY(globals.rotation[1]);
  rotateZ(globals.rotation[2]);

  ambientLight(50, 50, 50);
  directionalLight(255, 255, 255, 0, -1, -1);

  scale(globals.zoomFactor);

  strokeWeight(globals.strokeWeight);
  stroke(255, 255, 255);

  scene.render();


  FrameCapture.update();
};


