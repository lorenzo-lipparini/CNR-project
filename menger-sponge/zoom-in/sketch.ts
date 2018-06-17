
import videoSpecs from '../../lib/videoSpecs.js';
import FrameCapture from '../../lib/FrameCapture.js';
import timer from '../../lib/timer.js';
import { PropertyAnimation, LinearAnimation, HarmonicAnimation, animate, updateAnimations } from '../../lib/animation.js';

import Cube from '../Cube.js';
import MengerSponge from '../MengerSponge.js';


let mengerSponge: MengerSponge;


window.setup = () => {
  createCanvas(videoSpecs.resolution.x, videoSpecs.resolution.y, WEBGL);

  mengerSponge = new MengerSponge([0, 0, 0], height / 2, [50, 100, 255], 0);

  main();

  FrameCapture.acquire();
};

async function main() {

  mengerSponge.showExcludedCubes = true;

  let fatherSponge: MengerSponge | undefined = undefined;
  let zoomedSponge = mengerSponge;
  zoomedSponge.incrementIterations();

  for (let i = 0; i < 3; i++) {
    await timer(1);


    const scaleDown = new LinearAnimation<Cube, 'side'>('side', 1.5, 0);

    const flashWithColor = (flashColor: number[]) => new PropertyAnimation<Cube, 'color'>('color', 3,
    (progress, initialColor) =>
      progress <= 0.25 ? flashColor   :
      progress <= 0.50 ? initialColor :
      progress <= 0.75 ? flashColor   :
      initialColor
    );

    const lightenFactor = 0.2;
    const flashColor = mengerSponge.color.map(x => lightenFactor * 255 + (1 - lightenFactor) * x);

    const darkenFactor = 5;
    function darken(color: number[]) {
      return color.map(x => x / darkenFactor);
    }

    const fadeOutAnimation = new LinearAnimation<MengerSponge, 'color'>('color', 3, darken);
    
    if (fatherSponge !== undefined) {
      for (const sponge of fatherSponge.childSponges.filter(sponge => sponge !== zoomedSponge)) {
        sponge.animateExcludedCubes(1, flashWithColor(darken(flashColor)).concat(scaleDown));
      }
    }

    await zoomedSponge.animateExcludedCubes(1, flashWithColor(flashColor).concat(scaleDown));


    fatherSponge = zoomedSponge;
    zoomedSponge = fatherSponge.childSponges[2];


    for (const sponge of fatherSponge.childSponges.filter(sponge => sponge !== zoomedSponge)) {
      sponge.animate(fadeOutAnimation);
    }

    const zoomAnimation = new HarmonicAnimation<typeof drawOptions, 'zoomPos'>('zoomPos', 3, zoomedSponge.pos)
                .parallel(new HarmonicAnimation<typeof drawOptions, 'zoomFactor'>('zoomFactor', 3, 2.5 * drawOptions.zoomFactor));

    await animate(drawOptions, zoomAnimation);

    fatherSponge.incrementIterations();
  }

  FrameCapture.stop();
}

const drawOptions = {
  zoomPos: [0, 0, 0],
  zoomFactor: 1
};

window.draw = () => {
  timer.update();
  updateAnimations();
  
  
  background(0);

  ambientLight(50, 50, 50);
  directionalLight(255, 255, 255, 0, -1, -1);

  rotateX(-0.2);

  scale(drawOptions.zoomFactor);
  translate(-drawOptions.zoomPos[0], -drawOptions.zoomPos[1], -drawOptions.zoomPos[2]);


  noStroke();
  
  mengerSponge.show();


  FrameCapture.update();
};
