'use strict'

let defaultColor;

let iterations = 2;

let mengerSponge;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);

  defaultColor = color(50, 100, 255);

  mengerSponge = new MengerSponge(new p5.Vector(0, 0, 0), 300, defaultColor, iterations);

  frameRate(60);

  main();
}

async function main() {

  mengerSponge.showExcludedCubes = true;

  function scaleDown(target, progress) {
    if (!target.originalSide) {
      target.originalSide = target.side;
    }

    target.side = (1 - progress) * target.originalSide;
  }

  function flash(target, progress) {
    // let flashColor = lerpColor(defaultColor, color('red'), 0.75);
    let flashColor = lerpColor(defaultColor, color('white'), 0.2);
    
    if (progress <= 0.25) {
      target.color = flashColor;
    } else if (progress <= 0.5) {
      target.color = defaultColor;
    } else if (progress <= 0.75) {
      target.color = flashColor;
    } else {
      target.color = defaultColor;
    }
  }


  await timer(60);

  for (let i = 1; i <= mengerSponge.iterations; i++) {
    await mengerSponge.animateExcludedCubes(i, 60, flash);
  
    await mengerSponge.animateExcludedCubes(i, 60, scaleDown);

    await timer(20);
  }
}


let angle = 0;

function draw() {
  
  timer.update();


  background(0);

  ambientLight(50, 50, 50);
  directionalLight(255, 255, 255, 0, -1, -1);

  rotateX(-0.2);
  rotateY(angle);
  angle += 0.01;

  noStroke();

  mengerSponge.show();

}
