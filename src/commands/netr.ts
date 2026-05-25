/**
 * CPR 网络空间构建指令 (.netr)
 *
 * 指令格式:
 *   .netr <难度>        → 生成网络空间示意图
 *   .netr help          → 显示帮助
 *
 * 难度等级:
 *   基础/标准/罕见/高级
 *   basic/standard/rare/advanced
 *
 * 默认只有命令发起者可见（私聊回复）
 */

import { SealContext, SealCmdArgs } from '../types';
import { rollD10, rollD6 } from '../utils';
import { FORMAT } from '../config';

/** 难度等级 */
type Difficulty = 'basic' | 'standard' | 'rare' | 'advanced';

/** 楼层内容类型 */
interface FloorContent {
  type: 'file' | 'password' | 'control' | 'program' | 'demon';
  name: string;
  dv?: number;
  detail?: string;
}

/** 楼层数据 */
interface Floor {
  index: number;
  content: FloorContent;
  branchFloors?: Floor[];  // 分支楼层
}

/** 网络空间数据 */
interface NetSpace {
  difficulty: Difficulty;
  totalFloors: number;
  mainFloors: Floor[];
  branches: { fromFloor: number; floors: Floor[] }[];
}

/** 大厅楼层表（前两层） */
const LOBBY_TABLE: FloorContent[] = [
  { type: 'file', name: '文件', dv: 6 },
  { type: 'password', name: '密码', dv: 6 },
  { type: 'password', name: '密码', dv: 8 },
  { type: 'program', name: '臭鼬' },
  { type: 'program', name: '鬼火' },
  { type: 'program', name: '杀手' },
];

/** 难度对应的DV值 */
const DIFFICULTY_DV: Record<Difficulty, number> = {
  basic: 6,
  standard: 8,
  rare: 10,
  advanced: 12,
};

