var KeyHandler = function(game) {
  this.game = game;
  this.keys = {};
  this.handlers = {
    "w": game.camera.goForward.bind(game.camera),
    "s": game.camera.goBack.bind(game.camera),
    "a": game.camera.goLeft.bind(game.camera),
    "d": game.camera.goRight.bind(game.camera),
    "q": game.camera.goUp.bind(game.camera),
    "e": game.camera.goDown.bind(game.camera)
  };
  document.body.addEventListener("keydown", this.keydown.bind(this));
  document.body.addEventListener("keyup", this.keyup.bind(this));
};

KeyHandler.prototype.keydown = function(e) {
  this.keys[e.keyCode] = true;
};

KeyHandler.prototype.keyup = function(e) {
  this.keys[e.keyCode] = false;
};

KeyHandler.prototype.reset = function() {
  for (var k in this.keys) {
    if (this.keys.hasOwnProperty(k)) {
      this.keys[k] = false;
    }
  }
};

KeyHandler.prototype.isKeyPressed = function(key) {
  if (typeof 'key' == 'string') {
    return this.keys[key.toUpperCase().charCodeAt(0)];
  } else {
    return this.keys[key];
  }
};

KeyHandler.prototype.tick = function(delta) {
  for (var k in this.handlers) {
    if (this.handlers.hasOwnProperty(k)) {
      if (this.isKeyPressed(k)) {
        this.handlers[k](delta);
      }
    }
  }
};

module.exports = KeyHandler;
