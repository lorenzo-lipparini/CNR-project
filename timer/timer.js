'use strict'

// Public function that returns a promise which resolves after the given number of frames is processed
function timer(duration) {
  return new Promise(resolve => {
    timer._timers.push({
      endFrame: frameCount + duration,
      callback: resolve
    });
  });
}

// Private array which stores the active timers
timer._timers = [];

// Public function which updates all the timers, to be called in draw
timer.update = function() {
  for (let i = 0; i < timer._timers.length; i++) {
    if (frameCount >= timer._timers[i].endFrame) { // If a timer has stopped
      // Fire the callback and remove it from the list

      timer._timers[i].callback();

      timer._timers.splice(i, 1);
      i--;
    }
  }
};