/** 其余楼层表（按难度） */
const FLOOR_TABLES: Record<Difficulty, { roll: number; content: FloorContent[] }[]> = {
  basic: [
    { roll: 3, content: [{ type: 'demon', name: '地狱犬' }] },
    { roll: 4, content: [{ type: 'program', name: '剑齿虎' }] },
    { roll: 5, content: [{ type: 'program', name: '渡鸦' }, { type: 'program', name: '渡鸦' }] },
    { roll: 6, content: [{ type: 'demon', name: '地狱犬' }] },
    { roll: 7, content: [{ type: 'program', name: '鬼火' }] },
    { roll: 8, content: [{ type: 'program', name: '渡鸦' }] },
    { roll: 9, content: [{ type: 'password', name: '密码', dv: 6 }] },
    { roll: 10, content: [{ type: 'file', name: '文件', dv: 6 }] },
    { roll: 11, content: [{ type: 'control', name: '控制节点', dv: 6 }] },
    { roll: 12, content: [{ type: 'password', name: '密码', dv: 6 }] },
    { roll: 13, content: [{ type: 'program', name: '臭鼬' }] },
    { roll: 14, content: [{ type: 'program', name: '蝰蛇' }] },
    { roll: 15, content: [{ type: 'program', name: '蝎子' }] },
    { roll: 16, content: [{ type: 'program', name: '杀手' }, { type: 'program', name: '臭鼬' }] },
    { roll: 17, content: [{ type: 'program', name: '鬼火' }, { type: 'program', name: '鬼火' }, { type: 'program', name: '鬼火' }] },
    { roll: 18, content: [{ type: 'demon', name: '巫妖' }] },
  ],
  standard: [
    { roll: 3, content: [{ type: 'demon', name: '地狱犬' }, { type: 'demon', name: '地狱犬' }] },
    { roll: 4, content: [{ type: 'demon', name: '地狱犬' }, { type: 'program', name: '杀手' }] },
    { roll: 5, content: [{ type: 'program', name: '臭鼬' }, { type: 'program', name: '臭鼬' }] },
    { roll: 6, content: [{ type: 'program', name: '剑齿虎' }] },
    { roll: 7, content: [{ type: 'program', name: '蝎子' }] },
    { roll: 8, content: [{ type: 'demon', name: '地狱犬' }] },
    { roll: 9, content: [{ type: 'password', name: '密码', dv: 8 }] },
    { roll: 10, content: [{ type: 'file', name: '文件', dv: 8 }] },
    { roll: 11, content: [{ type: 'control', name: '控制节点', dv: 8 }] },
    { roll: 12, content: [{ type: 'password', name: '密码', dv: 8 }] },
    { roll: 13, content: [{ type: 'program', name: '蝰蛇' }] },
    { roll: 14, content: [{ type: 'program', name: '杀手' }] },
    { roll: 15, content: [{ type: 'demon', name: '巫妖' }] },
    { roll: 16, content: [{ type: 'program', name: '蝰蛇' }] },
    { roll: 17, content: [{ type: 'program', name: '渡鸦' }, { type: 'program', name: '渡鸦' }, { type: 'program', name: '渡鸦' }] },
    { roll: 18, content: [{ type: 'demon', name: '巫妖' }, { type: 'program', name: '渡鸦' }] },
  ],
  rare: [
    { roll: 3, content: [{ type: 'demon', name: '海怪' }] },
    { roll: 4, content: [{ type: 'demon', name: '地狱犬' }, { type: 'program', name: '蝎子' }] },
    { roll: 5, content: [{ type: 'demon', name: '地狱犬' }, { type: 'program', name: '杀手' }] },
    { roll: 6, content: [{ type: 'program', name: '渡鸦' }, { type: 'program', name: '渡鸦' }] },
    { roll: 7, content: [{ type: 'program', name: '剑齿虎' }] },
    { roll: 8, content: [{ type: 'demon', name: '地狱犬' }] },
    { roll: 9, content: [{ type: 'password', name: '密码', dv: 10 }] },
    { roll: 10, content: [{ type: 'file', name: '文件', dv: 10 }] },
    { roll: 11, content: [{ type: 'control', name: '控制节点', dv: 10 }] },
    { roll: 12, content: [{ type: 'password', name: '密码', dv: 10 }] },
    { roll: 13, content: [{ type: 'program', name: '杀手' }] },
    { roll: 14, content: [{ type: 'demon', name: '巫妖' }] },
    { roll: 15, content: [{ type: 'demon', name: '龙' }] },
    { roll: 16, content: [{ type: 'program', name: '蝰蛇' }, { type: 'program', name: '渡鸦' }] },
    { roll: 17, content: [{ type: 'demon', name: '龙' }, { type: 'program', name: '鬼火' }] },
    { roll: 18, content: [{ type: 'demon', name: '巨人' }] },
  ],
  advanced: [
    { roll: 3, content: [{ type: 'demon', name: '地狱犬' }, { type: 'demon', name: '地狱犬' }, { type: 'demon', name: '地狱犬' }] },
    { roll: 4, content: [{ type: 'program', name: '蝰蛇' }, { type: 'program', name: '蝰蛇' }] },
    { roll: 5, content: [{ type: 'demon', name: '地狱犬' }, { type: 'demon', name: '巫妖' }] },
    { roll: 6, content: [{ type: 'program', name: '鬼火' }, { type: 'program', name: '鬼火' }, { type: 'program', name: '鬼火' }] },
    { roll: 7, content: [{ type: 'demon', name: '地狱犬' }, { type: 'program', name: '剑齿虎' }] },
    { roll: 8, content: [{ type: 'demon', name: '海怪' }] },
    { roll: 9, content: [{ type: 'password', name: '密码', dv: 12 }] },
    { roll: 10, content: [{ type: 'file', name: '文件', dv: 12 }] },
    { roll: 11, content: [{ type: 'control', name: '控制节点', dv: 12 }] },
    { roll: 12, content: [{ type: 'password', name: '密码', dv: 12 }] },
    { roll: 13, content: [{ type: 'demon', name: '巨人' }] },
    { roll: 14, content: [{ type: 'demon', name: '龙' }] },
    { roll: 15, content: [{ type: 'program', name: '杀手' }, { type: 'program', name: '蝎子' }] },
    { roll: 16, content: [{ type: 'demon', name: '海怪' }] },
    { roll: 17, content: [{ type: 'program', name: '渡鸦' }, { type: 'program', name: '鬼火' }, { type: 'demon', name: '地狱犬' }] },
    { roll: 18, content: [{ type: 'demon', name: '龙' }, { type: 'demon', name: '龙' }] },
  ],
};

/** 难度名称映射 */
const DIFFICULTY_NAMES: Record<Difficulty, string> = {
  basic: '基础',
  standard: '标准',
  rare: '罕见',
  advanced: '高级',
};

/**
 * 投掷3d6
 * @returns 3-18的随机数
 */
