import { Events } from "./events.ts";
import {
  InternalOptions,
  Options,
  optionsArrayToMap,
  OptionsCallback,
} from "./options.ts";
import { Settings } from "./settings.ts";

interface Elements {
  container: HTMLDivElement;
  selected: HTMLDivElement;
  search: HTMLInputElement;
  popover: HTMLDivElement;
}

interface State {
  options: InternalOptions;
  selected: Array<string>;
  events: Events;
  optionsCallback: OptionsCallback;
  q: string;
}

interface InternalSettings {
  allowDuplicates: boolean;
}

export class Select {
  #els: Elements;
  #state: State;
  #settings: InternalSettings;

  constructor(settings: Settings) {
    this.#els = (() => {
      const selectEl = (() => {
        if (!document.body.contains(settings.el)) {
          throw new Error(
            "Element is not present in the visible document body",
          );
        }
        return settings.el;
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

      const selectedEl = (() => {
        const el = document.createElement("div");
        return el;
      })();
      
      const searchEl = (() => {
        const el = document.createElement("input");
        
        el.setAttribute("placeholder", "Search...");

        el.addEventListener("beforeinput", (e) => {
        });
        el.addEventListener("input", async (e) => {
          this.#state.q = el.value;
          await this.loadOptions(this.#state.q);
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
      boxEl.replaceChildren(selectedEl, searchEl);
      containerEl.replaceChildren(boxEl, popoverEl);
      selectEl.replaceWith(containerEl);

      return {
        container: containerEl,
        selected: selectedEl,
        search: searchEl,
        popover: popoverEl,
      };
    })();

    this.#settings = {
      allowDuplicates: settings.allowDuplicates ?? false,
    };

    this.#state = {
      options: optionsArrayToMap(settings.initialOptions ?? []),
      selected: settings.selected ?? [],
      events: settings.events ?? {},
      optionsCallback: settings.options,
      q: "",
    };

    if (settings.preloadOptions) {
      this.loadOptions("", true, true);
    }
  }

  options(): Options {
    return [...this.#state.options.values()];
  }
  async setOptions(options: Options, force = false, silent = false) {
    const prevOptions = new Map(this.#state.options);

    if (!force) {
      const cancel = await this.#state.events?.beforeOptionsLoaded?.(
        this.#state.q,
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

        el.addEventListener("click", () => {
          if (
            this.#settings.allowDuplicates ||
            !this.#state.selected.includes(value)
          ) {
            this.setSelected([...this.#state.selected, value]);
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
      await this.#state.events?.afterOptionsLoaded?.(
        [...this.#state.options.values()],
        [...prevOptions.values()],
      );
    }
  }
  async loadOptions(q: string, force = false, silent = false) {
    const newOptions = await this.#state.optionsCallback(q, [
      ...this.#state.options.values(),
    ]);
    this.setOptions(newOptions, force, silent);
  }

  selected(): Array<string> {
    return this.#state.selected;
  }
  async setSelected(selected: Array<string>, force = false, silent = false) {
    const prevSelected = this.#state.selected;

    if (!force) {
      const cancel = await this.#state.events?.beforeSelectedChanged?.(
        selected,
        prevSelected,
      );
      if (cancel) {
        return;
      }
    }

    this.#state.selected = selected;
    
    if (this.#state.selected.length === 1) {
      this.#els.search.setAttribute("placeholder", "");
    } else if (this.#state.selected.length === 0) {
      this.#els.search.setAttribute("placeholder", "Search...");
    }
    
    if (!silent) {
      await this.#state.events?.afterSelectedChanged?.(
        this.#state.selected,
        prevSelected,
      );
    }
  }
}
