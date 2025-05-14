import Matrix from './Matrix.js'

onmessage = function(e) {
  if( e.data.setFps ){
    Matrix.setFps( e.data.setFps );
  } else if( e.data.gamepadData ){
    Matrix.updateGamepad( e.data.gamepadData );
  } else if( e.data.imageData ){
    Matrix.setImageData( e.data.imageData );
  } else if( e.data.functText ){
    Matrix.setFunct( e.data.functText );
  } else {
    Matrix.init( e.data.canvas, 256, 256);
    console.log( "worker OK!", e);
  }
};
