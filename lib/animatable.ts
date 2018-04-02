import { OnGoingAnimation, AnimationFunction, Animation } from "./animation";
import videoSpecs from "./videoSpecs";


/**
 * A generic object of the scene which may be animated.
 */
export default class Animatable {

  private animations: OnGoingAnimation<this>[] = [];


  /**
   * Binds a custom animation to the object.
   * 
   * @param duration Duration of the animation (in seconds)
   * @param update Animation function, used to update the state of the object before drawing
   * 
   * @returns A promise which resolves when the animation is finished
   */
  public animate(duration: number, update: AnimationFunction<this>): Promise<void>;
  public animate(template: Animation<this>): Promise<void>;
  public animate(durationOrTemplate: number | Animation<this>, update?: AnimationFunction<this>): Promise<void> {
    return new Promise(resolve => {
      let animation;
      
      if (typeof durationOrTemplate === 'number') {
        let duration = durationOrTemplate;
        
        animation = {
          frameDuration: Math.floor(duration * videoSpecs.frameRate),
          update: update!, // In the second overload, the second parameter must be given
          beginFrame: frameCount,
          callback: resolve,
          scope: {}
        };
      } else {
        let template = durationOrTemplate;

        animation = {
          beginFrame: frameCount,
          
          frameDuration: template.frameDuration,
          update: template.update,
          scope: { initialValue: this[template.property] },
          callback: resolve
        };
      }

      this.animations.push(animation);
    });
  }

  /**
   * Updates the state of the target as indicated by the animations;
   * to be called before drawing the object.
   */
  protected updateAnimations(): void {
    
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

  /**
   * Draws the object on the canvas.
   */
  public show(): void { /* To be ovverrided */ }

}
