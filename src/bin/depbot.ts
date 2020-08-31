import vfile from "vfile";
import reporter from "vfile-reporter";

import { parseProject } from "../deps";
import { Diagnostic } from "../diagnostics";
import { getAllRegistries } from "../registries";

(async () => {
  const project = await parseProject(process.cwd());

  const registries = getAllRegistries();

  const bigpromises: Promise<vfile.VFile | null>[] = [];

  for (const [fpath, deps] of Object.entries(project)) {
    const promises: Promise<Diagnostic[]>[] = [];
    for (const dep of deps) {
      for (const reg of registries) {
        if (reg.belongs(dep)) {
          promises.push(reg.analyze(dep));
          break;
        }
      }
    }
    bigpromises.push(
      (async (): Promise<vfile.VFile | null> => {
        const result = await Promise.all(promises);
        if (result.every((_) => _.length === 0)) return null;
        const file = vfile({ path: fpath });
        for (const diags of result) {
          for (const diag of diags) {
            diag.render(file);
          }
        }
        return file;
      })()
    );
  }

  const vfiles = await Promise.all(bigpromises);
  console.error(reporter(vfiles.filter((_) => _ !== null)));
})();
