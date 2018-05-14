
import videoSpecs from '../../lib/videoSpecs.js';
import FrameCapture from '../../lib/FrameCapture.js';
import timer from '../../lib/timer.js';

import { MandelbrotRenderer, MandelbrotNavigator } from '../mandelbrot.js';

let navigator: MandelbrotNavigator;

window.setup = async () => {
  createCanvas(videoSpecs.resolution.x, videoSpecs.resolution.y, WEBGL);

  navigator = new MandelbrotNavigator(new MandelbrotRenderer([-1.12081, -0.26702], 150, 'auto', 'fire-red'));

  FrameCapture.acquire();

  await main();

  FrameCapture.stop();
}

async function main() {
  
  await timer(1);

  await navigator.jumpTo(10, [0.404518, -0.33899], 6);

  await timer(1);

  await navigator.jumpTo(8, [0.27348958333333334, 0.0059375], 1024);

  await timer(1);

  await navigator.jumpTo(15, [-0.7432918054284826, 0.13124097828468356], 7400);

  await timer(1);

}

window.draw = () => {
  timer.update();

  navigator.render();

  FrameCapture.update();
}
