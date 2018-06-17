
import videoSpecs from './videoSpecs.js';


/**
 * Function used by animations to update a property of an object.
 * 
 * @param target The object to update
 * @param progress Progress value of the animation (in the range [0, 1])
 * @param initialValues Initial conditions of the animation
 */
type UpdateFunction<T> = (target: T, progress: number) => void;

/**
 * Represents an animation which is currently playing on an object.
 */
export class PlayingAnimation<T, K extends keyof T> {
  
  /**
   * The frame when the animation started, set when the instance is created.
   */
  private readonly beginFrame: number;

  /**
   * The duration of the animation, expressed in frames.
   */
  private readonly frameDuration: number;

  private readonly updateTarget: UpdateFunction<T>;

  /**
   * Sorted array of the key progress values of the animation.
   */
  private readonly keyProgressValues: number[];
  /**
   * Index of the key progress value which will be reached next.
   */
  private nextValueIndex: number = 0;


  /**
   * @param target The object to animate
   * @param animation The animation to play on the object
   * @param callback Function called when the animation finishes
   */
  public constructor(public readonly target: T, animation: Animation<T, K>, public readonly callback: () => void) {
    this.beginFrame = frameCount;
    
    // Instead of copying the entire object, only take the values in the pickedValues list of the animation
    const initialValues = {} as Pick<T, K>;
    for (const property of animation.pickedProperties) {
      const value = target[property];

      if (value instanceof Array) {
        // Shallow copy arrays for vector animations
        initialValues[property] = value.slice() as any;
      } else {
        initialValues[property] = value;
      }
    }
    
    // Convert the duration from seconds to frames
    this.frameDuration = Math.floor(animation.duration * videoSpecs.frameRate);
    
    this.updateTarget = animation.makeUpdateTarget(initialValues);
    
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
      this.updateTarget(this.target, this.keyProgressValues[this.nextValueIndex]);

      if (progress >= 1) { // If the animation has finished
        this.callback();
        return true;
      }

      // Wait for the next value to be reached
      this.nextValueIndex++;
    }

    this.updateTarget(this.target, progress);
    return false;
  }

}

/**
 * Represents an animation that acts on an object of the given type.
 */
export class Animation<T, K extends keyof T> {

  /**
   * List of all the progress value corresponding to frames when updateTarget MUST be called;
   * for elementary animations, it only includes the last frame, while
   * in composed animations all the keyProgress values of the sub-animations are included
   * (possibly transformed to fit the new progress interval).
   */
  public keyProgressValues: number[] = [1];


  /**
   * @param duration The duration of the animation (in seconds)
   * @param makeUpdateTarget A closure that takes an object containing the initial values and returns the function which updates the target at each frame
   * @param pickedProperties List of the properties whose initial value is passed to makeUpdateTarget
   */
  public constructor(public readonly duration: number, public readonly makeUpdateTarget: ((initialValues: Pick<T, K>) => UpdateFunction<T>), public readonly pickedProperties: K[] = []) { }

