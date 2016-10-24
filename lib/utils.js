'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getPostcss = exports.toES5Config = exports.toConfig = undefined;

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _compose = require('lodash/fp/compose');

var _compose2 = _interopRequireDefault(_compose);

var _cond = require('lodash/fp/cond');

var _cond2 = _interopRequireDefault(_cond);

var _postcss = require('postcss');

var _postcss2 = _interopRequireDefault(_postcss);

var _postcssCssnext = require('postcss-cssnext');

var _postcssCssnext2 = _interopRequireDefault(_postcssCssnext);

var _postcssImport = require('postcss-import');

var _postcssImport2 = _interopRequireDefault(_postcssImport);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var isDev = function isDev() {
  return process.env.NODE_ENV === 'development';
};
var isProd = function isProd() {
  return !isDev();
};

var toProdExport = function toProdExport(code) {
  return 'export default ' + code;
};
var toDevExport = function toDevExport(code) {
  return 'let config = ' + code + ';\nif (typeof Proxy !== \'undefined\') {\n    config = new Proxy(config, {\n        get(target, key) {\n            if (key !== \'__esModule\' && !target[key]) {\n                console.error(`No variable found, check variable key: ["${key.toString()}"]`);\n            }\n    \n            return target[key];\n        },\n        \n        set(target, key) {\n            throw new Error(\'Config variables are immutable \' + key);\n        }\n    });\n}\nexport default config';
};
var toES5Export = function toES5Export(code) {
  return 'module.exports = ' + code;
};

var toExport = (0, _cond2.default)([[isDev, toDevExport], [isProd, toProdExport]]);

var toString = function toString(data) {
  return '' + (0, _stringify2.default)(data, null, '\t');
};

var objectify = function objectify(root, filepath) {
  var result = {};

  if (!root) {
    return result;
  }

  root.walkDecls(function (rule) {
    if (rule.source.input.file !== filepath) {
      return;
    }
    if (rule.parent && rule.parent.selectors.find(function (sel) {
      return sel === ':root';
    })) {
      var v = rule.value; // replace "--"

      result[rule.prop.replace(/^-+/, '')] = v.endsWith('px') ? parseInt(v, 10) : v;
    }
  });
  return result;
};

var toConfig = exports.toConfig = (0, _compose2.default)(toExport, toString, objectify);
var toES5Config = exports.toES5Config = (0, _compose2.default)(toES5Export, toString, objectify);
var getPostcss = exports.getPostcss = function getPostcss(async) {
  return (0, _postcss2.default)().use((0, _postcssImport2.default)({ async: async })).use((0, _postcssCssnext2.default)({ features: { customProperties: { preserve: 'computed' } } }));
};