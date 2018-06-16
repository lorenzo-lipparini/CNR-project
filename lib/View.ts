
import { PropertyAnimation, HarmonicAnimation, ExponentialAnimation, Animatable } from './animation.js';


/**
 * Provides a simple camera API for two-dimensional spaces
 * which makes it easy to zoom into specific points on the plane.
 */
export default class View extends Animatable {

  /**
   * Decides whether the zoomFactor parameter of zoom(), zoomToPoint() and jumpToPoint()
   * is considered to be relative to the current zoomFactor or not.
   */
  public zoomMode: 'absolute' | 'relative' = 'relative';

  public zoomCenter: [number, number] = [0, 0];
  public zoomFactor: number = 1;


  /**
   * Transforms the coordinate space according to zoomCenter and zoomFactor;
   * The origin of the frame of reference will correspond to the center of the canvas,
   * the x-axis will point right and the y-axis will point up;
   * To be called at the beginning of draw after setting the background before any other transformation.
   */
  public apply(): void {
    this.updateAnimations();

    // Center the camera and change the direction of the axes
    translate(width/2, height/2);
    scale(1, -1);

    scale(this.zoomFactor);
    translate(-this.zoomCenter[0], -this.zoomCenter[1]);
  }

  /**
   * Smoothly moves the camera to the given position without changing the zoom.
   * 
   * @param duration Duration of the animation (in seconds)
   * @param zoomCenter Point to move the camera to
   */
  public moveTo(duration: number, zoomCenter: [number, number]): Promise<void> {
    return this.animate(new HarmonicAnimation<View, 'zoomCenter'>('zoomCenter', duration, zoomCenter));
  }

  /**
   * Smoothly moves the camera by some amount without changing the zoom.
   * 
   * @param duration Duration of the animation (in seconds)
   * @param amount Vector along which the camera should be moved
   */
  public moveBy(duration: number, amount: [number, number]): Promise<void> {
    return this.moveTo(duration, [this.zoomCenter[0] + amount[0], this.zoomCenter[1] + amount[1]]);
  }

  /**
   * Smoothly changes the zoomFactor without altering the position of the camera.
   * 
   * @param duration Duration of the animation (in seconds)
   * @param zoomFactor Determines the final zoom value (see zoomMode)
   */
  public zoom(duration: number, zoomFactor: number): Promise<void> {
    zoomFactor = this.toAbsolute(zoomFactor);
  
    return this.animate(new ExponentialAnimation<View, 'zoomFactor'>('zoomFactor', duration, zoomFactor * this.zoomFactor).harmonize());
  }

  /**
   * Smoothly moves the camera from the current position to the given one while changing the zoom.
   * 
   * @param duration Duration of the animation (in seconds)
   * @param zoomCenter Point to zoom on
   * @param zoomFactor Determines the final zoom value (see zoomMode)
   */
  public zoomToPoint(duration: number, zoomCenter: [number, number], zoomFactor: number): Promise<void> {
    // This limiting case breaks the formula, so use a fast path
    if (this.toAbsolute(zoomFactor) === this.zoomFactor) {
      return this.moveTo(duration, zoomCenter);
    }

    zoomFactor = this.toAbsolute(zoomFactor);

    const zoomAnimation = this.makeTranslateAnimation(duration, zoomCenter, zoomFactor)
                .parallel(new ExponentialAnimation<View, 'zoomFactor'>('zoomFactor', duration, zoomFactor))
                .harmonize();

    return this.animate(zoomAnimation);
  }

  /**
   * Plays an animation where the camera zooms out until it shows both the points
   * and then zooms into the target, all that while moving to the new position.
   * 
   * @param duration Duration of the animation (in seconds)
   * @param zoomCenter Point to zoom on
   * @param zoomFactor Determines the final zoom value (see zoomMode)
   */
  public async jumpToPoint(duration: number, zoomCenter: [number, number], zoomFactor: number): Promise<void> {
    zoomFactor = this.toAbsolute(zoomFactor);   

    const [intermediateZoomCenter, intermediateZoomFactor] = this.calculateIntermediateZoomValues(zoomCenter, zoomFactor);
    // Instant in time when the zoom changes direction
    const change = duration * Math.log(intermediateZoomFactor / this.zoomFactor) / Math.log(intermediateZoomFactor * intermediateZoomFactor / (this.zoomFactor * zoomFactor));

    await this.zoomToPoint(change, intermediateZoomCenter, intermediateZoomFactor);
    await this.zoomToPoint(duration - change, zoomCenter, zoomFactor);
  }


  /**
   * Takes a zoomFactor which might be relative and returns the corresponding non-relative value;
   * The result is based on the current zoomMode.
   * 
   * @param zoomFactor The value to convert
   */
  private toAbsolute(zoomFactor: number): number {
    return (this.zoomMode === 'relative') ? zoomFactor * this.zoomFactor : zoomFactor;
  }

  private makeTranslateAnimation(duration: number, z_b: [number, number], f_b: number): PropertyAnimation<View, 'zoomCenter'> {
    const z_a = this.zoomCenter;
    const f_a = this.zoomFactor;

    return new PropertyAnimation<View, 'zoomCenter'>('zoomCenter', duration, t => {
      const f_t = this.zoomFactor;

      let value: [number, number] = [0, 0];
      for (let i = 0; i < 2; i++) {
        value[i] = z_a[i] + (1 - f_a/f_t)/(1 - f_a/f_b) * (z_b[i] - z_a[i]);
      }

      return value;
    });
  }

  private calculateIntermediateZoomValues(z_b: [number, number], f_b : number): [[number, number], number] {
    const z_a = this.zoomCenter;
    const f_a = this.zoomFactor;

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

}
