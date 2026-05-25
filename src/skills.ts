/**
 * CPR 技能-属性映射表
 * 基于 Cyberpunk Red 规则手册
 */

/** 基本属性列表 */
export const BASE_ATTRIBUTES = [
  '智力', '反应', '敏捷', '技术', '酷', '意志', '幸运', '移动', '体魄', '共情'
] as const;

/** 技能-属性映射 */
export const SKILL_TO_ATTR: Record<string, string> = {
  // 感知类技能
  '专注力': '意志',
  '藏匿/搜寻物品': '智力',
  '藏匿': '智力',
  '搜寻物品': '智力',
  '唇语': '智力',
  '觉察': '智力',
  '追踪': '智力',

  // 体魄类技能
  '运动': '敏捷',
  '柔术': '敏捷',
  '舞蹈': '敏捷',
  '忍耐': '意志',
  '抵抗拷问/药物': '意志',
  '抵抗拷问': '意志',
  '抵抗药物': '意志',
  '潜行': '敏捷',

  // 操控类技能
  '驾驶地面载具': '反应',
  '驾驶飞行载具': '反应',
  '驾驶水上载具': '反应',
  '骑乘': '反应',

  // 教育类技能
  '会计': '智力',
  '驯兽': '智力',
  '官僚世故': '智力',
  '商业': '智力',
  '创作': '智力',
  '犯罪学': '智力',
  '密码学': '智力',
  '推理': '智力',
  '教育': '智力',
  '赌博': '智力',
  '语言': '智力',
  '图书馆检索': '智力',
  '本地专家': '智力',
  '科学': '智力',
  '战术': '智力',
  '野外生存': '智力',

  // 战斗技能
  '徒手搏斗': '敏捷',
  '闪避': '敏捷',
  '武术': '敏捷',
  '近战武器': '敏捷',

  // 表演技能
  '表演': '酷',
  '乐器演奏': '技术',

  // 远程武器技能
  '箭术': '反应',
  '自动武器': '反应',
  '手枪': '反应',
  '重型武器': '反应',
  '抵肩枪械': '反应',

  // 社交技能
  '贿赂': '酷',
  '交谈': '共情',
  '察言观色': '共情',
  '审讯': '酷',
  '说服': '酷',
  '个人仪容': '酷',
  '街头智慧': '酷',
  '交易': '酷',
  '衣着与风格': '酷',

  // 技术技能
  '飞行载具技术': '技术',
  '基础技术': '技术',
  '赛博技术': '技术',
  '爆破': '技术',
  '电子/安防技术': '技术',
  '电子技术': '技术',
  '安防技术': '技术',
  '急救': '技术',
  '伪造': '技术',
  '地面载具技术': '技术',
  '绘画': '技术',
  '素描': '技术',
  '雕塑': '技术',
  '医疗': '技术',
  '摄影': '技术',
  '影片': '技术',
  '撬锁': '技术',
  '扒窃': '技术',
  '水上载具技术': '技术',
  '武器技术': '技术',
};

/**
 * 判断是否为基本属性
 * @param name 属性/技能名
 * @returns 是否为基本属性
 */
export function isBaseAttribute(name: string): boolean {
  return BASE_ATTRIBUTES.includes(name as any);
}

/**
 * 获取技能对应的属性
 * @param skillName 技能名
 * @returns 对应的属性名，如果不是技能则返回 null
 */
export function getSkillAttribute(skillName: string): string | null {
  return SKILL_TO_ATTR[skillName] || null;
}

/**
 * 技能英文别名映射
 */
export const SKILL_ALIAS: Record<string, string> = {
  'concentration': '专注力',
  'conceal': '藏匿/搜寻物品',
  'lipreading': '唇语',
  'perception': '觉察',
  'tracking': '追踪',
  'athletics': '运动',
  'contortionist': '柔术',
  'dance': '舞蹈',
  'endurance': '忍耐',
  'resist torture': '抵抗拷问/药物',
  'stealth': '潜行',
  'driving': '驾驶地面载具',
  'piloting': '驾驶飞行载具',
  'riding': '骑乘',
  'accounting': '会计',
  'animal handling': '驯兽',
  'bureaucracy': '官僚世故',
  'business': '商业',
  'composition': '创作',
  'criminology': '犯罪学',
  'cryptography': '密码学',
  'deduction': '推理',
  'education': '教育',
  'gambling': '赌博',
  'language': '语言',
  'library': '图书馆检索',
  'local expert': '本地专家',
  'science': '科学',
  'tactics': '战术',
  'survival': '野外生存',
  'brawling': '徒手搏斗',
  'evasion': '闪避',
  'martial arts': '武术',
  'melee': '近战武器',
  'acting': '表演',
  'instrument': '乐器演奏',
  'archery': '箭术',
  'autofire': '自动武器',
  'handgun': '手枪',
  'heavy weapons': '重型武器',
  'shoulder arms': '抵肩枪械',
  'bribery': '贿赂',
  'conversation': '交谈',
  'human perception': '察言观色',
  'interrogation': '审讯',
  'persuasion': '说服',
  'personal grooming': '个人仪容',
  'streetwise': '街头智慧',
  'trading': '交易',
  'wardrobe & style': '衣着与风格',
  'aeronautics': '飞行载具技术',
  'basic tech': '基础技术',
  'cybertech': '赛博技术',
  'demolitions': '爆破',
  'electronics': '电子/安防技术',
  'first aid': '急救',
  'forgery': '伪造',
  'land vehicle tech': '地面载具技术',
  'painting': '绘画',
  'paramedic': '医疗',
  'photo & film': '摄影/影片',
  'pick lock': '撬锁',
  'pickpocket': '扒窃',
  'sea vehicle tech': '水上载具技术',
  'weaponstech': '武器技术',
};

/**
 * 解析技能/属性名（支持别名）
 * @param input 输入字符串
 * @returns 标准化的名称
 */
export function resolveName(input: string): string {
  const lower = input.toLowerCase();
  return SKILL_ALIAS[lower] || input;
}
