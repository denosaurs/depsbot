import { Registry } from "./types";

import { x } from "./x";
import { nest } from "./nest";

export * from "./types";

export function getAllRegistries(): Registry[] {
  return [x, nest];
}
