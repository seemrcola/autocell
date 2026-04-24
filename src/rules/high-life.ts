import type { Automaton } from "../types";

export const HighLife: Automaton = [
  {
    desc: 'dead',
    transitions: {
      "53": 1,
      "26": 1,
    },
    default: 0,
    color: "#08141a",
  },
  { 
    desc: 'alive',
    transitions: {
      "62": 1,
      "53": 1,
    },
    default: 0,
    color: "#ff6b57",
  },
];
