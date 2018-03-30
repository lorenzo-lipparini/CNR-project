
import videoSpecs from './videoSpecs.js';


/**
 * Provides the api needed to interact with the server to export the video.
 */
namespace FrameCapture {

  let canvas: HTMLCanvasElement;

  let framesNumber: number;
  let active: boolean;
  let acquiredFrames: number;


  /**
   * Begins to acquire the video.
   * 
   * @param duration The duration of the video (in seconds);
   * if not povided, the video must be manually terminated with the stop() function
   */
  export function acquire(duration?: number): void {

    // Make sure to get the canvas after createCanvas() has been called in setup()
    canvas = document.getElementsByTagName('canvas')[0];

    framesNumber = -1;

    // If duration is undefined, FrameCapture will acquire frames until stop() is called
    if (duration !== undefined) {
      framesNumber = Math.floor(duration * videoSpecs.frameRate);
    }

    active = true;

    /** NOT EQUAL TO FRAMECOUNT:
     *
     * Since FrameCapture.update() is the last method called in draw(),
     * if the stop() function is invoked manually that will happen before
     * the update() of that frame, meaning that the last frame won't be drawn.
     * However, frameCount has been increment already meaning that it will be
     * 1 more than acquiredFrames.
     * On the other hand, if stop() is called by the class itself, we know
     * it happened inside the update() function, but that means that the frame has
     * already been acquired and therefore frameCount will be equal to aquiredFrames.
     * 
     * Making a distinction between these two cases is actually a less elegant solution
     * than just using this extra variable and not relying of frameCount at all.
     */
    acquiredFrames = 0;


    fetch('/video-service/new').catch(() => alert('Server offline.'));

  }

  /**
   * If FrameCapture is active, acquires the current frame and sends it to the server;
   * to be called at the end of draw().
   */
  export function update(): void {
    
    if (!active) {
      return;
    }
    

    fetch('/video-service/push-frame', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: frameCount,
        data: canvas.toDataURL().split(',')[1]
      })
    });

    
    acquiredFrames++;

    if (framesNumber !== -1 && acquiredFrames === framesNumber) {
      stop();
      return;
    }

  }

  /**
   * Stops the frame acquisition and tells the server to export the video.
   */
  export function stop(): void {

    framesNumber = -1;
    active = false;

    fetch('/video-service/give-info', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...videoSpecs,
        framesNumber: acquiredFrames
      })
    });

    noLoop();

  }

}


export default FrameCapture;
