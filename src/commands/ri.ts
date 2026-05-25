/**
 * CPR 先攻投掷指令 (.ri)
 * 
 * 指令格式: .ri [反应] [角色名]
 * 先攻规则: 反应 + 1d10
 */

import { SealContext, SealCmdArgs } from '../types';
import { rollD10, getAttrValue, getCharacterName, getInitiativeData, saveInitiativeData } from '../utils';
import { FORMAT } from '../config';

/**
 * 创建先攻投掷指令
 * @returns 先攻投掷指令对象
 */
export function createRiCommand() {
  const cmdRI = seal.ext.newCmdItemInfo();
  cmdRI.name = 'ri';
  cmdRI.help = `投掷先攻，格式: .ri [反应] [角色名]
先攻 = 反应 + 1d10
示例:
  .ri              → 从角色卡读取反应和角色名
  .ri 8            → 使用反应8和绑定角色名
  .ri 8 银手       → 使用反应8和角色名"银手"`;

  cmdRI.solve = function (ctx: SealContext, msg: any, cmdArgs: SealCmdArgs) {
    const val = cmdArgs.getArgN(1);
    if (val === 'help' || val === '帮助') {
      const ret = seal.ext.newCmdExecuteResult(true);
      ret.showHelp = true;
      return ret;
    }

    const groupId = ctx.group.groupId;
    let refValue = 0;
    let charName = '';

    const arg1 = cmdArgs.getArgN(1);
    const arg2 = cmdArgs.getArgN(2);

    // 解析参数
    if (arg1 && !isNaN(parseInt(arg1))) {
      // .ri <反应> 或 .ri <反应> <角色名>
      refValue = parseInt(arg1);
      charName = arg2 || ctx.player.name;
    } else if (arg1) {
      // .ri <角色名> (没有反应值)
      const [ref, exists] = getAttrValue(ctx, '反应', 0);
      refValue = ref;
      charName = arg1;
    } else {
      // .ri (无参数)
      const [ref, exists] = getAttrValue(ctx, '反应', 0);
      refValue = ref;
      charName = getCharacterName(ctx);
    }

    // 投掷先攻
    const d10Result = rollD10();
    const total = refValue + d10Result;

    // 更新先攻列表
    const data = getInitiativeData(groupId);

    // 查找是否已存在同名角色
    let found = false;
    for (let i = 0; i < data.entries.length; i++) {
      if (data.entries[i].name === charName) {
        data.entries[i].value = total;
        found = true;
        break;
      }
    }

    if (!found) {
      data.entries.push({ name: charName, value: total });
    }

    // 重置回合状态
    data.turnIndex = -1;
    data.roundStarted = false;

    saveInitiativeData(groupId, data);

    // 输出结果
    const lines = [
      `${FORMAT.swordEmoji} 先攻投掷`,
      FORMAT.separator,
      `${charName}: 反应(${refValue}) + 1d10(${d10Result}) = ${total}`,
    ];

    if (found) {
      lines.push(`${FORMAT.warningEmoji} 已更新先攻数值`);
    }

    lines.push(FORMAT.separator);
    lines.push('先攻已记录');

    seal.replyToSender(ctx as any, msg, lines.join('\n'));
    return seal.ext.newCmdExecuteResult(true);
  };

  return cmdRI;
}
