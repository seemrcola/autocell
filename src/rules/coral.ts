import type { Automaton } from "../types";

export const Coral: Automaton = [
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
      "44": 1,
      "35": 1,
      "26": 1,
      "17": 1,
      "08": 1,
    },
    default: 0,
    color: "#ff6b57",
  },
];
