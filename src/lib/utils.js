import compose from 'lodash/fp/compose'
import cond from 'lodash/fp/cond'
import postcss from 'postcss'
import cssnext from 'postcss-cssnext'
import atImport from 'postcss-import'

const isDev = () => process.env.NODE_ENV === 'development'
const isProd = () => !isDev()

const toProdExport = code => `export default ${code}`
const toDevExport = code => `let config = ${code};
if (typeof Proxy !== 'undefined') {
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
const toES5Export = code => `module.exports = ${code}`

const toExport = cond([[isDev, toDevExport], [isProd, toProdExport]])

const toString = data => `${JSON.stringify(data, null, '\t')}`

const dashesCamelCase = str =>
  str.replace(/-+(\w)/g, (match, firstLetter) => firstLetter.toUpperCase())

const EXTENSION_RE = /\(\s*--([\w-]+)\s*\)/g

const resolveCustomMediaValue = (query, depChain, map) => {
  if (!EXTENSION_RE.test(query.value)) {
    return query.value
  }
  const val = query.value.replace(EXTENSION_RE, function (orig, name) {
    name = dashesCamelCase(name.replace(/^-+/, ''))
    if (!map[name]) {
      return orig
    }
    const mq = map[name]
    if (mq.resolved) {
      return mq.value
    }

    if (depChain.indexOf(name) !== -1) {
      mq.circular = true
      return orig
    }
    depChain.push(name)
    mq.value = resolveCustomMediaValue(mq, depChain, map)

    return mq.value
  })
  if (val === query.value) {
    query.circular = true
  }
  return val
}

const objectify = (result, filepath) => {
  const obj = {}
  const { root } = result
  const customMediaMap = {}
  if (!root) {
    return obj
  }

  root.walk(rule => {
    if (rule.source.input.file !== filepath) {
      return
    }
    if (rule.type === 'atrule' && rule.name === 'custom-media') {
      const params = rule.params.split(' ')
      const originalKey = params.shift()
      const key = dashesCamelCase(originalKey.replace(/^-+/, ''))
      if (typeof obj[key] === 'string') {
        rule.warn(
          result,
          `Existing exported CSS variable was replaced by @custom-media variable [${originalKey}]`,
          {
            plugin: 'postcss-variables-loader',
            word: originalKey
          }
        )
      }
      customMediaMap[key] = obj[key] = {
        value: params.join(' '),
        resolved: false,
        circular: false,
        rule,
        originalKey
      }
    } else if (rule.type === 'decl') {
      if (rule.parent && rule.parent.selectors.find(sel => sel === ':root')) {
        const { value } = rule
        const key = dashesCamelCase(rule.prop.replace(/^-+/, ''))

        if (typeof obj[key] === 'object') {
          rule.warn(
            result,
            `Existing exported @custom-media variable was replaced by CSS variable [${rule.prop}]`,
            { plugin: 'postcss-variables-loader', word: rule.prop }
          )
        }

        obj[key] = value.match(/^[+-]?\d*.?(\d*)?(px)$/i) ? parseFloat(value) : value
      }
    }
  })
  Object.keys(obj).forEach(function (key) {
    const val = obj[key]
    if (typeof val === 'object') {
      const mq = customMediaMap[key]
      const value = resolveCustomMediaValue(mq, [key], customMediaMap)
      mq.value = value
      mq.resolved = true
      if (!mq.circular) {
        obj[key] = value
      } else {
        mq.rule.warn(
          result,
          `Circular @custom-media definition for [${
            mq.originalKey
          }]. The entire rule has been removed from the output.`,
          { node: mq.rule }
        )
        delete obj[key]
      }
    }
  })

  return obj
}

export const toConfig = compose(toExport, toString, objectify)
export const toES5Config = compose(toES5Export, toString, objectify)
export const getPostcss = async =>
  postcss()
    .use(atImport({ async }))
    .use(
      cssnext({
        browsers: ['last 2 versions'],
        features: { customProperties: { preserve: 'computed' }, customMedia: { preserve: true } }
      })
    )
