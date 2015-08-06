var io = require('socket.io-client');
var log = require('./log');
var config = require('../common/config');
var world = require('./world');

function key(cx, cy, cz) {
  return cx+","+cy+","+cz;
}

function Client(name) {
  var self = this;
  var socket = io();
  this.socket = socket;
  this.players = [];
  this.name = name;
  this.pendingChunks = {};
  
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

  socket.on("chunk", function(msg) {
    try {
      delete self.pendingChunks[key(msg.cx, msg.cy, msg.cz)];
      world.addChunk(msg);
    }
    catch (e) {
      console.log(e);
    }
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

Client.prototype.getChunk = function(cx, cy, cz) {
  cx = Math.trunc(cx);
  cy = Math.trunc(cy);
  cz = Math.trunc(cz);

  if (this.pendingChunks[key(cx,cy,cz)]) {
    return;
  }
  this.socket.emit("getChunk", {"cx": cx,
                                "cy": cy,
                                "cz": cz});
  this.pendingChunks[key(cx, cy, cz)] = true;
};

Client.prototype.numberOfPendingChunks = function() {
  return Object.keys(this.pendingChunks).length;
};

module.exports = Client;
