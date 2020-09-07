"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.nest = exports.reModule = void 0;
const axios_1 = __importDefault(require("axios"));
const semver_1 = __importDefault(require("semver"));
const diagnostics_1 = require("../diagnostics");
const HOSTNAME = "x.nest.land";
exports.reModule = /^\/(\w+)@([\w.]+)\/.*$/;
async function fetchModule(info) {
    const url = `https://x.nest.land/api/package/${info.name}`;
    const response = await axios_1.default.get(url);
    return response.data;
}
function computeLatest(mod) {
    function vn(n) {
        return n.split("@")[1];
    }
    let latest;
    if (mod.packageUploadNames.length > 0) {
        const sorted = mod.packageUploadNames.sort((a, b) => {
            return -semver_1.default.compare(vn(a), vn(b));
        });
        latest = vn(sorted[0]);
    }
    if (!latest && mod.latestVersion) {
        latest = vn(mod.latestVersion);
    }
    else if (!latest && mod.latestStableVersion) {
        latest = vn(mod.latestStableVersion);
    }
    return latest !== null && latest !== void 0 ? latest : "0.0.0";
}
exports.nest = {
    name: "NEST",
    belongs(dep) {
        if (dep.url.hostname !== HOSTNAME)
            return false;
        return exports.reModule.test(dep.url.pathname);
    },
    info(dep) {
        const match = exports.reModule.exec(dep.url.pathname);
        if (!match)
            throw new Error(`"${dep.url.href}" is not supported by nest`);
        return {
            name: match[1],
            version: match[2],
        };
    },
    async analyze(dep) {
        const info = exports.nest.info(dep);
        let mod;
        try {
            mod = await fetchModule(info);
        }
        catch (e) {
            return [new diagnostics_1.NoNotFound(exports.nest, dep)];
        }
        const diagnostics = [];
        const latest = computeLatest(mod);
        if (latest !== info.version) {
            diagnostics.push(new diagnostics_1.NoOutdated(exports.nest, dep, latest));
        }
        if (mod.malicious) {
            diagnostics.push(new diagnostics_1.NoMalicious(exports.nest, dep));
        }
        return diagnostics;
    },
};
