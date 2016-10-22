import postcss from 'postcss'
import postcssJs from 'postcss-js'
import cssnext from 'postcss-cssnext'
import atImport from 'postcss-import'
import compose from 'lodash/fp/compose'
import get from 'lodash/fp/get'
import cond from 'lodash/fp/cond'
import lowerFirst from 'lodash/lowerFirst'
import loaderUtils from 'loader-utils'

const isDev = () => process.env.NODE_ENV === 'development'
const isProd = () => !isDev()

const transform = (data) => {
  if (!data) {
    return {}
  }
  return Object
    .keys(data)
    .reduce((acc, k) => {
      const v = data[k]

      k = k.replace(/^-+/, '') // strips '-'
      k = lowerFirst(k)
      acc[k] = v.endsWith('px') ? parseInt(v, 10) : v
      return acc
    }, {})
}

const toProdExport = (code) => `export default ${code}`
const toDevExport = (code) => `let config = ${code};
if (typeof global.Proxy !== 'undefined') {
    config = new Proxy(config, {
        get(target, key) {
            if (key !== '__esModule' && !target[key]) {
                console.error(\`No variable found, check variable key: ["\${key.toString()}"]\`);
            }
    
            return target[key];
        },
        
        set(target, key) {
            throw new Error('Config variables are immutable ' + key);
        }
    });
}
export default config`
const toES5Export = (code) => `module.exports = ${code}`

const toExport = cond([
  [isDev, toDevExport],
  [isProd, toProdExport]
])

const toString = (data) => `${JSON.stringify(data, null, '\t')}`
const toData = compose(transform, get(':root'))
const toConfig = compose(toExport, toString, toData)
const toES5Config = compose(toES5Export, toString, toData)

const getPostcss = (async) => postcss()
  .use(atImport({ async }))
  .use(cssnext({
    features: {
      customProperties: { preserve: 'computed' }
    }
  }))

const objectify = (root, filepath) => {
  // removes imported rules, so we have only computed output
  root.walkRules((r) => {
    if (r.source.input.file !== filepath) {
      r.remove()
    }
  })
  return postcssJs.objectify(root)
}

const loader = function (source) {
  if (this.cacheable) {
    this.cacheable()
  }

  const options = loaderUtils.parseQuery(this.query)
  const _done = this.async()

  const transformToConfig = options.es5 ? toES5Config : toConfig
  const end = (err, data = {}, map) => {
    if (err) {
      _done(err)
    }
    return _done(null, transformToConfig(data), map)
  }

  const emitWarnings = (result) => {
    return result
  }

  const onError = (error) => {
    if (error.name === 'CssSyntaxError') {
      this.emitError(error.message + error.showSourceCode())
      end()
    } else {
      end(error)
    }
  }

  getPostcss(true)
    .process(source, {
      from: this.resourcePath
    })
    .then(emitWarnings)
    .then((result) => end(null, objectify(result.root, this.resourcePath), result.map))
    .catch(onError)
}

loader.sync = function sync (source, filepath, options = {}) {
  const transformToConfig = options.es5 ? toES5Config : toConfig
  const root = getPostcss(false).process(source, { from: filepath }).root

  return transformToConfig(objectify(root, filepath))
}

export default loader
