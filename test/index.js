import test from 'ava'
import runner from './helpers/runner'
import runnerSync from './helpers/runner-sync'

test('basic', async (t) => {
  const result = await runner('./basic.css')

  t.true(result.size === '10em')
})

test('works with es5 option', async (t) => {
  const result = await runner('./basic.css', { es5: true })

  t.is(result.size, '10em')
})

test('px strip', async (t) => {
  const result = await runner('./pxstrip.css')
  const expected = 10

  t.is(result.size, expected)
})

test('imports drop', async (t) => {
  const result = await runner('./computed.css')

  t.true(result.anotherSize === '10em')
  t.is(typeof result.size, 'undefined')
})

test('imports overwrite', async (t) => {
  const result = await runner('./computedOverwrite.css')

  t.true(result.size === '1rem')
})

test('works with @apply', async (t) => {
  const result = await runner('./apply.css')

  t.deepEqual(result, {})
})

test('handles cssSyntax errors', async (t) => {
  t.throws(runner('./wrongSyntax.css'), ([error]) => error.message.includes('Unclosed block'))
})

test('sync loader works', (t) => {
  const result = runnerSync('./basic.css')

  t.true(result.size === '10em')
})

test('sync loader works with es5 ', (t) => {
  const result = runnerSync('./basic.css', { es5: true })

  t.true(result.size === '10em')
})

test('works with multiple roots', async (t) => {
  const result = await runner('./multipleRoots.css')

  t.true(result.size === '11em')
  t.true(result.color === 'violet')
})
