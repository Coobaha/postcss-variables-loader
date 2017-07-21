import compose from 'lodash/fp/compose'
import cond from 'lodash/fp/cond'
import postcss from 'postcss'
import cssnext from 'postcss-cssnext'
import atImport from 'postcss-import'

const isDev = () => process.env.NODE_ENV === 'development'
const isProd = () => !isDev()

const toProdExport = (code) => `export default ${code}`
const toDevExport = (code) => `let config = ${code};
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
const toES5Export = (code) => `module.exports = ${code}`

const toExport = cond([
  [isDev, toDevExport],
  [isProd, toProdExport]
])

const toString = (data) => `${JSON.stringify(data, null, '\t')}`

const dashesCamelCase = str =>
  str.replace(/-+(\w)/g, (match, firstLetter) => firstLetter.toUpperCase())

const objectify = (root, filepath) => {
  const result = {}

  if (!root) {
    return result
  }

  root.walkDecls((rule) => {
    if (rule.source.input.file !== filepath) {
      return
    }
    if (rule.parent && rule.parent.selectors.find((sel) => sel === ':root')) {
      const { value } = rule
      const key = dashesCamelCase(
        rule.prop.replace(/^-+/, '') // replace "--"
      )

      result[key] = value.match(/^[+-]?\d*.?(\d*)?(px)$/i) ? parseFloat(value) : value
    }
  })
  return result
}

export const toConfig = compose(toExport, toString, objectify)
export const toES5Config = compose(toES5Export, toString, objectify)
export const getPostcss = (async) => postcss()
  .use(atImport({ async }))
  .use(cssnext({ features: { customProperties: { preserve: 'computed' } } }))
