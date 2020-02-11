"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getPostcss = exports.toES5Config = exports.toConfig = void 0;

var _compose = _interopRequireDefault(require("lodash/fp/compose"));

var _cond = _interopRequireDefault(require("lodash/fp/cond"));

var _postcss = _interopRequireDefault(require("postcss"));

var _postcssCssnext = _interopRequireDefault(require("postcss-cssnext"));

var _postcssImport = _interopRequireDefault(require("postcss-import"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var isDev = () => process.env.NODE_ENV === 'development';

var isProd = () => !isDev();

var toProdExport = code => "export default ".concat(code);

var toDevExport = code => "let config = ".concat(code, ";\nif (typeof Proxy !== 'undefined') {\n    config = new Proxy(config, {\n        get(target, key) {\n            if (key !== '__esModule' && !target[key]) {\n                console.error(`No variable found, check variable key: [\"${key.toString()}\"]`);\n            }\n    \n            return target[key];\n        },\n        \n        set(target, key) {\n            throw new Error('Config variables are immutable ' + key);\n        }\n    });\n}\nexport default config");

var toES5Export = code => "module.exports = ".concat(code);

var toExport = (0, _cond.default)([[isDev, toDevExport], [isProd, toProdExport]]);

var toString = data => "".concat(JSON.stringify(data, null, '\t'));

var dashesCamelCase = str => str.replace(/-+(\w)/g, (match, firstLetter) => firstLetter.toUpperCase());

var EXTENSION_RE = /\(\s*--([\w-]+)\s*\)/g;

var resolveCustomMediaValue = (query, depChain, map) => {
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

var objectify = (result, filepath) => {
  var obj = {};
  var {
    root
  } = result;
  var customMediaMap = {};

  if (!root) {
    return obj;
  }

  root.walk(rule => {
    if (rule.source.input.file !== filepath) {
      return;
    }

    if (rule.type === 'atrule' && rule.name === 'custom-media') {
      var params = rule.params.split(' ');
      var originalKey = params.shift();
      var key = dashesCamelCase(originalKey.replace(/^-+/, ''));

      if (typeof obj[key] === 'string') {
        rule.warn(result, "Existing exported CSS variable was replaced by @custom-media variable [".concat(originalKey, "]"), {
          plugin: 'postcss-variables-loader',
          word: originalKey
        });
      }

      customMediaMap[key] = obj[key] = {
        value: params.join(' '),
        resolved: false,
        circular: false,
        rule,
        originalKey
      };
    } else if (rule.type === 'decl') {
      if (rule.parent && rule.parent.selectors.find(sel => sel === ':root')) {
        var {
          value
        } = rule;

        var _key = dashesCamelCase(rule.prop.replace(/^-+/, ''));

        if (typeof obj[_key] === 'object') {
          rule.warn(result, "Existing exported @custom-media variable was replaced by CSS variable [".concat(rule.prop, "]"), {
            plugin: 'postcss-variables-loader',
            word: rule.prop
          });
        }

        obj[_key] = value.match(/^[+-]?\d*.?(\d*)?(px)$/i) ? parseFloat(value) : value;
      }
    }
  });
  Object.keys(obj).forEach(function (key) {
    var val = obj[key];

    if (typeof val === 'object') {
      var mq = customMediaMap[key];
      var value = resolveCustomMediaValue(mq, [key], customMediaMap);
      mq.value = value;
      mq.resolved = true;

      if (!mq.circular) {
        obj[key] = value;
      } else {
        mq.rule.warn(result, "Circular @custom-media definition for [".concat(mq.originalKey, "]. The entire rule has been removed from the output."), {
          node: mq.rule
        });
        delete obj[key];
      }
    }
  });
  return obj;
};

var toConfig = (0, _compose.default)(toExport, toString, objectify);
exports.toConfig = toConfig;
var toES5Config = (0, _compose.default)(toES5Export, toString, objectify);
exports.toES5Config = toES5Config;

var getPostcss = async => (0, _postcss.default)().use((0, _postcssImport.default)({
  async
})).use((0, _postcssCssnext.default)({
  browsers: ['last 2 versions'],
  features: {
    customProperties: {
      preserve: 'computed'
    },
    customMedia: {
      preserve: true
    }
  }
}));

exports.getPostcss = getPostcss;