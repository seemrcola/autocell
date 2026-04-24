import type { Automaton, Cell, NeighborPattern } from "./types";

export class Board {
  public width: number;
  public height: number;
  public cells: Cell[];

  constructor(width: number, height: number, cell: Cell = 0) {
    this.width = width;
    this.height = height;
    this.cells = Array(width * height).fill(cell);
  }

  get(x: number, y: number): Cell {
    return this.cells[y * this.width + x]!;
  }

  set(x: number, y: number, cell: Cell) {
    this.cells[y * this.width + x] = cell;
  }

  fill(cell: Cell) {
    this.cells.fill(cell);
  }
}

export function countNeighbors(board: Board, states: number, x0: number, y0: number): NeighborPattern {
  const neighbors = Array(states).fill(0);

  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) {
        continue;
      }

      const x = x0 + dx;
      const y = y0 + dy;

      if (x < 0 || x >= board.width || y < 0 || y >= board.height) {
        continue;
      }

      neighbors[board.get(x, y)]! += 1;
    }
  }

  return neighbors.join("");
}

export function matchesNeighborPattern(pattern: NeighborPattern, candidate: NeighborPattern): boolean {
  if (pattern.length !== candidate.length) {
    return false;
  }

  return [...pattern].every((cell, index) => cell === "*" || cell === candidate[index]);
}

export function getNextCell(
  stateTransitions: Record<NeighborPattern, Cell>,
  neighborPattern: NeighborPattern,
  defaultCell: Cell,
): Cell {
  const exactMatch = stateTransitions[neighborPattern];

  if (exactMatch !== undefined) {
    return exactMatch;
  }

  const wildcardMatch = Object.entries(stateTransitions).find(([pattern]) => {
    return pattern.includes("*") && matchesNeighborPattern(pattern, neighborPattern);
  });

  return wildcardMatch?.[1] ?? defaultCell;
}

export function computeNextBoard(automaton: Automaton, current: Board, next: Board) {
  if (current.width !== next.width || current.height !== next.height) {
    throw new Error("[board error] board sizes do not match");
  }

  for (let y = 0; y < current.height; y++) {
    for (let x = 0; x < current.width; x++) {
      const currentCell = current.get(x, y);
      const neighborPattern = countNeighbors(current, automaton.length, x, y);
      const state = automaton[currentCell];

      if (!state) {
        throw new Error(`[automaton error] missing state ${currentCell}`);
      }

      next.set(x, y, getNextCell(state.transitions, neighborPattern, state.default));
    }
  }
}
