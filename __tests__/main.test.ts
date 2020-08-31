import path from "path";
import vfile from "vfile";
import reporter from "vfile-reporter";

import { parseProject } from "../src/deps";
import { Diagnostic } from "../src/diagnostics";
import { getAllRegistries } from "../src/registries";

test("parse 1", async () => {
  const fixtures = path.resolve(__dirname, "fixtures");
  const directory = path.join(fixtures, "parse_1");

  const project = await parseProject(directory);

  const keys = Object.keys(project);
  expect(keys.length).toBe(1);

  const urls = Object.entries(project).map(([file, deps]) => [
    file,
    deps.map((dep) => dep.url.href),
  ]);
  const mods = Object.fromEntries(urls);

  expect(mods[path.join(directory, "deps.js")]).toStrictEqual([
    "https://deno.land/x/branch@0.0.2/mod.ts",
    "https://deno.land/std@0.67.0/fmt/colors.ts",
    "https://deno.land/std@0.67.0/fs/mod.ts",
    "https://deno.land/std@0.67.0/encoding/yaml.ts",
    "https://deno.land/std@0.67.0/path/mod.ts",
    "https://deno.land/std@0.67.0/fs/read_json.ts",
    "https://deno.land/std@0.67.0/fs/write_json.ts",
    "https://deno.land/std@0.67.0/async/mod.ts",
    "https://deno.land/std@0.67.0/permissions/mod.ts",
    "https://deno.land/x/levenshtein@v1.0.1/mod.ts",
  ]);
});

test("partial parse 1", async () => {
  const fixtures = path.resolve(__dirname, "fixtures");
  const directory = path.join(fixtures, "partial_parse_1");

  const project = await parseProject(directory);

  const keys = Object.keys(project);
  expect(keys.length).toBe(1);

  const urls = Object.entries(project).map(([file, deps]) => [
    file,
    deps.map((dep) => dep.url.href),
  ]);
  const mods = Object.fromEntries(urls);

  expect(mods[path.join(directory, "deps.jsx")]).toStrictEqual([
    "https://deno.land/x/branch@0.0.2/mod.ts",
    "https://deno.land/std@0.67.0/fmt/colors.ts",
    "https://deno.land/std@0.67.0/fs/mod.ts",
    "https://deno.land/std@0.67.0/encoding/yaml.ts",
    "https://deno.land/std@0.67.0/path/mod.ts",
    "https://deno.land/std@0.67.0/fs/read_json.ts",
    "https://deno.land/std@0.67.0/fs/write_json.ts",
    "https://deno.land/std@0.67.0/async/mod.ts",
    "https://deno.land/std@0.67.0/permissions/mod.ts",
  ]);
});

test("no parse 1", async () => {
  const fixtures = path.resolve(__dirname, "fixtures");
  const directory = path.join(fixtures, "no_parse_1");

  const project = await parseProject(directory);

  const keys = Object.keys(project);
  expect(keys.length).toBe(1);

  const urls = Object.entries(project).map(([file, deps]) => [
    file,
    deps.map((dep) => dep.url.href),
  ]);
  const mods = Object.fromEntries(urls);

  expect(mods[path.join(directory, "deps.js")]).toStrictEqual([]);
});

test("full", async () => {
  const fixtures = path.resolve(__dirname, "fixtures");
  const directory = path.join(fixtures, "full");

  const project = await parseProject(directory);

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
});
