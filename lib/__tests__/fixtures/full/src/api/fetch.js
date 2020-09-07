"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchModule = exports.fetchResource = void 0;
const module_ts_1 = require("../module.ts");
const common_ts_1 = require("./common.ts");
async function fetchResource(query) {
    // TODO(@qu4k): add test resource
    try {
        const response = await common_ts_1.apiFetch(`${common_ts_1.ENDPOINT}${query}`);
        if (!response || !response.ok)
            return undefined;
        const value = await response.json();
        return value;
    }
    catch {
        return undefined;
    }
}
exports.fetchResource = fetchResource;
async function fetchModule(name) {
    let module = await fetchResource(`/api/package/${name}`);
    if (!module)
        return undefined;
    return new module_ts_1.Module(module);
}
exports.fetchModule = fetchModule;
