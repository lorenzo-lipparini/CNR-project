'use strict'

class MengerSponge extends Cube {

  constructor(pos, side, color, iterations) {

    super(pos, side, color);

    this.iterations = iterations;
    if (this.iterations === 0) {
      return;
    }
  

    // Recursive part of the fractal
    this.smallerSponges = [];
    this.createSmallerSponges();

    // Smaller cubes which are not part of the fractal (used in the animation process)
    this.smallerCubes = [];
    this.createSmallerCubes();

    // Make this property true to show the cubes which are not part of the fractal (used in the animation process)
    this.showRemovedCubes = false;
    
  }

  get showRemovedCubes() {
    return this._showRemovedCubes;
  }

  set showRemovedCubes(value) {
    // Prevent useless recursion
    if (value === this._showRemovedCubes) {
      return this._showRemovedCubes;
    }

    this._showRemovedCubes = value;
    
    if (this.iterations !== 0) {
      // Assign the poperty recursively to every child sponge
      for (let mengerSponge of this.smallerSponges) {
        mengerSponge.showRemovedCubes = this._showRemovedCubes;
      }
    }

    return this._showRemovedCubes;
  }

  createSmallerSponges() {

    let smallSide = this.side / 3;

    // Create the direct child menger sponges and keep a reference to them

    // Helper function to create new sponges
    let smallerSponge = (relativePosX, relativePosY, relativePosZ) => {
      return new MengerSponge(new p5.Vector(this.pos.x + relativePosX, this.pos.y + relativePosY, this.pos.z + relativePosZ), smallSide, this.color, this.iterations - 1);
    };

    for (let y = -smallSide; y <= smallSide; y += smallSide) {

      this.smallerSponges.push(smallerSponge(+smallSide, y, +smallSide));
      this.smallerSponges.push(smallerSponge(+smallSide, y, -smallSide));
      this.smallerSponges.push(smallerSponge(-smallSide, y, +smallSide));
      this.smallerSponges.push(smallerSponge(-smallSide, y, -smallSide));
      
      if (y != 0) {
        this.smallerSponges.push(smallerSponge(0, y, +smallSide));
        this.smallerSponges.push(smallerSponge(0, y, -smallSide));
        this.smallerSponges.push(smallerSponge(+smallSide, y, 0));
        this.smallerSponges.push(smallerSponge(-smallSide, y, 0));
      }

    }
    
  }

  createSmallerCubes() {

    let smallSide = this.side / 3;

    // Create the direct child cubes and keep a reference to them

    // Helper function to create new cubes
    let smallerCube = (relativePosX, relativePosY, relativePosZ) => {
      return new Cube(new p5.Vector(this.pos.x + relativePosX, this.pos.y + relativePosY, this.pos.z + relativePosZ), smallSide, this.color);
    };

    for (let y = -smallSide; y <= smallSide; y += smallSide) {
      this.smallerCubes.push(smallerCube(0, y, 0));
    }
    
    this.smallerCubes.push(smallerCube(0, 0, +smallSide));
    this.smallerCubes.push(smallerCube(0, 0, -smallSide));
    this.smallerCubes.push(smallerCube(+smallSide, 0, 0));
    this.smallerCubes.push(smallerCube(-smallSide, 0, 0));

  }

  show() {

    if (this.iterations === 0) {
      // Non-iterative menger sponges are just cubes
      super.show();
      return;
    }

    for (let mengerSponge of this.smallerSponges) {
      mengerSponge.show();
    }

    if (this.showRemovedCubes) {
      for (let cube of this.smallerCubes) {
        cube.show();
      }
    }

  }

  animateSmallerCubes(iteration, ...params) {

    // NOTE: doesn't work if iteration > this.iterations, which makes sense

    let returnPromise; // Just take a random one, since they all finish simultaneously

    if (iteration === 1) { // In this case, it just refers to the child cubes of this MengerSponge
      for (let cube of this.smallerCubes) {
        returnPromise = cube.animate(...params);
      }

      return returnPromise;
    }
    
    // If it doesn't refer to the cubes of this sponge, just delegate the direct child sponges
    for (let mengerSponge of this.smallerSponges) {
      returnPromise = mengerSponge.animateSmallerCubes(iteration - 1, ...params);
    }

    return returnPromise;
    
  }

}