"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = PostcssVariablesLoader;

var _loaderUtils = _interopRequireDefault(require("loader-utils"));

var utils = _interopRequireWildcard(require("./utils"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function PostcssVariablesLoader(source) {
  if (this.cacheable) {
    this.cacheable();
  }

  var options = _loaderUtils.default.getOptions(this) || {};

  var _done = this.async();

  var transformToConfig = options.es5 ? utils.toES5Config : utils.toConfig;

  var end = (err, result, path, map) => {
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

  var emitWarnings = result => {
    result.warnings().forEach(msg => this.emitWarning(new Error(msg.toString())));
    return result;
  };

  var onError = error => {
    if (error.name === 'CssSyntaxError') {
      this.emitError(error.message + error.showSourceCode());
      end();
    } else {
      end(error);
    }
  };

  utils.getPostcss(true).process(source, {
    from: this.resourcePath
  }).then(result => end(null, result, this.resourcePath, result.map)).catch(onError);
}