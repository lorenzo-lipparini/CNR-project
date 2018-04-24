
import { vertSrc, fragSrcs } from './shaders.js';


export default class Mandelbrot {

  private autoMaxIterations = false;

  private _zoomCenter: [number, number] = [0, 0];
  private _zoomFactor: number = 0;
  private _maxIterations: number = 0;

  private shader: p5.Shader;

  /**
   * @param zoomCenter Initial value for the zoom center
   * @param zoomFactor Initial value for the zoom factor
   * @param maxIterations Initial value for the maximum number of iterations, should be an integer; if true is passed instead, the value is calculated automatically based on zoomFactor
   */
  public constructor(zoomCenter: [number, number], zoomFactor: number, maxIterations: number | true, colorPattern: keyof typeof fragSrcs) {
    // The shader must be created inside setup(), so make sure to call this constructor inside that function
    this.shader = createShader(vertSrc, fragSrcs[colorPattern]);
    
    // The shader must be assigned before any uniform is set
    shader(this.shader);
    
    this.zoomCenter = zoomCenter;
    this.zoomFactor = zoomFactor;

    if (typeof maxIterations === 'number') {
      this.maxIterations = maxIterations;
    } else {
      this.autoMaxIterations = true;
    }

    this.shader.setUniform('view', [width, height]);
  }

  public set zoomCenter(value: [number, number]) {
    this._zoomCenter = value;
    this.shader.setUniform('zoomCenter', this.zoomCenter);
  }
  public get zoomCenter() {
    return this._zoomCenter;
  }

  public set zoomFactor(value: number) {
    this._zoomFactor = value;
    this.shader.setUniform('zoomFactor', this.zoomFactor);

    if (this.autoMaxIterations) {
      // This formula is kind of arbitrary, but works well enough
      this.maxIterations = 110 * Math.log(10 * this.zoomFactor);
    }
  }
  public get zoomFactor() {
    return this._zoomFactor;
  }

  public set maxIterations(value: number) {
    this._maxIterations = Math.floor(value);
    this.shader.setUniform('maxIterations', this.maxIterations);
  }
  public get maxIterations() {
    return this._maxIterations;
  }


  /**
   * Renders the image of the fractal into the canvas, to be called in draw().
   */
  public render(): void {
    // See https://p5js.org/reference/#/p5/createShader
    quad(-1, -1, 1, -1, 1, 1, -1, 1);
  }

}
