const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
function getDate() { return new Date(Date.now() + 8 * 3600000).toISOString().slice(0, 10) }
exports.main = async event => {
  // Block user-invoked calls even if the client forges a timer-looking payload.
  if (cloud.getWXContext().OPENID || event.Type !== 'Timer') throw new Error('Timer invocation required')
  const templateId = process.env.REMINDER_TEMPLATE_ID
  const fields = [process.env.REMINDER_NAME_FIELD, process.env.REMINDER_DATE_FIELD, process.env.REMINDER_HOLDER_FIELD]
  if (!templateId || fields.some(field => !/^(thing|date|time|character_string)\d+$/.test(field || '')) || new Set(fields).size !== 3) throw new Error('Configure approved template ID and exact field names')
  const currentDay = getDate()
  let sent = 0, failed = 0, canceled = 0
  // Bounded batches avoid timeout. The next scheduled run continues remaining tasks.
  const tasks = await db.collection('youqi_reminders').where({ state: 'pending', notifyDate: db.command.lte(currentDay) }).limit(100).get()
  for (const candidate of tasks.data) {
    const task = await db.runTransaction(async tx => {
      let latest
      try { latest = (await tx.collection('youqi_reminders').doc(candidate._id).get()).data } catch { return null }
      if (latest.state !== 'pending') return null
      await tx.collection('youqi_reminders').doc(candidate._id).update({ data: { state: 'sending', claimedAt: new Date() } })
      return latest
    })
    if (!task) continue
    try {
      const profile = (await db.collection('youqi_profiles').doc(task.profileId).get()).data
      const record = profile.payload.certificates.find(item => item.id === task.recordId)
      if (!record || record.expiryDate !== task.expiryDate || record.remindDays !== task.remindDays || record.expiryDate < currentDay) {
        await db.collection('youqi_reminders').doc(task._id).update({ data: { state: 'canceled' } }); canceled++; continue
      }
      const member = profile.payload.members.find(item => item.id === record.memberId)
      await cloud.openapi.subscribeMessage.send({
        touser: task.openid, templateId, page: 'pages/index/index', lang: 'zh_CN', miniprogramState: process.env.MINIPROGRAM_STATE || 'formal',
        data: { [fields[0]]: { value: record.name.slice(0, 20) }, [fields[1]]: { value: record.expiryDate }, [fields[2]]: { value: (member?.name || '自己').slice(0, 20) } },
      })
      await db.collection('youqi_reminders').doc(task._id).update({ data: { state: 'sent', sentAt: new Date() } }); sent++
    } catch (error) {
      // An ambiguous API timeout may already have consumed the one-time credit.
      // Keep failed/sending tasks for operator review, without automatic resends.
      await db.collection('youqi_reminders').doc(task._id).update({ data: { state: 'failed', errorCode: String(error.errCode || 'unknown'), failedAt: new Date() } }).catch(() => {})
      failed++
    }
  }
  return { sent, failed, canceled }
}
