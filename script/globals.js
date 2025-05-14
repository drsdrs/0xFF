const c = console; c.l = c.log;
const $id = function( id ){ return document.getElementById( id ); }
async function loadText(url){
  const res = await fetch(url);
  const text = await res.text();
  return text;
}
