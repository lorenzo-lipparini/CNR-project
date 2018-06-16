
import { Animation, PlayingAnimation } from './animation.js';


/**
 * Stores animations of any property of any object.
 */
let globalAnimations: PlayingAnimation<any, any>[] = [];

/**
 * Plays a given animation on a given object.
 * 
 * @param target The object to animate
 * @param animation The animation to play on the object
 */
export function animate<T, K extends keyof T>(target: T, animation: Animation<T, K>): Promise<void> {
  return new Promise(resolve => {
    globalAnimations.push(new PlayingAnimation(target, animation, resolve));
  });
}

/**
 * Updates all the animations created with animate(),
 * if a target is passed, it only updates the animations bound to that target.
 * to be called at the beginning of draw().
 * 
 * @param target Target of the animations to update
 */
export function updateAnimations(target?: any): void {
  for (let i = 0; i < globalAnimations.length; i++) {
    // If this is the target or there is no specific target
    if (target === undefined || globalAnimations[i].target === target) {
      if (globalAnimations[i].update()) { // If the animation has finished
        // Fire the callback and remove it from the list
  
        globalAnimations[i].callback();
  
        globalAnimations.splice(i, 1);
        i--;
      }
    }
  }
}
