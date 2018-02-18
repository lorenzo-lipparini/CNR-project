'use strict'

let angle = 0;


let iterations  = 1;

let mengerSponge = new MengerSponge(new p5.Vector(0, 0, 0), 300, iterations);

function setup() {
  createCanvas(600, 600, WEBGL);
}

function draw() {
  background(0);

  directionalLight(255, 255, 255, 0, -1, -1);

  rotateX(-0.2);
  rotateY(angle);
  angle += 0.01;

  ambientMaterial(50, 100, 255);
  noStroke();

  mengerSponge.show();
}

function keyPressed() {
  if (keyCode === ENTER) {
    iterations = iterations % 5 + 1;
  } else if (key === 'R') {
    iterations = 1;
  }
  mengerSponge = new MengerSponge(new p5.Vector(0, 0, 0), 300, iterations);
}