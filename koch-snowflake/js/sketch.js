
import videoSpecs from '/lib/videoSpecs.js';
import '/p5.js';
import FrameCapture from '/lib/FrameCapture.js';
import KochSnowflake from './KochSnowflake.js';

let kochSnowflake;

let animationDuration = 3;

window.setup = () => {
  createCanvas(videoSpecs.resolution.x, videoSpecs.resolution.y);

  kochSnowflake = new KochSnowflake(new p5.Vector(0, 0), width / 3, 5);

  frameRate(60);

  FrameCapture.acquire(3);
};

window.draw = () => {
  background(0);
  
  translate(width / 2, height / 2);
  scale(1, -1);
  

  fill(50, 100, 255)
  noStroke();

  kochSnowflake.show();


  const sin60 = 0.8660254037844386;
  const cot60 = 0.5773502691896257;
  const baseY = -kochSnowflake.side * (1/3 * sin60 + 1/2 * cot60);

  const maxHeight = 2 * (kochSnowflake.center.x - baseY);

  let progress = frameCount / (animationDuration * videoSpecs.frameRate);
  progress = 1/2 + 1/2 * sin(PI * progress - PI / 2);


  fill(0);

  rect(-width/2, -baseY, width, -maxHeight * (1 - progress));

  noFill();
  stroke(255);

  kochSnowflake.show();

  FrameCapture.update();  
};
