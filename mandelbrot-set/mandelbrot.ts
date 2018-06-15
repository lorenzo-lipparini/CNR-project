
import { vertSrc, fragSrcs } from './shaders.js';

import View from '../lib/View.js';

/**
 * Provides a simple API for rendering the Mandelbrot set onto the canvas.
 */
export class MandelbrotRenderer {

  private autoMaxIterations = false;

  private _zoomCenter: [number, number] = [0, 0];
  private _zoomFactor: number = 0;
  private _maxIterations: number = 0;

  private shader: p5.Shader;


  /**
   * @param zoomCenter Initial value for the zoom center
   * @param zoomFactor Initial value for the zoom factor
   * @param maxIterations Initial value for the maximum number of iterations, should be an integer; if 'auto' is passed instead, the value is calculated automatically based on zoomFactor
   * @param colorPattern Name of the color pattern to use to render the fractal
   */
  public constructor(zoomCenter: [number, number], zoomFactor: number, maxIterations: number | 'auto', colorPattern: keyof typeof fragSrcs) {
    this.shader = createShader(vertSrc, fragSrcs[colorPattern]);
    
    // The shader must be assigned before any uniform is set
    shader(this.shader);

    if (maxIterations === 'auto') {
      this.autoMaxIterations = true;
    } else {
      this.maxIterations = maxIterations;
    }
    
    this.zoomCenter = zoomCenter;
    this.zoomFactor = zoomFactor;

    this.shader.setUniform('view', [width, height]);
  }

  public get zoomCenter() {
    return this._zoomCenter;
  }
  public set zoomCenter(value: [number, number]) {
    this._zoomCenter = value;
    this.shader.setUniform('zoomCenter', this.zoomCenter);
  }

  public get zoomFactor() {
    return this._zoomFactor;
  }
  public set zoomFactor(value: number) {
    this._zoomFactor = value;
    this.shader.setUniform('zoomFactor', this.zoomFactor);

    if (this.autoMaxIterations) {
      // This formula is kind of arbitrary, but works well enough
      // TODO: make maxIterations increase more
      this.maxIterations = 100 * Math.log(15 * this.zoomFactor);
    }
  }

  public get maxIterations() {
    return this._maxIterations;
  }
  public set maxIterations(value: number) {
    this._maxIterations = Math.floor(value);
    this.shader.setUniform('maxIterations', this.maxIterations);
  }


  /**
   * Renders the image of the fractal onto the canvas, to be called in draw().
   */
  public render(): void {
    // See https://p5js.org/reference/#/p5/createShader
    quad(-1, -1, 1, -1, 1, 1, -1, 1);
  }

}


/**
 * Makes it easy to create zoom animations from point to point in the Mandelbrot set.
 */
export class MandelbrotNavigator extends View {

  /**
   * @param renderer The renderer used to display the Mandelbrot set
   */
  public constructor(private readonly renderer: MandelbrotRenderer) {
    super();

    this.zoomCenter = this.renderer.zoomCenter;
    this.zoomFactor = this.renderer.zoomFactor;
  }

  public apply(): never {
    throw new Error('MandelbrotRenderer automatically takes care of the scale, so avoid using MandelbrotNavigator.applyScale()');
  }

  /**
   * Renders the image of the fractal onto the canvas, to be called in draw().
   */
  public render(): void {
    this.updateAnimations();

    // Apply the changes made to this object to the renderer
    this.renderer.zoomCenter = this.zoomCenter;
    this.renderer.zoomFactor = this.zoomFactor;

    this.renderer.render();
  }

}
