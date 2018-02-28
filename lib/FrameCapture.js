
import videoSpecs from '/lib/videoSpecs.js';


export default class FrameCapture {

  static acquire(duration) {

    // If framesNumber is undefined, FrameCapture will acquire frames until stop() is called
    this.framesNumber = parseInt(duration * videoSpecs.frameRate);
    this.canvas = document.getElementsByTagName('canvas')[0];
    this.active = true;

    // NOT EQUAL TO FRAMECOUNT:
    //
    // Since FrameCapture.update() is the last method called in draw(),
    // if the stop() function is invoked manually that will happen before
    // the update() of that frame, meaning that the last frame won't be drawn.
    // However, frameCount has been increment already meaning that it will be
    // 1 more than acquiredFrames.
    // On the other hand, if stop() is called by the class itself, we know
    // it happened inside the update() function, but that means that the frame has
    // already been acquired and therefore frameCount will be equal to aquiredFrames.
    //
    // Making a distinction between these two cases is actually a less elegant solution
    // than just using this extra variable and not relying of frameCount at all.
    this.acquiredFrames = 0;


    fetch('/video-service/new').catch(() => alert('Server offline.'));

  }

  // To be called at the end of draw()
  static update() {
    
    if (!this.active) {
      return;
    }
    

    fetch('/video-service/push-frame', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: frameCount,
        data: this.canvas.toDataURL().split(',')[1]
      })
    });

    
    this.acquiredFrames++;

    if (this.framesNumber !== undefined && this.acquiredFrames === this.framesNumber) {
      this.stop();
      return;
    }

  }

  static stop() {

    this.framesNumber = undefined;
    this.active = false;

    fetch('/video-service/give-info', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        framesNumber: this.acquiredFrames
      })
    });

    noLoop();

  }

}
