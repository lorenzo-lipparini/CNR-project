
import videoSpecs from './videoSpecs.js';


interface Timer {
  lastFrame: number;
  callback: () => void;
}

/**
 * Array which stores the active timers.
 */
let timers: Timer[] = [];

/**
 * Returns a promise which resolves after the given time has passed;
 * timer.update() has to be called in draw() in order for this function to work.
 * 
 * @param duration The duration of the timer (in seconds) 
 */
function timer(duration: number): Promise<void> {
  return new Promise(resolve => {
    let frameDuration = Math.floor(duration * videoSpecs.frameRate);

    timers.push({
      lastFrame: frameCount + frameDuration,
      callback: resolve
    });
  });
}

namespace timer {

  /**
   * Public function that updates all the timers;
   * to be called at the beginning of draw().
   */
  export function update(): void {
    for (let i = 0; i < timers.length; i++) {
      if (frameCount > timers[i].lastFrame) { // If a timer has stopped
        // Fire the callback and remove it from the list
  
        timers[i].callback();
  
        timers.splice(i, 1);
        i--;
      }
    }
  }

}


export default timer;
