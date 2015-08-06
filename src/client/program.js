var utils = require('./utils');

var Program = function(gl) {
  this.shadersLoading = [];
  this.shaders = [];
  this.gl = gl;
  this.program = gl.createProgram();
};

Program.prototype.addShader = function(name, type) {
  this.shadersLoading.push(utils.loadShader(this.gl, name, type));
};

Program.prototype.use = function() {
  this.gl.useProgram(this.program);
};

Program.prototype.link = function() {
  var self = this;
  var gl = self.gl;
  return new Promise(function(resolve, reject) {
    Promise.all(self.shadersLoading)
      .then(function(shaders) {
        self.shaders = shaders;
        self.shaders.forEach(function(s) {
          gl.attachShader(self.program, s.shader);
        });
        gl.linkProgram(self.program);
        if (!gl.getProgramParameter(self.program, gl.LINK_STATUS)) {
          reject("Failed to link program: " + gl.getProgramInfoLog(self.program));
        } else {
          resolve();
        }
      })
      .catch(function(err) {
        reject(err);
      });
  });
};

Program.prototype.getAttribLocation = function(name) {
  return this.gl.getAttribLocation(this.program, name);
};

Program.prototype.getUniformLocation = function(name) {
  return this.gl.getUniformLocation(this.program, name);
};

module.exports = Program;
