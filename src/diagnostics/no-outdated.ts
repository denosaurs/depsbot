import vfile from "vfile";

import { Diagnostic } from "./types";
import { Dependency } from "../deps";
import { Registry } from "../registries";

export class NoOutdated extends Diagnostic {
  readonly latest: string;
  constructor(registry: Registry, dep: Dependency, latest: string) {
    super("no-outdated", registry, dep);
    this.latest = latest;
  }
  render(file: vfile.VFile): void {
    const i = this.info;
    const latest = this.latest;

    const position = this.position();

    file.message(
      `${i.name}@${i.version} ~> ${i.name}@${latest}`,
      position,
      "outdated"
    );
  }
}
