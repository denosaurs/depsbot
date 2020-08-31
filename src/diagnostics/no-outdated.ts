import { Diagnostic } from "./types";

import { Dependency } from "../deps";
import { Registry } from "../registries";

export class NoOutdated extends Diagnostic {
  readonly latest: string;
  constructor(registry: Registry, dep: Dependency, latest: string) {
    super("no-outdated", registry, dep);
    this.latest = latest;
  }
  render(): string {
    throw new Error("Method not implemented.");
  }
}
