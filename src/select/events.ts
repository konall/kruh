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

  beforeSelectedChanged?: (
    selected: Array<string>,
    prevSelected: Array<string>,
  ) => boolean | void | Promise<boolean | void>;
  afterSelectedChanged?: (
    selected: Array<string>,
    prevSelected: Array<string>,
  ) => void | Promise<void>;
}
