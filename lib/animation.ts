
import videoSpecs from './videoSpecs.js';


/**
 * Represents an animation which is currently playing on an object.
 */
export class PlayingAnimation<T, U extends keyof T> {
  
  /**
   * The frame when the animation started, set when the instance is created.
   */
  private readonly beginFrame: number;

  /**
   * The duration of the animation, expressed in frames.
   */
  private readonly frameDuration: number;

  private readonly updateTarget: UpdateFunction<T, U>;

  /**
   * Sorted array of the key progress values of the animation.
   */
  private readonly keyProgressValues: number[];
  /**
   * Index of the key progress value which will be reached next.
   */
  private nextValueIndex: number = 0;

  /**
   * Stores the initial values of the animated properties (only those in the pickedValues list of the animation).
   */
  private readonly initialValues: Pick<T, U>;


  /**
   * @param target The object to animate
   * @param animation The animation to play on the object
   * @param callback Function called when the animation finishes
   */
  public constructor(public readonly target: T, animation: Animation<T, U>, public readonly callback: () => void) {
    this.beginFrame = frameCount;
    
    // Instead of copying the entire object, only take the values in the pickedValues list of the animation
    this.initialValues = {} as Pick<T, U>;
    for (const property of animation.pickedProperties) {
      const value = target[property];

      if (value instanceof Array) {
        // Shallow copy arrays for vector animations
        this.initialValues[property] = value.slice() as any;
      } else {
        this.initialValues[property] = value;
      }
    }
    
    // Convert the duration from seconds to frames
    this.frameDuration = Math.floor(animation.duration * videoSpecs.frameRate);
    
    this.updateTarget = animation.updateTarget;
    
    this.keyProgressValues = animation.keyProgressValues.sort();
  }

  /**
   * Updates the target depending on the time elapsed from the beginning.
   * 
   * @returns true if the animation has finished, false otherwise
   */
  public update(): boolean {
    const progress = (frameCount - this.beginFrame) / this.frameDuration;
    
    if (progress >= this.keyProgressValues[this.nextValueIndex]) { // If the animation has reached a key frame
      // Run that exact frame
      this.updateTarget(this.target, this.keyProgressValues[this.nextValueIndex], this.initialValues);

      if (progress >= 1) { // If the animation has finished
        this.callback();
        return true;
      }

      // Wait for the next value to be reached
      this.nextValueIndex++;
    }

    this.updateTarget(this.target, progress, this.initialValues);
    return false;
  }

}

/**
 * Function used by animations to update a property of an object.
 * 
 * @param target The object to update
 * @param progress Progress value of the animation (in the range [0, 1])
 * @param initialValues Initial conditions of the animation
 */
type UpdateFunction<T, U extends keyof T> = (target: T, progress: number, initialValues: Pick<T, U>) => void;

/**
 * Represents an animation that acts on an object of the given type.
 */
export class Animation<T, U extends keyof T> {

  /**
   * List of all the progress value corresponding to frames when updateTarget MUST be called;
   * for elementary animations, it only includes the last frame, while
   * in composed animations all the keyProgress values of the sub-animations are included
   * (possibly transformed to fit the new progress interval).
   */
  public keyProgressValues: number[] = [1];


  /**
   * @param duration The duration of the animation (in seconds)
   * @param updateTarget The function which updates the target at each frame
   * @param pickedProperties List of the properties whose initial value is passed to updateTarget
   */
  public constructor(public readonly duration: number, public readonly updateTarget: UpdateFunction<T, U>, public readonly pickedProperties: U[] = []) { }

  /**
   * Combines the animation to another animation, returning a new one which is equivalent to
   * the original two played consecutively;
   * the initial values passed to the second animation won't take into account the changes made by the first one. 
   * 
   * @param animation The animation to concatenate to the current one
   * 
   * @returns The resulting animation
   */
  public concat<V extends keyof T>(animation: Animation<T, V>): Animation<T, U | V> {
    
    // The progress value which corresponds to the instant when the first animation stops and the second one begins
    // Used to make sure that the progress value passed as parameter ranges from 0 to 1 for both animations
    const animationChange = this.duration / (this.duration + animation.duration);

    const result = new Animation<T, U | V>(this.duration + animation.duration, (target, progress, initialValues) => {
      if (progress <= animationChange) {
        this.updateTarget(target, progress / animationChange, initialValues);
      } else {
        animation.updateTarget(target, (progress - animationChange) / (1 - animationChange), initialValues);
      }
    }, [...this.pickedProperties, ...animation.pickedProperties]); // Composed animations need all the initial values required by the original ones


    // Calculate the new key progress values based those of the original animations
    // progress => <new start> + <new length> * progress
    result.keyProgressValues = [
      // <new start> = 0, <new length> = animationChange
      ...this.keyProgressValues.map(progress => animationChange * progress),
      // <new start> = animationChange, <new length> = 1 - animationChange
      ...animation.keyProgressValues.map(progress => animationChange + (1 - animationChange) * progress)
    ];

    
    return result;
  }

