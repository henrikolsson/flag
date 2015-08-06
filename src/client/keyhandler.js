function isChatDisplayed() {
  var el = document.querySelector(".chat");
  console.log(el.style.display);
  return el.style.display != 'none';
}

function toggleChat(game) {
  var el = document.querySelector(".chat");
  var isDisplayed = isChatDisplayed();
  if (!isDisplayed) {
    el.style.display = 'block';
    el.focus();
  } else {
    if (el.value && el.value.length > 0) {
      game.socket.emit("chat", {"message": el.value});
      el.value = "";
    }
    el.style.display = 'none';
  }
}

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
    13: toggleChat
  };
  document.body.addEventListener("keydown", this.keydown.bind(this));
  document.body.addEventListener("keyup", this.keyup.bind(this));
};

KeyHandler.prototype.keydown = function(e) {
  console.log(e.keyCode);
  if (!isChatDisplayed()) {
    this.keys[e.keyCode] = true;
  }
  for (var k in this.downHandlers) {
    if (this.downHandlers.hasOwnProperty(k)) {
      if (k == e.keyCode) {
        this.downHandlers[k](this.game);
      }
    }
  }
};

KeyHandler.prototype.keyup = function(e) {
  this.keys[e.keyCode] = false;
};

KeyHandler.prototype.reset = function() {
  var el = document.querySelector(".chat");
  var isDisplayed = isChatDisplayed();
  if (isDisplayed) {
    el.value = "";
    el.style.display = 'none';
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
