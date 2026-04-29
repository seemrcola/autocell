import { getRelativeOptionIndex } from "./select-utils";

export interface AutomatonSelectOption {
  id: string;
  name: string;
}

export class AutomatonSelectElement extends HTMLElement {
  #options: AutomatonSelectOption[] = [];
  #value = "";
  #label = "当前规则";
  #root: ShadowRoot;
  #outsideClickController: AbortController | null = null;

  constructor() {
    super();
    this.#root = this.attachShadow({ mode: "open" });
  }

  get value(): string {
    return this.#value;
  }

  set value(nextValue: string) {
    this.#value = nextValue;
    this.#syncSelectedOption();
  }

  get options(): AutomatonSelectOption[] {
    return this.#options;
  }

  set options(nextOptions: AutomatonSelectOption[]) {
    this.#options = nextOptions;

    if (!this.#options.some((option) => option.id === this.#value)) {
      this.#value = this.#options[0]?.id ?? "";
    }

    this.#renderOptions();
    this.#syncSelectedOption();
  }

  connectedCallback() {
    this.#label = this.getAttribute("label") ?? this.#label;
    this.#render();
    this.#syncSelectedOption();
    this.#outsideClickController = new AbortController();
    document.addEventListener("click", this.#handleDocumentClick, {
      signal: this.#outsideClickController.signal,
    });
  }

  disconnectedCallback() {
    this.#outsideClickController?.abort();
    this.#outsideClickController = null;
  }

  #render() {
    this.#root.innerHTML = `
      <style>
        :host {
          display: grid;
          gap: 8px;
          position: relative;
        }

        .field-label {
          color: #151515;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .select-control {
          position: relative;
        }

        .select-trigger {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 18px;
          align-items: center;
          gap: 10px;
          width: 100%;
          border: 3px solid #151515;
          border-radius: 0;
          padding: 11px 12px;
          background: #f8fafc;
          color: #151515;
          font: inherit;
          font-weight: 700;
          text-align: left;
          box-shadow: 5px 5px 0 #151515;
          cursor: pointer;
          transition: transform 120ms steps(2), box-shadow 120ms steps(2), background 120ms steps(2);
        }

        .select-trigger:hover,
        .select-trigger:focus-visible,
        .select-control.is-open .select-trigger {
          background: #c8ff3d;
          box-shadow: 3px 3px 0 #151515;
          transform: translate(2px, 2px);
        }

        .select-value {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .select-arrow {
          width: 12px;
          height: 12px;
          justify-self: end;
          border-right: 3px solid #151515;
          border-bottom: 3px solid #151515;
          transform: translateY(-3px) rotate(45deg);
          transition: transform 120ms steps(2);
        }

        .select-control.is-open .select-arrow {
          transform: translateY(3px) rotate(225deg);
        }

        .select-popover {
          position: absolute;
          z-index: 10;
          top: calc(100% + 8px);
          left: 0;
          right: 0;
          display: grid;
          gap: 4px;
          max-height: min(48vh, 360px);
          overflow-y: auto;
          border: 3px solid #151515;
          padding: 6px;
          background: #fffdf4;
          box-shadow: 7px 7px 0 #151515;
        }

        .select-popover[hidden] {
          display: none;
        }

        .select-option {
          width: 100%;
          border: 2px solid transparent;
          border-radius: 0;
          padding: 9px 10px;
          background: transparent;
          color: #151515;
          box-shadow: none;
          font: inherit;
          font-weight: 700;
          text-align: left;
          cursor: pointer;
          transition: background 120ms steps(2), border-color 120ms steps(2), transform 120ms steps(2);
        }

        .select-option:hover,
        .select-option:focus-visible {
          background: #e7f8b7;
          box-shadow: none;
          transform: none;
        }

        .select-option:active {
          box-shadow: none;
          transform: none;
        }

        .select-option.is-selected {
          border-color: #151515;
          background: #c8ff3d;
        }
      </style>

      <span class="field-label" id="label">${this.#label}</span>
      <div class="select-control">
        <button
          class="select-trigger"
          type="button"
          aria-haspopup="listbox"
          aria-expanded="false"
          aria-controls="list"
          aria-labelledby="label value"
        >
          <span class="select-value" id="value"></span>
          <span class="select-arrow" aria-hidden="true"></span>
        </button>
        <div
          class="select-popover"
          id="list"
          role="listbox"
          aria-labelledby="label"
          hidden
        ></div>
      </div>
    `;

    this.#trigger.addEventListener("click", this.#toggle);
    this.#trigger.addEventListener("keydown", this.#handleTriggerKeydown);
    this.#renderOptions();
  }

  #renderOptions() {
    const list = this.#list;

    if (!list) {
      return;
    }

    list.replaceChildren(
      ...this.#options.map((option, index) => {
        const optionButton = document.createElement("button");

        optionButton.className = "select-option";
        optionButton.type = "button";
        optionButton.textContent = option.name;
        optionButton.dataset.optionId = option.id;
        optionButton.setAttribute("role", "option");
        optionButton.addEventListener("click", () => this.#activateOption(option.id));
        optionButton.addEventListener("keydown", (event) => this.#handleOptionKeydown(event, index, option.id));

        return optionButton;
      }),
    );
  }

  #syncSelectedOption() {
    const selectedOption = this.#options.find((option) => option.id === this.#value) ?? this.#options[0];
    const valueLabel = this.#root.querySelector<HTMLSpanElement>("#value");

    if (!selectedOption || !valueLabel) {
      return;
    }

    this.#value = selectedOption.id;
    valueLabel.textContent = selectedOption.name;

    for (const optionButton of this.#optionButtons) {
      const isSelected = optionButton.dataset.optionId === selectedOption.id;

      optionButton.classList.toggle("is-selected", isSelected);
      optionButton.setAttribute("aria-selected", String(isSelected));
    }
  }

  #activateOption(optionId: string) {
    this.value = optionId;
    this.#close(true);
    this.dispatchEvent(new Event("change", { bubbles: true }));
  }

  #open() {
    this.#control.classList.add("is-open");
    this.#trigger.setAttribute("aria-expanded", "true");
    this.#list.hidden = false;
    this.#syncSelectedOption();
    this.#focusOption(this.#currentOptionIndex);
  }

  #close = (focusTrigger = false) => {
    this.#control.classList.remove("is-open");
    this.#trigger.setAttribute("aria-expanded", "false");
    this.#list.hidden = true;

    if (focusTrigger) {
      this.#trigger.focus();
    }
  };

  #toggle = () => {
    if (this.#list.hidden) {
      this.#open();
      return;
    }

    this.#close();
  };

  #focusOption(index: number) {
    const optionButton = this.#optionButtons[index];

    optionButton?.focus();
    optionButton?.scrollIntoView({ block: "nearest" });
  }

  #moveOptionFocus(currentIndex: number, direction: -1 | 1) {
    this.#focusOption(getRelativeOptionIndex(currentIndex, this.#options.length, direction));
  }

  #handleTriggerKeydown = (event: KeyboardEvent) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      this.#open();
      this.#moveOptionFocus(this.#currentOptionIndex, event.key === "ArrowDown" ? 1 : -1);
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      this.#toggle();
      return;
    }

    if (event.key === "Escape") {
      this.#close();
    }
  };

  #handleOptionKeydown(event: KeyboardEvent, optionIndex: number, optionId: string) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      this.#moveOptionFocus(optionIndex, event.key === "ArrowDown" ? 1 : -1);
      return;
    }

    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      this.#focusOption(event.key === "Home" ? 0 : this.#options.length - 1);
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      this.#activateOption(optionId);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      this.#close(true);
    }
  }

  #handleDocumentClick = (event: MouseEvent) => {
    if (event.composedPath().includes(this)) {
      return;
    }

    this.#close();
  };

  get #control(): HTMLDivElement {
    return this.#root.querySelector<HTMLDivElement>(".select-control")!;
  }

  get #trigger(): HTMLButtonElement {
    return this.#root.querySelector<HTMLButtonElement>(".select-trigger")!;
  }

  get #list(): HTMLDivElement {
    return this.#root.querySelector<HTMLDivElement>("#list")!;
  }

  get #optionButtons(): HTMLButtonElement[] {
    return Array.from(this.#root.querySelectorAll<HTMLButtonElement>(".select-option"));
  }

  get #currentOptionIndex(): number {
    return Math.max(0, this.#options.findIndex((option) => option.id === this.#value));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "automaton-select": AutomatonSelectElement;
  }
}

if (typeof window !== "undefined" && !customElements.get("automaton-select")) {
  customElements.define("automaton-select", AutomatonSelectElement);
}
