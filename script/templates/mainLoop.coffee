t = 0
len = 256*256
pixels = new Uint8Array( len*3 )
i = 0
while i < pixels.length
  pixels[i] = ###_SETUP_###
  i++

loopFunct = ( dt, gp )->
  #indexPixel = len
  for indexPixel in [0...len]
    i = indexPixel*3
    r = pixels[ i+0 ]
    g = pixels[ i+1 ]
    b = pixels[ i+2 ]
    x = indexPixel%256;
    y = (indexPixel/256)>>0;
###   LOOP_START  ###
###_LOOP_###
###   LOOP_END  ###
    pixels[ i+0 ] = r
    pixels[ i+1 ] = g
    pixels[ i+2 ] = b
  return pixels

return [ loopFunct, pixels ]
