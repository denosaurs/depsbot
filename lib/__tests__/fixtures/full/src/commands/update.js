"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = void 0;
const deps_ts_1 = require("../../deps.ts");
const log_ts_1 = require("../log.ts");
const decoder = new TextDecoder("utf-8");
async function updateGlobalModules(options, requestedModules) {
    const configPath = deps_ts_1.globalModulesConfigPath();
    const config = await deps_ts_1.readGlobalModuleConfig();
    if (config === undefined)
        return;
    deps_ts_1.log.debug("Config: ", config);
    for (const executable in config) {
        const module = config[executable];
        if (requestedModules.length &&
            requestedModules.indexOf(executable) === -1) {
            continue;
        }
        // Get latest release
        const latestRelease = await deps_ts_1.getLatestVersion(module.registry, module.name, module.owner);
        // Basic safety net
        if (!module.version || !deps_ts_1.semver.valid(module.version)) {
            deps_ts_1.log.debug("Invalid version", module.name, module.version);
            continue;
        }
        if (!latestRelease || !deps_ts_1.semver.valid(latestRelease)) {
            deps_ts_1.log.warning(`Could not find the latest version of ${module.name}.`);
            continue;
        }
        if (deps_ts_1.semver.eq(module.version, latestRelease)) {
            deps_ts_1.log.debug(module.name, "is already up to date!");
            continue;
        }
        // Update the dependency
        const indexOfURL = module.arguments.findIndex((arg) => arg.match(/https:\/\//));
        const newArgs = module.arguments.slice();
        newArgs[indexOfURL] = newArgs[indexOfURL].replace(deps_ts_1.versionSubstitute, latestRelease);
        const options = newArgs.filter((x) => x !== "-f");
        const installation = Deno.run({
            cmd: ["deno", "install", "-f", ...options],
        });
        const status = await installation.status();
        installation.close();
        const stdout = new TextDecoder("utf-8").decode(await installation.output());
        const stderr = new TextDecoder("utf-8").decode(await installation.stderrOutput());
        deps_ts_1.log.debug("stdout: ", stdout);
        deps_ts_1.log.debug("stderr: ", stderr);
        if (status.success === false || status.code !== 0) {
            deps_ts_1.log.error(`Update failed for ${executable}`);
            continue;
        }
        module.version = latestRelease;
        deps_ts_1.log.info(`${executable} (${module.name}) ${deps_ts_1.yellow(module.version)} -> ${deps_ts_1.green(latestRelease)}`);
    }
    await deps_ts_1.writeGlobalModuleConfig(config);
    deps_ts_1.log.info("Updated your dependencies!");
}
async function updateLocalModules(options, requestedModules) {
    /** Gather the path to the user's dependency file using the CLI arguments */
    let pathToDepFile = "";
    try {
        pathToDepFile = Deno.realPathSync("./" + options.file);
    }
    catch {
        // Dependency file doesn't exist
        deps_ts_1.log.warning("No dependency file was found in your current working directory.");
        return;
    }
    /** Creates an array of strings from each line inside the dependency file.
     * Only extracts lines that contain "https://" to strip out non-import lines. */
    const dependencyFileContents = decoder
        .decode(Deno.readFileSync(pathToDepFile))
        .split("\n")
        .filter((line) => line.indexOf("https://") > 0);
    if (dependencyFileContents.length === 0) {
        deps_ts_1.log.warning("Your dependency file does not contain any imported modules.");
        return;
    }
    deps_ts_1.log.debug("Dependency file contents: ", dependencyFileContents);
    /** For each import line in the users dependency file, collate the data ready to be re-written
     * if it can be updated.
     * Skips the dependency if it is not versioned (no need to try to update it) */
    const dependenciesToUpdate = [];
    for (const line of dependencyFileContents) {
        let { name, parsedURL, registry, owner, version } = deps_ts_1.parseURL(line);
        // TODO(@qu4k): edge case: dependency isn't a module, for example: from
        //  "https://x.nest.land/std@version/version.ts";, will return -> "version.ts";
        // Issue: "Mandarine.TS" is a module while "version.ts" isn't
        // Now we have the name, ignore dependency if requested dependencies are set and it isn't one requested
        if (requestedModules.length && requestedModules.indexOf(name) === -1) {
            deps_ts_1.log.debug(name, "was not requested.");
            continue;
        }
        // Get latest release
        const latestRelease = await deps_ts_1.getLatestVersion(registry, name, owner);
        // Basic safety net
        if (!version || !deps_ts_1.semver.valid(version)) {
            deps_ts_1.log.debug("Invalid version", name, version);
            continue;
        }
        if (!latestRelease || !deps_ts_1.semver.valid(latestRelease)) {
            deps_ts_1.log.warning(`Warning: could not find the latest version of ${name}.`);
            continue;
        }
        if (deps_ts_1.semver.eq(version, latestRelease)) {
            deps_ts_1.log.debug(name, "is already up to date!");
            continue;
        }
        // Collate the dependency
        dependenciesToUpdate.push({
            line,
            versionURL: parsedURL,
            latestRelease,
        });
        deps_ts_1.log.info(`${name} ${deps_ts_1.yellow(version)} → ${deps_ts_1.green(latestRelease)}`);
    }
    // If no modules are needed to update then exit
    if (dependenciesToUpdate.length === 0) {
        deps_ts_1.log.info("Your dependencies are already up to date!");
        return;
    }
    // Loop through the users dependency file, replacing the imported version with the latest release for each dep
    let dependencyFile = decoder.decode(Deno.readFileSync(pathToDepFile));
    dependenciesToUpdate.forEach((dependency) => {
        dependencyFile = dependencyFile.replace(dependency.line, dependency.versionURL.replace("${version}", dependency.latestRelease));
    });
    // Re-write the file
    Deno.writeFileSync(pathToDepFile, new TextEncoder().encode(dependencyFile));
    deps_ts_1.log.info("Updated your dependencies!");
}
exports.update = new deps_ts_1.Command()
    .description("Update your dependencies")
    .arguments("[deps...:string]")
    .option("--file <file:string>", "Set dependency filename", {
    default: "deps.ts",
})
    .option("-g, --global", "Update global modules")
    .action(async (options, requestedModules = []) => {
    await log_ts_1.setupLog(options.debug);
    deps_ts_1.log.debug("Options: ", options);
    if (options.global) {
        await updateGlobalModules(options, requestedModules);
    }
    else {
        await updateLocalModules(options, requestedModules);
    }
});
