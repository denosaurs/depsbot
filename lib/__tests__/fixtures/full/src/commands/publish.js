"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publish = void 0;
const deps_ts_1 = require("../../deps.ts");
const common_ts_1 = require("../api/common.ts");
const fetch_ts_1 = require("../api/fetch.ts");
const post_ts_1 = require("../api/post.ts");
const config_ts_1 = require("../context/config.ts");
const context_ts_1 = require("../context/context.ts");
const keyfile_ts_1 = require("../keyfile.ts");
const version_ts_1 = require("../version.ts");
const log_ts_1 = require("../log.ts");
async function getContext() {
    const context = await context_ts_1.gatherContext();
    const { config, ignore } = context;
    if (!config) {
        deps_ts_1.log.error("You don't have an egg.json file!");
        deps_ts_1.log.info("You can create one running `eggs init`.");
        return [undefined, undefined];
    }
    if (!config_ts_1.ensureCompleteConfig(config)) {
        if (!config.name) {
            deps_ts_1.log.error("Your module configuration must provide a module name.");
        }
        return [undefined, undefined];
    }
    if (!config.files && !ignore) {
        deps_ts_1.log.error("Your module configuration must provide files to upload in the form of a `files` field in the config or in an .eggignore file.");
    }
    if (!config.description) {
        deps_ts_1.log.warning("You haven't provided a description for your package, continuing without one...");
    }
    return [config, ignore];
}
async function checkREADME(config) {
    if (!deps_ts_1.existsSync("README.md")) {
        deps_ts_1.log.warning("No README found at project root, continuing without one...");
    }
    const name = config.name.toLowerCase();
    try {
        let readme = await Deno.readTextFile(`README.md`);
        readme = readme.toLowerCase();
        if (readme.includes(`://deno.land/x/${name}`)) {
            deps_ts_1.log.warning(`Your readme contains old import URLs from your project using ${log_ts_1.highlight(`deno.land/x/${name}`)}.`);
            deps_ts_1.log.warning(`You can change these to ${log_ts_1.highlight("https://x.nest.land/${name}@VERSION")}`);
        }
    }
    catch {
        deps_ts_1.log.warning("Could not open the README for url checking...");
    }
}
async function checkFmt(config) {
    if (!config.fmt)
        return;
    const formatProcess = Deno.run({ cmd: ["deno", "fmt"] }), formatStatus = await formatProcess.status();
    if (formatStatus.success) {
        deps_ts_1.log.info("Formatted your code.");
    }
    else {
        deps_ts_1.log.error(`${deps_ts_1.italic("deno fmt")} returned a non-zero code.`);
    }
}
function matchFiles(config, ignore) {
    let matched = [];
    if (config.files) {
        for (let file of config.files) {
            let matches = [
                ...deps_ts_1.expandGlobSync(file, {
                    root: Deno.cwd(),
                    extended: true,
                }),
            ].map((file) => ({
                fullPath: file.path.replace(/\\/g, "/"),
                path: "/" + deps_ts_1.relative(Deno.cwd(), file.path).replace(/\\/g, "/"),
                lstat: Deno.lstatSync(file.path),
            }));
            matched.push(...matches);
        }
    }
    else {
        for (const entry of deps_ts_1.walkSync(".")) {
            const path = "/" + entry.path;
            const fullPath = deps_ts_1.resolve(entry.path);
            const lstat = Deno.lstatSync(entry.path);
            const file = {
                fullPath,
                path,
                lstat,
            };
            matched.push(file);
        }
    }
    matched = matched.filter((file) => file.lstat.isFile);
    matched = matched.filter((file) => {
        if (ignore.denies.some((rgx) => rgx.test(file.path.substr(1)))) {
            return ignore.accepts.some((rgx) => rgx.test(file.path.substr(1)));
        }
        return true;
    });
    return matched;
}
function readFiles(matched) {
    function readFileBtoa(path) {
        const data = Deno.readFileSync(path);
        return deps_ts_1.base64.fromUint8Array(data);
    }
    return matched
        .map((el) => [el, readFileBtoa(el.fullPath)])
        .reduce((p, c) => {
        p[c[0].path] = c[1];
        return p;
    }, {});
}
function checkEntry(config, matched) {
    var _a;
    if (config.entry) {
        config.entry = (_a = config.entry) === null || _a === void 0 ? void 0 : _a.replace(/^[.]/, "").replace(/^[^/]/, (s) => `/${s}`);
    }
    if (!matched.find((e) => e.path === config.entry || "/mod.ts")) {
        deps_ts_1.log.error(`No ${config.entry || "/mod.ts"} found. This file is required.`);
        return true;
    }
}
async function publishCommand(options) {
    await log_ts_1.setupLog(options.debug);
    let apiKey = await keyfile_ts_1.getAPIKey();
    if (!apiKey) {
        deps_ts_1.log.error(`No API Key file found. You can add one using eggs ${deps_ts_1.italic("link <api key>")}. You can create one on ${log_ts_1.highlight("https://nest.land")}`);
        return;
    }
    const [egg, ignore] = await getContext();
    if (egg === undefined || ignore === undefined)
        return;
    deps_ts_1.log.debug("Config: ", egg);
    await checkREADME(egg);
    await checkFmt(egg);
    const matched = matchFiles(egg, ignore);
    const matchedContent = readFiles(matched);
    const noEntryFile = checkEntry(egg, matched);
    if (noEntryFile)
        return;
    const existing = await fetch_ts_1.fetchModule(egg.name);
    let latest = "0.0.0";
    if (existing) {
        latest = existing.getLatestVersion();
    }
    if (options.bump && egg.version) {
        egg.version = deps_ts_1.semver.inc(egg.version, options.bump);
    }
    egg.version = egg.version || options.version;
    if (!egg.version) {
        deps_ts_1.log.warning("No version found. Generating a new version now...");
        egg.version = deps_ts_1.semver.inc(latest, options.bump || "patch");
    }
    const nv = `${egg.name}@${egg.version}`;
    if (existing && existing.packageUploadNames.indexOf(nv) !== -1) {
        deps_ts_1.log.error("This version was already published. Please increment the version in your configuration.");
        return;
    }
    const isLatest = deps_ts_1.semver.compare(egg.version, latest) === 1;
    const module = {
        name: egg.name,
        description: egg.description,
        repository: egg.repository,
        version: egg.version,
        unlisted: egg.unlisted,
        upload: true,
        latest: isLatest,
    };
    deps_ts_1.log.debug("Module: ", module);
    if (options.dry) {
        deps_ts_1.log.info(`This was a dry run, the resulting module is:`, module);
        deps_ts_1.log.info("The matched file were:");
        matched.forEach((file) => {
            deps_ts_1.log.info(` - ${file.path}`);
        });
        return;
    }
    const uploadResponse = await post_ts_1.postPublishModule(apiKey, module);
    if (!uploadResponse) {
        // TODO(@qu4k): provide better error reporting
        throw new Error("Something broke when publishing... ");
    }
    const pieceResponse = await post_ts_1.postPieces(uploadResponse.token, matchedContent);
    if (!pieceResponse) {
        // TODO(@qu4k): provide better error reporting
        throw new Error("Something broke when sending pieces... ");
    }
    deps_ts_1.log.info(`Successfully published ${deps_ts_1.bold(egg.name)}!`);
    const files = Object.entries(pieceResponse.files).reduce((previous, current) => {
        return `${previous}\n        - ${current[0]} -> ${deps_ts_1.bold(`${common_ts_1.ENDPOINT}/${egg.name}@${egg.version}${current[0]}`)}`;
    }, "Files uploaded: ");
    deps_ts_1.log.info(files);
    console.log();
    deps_ts_1.log.info(deps_ts_1.green("You can now find your package on our registry at " +
        log_ts_1.highlight(`https://nest.land/package/${egg.name}\n`)));
    deps_ts_1.log.info(`Add this badge to your README to let everyone know:\n\n ${log_ts_1.highlight(`[![nest badge](https://nest.land/badge.svg)](https://nest.land/package/${egg.name})`)}`);
}
const releases = [
    "patch",
    "minor",
    "major",
    "pre",
    "prepatch",
    "preminor",
    "premajor",
    "prerelease",
];
function releaseType(option, arg, value) {
    if (!releases.includes(value)) {
        throw new Error(`Option --${option.name} must be a valid release type but got: ${value}.\nAccepted values are ${releases.join(", ")}.`);
    }
    return value;
}
function versionType(option, arg, value) {
    if (!deps_ts_1.semver.valid(value)) {
        throw new Error(`Option --${option.name} must be a valid version but got: ${value}.\nVersion must follow Semantic Versioning 2.0.0.`);
    }
    return value;
}
exports.publish = new deps_ts_1.Command()
    .description("Publishes the current directory to the nest.land registry.")
    .version(version_ts_1.version)
    .type("release", releaseType)
    .type("version", versionType)
    .option("-d, --dry", "Do a dry run")
    .option("--bump <value:release>", "Increment the version by the release type.", { conflicts: ["version"] })
    .option("--version <value:version>", "Set the version.", {
    conflicts: ["bump"],
})
    .action(publishCommand);
