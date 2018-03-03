
import videoSpecs from '/lib/videoSpecs.js';


export class Animatable {

  constructor() {
    this._animations = [];
  }

  // Keeps calling the update() function passing it this object,
  // a linear progress value between 0 and 1 and a 'scope' object
  // until the given time in seconds has passed in the video
  animate(duration, update) {
    return new Promise(resolve => {
      this._animations.push({
        frameDuration: parseInt(duration * videoSpecs.frameRate),
        update,
        beginFrame: frameCount,
        callback: resolve,
        // Passed to the function as the third argument, if you need to
        // store custom values relative to the target
        // (such as initial values of animated propeties)
        // attach them to this object instead of the target
        scope: {}
      });
    });
  }

  _updateAnimations() {

    for (let i = 0; i < this._animations.length; i++) {
      let animation = this._animations[i];

      let progress = (frameCount - animation.beginFrame) / animation.frameDuration;
      
      if (progress >= 1) { // If the animation has finished
        animation.update(this, 1, animation.scope); // Run the last frame

        animation.callback();

        this._animations.splice(i, 1); // Remove the animation
        i--; // Necessary, since an element has been removed from the array

        continue;
      }

      animation.update(this, progress, animation.scope);
    }

  }

}
