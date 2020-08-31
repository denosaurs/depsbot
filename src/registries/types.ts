import { Dependency } from "../deps";
import { Diagnostic } from "../diagnostics";

export interface DependencyInfo {
  name: string;
  version: string;
}

export interface Registry {
  name: string;
  belongs(dep: Dependency): boolean;
  info(dep: Dependency): DependencyInfo;
  analyze(dep: Dependency): Promise<Diagnostic[]>;
}