  /**
   * Combines the animation to another animation, returning a new one which is equivalent to
   * the original two played simultaneously;
   * the initial values passed to the longest animation won't take into account the changes made by the shortest one. 
   * 
   * @param animation The animation to be played parallel to the current one
   * 
   * @returns The resulting animation
   */
  public parallel<V extends keyof T>(animation: Animation<T, V>): Animation<T, U | V> {
    
    const newDuration = Math.max(this.duration, animation.duration);

    const shortest: Animation<T, U | V> = (this.duration < animation.duration) ? this : animation;
    const longest: Animation<T, U | V> = (this.duration >= animation.duration) ? this : animation;

    // The progress value corresponding to the frame when the shortest animation stops
    const shortestEnd = shortest.duration / newDuration;

    const result = new Animation<T, U | V>(newDuration, (target, progress, initialValues) => {
      // The shortest animation plays in the interval [0, shortestEnd]
      if (progress <= shortestEnd) {
        shortest.updateTarget(target, progress / shortestEnd, initialValues);
      }

      // The longest one plays from the start to the end
      longest.updateTarget(target, progress, initialValues);
    }, [...this.pickedProperties, ...animation.pickedProperties]); // Composed animations need all the initial values required by the original ones
  

    // Calculate the new key progress values based those of the original animations
    // progress => <new start> + <new length> * progress
    result.keyProgressValues = [
      // <new start> = 0, <new length> = shortestEnd
      ...this.keyProgressValues.map(progress => shortestEnd * progress),
      // <new start> = 0, <new length> = 1 => progress values kept intact
      ...animation.keyProgressValues
    ];

    
    return result;
  }

  /**
   * Creates a new animation based on the current one, where the flow of time is
   * changed as indicated by the transform.
   * 
   * @param transform Trasform which takes the original progress and maps it to a new value
   */
  public timeTrasform(transform: (progress: number) => number): Animation<T, U> {
    return new Animation(this.duration, (target, progress, initialValues) => {
      this.updateTarget(target, transform(progress), initialValues);
    }, this.pickedProperties);
  }

  /**
   * Creates a harmonic version of the current animation;
   * In the simplest case, when used on a linear animation, it returns a harmonic animation.
   */
  public harmonize(): Animation<T, U> {
    return this.timeTrasform(progress => (1/2 * (1 + Math.sin(Math.PI * (progress - 1/2)))));
  }

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


// A linear animation can only act on numbers or vectors, this interface is used to express that restriction
type HasAnimatable<U extends string> = {
  [K in U]: number | number[];
};

/**
 * Used to create animations which can act on numbers or number arrays,
 * given only the initial conditions and the final values.
 */
const createNumericAnimation = (numberValueFunction: (progress: number, initialValue: number, finalValue: number) => number) => class <T extends HasAnimatable<U>, U extends keyof T> extends PropertyAnimation<T, U> {

  /**
   * @param property The property of the target to animate
   * @param duration The duration of the animation (in seconds)
   * @param initialValue The value set to the property at the beginning of the animation
   * @param finalValue The value that the property will have at the end of the animation
   */
  public constructor(property: U, duration: number, initialValue: T[U], finalValue: T[U]);
  /**
   * @param property The property of the target to animate
   * @param duration The duration of the animation (in seconds)
   * @param finalValue The value that the property will have at the end of the animation
   */
  public constructor(property: U, duration: number, finalValue: T[U]);
  public constructor(property: U, duration: number, firstValue: T[U], secondValue?: T[U]) {
    // TODO: find a way to be more type safe
    // Unfortunately, type guards don't restrict the type inside closures

    let valueFunction: (progress: number, initialValue: any) => any;

    if (secondValue === undefined) {
      const finalValue = firstValue;

      if (typeof finalValue === 'number') {
        valueFunction = (progress, initialValue) => numberValueFunction(progress, initialValue, finalValue);
      } else { // finalValue: number[]
        valueFunction = (progress: number, initialValue: number[]) => initialValue.map((value, i) => numberValueFunction(progress, value, (finalValue as number[])[i]));
      }
    } else {
      const initialValue = firstValue;
      const finalValue = secondValue;

      if (typeof finalValue === 'number') {
        valueFunction = (progress: number) => numberValueFunction(progress, initialValue as number, finalValue);
      } else { // finalValue: number[]
        valueFunction = (progress: number) => (initialValue as number[]).map((value, i) => numberValueFunction(progress, value, (finalValue as number[])[i]));
      }
    }

    super(property, duration, valueFunction);
  }

}

/**
 * Represents a linear PropertyAnimation.
 */
export const LinearAnimation = createNumericAnimation(
  (progress, initialValue, finalValue) => initialValue + progress * (finalValue - initialValue)
);

/**
 * Represents a PropertyAnimation where
 * the property changes in a way that resembles harmonic motion.
 */
export const HarmonicAnimation = createNumericAnimation(
  (progress, initialValue, finalValue) => initialValue + (1/2 * (1 + Math.sin(Math.PI * (progress - 1/2)))) * (finalValue - initialValue)
);

/**
 * Represents a PropertyAnimation where the value changes exponentially over time,
 * this is often used to create zoom animations.
 */
export const ExponentialAnimation = createNumericAnimation(
  (progress, initialValue, finalValue) => initialValue * Math.pow(finalValue / initialValue, progress)
);


export { default as Animatable } from './animatable.js';
export { animate, updateAnimations } from './animate.js';
