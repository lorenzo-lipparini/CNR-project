
import videoSpecs from '../../lib/videoSpecs.js';
import timer from '../../lib/timer.js';
import FrameCapture from '../../lib/FrameCapture.js';

import Cube from '../Cube.js';
import MengerSponge from '../MengerSponge.js';


const angularVelocity = 1/15 * (2 * Math.PI / 60);

let defaultColor: p5.Color;

let mengerSponge: MengerSponge;


window.setup = () => {
  createCanvas(videoSpecs.resolution.x, videoSpecs.resolution.y, WEBGL);

  defaultColor = color(50, 100, 255);

  mengerSponge = new MengerSponge(new p5.Vector(0, 0, 0), height / 2, defaultColor, 0);

  frameRate(60);

  main();

  FrameCapture.acquire();
};

async function main() {

  mengerSponge.showExcludedCubes = true;

  function scaleDown(target: Cube, progress: number, scope: { originalSide: number }) {
    if (!scope.originalSide) {
      scope.originalSide = target.side;
    }

    target.side = (1 - progress) * scope.originalSide;
  }

  function flash(target: Cube, progress: number) {
    // let flashColor = lerpColor(defaultColor, color('red'), 0.75);
    let flashColor = lerpColor(defaultColor, color('white'), 0.2);
    
    if (progress <= 0.25) {
      target.color = flashColor;
    } else if (progress <= 0.5) {
      target.color = defaultColor;
    } else if (progress <= 0.75) {
      target.color = flashColor;
    } else {
      target.color = defaultColor;
    }
  }

  
  await timer(1);

  while (mengerSponge.iterations < 3) {
    mengerSponge.incrementIterations();

    await mengerSponge.animateExcludedCubes(mengerSponge.iterations, 3, flash);
  
    await mengerSponge.animateExcludedCubes(mengerSponge.iterations, 2, scaleDown);

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
