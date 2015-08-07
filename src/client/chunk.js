var vec3 = require('gl-matrix').vec3;
var mat4 = require('gl-matrix').mat4;
var config = require('../common/config');
var world = require('./world');

var numBuffers = 10;
var buffers = [];

for (var i=0;i<numBuffers;i++) {
  buffers.push({"buffer": new ArrayBuffer(4 * config.CHUNK_SIZE_X * config.CHUNK_SIZE_Y * config.CHUNK_SIZE_Z * 6 * 6),
                "used": false,
                "index": i});
}


function getBuffer() {
  for (var i=0;i<numBuffers;i++) {
    if (!buffers[i].used) {
      buffers[i].used = true;
      return buffers[i];
    }
  }
  throw new Error("No free buffer");
}

function returnBuffer(b) {
  buffers[b.index].used = false;
}

function Chunk(c, gl, program) {
  this.gl = gl;
  this.program = program;
  this.cx = c.cx;
  this.cy = c.cy;
  this.cz = c.cz;
  this.data = new Int8Array(c.data);
  if (this.data.length === 0) {
    return;
  }

  var self = this;
  // Delaying this means we might have more adjacent chunks
  setTimeout(function() {
    var start = performance.now();
    var bufferObj = getBuffer();
    var verticesBuffer = bufferObj.buffer;
    var vertices = new Int32Array(verticesBuffer);
    var verticesBytes = new Int8Array(verticesBuffer);

    var i = 0;
    var data = self.data;
    for (var x=0;x<config.CHUNK_SIZE_X;x++) {
      for (var y=0;y<config.CHUNK_SIZE_Y;y++) {
        for (var z=0;z<config.CHUNK_SIZE_Z;z++) {
          var block = self.getBlock(x, y, z);
          if (block === 0) {
            continue;
          }
          block = Math.trunc(Math.random() * 5);
          
          // front
          var v0v = (block << 24) | (z << 16) | (y << 8) | x;
          var v1v = (block << 24) | (z << 16) | (y << 8) | (x+1);
          var v2v = (block << 24) | (z << 16) | ((y+1) << 8) | x;
          var v3v = (block << 24) | (z << 16) | ((y+1) << 8) | (x+1);

          // back
          var v4v = (block << 24) | ((z+1) << 16) | (y << 8) | x;
          var v5v = (block << 24) | ((z+1) << 16) | (y << 8) | (x+1);
          var v6v = (block << 24) | ((z+1) << 16) | ((y+1) << 8) | x;
          var v7v = (block << 24) | ((z+1) << 16) | ((y+1) << 8) | (x+1);

          if ((self.isAir(x,y,z-1) || (self.isTransparent(x,y,z-1) && !self.isTransparent(x,y,z))))
          {
            // front
            vertices[i++] = v0v;
            vertices[i++] = v1v;
            vertices[i++] = v3v;

            vertices[i++] = v0v;
            vertices[i++] = v3v;
            vertices[i++] = v2v;
          }
          
          if ((self.isAir(x,y,z+1) || (self.isTransparent(x,y,z+1) && !self.isTransparent(x,y,z))))
          {
            // back
            vertices[i++] = v5v;
            vertices[i++] = v4v;
            vertices[i++] = v6v;
            

            vertices[i++] = v5v;
            vertices[i++] = v6v;
            vertices[i++] = v7v;
            
          }

          // TODO: Until we actually have blocks that are not ground but in the air, we won't need this
          // if ((self.isAir(x,y-1,z) || (self.isTransparent(x,y-1,z) && !self.isTransparent(x,y,z))))
          // {
          //   //bottom
          //   vertices[i++] = (block << 24) | ((z+1) << 16) | ((y+0) << 8) | (x+0);
          //   vertices[i++] = (block << 24) | ((z+1) << 16) | ((y+0) << 8) | (x+1);
          //   vertices[i++] = (block << 24) | ((z+0) << 16) | ((y+0) << 8) | (x+1);
            
          //   vertices[i++] = (block << 24) | ((z+1) << 16) | ((y+0) << 8) | (x+0);
          //   vertices[i++] = (block << 24) | ((z+0) << 16) | ((y+0) << 8) | (x+1);
          //   vertices[i++] = (block << 24) | ((z+0) << 16) | ((y+0) << 8) | (x+0);
          // }
          
          if ((self.isAir(x,y+1,z)))
          {
            //top
            vertices[i++] = (block << 24) | ((z+0) << 16) | ((y+1) << 8) | (x+0);
            vertices[i++] = (block << 24) | ((z+0) << 16) | ((y+1) << 8) | (x+1);
            vertices[i++] = (block << 24) | ((z+1) << 16) | ((y+1) << 8) | (x+1);

            vertices[i++] = (block << 24) | ((z+0) << 16) | ((y+1) << 8) | (x+0);
            vertices[i++] = (block << 24) | ((z+1) << 16) | ((y+1) << 8) | (x+1);
            vertices[i++] = (block << 24) | ((z+1) << 16) | ((y+1) << 8) | (x+0);        
          }

          if ((self.isAir(x-1,y,z)))
          {
            // side left
            vertices[i++] = v4v;
            vertices[i++] = v0v;
            vertices[i++] = v2v;

            vertices[i++] = v4v;
            vertices[i++] = v2v;
            vertices[i++] = v6v;
          }
          
          if ((self.isAir(x+1,y,z)))
          {
            // side right
            vertices[i++] = v1v;
            vertices[i++] = v5v;
            vertices[i++] = v7v;

            vertices[i++] = v1v;
            vertices[i++] = v7v;
            vertices[i++] = v3v;
          }
        }
      }
    }
    returnBuffer(bufferObj);
    var meshTime = performance.now() - start;
    start = performance.now();
    if (i > 0) {
      self.elements = i;
      
      program.use();  
      
      self.vertAttribute = program.getAttribLocation("vert");
      self.modelMatrix = program.getUniformLocation("model");
      
      self.buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, self.buffer);
      gl.bufferData(gl.ARRAY_BUFFER, verticesBytes, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(self.vertAttribute);
      gl.vertexAttribPointer(self.vertAttribute, 4, gl.BYTE, false, 0, 0);
    }
    var uploadTime = performance.now() - start;
    if (uploadTime + meshTime > 8) {
      console.log("mesh: " + meshTime + " upload: " + uploadTime);
    }
  }, 150);
}

