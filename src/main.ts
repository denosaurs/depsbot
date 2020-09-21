import * as core from "@actions/core";
import * as github from "@actions/github";

import { resolve, relative } from "path";

import reporter from "vfile-reporter";

import { parseProject } from "./deps";
import { allRegistries } from "./registries";
import { compileReport } from "./runtime/report";

async function run(): Promise<void> {
  try {
    const GITHUB_TOKEN = core.getInput("github_token");

    const relpath = resolve(core.getInput("path"));
    const repopath = resolve(core.getInput("repo_path"));

    if (!GITHUB_TOKEN) {
      throw new Error("GITHUB_TOKEN must be set");
    }
    const octokit = github.getOctokit(GITHUB_TOKEN);

    const { GITHUB_SHA } = process.env;
    if (!GITHUB_SHA) {
      throw new Error("GITHUB_SHA must be set");
    }

    const dir = resolve(relpath);

    const registries = allRegistries();
    const project = await parseProject(dir);
    const report = await compileReport(project, registries);

    const string = reporter(Array.from(report.keys()));
    if (string) core.setFailed(string);

    const ctx = github.context;

    // build markdown message from vfile reports
    const markdown: string[] = [];
    for (const file of report.keys()) {
      const abspath = file.path;
      if (!abspath) continue;
      const fpath = relative(repopath, abspath);
      markdown.push(
        `### [${fpath}](https://github.com/${ctx.repo.owner}/${ctx.repo.repo}/blob/${GITHUB_SHA}/${fpath})`
      );
      const list: string[] = [];
      for (const raw of file.messages) {
        const message: string[] = [];

        // prettify message
        raw.message = raw.message.replace("~>", "→");

        message.push(`**${raw.ruleId}**: ${raw.message}`);
        message.push(
          `https://github.com/${ctx.repo.owner}/${ctx.repo.repo}/blob/${GITHUB_SHA}/${fpath}#L${raw.location.start.line}-L${raw.location.end.line}`
        );
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
  } catch (error) {
    core.error(JSON.stringify(error, null, 2));
    core.setFailed(error.message);
    throw error;
  }
}

run();
