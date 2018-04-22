
import Mandelbrot from '../Mandelbrot.js';


let mandelbrot: Mandelbrot;

window.setup = () => {
  createCanvas(600, 600, WEBGL);
  
  mandelbrot = new Mandelbrot([0, 0], 1/4, 100);

  noLoop();
};

window.draw = () => {
  mandelbrot.render();
}

window.mouseClicked = () => {
  mandelbrot.zoomCenter = [
    mandelbrot.zoomCenter[0] + 1/mandelbrot.zoomFactor * (mouseX - width/2) / width,
    mandelbrot.zoomCenter[1] + 1/mandelbrot.zoomFactor * (height/2 - mouseY) / width
  ];

  redraw();
};

window.keyPressed = () => {
  // @ts-ignore
  if (keyCode === UP_ARROW) {
    mandelbrot.zoomFactor *= 1.05;
    redraw();
  }
  // @ts-ignore
  if (keyCode === DOWN_ARROW) {
    mandelbrot.zoomFactor /= 1.05;
    redraw();
  }

  // @ts-ignore
  if (keyCode === LEFT_ARROW) {
    mandelbrot.maxIterations -= 10;
    redraw();
  }
  // @ts-ignore
  if (keyCode === RIGHT_ARROW) {
    mandelbrot.maxIterations += 10;
    redraw();
  }
}
