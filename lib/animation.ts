
import videoSpecs from './videoSpecs.js';


/**
 * Represents an animation which is currently playing on an object.
 */
export class PlayingAnimation<T, U extends keyof T> {
  
  /**
   * The frame when the animation started, set when the instance is created.
   */
  public readonly beginFrame: number;

  /**
   * The duration of the animation, expressed in frames.
   */
  public readonly frameDuration: number;

  public readonly updateTarget: UpdateFunction<T, U>;
  
  /**
   * Stores the initial values of the animated properties (only those in the pickedValues list of the animation).
   */
  public readonly initialValues: Pick<T, U>;


  /**
   * @param target The object to animate
   * @param animation The animation to play on the object
   * @param callback Function called when the animation finishes
   */
  public constructor(public readonly target: T, animation: Animation<T, U>, public readonly callback: () => void) {
    this.beginFrame = frameCount;
    
    // Instead of copying the entire object, only take the values in the pickedValues list of the animation
    this.initialValues = {} as Pick<T, U>;
    for (let property of animation.pickedProperties) {
      this.initialValues[property] = target[property];
    }
    
    // Convert the duration from seconds to frames
    this.frameDuration = Math.floor(animation.duration * videoSpecs.frameRate);
    
    this.updateTarget = animation.updateTarget;
  }

  /**
   * Updates the target depending on the time elapsed from the beginning.
   * 
   * @returns true if the animation has finished, false otherwise
   */
  public update(): boolean {
    let progress = (frameCount - this.beginFrame) / this.frameDuration;
    
    if (progress >= 1) { // If the animation has finished
      // The last frame of an animation must always run
      this.updateTarget(this.target, 1, this.initialValues);


      this.callback();
      return true;
    }

    this.updateTarget(this.target, progress, this.initialValues);
    return false;
  }

}

/**
 * Function used by animations to update a property of an object.
 * 
 * @param target The object to perform the update on
 * @param progress Progress value of the animation (in the range [0, 1])
 * @param initialValue Stores the initial conditions of the animation
 */
type UpdateFunction<T, U extends keyof T> = (target: T, progress: number, initialValue: Pick<T, U>) => void;

/**
 * Represents an animation that acts on an object of the given type.
 */
export class Animation<T, U extends keyof T> {

  /**
   * @param duration The duration of the animation (in seconds)
   * @param updateTarget The function which updates the target at each frame
   * @param pickedProperties List of the properties whose initial value is passed to updateTarget
   */
  public constructor(public readonly duration: number, public readonly updateTarget: UpdateFunction<T, U>, public readonly pickedProperties: U[] = []) { }

}

/**
 * Represents an animation that acts on a single property of an object.
 */
export class PropertyAnimation<T, U extends keyof T> extends Animation<T, U> {

  /**
   * @param property The property of the target to animate
   * @param duration The duration of the animation (in seconds)
   * @param valueFunction The value of the animated property, expressed as a function of time and initial value of the property
   */
  public constructor(property: U, duration: number, valueFunction: (progress: number, initialValue: T[U]) => T[U]) {
  
    super(duration, (target, progress, initialValues) => {
      target[property] = valueFunction(progress, initialValues[property]);
    }, [property]); // valueFunction depends on the initial value of the animated property, so add it to the list of picked values
  
  }

}


// A linear animation can only act on numeric properties, this interface is used to express that restriction
type HasNumber<U extends string> = {
  [Key in U]: number;
}

/**
 * Represents a linear PropertyAnimation.
 */
export class LinearAnimation<T extends HasNumber<U>, U extends keyof T> extends PropertyAnimation<T, U> {

  /** 
   * @param property The property of the target to animate
   * @param duration The duration of the animation (in seconds)
   * @param initialValue The value set to the property at the beginning of the animation
   * @param finalValue The value that the property will have at the end of the animation
   */
  public constructor(property: U, duration: number, initialValue: number, finalValue: number);
  /**
   * @param property The property of the target to animate
   * @param duration The duration of the animation (in seconds)
   * @param finalValue The value that the property will have at the end of the animation
   */
  public constructor(property: U, duration: number, finalValue: number);
  public constructor(property: U, duration: number, firstValue: number, secondValue?: number) {
    let valueFunction: (progress: number, initialValue: number) => number;

    if (secondValue === undefined) {
      let finalValue = firstValue;

      valueFunction = (progress, initialValue) => initialValue + progress * (finalValue - initialValue);
    } else {
      let initialValue = firstValue;
      let finalValue = secondValue;

      valueFunction = progress => initialValue + progress * (finalValue - initialValue);
    }

    super(property, duration, valueFunction);
  }

}


export { default as Animatable } from './animatable.js';
export { animate, updateAnimations } from './animate.js';
