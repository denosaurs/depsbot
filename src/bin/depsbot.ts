import vfile from "vfile";
import reporter from "vfile-reporter";
import sort from "vfile-sort";

import { parseProject } from "../deps";
import { Diagnostic } from "../diagnostics";
import { getAllRegistries } from "../registries";

(async () => {
  const project = await parseProject(process.cwd());

  const registries = getAllRegistries();

  const vfiles: Promise<vfile.VFile | null>[] = [];

  for (const [fpath, deps] of Object.entries(project)) {
    const diagnostics: Promise<Diagnostic[]>[] = [];
    for (const dep of deps) {
      for (const reg of registries) {
        if (reg.belongs(dep)) {
          diagnostics.push(reg.analyze(dep));
          break;
        }
      }
    }
    vfiles.push(
      (async (): Promise<vfile.VFile | null> => {
        const result = await Promise.all(diagnostics);
        if (result.every((_) => _.length === 0)) return null;
        const file = vfile({ path: fpath });
        for (const diags of result) {
          for (const diag of diags) {
            diag.render(file);
          }
        }
        sort(file);
        return file;
      })()
    );
  }

  const result = await Promise.all(vfiles);
  const files = result.filter((_) => _ !== null) as vfile.VFile[];
  const report = reporter(files.filter((_) => _ !== null));
  // eslint-disable-next-line no-console
  if (report) console.error();
})();
