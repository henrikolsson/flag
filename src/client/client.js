var io = require('socket.io-client');
var log = require('./log');

function Client(name) {
  var self = this;
  var socket = io();
  this.socket = socket;
  this.players = [];
  this.name = name;
  
  socket.on('disconnect', function() {
    log.write("disconnected");
  });
  
  socket.on('connect', function() {
    log.write("connected as " + name);
    socket.emit('hello', {"name": name});
  });
  
  socket.on('chat', function(msg) {
    log.write("<" + msg.player + "> " + msg.message);
  });
  
  socket.on('players', function(msg) {
    if (self.players.length != msg.length) {
      log.write("other players: " + msg.length);
    }
    self.players = msg;
  });
}

Client.prototype.chat = function(msg) {
  this.socket.emit("chat", {"message": msg});
};

Client.prototype.position = function(pos) {
  this.socket.emit("position", pos);
};

module.exports = Client;
