var utils = require('./utils.js');

function Stats(game) {
  this.frames = 0;
  this.game = game;
  this.fpsNode = utils.getTextNode("#fps");
  this.positionNode = utils.getTextNode("#position");
  this.chunkNode = utils.getTextNode("#chunk");
  this.lookAtNode = utils.getTextNode("#lookAt");
  this.pendingChunksNode = utils.getTextNode("#pendingChunks");
  this.chunksRenderedNode = utils.getTextNode("#chunksRendered");
  this.verticesRenderedNode = utils.getTextNode("#verticesRendered");
}

Stats.prototype.frameRendered = function(chunksRendered, verticesRendered, chunk) {
  this.frames++;
  var now = performance.now();
  if (!this.previous) {
    this.previous = now;
  }
  if (now - this.previous > 1000) {
    var fps = Math.round(this.frames / (now - this.previous) * 1000);
    this.fpsNode.nodeValue = "" + fps;
    this.previous = now;
    this.frames = 0;
  }
  
  this.chunkNode.nodeValue = utils.vec2str(chunk);
  this.positionNode.nodeValue = utils.vec2str(this.game.camera.position);
  this.lookAtNode.nodeValue = utils.vec2str(this.game.camera.lookat);
  this.pendingChunksNode.nodeValue = this.game.client.numberOfPendingChunks();
  this.chunksRenderedNode.nodeValue = chunksRendered;
  this.verticesRenderedNode.nodeValue = verticesRendered;
};

module.exports = Stats;
