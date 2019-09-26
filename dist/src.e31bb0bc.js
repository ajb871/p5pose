// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"sketch.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setSketch = setSketch;
exports.setup = setup;
exports.draw = draw;

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

// import "p5/lib/addons/p5.dom";
var scale = 1;
var width = 640 * scale;
var height = 480 * scale; // setSketch sets this

var p5; //logging data

var label; // setup initializes this

var video;
var osc; //Pose vars

var preveyePos;
var prevPoses = [];

function setSketch(sketch) {
  p5 = sketch;
}

function setup() {
  p5.createCanvas(width * 2, height);
  p5.background(0);
  video = p5.select('video') || p5.createCapture(p5.VIDEO);
  video.size(width, height); // Create a new poseNet method with a single detection

  var poseNet = ml5.poseNet(video, function () {
    return p5.select('#status').hide();
  }); // Every time we get a new pose, draw it

  poseNet.on('pose', drawPoses); // Hide the video element, and just show the canvas

  video.hide(); //field for pose values

  label = p5.createDiv();
  label.position(5, height + 50);
  label.style('font-size', '12pt');
}

function draw() {}

function drawPoses(poses) {
  p5.translate(width * 1.5, 0); // move to far corner

  p5.scale(-1.0, 1.0); // Uses poses number to alter background

  var numPoses = poses.length;
  p5.tint(255, 255 / numPoses);
  p5.image(video, 0, 0, video.width, video.height); //p5.fill(0,10);
  //p5.rect(0,0,width,height);

  readSpeed(poses); //drawKeypoints(poses);
  //drawSkeleton(poses);
  //playAudio(poses);
} //want to eventually detect speed, direction, and distance from camera
//(distance between eyes/shoulders/hips..etc)
//Right now I'm only use Xpos of Left eye on ONE pose to evealuate spped (testing purposes)
//will need to flush out system to work for multiple joints AND multiple poses(arrays baybey)
//Function to read and compare speeds of pose keypoints


function readSpeed(poses) {
  //Debugging to read no. of poses
  console.log(poses.length);

  if (poses.length == 0) {
    //return if no poses
    return;
  } //(Org testing)get vars from pose[0]
  //const pose = poses[0];
  //Added poses.foreach loop in order to use multipose detection


  poses.forEach(function (pose, index) {
    if (prevPoses[index] == undefined) {
      prevPoses[index] = pose; //continue;
    }

    pose.pose.keypoints.forEach(function (keypoint, index2) {
      //Set prev position to evaluate change in position
      var prevKeypoint = prevPoses[index].pose.keypoints[index2]; //Create p5 vectors for evaluating distance And direction

      var preV = p5.createVector(prevKeypoint.position.x, prevKeypoint.position.y);
      var newV = p5.createVector(keypoint.position.x, keypoint.position.y);
      var dist = preV.dist(newV); //Calculate distance moved (total) 
      //let direc = p5.degrees(preV.angleBetween(newV)); //Calculate angle between points
      //let direc = p5.degrees(Math.atan2(preV.y - newV.y, preV.x - newV.x));

      var direc = {
        'x': newV.x - preV.x,
        'y': newV.y - preV.y
      }; //Issues with vectors
      //append these values to Pose/keypoints

      keypoint.dist = dist;
      keypoint.direc = direc; //by appening dif will be pased onto the DrawKeypoints to be easily read with a for loop
    });
    prevPoses[index] = pose; //set current pose to previous
    // Call Draw Keypoints

    drawKeypoints(pose); //would like to replace function with "update Keypoints"
  });
  /* /////////////Old Testing code with just leftEye position////////////
  const eye = pose[1];
  const eyePos = eye.position;
  label.html('LeftEye: ' + JSON.stringify(eyePos));
  if(preveyePos == undefined){ //return if no prev ref
   preveyePos = eyePos;
   return;
  }
  //calculate difference (distance moved)
  let eyedif = Math.abs(preveyePos.x - eyePos.x);
  preveyePos = eyePos;
  */
  ////////////////////////////////////////////////////////////////////////
}

