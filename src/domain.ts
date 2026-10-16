export type Status = 'normal' | 'soon' | 'expired'
export type Member = { id: string; name: string; color: string }
export type Certificate = {
  id: string
  templateId: string
  name: string
  issueDate: string
  expiryDate: string
  remindDays: number
  memberId: string
  notes: string
  createdAt: string
}
export type Store = { version: 1; demo: boolean; certificates: Certificate[]; members: Member[]; cloudEnabled: boolean }
export const SELF: Member = { id: 'self', name: '自己', color: 'orange' }

// Calendar dates are compared in UTC so DST and the browser's timezone cannot add a day.
export function dateNumber(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return NaN
  const [year, month, day] = value.split('-').map(Number)
  const time = Date.UTC(year, month - 1, day)
  const parsed = new Date(time)
  return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day ? time / 86400000 : NaN
}
export function today() {
  const date = new Date(Date.now() + 8 * 3600000)
  return date.toISOString().slice(0, 10)
}
export function addDays(date: string, days: number) {
  return new Date((dateNumber(date) + days) * 86400000).toISOString().slice(0, 10)
}
export function daysLeft(expiry: string, reference = today()) { return dateNumber(expiry) - dateNumber(reference) }
export function statusOf(record: Certificate, reference = today()): Status {
  const days = daysLeft(record.expiryDate, reference)
  return days < 0 ? 'expired' : days <= record.remindDays ? 'soon' : 'normal'
}
export function formatDate(value: string) { return value.replace(/-/g, '.') }
export function uid() { return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}` }
export function validate(record: Pick<Certificate, 'name' | 'expiryDate' | 'issueDate' | 'remindDays' | 'notes'>) {
  if (!record.name.trim() || record.name.trim().length > 30) return '请填写 1–30 个字的证件名称'
  if (!Number.isFinite(dateNumber(record.expiryDate))) return '请选择有效的到期日期'
  if (record.issueDate && !Number.isFinite(dateNumber(record.issueDate))) return '请选择有效的发证日期'
  if (record.issueDate && dateNumber(record.issueDate) > dateNumber(record.expiryDate)) return '发证日期不能晚于到期日期'
  if (!Number.isInteger(record.remindDays) || record.remindDays < 1 || record.remindDays > 365) return '提前提醒天数须为 1–365 的整数'
  if (record.notes.length > 200) return '备注最多 200 个字'
  return ''
}
export function makeDemo(): Store {
  const now = today()
  const list: [string, string, string, number, number][] = [
    ['driving', '机动车驾驶证', 'self', 18, 30],
    ['passport', '普通护照', 'mom', 66, 90],
    ['identity', '居民身份证', 'self', 846, 90],
    ['hk', '港澳通行证', 'self', 215, 90],
    ['inspection', '车辆年检', 'dad', -7, 30],
    ['insurance', '汽车保险', 'dad', 108, 45],
  ]
  return {
    version: 1, demo: true, cloudEnabled: false,
    members: [SELF, { id: 'mom', name: '妈妈', color: 'purple' }, { id: 'dad', name: '爸爸', color: 'blue' }],
    certificates: list.map(([templateId, name, memberId, days, remindDays], index) => ({
      id: `demo-${index}`, templateId, name, memberId, remindDays,
      issueDate: addDays(now, days - (templateId === 'insurance' || templateId === 'inspection' ? 365 : 3650)),
      expiryDate: addDays(now, days), notes: '', createdAt: now,
    })),
  }
}
export function emptyStore(): Store { return { version: 1, demo: false, cloudEnabled: false, certificates: [], members: [SELF] } }
export function isStore(value: unknown): value is Store {
  if (!value || typeof value !== 'object') return false
  const data = value as Store
  if (data.version !== 1 || typeof data.demo !== 'boolean' || typeof data.cloudEnabled !== 'boolean' || !Array.isArray(data.members) || !Array.isArray(data.certificates)) return false
  if (data.members.length < 1 || data.members.length > 5 || data.certificates.length > 500) return false
  const memberIds = new Set(data.members.map(member => member.id))
  return memberIds.size === data.members.length && memberIds.has('self') && data.members.every(member => typeof member.id === 'string' && typeof member.name === 'string' && member.name.length <= 12 && typeof member.color === 'string') && new Set(data.certificates.map(record => record.id)).size === data.certificates.length && data.certificates.every(record => typeof record.id === 'string' && typeof record.templateId === 'string' && typeof record.name === 'string' && typeof record.issueDate === 'string' && typeof record.expiryDate === 'string' && typeof record.notes === 'string' && typeof record.createdAt === 'string' && memberIds.has(record.memberId) && !validate(record))
}
