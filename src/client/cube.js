var vec3 = require('gl-matrix').vec3;
var mat4 = require('gl-matrix').mat4;

var vertices = [-1.0,-1.0,-1.0, 1.0,
                -1.0,-1.0, 1.0, 1.0,
                -1.0, 1.0, 1.0, 1.0,
                1.0, 1.0,-1.0, 1.0,
                -1.0,-1.0,-1.0, 1.0,
                -1.0, 1.0,-1.0, 1.0,
                1.0,-1.0, 1.0, 2.0,
                -1.0,-1.0,-1.0, 2.0,
                1.0,-1.0,-1.0, 2.0,
                1.0, 1.0,-1.0, 2.0,
                1.0,-1.0,-1.0, 2.0,
                -1.0,-1.0,-1.0, 2.0,
                -1.0,-1.0,-1.0, 3.0,
                -1.0, 1.0, 1.0, 3.0,
                -1.0, 1.0,-1.0, 3.0,
                1.0,-1.0, 1.0, 3.0,
                -1.0,-1.0, 1.0, 3.0,
                -1.0,-1.0,-1.0, 3.0,
                -1.0, 1.0, 1.0, 4.0,
                -1.0,-1.0, 1.0, 4.0,
                1.0,-1.0, 1.0, 4.0,
                1.0, 1.0, 1.0, 4.0,
                1.0,-1.0,-1.0, 4.0,
                1.0, 1.0,-1.0, 4.0,
                1.0,-1.0,-1.0, 1.0,
                1.0, 1.0, 1.0, 1.0,
                1.0,-1.0, 1.0, 1.0,
                1.0, 1.0, 1.0, 1.0,
                1.0, 1.0,-1.0, 1.0,
                -1.0, 1.0,-1.0, 1.0,
                1.0, 1.0, 1.0, 2.0,
                -1.0, 1.0,-1.0, 2.0,
                -1.0, 1.0, 1.0, 2.0,
                1.0, 1.0, 1.0, 2.0,
                -1.0, 1.0, 1.0, 2.0,
                1.0,-1.0, 1.0, 2.0];

function Cube(gl, program) {
  this.gl = gl;
  this.program = program;
  
  program.use();

  this.vertAttribute = program.getAttribLocation("vert");
  this.modelMatrix = program.getUniformLocation("model");
  
  gl.enableVertexAttribArray(this.vertAttribute);
  
  this.vertexData = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexData);
  gl.bufferData(gl.ARRAY_BUFFER,
                new Float32Array(vertices),
                gl.STATIC_DRAW);  
}

Cube.prototype.render = function(position) {
  this.program.use();
  
  var m = mat4.create();
  mat4.translate(m, m, position);
  this.gl.uniformMatrix4fv(this.modelMatrix, false, m);

  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexData);
  this.gl.vertexAttribPointer(this.vertAttribute,
                         4, this.gl.FLOAT, false, 0, 0);
  
  this.gl.drawArrays(this.gl.TRIANGLES, 0, 12*3);
};

module.exports = Cube;

