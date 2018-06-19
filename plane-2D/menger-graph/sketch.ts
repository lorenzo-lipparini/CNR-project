
import videoSpecs from '../../lib/videoSpecs.js';
import FrameCapture from '../../lib/FrameCapture.js';
import timer from '../../lib/timer.js';
import Scene from '../../lib/Scene.js';

import Plane2D from '../Plane2D.js';
import Graph from '../Graph.js';


const scene = new Scene();

let plane: Plane2D;

window.setup = async () => {
  createCanvas(videoSpecs.resolution.x, videoSpecs.resolution.y);

  plane = new Plane2D(height / 4, [width/10, 9/10 * height]);


  FrameCapture.acquire();

  await main();

  FrameCapture.stop();
};

async function main() {
  const style = {
    alpha: 255,
    strokeWeight: plane.constantLength(5 * plane.pixelLength),
    dash: []
  };

  const areaGraph = new Graph(plane, x => (4/3) ** x, { ...style, rgb: [255, 0, 0] });
  const volumeGraph = new Graph(plane, x => (20/27) ** x, { ...style, rgb: [255, 255, 0] });

  scene.add(plane.grid, plane.xyAxes, areaGraph, volumeGraph);

  plane.xyAxes.style.alpha = 0;
  plane.grid.style.alpha = 0;
  volumeGraph.style.alpha = 0;
  areaGraph.style.alpha = 0;

  await timer(1);

  await plane.xyAxes.fadeIn();

  await timer(0.5);

  await plane.grid.appear();

  await timer(0.5);

  await volumeGraph.highlightPoint(0);

  await timer(1);

  const { maxX } = plane.minMaxValues;

  for (let n = 1; n <= 2; n++) {
    await volumeGraph.highlightPoint(n, true);
    await timer(0.5);
  }

  await timer(1);
  
  for (let n = 3; n <= maxX; n++) {
    await volumeGraph.highlightPoint(n, false);
    await timer(0.1);
  }

  await timer(1);

  volumeGraph.style.alpha = 255;
  await volumeGraph.drawFrom('left');

  await volumeGraph.removeHighlightedPoints();

  await timer(2);

  await plane.zoom(1, 1/2.2);

  await timer(0.5);

  for (let i = 0; i < 2; i++) {
    await plane.zoom(1, 1/1.7);
  }

  await timer(2);

  await plane.zoom(2, 5);

  await timer(1);

  for (let n = 1; n <= 4; n++) {
    await areaGraph.highlightPoint(n, false);
  }

  areaGraph.style.alpha = 255;
  await areaGraph.drawFrom('left');

  areaGraph.removeHighlightedPoints();
  await plane.grid.fadeOut();

  await timer(1);

  await plane.zoom(4, 1/5);

  await timer(1);
}

window.draw = () => {
  timer.update();


  background(0);

  plane.applyScale();

  scene.render();


  FrameCapture.update();
};
