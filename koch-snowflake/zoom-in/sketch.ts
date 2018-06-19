
import videoSpecs from '../../lib/videoSpecs.js';
import FrameCapture from '../../lib/FrameCapture.js';
import timer from '../../lib/timer.js';
import Scene from '../../lib/Scene.js';
import View from '../../lib/View.js';

import KochSnowflake from '../KochSnowflake.js';
import { LinearAnimation } from '../../lib/animation.js';
import KochCurve from '../KochCurve.js';


const scene = new Scene();
const view = new View();


window.setup = async () => {
  createCanvas(videoSpecs.resolution.x, videoSpecs.resolution.y);

  FrameCapture.acquire();

  await main();

  FrameCapture.stop();
};

async function main() {
  const kochSnowflake = new KochSnowflake([0, 0], width/3, 6);
  scene.add(kochSnowflake);

  await timer(1);

  const tipY = kochSnowflake.side/2 / Math.cos(Math.PI / 6);
  await view.zoomToPoint(2, [0, tipY], 2);

  const bumpUp = new LinearAnimation<KochCurve, 'tanAngle'>('tanAngle', 1, 0, Math.tan(Math.PI / 3));

  let zoomedCurves = [kochSnowflake.childCurves[2], kochSnowflake.childCurves[0]];

  for (let i = 0; i < 3; i++) {
    for (const curve of zoomedCurves) {
      curve.incrementIterations();

      // Prevent the 'flash' effect when the new spikes appear
      curve.animateIteration(curve.iterations, bumpUp);
    }

    await view.zoom(1, 3);
    await timer(0.2);

    zoomedCurves = [zoomedCurves[0].childCurves[3], zoomedCurves[1].childCurves[0]];
  }

  await timer(1);

}

window.draw = () => {
  timer.update();
  
  background(0);

  view.apply();

  noFill();
  stroke(255, 255, 255);
  // Ensure that the stroke weight isn't influenced by the zoom factor
  strokeWeight(1 / view.zoomFactor);

  scale(1);

  scene.render();

  FrameCapture.update();
};
