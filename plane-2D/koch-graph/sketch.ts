
import videoSpecs from '../../lib/videoSpecs.js';
import FrameCapture from '../../lib/FrameCapture.js';
import timer from '../../lib/timer.js';
import Scene from '../../lib/Scene.js';

import Plane2D from '../Plane2D.js';
import Line from '../Line.js';
import Graph from '../Graph.js';

const scene = new Scene();

let plane: Plane2D;

window.setup = async () => {
  createCanvas(videoSpecs.resolution.x, videoSpecs.resolution.y);

  plane = new Plane2D(height / 3, [width/10, 9/10 * height]);

  FrameCapture.acquire();

  await main();

  FrameCapture.stop();
};

async function main() {
  const style = {
    alpha: 0,
    strokeWeight: plane.constantLength(5 * plane.pixelLength),
    dash: []
  };

  const perimeterGraph = new Graph(plane, x => (4/3) ** x, { ...style, rgb: [0, 0, 255] });
  const areaGraph = new Graph(plane, x => 1 + 1/3 * (1 - (4/9) ** x) / (1 - 4/9), { ...style, rgb: [0, 255, 0] });

  const areaLimit = 1 + 1/3 / (1 - 4/9);

  plane.grid.style.alpha = 0;
  scene.add(plane.grid, plane.xyAxes);

  await timer(1);

  await plane.grid.appear();

  await timer(0.5);

  scene.add(perimeterGraph);

  for (let n = 1; n <= 3; n++) {
    await perimeterGraph.highlightPoint(n, false);
  }

  await timer(0.5);

  perimeterGraph.style.alpha = 255;
  await perimeterGraph.drawFrom('left');

  await perimeterGraph.removeHighlightedPoints();

  await timer(1);
  await plane.zoom(2, 1/4);
  await timer(1);
  await plane.zoom(2, 4);
  await timer(1);

  scene.add(areaGraph);

  for (let n = 1; n < plane.minMaxValues.maxX; n++) {
    await areaGraph.highlightPoint(n, false);
  }

  await timer(0.5);

  areaGraph.style.alpha = 255;
  await areaGraph.drawFrom('left');

  await areaGraph.removeHighlightedPoints();

  await timer(1);
  
  await plane.zoom(2, 1/3);

  const asintote = new Line(plane.minMaxValues.maxX, areaLimit, 0, areaLimit, {
    rgb: [255, 255, 255],
    alpha: 255,
    strokeWeight: plane.constantLength(5 * plane.pixelLength),
    dash: [plane.constantLength(10 * plane.pixelLength)]
  });
  scene.add(asintote);

  // Always draw fro the start to prevent the line dash glitch
  await asintote.drawFrom('start', 2);

  // Prevent the line dash zoom glitch by ensuring that the start is always on screen while zooming
  const temp = asintote.start;
  asintote.start = asintote.end;
  asintote.end = temp;

  await timer(1);

  await plane.zoom(2, 4);

  await timer(1);

}

window.draw = () => {
  timer.update();

  background(0);

  plane.applyScale();

  scene.render();  

  FrameCapture.update();
};
