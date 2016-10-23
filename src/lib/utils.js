import postcssJs from 'postcss-js'
import compose from 'lodash/fp/compose'
import get from 'lodash/fp/get'
import cond from 'lodash/fp/cond'
import lowerFirst from 'lodash/lowerFirst'
import postcss from 'postcss'
import cssnext from 'postcss-cssnext'
import atImport from 'postcss-import'

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

export const toConfig = compose(toExport, toString, toData)
export const toES5Config = compose(toES5Export, toString, toData)

export const objectify = (root, filepath) => {
  // removes imported rules, so we have only computed output
  root.walkRules((r) => {
    if (r.source.input.file !== filepath) {
      r.remove()
    }
  })
  return postcssJs.objectify(root)
}

export const getPostcss = (async) => postcss()
  .use(atImport({ async }))
  .use(cssnext({ features: { customProperties: { preserve: 'computed' } } }))
