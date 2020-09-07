"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureCompleteConfig = exports.parseConfig = exports.readConfig = exports.writeConfig = exports.configFormat = exports.defaultConfig = exports.ConfigFormat = void 0;
const deps_ts_1 = require("../../deps.ts");
/** Supported configuration formats. */
var ConfigFormat;
(function (ConfigFormat) {
    ConfigFormat["YAML"] = "yml";
    ConfigFormat["JSON"] = "json";
})(ConfigFormat = exports.ConfigFormat || (exports.ConfigFormat = {}));
/** Filenames of the default configs.
 * The `defaultConfig` method checks
 * if one of this config files is
 * available in the cwd. */
const DEFAULT_CONFIGS = ["egg.json", "egg.yaml", "egg.yml"];
/** Get default config in cwd. */
function defaultConfig(wd = Deno.cwd()) {
    return DEFAULT_CONFIGS.find((path) => {
        return deps_ts_1.existsSync(deps_ts_1.join(wd, path));
    });
}
exports.defaultConfig = defaultConfig;
/** Get config format for provided path.
 * @param path configuration file path */
function configFormat(path) {
    const ext = deps_ts_1.extname(path);
    if (ext.match(/^.ya?ml$/))
        return ConfigFormat.YAML;
    return ConfigFormat.JSON;
}
exports.configFormat = configFormat;
/** writeYaml. (similar to writeJson)
 * @private */
async function writeYaml(filename, content) {
    return Deno.writeFileSync(filename, new TextEncoder().encode(content));
}
/** Write config with specific provided format. */
async function writeConfig(data, format) {
    switch (format) {
        case ConfigFormat.YAML:
            await writeYaml(`egg.yml`, deps_ts_1.stringifyYaml(data));
            break;
        case ConfigFormat.JSON:
            await deps_ts_1.writeJson("egg.json", data, { spaces: 2 });
            break;
    }
}
exports.writeConfig = writeConfig;
/** Read configuration from provided path. */
async function readConfig(path) {
    const format = configFormat(path);
    const data = await Deno.readTextFile(path);
    return parseConfig(data, format);
}
exports.readConfig = readConfig;
/** Parse configuration (provided as string)
 * for specific provided format */
function parseConfig(data, format) {
    var _a;
    if (format == ConfigFormat.YAML) {
        return ((_a = deps_ts_1.parseYaml(data)) !== null && _a !== void 0 ? _a : {});
    }
    return JSON.parse(data);
}
exports.parseConfig = parseConfig;
function ensureCompleteConfig(config) {
    if (!config.name)
        return false;
    return true;
}
exports.ensureCompleteConfig = ensureCompleteConfig;
