const storagePrefix = 'prg_';
let activePrgName = '';
let prgList;

function addToPrgList( prgName ){
  prgList.push(prgName);
  localStorage.setItem('prgList', JSON.stringify( prgList ));
}
function removeFromPrgList( prgName ){
  for (let i = 0; i < prgList.length; i++) {
    if ( prgName == prgList[i] ){ prgList.splice( i, 1 ); }
  }
  localStorage.setItem('prgList', JSON.stringify( prgList ));
}

function newPrg( prgName, codeObj ){
  if( prgName == undefined || prgName.length == 0 ){ return c.error("No name given") }
  savePrg( prgName, codeObj );
  return true;
}

function removePrg( ){
  removeFromPrgList( activePrgName );
  localStorage.removeItem( storagePrefix+activePrgName );
}

function savePrg( prgName, codeObj ){
  if( prgName ){
    activePrgName = prgName;
  }

  let existingItem = localStorage.getItem( storagePrefix+activePrgName );
  if( existingItem == undefined ){
    addToPrgList( activePrgName );
  }

  localStorage.setItem( 'savedActivePrgName', activePrgName );
  localStorage.setItem( storagePrefix+activePrgName, JSON.stringify( codeObj ) );
}

function loadPrg( prgName ){
  if( prgName ){
    activePrgName = prgName;
  }
  c.l("LOAD:", activePrgName)
  localStorage.setItem( 'savedActivePrgName', activePrgName );
  return JSON.parse( localStorage.getItem( storagePrefix+activePrgName ) );
}


const loadText = async( url )=> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Response status: ${response.status}`);
  }

  const text = await response.text();
  return text;
}


async function loadAndSaveDemos(){
  const demos = [ 'demo_gamepad' ];

  for (let i = 0; i < demos.length; i++) {
    loadDemo( demos[i], i );
  }

  async function loadDemo(demoName, i){
    const demoCode = await loadText('./script/templates/'+demoName+'.coffee');
    c.l("DEMO",i,demoName);
    /*  Overwrite demos onload, for now.  */
    // let foundDemoInPrgList = false;
    // prgList.forEach((item, i) => {
    //   if( foundDemoInPrgList ){ return; }
    //   if( item == demoName ){ return foundDemoInPrgList = true; }
    // });
    let firstSplit = demoCode.split('###_LOOP_###');
    const loopCode = firstSplit.pop();
    firstSplit = firstSplit[0].split('###_SETUP_###');
    const setupCode = firstSplit.pop();
    const descr = firstSplit[0].split('###_TITLE_###').pop();
    Storage.save( demoName, { title: descr.trim(), setup: setupCode.trim(), loop: loopCode.trim() } );
    c.l("Done loading demo", i)
  };
}

function initPrgList(){
  const prgListTemp = localStorage.getItem('prgList');
  if( prgListTemp == undefined ){
    localStorage.setItem('prgList', JSON.stringify([]) );
    prgList = [];
  } else {
    prgList = JSON.parse( prgListTemp );
  }
  activePrgName = localStorage.getItem('savedActivePrgName');
}

function initActivePrgName(){
  const savedActivePrgName = localStorage.getItem('savedActivePrgName');
  if( savedActivePrgName ){ activePrgName = savedActivePrgName; }
  else {
    activePrgName = prgList[0];
    localStorage.setItem('savedActivePrgName', activePrgName);
  }
}

Storage = {
  init: async function( cb ){
    initPrgList();
    await loadAndSaveDemos();
    initActivePrgName();
  },
  remove: removePrg,
  save: savePrg,
  list: function(  ){ return prgList; },
  getActivePrgIndex: function(  ){
    for (let i = 0; i < prgList.length; i++) {
      if( activePrgName == prgList[i] ) return i;
    }
  },
  getActivePrgName: function(){ return activePrgName; },
  load: loadPrg,
  delete: removePrg
}

export default Storage
