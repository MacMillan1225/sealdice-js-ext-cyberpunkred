/**
 * CPR 先攻管理指令 (.init)
 * 
 * 指令格式:
 *   .init            → 查看先攻列表
 *   .init set <数值> <角色名> → 设置先攻
 *   .init clr        → 清空先攻列表
 *   .init nt         → 下一个回合
 */

import { SealContext, SealCmdArgs, InitiativeData } from '../types';
import { getInitiativeData, saveInitiativeData, getSortedInitiativeList, formatInitiativeList } from '../utils';
import { FORMAT } from '../config';

/**
 * 创建先攻管理指令
 * @returns 先攻管理指令对象
 */
export function createInitCommand() {
  const cmdInit = seal.ext.newCmdItemInfo();
  cmdInit.name = 'init';
  cmdInit.help = `先攻列表管理
用法:
  .init            → 查看先攻列表
  .init set <数值> <角色名> → 设置先攻
  .init clr        → 清空先攻列表
  .init nt         → 下一个回合`;

  cmdInit.solve = function (ctx: SealContext, msg: any, cmdArgs: SealCmdArgs) {
    const val = cmdArgs.getArgN(1);
    if (val === 'help' || val === '帮助') {
      const ret = seal.ext.newCmdExecuteResult(true);
      ret.showHelp = true;
      return ret;
    }

    const groupId = ctx.group.groupId;
    const subCmd = cmdArgs.getArgN(1);

    // .init - 查看列表
    if (!subCmd) {
      const data = getInitiativeData(groupId);
      seal.replyToSender(ctx as any, msg, formatInitiativeList(data));
      return seal.ext.newCmdExecuteResult(true);
    }

    // .init clr - 清空列表
    if (subCmd === 'clr' || subCmd === 'clear' || subCmd === '清空') {
      saveInitiativeData(groupId, { entries: [], turnIndex: -1, roundStarted: false });
      seal.replyToSender(ctx as any, msg, `${FORMAT.checkMarkEmoji} 先攻列表已清空`);
      return seal.ext.newCmdExecuteResult(true);
    }

    // .init set <数值> <角色名>
    if (subCmd === 'set' || subCmd === '设置') {
      const valueStr = cmdArgs.getArgN(2);
      const charName = cmdArgs.getArgN(3);

      if (!valueStr || isNaN(parseInt(valueStr))) {
        seal.replyToSender(ctx as any, msg, `${FORMAT.crossMarkEmoji} 用法: .init set <数值> <角色名>`);
        return seal.ext.newCmdExecuteResult(true);
      }

      if (!charName) {
        seal.replyToSender(ctx as any, msg, `${FORMAT.crossMarkEmoji} 请指定角色名`);
        return seal.ext.newCmdExecuteResult(true);
      }

      const value = parseInt(valueStr);
      const data = getInitiativeData(groupId);

      // 查找或添加
      let found = false;
      for (let i = 0; i < data.entries.length; i++) {
        if (data.entries[i].name === charName) {
          data.entries[i].value = value;
          found = true;
          break;
        }
      }

      if (!found) {
        data.entries.push({ name: charName, value: value });
      }

      // 重置回合状态
      data.turnIndex = -1;
      data.roundStarted = false;

      saveInitiativeData(groupId, data);
      seal.replyToSender(ctx as any, msg, `${FORMAT.checkMarkEmoji} 已设置 ${charName} 的先攻为 ${value}`);
      return seal.ext.newCmdExecuteResult(true);
    }

    // .init nt - 下一个回合
    if (subCmd === 'nt' || subCmd === 'next' || subCmd === '下一个') {
      const data = getInitiativeData(groupId);

      if (data.entries.length === 0) {
        seal.replyToSender(ctx as any, msg, `${FORMAT.crossMarkEmoji} 先攻列表为空，请先使用 .ri 投掷先攻`);
        return seal.ext.newCmdExecuteResult(true);
      }

      const sorted = getSortedInitiativeList(data);

      if (!data.roundStarted) {
        // 第一次使用，开始战斗轮
        data.roundStarted = true;
        data.turnIndex = 0;
        saveInitiativeData(groupId, data);

        const lines = [
          `${FORMAT.swordEmoji} 战斗轮开始！`,
          FORMAT.doubleSeparator,
          '第 1 回合',
          `${FORMAT.playEmoji} ${sorted[0].name} 的回合开始`,
        ];

        seal.replyToSender(ctx as any, msg, lines.join('\n'));
        return seal.ext.newCmdExecuteResult(true);
      }

      // 推进到下一个
      data.turnIndex++;

      if (data.turnIndex >= sorted.length) {
        // 新的一轮
        data.turnIndex = 0;
        saveInitiativeData(groupId, data);

        const lines = [
          `${FORMAT.swordEmoji} 新的战斗轮！`,
          FORMAT.doubleSeparator,
          `${FORMAT.playEmoji} ${sorted[0].name} 的回合开始`,
        ];

        seal.replyToSender(ctx as any, msg, lines.join('\n'));
        return seal.ext.newCmdExecuteResult(true);
      }

      saveInitiativeData(groupId, data);

      const lines = [
        `${FORMAT.swordEmoji} 下一个行动`,
        FORMAT.doubleSeparator,
        `${FORMAT.playEmoji} ${sorted[data.turnIndex].name} 的回合开始`,
      ];

      seal.replyToSender(ctx as any, msg, lines.join('\n'));
      return seal.ext.newCmdExecuteResult(true);
    }

    // 未知子命令
    seal.replyToSender(ctx as any, msg, `${FORMAT.crossMarkEmoji} 未知命令，使用 .init help 查看帮助`);
    return seal.ext.newCmdExecuteResult(true);
  };

  return cmdInit;
}
