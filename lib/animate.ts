
import { Animation, PlayingAnimation } from './animation.js';


let globalAnimations: PlayingAnimation<any, any>[] = [];

/**
 * Plays a given animation on a given object.
 * 
 * @param target The object to animate
 * @param animation The animation to play on the object
 */
export function animate<T, U extends keyof T>(target: T, animation: Animation<T, U>): Promise<void> {
  return new Promise(resolve => {
    globalAnimations.push(new PlayingAnimation(target, animation, resolve));
  });
}

/**
 * Updates all the animations created with animate();
 * to be called at the beginning of draw().
 */
export function updateAnimations(): void {
  for (let i = 0; i < globalAnimations.length; i++) {
    if (globalAnimations[i].update()) { // If the animation has finished
      // Fire the callback and remove it from the list

      globalAnimations[i].callback();

      globalAnimations.splice(i, 1);
      i--;
    }
  }
}
