###_FPS_###
3
###_SCALE_###
0
###_TITLE_###
Simple demo
###_SETUP_###
while i < pixels.length
  pixels[i] = t&t>>8
  i++
###_PRE_LOOP_###
'simple'
###_LOOP_###
r += 1
g = t^t>>8
g *= (t>>24)%16
b += ((r&t>>25)&0xF0)%7
g ^= b
t -= 0
