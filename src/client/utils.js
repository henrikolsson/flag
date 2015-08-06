var request = require('superagent');

exports.fatal = function(err) {
  alert(err);
  if (err instanceof Error) {
    throw err;
  } else {
    throw new Error(err);
  }
};

exports.loadShader = function(gl, name, type) {
  return new Promise(function(resolve, reject) {
    request.get("/shaders/" + name).end(function(err, res) {
      if (err) {
        reject(err);
        return;
      }
      var shader =  gl.createShader(type);
      if (!shader) {
        reject("Failed to create shader: " + type);
        return;
      }
      gl.shaderSource(shader, res.text);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        reject("Failed to compile shader '" + name + "': " + gl.getShaderInfoLog(shader));
        return;
      }
      resolve({"name": name,
               "type": type,
               "shader": shader});
    });
  });
};

exports.getTextNode = function(selector) {
  var container = document.querySelector(selector);
  var child = document.createTextNode("");
  container.appendChild(child);
  return child;
};

exports.vec2str = function(v) {
  var s = '[';
  for (var i=0;i<v.length;i++) {
    if (s.length > 1) {
      s = s + ", ";
    }
    s = s + v[i].toFixed(2);
  }
  s = s + "]";
  return s;
};
