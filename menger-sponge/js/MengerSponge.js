'use strict'

class MengerSponge extends Cube {

  constructor(pos, side, color, iterations) {

    super(pos, side, color);

    this.iterations = iterations;
    if (this.iterations === 0) {
      return;
    }
  

    // Recursive part of the fractal
    this.childSponges = [];
    this._createChildSponges();

    // Cubes which are not part of the fractal (used in the animation process)
    this.excludedCubes = [];
    this._createExcludedCubes();

    // Make this property true to show the cubes which are not part of the fractal (used in the animation process)
    this.showExcludedCubes = false;
    
  }

  get showExcludedCubes() {
    return this._showExcludedCubes;
  }

  set showExcludedCubes(value) {
    // Prevent useless recursion
    if (value === this._showExcludedCubes) {
      return this._showExcludedCubes;
    }

    this._showExcludedCubes = value;
    
    if (this.iterations !== 0) {
      // Recursively assign the poperty to every child sponge
      for (let mengerSponge of this.childSponges) {
        mengerSponge.showExcludedCubes = this._showExcludedCubes;
      }
    }

    return this._showExcludedCubes;
  }

  _createChildSponges() {

    let childSide = this.side / 3;

    // Create the direct child Menger sponges and keep a reference to them

    // Helper function to create new sponges
    let addChildSponge = (relativePosX, relativePosY, relativePosZ) => {
      this.childSponges.push(new MengerSponge(new p5.Vector(this.pos.x + relativePosX, this.pos.y + relativePosY, this.pos.z + relativePosZ), childSide, this.color, this.iterations - 1));
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

  _createExcludedCubes() {

    let childSide = this.side / 3;

    // Create the direct child cubes and keep a reference to them

    // Helper function to create new cubes
    let addExcludedCube = (relativePosX, relativePosY, relativePosZ) => {
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

  show() {

    if (this.iterations === 0) {
      // Non-iterative Menger sponges are just cubes
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

  animateExcludedCubes(iteration, ...params) {
    // NOTE: doesn't work if iteration > this.iterations, which makes sense

    let returnPromise; // Just take a random one, since they all finish simultaneously

    if (iteration === 1) { // In this case, it just refers to the child cubes of this MengerSponge
      for (let cube of this.excludedCubes) {
        returnPromise = cube.animate(...params);
      }

      return returnPromise;
    }
    
    // If it doesn't refer to the cubes of this sponge, just delegate the direct child sponges
    for (let mengerSponge of this.childSponges) {
      returnPromise = mengerSponge.animateExcludedCubes(iteration - 1, ...params);
    }

    return returnPromise;
    
  }

}