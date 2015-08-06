var utils = require('./utils');

var maxLines = 10;
var logNode;
var lines = [];

function update() {
  var s = "";
  for (var i=0;i<lines.length;i++) {
    var l = lines[i];
    if (l === null) {
      l = " ";
    }
    if (s.length > 0) {
      s = s + "\n";
    }
    s = s + l;
  }

  logNode.nodeValue = s;
}

function init() {
    logNode = utils.getTextNode(".log");
    lines = [];
    for (var i=0;i<maxLines;i++) {
      lines.push(null);
    }
}

module.exports.write = function(line) {
  if (!logNode) {
    init();
  }

  if (line.length > 35) {
    line = line.substring(0, 32) + "...";
  }
  var i;
  for (i=0;i<lines.length;i++) {
    if (lines[i] === null) {
      lines[i] = line;
      break;
    }
  }
  if (i === lines.length) {
    lines.shift();
    lines.push(line);
  }

  update();
};
