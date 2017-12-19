'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getPostcss = exports.toES5Config = exports.toConfig = undefined;

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

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

var dashesCamelCase = function dashesCamelCase(str) {
  return str.replace(/-+(\w)/g, function (match, firstLetter) {
    return firstLetter.toUpperCase();
  });
};

var EXTENSION_RE = /\(\s*--([\w-]+)\s*\)/g;

var resolveCustomMediaValue = function resolveCustomMediaValue(query, depChain, map) {
  if (!EXTENSION_RE.test(query.value)) {
    return query.value;
  }
  var val = query.value.replace(EXTENSION_RE, function (orig, name) {
    name = dashesCamelCase(name.replace(/^-+/, ''));
    if (!map[name]) {
      return orig;
    }
    var mq = map[name];
    if (mq.resolved) {
      return mq.value;
    }

    if (depChain.indexOf(name) !== -1) {
      mq.circular = true;
      return orig;
    }
    depChain.push(name);
    mq.value = resolveCustomMediaValue(mq, depChain, map);

    return mq.value;
  });
  if (val === query.value) {
    query.circular = true;
  }
  return val;
};

var objectify = function objectify(result, filepath) {
  var obj = {};
  var root = result.root;

  var customMediaMap = {};
  if (!root) {
    return obj;
  }

  root.walk(function (rule) {
    if (rule.source.input.file !== filepath) {
      return;
    }
    if (rule.type === 'atrule' && rule.name === 'custom-media') {
      var params = rule.params.split(' ');
      var originalKey = params.shift();
      var key = dashesCamelCase(originalKey.replace(/^-+/, ''));
      if (typeof obj[key] === 'string') {
        rule.warn(result, 'Existing exported CSS variable was replaced by @custom-media variable [' + originalKey + ']', {
          plugin: 'postcss-variables-loader',
          word: originalKey
        });
      }
      customMediaMap[key] = obj[key] = {
        value: params.join(' '),
        resolved: false,
        circular: false,
        rule: rule,
        originalKey: originalKey
      };
    } else if (rule.type === 'decl') {
      if (rule.parent && rule.parent.selectors.find(function (sel) {
        return sel === ':root';
      })) {
        var value = rule.value;

        var _key = dashesCamelCase(rule.prop.replace(/^-+/, ''));

        if ((0, _typeof3.default)(obj[_key]) === 'object') {
          rule.warn(result, 'Existing exported @custom-media variable was replaced by CSS variable [' + rule.prop + ']', { plugin: 'postcss-variables-loader', word: rule.prop });
        }

        obj[_key] = value.match(/^[+-]?\d*.?(\d*)?(px)$/i) ? parseFloat(value) : value;
      }
    }
  });
  (0, _keys2.default)(obj).forEach(function (key) {
    var val = obj[key];
    if ((typeof val === 'undefined' ? 'undefined' : (0, _typeof3.default)(val)) === 'object') {
      var mq = customMediaMap[key];
      var value = resolveCustomMediaValue(mq, [key], customMediaMap);
      mq.value = value;
      mq.resolved = true;
      if (!mq.circular) {
        obj[key] = value;
      } else {
        mq.rule.warn(result, 'Circular @custom-media definition for [' + mq.originalKey + ']. The entire rule has been removed from the output.', { node: mq.rule });
        delete obj[key];
      }
    }
  });

  return obj;
};

var toConfig = exports.toConfig = (0, _compose2.default)(toExport, toString, objectify);
var toES5Config = exports.toES5Config = (0, _compose2.default)(toES5Export, toString, objectify);
var getPostcss = exports.getPostcss = function getPostcss(async) {
  return (0, _postcss2.default)().use((0, _postcssImport2.default)({ async: async })).use((0, _postcssCssnext2.default)({
    features: { customProperties: { preserve: 'computed' }, customMedia: { preserve: true } }
  }));
};