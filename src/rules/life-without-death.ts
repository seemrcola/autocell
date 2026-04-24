import type { Automaton } from "../types";

export const LifeWithoutDeath: Automaton = [
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
    transitions: {},
    default: 1,
    color: "#ff6b57",
  },
];
