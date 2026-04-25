import { Board, computeNextBoard } from "./core";
import { automatonOptions } from "./rules";
import type { Automaton, AutomatonOption, Cell, RunningStatus } from "./types";

const COLS = 100;
const ROWS = 100;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 800;

type AutomatonOptionId = AutomatonOption["id"];

function getAutomatonOption(id: AutomatonOptionId): AutomatonOption {
  const option = automatonOptions.find((automatonOption) => automatonOption.id === id) ?? automatonOptions[0];

  if (!option) {
    throw new Error("[automaton error] no automaton options available");
  }

  return option;
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
        x * cellWidth,
        y * cellHeight,
        cellWidth,
        cellHeight,
      );
    }
  }
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

export function getPaintCellForPointerEvent(
  event: Pick<PointerEvent, "button" | "buttons">,
  selectedCell: Cell,
  defaultCell: Cell,
): Cell {
  return event.button === 2 || event.buttons === 2 ? defaultCell : selectedCell;
}

export function shouldPaintForPointerEvent(
  event: Pick<PointerEvent, "type" | "buttons">,
  isPainting: boolean,
): boolean {
  return event.type === "pointerdown" || isPainting;
}

function bootstrap() {
  let runningStatus: RunningStatus = 'stopped';

  const game = document.querySelector("#game") as HTMLCanvasElement;
  const step = document.querySelector("#step") as HTMLButtonElement;
  const clear = document.querySelector("#clear") as HTMLButtonElement;
  const autoplay = document.querySelector("#autoplay") as HTMLButtonElement;
  const stop = document.querySelector("#stop") as HTMLButtonElement;
  const automatonSelect = document.querySelector("#automaton-select") as HTMLSelectElement;
  const stateList = document.querySelector("#state-list") as HTMLDivElement;

  const controlDisabledByStatus: Record<RunningStatus, Record<string, boolean>> = {
    stopped: {
      step: false,
      autoplay: false,
      stop: true,
      clear: false,
    },
    autoplaying: {
      step: true,
      autoplay: true,
      stop: false,
      clear: true,
    },
  };

  const controls = {
    step,
    autoplay,
    stop,
    clear,
  };

  const syncControls = () => {
    const disabledByControl = controlDisabledByStatus[runningStatus];

    for (const [controlName, disabled] of Object.entries(disabledByControl)) {
      controls[controlName as keyof typeof controls].disabled = disabled;
    }
  };

  const setRunningStatus = (nextStatus: RunningStatus) => {
    runningStatus = nextStatus;
    syncControls();
  };

  const ctx = game.getContext("2d");
  if (!ctx) {
    throw new Error("[canvas error] can not get canvas context");
  }

  if (!autoplay || !stop || !automatonSelect || !stateList) {
    throw new Error("[dom error] can not find autoplay controls");
  }

  game.width = CANVAS_WIDTH;
  game.height = CANVAS_HEIGHT;

  const defaultAutomatonOption = getAutomatonOption("maze");
  let automaton = defaultAutomatonOption.automaton;
  let currentBoard = new Board(COLS, ROWS, automaton[0]!.default);
  let nextBoard = new Board(COLS, ROWS, automaton[0]!.default);
  let animationFrameId: number | null = null;
  let frameCount = 0;
  let selectedCell: Cell = Math.min(1, automaton.length - 1);
  let isPainting = false;

  const renderAutomatonOptions = () => {
    automatonSelect.replaceChildren(
      ...automatonOptions.map((option) => {
        const optionElement = document.createElement("option");

        optionElement.value = option.id;
        optionElement.textContent = option.name;

        return optionElement;
      }),
    );

    automatonSelect.value = defaultAutomatonOption.id;
  };

  const renderAutomatonStates = () => {
    stateList.replaceChildren(
      ...automaton.map((state, index) => {
        const item = document.createElement("button");
        const swatch = document.createElement("span");
        const desc = document.createElement("span");

        item.className = index === selectedCell ? "state-item is-selected" : "state-item";
        item.type = "button";
        swatch.className = "state-swatch";
        desc.textContent = state.desc;
        swatch.style.backgroundColor = state.color;
        item.addEventListener("click", () => {
          selectedCell = index;
          renderAutomatonStates();
        });

        item.append(swatch, desc);

        return item;
      }),
    );
  };

  const resetBoard = () => {
    currentBoard = new Board(COLS, ROWS, automaton[0]!.default);
    nextBoard = new Board(COLS, ROWS, automaton[0]!.default);
  };

  const selectAutomaton = (id: AutomatonOptionId) => {
    const selectedOption = getAutomatonOption(id);

    automaton = selectedOption.automaton;
    selectedCell = Math.min(1, automaton.length - 1);
    stopAutoplay();
    resetBoard();
    renderAutomatonStates();
    draw();
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
    setRunningStatus('stopped');
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
    setRunningStatus('autoplaying');
  };

  const clearBoardState = () => {
    currentBoard.fill(automaton[0]!.default);
    nextBoard.fill(automaton[0]!.default);
    draw();
  };

  const paintCellState = (event: PointerEvent) => {
    if (!shouldPaintForPointerEvent(event, isPainting)) {
      return;
    }

    event.preventDefault();

    const { x, y } = getCanvasCell(game, currentBoard, event);
    const nextCell = getPaintCellForPointerEvent(event, selectedCell, automaton[0]!.default);

    currentBoard.set(x, y, nextCell);
    draw();
  };

  const startPainting = (event: PointerEvent) => {
    isPainting = true;
    game.setPointerCapture?.(event.pointerId);
    paintCellState(event);
  };

  const stopPainting = () => {
    isPainting = false;
  };

  game.addEventListener("pointerdown", startPainting);
  game.addEventListener("pointermove", paintCellState);
  game.addEventListener("pointerup", stopPainting);
  game.addEventListener("pointercancel", stopPainting);
  game.addEventListener("pointerleave", stopPainting);
  game.addEventListener("contextmenu", (event) => event.preventDefault());
  step.addEventListener("click", stepOnce);
  clear.addEventListener("click", clearBoardState);
  autoplay.addEventListener("click", startAutoplay);
  stop.addEventListener("click", stopAutoplay);
  automatonSelect.addEventListener("change", () => {
    selectAutomaton(automatonSelect.value as AutomatonOptionId);
  });

  renderAutomatonOptions();
  renderAutomatonStates();
  syncControls();
  draw();
}

if (typeof window !== "undefined") {
  window.addEventListener("load", bootstrap);
}
