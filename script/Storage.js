const storagePrefix = 'prg_';


function getPrgList(){
  return JSON.parse( localStorage.getItem('prgList') );
}

function setPrgList( prgList ){
  localStorage.setItem('prgList', JSON.stringify(prgList));
}


function setActivePrgName( newActivePrgName ){
  c.l( 'setActivePrgName', newActivePrgName );
  localStorage.setItem( 'activePrgName', newActivePrgName);
}

function getActivePrgName(){
  let activePrgName = localStorage.getItem( 'activePrgName' );
  if( activePrgName ){ return activePrgName; }
  let prgList = getPrgList();
  c.l("getactivePrgName", prgList)
  if( prgList[0] && prgList[0].length ){
    activePrgName = prgList[0];
    setActivePrgName( activePrgName );
    return;
  }
  setActivePrgName( '' );
  return '';
}

function addToPrgList(prgName) {
  let prgList = getPrgList();
  if (!prgList.includes(prgName)) {
    prgList.push(prgName);
    setPrgList( prgList);
  }
}

function removeFromPrgList(prgName) {
  let prgList = getPrgList();
  prgList = prgList.filter(name => name !== prgName);
    setPrgList( prgList);
}

function removePrg() {
  let prgList = getPrgList();
  removeFromPrgList( getActivePrgName() );
  localStorage.removeItem( storagePrefix + getActivePrgName() );
  if( prgList.length == 0 ){  // make empty one IF prglist.len is zero
    Storage.save('New', { title: 'Empty', setup: '', preLoop: '', loop: '' });
  }
  setActivePrgName( prgList[0] );
}

function savePrg(prgName, codeObj) {
  c.l("savePrg", prgName);
  let prgList = getPrgList();
  if ( prgList.includes( prgName )==false ) {
    addToPrgList( prgName );
  }

  localStorage.setItem(storagePrefix + prgName, JSON.stringify(codeObj));
}

function loadPrg( prgName ) {
  const prg = localStorage.getItem(storagePrefix + prgName);
  if( prg == undefined ){ c.error("No prg found with name "+prgName); return 'No prg with name '+prgName+' '+prg }
  return JSON.parse(
    localStorage.getItem(storagePrefix + prgName)
  );
}

const loadText = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Response status: ${response.status}`);
  }
  return await response.text();
}

async function loadAndSaveDemos() {
  const demos = ['demo_gamepad', 'demo_simple', 'demo_images'];

  const demoPromises = demos.map(async (demoName, i) => {
    try {
      const demoCode = await loadText(`./script/templates/${demoName}.coffee`);
      let parts = demoCode.split('###_LOOP_###');
      if (parts.length < 2) {
        throw new Error(`Missing ###_LOOP_### marker in demo code for ${demoName}`);
      }
      const loopCode = parts.pop(); // Get the loop code
      
      parts = parts[0].split('###_PRE_LOOP_###');
      if (parts.length < 2) {
        throw new Error(`Missing ###_PRE_LOOP_### marker in demo code for ${demoName}`);
      }
      const preLoopCode = parts.pop(); // Get the setup code
      
      parts = parts[0].split('###_SETUP_###');
      if (parts.length < 2) {
        throw new Error(`Missing ###_SETUP_### marker in demo code for ${demoName}`);
      }
      const setupCode = parts.pop(); // Get the setup code

      const descrParts = parts[0].split('###_TITLE_###');
      if (descrParts.length < 2) {
        throw new Error(`Missing ###_TITLE_### marker in demo code for ${demoName}`);
      }
      const descr = descrParts.pop(); // Get the description

      // Save the demo
      savePrg( demoName, {
          title: descr, 
          setup: setupCode, 
          preLoop: preLoopCode, 
          loop: loopCode
        }
      );

      //c.l("Done loading demo", i, demoName, descr, setupCode);
    } catch (error) {
      console.error(`Error loading demo ${demoName}:`, error);
    }
  });

  await Promise.all(demoPromises);
}

function initPrgList(){
  if( getPrgList() == undefined ){
    setPrgList( new Array() );
  }
}

const Storage = {
  init: async function(cb) {
    initPrgList();
    await loadAndSaveDemos();
    if( cb ){ cb(); }
  },
  remove: removePrg,
  save: savePrg,
  list: function() { return getPrgList(); },
  getActivePrgIndex: function() {
    return getPrgList().indexOf( getActivePrgName() );
  },
  getActivePrgName: getActivePrgName,
  setActivePrgName: setActivePrgName,
  load: loadPrg,
  delete: removePrg
}

export default Storage;
