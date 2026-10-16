import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { runInNewContext } from 'node:vm'
import { createHash } from 'node:crypto'
import { emptyStore, makeDemo } from '../src/domain'

function harness() {
  const tables = new Map<string, Map<string, any>>()
  let identity: string | undefined = 'user-a'
  function collection(name: string) {
    if (!tables.has(name)) tables.set(name, new Map())
    const table = tables.get(name)!
    return { doc: (id: string) => ({
      get: async () => { if (!table.has(id)) throw new Error('document does not exist'); return { data: { ...structuredClone(table.get(id)), _id: id } } },
      set: async ({ data }: { data: any }) => { table.set(id, structuredClone(data)); return {} },
      update: async ({ data }: { data: any }) => { table.set(id, { ...table.get(id), ...structuredClone(data) }); return {} },
      remove: async () => { table.delete(id); return {} },
    }) }
  }
  const db: any = { collection, runTransaction: async (callback: (tx: any) => unknown) => callback(db) }
  const cloud = { DYNAMIC_CURRENT_ENV: 'test', init() {}, database: () => db, getWXContext: () => ({ OPENID: identity }) }
  function load(name: string) {
    const module = { exports: {} as { main: (event: any) => Promise<any> } }
    runInNewContext(readFileSync(resolve(`cloudfunctions/${name}/index.js`), 'utf8'), { exports: module.exports, module, require: (name: string) => name === 'wx-server-sdk' ? cloud : require(name), process: { env: { REMINDER_TEMPLATE_ID: 'test-template' } }, console: { error() {} } })
    return module.exports.main
  }
  return { tables, load, identify: (value: string | undefined) => { identity = value } }
}
const hash = (value: string) => createHash('sha256').update(value).digest('hex')

test('云同步按服务端 OPENID 隔离，忽略客户端身份与额外敏感字段', async () => {
  const env = harness(), sync = env.load('sync')
  const payload: any = { ...makeDemo(), demo: false, openid: 'user-b' }
  payload.certificates[0].identityNumber = 'test-field-must-not-be-persisted'
  assert.equal((await sync({ action: 'push', payload, openid: 'user-b' })).ok, true)
  const saved = env.tables.get('youqi_profiles')!.get(hash('user-a'))
  assert.equal(saved.openid, 'user-a')
  assert.equal('openid' in saved.payload, false)
  assert.equal('identityNumber' in saved.payload.certificates[0], false)
  env.identify('user-b')
  assert.equal((await sync({ action: 'pull' })).data, null)
  env.identify(undefined)
  assert.equal((await sync({ action: 'pull' })).ok, false)
})
test('证件变更或删除后旧提醒任务被移除，云端删除不留下任务', async () => {
  const env = harness(), sync = env.load('sync')
  const payload = { ...makeDemo(), demo: false }
  assert.equal((await sync({ action: 'push', payload })).ok, true)
  const record = payload.certificates.find(record => record.id === 'demo-0')!
  assert.equal((await sync({ action: 'authorize', recordId: record.id })).ok, true)
  assert.equal(env.tables.get('youqi_reminders')!.size, 1)
  assert.equal((await sync({ action: 'push', payload: { ...payload, certificates: [] } })).ok, true)
  assert.equal(env.tables.get('youqi_reminders')!.size, 0)
  assert.equal((await sync({ action: 'delete' })).ok, true)
  assert.equal(env.tables.get('youqi_profiles')!.size, 0)
})
test('云端拒绝无效日期、示例空间及越权订阅', async () => {
  const env = harness(), sync = env.load('sync')
  assert.equal((await sync({ action: 'push', payload: makeDemo() })).ok, false)
  const payload = { ...makeDemo(), demo: false }
  payload.certificates[0].expiryDate = '2026-02-30'
  assert.equal((await sync({ action: 'push', payload })).ok, false)
  assert.equal((await sync({ action: 'push', payload: emptyStore() })).ok, true)
  assert.equal((await sync({ action: 'authorize', recordId: 'another-user-record' })).ok, false)
})
test('普通用户即使伪造定时载荷，也无法调用批量提醒', async () => {
  const env = harness(), reminders = env.load('reminders')
  await assert.rejects(reminders({ Type: 'Timer' }), /Timer invocation required/)
})
