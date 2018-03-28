
import videoSpecs from './videoSpecs.js';


interface Animation<T> {
  frameDuration: number,
  update: AnimationFunction<T>,
  beginFrame: number,
  callback: () => void,
  scope: any
}

export interface AnimationFunction<T> {
  (instance: T, progress: number, scope: any): void
}

export class Animatable {

  private animations: Animation<this>[] = [];

  public constructor() { }

  // Keeps calling the update() function passing it this object,
  // a linear progress value between 0 and 1 and a 'scope' object
  // until the given time in seconds has passed in the video
  public animate(duration: number, update: AnimationFunction<this>): Promise<void> {
    return new Promise(resolve => {
      this.animations.push({
        frameDuration: Math.floor(duration * videoSpecs.frameRate),
        update,
        beginFrame: frameCount,
        callback: resolve,
        // Passed to the function as the third argument, if you need to
        // store custom values relative to the target
        // (such as initial values of animated propeties)
        // attach them to this object instead of the target
        scope: {}
      });
    });
  }

  protected updateAnimations() {

    for (let i = 0; i < this.animations.length; i++) {
      let animation = this.animations[i];

      let progress = (frameCount - animation.beginFrame) / animation.frameDuration;
      
      if (progress >= 1) { // If the animation has finished
        animation.update(this, 1, animation.scope); // Run the last frame

        animation.callback();

        this.animations.splice(i, 1); // Remove the animation
        i--; // Necessary, since an element has been removed from the array

        continue;
      }

      animation.update(this, progress, animation.scope);
    }

  }

}
