import * as utils from './utils'

export default function sync (source, filepath, options = {}) {
  const transformToConfig = options.es5 ? utils.toES5Config : utils.toConfig
  const root = utils.getPostcss(false).process(source, { from: filepath }).root

  return transformToConfig(root, filepath)
}
