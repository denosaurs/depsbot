import vfile from "vfile";

import { Dependency } from "../deps";
import { Registry, DependencyInfo } from "../registries";

interface Position {
  start: {
    line: number;
    column: number;
  };
  end: {
    line: number;
    column: number;
  };
}

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

  protected position(): Position {
    return {
      start: {
        line: this.dep.loc.start.line,
        column: this.dep.loc.start.column + 1,
      },
      end: {
        line: this.dep.loc.end.line,
        column: this.dep.loc.end.column + 1,
      },
    };
  }

  abstract render(file: vfile.VFile): void;
}
