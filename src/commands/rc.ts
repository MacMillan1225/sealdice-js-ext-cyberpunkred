/**
 * CPR 检定指令 (.rc)
 * 
 * 指令格式: .rc <属性> <技能>
 * 投点规则: 属性 + 技能 + 1d10
 * 大成功: d10 掷出 10 → 再掷 1d10 加到总点数
 * 大失败: d10 掷出 1 → 再掷 1d10 从总点数减去
 */

import { SealContext, SealCmdArgs, CheckResult } from '../types';
import { rollD10, getAttrValue, formatCheckResult } from '../utils';

/**
 * 创建检定指令
 * @returns 检定指令对象
 */
export function createRcCommand() {
  const cmdRC = seal.ext.newCmdItemInfo();
  cmdRC.name = 'rc';
  cmdRC.help = `CPR 检定，格式: .rc <属性> <技能>
属性和技能可缺省，自动从角色卡读取
示例:
  .rc 反应 手枪  → 反应 + 手枪 + 1d10
  .rc 反应       → 反应 + 0 + 1d10
  .rc            → 从角色卡读取默认属性`;

  cmdRC.solve = function (ctx: SealContext, msg: any, cmdArgs: SealCmdArgs) {
    const val = cmdArgs.getArgN(1);
    if (val === 'help' || val === '帮助') {
      const ret = seal.ext.newCmdExecuteResult(true);
      ret.showHelp = true;
      return ret;
    }

    const attrName = cmdArgs.getArgN(1) || '反应';
    const skillName = cmdArgs.getArgN(2) || '';

    const [attrValue, attrExists] = getAttrValue(ctx, attrName, 0);
    if (!attrExists && attrName !== '') {
      console.log(`[CPR] 属性 "${attrName}" 未在角色卡中找到，使用默认值 0`);
    }

    let skillValue = 0;
    if (skillName !== '') {
      const [sv, skillExists] = getAttrValue(ctx, skillName, 0);
      skillValue = sv;
      if (!skillExists) {
        console.log(`[CPR] 技能 "${skillName}" 未在角色卡中找到，使用默认值 0`);
      }
    }

    const d10Result = rollD10();
    const isCriticalSuccess = (d10Result === 10);
    const isCriticalFailure = (d10Result === 1);

    let bonusRoll: number | null = null;
    if (isCriticalSuccess) {
      bonusRoll = rollD10();
    } else if (isCriticalFailure) {
      bonusRoll = rollD10();
    }

    let total = attrValue + skillValue + d10Result;
    if (isCriticalSuccess && bonusRoll !== null) {
      total += bonusRoll;
    } else if (isCriticalFailure && bonusRoll !== null) {
      total -= bonusRoll;
    }

    const result: CheckResult = {
      attrName,
      attrValue,
      skillName: skillName || '无',
      skillValue,
      d10Result,
      bonusRoll,
      isCriticalSuccess,
      isCriticalFailure,
      total,
    };

    const output = formatCheckResult(result);
    seal.replyToSender(ctx as any, msg, output);
    return seal.ext.newCmdExecuteResult(true);
  };

  return cmdRC;
}
