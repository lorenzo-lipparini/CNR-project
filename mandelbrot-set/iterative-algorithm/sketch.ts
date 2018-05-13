
import videoSpecs from '../../lib/videoSpecs.js';
import FrameCapture from '../../lib/FrameCapture.js';
import timer from '../../lib/timer.js';

import Arrow from '../Arrow.js';


const c = new Arrow([255, 255, 0], [0.4, 0.5]);
const z = c.copy();
z.color = [255, 255, 255];

window.setup = async () => {
  createCanvas(videoSpecs.resolution.x, videoSpecs.resolution.y);

  ellipseMode(RADIUS);

  FrameCapture.acquire();

  await main();

  FrameCapture.stop();
};

async function main() {
  await timer(1);

  await z.showAngle();

  while (z.length <= 2) {
    await timer(2);

    await z.changeAngle(2 * z.angle);
    await timer(0.5);

    await z.changeLength(z.length ** 2);
    await timer(1);

    await z.add(c);
  }

  await timer(1);
}

window.draw = () => {
  timer.update();

  background(0);
  noFill();

  translate(width / 2, height / 2);
  scale(height / 4.5, -height / 4.5);

  stroke(255, 255, 255, 100);
  strokeWeight(0.005);

  ellipse(0, 0, 1);

  strokeWeight((z.length <= 2) ? 0.005 : 0.02);
  stroke(255, 0, 0, (z.length <= 2) ? 100 : 255);

  ellipse(0, 0, 2);

  Arrow.showAll();

  FrameCapture.update();
};
