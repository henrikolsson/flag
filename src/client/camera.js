var vec3 = require('gl-matrix').vec3;
var mat4 = require('gl-matrix').mat4;

var movespeed = vec3.fromValues(0.003, 0.003, 0.003);
var mousespeed = 0.003;

var Camera = function () {
  this.angle = vec3.fromValues(-2, 0, 0);
  this.camera = vec3.fromValues(0,0,1);
  this.forward = vec3.fromValues(0, 0, 0);
  this.lookat = vec3.fromValues(0, 0, 0);
  this.right = vec3.fromValues(0, 0, 0);
  this.up = vec3.fromValues(0.0, 1.0, 0.0);
  //this.position = vec3.fromValues(5,25,2);
  this.position = vec3.fromValues(2,0,2);
  this.updateVectors();
};

Camera.prototype.goLeft = function(distance) {
  var dir = vec3.fromValues(0,0,0);
  vec3.negate(dir, this.right);
  vec3.multiply(dir, dir, movespeed);
  vec3.multiply(dir, dir, vec3.fromValues(distance, distance, distance));
  vec3.add(this.position, this.position, dir);
};

Camera.prototype.goRight = function(distance) {
  var dir = vec3.fromValues(0,0,0);
  vec3.multiply(dir, this.right, movespeed);
  vec3.multiply(dir, dir, vec3.fromValues(distance, distance, distance));
  vec3.add(this.position, this.position, dir);
};

Camera.prototype.goUp = function(distance) {
  var dir = vec3.fromValues(0,0,0);
  dir = vec3.fromValues(0, movespeed[0], 0);
  vec3.multiply(dir, dir, vec3.fromValues(distance, distance, distance));
  vec3.add(this.position, this.position, dir);
};

Camera.prototype.goDown = function(distance) {
  var dir = vec3.fromValues(0,0,0);
  dir = vec3.fromValues(0, movespeed[0], 0);
  vec3.negate(dir, dir);
  vec3.multiply(dir, dir, vec3.fromValues(distance, distance, distance));
  vec3.add(this.position, this.position, dir);
};

Camera.prototype.goForward = function(distance) {
  var dir = vec3.fromValues(0,0,0);
  vec3.multiply(dir, this.forward, movespeed);
  vec3.multiply(dir, dir, vec3.fromValues(distance, distance, distance));
  vec3.add(this.position, this.position, dir);
};

Camera.prototype.goBack = function(distance) {
  var dir = vec3.fromValues(0,0,0);
  vec3.negate(dir, this.forward);
  vec3.multiply(dir, dir, movespeed);
  vec3.multiply(dir, dir, vec3.fromValues(distance, distance, distance));
  vec3.add(this.position, this.position, dir);
};

Camera.prototype.look = function(x, y) {
  var angleX = this.angle[0];
  var angleY = this.angle[1];
  var angleZ = this.angle[2];
  angleX -= x * mousespeed;
  angleY -= y * mousespeed;

  if (angleX < -Math.PI)
    angleX += Math.PI * 2;
  if (angleX > Math.PI)
    angleX -= Math.PI * 2;
  if (angleY < -Math.PI / 2)
    angleY = -Math.PI / 2;
  if (angleY > Math.PI / 2)
    angleY = Math.PI / 2;

  vec3.set(this.angle,
           angleX,
           angleY,
           angleZ);

  this.updateVectors();
};

Camera.prototype.updateVectors = function() {
  vec3.set(this.forward,
           Math.sin(this.angle[0]),
           0,
           Math.cos(this.angle[0]));

  vec3.set(this.right,
           -Math.cos(this.angle[0]),
           0,
           Math.sin(this.angle[0]));

  vec3.set(this.lookat,
           Math.sin(this.angle[0]) * Math.cos(this.angle[1]),
           Math.sin(this.angle[1]),
           Math.cos(this.angle[0]) * Math.cos(this.angle[1]));

  vec3.cross(this.up, this.right, this.lookat);
};

Camera.prototype.getLookAt = function() {
  var center = vec3.create();
  vec3.add(center, this.position, this.lookat);
  var m = mat4.create();
  mat4.lookAt(m,
              this.position,
              center,
              vec3.fromValues(0.0, 1.0, 0.0));
  return m;
};

module.exports = Camera;
