
export const vertSrc = `

  attribute vec3 aPosition;

  void main() {
    gl_Position = vec4(aPosition, 1.0);
  }

`;

/**
 * Creates to source code for a fragment shader that renders the Mandelbrot set;
 * for each complex number, the 'steps' variable equals the number of iterations
 * applied before it escaped.
 * 
 * @param setColor String of code where gl_FragColor is set; it can make use of the 'steps' variable
 */
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
 * Ensures that all the numbers in the expression are written with the decimal point,
 * so that glsl doesn't interpret them as integers instead of floating point values.
 */
function fix(strings: TemplateStringsArray, ...values: (number | string)[]): string {
  let result = strings[0];

  for (let i = 0; i < values.length; i++) {
    const value = values[i];

    if (typeof value === 'number') {
      // If the value is a number, always show it with three digits, even if they are just zeros
      result += value.toFixed(3);
    } else {
      // Do nothing to any other kind of data
      result += value;
    }
    result += strings[i + 1];
  }

  return result;
}


/**
 * Creates a shader source which renders the Mandelbrot set using only two colors;
 * The colors must be given as arrays of three numbers in the range [0, 1] representing the RGB components of the color.
 * 
 * @param inColor Color of the points inside the Mandebrot set
 * @param outColor Color of the poins outside the Mandelbrot set
 */
const makeBinaryPattern = (inColor: [number, number, number], outColor: [number, number, number]) => makeFragSrc(fix`
  gl_FragColor = (steps == -1) ? vec4(${inColor[0]}, ${inColor[1]}, ${inColor[2]}, 1.0) : vec4(${outColor[0]}, ${outColor[1]}, ${outColor[2]}, 1.0);
`);

/**
 * Creates a shader source which renders the Mandelbrot set interpolating between a set of colors.
 * The colors must be given as arrays of three numbers in the range [0, 1] representing the RGB components of the color.
 * 
 * @param inColor Color of the points inside the Mandebrot set
 * @param outColorSteps Fixed color values used to linearly interpolate the color of the points outside the Mandelbrot set
 */
function makeLerpPattern(inColor: [number, number, number], outColorSteps: [number, number, number][]) {
  let outColorExpr = '';

  // The change in percent iterations between points colored with consecutive step colors
  const interval = 1 / outColorSteps.length;

  for (let i = 0; i < outColorSteps.length; i++) { // Foreach pair of consecutive step colors
    const initialColor = outColorSteps[i];
    // In the last step, transition back to the first color
    const finalColor = (i === outColorSteps.length - 1) ? outColorSteps[0] : outColorSteps[i + 1];

    // Perform a linear interpolation between the two step colors
    const gradientExpr =
      fix`vec4(${initialColor[0]}, ${initialColor[1]}, ${initialColor[2]}, 1.0) + (percent - ${i * interval}) / ${interval} * vec4(${finalColor[0] - initialColor[0]}, ${finalColor[1] - initialColor[1]}, ${finalColor[2] - initialColor[2]}, 0.0)`;

    if (i === outColorSteps.length - 1) { // If this is the last step
      // Complete the previous ternary expression without opening a new one
      outColorExpr += ` : ${gradientExpr}`;
    } else {
      // Build a chain of ternary expressions
      outColorExpr += fix` : (percent <= ${(i + 1) * interval}) ? ${gradientExpr}`;
    }
  }
  
  return makeFragSrc(fix`
    float percent = float(steps - 50 * (steps / 50)) / 50.0;

    gl_FragColor = (steps == -1) ? vec4(${inColor[0]}, ${inColor[1]}, ${inColor[2]}, 1.0)${outColorExpr};
  `);
}


export const fragSrcs = {

  'black-and-white': makeBinaryPattern([0, 0, 0], [1, 1, 1]),
  'white-and-black': makeBinaryPattern([1, 1, 1], [0, 0, 0]),
  
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

  `),

  'blue-to-red': makeLerpPattern([0, 0, 0], [
    [0.000, 0.278, 0.667],
    [0.639, 0.000, 0.000],
    [1.000, 0.667, 0.000],
    [0.937, 0.825, 0.553],
    [0.000, 0.686, 0.710]
  ])

};
