import { Options } from "./options.ts";

export interface Events {
  beforeOptionsLoaded?: (
    q: string,
    currentOptions: Options,
  ) => boolean | void | Promise<boolean | void>;
  afterOptionsLoaded?: (
    options: Options,
    prevOptions: Options,
  ) => void | Promise<void>;

  beforeSelectionsChanged?: (
    selections: Array<string>,
    prevSelections: Array<string>,
  ) => boolean | void | Promise<boolean | void>;
  afterSelectionsChanged?: (
    selections: Array<string>,
    prevSelections: Array<string>,
  ) => void | Promise<void>;
}
