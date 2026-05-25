/**
 * CPR 扩展类型定义
 */

/** 先攻条目 */
export interface InitiativeEntry {
  name: string;
  value: number;
}

/** 先攻数据 */
export interface InitiativeData {
  entries: InitiativeEntry[];
  turnIndex: number;
  roundStarted: boolean;
}

/** 检定结果 */
export interface CheckResult {
  attrName: string;
  attrValue: number;
  skillName: string;
  skillValue: number;
  d10Result: number;
  bonusRoll: number | null;
  isCriticalSuccess: boolean;
  isCriticalFailure: boolean;
  total: number;
}

/** 扩展上下文类型（从seal.d.ts中提取） */
export interface SealContext {
  group: {
    groupId: string;
  };
  player: {
    name: string;
  };
}

/** 命令参数类型 */
export interface SealCmdArgs {
  getArgN(n: number): string;
}

/** 命令执行结果 */
export interface CmdExecuteResult {
  solved: boolean;
  showHelp: boolean;
}
