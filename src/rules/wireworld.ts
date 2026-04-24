import type { Automaton } from "../types";

export const Wireworld: Automaton = [
  {
    desc: "empty",
    transitions: {},
    default: 0,
    color: "#08141a",
  },
  {
    desc: "electron head",
    transitions: {},
    default: 2,
    color: "#36c5f0",
  },
  {
    desc: "electron tail",
    transitions: {},
    default: 3,
    color: "#ff8a3d",
  },
  {
    desc: "conductor",
    transitions: {
      "*1**": 1,
      "*2**": 1,
    },
    default: 3,
    color: "#ffd166",
  },
];
