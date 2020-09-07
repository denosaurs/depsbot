"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.highlight = exports.stripANSII = exports.handleError = exports.writeLogFile = exports.setupLog = exports.errorOccurred = exports.masterLogRecord = void 0;
const deps_ts_1 = require("../deps.ts");
const version_ts_1 = require("./version.ts");
const DEBUG_LOG_FILE = "./eggs-debug.log";
exports.masterLogRecord = "";
exports.errorOccurred = false;
let detailedLog = false;
class ConsoleHandler extends deps_ts_1.BaseHandler {
    format(record) {
        let msg = "";
        switch (record.level) {
            case deps_ts_1.LogLevels.DEBUG:
                msg += deps_ts_1.gray("[DEBUG]");
                break;
            case deps_ts_1.LogLevels.INFO:
                msg += deps_ts_1.blue("[INFO]");
                break;
            case deps_ts_1.LogLevels.WARNING:
                msg += deps_ts_1.yellow("[WARN]");
                break;
            case deps_ts_1.LogLevels.ERROR:
                msg += deps_ts_1.red("[ERR]");
                exports.errorOccurred = true;
                break;
            case deps_ts_1.LogLevels.CRITICAL:
                msg += deps_ts_1.bold(deps_ts_1.red("[CRIT]"));
                break;
            default:
                break;
        }
        msg += ` ${record.msg}`;
        if (record.level !== deps_ts_1.LogLevels.CRITICAL || detailedLog) {
            for (const arg of record.args) {
                msg += ` ${Deno.inspect(arg)}`;
            }
        }
        return msg;
    }
    log(msg) {
        console.log(msg);
    }
}
class FileHandler extends deps_ts_1.BaseHandler {
    format(record) {
        let msg = record.datetime.toISOString() + " ";
        switch (record.level) {
            case deps_ts_1.LogLevels.DEBUG:
                msg += "[DEBUG]   ";
                break;
            case deps_ts_1.LogLevels.INFO:
                msg += "[INFO]    ";
                break;
            case deps_ts_1.LogLevels.WARNING:
                msg += "[WARNING] ";
                break;
            case deps_ts_1.LogLevels.ERROR:
                msg += "[ERROR]   ";
                break;
            case deps_ts_1.LogLevels.CRITICAL:
                msg += "[CRITICAL]";
                break;
            default:
                break;
        }
        msg += ` ${stripANSII(record.msg)}`;
        for (const arg of record.args) {
            msg += ` ${stripANSII(Deno.inspect(arg))}`;
        }
        return msg;
    }
    log(msg) {
        exports.masterLogRecord += msg + "\n";
    }
}
/** Setup custom deno logger. Follows format:
 * `[LEVEL] <msg> <args>` */
async function setupLog(debugEnabled = false) {
    detailedLog = debugEnabled;
    await deps_ts_1.log.setup({
        handlers: {
            console: new ConsoleHandler(debugEnabled ? "DEBUG" : "INFO"),
            file: new FileHandler("DEBUG"),
        },
        loggers: {
            default: {
                level: "DEBUG",
                handlers: ["console", "file"],
            },
        },
    });
}
exports.setupLog = setupLog;
async function writeLogFile() {
    const encoder = new TextEncoder();
    const args = `Arguments:\n  ${Deno.args}\n\n`;
    const denoVersion = `Deno version:\n  deno: ${Deno.version.deno}\n  v8: ${Deno.version.v8}\n  typescript: ${Deno.version.typescript}\n\n`;
    const eggsVersion = `Eggs version:\n  ${version_ts_1.version}\n\n`;
    const platform = `Platform:\n  ${Deno.build.target}\n\n`;
    await Deno.writeFile(DEBUG_LOG_FILE, encoder.encode(args + denoVersion + eggsVersion + platform + exports.masterLogRecord));
}
exports.writeLogFile = writeLogFile;
async function handleError(err) {
    deps_ts_1.log.critical(`An unexpected error occurred: "${err.message}"`, err.stack);
    await writeLogFile();
    deps_ts_1.log.info(`If you think this is a bug, please open a bug report at ${highlight("https://github.com/nestdotland/eggs/issues/new/choose")} with the information provided in ${highlight(deps_ts_1.resolve(Deno.cwd(), DEBUG_LOG_FILE))}`);
    deps_ts_1.log.info(`Visit ${highlight("https://docs.nest.land/eggs/")} for documentation about this command.`);
}
exports.handleError = handleError;
const colorRegex = /\x1B[[(?);]{0,2}(;?\d)*./g;
function stripANSII(msg) {
    return msg.replace(colorRegex, "");
}
exports.stripANSII = stripANSII;
function highlight(msg) {
    return deps_ts_1.underline(deps_ts_1.bold(msg));
}
exports.highlight = highlight;
