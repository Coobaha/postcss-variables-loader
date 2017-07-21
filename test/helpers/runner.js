import webpack from 'webpack'
import load from 'webpack-to-memory'
import path from 'path'

const loaderPath = path.resolve(__dirname, '../../src/lib/index.js')

export default async (fixture, { es5 } = {}) => {
  const babelString = es5 ? '' : 'babel-loader!'
  const loaderOptions = es5 ? '?es5=1' : ''
  const webpackConfig = {
    target: 'node',
    context: path.resolve(__dirname, '../..'),
    entry: './test/helpers/entry.js',
    module: {
      loaders: [
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
  const files = await load(webpack(webpackConfig))

  return files[webpackConfig.output.filename]
}
