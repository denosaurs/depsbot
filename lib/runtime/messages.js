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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createComments = exports.createMarkdownSummary = void 0;
const path_1 = require("path");
const github = __importStar(require("@actions/github"));
const diagnostics_1 = require("../diagnostics");
function createMarkdownSummary(report, repopath) {
    const ctx = github.context;
    const markdown = [];
    for (const file of report.keys()) {
        const abspath = file.path;
        if (!abspath)
            continue;
        const fpath = path_1.relative(repopath, abspath);
        markdown.push(`### [${fpath}](https://github.com/${ctx.repo.owner}/${ctx.repo.repo}/blob/${ctx.sha}/${fpath})`);
        const list = [];
        for (const raw of file.messages) {
            const message = [];
            // prettify message
            raw.message = raw.message.replace("~>", "→");
            message.push(`**${raw.ruleId}**: ${raw.message}`);
            message.push(`https://github.com/${ctx.repo.owner}/${ctx.repo.repo}/blob/${ctx.sha}/${fpath}#L${raw.location.start.line}-L${raw.location.end.line}`);
            list.push(`- ${message.join("\n")}`);
        }
        markdown.push(list.join("\n"));
    }
    return markdown;
}
exports.createMarkdownSummary = createMarkdownSummary;
function createComments(report, repopath) {
    const comments = [];
    for (const [file, diagnostics] of report.entries()) {
        const abspath = file.path;
        if (!abspath)
            continue;
        const path = path_1.relative(repopath, abspath);
        for (const diagnostic of diagnostics) {
            if (!(diagnostic instanceof diagnostics_1.NoOutdated))
                continue;
            const correct = diagnostic.dep.url.href.replace(diagnostic.info.version, diagnostic.latest);
            const body = `${"```"}suggestion\n${correct}\n${"```"}`;
            comments.push({
                path,
                body,
                position: diagnostic.dep.loc.end.line,
            });
        }
    }
    return comments;
}
exports.createComments = createComments;
