
import videoSpecs from '../../lib/videoSpecs.js';
import FrameCapture from '../../lib/FrameCapture.js';

import { MandelbrotRenderer, MandelbrotNavigator } from '../mandelbrot.js';


let navigator: MandelbrotNavigator;

window.setup = async () => {
  createCanvas(videoSpecs.resolution.x, videoSpecs.resolution.y, WEBGL);
  
  const renderer = new MandelbrotRenderer([0, 0], 1/8, 'auto', 'blue-to-red');

  navigator = new MandelbrotNavigator(renderer);

  FrameCapture.acquire();

  await main();

  FrameCapture.stop();
};

async function main() {
  await navigator.zoomTo(20, [0.3512238, 0.4245845], 8000);
}

window.draw = () => {
  navigator.render();

  FrameCapture.update();
}
