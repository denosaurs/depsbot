"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const path_1 = __importDefault(require("path"));
const vfile_1 = __importDefault(require("vfile"));
const vfile_reporter_1 = __importDefault(require("vfile-reporter"));
const vfile_sort_1 = __importDefault(require("vfile-sort"));
const deps_1 = require("./deps");
const registries_1 = require("./registries");
async function run() {
    try {
        const GITHUB_TOKEN = core.getInput("github_token");
        const relpath = path_1.default.resolve(core.getInput("path"));
        const repopath = path_1.default.resolve(core.getInput("repo_path"));
        if (!GITHUB_TOKEN) {
            throw new Error("GITHUB_TOKEN must be set");
        }
        const octokit = github.getOctokit(GITHUB_TOKEN);
        const { GITHUB_SHA } = process.env;
        if (!GITHUB_SHA) {
            throw new Error("GITHUB_SHA must be set");
        }
        const dir = path_1.default.resolve(relpath);
        const project = await deps_1.parseProject(dir);
        const registries = registries_1.getAllRegistries();
        const vfiles = [];
        for (const [fpath, deps] of Object.entries(project)) {
            const diagnostics = [];
            for (const dep of deps) {
                for (const reg of registries) {
                    if (reg.belongs(dep)) {
                        diagnostics.push(reg.analyze(dep));
                        break;
                    }
                }
            }
            vfiles.push((async () => {
                const result = await Promise.all(diagnostics);
                if (result.every((_) => _.length === 0))
                    return null;
                const file = vfile_1.default({ path: fpath });
                for (const diags of result) {
                    for (const diag of diags) {
                        diag.render(file);
                    }
                }
                vfile_sort_1.default(file);
                return file;
            })());
        }
        const result = await Promise.all(vfiles);
        const files = result.filter((_) => _ !== null);
        const cliReport = vfile_reporter_1.default(files);
        if (cliReport)
            core.setFailed(cliReport);
        const ctx = github.context;
        // build markdown message from vfile reports
        const markdown = [];
        for (const file of files) {
            const abspath = file.path;
            if (!abspath)
                continue;
            const fpath = path_1.default.relative(repopath, abspath);
            markdown.push(`### [${fpath}](https://github.com/${ctx.repo.owner}/${ctx.repo.repo}/blob/${GITHUB_SHA}/${fpath})`);
            const list = [];
            for (const report of file.messages) {
                const message = [];
                // prettify message
                report.message = report.message.replace("~>", "→");
                message.push(`**${report.ruleId}**: ${report.message}`);
                message.push(`https://github.com/${ctx.repo.owner}/${ctx.repo.repo}/blob/${GITHUB_SHA}/${fpath}#L${report.location.start.line}-L${report.location.end.line}`);
                list.push(`- ${message.join("\n")}`);
            }
            markdown.push(list.join("\n"));
        }
        // create pull request comment
        if (ctx.payload.pull_request) {
            const pull = ctx.payload.pull_request;
            if (markdown.length > 0) {
                markdown.unshift("## Depsbot Report");
                octokit.issues.createComment({
                    ...ctx.repo,
                    issue_number: pull.number,
                    body: markdown.join("\n\n"),
                });
            }
        }
    }
    catch (error) {
        core.error(JSON.stringify(error, null, 2));
        core.setFailed(error.message);
        throw error;
    }
}
run();
