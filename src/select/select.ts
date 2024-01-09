import { Events } from "./events.ts";
import {
  InternalOptions,
  Options,
  optionsArrayToMap,
  Source,
} from "./options.ts";
import { Settings } from "./settings.ts";

interface Elements {
  original: HTMLSelectElement;
  container: HTMLDivElement;
  selections: HTMLDivElement;
  search: HTMLInputElement;
  popover: HTMLDivElement;
}

interface State {
  options: InternalOptions;
  selections: Array<string>;
  source: Source;
  searchText: string;
}

export interface Config {
  source: Source;
  initialOptions?: Options;
  preloadOptions?: boolean;
  initialSelections?: Array<string>;

  events?: Partial<Events>;

  settings?: Partial<Settings>;
}

export class Select {
  #els: Elements;
  #state: State;
  #events: Partial<Events>;
  #settings: Settings;

  constructor(el: HTMLSelectElement) {
    this.#state = {
      options: new Map(),
      selections: [],
      source: () => [],
      searchText: "",
    };

    this.#events = {};

    this.#settings = {
      allowCreatingOptions: false,
      allowDuplicateSelections: false,
      maxOptions: 50,
      maxSelections: 1,
      placeholder: "Search...",
    };

    this.#els = (() => {
      const originalEl = (() => {
        if (!document.body.contains(el)) {
          throw new Error(
            "Element is not present in the visible document body",
          );
        }
        return el;
      })();

      const containerEl = (() => {
        const el = document.createElement("div");

        el.style.display = "inline-block";

        el.addEventListener("focusin", () => {
          popoverEl.style.display = "inline-block";
        });
        el.addEventListener("focusout", (e) => {
          if (
            !e.relatedTarget ||
            ((e.relatedTarget instanceof Element) &&
              !e.relatedTarget.closest(`#${popoverEl.id}`))
          ) {
            popoverEl.style.display = "none";
          }
        });
        return el;
      })();

      const selectionsEl = (() => {
        const el = document.createElement("div");
        return el;
      })();

      const searchEl = (() => {
        const el = document.createElement("input");

        el.setAttribute("placeholder", this.#settings.placeholder);

        el.addEventListener("beforeinput", (e) => {
        });
        el.addEventListener("input", async (e) => {
          this.#state.searchText = el.value;
          await this.#loadOptions(this.#state.searchText);
        });
        el.addEventListener("keydown", (e) => {
          if (e.key === "ArrowDown") {
            if (e.target instanceof Element) {
              if (popoverEl.firstElementChild instanceof HTMLElement) {
                popoverEl.firstElementChild.focus();
              }
            }
          }
        });

        return el;
      })();

      const popoverEl = (() => {
        const el = document.createElement("div");

        el.setAttribute("id", "kruh-popover");

        el.style.display = "none";
        el.style.position = "relative";
        el.style.zIndex = "1";

        return el;
      })();

      const boxEl = (() => {
        const el = document.createElement("div");
        el.style.display = "inline";
        return el;
      })();
      boxEl.replaceChildren(selectionsEl, searchEl);
      containerEl.replaceChildren(boxEl, popoverEl);

      return {
        original: originalEl,
        container: containerEl,
        selections: selectionsEl,
        search: searchEl,
        popover: popoverEl,
      };
    })();
  }

  async init(config: Config) {
    this.#events = config.events ?? {};

    this.#settings = {
      ...this.#settings,
      ...config.settings,
    };

    this.#state = {
      options: optionsArrayToMap(config.initialOptions ?? []),
      selections: config.initialSelections ?? [],
      source: config.source,
      searchText: "",
    };

    if (config.preloadOptions) {
      await this.#loadOptions("", true, true);
    }

    this.#els.original.replaceWith(this.#els.container);
    await this.#events.whenInitialised?.();
  }

  async #setOptions(options: Options, silent = false, force = false) {
    const prevOptions = new Map(this.#state.options);

    if (!force) {
      const cancel = await this.#events.beforeOptionsLoaded?.(
        this.#state.searchText,
        [...prevOptions.values()],
      );
      if (cancel) {
        return;
      }
    }

    this.#state.options = optionsArrayToMap(options);

    prevOptions.forEach((_, k) => {
      if (!this.#state.options.has(k)) {
        const id = `x${k.replaceAll(`'`, `_`).replaceAll(`"`, `__`)}`;
        document.querySelector(`[data-id=${id}]`)?.remove();
      }
    });

    this.#state.options.forEach((v, k) => {
      if (!prevOptions.has(k)) {
        const el = document.createElement("li");
        const id = `x${k.replaceAll(`'`, `_`).replaceAll(`"`, `__`)}`;
        const text = (typeof v === "string") ? v : v.text;
        const value = (typeof v === "string") ? v : v.value.toString();

        el.setAttribute("data-id", id);
        el.setAttribute("data-value", value);
        el.setAttribute("tabindex", "0");

        el.textContent = text;

        el.addEventListener("click", async () => {
          if (
            this.#settings.allowDuplicateSelections ||
            !this.#state.selections.includes(value)
          ) {
            await this.#setSelections([...this.#state.selections, value]);
          }
        });
        el.addEventListener("keydown", (e) => {
          if (e.key === "ArrowUp") {
            if (e.target instanceof Element) {
              if (e.target.previousElementSibling instanceof HTMLElement) {
                e.target.previousElementSibling.focus();
              } else {
                this.#els.search.focus();
                setTimeout(() => {
                  const range = document.createRange();
                  range.selectNodeContents(this.#els.search);
                  range.collapse(false);
                  const selection = window.getSelection();
                  selection?.removeAllRanges();
                  selection?.addRange(range);
                }, 0);
              }
            }
          } else if (e.key === "ArrowDown") {
            if (e.target instanceof Element) {
              if (e.target.nextElementSibling instanceof HTMLElement) {
                e.target.nextElementSibling.focus();
              }
            }
          }
        });

        this.#els.popover.appendChild(el);
      }
    });

    if (!silent) {
      await this.#events.afterOptionsLoaded?.(
        [...this.#state.options.values()],
        [...prevOptions.values()],
      );
    }
  }
  async #loadOptions(searchText: string, silent = false, force = false) {
    const newOptions = await this.#state.source(searchText, [
      ...this.#state.options.values(),
    ]);
    await this.#setOptions(newOptions, silent, force);
  }

  async #setSelections(
    selections: Array<string>,
    silent = false,
    force = false,
  ) {
    const prevSelections = this.#state.selections;

    if (!force) {
      const cancel = await this.#events.beforeSelectionsChanged?.(
        selections,
        prevSelections,
      );
      if (cancel) {
        return;
      }
    }

    this.#state.selections = selections;

    if (this.#state.selections.length === 1) {
      this.#els.search.setAttribute("placeholder", "");
    } else if (this.#state.selections.length === 0) {
      this.#els.search.setAttribute("placeholder", this.#settings.placeholder);
    }

    if (!silent) {
      await this.#events.afterSelectionsChanged?.(
        this.#state.selections,
        prevSelections,
      );
    }
  }

  async #setSearchText(searchText: string, silent = false, force = false) {
    const prevSearchText = this.#state.searchText;

    if (!force) {
      const cancel = await this.#events.beforeSearchTextChanged?.(
        searchText,
        prevSearchText,
      );
      if (cancel) {
        return;
      }
    }

    this.#state.searchText = searchText;

    if (!silent) {
      await this.#events.afterSearchTextChanged?.(
        this.#state.searchText,
        prevSearchText,
      );
    }
  }

  options() {
    return [...this.#state.options.values()];
  }
  async setOptions(
    options: Options,
    silent = false,
  ) {
    await this.#setOptions(options, silent, true);
  }
  async loadOptions(searchText: string, silent = false) {
    await this.#loadOptions(searchText, silent, true);
  }

  selections(): Array<string> {
    return this.#state.selections;
  }
  async setSelections(
    selections: Array<string>,
    silent = false,
  ) {
    await this.#setSelections(selections, silent, true);
  }

  searchText() {
    return this.#state.searchText;
  }
  async setSearchText(searchText: string, silent = false) {
    await this.#setSearchText(searchText, silent, true);
  }
}
