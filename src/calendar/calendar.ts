import { Event, Source } from "./event.ts";
import { Events } from "./events.ts";
import { Settings } from "./settings.ts";
import { Templates } from "./templates.ts";

interface Elements {
  original: HTMLElement;
  main: HTMLDivElement;
}

interface State {
  base: Date;
  events: Map<string, Event>;
  createdEvents: Map<string, Event>;
  removedEvents: Set<string>;
}

export interface Config {
  source: Source;
  initialDate?: Date;

  events?: Partial<Events>;
  settings?: Partial<Settings>;
  templates?: Partial<Templates>;
}

export class Calendar {
  #els: Elements;
  #state: State;
  #events: Partial<Events>;
  #settings: Settings;
  #templates: Templates;

  constructor(el: HTMLElement) {
    this.#state = {
      base: new Date(),
      events: new Map(),
      createdEvents: new Map(),
      removedEvents: new Set(),
    };

    this.#settings = {
      allowEditing: false,
    };

    this.#events = {};

    this.#templates = {};

    this.#els = (() => {
      return {
        original: el,
        main: document.createElement("div"),
      };
    })();
  }

  async init(config: Config) {
    this.#state = {
      ...this.#state,
      base: config.initialDate ?? (new Date()),
    };

    this.#els.original.replaceWith(this.#els.main);
    this.#render();
  }

  #render() {
    const mainEl = (() => {
      const el = document.createElement("div");

      el.style.display = "grid";
      el.style.gridTemplateColumns = "repeat(7, minmax(0, 1fr))";

      return el;
    })();

    const base = (() => {
      const d = new Date(this.#state.base);
      d.setDate(1);
      d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
      d.setHours(0, 0, 0, 0);
      return d;
    })();

    [...Array(6 * 7).keys()] // 6 weeks
      .map((day) => {
        const start = (() => {
          const d = new Date(base);
          d.setDate(d.getDate() + day);
          return d;
        })();

        const end = (() => {
          const d = new Date(start);
          d.setHours(23, 59, 59, 999);
          return d;
        })();

        const dayContainerEl = (() => {
          const el = document.createElement("div");

          if (start.getMonth() !== this.#state.base.getMonth()) {
            el.style.opacity = "0.3";
          }
          // if (event.editable) {
          //   el.style.cursor = "pointer";
          // }

          return el;
        })();

        const dayEl = (() => {
          const el = document.createElement("div");

          el.appendChild((() => {
            const el = document.createElement("span");
            el.textContent = start.getDate().toString();
            if (start.toDateString() === this.#state.base.toDateString()) {
              el.style.color = "red";
            }
            return el;
          })());

          return el;
        })();

        [...this.#state.events.entries()]
          .filter(([id, event]) => (
            !this.#state.removedEvents.has(id) &&
            (event.start <= end) &&
            (event.end >= start)
          ))
          .sort(([_, eventA], [__, eventB]) => {
            const [durationA, durationB] = [eventA, eventB].map((e) => (
              e.end.valueOf() - e.start.valueOf()
            ));
            return (durationA - durationB);
          })
          .reverse()
          .forEach(([id, event]) => {
            const eventEl = (() => {
              const el = document.createElement("div");

              el.appendChild((() => {
                const el = document.createElement("span");
                el.textContent = event.title;
                return el;
              })());

              return el;
            })();

            dayEl.appendChild(eventEl);
          });

        dayContainerEl.appendChild(dayEl);
        mainEl.appendChild(dayContainerEl);
      });

    const prevMainEl = this.#els.main;
    this.#els.main = mainEl;
    prevMainEl.replaceWith(this.#els.main);
    prevMainEl.remove();
  }

  #setBase(newDate: Date) {
    console.log(newDate);
    this.#state.base = newDate;
    this.#render();
  }
  prevMonth() {
    const newDate = (() => {
      const d = this.#state.base;
      d.setMonth(d.getMonth() - 1);
      return d;
    })();
    this.#setBase(newDate);
  }
  nextMonth() {
    const newDate = (() => {
      const d = this.#state.base;
      d.setMonth(d.getMonth() + 1);
      return d;
    })();
    this.#setBase(newDate);
  }
}

// function x() {
//   /*html*/`
//   <div class="flex-1 flex justify-between">
//     <span class="text-2xl">
//         {Month::try_from(u8::try_from(start.get().month()).unwrap()).unwrap().name(), start.get().year())}
//     </span>

//     <div class="join">
//         <button
//             class="join-item btn btn-primary"
//             on:click=move |_| start.set(start.get().checked_sub_months(Months::new(1)).unwrap())
//         >
//             "<"
//         </button>
//         <button
//             class="join-item btn btn-primary btn-outline"
//             on:click=move |_| start.set(Local::now().with_day(1).unwrap())
//         >
//             "Today"
//         </button>
//         <button
//             class="join-item btn btn-primary"
//             on:click=move |_| start.set(start.get().checked_add_months(Months::new(1)).unwrap())
//         >
//             ">"
//         </button>
//     </div>
// </div>
// <div class="flex-1 grid grid-cols-7 divide-x border">
//     {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].into_iter().map(|d| view!{<span class="text-center">{d}</span>}).collect_view()}
// </div>
