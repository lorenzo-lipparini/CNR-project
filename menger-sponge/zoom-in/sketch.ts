
import videoSpecs from '../../lib/videoSpecs.js';
import timer from '../../lib/timer.js';
import { PropertyAnimation, LinearAnimation, Animation, animate, updateAnimations } from '../../lib/animation.js';
import FrameCapture from '../../lib/FrameCapture.js';

import Cube from '../Cube.js';
import MengerSponge from '../MengerSponge.js';


let mengerSponge: MengerSponge;


window.setup = () => {
  createCanvas(videoSpecs.resolution.x, videoSpecs.resolution.y, WEBGL);

  mengerSponge = new MengerSponge([0, 0, 0], height / 2, [50, 100, 255], 0);

  frameRate(60);

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

    const flashWithColor = (clr: number[]) => new PropertyAnimation<Cube, 'color'>('color', 3, (progress, initialColor) =>
      progress <= 0.25 ? clr          :
      progress <= 0.50 ? initialColor :
      progress <= 0.75 ? clr          :
                         initialColor
    );

    const flashColor = lerpColor(color(mengerSponge.color), color('white'), 0.2);
    const cubeAnimation = flashWithColor([red(flashColor), green(flashColor), blue(flashColor)])
                  .concat(scaleDown);


    // TODO: Find a better way to darken colors
    const fadeRatio = 5;

    const outOfFocusSpongeColor = mengerSponge.color.map(value => value / fadeRatio);
    const fadeOutAnimation = new LinearAnimation<MengerSponge, 'color'>('color', 3, outOfFocusSpongeColor);

    const outOfFocusFlashColor = lerpColor(color(outOfFocusSpongeColor), color('white'), 0.2);
    const outOfFocusCubeAnimation = flashWithColor([red(outOfFocusFlashColor), blue(outOfFocusFlashColor), green(outOfFocusFlashColor)])
                            .concat(scaleDown);
    

    
    if (fatherSponge !== undefined) {
      for (let sponge of fatherSponge.childSponges.filter(sponge => sponge !== zoomedSponge)) {
        sponge.animateExcludedCubes(1, outOfFocusCubeAnimation);
      }
    }

    await zoomedSponge.animateExcludedCubes(1, cubeAnimation);


    fatherSponge = zoomedSponge;
    zoomedSponge = fatherSponge.childSponges[2];

    
    for (const sponge of fatherSponge.childSponges.filter(sponge => sponge !== zoomedSponge)) {
      sponge.animate(fadeOutAnimation);
    }

    const zoomAnimation = new LinearAnimation<typeof drawOptions, 'zoomPos'>('zoomPos', 3, zoomedSponge.pos)
                .parallel(new LinearAnimation<typeof drawOptions, 'zoomFactor'>('zoomFactor', 3, 2.5 * drawOptions.zoomFactor));

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
