var vec3 = require('gl-matrix').vec3;
var mat4 = require('gl-matrix').mat4;
var config = require('../common/config');

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
  if (isNaN(result)) {
    //alert("NOPE");
  }
  return result === 0 || isNaN(result);
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
  this.verticesBuffer = new ArrayBuffer(4 * config.CHUNK_SIZE_X * config.CHUNK_SIZE_Y * config.CHUNK_SIZE_Z * 6 * 6);
  this.vertices = new Int32Array(this.verticesBuffer);
  this.verticesBytes = new Int8Array(this.verticesBuffer);

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
          this.vertices[i++] = v0v;
          this.vertices[i++] = v1v;
          this.vertices[i++] = v3v;

          this.vertices[i++] = v0v;
          this.vertices[i++] = v3v;
          this.vertices[i++] = v2v;
        }
        
        if ((isAir(data,x,y,z+1) || (isTransparent(data,x,y,z+1) && !isTransparent(data,x,y,z))))
        {
          // back
          this.vertices[i++] = v5v;
          this.vertices[i++] = v4v;
          this.vertices[i++] = v6v;
          

          this.vertices[i++] = v5v;
          this.vertices[i++] = v6v;
          this.vertices[i++] = v7v;
          
        }
        
        if ((isAir(data,x,y-1,z) || (isTransparent(data,x,y-1,z) && !isTransparent(data,x,y,z))))
        {
          //bottom
          this.vertices[i++] = (block << 24) | ((z+1) << 16) | ((y+0) << 8) | (x+0);
          this.vertices[i++] = (block << 24) | ((z+1) << 16) | ((y+0) << 8) | (x+1);
          this.vertices[i++] = (block << 24) | ((z+0) << 16) | ((y+0) << 8) | (x+1);
          
          this.vertices[i++] = (block << 24) | ((z+1) << 16) | ((y+0) << 8) | (x+0);
          this.vertices[i++] = (block << 24) | ((z+0) << 16) | ((y+0) << 8) | (x+1);
          this.vertices[i++] = (block << 24) | ((z+0) << 16) | ((y+0) << 8) | (x+0);
        }
        
        if ((isAir(data,x,y+1,z)))
        {
          //top
          this.vertices[i++] = (block << 24) | ((z+0) << 16) | ((y+1) << 8) | (x+0);
          this.vertices[i++] = (block << 24) | ((z+0) << 16) | ((y+1) << 8) | (x+1);
          this.vertices[i++] = (block << 24) | ((z+1) << 16) | ((y+1) << 8) | (x+1);

          this.vertices[i++] = (block << 24) | ((z+0) << 16) | ((y+1) << 8) | (x+0);
          this.vertices[i++] = (block << 24) | ((z+1) << 16) | ((y+1) << 8) | (x+1);
          this.vertices[i++] = (block << 24) | ((z+1) << 16) | ((y+1) << 8) | (x+0);        
        }

        if ((isAir(data,x-1,y,z)))
        {
          // side left
          this.vertices[i++] = v4v;
          this.vertices[i++] = v0v;
          this.vertices[i++] = v2v;

          this.vertices[i++] = v4v;
          this.vertices[i++] = v2v;
          this.vertices[i++] = v6v;
        }
        
        if ((isAir(data,x+1,y,z)))
        {
          // side right
          this.vertices[i++] = v1v;
          this.vertices[i++] = v5v;
          this.vertices[i++] = v7v;

          this.vertices[i++] = v1v;
          this.vertices[i++] = v7v;
          this.vertices[i++] = v3v;
        }
      }
    }
  }
  console.log("chunk elements: " + i);
  if (i === 0) {
    return;
  }
  this.elements = i;
  
  program.use();  

  this.vertAttribute = program.getAttribLocation("vert");
  this.modelMatrix = program.getUniformLocation("model");
  
  this.buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
  gl.bufferData(gl.ARRAY_BUFFER, this.verticesBytes, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(this.vertAttribute);
  gl.vertexAttribPointer(this.vertAttribute, 4, gl.BYTE, false, 0, 0);
  var duration = performance.now() - start;
  console.log("time: " + duration);
}

Chunk.prototype.render = function() {
  if (!this.buffer) {
    return;
  }
  var m = mat4.create();
  mat4.translate(m, m, vec3.fromValues(this.cx * config.CHUNK_SIZE_X,
                                       this.cy * config.CHUNK_SIZE_Y,
                                       this.cz * config.CHUNK_SIZE_Z));
  this.gl.uniformMatrix4fv(this.modelMatrix, false, m);
  
  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
  this.gl.vertexAttribPointer(this.vertAttribute, 4, this.gl.BYTE, false, 0, 0);
  
  this.gl.drawArrays(this.gl.TRIANGLES, 0, this.elements);
};

module.exports = Chunk;
