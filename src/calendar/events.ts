import { Event } from "./event.ts";

export interface Events {
  event: {
    hover: (event: Event) => void | Promise<void>;
    click: (event: Event) => void | Promise<void>;
    dblClick: (event: Event) => void | Promise<void>;
  };
}
