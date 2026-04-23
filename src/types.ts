export type {
  Cell,
  NeighborPattern,
  AutomatonState,
  Automaton,
}

type Cell = number;
type NeighborPattern = string;

interface AutomatonState {
  color: string;
  default: Cell;
  transitions: Record<NeighborPattern, Cell>;
}

type Automaton = AutomatonState[];
