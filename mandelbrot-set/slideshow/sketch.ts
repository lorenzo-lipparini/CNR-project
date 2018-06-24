
import videoSpecs from '../../lib/videoSpecs.js';
import FrameCapture from '../../lib/FrameCapture.js';

import { MandelbrotRenderer, MandelbrotNavigator } from '../mandelbrot.js';


let navigator: MandelbrotNavigator;

window.setup = async () => {
  createCanvas(videoSpecs.resolution.x, videoSpecs.resolution.y, WEBGL);

  navigator = new MandelbrotNavigator(new MandelbrotRenderer([0, 0], 1, 'auto', 'fire-red'));


  FrameCapture.acquire();

  await main();

  FrameCapture.stop();
};

async function  main() {
  const velocityMag = 0.05;

  // Just specify the direction, the velocity will be trhe same for all the animations
  function slide(duration: number, startingPoint: [number, number], zoomFactor: number, direction: [number, number]): Promise<void> {
    const directionMag = Math.hypot(...direction);

    const velocity: [number, number] = [
      velocityMag/directionMag * direction[0],
      velocityMag/directionMag * direction[1]
    ];

    navigator.zoomCenter = startingPoint;
    navigator.zoomFactor = zoomFactor;
    return navigator.slide(duration, velocity);
  }

  const sequence: {
    start: number;
    startingPoint: [number, number];
    zoomFactor: number;
    direction: [number, number]
  }[] = [
    {
      start: 0,
      startingPoint: [-0.6118085993642455, 0.6141737323268374],
      zoomFactor: 35.510732996107976,
      direction: [1, 0]
    },
    {
      start: 3.55,
      startingPoint: [0.3397454649672274, 0.04553641985416588],
      zoomFactor: 1097.7319445967582,
      direction: [0, 1]
    },
    {
      start: 6.4,
      startingPoint: [-1.3119537816089444, -0.06891479238913285],
      zoomFactor: 512.1000536463698,
      direction: [0, -1]
    },
    {
      start: 10.6,
      startingPoint: [0.3534684695398727, 0.06458798659080858],
      zoomFactor: 8000.36620397253,
      direction: [-1, 0]
    }
  ];

  for (let i = 0; i < sequence.length; i++) {
    const { start, startingPoint, zoomFactor, direction } = sequence[i];

    const duration = (i === sequence.length - 1) ? 5 : (sequence[i + 1].start - start);

    await slide(duration, startingPoint, zoomFactor, direction);
  }

}

window.draw = () => {
  navigator.render();

  FrameCapture.update();
};
