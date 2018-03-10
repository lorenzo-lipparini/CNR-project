
import videoSpecs from '/lib/videoSpecs.js';


export default class FrameCapture {

  static acquire(duration) {

    // If framesNumber is undefined, FrameCapture will acquire frames until stop() is called
    FrameCapture.framesNumber = parseInt(duration * videoSpecs.frameRate);
    FrameCapture.canvas = document.getElementsByTagName('canvas')[0];
    FrameCapture.active = true;

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
    FrameCapture.acquiredFrames = 0;


    fetch('/video-service/new').catch(() => alert('Server offline.'));

  }

  // To be called at the end of draw()
  static update() {
    
    if (!FrameCapture.active) {
      return;
    }
    

    fetch('/video-service/push-frame', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: frameCount,
        data: FrameCapture.canvas.toDataURL().split(',')[1]
      })
    });

    
    FrameCapture.acquiredFrames++;

    if (FrameCapture.framesNumber !== undefined && FrameCapture.acquiredFrames === FrameCapture.framesNumber) {
      FrameCapture.stop();
      return;
    }

  }

  static stop() {

    FrameCapture.framesNumber = undefined;
    FrameCapture.active = false;

    fetch('/video-service/give-info', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...videoSpecs,
        framesNumber: FrameCapture.acquiredFrames
      })
    });

    noLoop();

  }

}
