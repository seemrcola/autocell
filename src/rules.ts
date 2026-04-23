import type { Automaton } from "./types";
export { 
  GAME_OF_LIFE, 
  DIAMOEBA, 
  Maze, 
  Mazectric,
  HighLife,
  Seeds
}

// 康威生命游戏
const GAME_OF_LIFE: Automaton = [
  // dead
  {
    transitions: {
      "53": 1,
    },
    default: 0,
    color: "#08141a",
  },
  {
    transitions: {
      "62": 1,
      "53": 1,
    },
    default: 0,
    color: "#ff6b57",
  },
];

// Diamoeba 钻石变形虫
const DIAMOEBA: Automaton = [
  // dead
  {
    transitions: {
      "53": 1,
      "35": 1,
      "26": 1,
      "17": 1,
      "08": 1,
    },
    default: 0,
    color: "#08141a",
  },
  // alive
  {
    transitions: {
      "35": 1,
      "26": 1,
      "17": 1,
      "08": 1,
    },
    default: 0,
    color: "#ff6b57",
  },
];

// 迷宫
const Maze: Automaton = [
  // dead
  {
    transitions: {
      "53": 1,
    },
    default: 0,
    color: "#08141a",
  },
  // alive
  {
    transitions: {
      "71": 1,
      "62": 1,
      "53": 1,
      "44": 1,
    },
    default: 0,
    color: "#ff6b57",
  },
];

// 细腻迷宫
const Mazectric: Automaton = [
  // dead
  {
    transitions: {
      "53": 1,
    },
    default: 0,
    color: "#08141a",
  },
  {
    transitions: {
      "71": 1,
      "62": 1,
      "53": 1,
    },
    default: 0,
    color: "#ff6b57",
  }
]

// 高阶生命
const HighLife: Automaton = [
  // dead
  {
    transitions: {
      "53": 1,
      "26": 1,
    },
    default: 0,
    color: "#08141a",
  },
  // alive
  {
    transitions: {
      "62": 1,
      "53": 1,
    },
    default: 0,
    color: "#ff6b57",
  },
]

// 种子
const Seeds: Automaton = [
  // dead
  {
    transitions: {
      "62": 1,
    },
    default: 0,
    color: "#08141a",
  },
  // alive
  {
    transitions: {},
    default: 0,
    color: "#ff6b57",
  },
]
