'use strict'

let timers = [];

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

  function scaleDown(target, progress) {
    if (!target.originalSide) {
      target.originalSide = target.side;
    }

    target.side = (1 - progress) * target.originalSide;
  }

  function redFlash(target, progress) {
    if (progress <= 0.25) {
      target.color = lerpColor(defaultColor, color('red'), 0.75);
    } else if (progress <= 0.5) {
      target.color = defaultColor;
    } else if (progress <= 0.75) {
      target.color = lerpColor(defaultColor, color('red'), 0.75);
    } else {
      target.color = defaultColor;
    }
  }


  await wait(60);

  await mengerSponge.animateSmallerCubes(1, 60, redFlash);
  
  await mengerSponge.animateSmallerCubes(1, 60, scaleDown);

  await wait(20);

  await mengerSponge.animateSmallerCubes(2, 60, redFlash);

  await mengerSponge.animateSmallerCubes(2, 60, scaleDown);

}


let angle = 0;

function draw() {
  
  updateTimers();

  background(0);

  ambientLight(50, 50, 50);

  directionalLight(255, 255, 255, 0, -1, -1);

  rotateX(-0.2);
  rotateY(angle);
  angle += 0.01;

  noStroke();

  mengerSponge.show();


}


function wait(duration) {
  return new Promise(resolve => {
    timers.push({
      duration,
      endFrame: frameCount + duration,
      callback: resolve
    });
  });
}

function updateTimers() {
  for (let i = 0; i < timers.length; i++) {
    let timer = timers[i];

    if (frameCount >= timer.endFrame) {
      timer.callback();

      timers.splice(i, 1);
      i--;
    }
  }
}