function roll3d6(): number {
  return rollD6() + rollD6() + rollD6();
}

/**
 * 解析难度参数
 * @param arg 参数字符串
 * @returns 难度等级
 */
function parseDifficulty(arg: string): Difficulty | null {
  const normalized = arg.toLowerCase().trim();
  const mapping: Record<string, Difficulty> = {
    '基础': 'basic',
    'basic': 'basic',
    '标准': 'standard',
    'standard': 'standard',
    '罕见': 'rare',
    'rare': 'rare',
    '高级': 'advanced',
    'advanced': 'advanced',
  };
  return mapping[normalized] || null;
}

/**
 * 从表格中随机选择内容
 * @param table 楼层表
 * @param roll 投掷结果
 * @returns 楼层内容
 */
function getContentFromTable(table: { roll: number; content: FloorContent[] }[], roll: number): FloorContent[] {
  const entry = table.find(e => e.roll === roll);
  return entry ? entry.content : [{ type: 'program', name: '未知' }];
}

/**
 * 生成网络空间
 * @param difficulty 难度等级
 * @returns 网络空间数据
 */
function generateNetSpace(difficulty: Difficulty): NetSpace {
  // 第1步：掷3d6确定总楼层数
  const totalFloors = roll3d6();

  // 分支判定
  const branches: { fromFloor: number; floors: Floor[] }[] = [];
  let branchRoll = rollD10();
  while (branchRoll >= 7) {
    // 确定分支位置（主干第二层之后）
    const fromFloor = Math.max(3, Math.floor(Math.random() * (totalFloors - 2)) + 2);
    const branchLength = Math.max(1, Math.floor(Math.random() * 3) + 1); // 1-3层分支

    const branchFloors: Floor[] = [];
    for (let i = 0; i < branchLength; i++) {
      const roll = roll3d6();
      const content = getContentFromTable(FLOOR_TABLES[difficulty], roll);
      branchFloors.push({
        index: i + 1,
        content: content[0], // 取第一个内容
      });
    }

    branches.push({ fromFloor, floors: branchFloors });

    // 继续判定是否有更多分支
    branchRoll = rollD10();
  }

  // 第2步：填充主干楼层
  const mainFloors: Floor[] = [];
  for (let i = 1; i <= totalFloors; i++) {
    let content: FloorContent;

    if (i <= 2) {
      // 前两层查大厅表
      const lobbyRoll = Math.floor(Math.random() * 6) + 1;
      content = LOBBY_TABLE[lobbyRoll - 1];
    } else {
      // 其余楼层按难度查对应表
      const floorRoll = roll3d6();
      const contents = getContentFromTable(FLOOR_TABLES[difficulty], floorRoll);
      content = contents[0]; // 取第一个内容
    }

    mainFloors.push({ index: i, content });
  }

  return {
    difficulty,
    totalFloors,
    mainFloors,
    branches,
  };
}

/**
 * 格式化楼层内容
 * @param content 楼层内容
 * @returns 格式化字符串
 */
function formatContent(content: FloorContent): string {
  switch (content.type) {
    case 'file':
      return `📄 ${content.name} DV${content.dv}`;
    case 'password':
      return `🔒 ${content.name} DV${content.dv}`;
    case 'control':
      return `🎮 ${content.name} DV${content.dv}`;
    case 'program':
      return `👾 ${content.name}`;
    case 'demon':
      return `👹 ${content.name}`;
    default:
      return content.name;
  }
}

/**
 * 绘制网络空间示意图
 * @param netSpace 网络空间数据
 * @returns 字符示意图
 */
