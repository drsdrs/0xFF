t = 0
len = res*res
pixels = new Uint8Array( len*3 )
i = 0

###_SETUP_###

loopFunct = ( dt, gp )->
  ###_PRE_LOOP_START_###
###_PRE_LOOP_###
  ###_PRE_LOOP_END_###
  for indexPixel in [0...len]
    i = indexPixel*3
    r = pixels[ i+0 ]
    g = pixels[ i+1 ]
    b = pixels[ i+2 ]
    x = indexPixel%res;
    y = (indexPixel/res)>>0;
    ###   LOOP_START  ###
###_LOOP_###
    ###   LOOP_END  ###
    pixels[ i+0 ] = r
    pixels[ i+1 ] = g
    pixels[ i+2 ] = b
  return pixels

return [ loopFunct, pixels ]
