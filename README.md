# Cyberpunk Red 海豹骰扩展

[![GitHub release](https://img.shields.io/github/v/release/MacMillan1225/sealdice-js-ext-cyberpunkred)](https://github.com/MacMillan1225/sealdice-js-ext-cyberpunkred/releases)
[![GitHub downloads](https://img.shields.io/github/downloads/MacMillan1225/sealdice-js-ext-cyberpunkred/total)](https://github.com/MacMillan1225/sealdice-js-ext-cyberpunkred/releases)
[![GitHub license](https://img.shields.io/github/license/MacMillan1225/sealdice-js-ext-cyberpunkred)](https://github.com/MacMillan1225/sealdice-js-ext-cyberpunkred/blob/main/LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/MacMillan1225/sealdice-js-ext-cyberpunkred)](https://github.com/MacMillan1225/sealdice-js-ext-cyberpunkred/stargazers)

## 简介

这是一个为 [海豹骰子](https://github.com/sealdice/sealdice-core) 开发的 **Cyberpunk Red** TRPG 规则扩展。

本扩展提供完整的 Cyberpunk Red 检定系统、先攻管理和网络空间生成功能，让你在 QQ 群中流畅跑团。

## 项目背景

Cyberpunk Red 是一款经典的赛博朋克题材 TRPG，其检定机制（属性+技能+1d10）和复杂的技能体系需要频繁投骰。本扩展将 Cyberpunk Red 的核心规则搬到 QQ 群聊中，减轻 KP 和玩家的手动计算负担。

## 安装方式

### 方式一：从 Release 下载（推荐）

1. 前往 [Releases 页面](https://github.com/MacMillan1225/sealdice-js-ext-cyberpunkred/releases)
2. 下载最新版本的 `sealdice-js-ext-cyberpunkred.js` 文件
3. 打开海豹骰子的 **插件管理** 面板
4. 点击 **添加插件**，选择下载的 `.js` 文件
5. 插件加载后，切换规则至 Cyberpunk Red 即可使用

### 方式二：从源码编译

```bash
git clone https://github.com/MacMillan1225/sealdice-js-ext-cyberpunkred.git
cd sealdice-js-ext-cyberpunkred
npm install
npm run build
```

编译产物在 `dist/` 目录下。

## 可用指令

### 检定 `.rc`

| 格式 | 说明 |
|------|------|
| `.rc <属性>` | 属性 + 1d10 |
| `.rc <技能>` | 对应属性 + 技能 + 1d10 |
| `.rc <表达式>` | 如 `专注力+智力+3d10` |
| `.rc #N <表达式>` | 重复投掷 N 次 |
| `.rc <表达式> @用户` | 代骰 |

**检定规则**：
- 属性 + 技能 + 1d10
- 掷出 **10** → 大成功，追加 1d10 加入总点数
- 掷出 **1** → 大失败，追加 1d10 从总点数扣除

**示例**：
```
.rc 意志          → 意志 + 1d10
.rc 专注力        → 意志 + 专注力 + 1d10 (自动识别技能对应属性)
.rc 专注力+智力    → 专注力 + 智力 + 1d10
.rc #3 专注力     → 重复 3 次
.rc 意志 @张三    → 使用张三的角色卡代骰
```

### 先攻投掷 `.ri`

| 格式 | 说明 |
|------|------|
| `.ri` | 使用角色卡的反应值投掷 |
| `.ri <反应值>` | 指定反应值投掷 |
| `.ri <反应值> <角色名>` | 指定反应值和角色名 |

**先攻规则**：反应 + 1d10

### 先攻管理 `.init`

| 格式 | 说明 |
|------|------|
| `.init` | 查看先攻列表 |
| `.init set <数值> <角色名>` | 手动设置先攻 |
| `.init clr` | 清空先攻列表 |
| `.init nt` | 推进到下一个行动回合 |

### 网络空间构建 `.netr`

| 格式 | 说明 |
|------|------|
| `.netr 基础` | 生成基础难度（DV6）网络空间 |
| `.netr 标准` | 生成标准难度（DV8）网络空间 |
| `.netr 罕见` | 生成罕见难度（DV10）网络空间 |
| `.netr 高级` | 生成高级难度（DV12）网络空间 |

> 网络空间示意图通过私聊发送，只有指令发起者可见。

## 支持的属性与技能

### 基本属性

智力、反应、敏捷、技术、酷、意志、幸运、移动、体魄、共情

> 支持英文别名，如 `INT`、`REF`、`DEX` 等。

### 技能列表（部分）

| 类别 | 技能 |
|------|------|
| 感知 | 专注力、觉察、追踪、藏匿/搜寻物品 |
| 体魄 | 运动、柔术、忍耐、潜行 |
| 驾驶 | 驾驶地面/飞行/水上载具、骑乘 |
| 战斗 | 徒手搏斗、闪避、武术、近战武器、手枪、自动武器 |
| 社交 | 交谈、察言观色、说服、街头智慧、交易 |
| 技术 | 基础技术、赛博技术、电子/安防技术、急救、医疗、武器技术 |

> 完整技能列表（含英文别名）请参见 `src/skills.ts`。

## 开发指南

### 项目结构

```
src/
├── index.ts          # 入口，注册扩展和指令
├── config.ts         # 常量和配置
├── template.ts       # CPR 规则模板
├── skills.ts         # 技能-属性映射
├── utils.ts          # 工具函数
├── types.ts          # 类型定义
└── commands/
    ├── rc.ts         # 检定指令
    ├── ri.ts         # 先攻投掷
    ├── init.ts       # 先攻管理
    └── netr.ts       # 网络空间构建
```

### 本地调试

```bash
npm run build-dev
node ./dev/sealdice-js-ext.js
```

### 开发参考

- [海豹骰子 JS 插件文档](https://github.com/sealdice/javascript)
- [Cyberpunk Red 官方规则](https://rtalsoriangames.com/cyberpunk/)

## 许可证

[MIT](LICENSE)
