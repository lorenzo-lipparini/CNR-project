'use strict'

class Cube {

  constructor(pos, side, color) {
    this.pos = pos;
    this.side = side;
    this.color = color;

    this.animations = [];
  }

  show() {
    this.update();

    translate(this.pos.x, this.pos.y, this.pos.z);

    ambientMaterial(this.color);
    box(this.side);
    
    translate(-this.pos.x, -this.pos.y, -this.pos.z);
  }

  animate(duration, update) {
    return new Promise(resolve => {
      this.animations.push({
        update,
        duration,
        beginFrame: frameCount,
        callback: resolve
      });
    });
  }

  update() {
    let currentFrame = frameCount;

    for (let i = 0; i < this.animations.length; i++) {

      let animation = this.animations[i];      

      let progress = (currentFrame - animation.beginFrame) / animation.duration;
      
      if (progress > 1) { // IF the animation has finished
        progress = 1; // Run the last frame

        animation.callback();

        this.animations.splice(i, 1); // Remove the animation
        i--; // Necessary, since an element has been removed
      }

      animation.update(this, progress);

    }
  }

}