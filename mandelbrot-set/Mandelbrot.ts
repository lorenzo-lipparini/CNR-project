
import { vertSrc, fragSrcs } from './shaders.js';

import { Animatable, Animation, ExponentialAnimation, PropertyAnimation } from '../lib/animation.js';


/**
 * Provides a simple api to render the Mandelbrot set onto the canvas.
 */
export class MandelbrotRenderer extends Animatable {

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
    super();
    
    // The shader must be created inside setup(), so make sure to call this constructor inside that function
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
    this.updateAnimations();

    // See https://p5js.org/reference/#/p5/createShader
    quad(-1, -1, 1, -1, 1, 1, -1, 1);
  }

}


/**
 * Makes it easy to create zoom animations from point to point in the Mandelbrot set.
 */
export class MandelbrotNavigator {

  /**
   * @param renderer The renderer used to display the Mandelbrot set
   */
  constructor(private readonly renderer: MandelbrotRenderer) { }

  /**
   * Smoothly zooms from the current position to the given one while adjusting the zoom.
   * 
   * @param duration Length of the animation (in seconds)
   * @param zoomCenter Complex number to zoom on
   * @param zoomFactor Positive number which tells how much to zoom on the point
   */
  public zoomTo(duration: number, zoomCenter: [number, number], zoomFactor: number): Promise<void> {
    const zoomAnimation = this.makeTranslateAnimation(duration, this.renderer.zoomCenter, zoomCenter, this.renderer.zoomFactor, zoomFactor)
                .parallel(new ExponentialAnimation<MandelbrotRenderer, 'zoomFactor'>('zoomFactor', duration, zoomFactor))
                .harmonize();

    return this.renderer.animate(zoomAnimation);
  }

  /**
   * Creates a zoom animation where the camera zooms out until it shows both the points on the plane
   * and then zooms on the target, all that while moving to the new position.
   * 
   * @param duration Length of the animation (in seconds)
   * @param zoomCenter Complex number to zoom on
   * @param zoomFactor Positive number which tells how much to zoom on the point
   */
  public async jumpTo(duration: number, zoomCenter: [number, number], zoomFactor: number): Promise<void> {
    const [intermediateZoomCenter, intermediateZoomFactor] = this.calculateIntermediateZoomValues(this.renderer.zoomCenter, zoomCenter, this.renderer.zoomFactor, zoomFactor);
    // Instant in time when the zoom changes direction
    const change = duration * Math.log(intermediateZoomFactor / this.renderer.zoomFactor) / Math.log(intermediateZoomFactor * intermediateZoomFactor / (this.renderer.zoomFactor * zoomFactor));

    await this.zoomTo(change, intermediateZoomCenter, intermediateZoomFactor);
    await this.zoomTo(duration - change, zoomCenter, zoomFactor);
  }

  private makeTranslateAnimation(duration: number, z_a: [number, number], z_b: [number, number], f_a: number, f_b: number): Animation<MandelbrotRenderer, 'zoomCenter'> {
    return new PropertyAnimation<MandelbrotRenderer, 'zoomCenter'>('zoomCenter', duration, t => {
      const f_t = this.renderer.zoomFactor;

      let value: [number, number] = [0, 0];
      for (let i = 0; i < 2; i++) {
        value[i] = z_a[i] + (1 - f_a/f_t)/(1 - f_a/f_b) * (z_b[i] - z_a[i]);
      }

      return value;
    });
  }

  private calculateIntermediateZoomValues(z_a: [number, number], z_b: [number, number], f_a: number, f_b : number): [[number, number], number] {
    
    // At the intermediate zoom, it should be possible to see both complex numbers on the plane;
    // Setting the zoom to the inverse of the distance between the two complex numbers (scaled by some factor) should do the trick
    const f_m = 0.25 / Math.hypot(z_b[0] - z_a[0], z_b[1] - z_a[1]);
    
    // The intermediate center is chosen as the only point such that
    // the resulting maximum translational velocity in the two zooms is the same
    let z_m: [number, number] = [0, 0];

    for (let i = 0; i < 2; i++) {
      z_m[i] = ((1/f_m - 1/f_b) * Math.log(f_a/f_m) * z_a[i] + (1/f_a - 1/f_m) * Math.log(f_m/f_b) * z_b[i])
             / ((1/f_m - 1/f_b) * Math.log(f_a/f_m)          + (1/f_a - 1/f_m) * Math.log(f_m/f_b));
    }

    return [z_m, f_m];
  }


  /**
   * Renders the image of the fractal onto the canvas, to be called in draw().
   */
  public render(): void {
    this.renderer.render();
  }

}
