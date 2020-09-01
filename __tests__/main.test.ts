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
