"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const vfile_1 = __importDefault(require("vfile"));
const vfile_reporter_1 = __importDefault(require("vfile-reporter"));
const deps_1 = require("../src/deps");
const registries_1 = require("../src/registries");
test("parse 1", async () => {
    const fixtures = path_1.default.resolve(__dirname, "fixtures");
    const directory = path_1.default.join(fixtures, "parse_1");
    const project = await deps_1.parseProject(directory);
    const keys = Object.keys(project);
    expect(keys.length).toBe(1);
    const urls = Object.entries(project).map(([file, deps]) => [
        file,
        deps.map((dep) => dep.url.href),
    ]);
    const mods = Object.fromEntries(urls);
    expect(mods[path_1.default.join(directory, "deps.js")]).toStrictEqual([
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
    const fixtures = path_1.default.resolve(__dirname, "fixtures");
    const directory = path_1.default.join(fixtures, "partial_parse_1");
    const project = await deps_1.parseProject(directory);
    const keys = Object.keys(project);
    expect(keys.length).toBe(1);
    const urls = Object.entries(project).map(([file, deps]) => [
        file,
        deps.map((dep) => dep.url.href),
    ]);
    const mods = Object.fromEntries(urls);
    expect(mods[path_1.default.join(directory, "deps.jsx")]).toStrictEqual([
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
    const fixtures = path_1.default.resolve(__dirname, "fixtures");
    const directory = path_1.default.join(fixtures, "no_parse_1");
    const project = await deps_1.parseProject(directory);
    const keys = Object.keys(project);
    expect(keys.length).toBe(1);
    const urls = Object.entries(project).map(([file, deps]) => [
        file,
        deps.map((dep) => dep.url.href),
    ]);
    const mods = Object.fromEntries(urls);
    expect(mods[path_1.default.join(directory, "deps.js")]).toStrictEqual([]);
});
test("full", async () => {
    const fixtures = path_1.default.resolve(__dirname, "fixtures");
    const directory = path_1.default.join(fixtures, "full");
    const project = await deps_1.parseProject(directory);
    const registries = registries_1.getAllRegistries();
    const bigpromises = [];
    for (const [fpath, deps] of Object.entries(project)) {
        const promises = [];
        for (const dep of deps) {
            for (const reg of registries) {
                if (reg.belongs(dep)) {
                    promises.push(reg.analyze(dep));
                    break;
                }
            }
        }
        bigpromises.push((async () => {
            const result = await Promise.all(promises);
            const file = vfile_1.default({ fpath });
            for (const diags of result) {
                for (const diag of diags) {
                    diag.render(file);
                }
            }
            return file;
        })());
    }
    const vfiles = await Promise.all(bigpromises);
    console.error(vfile_reporter_1.default(vfiles));
});
