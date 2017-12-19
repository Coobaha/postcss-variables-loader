'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (source) {
  var _this = this;

  if (this.cacheable) {
    this.cacheable();
  }

  var options = _loaderUtils2.default.parseQuery(this.query);
  var _done = this.async();

  var transformToConfig = options.es5 ? utils.toES5Config : utils.toConfig;

  var end = function end(err, result, path, map) {
    if (err) {
      _done(err);
    }

    if (!result) {
      return _done(null, {}, map);
    }

    var obj = transformToConfig(result, path);
    emitWarnings(result);
    return _done(null, obj, map);
  };

  var emitWarnings = function emitWarnings(result) {
    result.warnings().forEach(function (msg) {
      return _this.emitWarning(new Error(msg.toString()));
    });
    return result;
  };

  var onError = function onError(error) {
    if (error.name === 'CssSyntaxError') {
      _this.emitError(error.message + error.showSourceCode());
      end();
    } else {
      end(error);
    }
  };

  utils.getPostcss(true).process(source, { from: this.resourcePath }).then(function (result) {
    return end(null, result, _this.resourcePath, result.map);
  }).catch(onError);
};

var _loaderUtils = require('loader-utils');

var _loaderUtils2 = _interopRequireDefault(_loaderUtils);

var _utils = require('./utils');

var utils = _interopRequireWildcard(_utils);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = exports['default'];