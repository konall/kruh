import { Options } from "./options.ts";

export type CancellableEventResult = boolean | void | Promise<boolean | void>;
export type NormalEventResult = void | Promise<void>;

export interface Events {
  whenInitialised: () => NormalEventResult;

  beforeOptionsLoaded: (
    searchText: string,
    currentOptions: Options,
  ) => CancellableEventResult;
  afterOptionsLoaded: (
    options: Options,
    prevOptions: Options,
  ) => NormalEventResult;

  beforeCustomOptionAdded: (
    customOption: string,
    currentOptions: Options,
  ) => CancellableEventResult;
  afterCustomOptionAdded: (
    newOption: string,
    prevOptions: Options,
  ) => NormalEventResult;

  beforeSearchTextChanged: (
    searchText: string,
    currentSearchText: string,
  ) => CancellableEventResult;
  afterSearchTextChanged: (
    searchText: string,
    prevSearchText: string,
  ) => NormalEventResult;

  beforeSelectionsChanged: (
    selections: Array<string>,
    currentSelections: Array<string>,
  ) => CancellableEventResult;
  afterSelectionsChanged: (
    selections: Array<string>,
    prevSelections: Array<string>,
  ) => NormalEventResult;
}
