import type { Automaton } from "../types";

export const Mazectric: Automaton = [
  {
    desc: 'dead',
    transitions: {
      "53": 1,
    },
    default: 0,
    color: "#08141a",
  },
  {
    desc: 'alive',
    transitions: {
      "71": 1,
      "62": 1,
      "53": 1,
    },
    default: 0,
    color: "#ff6b57",
  }
];
