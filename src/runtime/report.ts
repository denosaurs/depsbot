import { Diagnostic } from "../diagnostics";
import { Project } from "../deps";
import { Registry } from "../registries";

import vfile from "vfile";
import vfileSort from "vfile-sort";

export type Report = Map<vfile.VFile, Diagnostic[]>;

export async function compileReport(
  project: Project,
  registries: Registry[]
): Promise<Report> {
  const report = new Map();
  const lock: Promise<void>[] = [];
  for (const [path, deps] of project.entries()) {
    const diagnostics: Promise<Diagnostic[]>[] = [];
    for (const dep of deps) {
      for (const reg of registries) {
        if (reg.belongs(dep)) {
          diagnostics.push(reg.analyze(dep));
          break;
        }
      }
    }
    lock.push(
      (async () => {
        const flatten = (await Promise.all(diagnostics)).flat();
        if (flatten.length === 0) return;
        const file = vfile({ path });
        for (const diagnostic of flatten) {
          diagnostic.render(file);
        }
        vfileSort(file);
        report.set(file, flatten);
      })()
    );
  }

  await Promise.all(lock);
  return report;
}
