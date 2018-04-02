
import videoSpecs from './videoSpecs.js';


export interface OnGoingAnimation<T> {
  readonly beginFrame: number;
  readonly frameDuration: number;
  readonly update: AnimationFunction<T>;
  readonly callback: () => void;
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


export interface Animation<T> {
  readonly property: keyof T;

  readonly frameDuration: number;
  readonly update: AnimationFunction<T>;
}


export function linearAnimation<T>(property: keyof T, duration: number, initialValue: number, finalValue: number): Animation<T>;
export function linearAnimation<T>(property: keyof T, duration: number, finalValue: number): Animation<T>;
export function linearAnimation<T>(property: keyof T, duration: number, firstValue: number, secondValue?: number): Animation<T> {

  let update: AnimationFunction<T>;

  if (secondValue === undefined) {
    let finalValue = firstValue;

    update = (target, progress, { initialValue }) => {
      target[property] = initialValue + progress * (finalValue - initialValue);
    };
  } else {
    let initialValue = firstValue;
    let finalValue = secondValue;

    update = (target, progress) => {
      target[property] = <any> (initialValue + progress * (finalValue - initialValue));
    };
  }


  return {
    property,
    frameDuration: Math.floor(duration * videoSpecs.frameRate),
    update
  };
    
}


export { default } from './animatable.js';
