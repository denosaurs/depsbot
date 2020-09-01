import vfile from "vfile";

import { Diagnostic } from "./types";
import { Dependency } from "../deps";
import { Registry } from "../registries";

export class NoNotFound extends Diagnostic {
  constructor(registry: Registry, dep: Dependency) {
    super("no-not-found", registry, dep);
  }
  render(file: vfile.VFile): void {
    const position = this.position();
    const registry = this.registry.name;
    file.message(
      `Not found in the ${registry} registry.`,
      position,
      "not-found"
    );
  }
}
