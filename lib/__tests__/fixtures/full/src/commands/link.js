"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.link = void 0;
const deps_ts_1 = require("../../deps.ts");
const keyfile_ts_1 = require("../keyfile.ts");
const version_ts_1 = require("../version.ts");
const log_ts_1 = require("../log.ts");
/** Link Command.
 * Provided a key, the `link` commands creates
 * a persistent file on the host os to save
 * the API key to. */
async function linkCommand(options, key) {
    await log_ts_1.setupLog(options.debug);
    deps_ts_1.log.debug("Key: ", key);
    await keyfile_ts_1.writeAPIKey(key);
    deps_ts_1.log.info(`Successfully updated ${keyfile_ts_1.KEY_FILE} with your key!`);
}
exports.link = new deps_ts_1.Command()
    .version(version_ts_1.version)
    .description("Links your nest.land API key to the CLI")
    .arguments("<key:string>")
    .action(linkCommand);
