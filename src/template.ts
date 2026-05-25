/**
 * CPR 规则模板定义
 */

import { CPR_TEMPLATE } from './config';

/**
 * 注册 CPR 规则模板
 */
export function registerTemplate(): void {
  try {
    seal.gameSystem.newTemplate(JSON.stringify(CPR_TEMPLATE));
  } catch (e) {
    console.log('[CPR] 注册规则模板失败:', e);
  }
}
