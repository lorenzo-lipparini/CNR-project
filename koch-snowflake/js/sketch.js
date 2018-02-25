
let kochSnowflake = new KochSnowflake(new p5.Vector(0, 0), 500, 5);

function setup() {
  createCanvas(windowWidth, windowHeight);

  noLoop();
}

function draw() {
  background(0);

  translate(width / 2, height / 2);
  scale(1, -1);
  

  stroke(255);
  noFill();

  kochSnowflake.show();
}