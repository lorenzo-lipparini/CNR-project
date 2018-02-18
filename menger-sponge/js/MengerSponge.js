'use strict'

class MengerSponge extends Cube {

  constructor(pos, side, iterations) {

    super(pos, side);

    this.iterations = iterations;
    if (this.iterations === 0) {
      return;
    }
  

    // Recursive part of the fractal
    this.smallerSponges = [];
    this.createSmallerSponges();

    // Smaller cubes which are not part of the fractal, used in the animation process
    this.smallerCubes = [];
    this.createSmallerCubes();
    
  }

  createSmallerSponges() {

    let smallSide = this.side / 3;

    
    // Keep a reference to every child MengerSponge

    let smallerSponge = (relativePosX, relativePosY, relativePosZ) => {
      return new MengerSponge(new p5.Vector(this.pos.x + relativePosX, this.pos.y + relativePosY, this.pos.z + relativePosZ), smallSide, this.iterations - 1);
    };

    this.smallerSponges = [];

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


    // Keep a reference to every child Cube

    let smallerCube = (relativePosX, relativePosY, relativePosZ) => {
      return new Cube(new p5.Vector(this.pos.x + relativePosX, this.pos.y + relativePosY, this.pos.z + relativePosZ), smallSide);
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
      super.show();
      return;
    }

    for (let mengerSponge of this.smallerSponges) {
      mengerSponge.show();
    }

    for (let cube of this.smallerCubes) {
      cube.show();
    }

  }

  animateAll(...params) {

    if (this.iterations === 0) {
      return super.animate(...params);
    }

    let returnPromise; // Just take a random one, since they all finish simultaneously

    for (let mengerSponge of this.smallerSponges) {
      mengerSponge.animateAll(...params);
    }

    for (let cube of this.smallerCubes) {
      returnPromise = cube.animate(...params);
    }

    return returnPromise;

  }

  animateSmallerSponges(...params) {

    if (this.iterations === 0) {
      return super.animate(...params);
    }

    let returnPromise; // Just take a random one, since they all finish simultaneously

    for (let mengerSponge of this.smallerSponges) {
      returnPromise = mengerSponge.animateSmallerSponges(...params);
    }

    return returnPromise;

  }

  animateSmallerCubes(...params) {

    if (this.iterations === 0) {
      return;
    }

    let returnPromise; // Just take a random one, since they all finish simultaneously

    for (let mengerSponge of this.smallerSponges) {
      mengerSponge.animateSmallerCubes(...params);
    }

    for (let cube of this.smallerCubes) {
      returnPromise = cube.animate(...params);
    }

    return returnPromise;

  }

}