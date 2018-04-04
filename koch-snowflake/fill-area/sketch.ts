
import videoSpecs from '../../lib/videoSpecs.js';
import FrameCapture from '../../lib/FrameCapture.js';

import KochSnowflake from '../KochSnowflake.js';
import { LinearAnimation, animate, updateAnimations } from '../../lib/animation.js';


let kochSnowflake: KochSnowflake;

let areaRectangle = { baseY: 0, maxHeight: 0, height: 0 };

window.setup = () => {
  createCanvas(videoSpecs.resolution.x, videoSpecs.resolution.y);

  kochSnowflake = new KochSnowflake(new p5.Vector(0, 0), width / 3, 5);

  frameRate(60);

  FrameCapture.acquire(3);

  main();
};

function main(): void {
  const sin60 = 0.8660254037844386;
  const cot60 = 0.5773502691896257;

  areaRectangle.baseY = kochSnowflake.side * (1/3 * sin60 + 1/2 * cot60);
  areaRectangle.maxHeight = 2 * (areaRectangle.baseY - kochSnowflake.center.x);

  animate(areaRectangle, new LinearAnimation<typeof areaRectangle, 'height'>('height', 3, areaRectangle.maxHeight, 0));
}

window.draw = () => {
  updateAnimations();


  background(0);
  
  translate(width / 2, height / 2);
  scale(1, -1);
  

  fill(50, 100, 255)
  noStroke();

  kochSnowflake.show();

  fill(0, 0, 0);
  rect(-width/2, areaRectangle.baseY, width, -areaRectangle.height);

  noFill();
  stroke(255, 255, 255);

  kochSnowflake.show();


  FrameCapture.update();  
};
