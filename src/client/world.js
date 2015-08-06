var Chunk = require('./chunk');
var chunks = [];

function getChunk(cx, cy, cz) {
  cx = Math.trunc(cx);
  cy = Math.trunc(cy);
  cz = Math.trunc(cz);
  
  for (var i=0;i<chunks.length;i++) {
    if (chunks[i].cx === cx &&
        chunks[i].cy === cy &&
        chunks[i].cz === cz) {
      return chunks[i];
    }
  }
  return null;
}

function addChunk(c) {
  if (!getChunk(c.cx, c.cy, c.cz)) {
    // FIXME: dont use global variables
    chunks.push(new Chunk(c, window.game.gl, window.game.program));
  } else {
    throw new Error("Already have chunk: " + c.cx + ", " + c.cy + ", " + c.cz);
  }
}

module.exports.chunks = chunks;
module.exports.getChunk = getChunk;
module.exports.addChunk = addChunk;
