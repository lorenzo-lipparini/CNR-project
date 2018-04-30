
import { vertSrc, fragSrcs } from './shaders.js';

import { Animatable, Animation, LinearAnimation, HarmonicAnimation, ExponentialAnimation, PropertyAnimation } from '../lib/animation.js';


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
   * Renders the image of the fractal into the canvas, to be called in draw().
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
   * Smoothly zooms from the current center to the given one.
   * 
   * @param duration Length of the animation (in seconds)
   * @param zoomCenter Complex number to zoom on
   * @param zoomFactor Positive number which tells how much to zoom on the point
   */
  public zoomTo(duration: number, zoomCenter: [number, number], zoomFactor: number): Promise<void> {
    const zoomAnimation = new HarmonicAnimation<MandelbrotRenderer, 'zoomCenter'>('zoomCenter', duration, zoomCenter)
                  .parallel(new ExponentialAnimation<MandelbrotRenderer, 'zoomFactor'>('zoomFactor', duration, zoomFactor).harmonize());

    return this.renderer.animate(zoomAnimation);
  }

  /**
   * Creates a zoom animation where the camera zooms out until it shows both the points,
   * and then zooms on the target, all that while moving the center to the new position.
   * 
   * @param duration Length of the animation (in seconds)
   * @param zoomCenter Complex number to zoom on
   * @param zoomFactor Positive number which tells how much to zoom on the point
   */
  public jumpTo(duration: number, zoomCenter: [number, number], zoomFactor: number): Promise<void> {
    // At the intermediate zoom, it should be possible to see both complex numbers on the plane;
    // Setting the zoom to the inverse of the distance between the two complex numbers (scaled by some value) should do the trick
    const intermediateZoomFactor = 0.25 / Math.hypot(zoomCenter[0] - this.renderer.zoomCenter[0], zoomCenter[1] - this.renderer.zoomCenter[1]);

    // Progress value corresponding to the instant when the zoom changes direction
    const change = Math.log(intermediateZoomFactor / this.renderer.zoomFactor) / Math.log(intermediateZoomFactor * intermediateZoomFactor / (this.renderer.zoomFactor * zoomFactor));

    const translateAnimation = this.makeTranslateAnimation(duration, change, this.renderer.zoomCenter.splice(0), zoomCenter, this.renderer.zoomFactor, zoomFactor, intermediateZoomFactor);

    const zoomAnimation =
    // First get to the intermediate zoom
            new ExponentialAnimation<MandelbrotRenderer, 'zoomFactor'>('zoomFactor', change * duration, intermediateZoomFactor).harmonize()
    // Then get to the final value
    .concat(new ExponentialAnimation<MandelbrotRenderer, 'zoomFactor'>('zoomFactor', (1 - change) * duration, intermediateZoomFactor, zoomFactor).harmonize());

    const jumpAnimation = translateAnimation.parallel(zoomAnimation);

    return this.renderer.animate(jumpAnimation);
  }

  private makeTranslateAnimation(duration: number, change: number , z_a: number[], z_b: number[], f_a: number, f_b: number, f_m: number): Animation<MandelbrotRenderer, 'zoomCenter'> {
    
    // Pre-calculate as many values as possible to make the expression lighter to compute

    const log_f_a_f_m = Math.log(f_a/f_m);
    const log_f_m_f_b = Math.log(f_m/f_b);

    let k = [0, 0];

    let c_1 = [0, 0];
    let c_2 = [0, 0];
    for (let i = 0; i < 2; i++) {
      k[i] = (z_a[i] - z_b[i]) / (change * (1/f_a - 1/f_m)/log_f_a_f_m + (1 - change) * (1/f_m - 1/f_b)/log_f_m_f_b);

      c_1[i] = z_a[i] - k[i] *    change    / (f_a * log_f_a_f_m);
      c_2[i] = z_b[i] - k[i] * (1 - change) / (f_b * log_f_m_f_b);
    }

    return new PropertyAnimation<MandelbrotRenderer, 'zoomCenter'>('zoomCenter', duration,
      t => {
        const isFirstPhase = t <= change;

        t = isFirstPhase ?
          1/2 * (1 + Math.sin(Math.PI * (     t       /    change    - 1/2))) :
          1/2 * (1 + Math.sin(Math.PI * ((t - change) / (1 - change) - 1/2)));

        let value: [number, number] = [0, 0];

        for (let i = 0; i < 2; i++) {
          value[i] = isFirstPhase ?
            k[i] *    change    / (f_a * log_f_a_f_m) * Math.pow(f_a/f_m, t) + c_1[i] :
            k[i] * (1 - change) / (f_m * log_f_m_f_b) * Math.pow(f_m/f_b, t) + c_2[i];
        }

        return value;
      }
    );

  }

  public render(): void {
    this.renderer.render();
  }

}
