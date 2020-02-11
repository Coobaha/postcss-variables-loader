import webpack from 'webpack'
import load from 'webpack-to-memory'
import path from 'path'

const loaderPath = path.resolve(__dirname, '../../src/lib/index.js')

export default async (fixture, { es5 } = {}) => {
  const babelString = es5 ? '' : 'babel-loader!'
  const loaderOptions = es5 ? '?es5=1' : ''
  const webpackConfig = {
    target: 'node',
    mode: 'development',
    context: path.resolve(__dirname, '../..'),
    entry: './test/helpers/entry.js',
    module: {
      rules: [
        {
          test: /\.css$/,
          loader: `${babelString}${loaderPath}${loaderOptions}`
        }
      ]
    },
    output: {
      path: __dirname,
      libraryTarget: 'commonjs2',
      filename: 'output.js'
    },
    resolve: {
      alias: {
        STYLES_FILE: path.resolve(__dirname, '../fixtures', fixture)
      }
    }
  }
  const compiler = webpack(webpackConfig)
  let stats
  compiler.hooks.done.tap('PostcssVariablesLoader', function (s) {
    stats = s.toJson()
  })
  const files = await load(compiler)

  const m = files[webpackConfig.output.filename]

  return {
    result: m.default ? m.default : m,
    warnings: stats.warnings
  }
}
