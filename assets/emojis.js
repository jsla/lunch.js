window.onload = function () {
  var canvas = document.getElementById('emojis')
  var ctx = canvas.getContext('2d')
  var W = window.innerWidth
  var H = window.innerHeight
  canvas.width = W
  canvas.height = H

  // Generate array of emojis 
  var MAX = 50
  var emojis = []

  var _emoji =['1F354','1F35F','1F32E','1F32F','1F35C','1F34E','1F32D','1F355'];
  var _totalEmoji = _emoji.length;


  for (var i = 0; i < MAX; i++) {
    var emoji = {}
    emoji.code = _emoji[Math.floor((Math.random() * _totalEmoji))];
    console.log(emoji.code);
    emoji.char = _fromCodePoint(emoji.code);
    
    emojis.push({
      e: emoji.char,
      x: Math.random() * W,                                 // x position (0-canvas width)
      y: Math.random() * H,                                 // y position (0-canvas height)
      l: Math.random() * 25 + 5,                            // length     (5 - 50)
      r: Math.floor(Math.random() * 360),                   // rotation   (0-360)
      v: Math.random() * 1 + 1                              // velocity   (1 - 2)
    })
  }

  function _fromCodePoint(codepoint) {
    var code = typeof codepoint === 'string' ?
          parseInt(codepoint, 16) : codepoint;
    if (code < 0x10000) {
      return String.fromCharCode(code);
    }
    code -= 0x10000;
    return String.fromCharCode(
      0xD800 + (code >> 10),
      0xDC00 + (code & 0x3FF)
    );
  }

  // Draw each sprinkle
  function draw () {
    ctx.clearRect(0, 0, W, H)

    emojis.forEach(function (s) {
      // save the canvas context
      ctx.save()

      // translate the context to the center point of the sprinkle and rotate,
      // translate back to 0,0 after rotation
      ctx.translate(s.x, s.y)
      //rotate the canvas to the specified degrees
      //ctx.rotate(s.r * Math.PI / 360)
      ctx.translate(-s.x, -s.y)


      var isEven = emoji.arrayIndex % 2;
      ctx.font = isEven ? '20px serif' : '30px serif';
      ctx.fillText(s.e, s.x, s.y);
      // restore the context to the normal non-rotated translation
      ctx.restore()
    })
    ctx.fill()
    update()
  }

  // update the emojis with new rotation and y position so they fall
  function update () {
    emojis.forEach(function (s, i) {
      s.y += 2 * s.v // move the emoji down once
      s.r = (s.r + 1) % 360 // rotate by 1 pixel
      // when emojis fall off the bottom, add them to the top again.
      if (s.y > H + 20) {
        emojis[i] = {
          e: s.e,
          x: Math.random() * W,
          y: -20,
          l: s.l,
          r: s.r,
          v: s.v
        }
      }
    })
  }

  // kick off the drawing loop
  setInterval(draw, 33)
}
