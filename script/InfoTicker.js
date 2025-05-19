const tickerEl = $id('ticker');

let permaText = ['Only show cpu if too high!'];

let permaTextIndex = 0;
let timeoutId = -1;

const InfoTicker = {
  init: function( el ){ tickerEl = el; },
  start: function(){
    let nextText = '';

    nextText = permaText[ permaTextIndex ];
    permaTextIndex = (permaTextIndex+1) % permaText.length;

    tickerEl.innerHTML = nextText;
    //}
    timeoutId = setTimeout( InfoTicker.start, 2000 );
  },
  stop: function(){ clearTimeout( timeoutId ); },
  addNonPermaText: function(newMsg){
    permaText = [];
    permaText.push( newMsg );
    InfoTicker.stop();
    InfoTicker.start();
  },
}

InfoTicker.start();

export default InfoTicker;
