
import { Animation } from '../lib/animation.js';

import Cube from './Cube.js'; 


/**
 * Represent an animatable Menger Sponge fractal in the scene.
 */
export default class MengerSponge extends Cube {

  private childSponges: MengerSponge[] = [];
  private excludedCubes: Cube[] = [];

  private _showExcludedCubes: boolean = false;


  /**
   * @param pos The 3D point relative to which the sponge will be drawn
   * @param side The length of the side of the sponge
   * @param color Color assigned to the child cubes of the sponge
   * @param iterations Integer number which determines the detail and complexity of the fractal
   */
  public constructor(public pos: p5.Vector, public side: number, public color: p5.Color, public iterations: number) {

    super(pos, side, color);

    this.iterations = iterations;

    // 0-iterations Menger sponges are just cubes, so they have no child elements
    if (this.iterations !== 0) {
      
      // Recursive part of the fractal
      this.createChildElements();

    }

    this.showExcludedCubes = false;
    
  }

  /**
   * Determines wether the cubes which are not part of the fractal will be drawn or not.
   * 
   * @default false
   */
  public get showExcludedCubes(): boolean {
    return this._showExcludedCubes;
  }

  public set showExcludedCubes(value: boolean) {
    // Prevent useless recursion
    if (value === this._showExcludedCubes) {
      return;
    }

    this._showExcludedCubes = value;
    
    if (this.iterations !== 0) {
      // Recursively assign the poperty to every child sponge
      for (let mengerSponge of this.childSponges) {
        mengerSponge.showExcludedCubes = this._showExcludedCubes;
      }
    }
  }

  private createChildElements(): void {

    // Reset the arrays if they weren't empty already
    this.childSponges = [];
    this.excludedCubes = [];


    const childSide = this.side / 3;

    // Helper functions for creating new sponges and cubes
    const addChildSponge = (relativePosX: number, relativePosY: number, relativePosZ: number) => {
      let newSponge = new MengerSponge(new p5.Vector(this.pos.x + relativePosX, this.pos.y + relativePosY, this.pos.z + relativePosZ), childSide, this.color, this.iterations - 1);
      newSponge.showExcludedCubes = this.showExcludedCubes;
      
      this.childSponges.push(newSponge);
    };
    const addExcludedCube = (relativePosX: number, relativePosY: number, relativePosZ: number) => {
      this.excludedCubes.push(new Cube(new p5.Vector(this.pos.x + relativePosX, this.pos.y + relativePosY, this.pos.z + relativePosZ), childSide, this.color));
    };

    for (let x = -childSide; x <= childSide; x += childSide) {
      for (let y = -childSide; y <= childSide; y += childSide) {
        for (let z = -childSide; z <= childSide; z += childSide) {
          
          // Inspiration from https://www.youtube.com/watch?v=LG8ZK-rRkXo
          if (Math.abs(x) + Math.abs(y) + Math.abs(z) > childSide) {
            addChildSponge(x, y, z);
          } else {
            addExcludedCube(x, y, z);
          }

        } 
      }
    }

  }

  public show(): void {

    if (this.iterations === 0) {
      // 0-iterations Menger sponges are just cubes
      super.show();
      return;
    }

    for (let mengerSponge of this.childSponges) {
      mengerSponge.show();
    }

    if (this.showExcludedCubes) {
      for (let cube of this.excludedCubes) {
        cube.show();
      }
    }

  }

  /**
   * Plays an animation on all the excluded cubes of a given iteration.
   * 
   * @param iteration The iteration which identifies the cubes
   * @param animation The animation to play on the cubes
   */
  public animateExcludedCubes(iteration: number, animation: Animation<Cube, keyof Cube>): Promise<void> {
    // NOTE: doesn't work if iteration > this.iterations, which makes sense

    let returnPromise: Promise<void> = Promise.resolve(); // Just take a random one, since they all finish simultaneously

    if (iteration === 1) { // In this case, it just refers to the child cubes of this MengerSponge
      for (let cube of this.excludedCubes) {
        returnPromise = cube.animate(animation);
      }

      return returnPromise;
    }
    
    // If it doesn't refer to the cubes of this sponge, just delegate the task to the direct child sponges
    for (let mengerSponge of this.childSponges) {
      returnPromise = mengerSponge.animateExcludedCubes(iteration - 1, animation);
    }

    return returnPromise;
  }

  /**
   * Plays an animation on all the excluded cubes of the sponge.
   * 
   * @param animation The animation to play on the cubes
   */
  public animateAllExcludedCubes(animation: Animation<Cube, keyof Cube>) {
    // 0-iterations Menger sponges are just cubes, so they have no child excluded cubes to animate
    if (this.iterations === 0) {
      return Promise.resolve();
    }


    let returnPromise = Promise.resolve(); // Just take a random one, since they all finish simultaneously
    
    for (let cube of this.excludedCubes) {
      returnPromise = cube.animate(animation);
    }

    for (let mengerSponge of this.childSponges) {
      mengerSponge.animateAllExcludedCubes(animation);
    }

    return returnPromise;
  }

  /**
   * Increments the iterations of the fractal, adding further detail to its shape.
   */
  public incrementIterations(): void {
    this.iterations++;

    // Simple case: this wasn't even a fractal
    if (this.iterations === 1) {
      this.createChildElements();

      return;
    }

    // If this had child elements already, delegate the task to the child sponges
    for (let sponge of this.childSponges) {
      sponge.incrementIterations();
    }

  }

}
