
import videoSpecs from '../../lib/videoSpecs.js';
import FrameCapture from '../../lib/FrameCapture.js';
import { LinearAnimation, HarmonicAnimation, animate, updateAnimations } from '../../lib/animation.js';
import timer from '../../lib/timer.js';
import Scene from '../../lib/Scene.js';

import Plane2D from '../Plane2D.js';
import Arrow from '../Arrow.js';


const scene = new Scene();

let plane: Plane2D;

let c: Arrow;
let z: Arrow;

const point = {
  pos: [0.4, 0.5],
  alpha: 0
};

const circle1: Circle = {
  center: [0, 0],
  radius: 1,
  shownAngle: 0
};

const circle2: Circle = {
  center: [0, 0],
  radius: 2,
  shownAngle: 0
};

window.setup = async () => {
  createCanvas(videoSpecs.resolution.x, videoSpecs.resolution.y);

  plane = new Plane2D(height / 5);

  ellipseMode(RADIUS);

  FrameCapture.acquire();

  await main();

  FrameCapture.stop();
};

async function main() {
  c = new Arrow(plane, [255, 255, 0], point.pos);

  z = c.copy();
  z.color = [255, 255, 255];

  plane.xyAxes.style.alpha = 0;

  scene.add(plane.xyAxes);

  const drawCircle = new HarmonicAnimation<Circle, 'shownAngle'>('shownAngle', 1, 0, 2 * Math.PI);


  await timer(1);

  await plane.xyAxes.fadeIn();

  await timer(1);

  await animate(point, new LinearAnimation<typeof point, 'alpha'>('alpha', 1, 0, 255));

  await timer(0.5);

  scene.add(c);
  await c.drawFromTail();

  await timer(0.5);

  await animate(point, new LinearAnimation<typeof point, 'alpha'>('alpha', 1, 255, 0));

  await timer(2);

  scene.add(z);
  await z.drawFromTail();

  // Show the two distinct arrows
  await z.moveTo([0, 30 * plane.pixelLength]);
  await timer(0.5);
  await z.moveTo([0, 0]);

  await timer(2);

  await z.showAngle();

  await timer(1);

  await z.changeAngle(2 * z.angle);

  await timer(2);

  await animate(circle1, drawCircle);

  await timer(1);

  await z.changeLength(z.length ** 2);

  await timer(2);

  await z.add(c);

  await timer(2);

  for (let i = 0; i < 2; i++) {
    await stepAlgorithm();
  }

  await timer(1);

  await animate(circle2, drawCircle);

  while (z.length <= 2) {
    await stepAlgorithm();
  }

  await timer(1);

}

async function stepAlgorithm() {
  await timer(2);

  await z.changeAngle(2 * z.angle);
  await timer(0.5);

  await z.changeLength(z.length ** 2);
  await timer(1);

  await z.add(c);
}

window.draw = () => {
  timer.update();
  updateAnimations();

  background(0);
  plane.applyScale();

  noStroke();
  fill(255, 255, 255, point.alpha);
  ellipse(point.pos[0], point.pos[1], 7.5 * plane.pixelLength);
  
  noFill();
  strokeWeight(5 * plane.pixelLength);
  
  stroke(255, 255, 255, 100);
  drawCircle(circle1);

  stroke(255, 0, 0, (z.length > 2) ? 255 : 100);
  drawCircle(circle2);

  scene.render();

  FrameCapture.update();
};


type Circle = {
  center: [number, number];
  radius: number;
  shownAngle: number;
};
function drawCircle(circle: Circle) {
  arc(
    circle.center[0],
    circle.center[1],
    circle.radius,
    circle.radius,
    // arc() gives problems when the start and end angles differ by a multiple of 2pi, this is a quick fix
    Math.PI / 2 - (
      (circle.shownAngle === 0)           ? +1/10**10  :
      (circle.shownAngle === 2 * Math.PI) ? -1/10**10 :
                                            circle.shownAngle
    ),
    Math.PI / 2    
  );
}
