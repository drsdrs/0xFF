Howler.autoUnlock = false;

const button = $id('audioPlayBtn');
let sound = {}

let howlerState = 0; // 0=notInit, 1=notMuted 2=muted

const noteRatio = [
  1,
  16/15,
  9/8,
  6/5,
  5/4,
  4/3,
  7/5,
  3/2,
  8/5,
  5/3,
  7/4,
  15/8,
];

button.addEventListener('click', () => {
  if( howlerState == 0 ){
    howlerState = 1;
  } else if( howlerState == 1 ){
    Howler.mute( true );
    howlerState = 2;
    button.innerText = 'Play ⏵';
    return;
  } else if( howlerState == 2 ){
    Howler.mute( false );
    button.innerText = 'Stop ⏸';
    howlerState = 1;
    return;
  }



  function generateChannels( channelAmount ) {
      let channels = [];
      for (let i = 0; i < channelAmount; i++) {
          channels[ i ] = sound.play();
          sound.rate( 0, channels[i] );
          sound.volume( 0, channels[i] );
      }
      return channels;
  }

  const channelAmount = 3;

  let cnt = 0;
  sound = new Howl({
    src: ['square.wav'],
    autoplay: false,
    preload: true,
    loop: true,
    volume: 1,
    rate: 0,
    onload: () => {
      Howler.volume( $id('volumeSlider').value/100 );
      console.log('Sound loaded');
      const channels = generateChannels( channelAmount );
      button.innerText = 'Stop ⏸'
      setInterval(() => {
        for (let i = 0; i < channelAmount; i++) {
            sound.volume( 1, channels[i] );
            cnt = cnt+2;
            const soundId = channels[ i ];
            const oct = ((cnt/12)>>0)%12;
            const note = ((cnt)%12);
            sound.rate( oct+noteRatio[ note ], soundId ); // Play the selected sprite
            //if(Math.random()>.5) sound.volume( Math.random(), soundId ); // Play the selected sprite
        }
      }, 250);
    }
  });




  sound.load()

});

$id('volumeSlider').addEventListener('input', (event) => {
    Howler.volume( event.target.value/100 );
});

export default null;
