var io = require('socket.io-client');
var log = require('./log');
var config = require('../common/config');
var world = require('./world');

function Client(name) {
  var self = this;
  var socket = io();
  this.socket = socket;
  this.players = [];
  this.name = name;
  this.pendingChunks = [];
  
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
      for (var i=0;i<self.pendingChunks.length;i++) {
        if (self.pendingChunks[i].cx == msg.cx &&
            self.pendingChunks[i].cy == msg.cy &&
            self.pendingChunks[i].cz == msg.cz) {
          self.pendingChunks.splice(i, 1);
          break;
        }
      }    
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
  
  for (var i=0;i<this.pendingChunks.length;i++) {
    if (this.pendingChunks[i].cx == cx &&
        this.pendingChunks[i].cy == cy &&
        this.pendingChunks[i].cz == cz) {
      return;
    }
  }
  this.socket.emit("getChunk", {"cx": cx,
                                "cy": cy,
                                "cz": cz});
  this.pendingChunks.push({"cx": cx,
                           "cy": cy,
                           "cz": cz});
};

Client.prototype.numberOfPendingChunks = function() {
  return this.pendingChunks.length;
};

module.exports = Client;
