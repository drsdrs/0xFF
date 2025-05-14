const codeTitleEl = $id('codeEditorTitle');
const codeContainerLoopEl = $id('codeEditorLoop');
const codeContainerSetupEl = $id('codeEditorSetup');
const codeCompiledEl = $id('codeCompiled');
const errorEl = $id('errorOutput');
const errorOutputContainer = $id('errorOutputContainer');
let keyKeys = {};
let saveCodeCb = null;

function convertTabsToSpaces( text ) {
  return text.replace(/ {2}/g, '\t');
}


let codeMirrorOptions = { // Config for CodeMirror
  lineNumbers: true,
  theme: 'monokai',
  mode: 'coffeescript',
  autoCloseBrackets: true,
  matchBrackets: true,
  killTrailingSpace: true,
  autoIndentRulers: true,
  indentUnit: 2,
  tabSize: 2,
  indentWithTabs: true,
  extraKeys: {
    Tab: function(cm) {
      var spaces = Array(cm.getOption("indentUnit") + 1).join(" ");
      cm.replaceSelection(spaces, "end");
    },
    "Shift-Tab": "indentLess"
  }
};

var editorSetup = CodeMirror.fromTextArea(
  codeContainerSetupEl.getElementsByTagName('textarea')[0],
  codeMirrorOptions
);
var editorLoop = CodeMirror.fromTextArea(
  codeContainerLoopEl.getElementsByTagName('textarea')[0],
  codeMirrorOptions
);

codeMirrorOptions.readOnly = true;
codeMirrorOptions.mode = 'javascript';

var compiledCodeEditor = CodeMirror.fromTextArea(
  codeCompiledEl.getElementsByTagName('textarea')[0],
  codeMirrorOptions
);

async function getAndSendCode( target ){
  let loop = editorLoop.getValue();
  let setup = editorSetup.getValue();

  let codeLines = loop.split('\n').filter(line => line.trim() !== '');
  for (let i = 0; i < codeLines.length; i++) {
    codeLines[i] = '\t\t' + codeLines[i]; // Add a tab at the beginning of each line
  }
  loop = codeLines.join('\n');

  let fullCode = await loadText('./script/templates/mainLoop.coffee');
  fullCode = fullCode.replace('###_SETUP_###', setup);
  fullCode = fullCode.replace('###_LOOP_###', loop);
  fullCode = convertTabsToSpaces( fullCode );
  let compiledCode = '';
  try {
    compiledCode = CoffeeScript.compile(fullCode, {bare: true})
  } catch (e) {
    compiledCodeEditor.mode = 'coffeescript';
    compiledCodeEditor.setValue( fullCode );
    errorEl.innerText = e;
    errorEl.style.background = '#622';
    errorOutputContainer.style.background = '#622';
    c.error(e);
    return
  }

  compiledCodeEditor.setValue( compiledCode );
  let codeRes = new Function('img', compiledCode);

  let errMsg = 0;
  let res = '';

  try {
    let func = codeRes;
    res = func( [[],[],[],[],[],[]] )[0]( 0, {axis: [0,0,0,0,0,0], btn:[] } );
    errMsg = 0;
  } catch (e) {
    errMsg = e;
  }

  if(errMsg){
    errorEl.innerText = errMsg;
    errorEl.style.background = '#622';
    errorOutputContainer.style.background = '#622';
    c.error(errMsg);
    return;
  } else {
    errorEl.innerText =
      'No errors, result is: \nred:'+res[0]+", blue:"+res[1]+", green:"+res[2];
    errorEl.style.background = '#262';
    errorOutputContainer.style.background = '#262';
  }
  saveCodeCb( compiledCode );
  return compiledCode;
}

codeContainerLoopEl.onkeyup = keyUp;
codeContainerLoopEl.onkeydown =  keyDown;
codeContainerSetupEl.onkeyup = keyUp;
codeContainerSetupEl.onkeydown =  keyDown;

function keyUp(e){
  keyKeys[e.key] = false;
}

function keyDown(e){
  keyKeys[e.key] = true;
  //codeContainerLoopEl.innerHTML = codeContainerLoopEl.innerText.replace(/==/g, '<span class="condition">==</span>');

  if(keyKeys["Control"] && keyKeys["s"]){
    e.preventDefault();
    getAndSendCode( );
  }
}

const Editors = {
  init: function( saveCodeCbNew ){
    saveCodeCb = saveCodeCbNew;
    //getAndSendCode()
  },
  getCode: function(){
    return {
      title: $id('codeEditorTitleInput').value.replace(/[^a-zA-Z0-9]/g, '_'),
      setup: editorSetup.getValue(),
      loop: editorLoop.getValue()
    }
  },
  setCode: function( code ){
    if( code == undefined ) return;
    $id('codeEditorTitleInput').value = code.title.replace(/[^a-zA-Z0-9]/g, '_');
    editorSetup.setValue( convertTabsToSpaces( code.setup ) );
    editorLoop.setValue( convertTabsToSpaces( code.loop ) );
    getAndSendCode( codeContainerLoopEl );
  },
}

export default Editors
