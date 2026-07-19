import assert from 'node:assert/strict'
import { isPublicContent } from '../src/lib/publication.js'

const now = new Date('2026-07-19T12:00:00Z')

assert.equal(isPublicContent({ status: 'published', date: '2099-01-01' }, now), true)
assert.equal(isPublicContent({ status: 'scheduled', date: '2026-07-19T11:00:00Z' }, now), true)
assert.equal(isPublicContent({ status: 'scheduled', date: '2026-07-19T13:00:00Z' }, now), false)
assert.equal(isPublicContent({ status: 'draft', date: '2020-01-01' }, now), false)
assert.equal(isPublicContent({ status: 'archived', date: '2020-01-01' }, now), false)

console.log('Publication visibility rules passed.')
