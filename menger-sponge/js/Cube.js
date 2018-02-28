
import videoSpecs from '/lib/videoSpecs.js';
import '/p5.js';


export default class Cube {

  constructor(pos, side, color) {
    this.pos = pos;
    this.side = side;
    this.color = color;

    // Keeps track of the ongoing animations
    this._animations = [];
  }

  show() {
    // Let the animations change the aspect of the cube before it is drawn
    this._updateAnimations();

    translate(this.pos.x, this.pos.y, this.pos.z);

    ambientMaterial(this.color);
    box(this.side);
    
    translate(-this.pos.x, -this.pos.y, -this.pos.z);
  }

  // Keeps calling the update() function passing this object and
  // a linear progress value between 0 and 1 until the given time
  // in seconds has passed in the video
  animate(duration , update) {
    return new Promise(resolve => {
      this._animations.push({
        frameDuration: parseInt(duration * videoSpecs.frameRate),
        update,
        beginFrame: frameCount,
        callback: resolve
      });
    });
  }

  _updateAnimations() {

    for (let i = 0; i < this._animations.length; i++) {
      let animation = this._animations[i];

      let progress = (frameCount - animation.beginFrame) / animation.frameDuration;
      
      if (progress >= 1) { // If the animation has finished
        animation.update(this, 1); // Run the last frame

        animation.callback();

        this._animations.splice(i, 1); // Remove the animation
        i--; // Necessary, since an element has been removed from the array

        continue;
      }

      animation.update(this, progress);
    }

  }

}
