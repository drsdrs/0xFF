// TODO make export to single html OR executeable would be awesome....
// TODO save load
// TODO add image bar, to load images into, and use as typedArray in loop
// TODO add basic gamepad/keyboard input controls
// TODO export animated gif
// TODO add FPS setting to saved object

import Editors from './Editors.js'
import Overlay from './Overlay.js'
import SelectBox from './SelectBox.js'
import Storage from './Storage.js'
import Matrix from './Matrix.js'
import InfoTicker from './InfoTicker.js'
import Images from './Images.js'

const offscreenCanvas = $id('webglCanvas').transferControlToOffscreen();

const worker = new Worker('./script/canvasWorker.js', { type: 'module' });
worker.onmessage = function(event) {
  c.l("WORKER SAYS.....", event.data);
};

const fpsValues = [
  { value: 0,  content: 'Endless' },
  { value: 180 },
  { value: 120 },
  { value: 60 },
  { value: 30 },
  { value: 10 },
  { value: 1 },
  { value: -1,  content: 'Stop'},
];

const scaleValues = [
  { value: 0,  content: '256x256' },
  { value: 1,  content: '128x128' },
  { value: 2,  content: '64x64' },
  { value: 3,  content: '32x32' },
  { value: 4,  content: '16x16' },
  { value: 5,  content: '8x8' }
];


const headerEl = $id('header');
const btnContainer = $id('btnContainer')

/*---- Hamburger menu opener  ----*/
$id('collapseBtn').addEventListener('click', function(e){
  btnContainer.classList.toggle('invisible');
});
document.body.addEventListener('click', function(e){
  if(
    e.target.id == 'collapseBtn' ||
    e.target.classList.contains('custom-select-box')
  ){ return; }

  btnContainer.classList.add('invisible');
});


/*----  Program file select  ----*/
function overlayLoadCb(){
  const prg = Storage.load( selectedPrg );
  c.l("LoadPrg:", selectedPrg, prg );
  Editors.setCode( prg );
}

function fileSelectCb(selectedPrg){
  Overlay.show( 'Load program overwrites!', overlayLoadCb, false );
}

function makeFileSelectBox(){
  const prgList = Storage.list();
  c.l("Programms:",prgList)
  let selectPrgList = [];
  for (let i = 0; i < prgList.length; i++) {
    console.log('PRG:',i , (prgList[i]) );
    selectPrgList.push( { value: prgList[i], content: prgList[i]} );
  }

  SelectBox.add(
    'Program', btnContainer, selectPrgList, Storage.getActivePrgIndex(), fileSelectCb
  );
}


/*----      MAIN - INIT       ----*/
let lastCompiledCode = '';
const sendCodeCb = function( compiledCode ){
  lastCompiledCode = compiledCode;
  worker.postMessage( { functText: compiledCode } );
}

Images.init( function(){
  worker.postMessage( {canvas: offscreenCanvas}, [offscreenCanvas]);
  Overlay.init();
  Storage.init();
  const imageData = Images.getImageData();
  worker.postMessage( { imageData: imageData } );
  Editors.init( sendCodeCb );
  SelectBox.init();
  makeFileSelectBox();
  Editors.setCode( Storage.load() );
  worker.postMessage({ setFps: fpsValues[ selectedFpsIndex ].value });
  fadeBodyIn();
  //exportHTML();
});


//  EXPORT HTML

async function exportHTML(  ){
  let htmlTemplate = await loadText('./script/exporter/index.html');
  htmlTemplate = htmlTemplate.replace('/***_IMAGE_DATA_***/', JSON.stringify( Images.getImageData() ));
  htmlTemplate = htmlTemplate.replace('/***_CODE_***/', ( lastCompiledCode ) );
  htmlTemplate = htmlTemplate.replace('/***_TITLE_***/', Editors.getCode().title );

  let blobdtMIME =
      new Blob([htmlTemplate], { type: "text/html" })
  let url = URL.createObjectURL(blobdtMIME)
  let alink = document.createElement("a")
  alink.setAttribute("link", "index.html");
  alink.href = url;
  alink.target = '_blank';
  alink.click();

  return htmlTemplate;
}


$id('exportBtn').onclick = function(){
  exportHTML();
}


/*----  FPS selectBox  ----*/
const selectedFpsIndex = 3;
const selectFpsCb = function( fpsNew ){
  worker.postMessage({ setFps: fpsNew });

}
SelectBox.add( 'FPS', btnContainer, fpsValues, selectedFpsIndex, selectFpsCb);


/*----  Events  ----*/

$id('newBtn').onclick = function(){
  Overlay.show( 'New program', overlayNewCb, 'Program name here...' );
}

$id('saveBtn').onclick = function(){
  Overlay.show( 'Save program', overlaySaveCb, false );
}

$id('deleteBtn').onclick = function(){
  Overlay.show( 'Delete program ?', overlayDeleteCb, false );
}


const overlaySaveCb = function( ){
  Storage.save( Editors.getCode() );
}

const overlayNewCb = function( text ){
  const addResult = Storage.new( text, Editors.getCode() );
  makeFileSelectBox();
}

const overlayDeleteCb = function( ){
  Storage.delete();
  makeFileSelectBox();
};


/*----  GamePad fetch loop  ----*/

const fetchSkipFrames = 2;
let fetchSkiptCount = fetchSkipFrames;

let gamepadToHtmlCount = 0;
let gamePadInfoEl = $id('gamePadInfo');
function fetchGamepad(){
  if( fetchSkiptCount-- > 0 ){ return requestAnimationFrame( fetchGamepad ); }
  fetchSkiptCount = fetchSkipFrames;

  const navigatorGamepad = navigator.getGamepads()[0];
  if( navigatorGamepad == undefined ){ return requestAnimationFrame( fetchGamepad ); }

  let gamepadData = { axis: [], btn: [] };
  for (let i = 0; i < navigatorGamepad.buttons.length; i++) {
    if( navigatorGamepad.buttons[i].pressed ){ gamepadData.btn[i] = true; }
  }

  for (let i = 0; i < navigatorGamepad.axes.length; i++) {
    gamepadData.axis[i] = (128+navigatorGamepad.axes[i]*127)>>0;
  }

  //c.l( gamepadData.axes )
  if( (gamepadToHtmlCount++)%10 == 0 ){ gamePadInfoEl.innerText = navigator.getGamepads()[0].id;}
  worker.postMessage( { gamepadData: gamepadData } );
  requestAnimationFrame( fetchGamepad );
}

fetchGamepad();

function fadeBodyIn(){
  let opacity = Number(document.body.style.opacity)
  if( opacity < 1 ){
    document.body.style.opacity = opacity+0.005;
  } else {
    return document.body.style.opacity = null;
  }
  requestAnimationFrame( fadeBodyIn );
}
