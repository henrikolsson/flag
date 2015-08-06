var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var players = {};
var config = require('../common/config');
var SimplexNoise = require('simplex-noise'),
    simplex = new SimplexNoise(Math.random);

function noise2d(a, b) {
  var sum = 0;
  var strength = 1.0;
  var scale = 1.0;

  for(var i = 0; i < 16; i++) {
    sum += strength * simplex.noise2D(a * 0.007, b * 0.007);
    scale *= 2.0;
    strength *= 0.2;
  }

  return sum;
}

function noise3d(a, b, c) {
  var sum = 0;
  var strength = 1.0;
  var scale = 1.0;

  for(var i = 0; i < 4; i++) {
    sum += strength * Math.abs(simplex.noise3D(a,b,c) * scale);
    scale *= 1.0;
    strength *= 1.0;
  }

  return sum;
}

function getBlock(chunk, x, y, z) {
  return chunk[((x) + ((y)*config.CHUNK_SIZE_X) + ((z)*config.CHUNK_SIZE_Y*config.CHUNK_SIZE_X))];
}

function setBlock(chunk, x, y, z, v) {
  chunk[((x) + ((y)*config.CHUNK_SIZE_X) + ((z)*config.CHUNK_SIZE_Y*config.CHUNK_SIZE_X))] = v;
}

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

  socket.on("getChunk", function(msg) {
    var buffer = new ArrayBuffer(config.CHUNK_SIZE_X * config.CHUNK_SIZE_Y * config.CHUNK_SIZE_Z);
    var chunk = new Int8Array(buffer);
    for (var x=0;x<config.CHUNK_SIZE_X;x++) {
      var ax = msg.cx * config.CHUNK_SIZE_X + x;
      for (var z=0;z<config.CHUNK_SIZE_Z;z++) {
        var az = msg.cz * config.CHUNK_SIZE_Z + z;
        var n = noise2d(ax,az) * 4;
        var h = n * 2 + 10;
        for (var y=0;y<config.CHUNK_SIZE_Y;y++) {
          var ay = msg.cy * config.CHUNK_SIZE_Y + y;
          if (ay < h) {
            var r = noise3d(ax / 16.0,
                            ay / 16.0,
                            az / 16.0);
            var type = 1;
            //console.log(n + r * 5, r);
            if(n + r * 5 < 4)
              type = 7;
            else if(n + r * 5 < 8)
              type = 3;
            else if(r < 1.25)
              type = 6;
            setBlock(chunk, x, y, z, type);
          } else {
            setBlock(chunk, x, y, z, 0);
          }
        }
      }
    }
    socket.emit("chunk", {"cx": msg.cx,
                          "cy": msg.cy,
                          "cz": msg.cz,
                          "data": buffer});
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
