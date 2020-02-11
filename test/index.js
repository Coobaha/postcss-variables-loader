import test from 'ava'
import runner from './helpers/runner'
process.traceDeprecation = true
test('basic', async t => {
  const {result} = await runner('./basic.css')
  t.is(result.size, '10em')
})

test('works with es5 option', async t => {
  const {result} = await runner('./basic.css', {es5: true})

  t.is(result.size, '10em')
})

test('px strip', async t => {
  const {result} = await runner('./pxstrip.css')

  t.is(result.size, 10)
})

test('px strip ignores multiple px values', async t => {
  const {result} = await runner('./pxstrip.css')

  t.is(result.padding, '10px 10px')
})

test('imports drop', async t => {
  const {result} = await runner('./computed.css')

  t.is(result.anotherSize, '10em')
  t.is(typeof result.size, 'undefined')
})

test('imports overwrite', async t => {
  const {result} = await runner('./computedOverwrite.css')

  t.is(result.size, '1rem')
})

test('works with @apply', async t => {
  const {result} = await runner('./apply.css')

  t.deepEqual(result, {})
})

test('converts kebab case', async t => {
  const {result} = await runner('./convertedCase.css')

  t.not(result.sizeVariable, undefined)
  t.is(result['size-variable'], undefined)
})

test('converts only dashes', async t => {
  const {result} = await runner('./convertedCase.css')

  t.not(result.colorRGBA, undefined)
  t.is(result['color-RGBA'], undefined)
})

test('handles cssSyntax errors', async t => {
  try {
    await runner('./wrongSyntax.css')
  } catch (e) {
    const [error] = e
    t.regex(
      error.message,
      /Unclosed block/
    )
  }
})

test('works with multiple roots', async t => {
  const {result} = await runner('./multipleRoots.css')

  t.is(result.size, '11em')
  t.is(result.color, 'violet')
})

test('works with custom media', async t => {
  const {result} = await runner('./customMedia.css')
  t.is(result.smallViewport, '(max-width: 30em)')
})

test('works with custom media and respects order', async t => {
  const {result} = await runner('./customMediaOrder.css')

  t.is(result.viewport, 'i am here')
})

test('emits warnings when custom-media and css variables are replaced', async t => {
  const {warnings} = await runner('./customMediaOrderWarnings.css')

  t.is(warnings.length, 2)
  t.regex(
    warnings[0],
    /Existing exported CSS variable was replaced by @custom-media variable \[--custom]/
  )
  t.regex(
    warnings[1],
    /Existing exported @custom-media variable was replaced by CSS variable \[--small]/
  )
})

test('works with referenced custom media', async t => {
  const {result} = await runner('./customMediaReferenced.css')

  t.is(result.b, '(i am a-a-a)')
})

test('works with circular referenced custom media', async t => {
  const {result} = await runner('./customMediaCircularReferenced.css')

  t.false(result.hasOwnProperty('b'))
})

test('emits warning for circular referenced custom media', async t => {
  const {warnings} = await runner('./customMediaCircularReferenced.css')

  t.is(warnings.length, 2)
  t.regex(
    warnings[0],
    /Circular @custom-media definition for \[--a]. The entire rule has been removed from the output./
  )
  t.regex(
    warnings[1],
    /Circular @custom-media definition for \[--b]. The entire rule has been removed from the output./
  )
})

test('works with imported custom media', async t => {
  const {result} = await runner('./customMediaOverwrite.css')

  t.is(result.smallViewport, undefined)
  t.is(result.viewport, '(max-width: 31em)')
})
