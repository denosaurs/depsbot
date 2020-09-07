"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseProject = void 0;
const fs_1 = __importDefault(require("fs"));
const glob_1 = __importDefault(require("glob"));
const parser_1 = require("./parser");
__exportStar(require("./parser"), exports);
async function parseProject(root) {
    const files = glob_1.default.sync("**/*.{js,ts,jsx,tsx}", {
        cwd: root,
        realpath: true,
    });
    const res = [];
    for (const file of files) {
        res.push((async () => {
            const source = await fs_1.default.promises.readFile(file, "utf-8");
            return [file, parser_1.parseModule(file, source)];
        })());
    }
    const modules = await Promise.all(res);
    const project = Object.fromEntries(modules);
    return project;
}
exports.parseProject = parseProject;
