###_TITLE_###
Simple demo

###_SETUP_###
t&t>>8

###_LOOP_###
r += 1
g = t^t>>8
g *= (t>>24)%16
b += ((r&t>>25)&0xF0)%7
g ^= b
t -= 0
