'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = sync;

var _utils = require('./utils');

var utils = _interopRequireWildcard(_utils);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function sync(source, filepath) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var transformToConfig = options.es5 ? utils.toES5Config : utils.toConfig;
  var root = utils.getPostcss(false).process(source, { from: filepath }).root;

  return transformToConfig(root, filepath);
}
module.exports = exports['default'];