"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAPIKey = exports.writeAPIKey = exports.KEY_FILE = exports.KEY_SUFFIX = void 0;
const deps_ts_1 = require("../deps.ts");
const common_ts_1 = require("./api/common.ts");
const environment_ts_1 = require("./environment.ts");
exports.KEY_SUFFIX = common_ts_1.ENDPOINT === "https://x.nest.land" ? "" : `-${slugify(common_ts_1.ENDPOINT)}`;
exports.KEY_FILE = `.nest-api-key${exports.KEY_SUFFIX}`;
function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w\-]+/g, "")
        .replace(/--+/g, "-")
        .replace(/^-+/, "")
        .replace(/-+$/, "");
}
async function writeAPIKey(key) {
    const keyPath = deps_ts_1.join(environment_ts_1.envHOMEDIR(), exports.KEY_FILE);
    await Deno.writeFile(keyPath, new TextEncoder().encode(key));
}
exports.writeAPIKey = writeAPIKey;
async function getAPIKey() {
    if (!deps_ts_1.existsSync(deps_ts_1.join(environment_ts_1.envHOMEDIR(), exports.KEY_FILE))) {
        return ""; // empty string
    }
    const decoder = new TextDecoder("utf-8");
    return decoder.decode(await Deno.readFile(deps_ts_1.join(environment_ts_1.envHOMEDIR(), exports.KEY_FILE)));
}
exports.getAPIKey = getAPIKey;
