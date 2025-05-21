const styleElement = document.createElement('style');
document.head.appendChild(styleElement);
let seed = 0;
let Rnd = undefined;

/**
 * Converts an RGB color value to HSL. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and l in the set [0, 1].
 *
 * @param   Number  r       The red color value
 * @param   Number  g       The green color value
 * @param   Number  b       The blue color value
 * @return  Array           The HSL representation
 */
function rgbToHsl(r, g, b) {
  r /= 255, g /= 255, b /= 255;

  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h, s, l = (max + min) / 2;

  if (max == min) {
    h = s = 0; // achromatic
  } else {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }

    h /= 6;
  }

  return [ h, s, l ];
}

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  l       The lightness
 * @return  Array           The RGB representation
 */
function hslToRgb(h, s, l) {
  var r, g, b;
  if (s == 0) {
    r = g = b = l; // achromatic
  } else {
    function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    }

    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;

    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return [ r * 255, g * 255, b * 255 ];
}

function rgbToHtmlColor( color ){
  return `#${((1 << 24) + ((color[0]&0xFF) << 16) + ((color[1]&0xFF) << 8) + (color[2]&0xFF)).toString(16).slice(1).toUpperCase()}`
}

function adjustColor(color, factor) {
    let r = parseInt(color.slice(1, 3), 16);
    let g = parseInt(color.slice(3, 5), 16);
    let b = parseInt(color.slice(5, 7), 16);

    r = Math.min(255, Math.max(0, Math.floor(r * factor)));
    g = Math.min(255, Math.max(0, Math.floor(g * factor)));
    b = Math.min(255, Math.max(0, Math.floor(b * factor)));

    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
}

function generatePalette(numHues) {
    let cssOutput = '';
    let startHue = Rnd.next()*Rnd.next()*100;
    let hueInc = Rnd.next()*Rnd.next()*2;//(1/(numHues/2))+(Rnd.next()/(numHues/2));
    let val = 0.2 + Rnd.next()*Rnd.next()/18;
    let sat = val;

    if( Rnd.next()<.1 ){ hueInc = 0;}
    else if( Rnd.next()>.9 ){ hueInc = 1/numHues; }

    if( Rnd.next()>.9 ){
      sat = 0; 
      val = Rnd.next()/3;
    } else if( Rnd.next()>.5 ){
      sat = 1-val
    }
    c.l(Rnd.next())

    for (let i = 0; i < numHues; i+=1) {
      startHue += hueInc;

      const baseColor = rgbToHtmlColor( hslToRgb( startHue%1, sat, val ) ); // Use seed + i for different colors
      const lightColor = adjustColor(baseColor, 1.25);
      const normalColor = baseColor;
      const darkColor = adjustColor(baseColor, 0.75);

      cssOutput += `.color${i} { background-color: ${normalColor}; }\n`;


    }

    // Append the CSS to a <style> element
    styleElement.textContent = cssOutput;

}

const CssColor = {
  init: function( seedNew, RndNew ){
    if( RndNew ){ Rnd = RndNew;}
    if( seedNew ){
      seed = seedNew*Math.PI;
      Rnd.seed(seed);
    }
    generatePalette( 32 );

  }
}

export default CssColor
