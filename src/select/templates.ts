import { Option } from "./options.ts"

export interface Templates {
    option: (option: string | Option) => string;
}
