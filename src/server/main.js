var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var players = {};
app.use(express.static(__dirname + '/../../public'));

io.on('connection', function(socket) {
  var id = socket.id;
  console.log("user connected");
  players[id] = {"state": "connected"};
  var handle;
  socket.on('disconnect', function() {
    console.log('user disconnected');
    if (handle) {
      clearInterval(handle);
    }
    delete players[id];
  });
  
  socket.on('position', function(msg) {
    players[id].position = [msg['0'], msg['1'], msg['2']];
  });

  socket.on('chat', function(msg) {
    var payload = {"message": msg.message,
                   "player": players[id].name};
    console.log("chat", payload);
    io.emit("chat", payload);
  });
  
  socket.on('hello', function(msg) {
    if (!msg.name || handle) {
      return;
    }
    
    players[id].name = msg.name;
    players[id].state = 'registered';

    handle = setInterval(function() {
      var registered = [];
      for (var k in players) {
        var p = players[k];
        if (k !== id && p.state == 'registered') {
          registered.push({"name": p.name,
                           "position": p.position});
        }
      }
      
      socket.emit('players', registered);
    }, 10);
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
