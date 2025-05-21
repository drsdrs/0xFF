###_TITLE_###
Example Gamepad
###_SETUP_###
while i < pixels.length
  pixels[i] = t&t>>8
  i++
###_PRE_LOOP_###
'gamepad'
###_LOOP_###
r = g = b = t&t>>8
if gp.btn[0] then g = img[0][i+1]
if gp.btn[1] then g = img[1][i+1]
if gp.btn[2] then g = img[2][i+1]

if gp.btn[3] then b = img[0][i+2]
if gp.btn[4] then b = img[1][i+2]
if gp.btn[5] then b = img[2][i+2]

if gp.btn[6] then r = img[0][i+0]
if gp.btn[7] then r = img[1][i+0]
if gp.btn[8] then r = img[2][i+0]

if gp.btn[9]
  r = img[0][i+0]
  g = img[0][i+1]
  b = img[0][i+2]
  if true
    if false
      while true
        return

if x < gp.axis[0] && y < gp.axis[1] then b = img[4][i+0]
if x is gp.axis[0] then r = b = 128
if y is gp.axis[1] then r = b = 128

if x > gp.axis[2] && y > gp.axis[3] then g = img[3][i+1]
if x is gp.axis[2] then r = g = 127
if y is gp.axis[3] then r = g = 127

if y < gp.axis[4] then r = img[3][i+2]
if y is gp.axis[5] then g = 255

t += 1.00001

# Heavy cpu test-load
#(Math.random() * 1000 for iii in [1..10]).reduce ((sum, num) -> Math.pow( Math.pow( Math.pow(num,sum), sum ), num) ), 0
