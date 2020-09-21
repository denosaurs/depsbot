import { Registry } from "./types";

import { x } from "./x";
import { nest } from "./nest";

export * from "./types";

export function allRegistries(): Registry[] {
  return [x, nest];
}
