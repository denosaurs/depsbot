"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const deps_ts_1 = require("./deps.ts");
const link_ts_1 = require("./src/commands/link.ts");
const init_ts_1 = require("./src/commands/init.ts");
const publish_ts_1 = require("./src/commands/publish.ts");
const update_ts_1 = require("./src/commands/update.ts");
const install_ts_1 = require("./src/commands/install.ts");
const upgrade_ts_1 = require("./src/commands/upgrade.ts");
const version_ts_1 = require("./src/version.ts");
const log_ts_1 = require("./src/log.ts");
await log_ts_1.setupLog();
const eggs = new deps_ts_1.Command()
    .throwErrors()
    .name("eggs")
    .version(version_ts_1.version)
    .description("nest.land - A module registry and CDN for Deno, on the permaweb")
    .option("-d, --debug", "Print additional information.", { global: true })
    .option("-o, --output-log", "Create a log file after command completion.", {
    global: true,
})
    .action(() => {
    eggs.help();
})
    .command("help", new deps_ts_1.HelpCommand())
    .command("completions", new deps_ts_1.CompletionsCommand())
    .command("link", link_ts_1.link)
    .command("init", init_ts_1.init)
    .command("publish", publish_ts_1.publish)
    .command("update", update_ts_1.update)
    .command("install", install_ts_1.install)
    .command("upgrade", upgrade_ts_1.upgrade);
try {
    const { options } = await eggs.parse(Deno.args);
    if (options.outputLog) {
        await log_ts_1.writeLogFile();
    }
    if (log_ts_1.errorOccurred) {
        Deno.exit(1);
    }
    Deno.exit();
}
catch (err) {
    if (err.message.match(/^(Unknown option:|Unknown command:|Option --|Missing value for option:|Missing argument\(s\):)/)) {
        eggs.help();
        deps_ts_1.log.error(err.message);
    }
    else {
        await log_ts_1.handleError(err);
    }
    Deno.exit(1);
}
