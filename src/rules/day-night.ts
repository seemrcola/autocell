import type { Automaton } from "../types";

export const DayAndNight: Automaton = [
  {
    desc: "dead",
    transitions: {
      "53": 1,
      "26": 1,
      "17": 1,
      "08": 1,
    },
    default: 0,
    color: "#08141a",
  },
  {
    desc: "alive",
    transitions: {
      "53": 1,
      "44": 1,
      "26": 1,
      "17": 1,
      "08": 1,
    },
    default: 0,
    color: "#ff6b57",
  },
];
