'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getPostcss = exports.objectify = exports.toES5Config = exports.toConfig = undefined;

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _postcssJs = require('postcss-js');

var _postcssJs2 = _interopRequireDefault(_postcssJs);

var _compose = require('lodash/fp/compose');

var _compose2 = _interopRequireDefault(_compose);

var _get = require('lodash/fp/get');

var _get2 = _interopRequireDefault(_get);

var _cond = require('lodash/fp/cond');

var _cond2 = _interopRequireDefault(_cond);

var _lowerFirst = require('lodash/lowerFirst');

var _lowerFirst2 = _interopRequireDefault(_lowerFirst);

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

var transform = function transform(data) {
  if (!data) {
    return {};
  }
  return (0, _keys2.default)(data).reduce(function (acc, k) {
    var v = data[k];

    k = k.replace(/^-+/, ''); // strips '-'
    k = (0, _lowerFirst2.default)(k);
    acc[k] = v.endsWith('px') ? parseInt(v, 10) : v;
    return acc;
  }, {});
};

var toProdExport = function toProdExport(code) {
  return 'export default ' + code;
};
var toDevExport = function toDevExport(code) {
  return 'let config = ' + code + ';\nif (typeof global.Proxy !== \'undefined\') {\n    config = new Proxy(config, {\n        get(target, key) {\n            if (key !== \'__esModule\' && !target[key]) {\n                console.error(`No variable found, check variable key: ["${key.toString()}"]`);\n            }\n    \n            return target[key];\n        },\n        \n        set(target, key) {\n            throw new Error(\'Config variables are immutable \' + key);\n        }\n    });\n}\nexport default config';
};
var toES5Export = function toES5Export(code) {
  return 'module.exports = ' + code;
};

var toExport = (0, _cond2.default)([[isDev, toDevExport], [isProd, toProdExport]]);

var toString = function toString(data) {
  return '' + (0, _stringify2.default)(data, null, '\t');
};
var toData = (0, _compose2.default)(transform, (0, _get2.default)(':root'));

var toConfig = exports.toConfig = (0, _compose2.default)(toExport, toString, toData);
var toES5Config = exports.toES5Config = (0, _compose2.default)(toES5Export, toString, toData);

var objectify = exports.objectify = function objectify(root, filepath) {
  // removes imported rules, so we have only computed output
  root.walkRules(function (r) {
    if (r.source.input.file !== filepath) {
      r.remove();
    }
  });
  return _postcssJs2.default.objectify(root);
};

var getPostcss = exports.getPostcss = function getPostcss(async) {
  return (0, _postcss2.default)().use((0, _postcssImport2.default)({ async: async })).use((0, _postcssCssnext2.default)({ features: { customProperties: { preserve: 'computed' } } }));
};