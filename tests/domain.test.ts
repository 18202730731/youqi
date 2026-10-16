import { test } from 'node:test'
import assert from 'node:assert/strict'
import { addDays, dateNumber, daysLeft, emptyStore, isStore, makeDemo, statusOf, validate } from '../src/domain'

test('到期当天仍有效，提醒边界包含当天，次日过期', () => {
  const record = { ...makeDemo().certificates[0], expiryDate: '2026-11-15', remindDays: 30 }
  assert.equal(statusOf(record, '2026-10-15'), 'normal')
  assert.equal(statusOf(record, '2026-10-16'), 'soon')
  assert.equal(statusOf(record, '2026-11-15'), 'soon')
  assert.equal(daysLeft(record.expiryDate, '2026-11-15'), 0)
  assert.equal(statusOf(record, '2026-11-16'), 'expired')
})
test('日历运算跨月跨年、闰日准确，拒绝不存在的日期', () => {
  assert.equal(addDays('2026-01-01', -1), '2025-12-31')
  assert.equal(addDays('2024-02-28', 1), '2024-02-29')
  assert.equal(addDays('2026-02-28', 1), '2026-03-01')
  assert.ok(Number.isNaN(dateNumber('2026-02-29')))
  assert.ok(Number.isNaN(dateNumber('not-a-date')))
})
test('拒绝反向有效期、缺失日期、非法提醒天数', () => {
  const record = { ...makeDemo().certificates[0], issueDate: '2026-11-16', expiryDate: '2026-11-15' }
  assert.ok(validate(record))
  assert.ok(validate({ ...record, issueDate: '', expiryDate: '' }))
  assert.ok(validate({ ...record, issueDate: '', remindDays: 0 }))
  assert.ok(validate({ ...record, issueDate: '', remindDays: 1.5 }))
  assert.equal(validate({ ...record, issueDate: '', remindDays: 365 }), '')
})
test('示例与真实空白空间均有效，损坏数据与孤立成员被拦截', () => {
  assert.equal(isStore(makeDemo()), true)
  assert.equal(isStore(emptyStore()), true)
  assert.equal(isStore(null), false)
  assert.equal(isStore({ ...makeDemo(), members: [] }), false)
  const data = makeDemo()
  data.certificates[0].memberId = 'unknown'
  assert.equal(isStore(data), false)
})
test('序列化恢复保留日期、成员归属及自定义天数', () => {
  const data = makeDemo()
  data.demo = false
  data.certificates[0].remindDays = 17
  const restored = JSON.parse(JSON.stringify(data))
  assert.ok(isStore(restored))
  assert.deepEqual(restored, data)
})
