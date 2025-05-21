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
//import Matrix from './Matrix.js'
import InfoTicker from './InfoTicker.js'
import Images from './Images.js'
import Synth from './Synth.js'
import CssColor from './CssColor.js'
import Rnd from './Rnd.js'

const headerEl = $id('header');
const btnContainer = $id('btnContainer')

let bodyOpacity = 0;
const selectedFpsIndex = 3;

const offscreenCanvas = $id('webglCanvas').transferControlToOffscreen();

const worker = new Worker('./script/canvasWorker.js', { type: 'module' });
worker.onmessage = function(event) {
  c.l("WORKER SAYS.....", event.data);
};

/*----  Color.slider  ----*/
$id('colorSlider').addEventListener( 'change', function(e){
  CssColor.init( e.target.value );
  localStorage.setItem('theme', e.target.value);
});

/*----  FPS selectBox  ----*/
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
const selectFpsCb = function( fpsNew ){
  worker.postMessage({ setFps: fpsNew });
}
SelectBox.add( 'FPS', $id('fpsBtnContainer'), fpsValues, selectedFpsIndex, selectFpsCb);

/*      Later...   */
const scaleValues = [
  { value: 0,  content: '256x256' },
  { value: 1,  content: '128x128' },
  { value: 2,  content: '64x64' },
  { value: 3,  content: '32x32' },
  { value: 4,  content: '16x16' },
  { value: 5,  content: '8x8' }
];

/*     FILE OPERATIONS    */
const fileOperationValues = [
  { value: 'SaveRun', content: 'Save and run', callback: savePrgCb },
  { value: 'SaveAs' , callback: function(){
    Overlay.show( 'Save as:', overlaySaveAsCb, Storage.getActivePrgName() );
  }},
  { value: 'Delete' , callback: function(){
    Overlay.show( 'Delete program ?', overlayDeleteCb, false );
    Editors.setCode( Storage.load() );
  }},
  { value: 'ExportProject', content: 'Export project' , callback: function(){ c.l('TODO :)'); } },
  { value: 'ImportProject', content: 'Import project' , callback: function(){ c.l('TODO :)'); } },
  { value: 'ExportHTML', content: 'Export standalone HTML' , callback: exportHTML },
];

async function savePrgCb( newPrgName ){
  if( newPrgName ){ Storage.setActivePrgName( newPrgName ); }
  let compilationResult = await Editors.sendCode();
  if( compilationResult ){ //  compilation Success
    let activePrgName = Storage.getActivePrgName();
    InfoTicker.addNonPermaText( 'File "'+activePrgName+'" saved.' );
    Storage.save( activePrgName, Editors.getCode(), 'SetAsActive' );
  } else {  // compilation Failed
    InfoTicker.addNonPermaText( 'Not Saved! Errors...' );
  }
}

const overlaySaveAsCb = async function( newPrgName ){
  InfoTicker.addNonPermaText( 'File saved as "'+newPrgName+'".' );
  await savePrgCb( newPrgName );
  makeFileSelectBox();
}

const overlayDeleteCb = function( ){
  InfoTicker.addNonPermaText('Program "'+Storage.getActivePrgName()+'" deleted.');
  Storage.delete();
  makeFileSelectBox();
  Editors.setCode( Storage.load() );
};

SelectBox.add(
  'FILE', $id('fileBtnContainer'), fileOperationValues, -1, null
);

/*----  Program file select  ----*/
function loadPrgCb( prgName ){
  c.l('loadPrgCb', prgName)
  //Storage.save( Storage.getActivePrgName(), Editors.getCode(), 'SetAsActive' );
  const prg = Storage.load( prgName );
  Editors.setCode( prg );
  Storage.setActivePrgName( prgName );
  InfoTicker.addNonPermaText('Program "'+prgName+'" loaded.');
}


function makeFileSelectBox(){
  const prgList = Storage.list();
  c.l("Programms: ",prgList)
  let selectPrgList = [];
  for (let i = 0; i < prgList.length; i++) {
    selectPrgList.push( { value: prgList[i], content: prgList[i]} );
  }

  SelectBox.add(
    'PRG', $id('loadBtnContainer'), selectPrgList, Storage.getActivePrgIndex(), loadPrgCb
  );
}

/*      EXPORT HTML   */
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

  let gamepadData = { axis: {x:0,y:0}, btn: [] };
  for (let i = 0; i < 4; i++) {
    if( navigatorGamepad.buttons[i].pressed ){ gamepadData.btn[i] = true; }
  }

  gamepadData.axis.x = (128+navigatorGamepad.axes[0]*127)>>0;
  gamepadData.axis.y = (128+navigatorGamepad.axes[1]*127)>>0;
  

  //c.l( gamepadData.axes )
  if( (gamepadToHtmlCount++)%10 == 0 ){
    gamePadInfoEl.innerText = navigator.getGamepads()[0].id+'\n'
    gamePadInfoEl.innerText += 'Axis X: '+gamepadData.axis.x.toFixed(2)+' ';
    gamePadInfoEl.innerText += ' Y:'+gamepadData.axis.y.toFixed(2)+'\n';
    for (let i = 0; i < 4; i++) {
      if( i!=0 ) gamePadInfoEl.innerText += ' | '
      if( gamepadData.btn[i] ){
        gamePadInfoEl.innerText += ' BTN'+i+': 1';
      } else {
        gamePadInfoEl.innerText += ' BTN'+i+': 0';
      }
    }
  }
  worker.postMessage( { gamepadData: gamepadData } );
  requestAnimationFrame( fetchGamepad );
  //  TODO editor should get gamepad data, imgData also, 
  // to try code better
}

fetchGamepad();

/*      INTRO       */
function fadeBodyIn(){
  if( bodyOpacity < 1 ){
    document.body.style.opacity = bodyOpacity;
    bodyOpacity += .0125;
  } else {
    return document.body.style = null;
  }
  requestAnimationFrame( fadeBodyIn );
}

let lastCompiledCode = '';
const sendCodeCb = function( compiledCode ){
  lastCompiledCode = compiledCode;
  Storage.save( Storage.getActivePrgName(), Editors.getCode() ) 
  worker.postMessage( { functText: compiledCode } );
}

function sendImageDataCb( imageData ){
  worker.postMessage( { imageData: imageData } );
}

/*----      MAIN - INIT       ----*/
const loadetTheme = localStorage.getItem('theme');
$id('colorSlider').value = loadetTheme|0;
CssColor.init( loadetTheme, Rnd );

await Storage.init();
Editors.init( sendCodeCb );
Overlay.init();
SelectBox.init();
await Images.init( sendImageDataCb ); // removed await !?!?

let activePrg = Storage.load( Storage.getActivePrgName() );
Editors.setCode( activePrg );

makeFileSelectBox();

fadeBodyIn();

worker.postMessage( { setFps: fpsValues[selectedFpsIndex].value } );
worker.postMessage( { canvas: offscreenCanvas }, [offscreenCanvas] );
  
