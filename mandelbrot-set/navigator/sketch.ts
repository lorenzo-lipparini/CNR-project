
import { MandelbrotRenderer } from '../mandelbrot.js';


let mandelbrot: MandelbrotRenderer;

let zoomIncrement = 1.1;

window.setup = () => {
  createCanvas(600, 600, WEBGL);
  
  mandelbrot = new MandelbrotRenderer([0, 0], 1/4, 'auto', 'fire-red');

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
    mandelbrot.zoomFactor *= zoomIncrement;
    redraw();
  }
  // @ts-ignore
  if (keyCode === DOWN_ARROW) {
    mandelbrot.zoomFactor /= zoomIncrement;
    redraw();
  }

  // @ts-ignore
  if (keyCode === LEFT_ARROW) {
    zoomIncrement /= 1.1;
  }
  // @ts-ignore
  if (keyCode === RIGHT_ARROW) {
    zoomIncrement *= 1.1;
  }

  // @ts-ignore
  if (keyCode === ENTER) {
    console.log(mandelbrot.zoomCenter, mandelbrot.zoomFactor);
  }
}
