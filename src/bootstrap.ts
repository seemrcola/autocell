import type { Automaton, Cell, NeighborPattern } from "./types";
import { GAME_OF_LIFE, DIAMOEBA, Maze, Mazectric, HighLife, Seeds } from "./rules";

const COLS = 160;
const ROWS = 160;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 800;

class Board {
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

function mod(a: number, b: number): number {
  return ((a % b) + b) % b;
}

function countNeighbors(board: Board, states: number, x0: number, y0: number): NeighborPattern {
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

      // 对应的状态增加1
      neighbors[board.get(x, y)]! += 1;
    }
  }

  return neighbors.join("");
}

function computeNextBoard(automaton: Automaton, current: Board, next: Board) {
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

      next.set(x, y, state.transitions[neighborPattern] ?? state.default);
    }
  }
}

function renderGrid(ctx: CanvasRenderingContext2D, board: Board) {
  const cellWidth = ctx.canvas.width / board.width;
  const cellHeight = ctx.canvas.height / board.height;

  ctx.strokeStyle = "rgba(200, 235, 255, 0.08)";
  ctx.lineWidth = 1;

  for (let col = 1; col < board.width; col++) {
    const x = col * cellWidth;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, ctx.canvas.height);
    ctx.stroke();
  }

  for (let row = 1; row < board.height; row++) {
    const y = row * cellHeight;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(ctx.canvas.width, y);
    ctx.stroke();
  }
}

function render(ctx: CanvasRenderingContext2D, automaton: Automaton, board: Board) {
  const cellWidth = ctx.canvas.width / board.width;
  const cellHeight = ctx.canvas.height / board.height;

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  for (let y = 0; y < board.height; y++) {
    for (let x = 0; x < board.width; x++) {
      const cell = board.get(x, y);
      const state = automaton[cell];

      if (!state) {
        throw new Error(`[automaton error] missing render state ${cell}`);
      }

      ctx.fillStyle = state.color;
      ctx.fillRect(
        x * cellWidth + 1,
        y * cellHeight + 1,
        Math.max(0, cellWidth - 1),
        Math.max(0, cellHeight - 1),
      );
    }
  }

  renderGrid(ctx, board);
}

function getCanvasCell(
  canvas: HTMLCanvasElement,
  board: Board,
  event: MouseEvent,
): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const canvasX = (event.clientX - rect.left) * scaleX;
  const canvasY = (event.clientY - rect.top) * scaleY;

  return {
    x: Math.min(board.width - 1, Math.floor(canvasX / (canvas.width / board.width))),
    y: Math.min(board.height - 1, Math.floor(canvasY / (canvas.height / board.height))),
  };
}

function bootstrap() {
  const game = document.querySelector("#game") as HTMLCanvasElement;
  const step = document.querySelector("#step") as HTMLButtonElement;
  const clear = document.querySelector("#clear") as HTMLButtonElement;
  const autoplay = document.querySelector("#autoplay") as HTMLButtonElement;
  const stop = document.querySelector("#stop") as HTMLButtonElement;
  const randomFill = document.querySelector("#random") as HTMLButtonElement;

  const ctx = game.getContext("2d");
  if (!ctx) {
    throw new Error("[canvas error] can not get canvas context");
  }

  if (!autoplay || !stop || !randomFill) {
    throw new Error("[dom error] can not find autoplay controls");
  }

  game.width = CANVAS_WIDTH;
  game.height = CANVAS_HEIGHT;

  const automaton = Maze;
  let currentBoard = new Board(COLS, ROWS, automaton[0]!.default);
  let nextBoard = new Board(COLS, ROWS, automaton[0]!.default);
  let animationFrameId: number | null = null;
  let frameCount = 0;

  const setAutoplayControls = (running: boolean) => {
    autoplay.disabled = running;
    stop.disabled = !running;
  };

  const draw = () => {
    render(ctx, automaton, currentBoard);
  };

  const stepBoard = () => {
    computeNextBoard(automaton, currentBoard, nextBoard);
    [currentBoard, nextBoard] = [nextBoard, currentBoard];
  };

  const stepOnce = () => {
    stepBoard();
    draw();
  };

  const stopAutoplay = () => {
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }

    frameCount = 0;
    setAutoplayControls(false);
  };

  const tick = () => {
    animationFrameId = requestAnimationFrame(tick);
    frameCount += 1;

    if (frameCount < 10) {
      return;
    }

    frameCount = 0;
    stepBoard();
    draw();
  };

  const startAutoplay = () => {
    if (animationFrameId !== null) {
      return;
    }

    frameCount = 0;
    animationFrameId = requestAnimationFrame(tick);
    setAutoplayControls(true);
  };

  const clearBoardState = () => {
    currentBoard.fill(automaton[0]!.default);
    nextBoard.fill(automaton[0]!.default);
    draw();
  };

  const fillBoardRandomly = () => {
    const fillWidth = 40;
    const fillHeight = 40;
    const startX = Math.floor((currentBoard.width - fillWidth) / 2);
    const startY = Math.floor((currentBoard.height - fillHeight) / 2);

    currentBoard.fill(automaton[0]!.default);

    for (let y = startY; y < startY + fillHeight; y++) {
      for (let x = startX; x < startX + fillWidth; x++) {
        currentBoard.set(x, y, Math.random() < 0.5 ? 1 : 0);
      }
    }

    nextBoard.fill(automaton[0]!.default);
    draw();
  };

  const toggleCellState = (event: MouseEvent) => {
    const { x, y } = getCanvasCell(game, currentBoard, event);
    const nextCell = currentBoard.get(x, y) === 0 ? 1 : 0;

    currentBoard.set(x, y, nextCell);
    draw();
  };

  game.addEventListener("click", toggleCellState);
  step.addEventListener("click", stepOnce);
  clear.addEventListener("click", clearBoardState);
  autoplay.addEventListener("click", startAutoplay);
  stop.addEventListener("click", stopAutoplay);
  randomFill.addEventListener("click", fillBoardRandomly);

  setAutoplayControls(false);
  draw();
}

window.addEventListener("load", bootstrap);
