import vfile from "vfile";

import { Diagnostic } from "./types";
import { Dependency } from "../deps";
import { Registry } from "../registries";

export class NoMalicious extends Diagnostic {
  constructor(registry: Registry, dep: Dependency) {
    super("no-malicious", registry, dep);
  }
  render(file: vfile.VFile): void {
    const position = this.position();
    const registry = this.registry.name;
    file.message(
      `Reported as malicious in the ${registry} registry.`,
      position,
      "nmalicious"
    );
  }
}