function drawNetSpace(netSpace: NetSpace): string {
  const lines: string[] = [];
  const { difficulty, totalFloors, mainFloors, branches } = netSpace;

  // 标题
  lines.push(`${FORMAT.diceEmoji} 网络空间示意图`);
  lines.push(FORMAT.separator);
  lines.push(`难度: ${DIFFICULTY_NAMES[difficulty]} | 总楼层: ${totalFloors}`);
  lines.push(FORMAT.separator);
  lines.push('');

  // 找到所有分支点
  const branchPoints = new Map<number, { fromFloor: number; floors: Floor[] }[]>();
  for (const branch of branches) {
    if (!branchPoints.has(branch.fromFloor)) {
      branchPoints.set(branch.fromFloor, []);
    }
    branchPoints.get(branch.fromFloor)!.push(branch);
  }

  // 绘制主干
  for (let i = 0; i < mainFloors.length; i++) {
    const floor = mainFloors[i];
    const floorNum = String(floor.index).padStart(2, ' ');
    const contentStr = formatContent(floor.content);

    // 检查是否有分支
    const branchesAtFloor = branchPoints.get(floor.index);
    if (branchesAtFloor && branchesAtFloor.length > 0) {
      // 有分支的楼层
      lines.push(`[${floorNum}] ${contentStr} ──┬─`);

      // 绘制分支
      for (let b = 0; b < branchesAtFloor.length; b++) {
        const branch = branchesAtFloor[b];
        const isLastBranch = b === branchesAtFloor.length - 1;

        for (let j = 0; j < branch.floors.length; j++) {
          const branchFloor = branch.floors[j];
          const branchContent = formatContent(branchFloor.content);
          const branchNum = `B${b + 1}-${branchFloor.index}`;

          if (j === 0) {
            // 分支第一层
            lines.push(`     ${isLastBranch ? '└' : '├'}─ [${branchNum}] ${branchContent}`);
          } else {
            // 分支后续层
            lines.push(`     ${isLastBranch ? ' ' : '│'}   [${branchNum}] ${branchContent}`);
          }
        }
      }
    } else {
      // 普通楼层
      lines.push(`[${floorNum}] ${contentStr}`);
    }

    // 楼层之间的连接线（除了最后一层）
    if (i < mainFloors.length - 1) {
      const hasBranch = branchPoints.has(floor.index);
      if (hasBranch) {
        lines.push(`     │`);
      } else {
        lines.push(`     │`);
      }
    }
  }

  lines.push('');
  lines.push(FORMAT.separator);

  // 图例
  lines.push('图例:');
  lines.push('📄 文件 | 🔒 密码 | 🎮 控制节点 | 👾 程序 | 👹 恶魔');
  lines.push(`DV: 鉴识/后门/控制难度值`);
  lines.push(`B1-1: 分支1第1层`);

  return lines.join('\n');
}

/**
 * 创建网络空间构建指令
 * @returns 网络空间构建指令对象
 */
export function createNetrCommand() {
  const cmdNetr = seal.ext.newCmdItemInfo();
  cmdNetr.name = 'netr';
  cmdNetr.help = `CPR 网络空间构建
格式:
  .netr <难度>        → 生成网络空间示意图
  .netr help          → 显示帮助

难度等级:
  基础/basic         → DV6
  标准/standard      → DV8
  罕见/rare          → DV10
  高级/advanced      → DV12

示例:
  .netr 基础         → 生成基础难度网络空间
  .netr standard     → 生成标准难度网络空间

说明:
  默认只有命令发起者可见（私聊回复）
  网络空间按照赛博朋克红核心规则构建`;

  cmdNetr.solve = function (ctx: SealContext, msg: any, cmdArgs: SealCmdArgs) {
    const val = cmdArgs.getArgN(1);
    if (val === 'help' || val === '帮助') {
      const ret = seal.ext.newCmdExecuteResult(true);
      ret.showHelp = true;
      return ret;
    }

    // 解析难度参数
    const difficultyArg = cmdArgs.getArgN(1);
    if (!difficultyArg) {
      seal.replyToSender(ctx as any, msg, `${FORMAT.warningEmoji} 请指定难度等级\n\n用法: .netr <难度>\n难度: 基础/标准/罕见/高级`);
      return seal.ext.newCmdExecuteResult(true);
    }

    const difficulty = parseDifficulty(difficultyArg);
    if (!difficulty) {
      seal.replyToSender(ctx as any, msg, `${FORMAT.crossMarkEmoji} 无效的难度等级: ${difficultyArg}\n\n可用难度: 基础/标准/罕见/高级`);
      return seal.ext.newCmdExecuteResult(true);
    }

    // 生成网络空间
    const netSpace = generateNetSpace(difficulty);

    // 绘制示意图
    const diagram = drawNetSpace(netSpace);

    // 私聊回复（只有发起者可见）
    seal.replyPerson(ctx as any, msg, diagram);

    // 在群里发送提示
    seal.replyToSender(ctx as any, msg, `${FORMAT.checkMarkEmoji} 网络空间示意图已生成，请查看私聊`);

    return seal.ext.newCmdExecuteResult(true);
  };

  return cmdNetr;
}
