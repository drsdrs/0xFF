// add short info for gamepad anywhere, or "No gamepad connected."

Gamepad = {
  init: null, // get gamepads nad show info in // TODO make info scrollbar
  get: function(){
    c.l( navigator.getGamepads()[0] )
  }, // i need btn's and 1-4 axis ....
}

export default Gamepad
