export interface Option {
  text: string;
  value: string | number;
  extra?: unknown;
}

export type Options = Array<string | Option>;
export type InternalOptions = Map<string, string | Option>;

export type Source = (
  q: string,
  currentOptions: Options,
) => Options | Promise<Options>;

export function optionsArrayToMap(optionsArray: Options): InternalOptions {
  return new Map(optionsArray.map((option) => {
    if (typeof option === "string") {
      return [option, { value: option, text: option }];
    } else {
      return [option.value.toString(), option];
    }
  }));
}
