
// Private array which stores the active timers
let timers = [];

// Public function that returns a promise which resolves after the given number of frames is processed
function timer(duration) {
  return new Promise(resolve => {
    timers.push({
      endFrame: frameCount + duration,
      callback: resolve
    });
  });
}

// Public function which updates all the timers, to be called in draw
timer.update = function() {
  for (let i = 0; i < timers.length; i++) {
    if (frameCount >= timers[i].endFrame) { // If a timer has stopped
      // Fire the callback and remove it from the list

      timers[i].callback();

      timers.splice(i, 1);
      i--;
    }
  }
};


export default timer;
