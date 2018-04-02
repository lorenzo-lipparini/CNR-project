
import videoSpecs from "./videoSpecs.js";
import { PlayingAnimation, Animation } from "./animation.js";


/**
 * A generic object of the scene which may be animated.
 */
export default class Animatable {

  private animations: PlayingAnimation<this, any>[] = [];


  /**
   * Binds a custom animation to the object.
   * 
   * @param duration Duration of the animation (in seconds)
   * @param update Animation function, used to update the state of the object before drawing
   * 
   * @returns A promise which resolves when the animation is finished
   */
  public animate<U extends keyof this>(animation: Animation<this, U>): Promise<void> {
    return new Promise(resolve => {
      this.animations.push(new PlayingAnimation(this, animation, resolve));
    });
  }

  /**
   * Updates the state of the target as indicated by the animations;
   * to be called before drawing the object.
   */
  protected updateAnimations(): void {
    
    for (let i = 0; i < this.animations.length; i++) {
      
      if (this.animations[i].update()) { // If the animation has finished
        this.animations.splice(i, 1);
        i--;
      }
      
    }

  }

  /**
   * Draws the object on the canvas.
   */
  public show(): void { /* To be ovverrided */ }

}
