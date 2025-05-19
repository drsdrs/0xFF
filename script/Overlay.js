const getOverlayTemplate = function(){
  return `
    <div id="overlay">
      <div id="overlayPromptBox">
        <h4 id="overlayInfo"> Really wanna to that ? </h4>
        <input type="text" maxlength="16" size="16" name="overlayTextInput" placeholder="Text goes here..." id="overlayTextInput">
        <button type="button" id="overlayNoButton">No</button>
        <button type="button" id="overlayYesButton">Yes</button>
      </div>
    </div>
    <style media="screen">
    #overlay{
      position: fixed;
      display: none;
      overflow: hidden;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.75);
      margin: 0 auto;
      text-align: center;
      z-index: 999;
    }
    #overlay input{ background: #237; }
    #overlayPromptBox{
      background: rgba(0,0,0,0.5);
      position: relative;
      top: 35%;
      padding: 12px 6px 24px 6px;
      display: inline-block;
      border: 3px solid #777;
    }

    #overlayYesButton { background: #273;}
    #overlayNoButton { background: #732;}
    </style>`
}

let showOverlay = undefined;
let overlayActive = false;
let cbYes = function(){ console.log("YES") }

const init = function(){
  const overlayEl = $id('overlay');
  const overlayInfoEl = $id('overlayInfo');
  const overlayInputEl = $id('overlayTextInput');
  const overlayYesButtonEl = $id('overlayYesButton');
  const overlayNoButtonEl = $id('overlayNoButton');


  overlayYesButtonEl.onclick = function(){
    if( overlayInputEl.placeholder.length ){   // InputText must be filled, if textInput is defined
      if( overlayInputEl.value ){
        cbYes( overlayInputEl.value );
      } else {  // input needed, blink inputText to signal required field
        overlayInputEl.placeholder = 'Name it PLZ !'
        overlayInputEl.focus();
        return;
      }
    } else {  //  textInput is NOT defined
      cbYes();
    }
    hideOverlay()
  }

  overlayNoButtonEl.onclick = function(){
    hideOverlay()
  }

  showOverlay = function( text, cbYesNew, textInput){
    overlayActive = true;
    cbYes = cbYesNew;
    overlayInputEl.value = '';
    if( textInput ){  // need text input field
      overlayInputEl.value = textInput;
      overlayInputEl.style.display = 'block';
    } else {  // NO need of text input field
      overlayInputEl.style.display = 'none';
      overlayInputEl.placeholder = '';

    }
    overlayInfoEl.innerText = text;
    overlayEl.style.display = 'block';
    overlayInputEl.focus();
  }

  function hideOverlay(){
    overlayActive = false;
    overlayEl.style.display = 'none';
  }

}

const Overlay = {
  init: function(){
    const overlayWrap = document.createElement('div');
    overlayWrap.innerHTML = getOverlayTemplate();
    document.body.appendChild( overlayWrap );
    init();
    document.body.addEventListener( 'keydown', function(e){
      if( overlayActive == false ){ return; }
      if( e.key == 'Enter' || e.key == ' '){ $id('overlayYesButton').click() }
      if( e.key == 'Escape' || e.key == 'Backspace' ){ $id('overlayYesButton').click() }
    });
  },
  show: function( text, cbYesNew, textInputBool){
    showOverlay( text, cbYesNew, textInputBool)
  }
}


export default Overlay
