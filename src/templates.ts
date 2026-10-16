export type Template = {
  id: string; name: string; english: string; icon: string; color: string; remindDays: number
  category: string; description: string; materials: string[]; tips: string; source: string; sourceName: string; url: string
}
export const templates: Template[] = [
  {
    id: 'identity', name: '居民身份证', english: 'IDENTITY CARD', icon: 'id', color: 'blue', remindDays: 90, category: '身份证明',
    description: '身份有凭，重要的日子有期。',
    materials: ['原居民身份证（到期换领）', '未成年人按当地要求由监护人陪同', '异地办理所需材料请查询当地公安政务平台'],
    tips: '以下为到期换领的基础核对项，异地办理、未成年人及其他情形以受理地公安机关要求为准。',
    source: 'https://www.yw.gov.cn/art/2024/6/7/art_1229444701_59482285.html', sourceName: '义乌市政府 · 身份证换补领指南（浙江示例）', url: 'https://gjzwfw.www.gov.cn/',
  },
  {
    id: 'driving', name: '机动车驾驶证', english: 'DRIVING LICENSE', icon: 'car', color: 'orange', remindDays: 30, category: '出行车辆',
    description: '安心出发，每一程都有准备。',
    materials: ['本人身份证明', '按要求完成驾驶人体检', '驾驶证数码照片（按受理地要求）'],
    tips: '可在交管 12123 查询期满换证业务。各地材料、体检数据联网和受理方式可能不同，请在官方平台确认。',
    source: 'https://www.beijing.gov.cn/fuwu/bmfw/bmzt/jsz/hl/blzn/201908/t20190820_1845186.html', sourceName: '北京市政府 · 期满换证办理指南（北京示例）', url: 'https://www.122.gov.cn/',
  },
  {
    id: 'passport', name: '普通护照', english: 'PASSPORT', icon: 'passport', color: 'purple', remindDays: 90, category: '出入境',
    description: '为下一次远行，留足从容。',
    materials: ['居民身份证', '符合出入境要求的照片与申请表', '原普通护照（换发时）', '特殊情形及未成年人材料请查官方指南'],
    tips: '各目的地对护照剩余有效期要求不同，出行前请向目的地使领馆及承运人核实。换发所需材料以当地出入境管理机构为准。',
    source: 'https://www.nia.gov.cn/n741445/n741604/n741648/c906151/content.html', sourceName: '国家移民管理局 · 普通护照申请材料', url: 'https://s.nia.gov.cn/',
  },
  {
    id: 'hk', name: '港澳通行证', english: 'EXIT–ENTRY PERMIT', icon: 'travel', color: 'teal', remindDays: 90, category: '出入境',
    description: '通行证和签注，记得分别检查。',
    materials: ['请在移民局政务服务平台查询往来港澳通行证指南', '按申请地及具体办理情形准备材料'],
    tips: '通行证有效期与签注有效期相互独立。可另建自定义证件记录签注，实际要求以官方平台为准。',
    source: 'https://s.nia.gov.cn/', sourceName: '国家移民管理局 · 政务服务平台', url: 'https://s.nia.gov.cn/',
  },
  {
    id: 'residence', name: '居住证', english: 'RESIDENCE PERMIT', icon: 'home', color: 'green', remindDays: 30, category: '身份证明',
    description: '在生活的城市，安心安家。',
    materials: ['选择受理城市后，在当地公安政务平台核对签注材料'],
    tips: '居住证签注时间及材料存在地区差异，此处不提供全国通用材料结论。请通过国家政务服务平台进入当地服务。',
    source: 'https://gjzwfw.www.gov.cn/', sourceName: '国家政务服务平台 · 按地区查询', url: 'https://gjzwfw.www.gov.cn/',
  },
  {
    id: 'inspection', name: '车辆年检', english: 'VEHICLE INSPECTION', icon: 'inspection', color: 'rose', remindDays: 30, category: '出行车辆',
    description: '让每一次出发，都稳稳当当。',
    materials: ['在交管 12123 查询车辆检验状态与办理要求'],
    tips: '车辆类型、车龄及使用性质会影响检验要求，请以交管平台显示的日期为准。本工具不推算车辆检验周期。',
    source: 'https://www.122.gov.cn/', sourceName: '公安部 · 交通安全综合服务管理平台', url: 'https://www.122.gov.cn/',
  },
  {
    id: 'insurance', name: '汽车保险', english: 'CAR INSURANCE', icon: 'shield', color: 'green', remindDays: 45, category: '保障与其他',
    description: '给日常多一份稳妥的保障。',
    materials: ['核对保单的保险期间', '向承保机构官方渠道确认续保材料'],
    tips: '交强险和商业险可能有不同到期日，可分别记录。续保业务请直接联系承保机构，本工具不提供保险销售或报价。',
    source: '', sourceName: '以承保机构的正式保单及官方说明为准', url: '',
  },
  {
    id: 'visa', name: '签证', english: 'VISA', icon: 'globe', color: 'purple', remindDays: 90, category: '出入境',
    description: '下一站的计划，提前准备。',
    materials: ['向目的地使领馆官方网站核实具体签证材料'],
    tips: '签证有效期、入境截止日与获准停留期限并不相同，请按实际需要分别建档。本工具不提供各国通用签证结论。',
    source: 'https://cs.mfa.gov.cn/', sourceName: '外交部 · 中国领事服务网（查询入口）', url: 'https://cs.mfa.gov.cn/',
  },
  {
    id: 'custom', name: '自定义证件', english: 'PERSONAL DOCUMENT', icon: 'file', color: 'slate', remindDays: 30, category: '保障与其他',
    description: '合同、会员、保单，也都可以记下来。', materials: [], tips: '请自行核实签发方或服务机构的办理要求。备注中请勿填写证件号码等敏感信息。', source: '', sourceName: '', url: '',
  },
]
export function templateOf(id: string) { return templates.find(item => item.id === id) || templates[templates.length - 1] }
