import videoSpecs from '../../lib/videoSpecs.js';
import FrameCapture from '../../lib/FrameCapture.js';
import { ExponentialAnimation, animate, updateAnimations } from '../../lib/animation.js';

import { MandelbrotRenderer } from '../mandelbrot.js';


let mandelbrot: MandelbrotRenderer;

window.setup = () => {
  createCanvas(videoSpecs.resolution.x, videoSpecs.resolution.y, WEBGL);
  
  mandelbrot = new MandelbrotRenderer([-0.23995, -0.83607], 1/8, 'auto', 'lerp-a');

  FrameCapture.acquire();

  main();
};

async function main() {

  await animate(mandelbrot, new ExponentialAnimation<MandelbrotRenderer, 'zoomFactor'>('zoomFactor', 30, 16000));

  FrameCapture.stop();
};

window.draw = () => {
  updateAnimations();
  
  mandelbrot.render();

  FrameCapture.update();
};
