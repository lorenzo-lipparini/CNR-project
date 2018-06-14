
import videoSpecs from '../../lib/videoSpecs.js';
import FrameCapture from '../../lib/FrameCapture.js';
import timer from '../../lib/timer.js';

import Plane2D from '../Plane2D.js';
import Arrow from '../Arrow.js';


let plane: Plane2D;

let c: Arrow;
let z: Arrow;

window.setup = async () => {
  createCanvas(videoSpecs.resolution.x, videoSpecs.resolution.y);

  plane = new Plane2D(height / 5);
  
  c = new Arrow(plane, [255, 255, 0], [0.4, 0.5]);
  z = c.copy();
  z.color = [255, 255, 255];

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
  plane.applyScale();

  plane.xyAxes.show();
  
  noFill();

  stroke(255, 255, 255, 100);
  strokeWeight(5 * plane.pixelLength);

  ellipse(0, 0, 1);

  strokeWeight(5 * plane.pixelLength);
  stroke(255, 0, 0, (z.length <= 2) ? 100 : 255);

  ellipse(0, 0, 2);

  c.show();
  z.show();

  FrameCapture.update();
};
