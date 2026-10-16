import Taro from '@tarojs/taro'
import { isStore, Store, emptyStore, makeDemo } from './domain'

const KEY = 'youqi.store.v1'
export const isWeapp = process.env.TARO_ENV === 'weapp'
export const cloudReady = isWeapp && Boolean(process.env.TARO_APP_CLOUD_ENV)
export const subscriptionReady = cloudReady && Boolean(process.env.TARO_APP_REMINDER_TEMPLATE)
let initialized = false
function initCloud() {
  if (!cloudReady) throw new Error('微信云开发环境尚未配置')
  if (!initialized) { Taro.cloud.init({ env: process.env.TARO_APP_CLOUD_ENV, traceUser: false }); initialized = true }
}
export function loadStore(): { data: Store; error?: string } {
  try {
    const value = Taro.getStorageSync(KEY)
    if (!value) return { data: makeDemo() }
    const parsed = typeof value === 'string' ? JSON.parse(value) : value
    if (!isStore(parsed)) return { data: emptyStore(), error: '本地数据格式异常。已保留原数据，请勿继续保存，先联系支持导出恢复。' }
    return { data: parsed }
  } catch { return { data: emptyStore(), error: '无法读取本地存储。请检查浏览器或微信的存储权限。' } }
}
export function saveStore(data: Store) {
  if (!isStore(data)) throw new Error('数据校验失败，未保存')
  Taro.setStorageSync(KEY, JSON.stringify(data))
}
export async function copyText(text: string) {
  if (isWeapp) { await Taro.setClipboardData({ data: text }); return }
  if (navigator.clipboard && window.isSecureContext) {
    try { await navigator.clipboard.writeText(text); return } catch { /* Try the user-gesture fallback below. */ }
  }
  const previous = document.activeElement as HTMLElement | null
  const input = document.createElement('textarea')
  input.value = text; input.readOnly = true
  input.style.cssText = 'position:fixed;left:-10000px;top:0'
  document.body.appendChild(input)
  try {
    input.select()
    if (!document.execCommand('copy')) throw new Error('剪贴板不可用')
  } finally { input.remove(); previous?.focus() }
}
export async function openLink(url: string) {
  if (isWeapp) { await copyText(url); return '官方链接已复制，请在浏览器中打开' }
  window.open(url, '_blank', 'noopener,noreferrer')
  return ''
}
async function cloudCall(action: string, data?: Store) {
  initCloud()
  const response = await Taro.cloud.callFunction({ name: 'sync', data: { action, payload: data } })
  const result = response.result as { ok: boolean; data?: Store; message?: string }
  if (!result?.ok) throw new Error(result?.message || '云同步失败，请稍后重试')
  return result.data
}
export async function pushCloud(data: Store) { return cloudCall('push', data) }
export async function pullCloud() { return cloudCall('pull') }
export async function deleteCloud() { return cloudCall('delete') }
export async function subscribe(recordId: string) {
  if (!subscriptionReady) throw new Error('请先在微信小程序中配置订阅消息模板')
  initCloud()
  const templateId = process.env.TARO_APP_REMINDER_TEMPLATE || ''
  // Taro 4.3's cross-platform type incorrectly also requires Alipay's entityIds.
  // WeChat only accepts tmplIds; keep the runtime request platform-correct.
  const result = await Taro.requestSubscribeMessage({ tmplIds: [templateId] } as Taro.requestSubscribeMessage.Option) as Taro.requestSubscribeMessage.SuccessCallbackResult
  if (result[templateId] !== 'accept') throw new Error('未获得订阅授权，你仍可在应用内查看到期状态')
  const response = await Taro.cloud.callFunction({ name: 'sync', data: { action: 'authorize', recordId } })
  if (!(response.result as { ok?: boolean })?.ok) throw new Error('记录订阅状态失败，请重试')
}
