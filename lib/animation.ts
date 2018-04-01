
import videoSpecs from './videoSpecs.js';


interface Animation<T> {
  beginFrame: number;
  frameDuration: number;
  update: AnimationFunction<T>;
  callback: () => void;
  /**
   * Passed to the update function as the third argument, if you need to
   * store custom values relative to the target
   * (such as initial values of the animated properties)
   * attach them to this object instead of the actual target
   */
  scope: any;
}

/**
 * Function used to update the state of an animatable object.
 * 
 * @param target The object to perform the update on
 * @param progress Progress value of the animation (in the range [0, 1])
 * @param scope Object that can be used to store any variables associated with the target, like the initial conditions
 */
export interface AnimationFunction<T> {
  (target: T, progress: number, scope: any): void
}

export class LinearAnimationTemplate<T> {

  public readonly frameDuration: number;

  public readonly update: AnimationFunction<T>;


  public constructor(property: keyof T, duration: number, initialValue: number, finalValue: number);
  public constructor(property: keyof T, duration: number, finalValue: number);
  public constructor(public readonly property: keyof T, duration: number, firstValue: number, secondValue?: number) {
    this.frameDuration = Math.floor(duration * videoSpecs.frameRate);

    if (secondValue === undefined) {
      let finalValue = firstValue;

      this.update = (target, progress, { initialValue }) => {
        target[property] = initialValue + progress * (finalValue - initialValue);
      };
    } else {
      let initialValue = firstValue;
      let finalValue = secondValue;

      this.update = (target, progress) => {
        target[property] = <any> (initialValue + progress * (finalValue - initialValue));
      };
    }
  
    
  }

}



/**
 * A generic object of the scene which may be animated.
 */
export class Animatable {

  private animations: Animation<this>[] = [];


  /**
   * Binds a custom animation to the object.
   * 
   * @param duration Duration of the animation (in seconds)
   * @param update Animation function, used to update the state of the object before drawing
   * 
   * @returns A promise which resolves when the animation is finished
   */
  public animate(duration: number, update: AnimationFunction<this>): Promise<void>;
  public animate(template: LinearAnimationTemplate<this>): Promise<void>;
  public animate(durationOrTemplate: number | LinearAnimationTemplate<this>, update?: AnimationFunction<this>): Promise<void> {
    return new Promise(resolve => {
      let animation;
      
      if (typeof durationOrTemplate === 'number') {
        let duration = durationOrTemplate;
        
        animation = {
          frameDuration: Math.floor(duration * videoSpecs.frameRate),
          update: update!, // In the second overload, the second parameter must be given
          beginFrame: frameCount,
          callback: resolve,
          scope: {}
        };
      } else {
        let template = durationOrTemplate;

        animation = {
          beginFrame: frameCount,
          
          frameDuration: template.frameDuration,
          update: template.update,
          scope: { initialValue: this[template.property] },
          callback: resolve
        };
      }

      this.animations.push(animation);
    });
  }

  /**
   * Updates the state of the target as indicated by the animations;
   * to be called before drawing the object.
   */
  protected updateAnimations(): void {
    
    for (let i = 0; i < this.animations.length; i++) {
      let animation = this.animations[i];
      
      let progress = (frameCount - animation.beginFrame) / animation.frameDuration;
      
      if (progress >= 1) { // If the animation has finished
        animation.update(this, 1, animation.scope); // Run the last frame

        animation.callback();

        this.animations.splice(i, 1); // Remove the animation
        i--; // Necessary, since an element has been removed from the array

        continue;
      }

      animation.update(this, progress, animation.scope);
    }

  }

  /**
   * Draws the object on the canvas.
   */
  public show(): void { /* To be ovverrided */ }

}
