
import videoSpecs from '/lib/videoSpecs.js';
import '/p5.js';


// Private array which stores the active timers
let timers = [];

// Public function that returns a promise which resolves after
// the given time in seconds has passed (in the video)
function timer(duration) {
  return new Promise(resolve => {
    let frameDuration = parseInt(duration * videoSpecs.frameRate);

    timers.push({
      lastFrame: frameCount + frameDuration,
      callback: resolve
    });
  });
}

// Public function that updates all the timers, to be called in draw()
timer.update = function() {
  for (let i = 0; i < timers.length; i++) {
    if (frameCount > timers[i].lastFrame) { // If a timer has stopped
      // Fire the callback and remove it from the list

      timers[i].callback();

      timers.splice(i, 1);
      i--;
    }
  }
};


export default timer;
