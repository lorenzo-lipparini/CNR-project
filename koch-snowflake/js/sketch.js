
let kochSnowflake = new KochSnowflake(new p5.Vector(0, 0), 500, 5);

let animationDuration = 180;

function setup() {
  createCanvas(1920, 1080);

  frameRate(60);

  FrameCapture.acquire(180);
}


const sin60 = 0.8660254037844386;
const cot60 = 0.5773502691896257;
const baseY = -kochSnowflake.side * (1/3 * sin60 + 1/2 * cot60);

const maxHeight = 2 * (kochSnowflake.center.x - baseY);

function draw() {
  background(0);

  translate(width / 2, height / 2);
  scale(1, -1);
  

  fill(50, 100, 255)
  noStroke();

  kochSnowflake.show();
  
  fill(0);

  let progress = frameCount / animationDuration;
  progress = 1/2 + 1/2 * sin(PI * progress - PI / 2);

  rect(-width/2, -baseY, width, -maxHeight * (1 - progress));

  noFill();
  stroke(255);

  kochSnowflake.show();

  FrameCapture.update();  
}
