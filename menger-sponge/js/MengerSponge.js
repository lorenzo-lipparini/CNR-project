'use strict'

class MengerSponge extends Cube {

  contructor(pos, side, iterations = 1) {

    super(pos, side, iterations);
    if (iterations = 0) {
      return;
    }
 
  
    // Recursive part of the fractal
    this.smallerSponges = [];
    this.createSmallerSponges();

    // Smaller cuber which are not part of the fractal, used in the animation process
    this.smallerCubes = [];
    this.createSmallerCubes();
    
  }

  show() {

    for (let mengerSponge of this.smallerSponges) {
      mengerSponge.show();
    }

    for (let cube of this.smallerCubes) {
      cube.show();
    }

  }

}