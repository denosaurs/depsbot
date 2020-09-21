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
const path_1 = require("path");
const vfile_reporter_1 = __importDefault(require("vfile-reporter"));
const deps_1 = require("./deps");
const registries_1 = require("./registries");
const messages_1 = require("./runtime/messages");
const report_1 = require("./runtime/report");
async function run() {
    try {
        const GITHUB_TOKEN = core.getInput("github_token");
        const relpath = path_1.resolve(core.getInput("path"));
        const repopath = path_1.resolve(core.getInput("repo_path"));
        if (!GITHUB_TOKEN) {
            throw new Error("GITHUB_TOKEN must be set");
        }
        const octokit = github.getOctokit(GITHUB_TOKEN);
        const { GITHUB_SHA } = process.env;
        if (!GITHUB_SHA) {
            throw new Error("GITHUB_SHA must be set");
        }
        const dir = path_1.resolve(relpath);
        const registries = registries_1.allRegistries();
        const project = await deps_1.parseProject(dir);
        const report = await report_1.compileReport(project, registries);
        const string = vfile_reporter_1.default(Array.from(report.keys()));
        if (string)
            core.setFailed(string);
        const ctx = github.context;
        // build markdown message from vfile reports
        const markdown = messages_1.createMarkdownSummary(report, repopath);
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