Chunk.prototype.render = function() {
  if (!this.buffer) {
    return 0;
  }
  var m = mat4.create();
  mat4.translate(m, m, vec3.fromValues(this.cx * config.CHUNK_SIZE_X,
                                       this.cy * config.CHUNK_SIZE_Y,
                                       this.cz * config.CHUNK_SIZE_Z));
  this.gl.uniformMatrix4fv(this.modelMatrix, false, m);
  
  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
  this.gl.vertexAttribPointer(this.vertAttribute, 4, this.gl.BYTE, false, 0, 0);
  
  this.gl.drawArrays(this.gl.TRIANGLES, 0, this.elements);
  return this.elements;
};

Chunk.prototype.getBlock = function(x, y, z, w, stack) {
  if (x < config.CHUNK_SIZE_X &&
      y < config.CHUNK_SIZE_Y &&
      z < config.CHUNK_SIZE_Z &&
      x >= 0 &&
      y >= 0 &&
      z >= 0) {
    var idx = ((x) + ((y)*config.CHUNK_SIZE_X) + ((z)*config.CHUNK_SIZE_Y*config.CHUNK_SIZE_X));
    if (idx < 0 || idx > this.data.length) {
      return 0;
    } else {
      return this.data[idx];
    }
  } else {
    var wx = this.cx * config.CHUNK_SIZE_X + x;
    var wy = this.cy * config.CHUNK_SIZE_Y + y;
    var wz = this.cz * config.CHUNK_SIZE_Z + z;
    return world.getBlock(wx, wy, wz);
  }
};

Chunk.prototype.isAir = function(x,y,z) {
  var result = this.getBlock(x,y,z);
  return result === 0;
};

Chunk.prototype.isTransparent = function(x,y,z) {
  return this.isAir(x,y,z);
};

module.exports = Chunk;
