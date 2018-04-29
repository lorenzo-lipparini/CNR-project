
export const vertSrc = `

  attribute vec3 aPosition;

  void main() {
    gl_Position = vec4(aPosition, 1.0);
  }

`;

const makeFragSrc = (setColor: string) => `

  precision highp float;

  uniform vec2 view;
  uniform vec2 zoomCenter;
  uniform float zoomFactor;
  uniform int maxIterations;

  void main() {
    vec2 c = zoomCenter + 1.0 / zoomFactor * (gl_FragCoord.xy - view / 2.0) / view.x;
  
    vec2 z = vec2(0.0);

    int steps = -1;
    for (int i = 0; i < 10000; i++) {
      if (i > maxIterations) {
        break;
      }

      z = vec2(z.x*z.x - z.y*z.y, 2.0*z.x*z.y) + c;

      if (z.x*z.x + z.y*z.y > 4.0) {
        steps = i;
        break;
      }
    }

    ${setColor}
  }

`;

/**
 * Creates a shader source which renders the mandelbrot set using only two colors;
 * The colors must be given as three comma-separated floating point values ranging from 0.0 to 1.0 representing the RGB components of the color.
 * 
 * @param inColor Color of the points inside the Mandebrot set
 * @param outColor Color of the poins outside the Mandelbrot set
 */
const makeBinaryPattern = (inColor: string, outColor: string) => makeFragSrc(`
  gl_FragColor = (steps == -1) ? vec4(${inColor}, 1.0) : vec4(${outColor}, 1.0);
`);

export const fragSrcs = {

  'black-and-white': makeBinaryPattern('0.0, 0.0, 0.0', '1.0, 1.0, 1.0'),
  'white-and-black': makeBinaryPattern('1.0, 1.0, 1.0', '0.0, 0.0, 0.0'),
  
  'simple-red': makeFragSrc(`

    float percent = float(steps) / 1000.0;
  
    gl_FragColor = (steps == -1) ? vec4(0.0, 0.0, 0.0, 1.0) : vec4(
      min(1.0, percent * 3.0),
      min(1.0, max(0.0, (percent - 0.33) * 3.0)),
      min(1.0, max(0.0, (percent - 0.66) * 3.0)),
      1.0
    );

  `),

  'fire-red': makeFragSrc(`

    float percent = float(steps - 50 * (steps / 50)) / 50.0;
  
    gl_FragColor = (steps == -1) ? vec4(0.0, 0.0, 0.0, 1.0) : vec4(
      min(1.0, percent * 3.0),
      min(1.0, max(0.0, (percent - 0.33) * 3.0)),
      min(1.0, max(0.0, (percent - 0.66) * 3.0)),
      1.0
    );

  `)

};