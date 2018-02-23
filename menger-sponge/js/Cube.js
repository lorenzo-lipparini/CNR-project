'use strict'

class Cube {

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

  animate(duration, update) {
    return new Promise(resolve => {
      this._animations.push({
        duration,
        update,
        beginFrame: frameCount,
        callback: resolve
      });
    });
  }

  _updateAnimations() {

    for (let i = 0; i < this._animations.length; i++) {

      let animation = this._animations[i];      

      let progress = (frameCount - animation.beginFrame) / animation.duration;
      
      if (progress > 1) { // If the animation has finished
        progress = 1; // Run the last frame

        animation.callback();

        this._animations.splice(i, 1); // Remove the animation
        i--; // Necessary, since an element has been removed from the array
      }

      animation.update(this, progress);
    }

  }

}