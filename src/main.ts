import * as core from "@actions/core";
import * as github from "@actions/github";

import { resolve } from "path";

import reporter from "vfile-reporter";

import { parseProject } from "./deps";
import { allRegistries } from "./registries";
import { createMarkdownSummary } from "./runtime/messages";
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
    const markdown = createMarkdownSummary(report, repopath);

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
