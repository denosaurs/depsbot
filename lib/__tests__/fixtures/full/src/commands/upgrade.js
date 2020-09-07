"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upgrade = void 0;
const deps_ts_1 = require("../../deps.ts");
const version_ts_1 = require("../version.ts");
const log_ts_1 = require("../log.ts");
async function upgradeCommand(options) {
    await log_ts_1.setupLog(options.debug);
    const newVersion = await deps_ts_1.Nest.getLatestVersion("eggs");
    if (deps_ts_1.semver.eq(newVersion, version_ts_1.version)) {
        deps_ts_1.log.info("You are already using the latest CLI version!");
        return;
    }
    const upgradeProcess = Deno.run({
        cmd: [
            "deno",
            "install",
            "--unstable",
            "-A",
            "-f",
            "-n",
            "eggs",
            `https://x.nest.land/eggs@${newVersion}/mod.ts`,
        ],
        stdout: "piped",
        stderr: "piped",
    });
    const status = await upgradeProcess.status();
    upgradeProcess.close();
    const stdout = new TextDecoder("utf-8").decode(await upgradeProcess.output());
    const stderr = new TextDecoder("utf-8").decode(await upgradeProcess.stderrOutput());
    deps_ts_1.log.debug("stdout: ", stdout);
    deps_ts_1.log.debug("stderr: ", stderr);
    if (!status.success) {
        throw new Error("Failed to upgrade to the latest CLI version!");
    }
    deps_ts_1.log.info("Successfully upgraded eggs cli!");
}
exports.upgrade = new deps_ts_1.Command()
    .version(version_ts_1.version)
    .description("Upgrade the current nest.land CLI.")
    .action(upgradeCommand);
