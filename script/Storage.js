const storagePrefix = 'prg_';
let c = console; // replace with your custom logger if needed

function getPrgList() {
  const data = localStorage.getItem('prgList');
  return data ? JSON.parse(data) : [];
}

function setPrgList(prgList) {
  localStorage.setItem('prgList', JSON.stringify(prgList));
}

function getActivePrgName() {
  let name = localStorage.getItem('activePrgName');
  if (name) return name;

  const prgList = getPrgList();
  if (prgList.length > 0) {
    name = prgList[0];
    setActivePrgName(name);
    return name;
  }

  throw new Error("No active program name found and prgList is empty");
}

function setActivePrgName(name) {
  c.log('setActivePrgName', name);
  localStorage.setItem('activePrgName', name);
}

function addToPrgList(name) {
  const prgList = getPrgList();
  if (!prgList.includes(name)) {
    prgList.push(name);
    setPrgList(prgList);
  }
}

function removeFromPrgList(name) {
  const prgList = getPrgList().filter(n => n !== name);
  setPrgList(prgList);
}

function savePrg(name, codeObj, fps, scale) {
  c.log('savePrg', name);
  if (!codeObj || typeof codeObj !== 'object') {
    throw new Error('Invalid code object');
  }

  addToPrgList(name);
  codeObj.fps = fps;
  codeObj.scale = scale;
  localStorage.setItem(storagePrefix + name, JSON.stringify(codeObj));
}

function loadPrg(name) {
  const json = localStorage.getItem(storagePrefix + name);
  if (!json) {
    throw new Error(`No program found with name: ${name}`);
  }
  return JSON.parse(json);
}

function removePrg() {
  const name = getActivePrgName();
  removeFromPrgList(name);
  localStorage.removeItem(storagePrefix + name);

  const prgList = getPrgList();
  if (prgList.length === 0) {
    savePrg('New', { title: 'Empty', setup: '', preLoop: '', loop: ''}, 4, 1);
    setActivePrgName('New');
  } else {
    setActivePrgName(prgList[0]);
  }
}

// -- DEMO LOADING --

async function loadText(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status}`);
  }
  return res.text();
}

async function parseAndSaveDemo(name, text) {
  try {
    const loopSplit = text.split('###_LOOP_###');
    if (loopSplit.length < 2) throw 'Missing ###_LOOP_###';
    const loop = loopSplit.pop();

    const preSplit = loopSplit[0].split('###_PRE_LOOP_###');
    if (preSplit.length < 2) throw 'Missing ###_PRE_LOOP_###';
    const preLoop = preSplit.pop();

    const setupSplit = preSplit[0].split('###_SETUP_###');
    if (setupSplit.length < 2) throw 'Missing ###_SETUP_###';
    const setup = setupSplit.pop();

    const titleSplit = setupSplit[0].split('###_TITLE_###');
    if (titleSplit.length < 2) throw 'Missing ###_TITLE_###';
    const title = titleSplit.pop();

    const scaleSplit = titleSplit[0].split('###_SCALE_###');
    if (scaleSplit.length < 2) throw 'Missing ###_SCALE_###';
    const scale = scaleSplit.pop().trim();

    const fpsSplit = scaleSplit[0].split('###_FPS_###');
    if (fpsSplit.length < 2) throw 'Missing ###_FPS_###';
    const fps = fpsSplit.pop().trim();

    savePrg(name, { title, setup, preLoop, loop}, fps, scale );
  } catch (err) {
    console.error(`Error parsing demo "${name}":`, err);
  }
}

async function loadAndSaveDemos() {
  const demos = ['demo_gamepad', 'demo_simple', 'demo_images'];

  await Promise.all(
    demos.map(async (name) => {
      try {
        const code = await loadText(`./script/templates/${name}.coffee`);
        await parseAndSaveDemo(name, code);
      } catch (err) {
        console.error(`Failed to load demo ${name}:`, err);
      }
    })
  );
}

function initPrgList() {
  if (localStorage.getItem('prgList') == null) {
    setPrgList([]);
  }
}

// -- MODULE EXPORT --

const Storage = {
  init: async function (cb) {
    initPrgList();
    await loadAndSaveDemos();

    if (typeof cb === 'function') cb();

    return; // explicitly async
  },

  save: savePrg,
  load: loadPrg,
  remove: removePrg,
  delete: removePrg, // alias
  list: getPrgList,
  getActivePrgName,
  setActivePrgName,
  getActivePrgIndex: () => getPrgList().indexOf(getActivePrgName()),
};

export default Storage;
