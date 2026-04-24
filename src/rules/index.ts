import type { AutomatonOption } from "../types";
import { Anneal } from "./anneal";
import { BriansBrain } from "./brians-brain";
import { Coral } from "./coral";
import { DayAndNight } from "./day-night";
import { DIAMOEBA } from "./diamoeba";
import { GAME_OF_LIFE } from "./game-of-life";
import { HighLife } from "./high-life";
import { LifeWithoutDeath } from "./life-without-death";
import { Maze } from "./maze";
import { Mazectric } from "./mazectric";
import { Morley } from "./morley";
import { Replicator } from "./replicator";
import { Seeds } from "./seeds";
import { Serviettes } from "./serviettes";
import { TwoByTwo } from "./two-by-two";
import { Wireworld } from "./wireworld";

export { Anneal } from "./anneal";
export { BriansBrain } from "./brians-brain";
export { Coral } from "./coral";
export { DayAndNight } from "./day-night";
export { DIAMOEBA } from "./diamoeba";
export { GAME_OF_LIFE } from "./game-of-life";
export { HighLife } from "./high-life";
export { LifeWithoutDeath } from "./life-without-death";
export { Maze } from "./maze";
export { Mazectric } from "./mazectric";
export { Morley } from "./morley";
export { Replicator } from "./replicator";
export { Seeds } from "./seeds";
export { Serviettes } from "./serviettes";
export { TwoByTwo } from "./two-by-two";
export { Wireworld } from "./wireworld";

const automatonDefinitions = {
  "game-of-life": {
    name: "康威生命游戏",
    automaton: GAME_OF_LIFE,
  },
  diamoeba: {
    name: "Diamoeba 钻石变形虫",
    automaton: DIAMOEBA,
  },
  maze: {
    name: "迷宫",
    automaton: Maze,
  },
  mazectric: {
    name: "细腻迷宫",
    automaton: Mazectric,
  },
  "high-life": {
    name: "HighLife 高阶生命",
    automaton: HighLife,
  },
  seeds: {
    name: "Seeds 种子",
    automaton: Seeds,
  },
  "day-night": {
    name: "Day & Night 昼与夜",
    automaton: DayAndNight,
  },
  anneal: {
    name: "Anneal 退火",
    automaton: Anneal,
  },
  "two-by-two": {
    name: "2x2",
    automaton: TwoByTwo,
  },
  coral: {
    name: "Coral 珊瑚",
    automaton: Coral,
  },
  replicator: {
    name: "Replicator 复制子",
    automaton: Replicator,
  },
  "life-without-death": {
    name: "Life Without Death 长生不灭",
    automaton: LifeWithoutDeath,
  },
  serviettes: {
    name: "Serviettes 餐巾花",
    automaton: Serviettes,
  },
  "brians-brain": {
    name: "Brian's Brain 布莱恩之脑",
    automaton: BriansBrain,
  },
  wireworld: {
    name: "Wireworld 线世界",
    automaton: Wireworld,
  },
  morley: {
    name: "Morley",
    automaton: Morley,
  },
} satisfies Record<string, Omit<AutomatonOption, "id">>;

export function parseAutomatonOptions(definitions: Record<string, Omit<AutomatonOption, "id">>): AutomatonOption[] {
  return Object.entries(definitions).map(([id, definition]) => ({
    id,
    ...definition,
  }));
}

export const automatonOptions = parseAutomatonOptions(automatonDefinitions);
