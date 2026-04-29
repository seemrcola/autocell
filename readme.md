# Autocell 元胞自动机探索

> tsoding https://github.com/rexim

一个用 TypeScript、Canvas 和 Bun 编写的元胞自动机 playground。当前支持康威生命游戏、Maze、HighLife、Brian's Brain、Wireworld 等多种规则，并允许在页面中切换规则和绘制不同状态的细胞。

## 运行

```bash
bun install
bun run dev
```

`bun run dev` 会启动 `index.html`。如果你只想按原始方式运行，也可以执行：

```bash
bun run index.html
```

## 常用命令

```bash
bun run dev        # 启动页面
bun run build      # 构建生产静态文件到 dist/
bun run test       # 运行单元测试
bun run typecheck  # TypeScript 类型检查
```

## 发布到 Vercel

项目已包含 `vercel.json`，Vercel 会执行 `bun run build` 并发布 `dist/` 目录。

### 通过 Vercel Dashboard 发布

1. 把项目推送到 GitHub/GitLab/Bitbucket。
2. 在 Vercel 新建项目并导入仓库。
3. Framework Preset 选择 `Other`。
4. 确认 Build Command 是 `bun run build`，Output Directory 是 `dist`。
5. 点击 Deploy。

### 通过 Vercel CLI 发布

```bash
npm i -g vercel
vercel login
vercel --prod
```

## 页面操作

- 在左侧下拉框选择自动机规则。
- 在“状态色块”里选择要绘制的细胞状态。
- 左键点击画布写入当前选择的状态。
- 右键点击画布擦除为当前规则的默认状态。
- “单步”会推进一代。
- “自动运行”会连续推进。
- “停止”会暂停自动运行。
- “清空”会把棋盘重置为当前规则的默认状态。

## 项目结构

```text
src/
  bootstrap.ts       # DOM 绑定、Canvas 渲染和页面交互
  core.ts            # 元胞自动机核心：Board、邻居统计、规则匹配、下一代计算
  types.ts           # 共享类型
  core.test.ts       # 核心逻辑测试
  rules.test.ts      # 规则定义回归测试
  rules/
    index.ts         # 统一导出规则并生成页面选项
    game-of-life.ts  # 每个规则一个文件
    ...
```

## 规则编码

每个规则是一个 `Automaton`，也就是一组状态。状态数组下标就是细胞状态编号。

```ts
import type { Automaton } from "../types";

export const GAME_OF_LIFE: Automaton = [
  {
    desc: "dead",
    transitions: {
      "53": 1,
    },
    default: 0,
    color: "#08141a",
  },
  {
    desc: "alive",
    transitions: {
      "62": 1,
      "53": 1,
    },
    default: 0,
    color: "#ff6b57",
  },
];
```

字段含义：

- `desc`：状态名称，会显示在左侧状态列表。
- `color`：状态颜色，建议使用合法 CSS 颜色，例如 `#08141a`。
- `default`：当前状态没有命中任何转换规则时，下一代变成的状态。
- `transitions`：邻居模式到下一状态的映射。

邻居模式按状态编号统计周围 8 个邻居。例如二状态规则里，`"53"` 表示周围有 5 个 `0` 状态邻居、3 个 `1` 状态邻居。三状态规则里，`"521"` 表示状态 `0/1/2` 的邻居数量分别是 `5/2/1`。

模式支持 `*` 通配符。例如 Brian's Brain 中的 `"*2*"` 表示无论 ready 和 refractory 邻居各有多少，只要 firing 邻居数量是 2，就匹配。

## 新增规则

1. 在 `src/rules/` 新建一个规则文件，例如 `my-rule.ts`。
2. 从文件中导出一个 `Automaton` 常量。
3. 在 `src/rules/index.ts` 中导入并导出它。
4. 在 `automatonDefinitions` 里添加页面选项。
5. 运行 `bun run test` 和 `bun run typecheck`。

示例：

```ts
// src/rules/my-rule.ts
import type { Automaton } from "../types";

export const MyRule: Automaton = [
  {
    desc: "off",
    transitions: {
      "53": 1,
    },
    default: 0,
    color: "#08141a",
  },
  {
    desc: "on",
    transitions: {},
    default: 0,
    color: "#ff6b57",
  },
];
```
