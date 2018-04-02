
import videoSpecs from './videoSpecs.js';


export class PlayingAnimation<T, U extends keyof T> {
  
  public readonly beginFrame: number;
  public readonly frameDuration: number;
  public readonly updateTarget: UpdateFunction<T, U>;
  /**
   * Passed to the update function as the third argument, if you need to
   * store custom values relative to the target
   * (such as initial values of the animated properties)
   * attach them to this object instead of the actual target
   */
  public initialValue: T[U];


  public constructor(public readonly target: T, animation: Animation<T, U>, public readonly callback: () => void) {
    this.beginFrame = frameCount;
    this.initialValue = target[animation.property];

    this.frameDuration = animation.frameDuration;
    this.updateTarget = animation.updateTarget;
  }

  public update(): boolean {
    let progress = (frameCount - this.beginFrame) / this.frameDuration;
      
    if (progress >= 1) { // If the animation has finished
      this.updateTarget(this.target, 1, this.initialValue); // Run the last frame

      this.callback();

      return true;
    }

    this.updateTarget(this.target, progress, this.initialValue);
    return false;
  }

}

/**
 * Function used to update the state of an animatable object.
 * 
 * @param target The object to perform the update on
 * @param progress Progress value of the animation (in the range [0, 1])
 * @param scope Object that can be used to store any variables associated with the target, like the initial conditions
 */
interface UpdateFunction<T, U extends keyof T> {
  (target: T, progress: number, initialValue: T[U]): void
}


export interface Animation<T, U extends keyof T> {
  readonly property: U;

  readonly frameDuration: number;
  readonly updateTarget: UpdateFunction<T, U>;
}


export function animation<T, U extends keyof T>(property: U, duration: number, valueFunction: (progress: number, initialValue: T[U]) => T[U]): Animation<T, U> {
  return {
    property,
    frameDuration: Math.floor(duration * videoSpecs.frameRate),
    updateTarget: (target, progress, initialValue) => {
      target[property] = valueFunction(progress, initialValue);
    }
  };
};


// A linear animation can only be performed on numeric properties
type HasNumber<U extends string> = {
  [Key in U]: number;
}

export function linearAnimation<T extends HasNumber<U>, U extends keyof T>(property: U, duration: number, initialValue: number, finalValue: number): Animation<T, U>;
export function linearAnimation<T extends HasNumber<U>, U extends keyof T>(property: U, duration: number, finalValue: number): Animation<T, U>;
export function linearAnimation<T extends HasNumber<U>, U extends keyof T>(property: U, duration: number, firstValue: number, secondValue?: number): Animation<T, U> {
  let valueFunction: (progress: number, initialValue: number) => number;

  if (secondValue === undefined) {
    let finalValue = firstValue;

    valueFunction = (progress, initialValue) => initialValue + progress * (finalValue - initialValue);
  } else {
    let initialValue = firstValue;
    let finalValue = secondValue;

    valueFunction = progress => initialValue + progress * (finalValue - initialValue);
  }


  return animation<T, U>(property, duration, valueFunction);
}


export { default as Animatable } from './animatable.js';
