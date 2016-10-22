import test from 'ava'
import 'babel-core/register'
import runner from './helpers/runner'

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

test('works with @apply', async (t) => {
  const result = await runner('./apply.css')

  t.deepEqual(result, {})
})

test('handles cssSyntax errors', async (t) => {
  t.throws(runner('./wrongSyntax.css'), ([error]) => error.message.includes('Unclosed block'))
})
