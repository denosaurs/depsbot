"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const vfile_1 = __importDefault(require("vfile"));
const vfile_reporter_1 = __importDefault(require("vfile-reporter"));
const vfile_sort_1 = __importDefault(require("vfile-sort"));
const deps_1 = require("../deps");
const registries_1 = require("../registries");
(async () => {
    const project = await deps_1.parseProject(process.cwd());
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
            if (result.every((_) => _.length === 0))
                return null;
            const contents = await fs_1.default.promises.readFile(fpath, "utf-8");
            const file = vfile_1.default({ path: fpath, contents });
            for (const diags of result) {
                for (const diag of diags) {
                    diag.render(file);
                }
            }
            vfile_sort_1.default(file);
            return file;
        })());
    }
    const vfiles = await Promise.all(bigpromises);
    // eslint-disable-next-line no-console
    console.error(vfile_reporter_1.default(vfiles.filter((_) => _ !== null)));
})();
