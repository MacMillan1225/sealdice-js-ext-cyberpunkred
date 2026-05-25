/**
 * Cyberpunk Red 海豹骰扩展
 * 
 * 主入口文件，负责注册扩展和指令
 */

import { EXT_INFO, CMD_ALIASES } from './config';
import { registerTemplate } from './template';
import { createRcCommand } from './commands/rc';
import { createRiCommand } from './commands/ri';
import { createInitCommand } from './commands/init';
import { createNetrCommand } from './commands/netr';

/**
 * 主函数，初始化扩展
 */
function main() {
  // 注册扩展
  let ext = seal.ext.find(EXT_INFO.name);
  if (!ext) {
    ext = seal.ext.new(EXT_INFO.name, EXT_INFO.author, EXT_INFO.version);
    seal.ext.register(ext);
  }

  // 注册规则模板
  registerTemplate();

  // 创建指令
  const cmdRC = createRcCommand();
  const cmdRI = createRiCommand();
  const cmdInit = createInitCommand();
  const cmdNetr = createNetrCommand();

  // 注册指令（支持别名）
  for (const alias of CMD_ALIASES.rc) {
    ext.cmdMap[alias] = cmdRC;
  }

  for (const alias of CMD_ALIASES.ri) {
    ext.cmdMap[alias] = cmdRI;
  }

  for (const alias of CMD_ALIASES.init) {
    ext.cmdMap[alias] = cmdInit;
  }

  for (const alias of CMD_ALIASES.netr) {
    ext.cmdMap[alias] = cmdNetr;
  }

  console.log('[CPR] Cyberpunk Red 扩展已加载');
}

// 执行主函数
main();
