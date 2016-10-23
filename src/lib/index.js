import loaderUtils from 'loader-utils'
import * as utils from './utils'

export default function (source) {
  if (this.cacheable) {
    this.cacheable()
  }

  const options = loaderUtils.parseQuery(this.query)
  const _done = this.async()

  const transformToConfig = options.es5 ? utils.toES5Config : utils.toConfig

  const end = (err, data = {}, map) => {
    if (err) {
      _done(err)
    }
    return _done(null, transformToConfig(data), map)
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
    .then((result) => end(null, utils.objectify(result.root, this.resourcePath), result.map))
    .catch(onError)
}
