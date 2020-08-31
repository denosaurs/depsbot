import { Dependency } from "../deps";
import { Registry, DependencyInfo } from "../registries";

export abstract class Diagnostic {
  readonly code: string;
  readonly registry: Registry;
  readonly dep: Dependency;
  readonly info: DependencyInfo;

  constructor(code: string, registry: Registry, dep: Dependency) {
    this.code = code;
    this.registry = registry;
    this.dep = dep;
    this.info = registry.info(dep);
  }

  abstract render(): string;
}