  /**
   * Combines the animation to another animation, returning a new one which is equivalent to
   * the original two played consecutively;
   * the initial values passed to the second animation won't take into account the changes made by the first one. 
   * 
   * @param animation The animation to concatenate to the current one
   * 
   * @returns The resulting animation
   */
  public concat<K2 extends keyof T>(animation: Animation<T, K2>): Animation<T, K | K2> {
    
    // The progress value which corresponds to the instant when the first animation stops and the second one begins
    // Used to make sure that the progress value passed as parameter ranges from 0 to 1 for both animations
    const animationChange = this.duration / (this.duration + animation.duration);

    const result = new Animation<T, K | K2>(this.duration + animation.duration, initialValues => {
      const firstUpdateTarget = this.makeUpdateTarget(initialValues);
      const secondUpdateTarget = animation.makeUpdateTarget(initialValues);

      return (target, progress) => {
        if (progress <= animationChange) {
          firstUpdateTarget(target, progress / animationChange);
        } else {
          secondUpdateTarget(target, (progress - animationChange) / (1 - animationChange));
        }
      };
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
  public parallel<K2 extends keyof T>(animation: Animation<T, K2>): Animation<T, K | K2> {
    
    const newDuration = Math.max(this.duration, animation.duration);

    const shortest: Animation<T, K | K2> = (this.duration < animation.duration) ? this : animation;
    const longest: Animation<T, K | K2> = (this.duration >= animation.duration) ? this : animation;

    // The progress value corresponding to the frame when the shortest animation stops
    const shortestEnd = shortest.duration / newDuration;

    const result = new Animation<T, K | K2>(newDuration, initialValues => {
      const shortestUpdateTarget = shortest.makeUpdateTarget(initialValues);
      const longestUpdateTarget = longest.makeUpdateTarget(initialValues);

      return (target, progress) => {
        // The shortest animation plays in the interval [0, shortestEnd]
        if (progress <= shortestEnd) {
          shortestUpdateTarget(target, progress / shortestEnd);
        }

        // The longest one plays from the start to the end
        longestUpdateTarget(target, progress);
      };
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
   * @param inverseTransform Inverse function of the transform, required to calculate the keyProgressValues of the new animation
   * 
   * @returns The resulting animation
   */
  public timeTrasform(transform: (progress: number) => number, inverseTransform: (progress: number) => number): Animation<T, K> {
    const result = new Animation<T, K>(this.duration, initialValues => {
      const updateTarget = this.makeUpdateTarget(initialValues);

      return (target, progress) => updateTarget(target, transform(progress));
    }, this.pickedProperties);

    result.keyProgressValues = this.keyProgressValues.map(inverseTransform);

    return result;
  }

  /**
   * Creates a harmonic version of the current animation;
   * In the simplest case, when used on a linear animation, it returns a harmonic animation.
   */
  public harmonize(): Animation<T, K> {
    return this.timeTrasform(
      t => (1/2 * (1 + Math.sin(Math.PI * (t - 1/2)))),
      t => 1/2 + Math.asin(2*t - 1) / Math.PI
    );
  }

}

/**
 * Represents an animation that acts on a single property of an object.
 */
export class PropertyAnimation<T, K extends keyof T> extends Animation<T, K> {

  /**
   * @param property The property of the target to animate
   * @param duration The duration of the animation (in seconds)
   * @param valueFunction The value of the animated property, expressed as a function of time and initial value of the property
   */
  public constructor(property: K, duration: number, valueFunction: (progress: number, initialValue: T[K]) => T[K]) {
  
    super(duration, initialValues => {
      const initialValue = initialValues[property];

      return (target, progress) => target[property] = valueFunction(progress, initialValue);
    }, [property]); // valueFunction depends on the initial value of the animated property, so add it to the list of picked values
  
  }

}


// A linear animation can only act on numbers or vectors, this interface is used to express that restriction
type HasAnimatable<K extends string | number | symbol> = {
  [P in K]: number | number[];
};

/**
 * Used to create animations which can act on numbers or number arrays,
 * given only the initial conditions and the final values.
 */
const createNumericAnimation = (numberValueFunction: (progress: number, initialValue: number, finalValue: number) => number) => class <T extends HasAnimatable<K>, K extends keyof T> extends Animation<T, K> {

  /**
   * @param property The property of the target to animate
   * @param duration The duration of the animation (in seconds)
   * @param initialValue The value set to the property at the beginning of the animation
   * @param finalValue The value that the property will have at the end of the animation
   */
  public constructor(property: K, duration: number, initialValue: T[K], finalValue: T[K]);
  /**
   * @param property The property of the target to animate
   * @param duration The duration of the animation (in seconds)
   * @param finalValue The value that the property will have at the end of the animation, may be expressed as a function of the initial value
   */
  public constructor(property: K, duration: number, finalValue: T[K] | ((initialValue: T[K]) => T[K]));
  public constructor(property: K, duration: number, firstValue: T[K] | ((initialValue: T[K]) => T[K]), secondValue?: T[K]) {

    // Express the values as functions:
    // The initial value might be explicit, or it might equal the value of the property at the beginning of the animation
    let getInitialValue: (initialValue: T[K]) => T[K];
    // The final value might be explicit, or it might depend on the value of the property at the beginning of the animation
    let getFinalValue: (initialValue: T[K]) => T[K];

    if (secondValue !== undefined) { // First overload
      // The initial value is expicit
      getInitialValue = () => firstValue as T[K];

      // The final value is also explicit

      // Make a shallow copy of arrays to avoid common mistakes
      if (secondValue instanceof Array) {
        secondValue = secondValue.slice();
      }
      getFinalValue = () => secondValue!;
    } else { // Second overload
      // The initial value equals the value of the property at the beginning of the animation
      getInitialValue = initialValue => initialValue;

      // The final value might be explicit or implicit
      getFinalValue = (typeof firstValue === 'function') ? firstValue : () => firstValue;
    }

    super(duration, initialValues => {
      const initialValue = getInitialValue(initialValues[property] as T[K]);
      const finalValue = getFinalValue(initialValue);

      if (typeof initialValue === 'number') { // initialValue: number; finalValue: number
        return (target, progress) => target[property] = numberValueFunction(progress, initialValue, finalValue as number);
      } else { // initialValue: number[]; finalValue: number[]
        return (target, progress) => {
          const v = target[property] as number[];

          for (let i = 0; i < v.length; i++) {
            v[i] = numberValueFunction(progress, (initialValue as number[])[i], (finalValue as number[])[i]);
          }
        };
      }
    }, [property]);

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
