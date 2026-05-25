/**
 * CPR 检定指令 (.rc)
 *
 * 指令格式:
 *   .rc <属性>                → 属性 + 1d10
 *   .rc <技能>                → 对应属性 + 技能 + 1d10
 *   .rc <表达式>              → 表达式 + 1d10
 *   .rc #<次数> <表达式>      → 重复投掷多次
 *   .rc <表达式> @<用户>      → 代骰
 *
 * 投点规则: 属性 + 技能 + 1d10
 * 大成功: d10 掷出 10 → 再掷 1d10 加到总点数
 * 大失败: d10 掷出 1 → 再掷 1d10 从总点数减去
 */

import { SealContext, SealCmdArgs, CheckResult } from '../types';
import { rollD10, getAttrValue, formatCheckResult } from '../utils';
import { FORMAT } from '../config';
import { isBaseAttribute, getSkillAttribute, resolveName } from '../skills';

/**
 * 检定详情（用于输出）
 */
interface CheckDetail {
  label: string;
  value: number;
}

/**
 * 执行单次检定
 * @param ctx 海豹上下文
 * @param expr 表达式
 * @returns 检定结果和详情
 */
function executeCheck(
  ctx: SealContext,
  expr: string
): { result: CheckResult; details: CheckDetail[] } {
  const details: CheckDetail[] = [];

  // 解析表达式中的技能/属性名
  // 匹配中文词、英文字母组合
  const tokenPattern = /[\u4e00-\u9fa5a-zA-Z]+/g;
  const tokens = expr.match(tokenPattern) || [];

  let attrValue = 0;
  let skillValue = 0;
  let attrName = '';
  let skillName = '';

  for (const token of tokens) {
    const resolved = resolveName(token);

    if (isBaseAttribute(resolved)) {
      // 是基本属性
      const [val] = getAttrValue(ctx, resolved, 0);
      attrValue += val;
      attrName = resolved;
      details.push({ label: resolved, value: val });
    } else {
      // 尝试作为技能
      const attr = getSkillAttribute(resolved);
      if (attr) {
        // 是技能，获取技能值
        const [skillVal] = getAttrValue(ctx, resolved, 0);
        skillValue += skillVal;
        skillName = resolved;
        details.push({ label: resolved, value: skillVal });

        // 如果还没设置属性，使用技能对应的属性
        if (!attrName) {
          const [attrVal] = getAttrValue(ctx, attr, 0);
          attrValue += attrVal;
          attrName = attr;
          details.push({ label: `${attr}(自动)`, value: attrVal });
        }
      }
    }
  }

  // 如果没有解析到任何属性/技能，默认使用反应
  if (!attrName && details.length === 0) {
    const [val] = getAttrValue(ctx, '反应', 0);
    attrValue = val;
    attrName = '反应';
    details.push({ label: '反应(默认)', value: val });
  }

  // 提取表达式中的数值部分（去掉已解析的名称）
  let numericExpr = expr;
  for (const token of tokens) {
    numericExpr = numericExpr.replace(token, '');
  }

  // 计算额外数值（如 +10, +3d10 等）
  let bonusValue = 0;
  if (numericExpr.trim()) {
    try {
      // 替换 d10 为实际投掷
      let evalExpr = numericExpr.replace(/(\d*)d10/gi, (_, count) => {
        const n = parseInt(count) || 1;
        let sum = 0;
        for (let i = 0; i < n; i++) {
          sum += rollD10();
        }
        return String(sum);
      });
      bonusValue = parseInt(seal.format(ctx, `{${evalExpr}}`)) || 0;
      if (bonusValue !== 0) {
        details.push({ label: '加值', value: bonusValue });
      }
    } catch {
      // 忽略解析错误
    }
  }

  // 投掷 d10
  const d10Result = rollD10();
  const isCriticalSuccess = (d10Result === 10);
  const isCriticalFailure = (d10Result === 1);

  // 大成功/大失败的额外投掷
  let bonusRoll: number | null = null;
  if (isCriticalSuccess) {
    bonusRoll = rollD10();
  } else if (isCriticalFailure) {
    bonusRoll = rollD10();
  }

  // 计算总值
  let total = attrValue + skillValue + bonusValue + d10Result;
  if (isCriticalSuccess && bonusRoll !== null) {
    total += bonusRoll;
  } else if (isCriticalFailure && bonusRoll !== null) {
    total -= bonusRoll;
  }

  // 构建显示名称
  let displayName = attrName;
  if (skillName) {
    displayName = `${attrName}+${skillName}`;
  }
  if (bonusValue !== 0) {
    displayName += bonusValue > 0 ? `+${bonusValue}` : `${bonusValue}`;
  }

  const result: CheckResult = {
    attrName: displayName,
    attrValue: attrValue + skillValue + bonusValue,
    skillName: skillName || '无',
    skillValue,
    d10Result,
    bonusRoll,
    isCriticalSuccess,
    isCriticalFailure,
    total,
  };

  return { result, details };
}

/**
 * 创建检定指令
 * @returns 检定指令对象
 */
