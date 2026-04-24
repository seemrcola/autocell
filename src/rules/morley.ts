import type { Automaton } from "../types";

export const Morley: Automaton = [
  {
    desc: 'dead',
    transitions: {
      "53": 1,
      "26": 1,
      "08": 1,
    },
    default: 0,
    color: "#08141a",
  },
  {
    desc: 'alive',
    transitions: {
      "62": 1,
      "44": 1,
      "35": 1,
    },
    default: 0,
    color: "#ff6b57",
  }
];
