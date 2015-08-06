var utils = require('./utils');
var logNode;

module.exports.write = function(line) {
  if (!logNode) {
    logNode = utils.getTextNode(".log");
  }
  if (logNode.nodeValue.length > 0) {
    logNode.nodeValue = logNode.nodeValue + "\n";
  }
  logNode.nodeValue = logNode.nodeValue + line;
  logNode.parentElement.scrollTop = logNode.parentElement.scrollHeight;
};
