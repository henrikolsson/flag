var Chat = require('./chat');

var KeyHandler = function(game) {
  this.game = game;
  this.keys = {};
  this.tickHandlers = {
    "w": game.camera.goForward.bind(game.camera),
    "s": game.camera.goBack.bind(game.camera),
    "a": game.camera.goLeft.bind(game.camera),
    "d": game.camera.goRight.bind(game.camera),
    "q": game.camera.goUp.bind(game.camera),
    "e": game.camera.goDown.bind(game.camera)
  };
  this.downHandlers = {
    13: new Chat(game.client)
  };
  this.currentHandler = null;
  document.body.addEventListener("keydown", this.keydown.bind(this));
  document.body.addEventListener("keyup", this.keyup.bind(this));
};

KeyHandler.prototype.keydown = function(e) {
  if (!this.currentHandler) {
    this.keys[e.keyCode] = true;
  }
  for (var k in this.downHandlers) {
    if (this.downHandlers.hasOwnProperty(k)) {
      if (k == e.keyCode) {
        if (this.downHandlers[k].toggle()) {
          this.currentHandler = this.downHandlers[k];
        } else {
          this.currentHandler = null;
        }
      }
    }
  }
};

KeyHandler.prototype.keyup = function(e) {
  this.keys[e.keyCode] = false;
};

KeyHandler.prototype.reset = function() {
  var el = document.querySelector(".chat");
  if (this.currentHandler) {
    this.currentHandler.dismiss();
  }
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
  for (var k in this.tickHandlers) {
    if (this.tickHandlers.hasOwnProperty(k)) {
      if (this.isKeyPressed(k)) {
        this.tickHandlers[k](delta);
      }
    }
  }
};

module.exports = KeyHandler;
