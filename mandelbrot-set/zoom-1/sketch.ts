import videoSpecs from '../../lib/videoSpecs.js';
import FrameCapture from '../../lib/FrameCapture.js';
import { ExponentialAnimation, animate, updateAnimations } from '../../lib/animation.js';

import Mandelbrot from '../Mandelbrot.js';


let mandelbrot: Mandelbrot;

window.setup = () => {
  createCanvas(videoSpecs.resolution.x, videoSpecs.resolution.y, WEBGL);
  
  mandelbrot = new Mandelbrot([-0.23995, -0.83607], 1/4, true, 'fire-red');

  FrameCapture.acquire();

  main();
};

async function main() {

  await animate(mandelbrot, new ExponentialAnimation<Mandelbrot, 'zoomFactor'>('zoomFactor', 30, 16000));

  FrameCapture.stop();
}

window.draw = () => {
  updateAnimations();
  
  mandelbrot.render();

  FrameCapture.update();
}
