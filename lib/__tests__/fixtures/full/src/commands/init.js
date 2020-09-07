"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = void 0;
const deps_ts_1 = require("../../deps.ts");
const config_ts_1 = require("../context/config.ts");
const version_ts_1 = require("../version.ts");
const log_ts_1 = require("../log.ts");
/** Init Command.
 * `init` creates (or overrides) configuration in
 * the cwd with an interactive prompt. */
async function initCommand(options) {
    await log_ts_1.setupLog(options.debug);
    let currentConfig = {};
    let configPath = await config_ts_1.defaultConfig();
    if (configPath) {
        deps_ts_1.log.warning("An egg config file already exists...");
        const override = await deps_ts_1.Confirm.prompt("Do you want to override it?");
        if (!override)
            Deno.exit(0);
        currentConfig = await config_ts_1.readConfig(configPath);
    }
    const name = await deps_ts_1.Input.prompt({
        message: "Module name:",
        default: currentConfig.name || deps_ts_1.basename(Deno.cwd()),
        minLength: 2,
        maxLength: 40,
    });
    const description = await deps_ts_1.Input.prompt({
        message: "Module description:",
        default: currentConfig.description,
        maxLength: 4294967295,
    });
    const stable = await deps_ts_1.Confirm.prompt({
        message: "Is this a stable version?",
        default: currentConfig.stable,
    });
    const files = await deps_ts_1.List.prompt({
        message: "Enter the files and relative directories that nest.land will publish separated by a comma.",
        default: currentConfig.files,
    });
    // BUG(@oganexon): Select.prompt does not work under Windows
    /* const format: string = await Select.prompt({
      message: "Config format: ",
      default: (configPath ? configFormat(configPath) : ConfigFormat.JSON)
        .toUpperCase(),
      options: [
        { name: "YAML", value: ConfigFormat.YAML },
        { name: "JSON", value: ConfigFormat.JSON },
      ],
    }); */
    const format = await deps_ts_1.Input.prompt({
        message: "Config format (json / yml). Note that you can use a .eggignore file instead: ",
        default: (configPath
            ? config_ts_1.configFormat(configPath)
            : config_ts_1.ConfigFormat.JSON).toLowerCase(),
        minLength: 3,
        maxLength: 4,
    });
    const config = {
        name: name,
        description: description,
        stable: stable,
        files: files.length === 0 ? currentConfig.files : files,
    };
    deps_ts_1.log.debug("Config: ", config, format);
    await config_ts_1.writeConfig(config, format);
    deps_ts_1.log.info("Successfully created config file.");
}
exports.init = new deps_ts_1.Command()
    .version(version_ts_1.version)
    .description("Initiates a new module for the nest.land registry.")
    .action(initCommand);