export function createRcCommand() {
  const cmdRC = seal.ext.newCmdItemInfo();
  cmdRC.name = 'rc';
  cmdRC.help = `CPR 检定
格式:
  .rc <属性>              → 属性 + 1d10
  .rc <技能>              → 对应属性 + 技能 + 1d10
  .rc <表达式>            → 表达式 + 1d10
  .rc #<次数> <表达式>    → 重复投掷多次
  .rc <表达式> @<用户>    → 代骰

示例:
  .rc 意志                → 意志 + 1d10
  .rc 专注力              → 意志 + 专注力 + 1d10
  .rc 专注力+智力         → 专注力 + 智力 + 1d10
  .rc 专注力+10           → 意志 + 专注力 + 10 + 1d10
  .rc 专注力+3d10         → 意志 + 专注力 + 3d10 + 1d10
  .rc #3 专注力           → 投掷 3 次
  .rc 意志 @Szz           → 使用 Szz 的属性代骰`;

  cmdRC.solve = function (ctx: SealContext, msg: any, cmdArgs: SealCmdArgs) {
    const val = cmdArgs.getArgN(1);
    if (val === 'help' || val === '帮助') {
      const ret = seal.ext.newCmdExecuteResult(true);
      ret.showHelp = true;
      return ret;
    }

    // 获取原始参数
    let rawArgs = cmdArgs.rawArgs || '';

    // 检测代骰 (@用户)
    let delegateUser = '';
    const delegateMatch = rawArgs.match(/@(\S+)/);
    if (delegateMatch) {
      delegateUser = delegateMatch[1];
      rawArgs = rawArgs.replace(/@\S+/, '').trim();
    }

    // 解析重复次数 #N
    let repeatCount = 1;
    let exprStr = rawArgs.trim();
    const repeatMatch = exprStr.match(/^(\d+)#\s+/);
    if (repeatMatch) {
      repeatCount = Math.min(parseInt(repeatMatch[1]), 10);
      exprStr = exprStr.slice(repeatMatch[0].length).trim();
    }

    // 无参数时默认使用反应
    if (!exprStr) {
      exprStr = '反应';
    }

    // 获取代骰上下文
    let targetCtx = ctx;
    if (delegateUser) {
      targetCtx = seal.getCtxProxyFirst(ctx, cmdArgs) || ctx;
    }

    // 执行检定
    if (repeatCount === 1) {
      // 单次检定
      const { result, details } = executeCheck(targetCtx, exprStr);
      const lines: string[] = [];

      // 代骰提示
      if (delegateUser) {
        lines.push(`由<${ctx.player.name}>代骰:`);
      }

      // 检定标题
      lines.push(`${FORMAT.diceEmoji} CPR 检定`);
      lines.push(FORMAT.separator);

      // 属性详情
      const detailStr = details.map(d => `${d.label}(${d.value})`).join(' + ');
      lines.push(`${result.attrName}: ${detailStr}`);

      // 骰子详情
      let diceDetail = `1d10 = ${result.d10Result}`;
      if (result.isCriticalSuccess && result.bonusRoll !== null) {
        diceDetail += ` → ${FORMAT.starEmoji} 大成功！追加 1d10 = ${result.bonusRoll}`;
      } else if (result.isCriticalFailure && result.bonusRoll !== null) {
        diceDetail += ` → ${FORMAT.explosionEmoji} 大失败！追加 1d10 = ${result.bonusRoll}`;
      }
      lines.push(`投骰: ${diceDetail}`);

      // 计算过程
      let calcLine = `总计: ${result.attrValue} + ${result.d10Result}`;
      if (result.isCriticalSuccess && result.bonusRoll !== null) {
        calcLine += ` + ${result.bonusRoll}`;
      } else if (result.isCriticalFailure && result.bonusRoll !== null) {
        calcLine += ` - ${result.bonusRoll}`;
      }
      calcLine += ` = ${result.total}`;
      lines.push(calcLine);

      lines.push(FORMAT.separator);

      // 大成功/大失败提示
      if (result.isCriticalSuccess) {
        lines.push(`${FORMAT.playEmoji} ${FORMAT.starEmoji} 大成功 ${FORMAT.playEmoji}`);
      } else if (result.isCriticalFailure) {
        lines.push(`${FORMAT.playEmoji} ${FORMAT.explosionEmoji} 大失败 ${FORMAT.playEmoji}`);
      }

      lines.push(`最终点数: 【${result.total}】`);

      seal.replyToSender(ctx as any, msg, lines.join('\n'));
    } else {
      // 多次检定
      const results: { result: CheckResult; details: CheckDetail[] }[] = [];
      for (let i = 0; i < repeatCount; i++) {
        results.push(executeCheck(targetCtx, exprStr));
      }

      const lines: string[] = [];

      // 代骰提示
      if (delegateUser) {
        lines.push(`由<${ctx.player.name}>代骰:`);
      }

      lines.push(`${FORMAT.diceEmoji} CPR 检定 × ${repeatCount}`);
      lines.push(FORMAT.separator);

      for (let i = 0; i < results.length; i++) {
        const { result, details } = results[i];

        // 构建简要显示
        const detailStr = details.map(d => `${d.label}(${d.value})`).join('+');
        let line = `${i + 1}. ${detailStr}+1d10(${result.d10Result}) = ${result.total}`;

        if (result.isCriticalSuccess) {
          line += ` ${FORMAT.starEmoji} 大成功(+${result.bonusRoll})`;
        } else if (result.isCriticalFailure) {
          line += ` ${FORMAT.explosionEmoji} 大失败(-${result.bonusRoll})`;
        }

        lines.push(line);
      }

      lines.push(FORMAT.separator);

      // 统计
      const crits = results.filter(r => r.result.isCriticalSuccess).length;
      const fails = results.filter(r => r.result.isCriticalFailure).length;

      let stats = `共 ${repeatCount} 次`;
      if (crits > 0) stats += ` | ${FORMAT.starEmoji} 大成功: ${crits}`;
      if (fails > 0) stats += ` | ${FORMAT.explosionEmoji} 大失败: ${fails}`;
      lines.push(stats);

      seal.replyToSender(ctx as any, msg, lines.join('\n'));
    }

    return seal.ext.newCmdExecuteResult(true);
  };

  return cmdRC;
}
