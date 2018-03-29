
import { AnimationFunction } from '../lib/animation.js';

import Cube from './Cube.js'; 


export default class MengerSponge extends Cube {

  private childSponges: MengerSponge[] = [];
  private excludedCubes: Cube[] = [];

  private _showExcludedCubes: boolean = false;


  public constructor(public pos: p5.Vector, public side: number, public color: p5.Color, public iterations: number) {

    super(pos, side, color);

    this.iterations = iterations;

    // 0-iterations Menger sponges are just cubes, so they have no child elements
    if (this.iterations !== 0) {
      
      // Recursive part of the fractal
      this.createChildSponges();

      // Cubes which are not part of the fractal (used in the animation process)
      this.createExcludedCubes(); 

    }

    // Make this property true to show the cubes which are not part of the fractal (used in the animation process)
    this.showExcludedCubes = false;
    
  }

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

  private createChildSponges(): void {

    let childSide = this.side / 3;

    // Create the direct child Menger sponges and keep a reference to them

    // Helper function to create new sponges
    let addChildSponge = (relativePosX: number, relativePosY: number, relativePosZ: number) => {
      let newSponge = new MengerSponge(new p5.Vector(this.pos.x + relativePosX, this.pos.y + relativePosY, this.pos.z + relativePosZ), childSide, this.color, this.iterations - 1);
      newSponge.showExcludedCubes = this.showExcludedCubes;
      
      this.childSponges.push(newSponge);
    };

    for (let y = -childSide; y <= childSide; y += childSide) {

      addChildSponge(+childSide, y, +childSide);
      addChildSponge(+childSide, y, -childSide);
      addChildSponge(-childSide, y, +childSide);
      addChildSponge(-childSide, y, -childSide);
      
      if (y != 0) {
        addChildSponge(0, y, +childSide);
        addChildSponge(0, y, -childSide);
        addChildSponge(+childSide, y, 0);
        addChildSponge(-childSide, y, 0);
      }

    }
    
  }

  private createExcludedCubes(): void {

    let childSide = this.side / 3;

    // Create the direct child cubes and keep a reference to them

    // Helper function to create new cubes
    let addExcludedCube = (relativePosX: number, relativePosY: number, relativePosZ: number) => {
      this.excludedCubes.push(new Cube(new p5.Vector(this.pos.x + relativePosX, this.pos.y + relativePosY, this.pos.z + relativePosZ), childSide, this.color));
    };

    for (let y = -childSide; y <= childSide; y += childSide) {
      addExcludedCube(0, y, 0);
    }
    
    addExcludedCube(0, 0, +childSide);
    addExcludedCube(0, 0, -childSide);
    addExcludedCube(+childSide, 0, 0);
    addExcludedCube(-childSide, 0, 0);

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

  public animateExcludedCubes(iteration: number, duration: number, update: AnimationFunction<Cube>): Promise<void> {
    // NOTE: doesn't work if iteration > this.iterations, which makes sense

    let returnPromise: Promise<void> = Promise.resolve(); // Just take a random one, since they all finish simultaneously

    if (iteration === 1) { // In this case, it just refers to the child cubes of this MengerSponge
      for (let cube of this.excludedCubes) {
        returnPromise = cube.animate(duration, update);
      }

      return returnPromise;
    }
    
    // If it doesn't refer to the cubes of this sponge, just delegate the task to the direct child sponges
    for (let mengerSponge of this.childSponges) {
      returnPromise = mengerSponge.animateExcludedCubes(iteration - 1, duration, update);
    }

    return returnPromise;
    
  }

  public animateAllExcludedCubes(duration: number, update: AnimationFunction<Cube>): Promise<void> {

    // 0-iterations Menger sponges are just cubes, so they have no child excluded cubes to animate
    if (this.iterations === 0) {
      return Promise.resolve();
    }

    let returnPromise = Promise.resolve(); // Just take a random one, since they all finish simultaneously
    
    for (let cube of this.excludedCubes) {
      returnPromise = cube.animate(duration, update);
    }

    for (let mengerSponge of this.childSponges) {
      mengerSponge.animateAllExcludedCubes(duration, update);
    }

    return returnPromise;

  }

  // A fractal might need a higher definition during the animation, use this method
  public incrementIterations(): void {
    this.iterations++;

    // Simple case: this wasn't even a fractal
    if (this.iterations === 1) {

      // Create all the child elements of the fractal

      this.childSponges = [];
      this.createChildSponges();

      this.excludedCubes = [];
      this.createExcludedCubes();

      return;
    }

    // If this had child elements already, delegate the task to the child sponges
    for (let sponge of this.childSponges) {
      sponge.incrementIterations();
    }

  }

}
