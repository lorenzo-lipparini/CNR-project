
import { PropertyAnimation, HarmonicAnimation, ExponentialAnimation, Animatable } from './animation.js';


/**
 * Provides a simple camera API for two-dimensional spaces
 * which makes it easy to zoom into specific points on the plane.
 */
export default class View extends Animatable {

  public zoomCenter: [number, number] = [0, 0];
  public zoomFactor: number = 1;


  /**
   * Transforms the coordinate space according to zoomCenter and zoomFactor;
   * To be called at the beginning of draw() after setting the background.
   */
  public apply(): void {
    this.updateAnimations();

    translate(-this.zoomCenter[0], -this.zoomCenter[1]);
    scale(this.zoomFactor);
  }

  /**
   * Smoothly zooms from the current position to the given one while adjusting the zoom.
   * 
   * @param duration Duration of the animation (in seconds)
   * @param zoomCenter Point to zoom on
   * @param zoomFactor Positive number which tells how much to zoom on the point
   */
  public zoomTo(duration: number, zoomCenter: [number, number], zoomFactor: number): Promise<void> {
    const zoomAnimation = this.makeTranslateAnimation(duration, zoomCenter, zoomFactor)
                .parallel(new ExponentialAnimation<View, 'zoomFactor'>('zoomFactor', duration, zoomFactor))
                .harmonize();

    return this.animate(zoomAnimation);
  }

  /**
   * Creates a zoom animation where the camera zooms out until it shows both the points
   * and then zooms on the target, all that while moving to the new position.
   * 
   * @param duration Duration of the animation (in seconds)
   * @param zoomCenter Point to zoom on
   * @param zoomFactor Positive number which tells how much to zoom on the point
   */
  public async jumpTo(duration: number, zoomCenter: [number, number], zoomFactor: number): Promise<void> {
    const [intermediateZoomCenter, intermediateZoomFactor] = this.calculateIntermediateZoomValues(zoomCenter, zoomFactor);
    // Instant in time when the zoom changes direction
    const change = duration * Math.log(intermediateZoomFactor / this.zoomFactor) / Math.log(intermediateZoomFactor * intermediateZoomFactor / (this.zoomFactor * zoomFactor));

    await this.zoomTo(change, intermediateZoomCenter, intermediateZoomFactor);
    await this.zoomTo(duration - change, zoomCenter, zoomFactor);
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
