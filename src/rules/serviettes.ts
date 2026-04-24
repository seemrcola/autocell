import type { Automaton } from "../types";

export const Serviettes: Automaton = [
  {
    desc: "dead",
    transitions: {
      "62": 1,
      "53": 1,
      "44": 1,
    },
    default: 0,
    color: "#08141a",
  },
  {
    desc: "alive",
    transitions: {},
    default: 0,
    color: "#ff6b57",
  },
];
