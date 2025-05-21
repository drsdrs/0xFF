const codeContainerLoopEl = $id('codeEditorLoop');
const codeContainerSetupEl = $id('codeEditorSetup');
const codeContainerPreLoopEl = $id('codeEditorPreLoop');

const codeCompiledEl = $id('codeCompiled');
const codeCoffeeEl = $id('codeCoffee');
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
  codeContainerSetupEl.getElementsByTagName('textarea')[0], codeMirrorOptions
);

var editorLoop = CodeMirror.fromTextArea(
  codeContainerLoopEl.getElementsByTagName('textarea')[0], codeMirrorOptions
);

var editorPreLoop = CodeMirror.fromTextArea(
  codeContainerPreLoopEl.getElementsByTagName('textarea')[0], codeMirrorOptions
);

codeMirrorOptions.readOnly = true;

var coffeeCodeEditor = CodeMirror.fromTextArea(
  codeCoffeeEl.getElementsByTagName('textarea')[0], codeMirrorOptions
);

codeMirrorOptions.mode = 'javascript';

var compiledCodeEditor = CodeMirror.fromTextArea(
  codeCompiledEl.getElementsByTagName('textarea')[0], codeMirrorOptions
);

async function getAndSendCode( ){
  let loop = editorLoop.getValue();
  let preLoop = editorPreLoop.getValue();
  let setup = editorSetup.getValue();

  let codeLines = loop.split('\n').filter(line => line.trim() !== '');
  for (let i = 0; i < codeLines.length; i++) {
    codeLines[i] = '\t\t' + codeLines[i]; // Add a tab at the beginning of each line
  }
  loop = codeLines.join('\n');

  codeLines = preLoop.split('\n').filter(line => line.trim() !== '');
  for (let i = 0; i < codeLines.length; i++) {
    codeLines[i] = '\t' + codeLines[i]; // Add a tab at the beginning of each line
  }
  preLoop = codeLines.join('\n');

  let fullCoffeeCode = await loadText('./script/templates/mainLoop.coffee');
  fullCoffeeCode = fullCoffeeCode.replace('###_SETUP_###', setup);
  fullCoffeeCode = fullCoffeeCode.replace('###_PRE_LOOP_###', preLoop);
  fullCoffeeCode = fullCoffeeCode.replace('###_LOOP_###', loop);
  fullCoffeeCode = convertTabsToSpaces( fullCoffeeCode );

  let compiledCode = '';
  coffeeCodeEditor.setValue( fullCoffeeCode );

  try {
    compiledCode = CoffeeScript.compile(fullCoffeeCode, {bare: true})
  } catch (e) {
    errorEl.innerText = e;
    errorOutputContainer.classList.add('error')
    c.error(e);
    return false;
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
    errorOutputContainer.classList.add('error')
    c.error(errMsg);
    return false;
  } else {
    errorEl.innerText =
      'Result is: \nred:'+res[0]+", blue:"+res[1]+", green:"+res[2];
    errorOutputContainer.classList.remove('error')

  }
  saveCodeCb( compiledCode );
  return compiledCode;
}

codeContainerPreLoopEl.onkeyup = keyUp;
codeContainerPreLoopEl.onkeydown =  keyDown;

codeContainerLoopEl.onkeyup = keyUp;
codeContainerLoopEl.onkeydown =  keyDown;

codeContainerSetupEl.onkeyup = keyUp;
codeContainerSetupEl.onkeydown =  keyDown;

function keyUp(e){
  keyKeys[e.key] = false;
}

function keyDown(e){
  keyKeys[e.key] = true;

  if(keyKeys["Control"] && keyKeys["s"]){
    e.preventDefault();
    getAndSendCode( );
  }
}

const Editors = {
  init: function( saveCodeCbNew ){
    saveCodeCb = saveCodeCbNew;
  },
  getCode: function(){
    return {
      title: $id('codeEditorTitleInput').value,//.replace(/[^a-zA-Z0-9]/g, '_'),
      setup: editorSetup.getValue(),
      preLoop: editorPreLoop.getValue(),
      loop: editorLoop.getValue()
    }
  },
  setCode: function( code ){
    if( code == undefined ) return c.error('No code supplied !');
    $id('codeEditorTitleInput').value = code.title;//.replace(/[^a-zA-Z0-9]/g, '_');
    editorSetup.setValue( convertTabsToSpaces( code.setup ) );
    editorLoop.setValue( convertTabsToSpaces( code.loop ) );
    editorPreLoop.setValue( convertTabsToSpaces( code.preLoop ) );
    getAndSendCode( );
    return true;
  },
  sendCode: getAndSendCode,
}

export default Editors
