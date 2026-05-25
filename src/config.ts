/**
 * CPR 扩展配置和常量
 */

/** 扩展信息 */
export const EXT_INFO = {
  name: 'cpr',
  author: '猫佑Millan',
  version: '1.0.0',
} as const;

/** CPR 规则模板配置 */
export const CPR_TEMPLATE = {
  name: 'cpr',
  fullName: 'Cyberpunk Red',
  authors: ['猫佑Millan'],
  version: '1.0.0',
  updatedTime: '20260524',
  templateVer: '1.0',

  setConfig: {
    diceSides: 10,
    enableTip: '已切换至 Cyberpunk Red 规则，使用 10 面骰',
    keys: ['cpr', '赛博朋克红', '赛博朋克', 'cyberpunk red', 'cyberpunk'],
    relatedExt: ['cpr'],
  },

  nameTemplate: {
    cpr: {
      template: '{$t玩家_RAW} HP{生命值}/{生命值上限}',
      helpText: 'CPR 名片模板',
    },
  },

  attrConfig: {
    top: ['智力', '反应', '敏捷', '技术', '酷', '意志', '幸运', '移动', '体魄', '共情'],
    sortBy: 'name',
    ignores: ['生命值上限'],
    showAs: {
      '生命值': '{生命值}/{生命值上限}',
    },
  },

  defaults: {
    '生命值': 10,
    '智力': 5,
    '反应': 5,
    '敏捷': 5,
    '技术': 5,
    '酷': 5,
    '意志': 5,
    '幸运': 5,
    '移动': 5,
    '体魄': 5,
    '共情': 5,
  },

  defaultsComputed: {
    '生命值上限': '(体魄 + 意志) * 5',
  },

  alias: {
    '生命值': ['hp', 'HP', 'Hp'],
    '生命值上限': ['hpmax', 'HPMAX'],
    '智力': ['int', 'INT'],
    '反应': ['ref', 'REF'],
    '敏捷': ['dex', 'DEX'],
    '技术': ['tech', 'TECH'],
    '酷': ['cool', 'COOL'],
    '意志': ['will', 'WILL'],
    '幸运': ['luck', 'LUCK'],
    '移动': ['mov', 'MOV'],
    '体魄': ['body', 'BODY'],
    '共情': ['emp', 'EMP'],
  },
} as const;

/** 指令名称映射 */
export const CMD_ALIASES = {
  rc: ['rc', '检定'],
  ri: ['ri', '先攻'],
  init: ['init', '先攻管理'],
  netr: ['netr', '网络空间'],
} as const;

/** 格式化常量 */
export const FORMAT = {
  separator: '─────────────────',
  doubleSeparator: '═══════════════════',
  diceEmoji: '🎲',
  swordEmoji: '⚔️',
  clipboardEmoji: '📋',
  starEmoji: '🌟',
  explosionEmoji: '💥',
  checkMarkEmoji: '✅',
  crossMarkEmoji: '❌',
  warningEmoji: '⚠️',
  playEmoji: '▶',
} as const;
