
import videoSpecs from './videoSpecs.js';


/**
 * Represents an animation which is currently playing on an object.
 */
export class PlayingAnimation<T, U extends keyof T> {
  
  /**
   * The frame when the animation started, set when the instance is created.
   */
  public readonly beginFrame: number;

  public readonly frameDuration: number;
  public readonly updateTarget: UpdateFunction<T, U>;
  
  /**
   * The initial value of the property which is being animated.
   * Initial conditions are often needed to fully describe an animation.
   */
  public initialValue: T[U];


  /**
   * @param target The object to animate
   * @param animation The animation to play on the object
   * @param callback Function called when the animation finishes
   */
  public constructor(public readonly target: T, animation: Animation<T, U>, public readonly callback: () => void) {
    this.beginFrame = frameCount;
    this.initialValue = target[animation.property];

    this.frameDuration = animation.frameDuration;
    this.updateTarget = animation.updateTarget;
  }

  /**
   * @returns true if the animation has finished, false otherwise
   */
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
 * Function used to update a property of an object.
 * 
 * @param target The object to perform the update on
 * @param progress Progress value of the animation (in the range [0, 1])
 * @param initialValue The value that the property had before the animation started
 */
interface UpdateFunction<T, U extends keyof T> {
  (target: T, progress: number, initialValue: T[U]): void
}


/**
 * Represents an animation that acts on a property of an object.
 */
export interface Animation<T, U extends keyof T> {
  
  /**
   * The property that the animation acts on.
   */
  readonly property: U;

  /**
   * The duration of the animation, expressed in frames.
   */
  readonly frameDuration: number;

  /**
   * The function which updates the property of the object.
   */
  readonly updateTarget: UpdateFunction<T, U>;

}


/**
 * Creates an Animation object.
 * 
 * @param property The property of the target to animate
 * @param duration The duration of the animation (in seconds)
 * @param valueFunction The value of the animated property, expressed as a function of time and initial value of the property
 */
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

/**
 * Creates an Animation object representing a linear animation.
 * 
 * @param property The property of the target to animate
 * @param duration The duration of the animation (in seconds)
 * @param initialValue The value set to the property at the beginning of the animation
 * @param finalValue The value that the property will have at the end of the animation
 */
export function linearAnimation<T extends HasNumber<U>, U extends keyof T>(property: U, duration: number, initialValue: number, finalValue: number): Animation<T, U>;
/**
 * Creates an Animation object representing a linear animation.
 * 
 * @param property The property of the target to animate
 * @param duration The duration of the animation (in seconds)
 * @param finalValue The value that the property will have at the end of the animation
 */
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


  return animation(property, duration, valueFunction);
}

export { default as Animatable } from './animatable.js';
export { animate, updateAnimations } from './animate.js';
