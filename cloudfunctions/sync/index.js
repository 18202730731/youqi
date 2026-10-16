const cloud = require('wx-server-sdk')
const crypto = require('node:crypto')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const hash = value => crypto.createHash('sha256').update(value).digest('hex')
const keyFor = (openid, record) => hash(`${openid}:${record.id}:${record.expiryDate}:${record.remindDays}`)
const day = () => new Date(Date.now() + 8 * 3600000).toISOString().slice(0, 10)
function validDate(value) { return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(`${value}T00:00:00Z`)) && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value }
function text(value, max, required = true) { if (typeof value !== 'string' || value.length > max || (required && !value.trim())) throw new Error('字段格式不正确'); return value.trim() }
function sanitize(payload) {
  if (!payload || payload.version !== 1 || payload.demo !== false || !Array.isArray(payload.members) || !Array.isArray(payload.certificates) || payload.members.length < 1 || payload.members.length > 5 || payload.certificates.length > 500) throw new Error('数据格式不正确')
  const members = payload.members.map(member => ({ id: text(member.id, 80), name: text(member.name, 12), color: ['orange', 'purple', 'blue', 'green', 'rose'].includes(member.color) ? member.color : 'orange' }))
  const ids = new Set(members.map(member => member.id))
  if (ids.size !== members.length || !ids.has('self')) throw new Error('成员无效')
  const certificates = payload.certificates.map(record => {
    if (!validDate(record.expiryDate) || (record.issueDate && (!validDate(record.issueDate) || record.issueDate > record.expiryDate)) || !Number.isInteger(record.remindDays) || record.remindDays < 1 || record.remindDays > 365 || !ids.has(record.memberId)) throw new Error('日期、成员或提醒天数不正确')
    return { id: text(record.id, 80), templateId: text(record.templateId, 40), name: text(record.name, 30), issueDate: text(record.issueDate, 10, false), expiryDate: record.expiryDate, remindDays: record.remindDays, memberId: record.memberId, notes: text(record.notes, 200, false), createdAt: text(record.createdAt, 40) }
  })
  if (new Set(certificates.map(record => record.id)).size !== certificates.length) throw new Error('证件记录重复')
  return { version: 1, demo: false, cloudEnabled: true, members, certificates }
}
async function readDocument(tx, collection, id) {
  try { return (await tx.collection(collection).doc(id).get()).data }
  catch (error) {
    if (/not exist|not found|不存在|DATABASE_DOCUMENT_NOT_EXIST/i.test(`${error.message || ''} ${error.errMsg || ''} ${error.code || ''}`)) return null
    throw error
  }
}
async function readProfile(tx, id) { return readDocument(tx, 'youqi_profiles', id) }
exports.main = async event => {
  const { OPENID } = cloud.getWXContext()
  if (!OPENID) return { ok: false, message: '请在微信小程序中登录使用' }
  const id = hash(OPENID)
  try {
    if (event.action === 'pull') { const profile = await readProfile(db, id); return { ok: true, data: profile?.payload || null } }
    if (event.action === 'push') {
      const payload = sanitize(event.payload)
      await db.runTransaction(async tx => {
        const previous = await readProfile(tx, id)
        const currentKeys = new Set(payload.certificates.map(record => keyFor(OPENID, record)))
        // A changed/deleted record cannot retain an old reminder permission.
        for (const record of previous?.payload?.certificates || []) {
          const key = keyFor(OPENID, record)
          if (!currentKeys.has(key)) { const task = await readDocument(tx, 'youqi_reminders', key); if (task) await tx.collection('youqi_reminders').doc(key).remove() }
        }
        await tx.collection('youqi_profiles').doc(id).set({ data: { openid: OPENID, payload, updatedAt: new Date() } })
      })
      return { ok: true }
    }
    if (event.action === 'authorize') {
      if (!process.env.REMINDER_TEMPLATE_ID) throw new Error('订阅消息模板尚未配置')
      await db.runTransaction(async tx => {
        const profile = await readProfile(tx, id)
        const record = profile?.payload?.certificates.find(item => item.id === event.recordId)
        if (!record || record.expiryDate < day()) throw new Error('证件不存在或已过期')
        const key = keyFor(OPENID, record)
        const existing = await readDocument(tx, 'youqi_reminders', key)
        if (existing && ['sending', 'sent'].includes(existing.state)) throw new Error('该到期日已发送过提醒；更新到期日后可重新订阅')
        const notifyDate = new Date(Date.parse(`${record.expiryDate}T00:00:00Z`) - record.remindDays * 86400000).toISOString().slice(0, 10)
        await tx.collection('youqi_reminders').doc(key).set({ data: { openid: OPENID, profileId: id, recordId: record.id, expiryDate: record.expiryDate, remindDays: record.remindDays, notifyDate, state: 'pending', authorizedAt: new Date() } })
      })
      // A client cannot forge WeChat message credits; delivery is still enforced by WeChat.
      return { ok: true }
    }
    if (event.action === 'delete') {
      await db.runTransaction(async tx => {
        const profile = await readProfile(tx, id)
        for (const record of profile?.payload?.certificates || []) { const task = await readDocument(tx, 'youqi_reminders', keyFor(OPENID, record)); if (task) await tx.collection('youqi_reminders').doc(keyFor(OPENID, record)).remove() }
        if (profile) await tx.collection('youqi_profiles').doc(id).remove()
      })
      return { ok: true }
    }
    return { ok: false, message: '未知操作' }
  } catch (error) { console.error('sync failed', { action: event.action, code: error.errCode }); return { ok: false, message: error.message || '同步失败' } }
}
