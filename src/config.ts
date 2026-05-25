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
    top: ['智力', '反应', '技术', '魅力', '同调', '体格', '移动', '意志', '存在感'],
    sortBy: 'name',
    ignores: ['生命值上限'],
    showAs: {
      '生命值': '{生命值}/{生命值上限}',
    },
  },

  defaults: {
    '生命值': 10,
    '意志': 5,
    '体格': 5,
    '反应': 5,
    '智力': 5,
    '技术': 5,
    '魅力': 5,
    '同调': 5,
    '移动': 5,
    '存在感': 5,
  },

  defaultsComputed: {
    '生命值上限': '(体格 + 意志) * 5',
  },

  alias: {
    '生命值': ['hp', 'HP', 'Hp'],
    '生命值上限': ['hpmax', 'HPMAX'],
    '智力': ['int', 'INT'],
    '反应': ['ref', 'REF'],
    '技术': ['tech', 'TECH'],
    '魅力': ['cool', 'COOL'],
    '同调': ['emp', 'EMP'],
    '体格': ['body', 'BODY'],
    '移动': ['mov', 'MOV'],
    '意志': ['will', 'WILL'],
    '存在感': ['presence', 'PRE'],
  },
} as const;

/** 指令名称映射 */
export const CMD_ALIASES = {
  rc: ['rc', '检定'],
  ri: ['ri', '先攻'],
  init: ['init', '先攻管理'],
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
