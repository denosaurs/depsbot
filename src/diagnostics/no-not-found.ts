import { Diagnostic } from "./types";
import { Dependency } from "../deps";
import { Registry } from "../registries";

export class NoNotFound extends Diagnostic {
  constructor(registry: Registry, dep: Dependency) {
    super("no-not-found", registry, dep);
  }
  render(): string {
    throw new Error("Method not implemented.");
  }
}
