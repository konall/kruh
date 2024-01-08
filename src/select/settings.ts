import { Events } from "./events.ts";
import { Options, OptionsCallback } from "./options.ts";

export interface Settings {
  el: HTMLSelectElement;
  options: OptionsCallback;
  initialOptions?: Options;
  preloadOptions?: boolean;
  selected?: Array<string>;
  events?: Events;

  allowDuplicates?: boolean;
}
