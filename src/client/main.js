var utils = require('./utils.js');
var vec3 = require('gl-matrix').vec3;
var mat4 = require('gl-matrix').mat4;
var Camera = require('./camera');
var cube = require('./cube');
var KeyHandler = require('./keyhandler');
var Program = require('./program');
var Cube = require('./cube');
var Stats = require('./stats');
var log = require('./log');
var io = require('socket.io-client');

var game = {
  init: function() {
    log.write("starting...");
    game.camera = new Camera();
    game.keyHandler = new KeyHandler(game);
    game.canvas = document.getElementById("game");
    game.gl = game.canvas.getContext("webgl");
    if (!game.gl) {
      utils.fatal("WebGL missing!");
      return;
    }

    console.log("Version: " + game.gl.getParameter(game.gl.VERSION));
    console.log("Vendor: " + game.gl.getParameter(game.gl.VENDOR));
    console.log("Renderer: " + game.gl.getParameter(game.gl.RENDERER));
    
    document.addEventListener('pointerlockchange', game.pointerLockChange, false);
    document.addEventListener('mozpointerlockchange', game.pointerLockChange, false);
    document.addEventListener('webkitpointerlockchange', game.pointerLockChange, false);
    
    game.canvas.addEventListener('click',
                                 game.canvas.requestPointerLock ||
                                 game.canvas.mozRequestPointerLock ||
                                 game.canvas.webkitRequestPointerLock);
    
    game.frames = 0;
    game.running = true;
    game.frames = 0;
    game.socket = io();
    game.name = "player" + Math.round(Math.random() * 1000);
    game.players = [];
    game.socket.on('disconnect', function() {
      log.write("disconnected");
    });
    game.socket.on('connect', function() {
      log.write("connected as " + game.name);
      game.socket.emit('hello', {"name": game.name});
    });
    game.socket.on('chat', function(msg) {
      console.log("chat");
      log.write("<" + msg.player + "> " + msg.message);
    });
    game.socket.on('players', function(msg) {
      if (game.players.length != msg.length) {
        log.write("other players: " + msg.length);
      }
      game.players = msg;
    });
    game.stats = new Stats(game);
    game.resize();
    
    game.program = new Program(game.gl);
    game.program.addShader("game.v.glsl", game.gl.VERTEX_SHADER);
    game.program.addShader("game.f.glsl", game.gl.FRAGMENT_SHADER);
    game.program.link()
      .then(function() {
        game.program.use();

        game.cube = new Cube(game.gl, game.program);

        game.projectionMatrix = game.program.getUniformLocation("projection");
        game.viewMatrix = game.program.getUniformLocation("view");
        game.modelMatrix = game.program.getUniformLocation("model");

        game.gl.blendFunc(game.gl.SRC_ALPHA, game.gl.ONE_MINUS_SRC_ALPHA);
        game.gl.enable(game.gl.BLEND);
        
        game.gl.disable(game.gl.CULL_FACE);
        game.gl.enable(game.gl.DEPTH_TEST);        
        window.requestAnimationFrame(game.animate);
      })
      .catch(function(err) {
        utils.fatal(err);
      });
  },

  pointerLockChange: function(e) {
    if (document.pointerLockElement === game.canvas ||
        document.mozPointerLockElement === game.canvas ||
        document.webkitPointerLockElement === game.canvas) {
      //game.running = true;
      document.addEventListener("mousemove", game.mouseMoveCallback, false);
    }
    else {
      //game.running = false;
      game.keyHandler.reset();
      document.removeEventListener("mousemove", game.mouseMoveCallback, false);
    }
  },

  mouseMoveCallback: function(e) {
    var x = e.movementX ||
        e.mozMovementX ||
        e.webkitMovementX ||
        0;
    var y = e.movementY ||
        e.mozMovementY ||
        e.webkitMovementY ||
        0;

    game.camera.look(x, y);
  },

  animate: function() {
    var handle = window.requestAnimationFrame(game.animate);
    try {
      game.render();
    } catch(err) {
      window.cancelAnimationFrame(handle);
      utils.fatal(err);
    }
  },

  render: function() {
    if (!game.running) {
      return;
    }
    var now = performance.now();
    if (!game.previousFrame) {
      game.previousFrame = now;
    }
    var delta = now - game.previousFrame;
    game.previousFrame = now;
    
    var p = mat4.create();
    mat4.perspective(p, 45, game.canvas.width/game.canvas.height, 1, 100);
    game.gl.uniformMatrix4fv(game.projectionMatrix, false, p);
    game.gl.uniformMatrix4fv(game.viewMatrix, false, game.camera.getLookAt());
    
    game.gl.clearColor(0, 0, 0, 1);
    game.gl.clear(game.gl.COLOR_BUFFER_BIT | game.gl.DEPTH_BUFFER_BIT);

    game.keyHandler.tick(delta);

    game.players.forEach(function(player) {
      var p = player.position;
      if (p) {
        game.cube.render(vec3.fromValues(p[0], p[1], p[2]));
      }
    });
    game.socket.emit("position", game.camera.position);
    game.stats.frameRendered();
    game.frames++;
  },

  resize: function() {
    var width = game.canvas.clientWidth;
    var height = game.canvas.clientHeight;
    if (game.canvas.width != width ||
        game.canvas.height != height) {
      game.canvas.width = width;
      game.canvas.height = height;
    }
    game.gl.viewport(0, 0, width, height);
  }
};

window.addEventListener('load', game.init);
window.addEventListener('resize', game.resize);
