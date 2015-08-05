var utils = require('./utils.js');
var vec3 = require('gl-matrix').vec3;
var mat4 = require('gl-matrix').mat4;
var Camera = require('./camera');
var cube = require('./cube');
var KeyHandler = require('./keyhandler');
var Program = require('./program');

var game = {
  init: function() {
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
    game.fpsNode = utils.getTextNode("#fps");
    game.positionNode = utils.getTextNode("#position");
    game.lookAtNode = utils.getTextNode("#lookAt");
    game.running = true;
    game.frames = 0;
    game.resize();
    
    game.program = new Program(game.gl);
    game.program.addShader("game.v.glsl", game.gl.VERTEX_SHADER);
    game.program.addShader("game.f.glsl", game.gl.FRAGMENT_SHADER);
    game.program.link()
      .then(function() {
        game.program.use();

        game.vertexData = game.gl.createBuffer();
        game.gl.bindBuffer(game.gl.ARRAY_BUFFER, game.vertexData);
        game.gl.bufferData(game.gl.ARRAY_BUFFER,
                           new Float32Array(cube.vertices),
                           game.gl.STATIC_DRAW);
        
        game.colorData = game.gl.createBuffer();
        game.gl.bindBuffer(game.gl.ARRAY_BUFFER, game.colorData);
        game.gl.bufferData(game.gl.ARRAY_BUFFER,
                           new Float32Array(cube.colors),
                           game.gl.STATIC_DRAW);
        
        game.vertAttribute = game.program.getAttribLocation("vert");
        game.projectionMatrix = game.program.getUniformLocation("projection");
        game.viewMatrix = game.program.getUniformLocation("view");
        game.modelMatrix = game.program.getUniformLocation("model");
        game.colorAttribute = game.program.getAttribLocation("color");
        game.gl.enableVertexAttribArray(game.vertAttribute);
        game.gl.enableVertexAttribArray(game.colorAttribute);

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
      game.running = true;
      document.addEventListener("mousemove", game.mouseMoveCallback, false);
    }
    else {
      game.running = false;
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
    if (!game.previous) {
      game.previous = now;
    }
    if (now - game.previous > 1000) {
      var fps = Math.round(game.frames / (now - game.previous) * 1000);
      game.fpsNode.nodeValue = "" + fps;
      game.previous = now;
      game.frames = 0;
    }
    game.positionNode.nodeValue = utils.vec2str(game.camera.position);
    game.lookAtNode.nodeValue = utils.vec2str(game.camera.lookat);
    
    var p = mat4.create();
    mat4.perspective(p, 45, game.canvas.width/game.canvas.height, 1, 100);
    game.gl.uniformMatrix4fv(game.projectionMatrix, false, p);

    game.keyHandler.tick();
    
    game.gl.uniformMatrix4fv(game.viewMatrix, false, game.camera.getLookAt());
    game.gl.clearColor(0, 0, 0, 1);
    game.gl.clear(game.gl.COLOR_BUFFER_BIT | game.gl.DEPTH_BUFFER_BIT);
    var m = mat4.create();
    var player = {position: [0.0,0.0,-1.0]};
    mat4.translate(m, m, vec3.fromValues(player.position[0], player.position[1], player.position[2]));
    game.gl.uniformMatrix4fv(game.modelMatrix, false, m);
    
    game.gl.bindBuffer(game.gl.ARRAY_BUFFER, game.colorData);
    game.gl.vertexAttribPointer(game.colorAttribute,
                                3, game.gl.FLOAT, false, 0, 0);

    game.gl.bindBuffer(game.gl.ARRAY_BUFFER, game.vertexData);
    game.gl.vertexAttribPointer(game.vertAttribute,
                                3, game.gl.FLOAT, false, 0, 0);
    
    game.gl.drawArrays(game.gl.TRIANGLES, 0, 12*3);

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
