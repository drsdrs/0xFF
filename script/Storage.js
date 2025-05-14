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
  let existingItem = localStorage.getItem( storagePrefix+prgName );
  if( existingItem == undefined ){  // TODO for now Overwrite, but later need Overlay question
    addToPrgList( prgName );
    return true;
  }
  activePrgName = prgName;
  localStorage.setItem( 'savedActivePrgName', activePrgName );
  savePrg( codeObj );
  return true;
}

function removePrg( ){
  removeFromPrgList( activePrgName );
  localStorage.removeItem( storagePrefix+activePrgName );
}

function savePrg(  codeObj ){
  localStorage.setItem( storagePrefix+activePrgName, JSON.stringify( codeObj ) );
}

function loadPrg( prgName ){
  if( prgName ){
    activePrgName = prgName;
  } else {
    prgName = activePrgName;
  }
  return JSON.parse( localStorage.getItem( storagePrefix+prgName ) );
}


const readTxt = async( url )=> {
  let response = await fetch (url);
  const txt = await response.text().then(( str ) => {
      return str.split('\r');    // return the string after splitting it.
  });
}


function loadDemosAndSave(){
  const demos = [ 'demo_gamepad' ];

  demos.forEach(async(demoName, i) => {
    const demoCode = await loadText('./script/templates/'+demoName+'.coffee');
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
    Storage.new( demoName, { title: descr.trim(), setup: setupCode.trim(), loop: loopCode.trim() } );
  });

}

Storage = {
  init: function( ){

    const prgListTemp = localStorage.getItem('prgList');
    if( prgListTemp == undefined ){
      localStorage.setItem('prgList', JSON.stringify([]) );
      prgList = [];
    } else {
      prgList = JSON.parse( prgListTemp );
      activePrgName = prgList[0];
    }

    loadDemosAndSave();

    const savedActivePrgName = localStorage.getItem('savedActivePrgName');
    if( savedActivePrgName ){ activePrgName = savedActivePrgName; }
    else { activePrgName = prgList[0]; }

  },
  new: newPrg,
  remove: removePrg,
  save: savePrg,
  list: function(  ){ return prgList; },
  getActivePrgIndex: function(  ){
    for (let i = 0; i < prgList.length; i++) {
      if( activePrgName == prgList[i] ) return i;
    }
  },
  load: loadPrg,
  delete: removePrg
}

export default Storage
