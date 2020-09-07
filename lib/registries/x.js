"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.x = exports.reModule = void 0;
const diagnostics_1 = require("../diagnostics");
const axios_1 = __importDefault(require("axios"));
const HOSTNAME = "deno.land";
exports.reModule = /^\/(?:x\/)?(\w+)@([\w.]+)\/.*$/;
async function fetchVersionInfo(info) {
    const url = `https://cdn.deno.land/${info.name}/meta/versions.json`;
    const response = await axios_1.default.get(url);
    return response.data;
}
exports.x = {
    name: "X",
    belongs(dep) {
        if (dep.url.hostname !== HOSTNAME)
            return false;
        return exports.reModule.test(dep.url.pathname);
    },
    info(dep) {
        const match = exports.reModule.exec(dep.url.pathname);
        if (!match)
            throw new Error(`"${dep.url.href}" is not supported by x`);
        return {
            name: match[1],
            version: match[2],
        };
    },
    async analyze(dep) {
        const info = exports.x.info(dep);
        let mod;
        try {
            mod = await fetchVersionInfo(info);
        }
        catch (e) {
            return [new diagnostics_1.NoNotFound(exports.x, dep)];
        }
        const diagnostics = [];
        const { latest } = mod;
        if (latest !== info.version) {
            diagnostics.push(new diagnostics_1.NoOutdated(exports.x, dep, latest));
        }
        return diagnostics;
    },
};
