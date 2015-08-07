var config = require('../common/config');
var Chunk = require('./chunk');
var chunks = {};

function key(cx, cy, cz) {
  return cx+","+cy+","+cz;
}

function getChunk(cx, cy, cz) {
  cx = Math.trunc(cx);
  cy = Math.trunc(cy);
  cz = Math.trunc(cz);

  return chunks[key(cx,cy,cz)];
}

function addChunk(c) {
  if (!getChunk(c.cx, c.cy, c.cz)) {
    // FIXME: dont use global variables
    chunks[key(c.cx, c.cy, c.cz)] = new Chunk(c, window.game.gl, window.game.program);
  } else {
    throw new Error("Already have chunk: " + c.cx + ", " + c.cy + ", " + c.cz);
  }
}

function getBlock(wx, wy, wz) {
  var chunk = getChunk(Math.floor(wx / 16.0),
                       Math.floor(wy / 16.0),
                       Math.floor(wz / 16.0));
  if (chunk) {
    // TODO: these are not c* coordinates
    var cx = Math.abs(wx) % config.CHUNK_SIZE_X;
    var cy = Math.abs(wy) % config.CHUNK_SIZE_Y;
    var cz = Math.abs(wz) % config.CHUNK_SIZE_Z;
    if (wx < 0 && cx !== 0) {
      cx = config.CHUNK_SIZE_X - cx;
    }
    if (wy < 0 && cy !== 0) {
      cy = config.CHUNK_SIZE_Y - cy;
    }
    if (wz < 0 && cz !== 0) {
      cz = config.CHUNK_SIZE_Z - cz;
    }
    return chunk.getBlock(cx, cy, cz);
  }
  return 0;
}

module.exports.chunks = chunks;
module.exports.getChunk = getChunk;
module.exports.addChunk = addChunk;
module.exports.getBlock = getBlock;
