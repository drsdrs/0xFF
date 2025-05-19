###_TITLE_###
Use images in the imageslider for drawing onto the canvas

###_SETUP_###
img[4][i]

###_LOOP_###
r = img[4][i]&t>>8
b = img[4][i+2]*t>>22
b >>= 7
b <<= 7
g = img[4][i+1]&t>>8
t+=1.0025