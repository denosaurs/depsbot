import * as core from "@actions/core";
import * as github from "@actions/github";

import path from "path";

import vfile from "vfile";
import reporter from "vfile-reporter";
import sort from "vfile-sort";

import { parseProject } from "./deps";
import { Diagnostic } from "./diagnostics";
import { getAllRegistries } from "./registries";

async function run(): Promise<void> {
  try {
    const GITHUB_TOKEN = core.getInput("github_token");

    const relpath = path.resolve(core.getInput("path"));
    const repopath = path.resolve(core.getInput("repo_path"));

    if (!GITHUB_TOKEN) {
      throw new Error("GITHUB_TOKEN must be set");
    }
    const octokit = github.getOctokit(GITHUB_TOKEN);

    const { GITHUB_SHA } = process.env;
    if (!GITHUB_SHA) {
      throw new Error("GITHUB_SHA must be set");
    }

    const dir = path.resolve(relpath);

    const project = await parseProject(dir);

    const registries = getAllRegistries();

    const vfiles: Promise<vfile.VFile | null>[] = [];

    for (const [fpath, deps] of Object.entries(project)) {
      const diagnostics: Promise<Diagnostic[]>[] = [];
      for (const dep of deps) {
        for (const reg of registries) {
          if (reg.belongs(dep)) {
            diagnostics.push(reg.analyze(dep));
            break;
          }
        }
      }
      vfiles.push(
        (async (): Promise<vfile.VFile | null> => {
          const result = await Promise.all(diagnostics);
          if (result.every((_) => _.length === 0)) return null;
          const file = vfile({ path: fpath });
          for (const diags of result) {
            for (const diag of diags) {
              diag.render(file);
            }
          }
          sort(file);
          return file;
        })()
      );
    }

    const result = await Promise.all(vfiles);
    const files = result.filter((_) => _ !== null) as vfile.VFile[];

    const cliReport = reporter(files);
    if (cliReport) core.setFailed(cliReport);

    const ctx = github.context;

    // build markdown message from vfile reports
    const markdown: string[] = [];
    for (const file of files) {
      const abspath = file.path;
      if (!abspath) continue;
      const fpath = path.relative(repopath, abspath);
      markdown.push(
        `### [${fpath}](https://github.com/${ctx.repo.owner}/${ctx.repo.repo}/blob/${GITHUB_SHA}/${fpath})`
      );
      const list: string[] = [];
      for (const report of file.messages) {
        const message: string[] = [];

        // prettify message
        report.message = report.message.replace("~>", "→");

        message.push(`**${report.ruleId}**: ${report.message}`);
        message.push(
          `https://github.com/${ctx.repo.owner}/${ctx.repo.repo}/blob/${GITHUB_SHA}/${fpath}#L${report.location.start.line}-L${report.location.end.line}`
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
