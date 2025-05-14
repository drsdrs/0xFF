let loopFunct = function( gp ){ return pixelData; }
let gamepadData = { axis: [0,0,0,0,0,0], btn:[] }

const INIT_SIZE = 1<<8;
// Create a buffer for the pixel data
let pixelData = new Uint8Array(INIT_SIZE * INIT_SIZE * 3);
let imageData = []
let canvas;

let timeoutTime = 1000/60;
let animate = undefined;
let stopAnimate = false;

let DEBUG_FPS = false;
const FPS_60 = (1000/60);

let latestTimeoutId = -1;

let cpuLoad = 0;

function handleContextLost(event) {
  event.preventDefault();
  cancelAnimationFrame( latestTimeoutId );
  clearTimeout( latestTimeoutId );
  c.l('handleContextLost');
}

function handleContextRestored(event) {
  c.l('handleContextRestored');
  init();
}

function init(canvasNew){
    if( canvasNew ){ canvas = canvasNew; }
    else if( canvas == undefined ){
      return console.error("No canvas supplied");
    }

    canvas.addEventListener( "webglcontextlost", handleContextLost, false);
    canvas.addEventListener( "webglcontextrestored", handleContextRestored, false);
    const gl = canvas.getContext('webgl');
    if (!gl) { console.error('WebGL not supported'); }

    // Define the size of the pixel matrix
    const pixelSize = 1; // Each pixel is 1x1

    canvas.width = INIT_SIZE;
    canvas.height = INIT_SIZE;
    let size2 = INIT_SIZE*INIT_SIZE;


    // Create a texture
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set texture parameters for pixelated effect
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    // Vertex shader source code
    const vertexShaderSource = `
        attribute vec2 a_position;
        varying vec2 v_texCoord;
        void main() {
            gl_Position = vec4(a_position, 0, 1);
            v_texCoord = vec2(a_position.x * 0.5 + 0.5, 1.0 - (a_position.y * 0.5 + 0.5)); // Flip the y-coordinate
        }
    `;

    // Fragment shader source code
    const fragmentShaderSource = `
        precision mediump float;
        varying vec2 v_texCoord;
        uniform sampler2D u_texture;
        void main() {
            gl_FragColor = texture2D(u_texture, v_texCoord);
        }
    `;

    // Compile shader
    function compileShader(gl, source, type) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            return shader;
        }
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
    }

    // Create program
    const vertexShader = compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    // Create a buffer for the position data
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = new Float32Array([
        -1, -1,
        1, -1,
        -1, 1,
        1, 1,
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    // Get the attribute and uniform locations
    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const textureLocation = gl.getUniformLocation(program, 'u_texture');

    // Enable the position attribute
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Function to generate random pixel data
    let t = 0;
    let tInc = 1;
    let color;

    // Animation loop

    let dateOld = Date.now()
    let dateNow = Date.now()

    let timeLoop = 0;
    let timeRest = 0;

    // Animation loop
    animate = function() {
      if (stopAnimate) { console.log("STOPED ANIMATING"); return; }
      dateNow = Date.now();
      const delta = dateNow-dateOld;
      dateOld = dateNow;
      // add delta too loop funct !
      pixelData.set( loopFunct( delta, gamepadData ) );
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(
          gl.TEXTURE_2D, 0, gl.RGB, INIT_SIZE, INIT_SIZE,
          0, gl.RGB, gl.UNSIGNED_BYTE, pixelData
      );
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      if (timeoutTime > FPS_60) {
        latestTimeoutId = setTimeout( animate, timeoutTime);
      } else {
        latestTimeoutId = setTimeout( (function(){
          requestAnimationFrame(animate);
        }), timeoutTime);
      }

    }
}

let Matrix = {
  init: function( canvasNew ){
    console.log("INIT MATRIX");
    canvas = canvasNew;
    init( canvasNew );
    stopAnimate = false;
    animate();  // startAnimation
  },
  updateGamepad: function( gamepadDataNew ){
    gamepadData = gamepadDataNew;
  },
  setFunct: function(functText){
    const setupRes = new Function('img', functText)( imageData );
    loopFunct = setupRes[0];
    pixelData.set( setupRes[1] );
  },
  setImageData: function( imageDataNew ){
    imageData = imageDataNew;
  },
  setFps: function( fpsNew ){
    if( fpsNew < 0 ){
      return stopAnimate = true;
    } else if ( fpsNew == 0 ){
      timeoutTime = 0;
    } else {
      timeoutTime = 1000/fpsNew;
    }
    if ( stopAnimate == true ){
      stopAnimate = false;
      animate();  // startAnimation
    }
    console.log("setFps", fpsNew, timeoutTime, stopAnimate);
  }
}

export default Matrix
