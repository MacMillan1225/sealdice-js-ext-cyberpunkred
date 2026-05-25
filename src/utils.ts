/**
 * CPR 扩展工具函数
 */

import { SealContext, CheckResult, InitiativeData } from './types';
import { FORMAT } from './config';

/**
 * 投掷 D10 骰子
 * @returns 1-10 的随机数
 */
export function rollD10(): number {
  return Math.floor(Math.random() * 10) + 1;
}

/**
 * 获取角色属性值
 * @param ctx 海豹上下文
 * @param attrName 属性名称
 * @param defaultValue 默认值
 * @returns [属性值, 是否存在]
 */
export function getAttrValue(
  ctx: SealContext,
  attrName: string,
  defaultValue: number = 0
): [number, boolean] {
  const [val, exists] = seal.vars.intGet(ctx as any, attrName);
  if (!exists) {
    return [defaultValue, false];
  }
  return [val, true];
}

/**
 * 获取角色名称
 * @param ctx 海豹上下文
 * @returns 角色名称
 */
export function getCharacterName(ctx: SealContext): string {
  const [name, exists] = seal.vars.strGet(ctx as any, '$t绑定角色名');
  return exists ? name : ctx.player.name;
}

/**
 * 格式化检定结果
 * @param result 检定结果数据
 * @returns 格式化后的字符串
 */
export function formatCheckResult(result: CheckResult): string {
  const lines: string[] = [];

  lines.push(`${FORMAT.diceEmoji} CPR 检定`);
  lines.push(FORMAT.separator);
  lines.push(`${result.attrName}: ${result.attrValue}  |  ${result.skillName}: ${result.skillValue}`);

  let diceDetail = `1d10 = ${result.d10Result}`;
  if (result.isCriticalSuccess && result.bonusRoll !== null) {
    diceDetail += ` → ${FORMAT.starEmoji} 大成功！追加 1d10 = ${result.bonusRoll}`;
  } else if (result.isCriticalFailure && result.bonusRoll !== null) {
    diceDetail += ` → ${FORMAT.explosionEmoji} 大失败！追加 1d10 = ${result.bonusRoll}`;
  }
  lines.push(`投骰: ${diceDetail}`);

  let calcLine = `总计: ${result.attrValue} + ${result.skillValue} + ${result.d10Result}`;
  if (result.isCriticalSuccess && result.bonusRoll !== null) {
    calcLine += ` + ${result.bonusRoll}`;
  } else if (result.isCriticalFailure && result.bonusRoll !== null) {
    calcLine += ` - ${result.bonusRoll}`;
  }
  calcLine += ` = ${result.total}`;
  lines.push(calcLine);

  lines.push(FORMAT.separator);
  if (result.isCriticalSuccess) {
    lines.push(`${FORMAT.playEmoji} ${FORMAT.starEmoji} 大成功 ${FORMAT.playEmoji}`);
  } else if (result.isCriticalFailure) {
    lines.push(`${FORMAT.playEmoji} ${FORMAT.explosionEmoji} 大失败 ${FORMAT.playEmoji}`);
  }
  lines.push(`最终点数: 【${result.total}】`);

  return lines.join('\n');
}

/**
 * 格式化先攻列表
 * @param data 先攻数据
 * @returns 格式化后的字符串
 */
export function formatInitiativeList(data: InitiativeData): string {
  if (data.entries.length === 0) {
    return `${FORMAT.clipboardEmoji} 先攻列表为空，请先使用 .ri 投掷先攻`;
  }

  const sorted = getSortedInitiativeList(data);
  const lines: string[] = [
    `${FORMAT.clipboardEmoji} 先攻列表`,
    FORMAT.doubleSeparator,
  ];

  for (let i = 0; i < sorted.length; i++) {
    let marker = '';
    if (data.roundStarted && data.turnIndex === i) {
      marker = ` ${FORMAT.playEmoji} 当前`;
    }
    lines.push(`${i + 1}. ${sorted[i].name} - ${sorted[i].value}${marker}`);
  }

  lines.push(FORMAT.doubleSeparator);
  lines.push(`共 ${sorted.length} 名角色`);

  return lines.join('\n');
}

/**
 * 获取排序后的先攻列表
 * @param data 先攻数据
 * @returns 按先攻值降序排列的列表
 */
export function getSortedInitiativeList(data: InitiativeData) {
  return data.entries.slice().sort((a, b) => b.value - a.value);
}

/**
 * 获取先攻数据
 * @param groupId 群组ID
 * @returns 先攻数据
 */
export function getInitiativeData(groupId: string): InitiativeData {
  const raw = (seal.ext.find('cpr') as any)?.storageGet(`init_${groupId}`);
  if (!raw) {
    return { entries: [], turnIndex: -1, roundStarted: false };
  }
  try {
    return JSON.parse(raw);
  } catch {
    return { entries: [], turnIndex: -1, roundStarted: false };
  }
}

/**
 * 保存先攻数据
 * @param groupId 群组ID
 * @param data 先攻数据
 */
export function saveInitiativeData(groupId: string, data: InitiativeData): void {
  (seal.ext.find('cpr') as any)?.storageSet(`init_${groupId}`, JSON.stringify(data));
}
