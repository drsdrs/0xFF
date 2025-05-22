import Matrix from './Matrix.js'

onmessage = function(e) {

  if( Matrix[e.data.action] ){
    Matrix[e.data.action]( e.data.value );
  } else {
    console.error("unrecognized msg,",e.data);
  }
};
