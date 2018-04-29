
import videoSpecs from './videoSpecs.js';
import { PlayingAnimation, Animation } from './animation.js';


/**
 * Represents a generic object in the scene which may be animated.
 */
export default class Animatable {

  /**
   * The animations currently playing on this object.
   */
  private animations: PlayingAnimation<this, keyof this>[] = [];


  /**
   * Plays an Animation on the object.
   * 
   * @param animation The animation to play
   */
  public animate(animation: Animation<this, keyof this>): Promise<void> {
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

}
