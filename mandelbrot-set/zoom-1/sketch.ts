
import videoSpecs from '../../lib/videoSpecs.js';
import FrameCapture from '../../lib/FrameCapture.js';
import { ExponentialAnimation, animate, updateAnimations } from '../../lib/animation.js';

import Mandelbrot from '../Mandelbrot.js';


let mandelbrot: Mandelbrot;

window.setup = () => {
  createCanvas(videoSpecs.resolution.x, videoSpecs.resolution.y, WEBGL);
  
  mandelbrot = new Mandelbrot([-0.7463, 0.1102], 1/4, 500);

  FrameCapture.acquire();

  main();
};

async function main() {

  await animate(mandelbrot, new ExponentialAnimation<Mandelbrot, 'zoomFactor'>('zoomFactor', 20, 50));

  FrameCapture.stop();
}

window.draw = () => {
  updateAnimations();
  mandelbrot.render();

  FrameCapture.update();
}
