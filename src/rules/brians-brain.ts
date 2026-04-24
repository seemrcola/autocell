import type { Automaton } from "../types";

export const BriansBrain: Automaton = [
  {
    desc: "ready",
    transitions: {
      "*2*": 1,
    },
    default: 0,
    color: "#08141a",
  },
  {
    desc: "firing",
    transitions: {},
    default: 2,
    color: "#36c5f0",
  },
  {
    desc: "refractory",
    transitions: {},
    default: 0,
    color: "#ff8a3d",
  },
];
