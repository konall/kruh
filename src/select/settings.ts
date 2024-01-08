import { Events } from "./events.ts";
import { Options, Source } from "./options.ts";

export interface Settings {
  el: HTMLSelectElement;
  source: Source;
  initialOptions?: Options;
  preloadOptions?: boolean;
  selections?: Array<string>;
  events?: Events;

  allowDuplicates?: boolean;
}
