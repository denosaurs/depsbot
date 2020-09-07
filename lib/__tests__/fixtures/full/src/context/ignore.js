"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseIgnore = exports.readIgnore = exports.defaultIgnore = void 0;
const deps_ts_1 = require("../../deps.ts");
const DEFAULT_IGNORES = [".eggignore"];
function defaultIgnore(wd = Deno.cwd()) {
    return DEFAULT_IGNORES.find((path) => {
        return deps_ts_1.existsSync(deps_ts_1.join(wd, path));
    });
}
exports.defaultIgnore = defaultIgnore;
async function readIgnore(path) {
    const data = await Deno.readTextFile(path);
    return parseIgnore(data);
}
exports.readIgnore = readIgnore;
function parseIgnore(data) {
    const ignore = {
        accepts: [],
        denies: [],
    };
    const lines = data.split(/\r\n|\r|\n/).map((_) => _.replace(/\s/g, ""));
    let n = 1;
    for (let line of lines) {
        n++;
        if (!line)
            continue;
        if (line.startsWith("#"))
            continue;
        const accepts = line.startsWith("!");
        if (accepts)
            line = line.substr(1);
        try {
            const pattern = deps_ts_1.globToRegExp(line, { extended: true, globstar: true });
            if (accepts) {
                ignore.accepts.push(pattern);
            }
            else {
                ignore.denies.push(pattern);
            }
        }
        catch (err) {
            deps_ts_1.log.error(`parsing .eggsignore file. error at line ${n}`);
        }
    }
    return ignore;
}
exports.parseIgnore = parseIgnore;
