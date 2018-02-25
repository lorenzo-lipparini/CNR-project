'use strict'

class FrameCapture {

  static acquire(framesNumber) {
    // If framesNumber is undefined, FrameCapture will acquire frames until stop() is called
    this.framesNumber = framesNumber;

    this.active = true;
  }

  // To be called at the end of draw()
  static update() {
    if (!this.active) {
      return;
    }

    if (this.framesNumber !== undefined && frameCount > this.framesNumber) {
      this.stop();
      return;
    }
    
    save('frame' + frameCount + '.png');
  }

  static stop() {
    this.framesNumber = undefined;
    this.active = false;

    noLoop();
    console.log('finish');
  }

}
