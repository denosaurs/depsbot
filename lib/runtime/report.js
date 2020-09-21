"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compileReport = void 0;
const vfile_1 = __importDefault(require("vfile"));
const vfile_sort_1 = __importDefault(require("vfile-sort"));
async function compileReport(project, registries) {
    const report = new Map();
    const lock = [];
    for (const [path, deps] of project.entries()) {
        const diagnostics = [];
        for (const dep of deps) {
            for (const reg of registries) {
                if (reg.belongs(dep)) {
                    diagnostics.push(reg.analyze(dep));
                    break;
                }
            }
        }
        lock.push((async () => {
            const flatten = (await Promise.all(diagnostics)).flat();
            if (flatten.length === 0)
                return;
            const file = vfile_1.default({ path });
            for (const diagnostic of flatten) {
                diagnostic.render(file);
            }
            vfile_sort_1.default(file);
            report.set(file, flatten);
        })());
    }
    await Promise.all(lock);
    return report;
}
exports.compileReport = compileReport;
