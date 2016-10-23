import path from 'path'
import fs from 'fs'
import * as babel from 'babel-core'
import loader from '../../src/lib/sync'
import vm from 'vm'

const babelOpts = JSON.parse(fs.readFileSync(path.resolve('../.babelrc'), 'utf8'))

export default (fixture, options) => {
  const fixturePath = path.resolve(__dirname, '../fixtures', fixture)
  const source = fs.readFileSync(fixturePath, 'utf8')
  const code = loader(source, fixturePath, options)
  const exports = {}
  const context = vm.createContext({
    require,
    exports,
    module: { exports }
  })

  vm.runInContext(babel.transform(code, babelOpts).code, context)
  return context.module.exports
}
