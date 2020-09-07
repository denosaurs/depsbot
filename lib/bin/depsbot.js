"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vfile_1 = __importDefault(require("vfile"));
const vfile_reporter_1 = __importDefault(require("vfile-reporter"));
const vfile_sort_1 = __importDefault(require("vfile-sort"));
const deps_1 = require("../deps");
const registries_1 = require("../registries");
(async () => {
    const project = await deps_1.parseProject(process.cwd());
    const registries = registries_1.getAllRegistries();
    const vfiles = [];
    for (const [fpath, deps] of Object.entries(project)) {
        const diagnostics = [];
        for (const dep of deps) {
            for (const reg of registries) {
                if (reg.belongs(dep)) {
                    diagnostics.push(reg.analyze(dep));
                    break;
                }
            }
        }
        vfiles.push((async () => {
            const result = await Promise.all(diagnostics);
            if (result.every((_) => _.length === 0))
                return null;
            const file = vfile_1.default({ path: fpath });
            for (const diags of result) {
                for (const diag of diags) {
                    diag.render(file);
                }
            }
            vfile_sort_1.default(file);
            return file;
        })());
    }
    const result = await Promise.all(vfiles);
    const files = result.filter((_) => _ !== null);
    const report = vfile_reporter_1.default(files.filter((_) => _ !== null));
    // eslint-disable-next-line no-console
    if (report)
        console.error();
})();
