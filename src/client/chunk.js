var vec3 = require('gl-matrix').vec3;
var mat4 = require('gl-matrix').mat4;
var config = require('../common/config');

var numBuffers = 10;
var buffers = [];
console.log("hiya");

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
  console.log("warning - no free buffer");
  return new ArrayBuffer(4 * config.CHUNK_SIZE_X * config.CHUNK_SIZE_Y * config.CHUNK_SIZE_Z * 6 * 6);
}

function returnBuffer(b) {
  buffers[b.index].used = false;
}

function getBlock(chunk, x, y, z) {
  if (x >= config.CHUNK_SIZE_X ||
      y >= config.CHUNK_SIZE_Y ||
      z >= config.CHUNK_SIZE_Z ||
      x < 0 ||
      y < 0 ||
      z < 0) {
    return 0;
  }
  
  var idx = ((x) + ((y)*config.CHUNK_SIZE_X) + ((z)*config.CHUNK_SIZE_Y*config.CHUNK_SIZE_X));
  if (idx < 0 || idx >= chunk.length)
    return 0;
  else
    return chunk[idx];
}

function isAir(data,x,y,z) {
  var result = getBlock(data,x,y,z);
  return result === 0;
}

function isTransparent(data,x,y,z) {
  return isAir(data,x,y,z);
}

function Chunk(c, gl, program) {
  var start = performance.now();
  this.gl = gl;
  this.program = program;
  this.cx = c.cx;
  this.cy = c.cy;
  this.cz = c.cz;
  this.data = new Int8Array(c.data);
  if (this.data.length === 0) {
    return;
  }

  var bufferObj = getBuffer();
  var verticesBuffer = bufferObj.buffer;
  var vertices = new Int32Array(verticesBuffer);
  var verticesBytes = new Int8Array(verticesBuffer);

  var i = 0;
  var data = this.data;
  for (var x=0;x<config.CHUNK_SIZE_X;x++) {
    for (var y=0;y<config.CHUNK_SIZE_Y;y++) {
      for (var z=0;z<config.CHUNK_SIZE_Z;z++) {
        var block = getBlock(data, x, y, z);
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

        if ((isAir(data,x,y,z-1) || (isTransparent(data,x,y,z-1) && !isTransparent(data,x,y,z))))
        {
          // front
          vertices[i++] = v0v;
          vertices[i++] = v1v;
          vertices[i++] = v3v;

          vertices[i++] = v0v;
          vertices[i++] = v3v;
          vertices[i++] = v2v;
        }
        
        if ((isAir(data,x,y,z+1) || (isTransparent(data,x,y,z+1) && !isTransparent(data,x,y,z))))
        {
          // back
          vertices[i++] = v5v;
          vertices[i++] = v4v;
          vertices[i++] = v6v;
          

          vertices[i++] = v5v;
          vertices[i++] = v6v;
          vertices[i++] = v7v;
          
        }
        
        if ((isAir(data,x,y-1,z) || (isTransparent(data,x,y-1,z) && !isTransparent(data,x,y,z))))
        {
          //bottom
          vertices[i++] = (block << 24) | ((z+1) << 16) | ((y+0) << 8) | (x+0);
          vertices[i++] = (block << 24) | ((z+1) << 16) | ((y+0) << 8) | (x+1);
          vertices[i++] = (block << 24) | ((z+0) << 16) | ((y+0) << 8) | (x+1);
          
          vertices[i++] = (block << 24) | ((z+1) << 16) | ((y+0) << 8) | (x+0);
          vertices[i++] = (block << 24) | ((z+0) << 16) | ((y+0) << 8) | (x+1);
          vertices[i++] = (block << 24) | ((z+0) << 16) | ((y+0) << 8) | (x+0);
        }
        
        if ((isAir(data,x,y+1,z)))
        {
          //top
          vertices[i++] = (block << 24) | ((z+0) << 16) | ((y+1) << 8) | (x+0);
          vertices[i++] = (block << 24) | ((z+0) << 16) | ((y+1) << 8) | (x+1);
          vertices[i++] = (block << 24) | ((z+1) << 16) | ((y+1) << 8) | (x+1);

          vertices[i++] = (block << 24) | ((z+0) << 16) | ((y+1) << 8) | (x+0);
          vertices[i++] = (block << 24) | ((z+1) << 16) | ((y+1) << 8) | (x+1);
          vertices[i++] = (block << 24) | ((z+1) << 16) | ((y+1) << 8) | (x+0);        
        }

        if ((isAir(data,x-1,y,z)))
        {
          // side left
          vertices[i++] = v4v;
          vertices[i++] = v0v;
          vertices[i++] = v2v;

          vertices[i++] = v4v;
          vertices[i++] = v2v;
          vertices[i++] = v6v;
        }
        
        if ((isAir(data,x+1,y,z)))
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
    this.elements = i;
  
    program.use();  
    
    this.vertAttribute = program.getAttribLocation("vert");
    this.modelMatrix = program.getUniformLocation("model");
    
    this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, verticesBytes, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(this.vertAttribute);
    gl.vertexAttribPointer(this.vertAttribute, 4, gl.BYTE, false, 0, 0);
  }
  var uploadTime = performance.now() - start;
  if (uploadTime + meshTime > 8) {
    console.log("mesh: " + meshTime + " upload: " + uploadTime);
  }
}

Chunk.prototype.render = function() {
  if (!this.buffer) {
    return false;
  }
  var m = mat4.create();
  mat4.translate(m, m, vec3.fromValues(this.cx * config.CHUNK_SIZE_X,
                                       this.cy * config.CHUNK_SIZE_Y,
                                       this.cz * config.CHUNK_SIZE_Z));
  this.gl.uniformMatrix4fv(this.modelMatrix, false, m);
  
  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
  this.gl.vertexAttribPointer(this.vertAttribute, 4, this.gl.BYTE, false, 0, 0);
  
  this.gl.drawArrays(this.gl.TRIANGLES, 0, this.elements);
  return true;
};

module.exports = Chunk;
