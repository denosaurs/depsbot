import fs from "fs";
import glob from "glob";

import { Dependency, parseModule } from "./parser";

export type Project = Map<string, Dependency[]>;
export type Module = [string, Dependency[]];

export async function parseProject(root: string): Promise<Project> {
  const files = glob.sync("**/*.{js,ts,jsx,tsx}", {
    cwd: root,
    realpath: true,
  });

  const res: Promise<Module>[] = [];
  for (const file of files) {
    res.push(
      (async (): Promise<Module> => {
        const source = await fs.promises.readFile(file, "utf-8");
        return [file, parseModule(file, source)];
      })()
    );
  }

  const modules = await Promise.all(res);
  const project = new Map(modules);
  return project;
}

export * from "./parser";
