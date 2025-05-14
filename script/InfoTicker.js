const tickerEl = $id('ticker');

let permaText = ['Cpu:.0.25', 'Fps:.59'];
let nonPermaText = ['Hy, have fun !','Warning!','Important!','Non perma text!'];

let permaTextIndex = 0;
let timeoutId = -1;


// COLOR !!!!!!!!!!!!
// maybe multiline
// show permanent all at once, non permanent show with mid-delay, then show next
// only need for short info,
//so every new msg gets pushed into html after min-delay of viewing msg
const InfoTicker = {
  init: function( el ){ tickerEl = el; },
  start: function(){
    let nextText = '';
    if( nonPermaText.length ){ nextText = nonPermaText.shift(); }
    else {
      nextText = permaText[ permaTextIndex ];
      permaTextIndex = (permaTextIndex+1) % permaText.length;
    }
    tickerEl.innerHTML = nextText;
    //}
    timeoutId = setTimeout( InfoTicker.start, 2000 );
  },
  stop: function(){ clearTimeout( timeoutId ); },
  setPermaText: function(){},
  setNonPermaText: function(){},
}

InfoTicker.start();

export default InfoTicker;
