import loaderUtils from 'loader-utils'
import * as utils from './utils'

export default function (source) {
  if (this.cacheable) {
    this.cacheable()
  }

  const options = loaderUtils.parseQuery(this.query)
  const _done = this.async()

  const transformToConfig = options.es5 ? utils.toES5Config : utils.toConfig

  const end = (err, result, path, map) => {
    if (err) {
      _done(err)
    }

    if (!result) {
      return _done(null, {}, map)
    }

    return _done(null, transformToConfig(result.root, path), map)
  }

  const emitWarnings = (result) => {
    result.warnings().forEach((msg) => this.emitWarning(msg.toString()))
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

  utils.getPostcss(true)
    .process(source, { from: this.resourcePath })
    .then(emitWarnings)
    .then((result) => end(null, result, this.resourcePath, result.map))
    .catch(onError)
}
