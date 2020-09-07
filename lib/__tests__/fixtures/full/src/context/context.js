"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gatherContext = void 0;
const config_ts_1 = require("./config.ts");
const ignore_ts_1 = require("./ignore.ts");
async function gatherContext(wd = Deno.cwd()) {
    let config = undefined;
    const configPath = config_ts_1.defaultConfig(wd);
    if (configPath) {
        try {
            config = await config_ts_1.readConfig(configPath);
        }
        catch (err) {
            throw err;
        }
    }
    let ignore = {
        accepts: [],
        denies: [],
    };
    const ignorePath = ignore_ts_1.defaultIgnore(wd);
    if (ignorePath) {
        try {
            ignore = await ignore_ts_1.readIgnore(ignorePath);
        }
        catch (err) {
            throw err;
        }
    }
    return {
        config,
        ignore,
    };
}
exports.gatherContext = gatherContext;
