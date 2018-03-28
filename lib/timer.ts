
import videoSpecs from './videoSpecs.js';


interface Timer {
  lastFrame: number,
  callback: () => void
}

// Private array which stores the active timers
let timers: Timer[] = [];

/**
 * Public function that returns a promise which resolves after
 * the given time has passed
 * 
 * @param duration The duration of the timer (in seconds) 
 */
function timer(duration: number) {
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
   * Public function that updates all the timers, to be called in draw()
   */
  export function update() {
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