function drawKeypoints(pose) {
  //Pose drawing/graphic function
  pose.pose.keypoints.forEach(function (keypoint, index) {
    //Create vars for radius and color from dif values
    var dist = keypoint.dist;
    var direc = keypoint.direc; //console.log(index + ' : ' + direc);
    //debug for dist

    p5.push();
    p5.translate(keypoint.position.x, keypoint.position.y);
    p5.scale(-1.0, 1.0);
    p5.fill(0);
    p5.textSize(12); //p5.text(p5.nf(direc,0,2),0,0);

    p5.pop(); //debug for direc

    var fill = p5.color(0);
    var r = 5.0 + dist * 2.3; //Size -> Speed direct relationship

    fill = p5.color(10.0 * Math.abs(dist), 0, 5.0 * Math.abs(dist)); //Speed determine fill color

    if (direc.x < 0) {
      fill = p5.color(0, 5.0 * Math.abs(dist), 10.0 * Math.abs(dist)); //Speed determine fill color
    }

    if (keypoint.score > 0.5) {
      p5.fill(fill);
      p5.noStroke();
      p5.ellipse(keypoint.position.x, keypoint.position.y, r, r); //Draw strokes between all other keypoints

      pose.pose.keypoints.forEach(function (keypoint2) {
        if (keypoint2.score > 0.5) {
          //Only "known" keypoints
          p5.stroke(fill); //use same fill for better understanding

          p5.line(keypoint.position.x, keypoint.position.y, keypoint2.position.x, keypoint2.position.y);
        }
      });
    }
  }); // Special Draw Eyes function over top other graphics

  drawEyes(pose); // pose.pose.keypoints.forEach((keypoint) => {
  // })
  /////////////// Old Skeleton Drawing /////////////
  // pose.skeleton.forEach((skeleton) => {
  //       const [p1, p2] = skeleton;
  //       p5.stroke(255, 0, 0);
  //       p5.line(p1.position.x, p1.position.y, p2.position.x, p2.position.y);
  //       // p5.quad(p1.position.x,p1.position.y,p2.position.x,p2.position.y,p2.position.x,p2.position.y+10,p1.position.x,p1.position.y+10);
  // });
}

function drawEyes(pose) {
  // Create array for both eyes
  // Check for eyes (error)
  if (!pose.pose.keypoints[1].position && !pose.pose.keypoints[2].position) {
    return;
  }

  var eyes = [pose.pose.keypoints[1].position, pose.pose.keypoints[2].position];
  var distance = Math.abs(eyes[0].x - eyes[1].x); //calc distance to determine size

  var r = distance / 2;
  var a = Math.atan2(eyes[0].y - eyes[1].y, eyes[0].x - eyes[1].x); //calc rotation angle for head turning
  //Draw eyes w/ push & pop

  eyes.forEach(function (eye) {
    p5.push();
    p5.translate(eye.x, eye.y);
    p5.rotate(a);
    p5.fill(255);
    p5.ellipse(0, 0, r, r / 2); //whole eye

    p5.fill(0);
    p5.ellipse(0, 0, r / 4, r / 4); //pupil

    p5.pop();
  });
} /////////////////////////////OLD CODES/////////////////////////////////////////
// Draw ellipses over the detected keypoints


function drawKeypointsOld(poses) {
  poses.forEach(function (pose) {
    return pose.pose.keypoints.forEach(function (keypoint) {
      if (keypoint.score > 0.5) {
        p5.fill(255); //If difference(speed if aboce a threshold, draw as RED)

        if (keypoint.dist > 15.0) {
          p5.fill(255, 0, 0);
        }

        p5.noStroke();
        p5.ellipse(keypoint.position.x, keypoint.position.y, 5, 5); //Not my favorite way of doing this, but having trouble with

        if (keypoint.part == 'rightEye' || keypoint.part == 'leftEye') {
          p5.fill(255);
          p5.ellipse(keypoint.position.x, keypoint.position.y, 20, 10);
          p5.fill(0);
          p5.ellipse(keypoint.position.x, keypoint.position.y, 5, 5);
        }
      }
    });
  });
} //Other interests: rendering different kinds of bodies / forms (blobs/shapes other than skeleton)


function drawSkeleton(poses) {
  poses.forEach(function (pose) {
    pose.skeleton.forEach(function (skeleton) {
      var _skeleton = _slicedToArray(skeleton, 2),
          p1 = _skeleton[0],
          p2 = _skeleton[1];

      p5.stroke(255, 0, 0);
      p5.line(p1.position.x, p1.position.y, p2.position.x, p2.position.y); //p5.quad(p1.position.x,p1.position.y,p2.position.x,p2.position.y,p2.position.x,p2.position.y+10,p1.position.x,p1.position.y+10);
    });
  });
} // Audio from in-class demos


function playAudio(poses) {
  if (poses.length == 0) {
    return;
  }

  if (!osc) {
    return;
  }

  var pose = poses[0].pose;
  var keypoints = pose.keypoints; //calculate distance between hands(wrists)

  var leftWrist = keypoints[9].position;
  var rightWrist = keypoints[10].position;
  var distance = Math.abs(rightWrist.x - leftWrist.x);
  var avgHeight = (leftWrist.y + rightWrist.y) / 2;
  var scaled = distance / width; //console.info(distance);

  osc.freq(440 * scaled);
}
},{}],"index.js":[function(require,module,exports) {
"use strict";

var sketch = _interopRequireWildcard(require("./sketch"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

// import p5 from 'p5';
// Force page refresh on hot reload
if (module.hot) {
  module.hot.accept(function () {
    return window.location.reload();
  });
}

var s2 = function s2(p5s) {
  sketch.setSketch(p5s);

  p5s.setup = function () {
    return sketch.setup(sketch);
  };

  p5s.draw = function () {
    return sketch.draw(sketch);
  };
};

new p5(s2, 'container');
},{"./sketch":"sketch.js"}],"../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "54252" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else {
        window.location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../node_modules/parcel-bundler/src/builtins/hmr-runtime.js","index.js"], null)
//# sourceMappingURL=/src.e31bb0bc.js.map