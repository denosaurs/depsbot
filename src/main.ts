import * as core from "@actions/core";
import * as github from "@actions/github";

import path from "path";
import vfile from "vfile";
import reporter from "vfile-reporter";
import sort from "vfile-sort";

import { parseProject } from "./deps";
import { Diagnostic } from "./diagnostics";
import { getAllRegistries } from "./registries";

interface Annotation {
  path: string;
  start_line: number;
  end_line: number;
  start_column?: number;
  end_column?: number;
  annotation_level: "notice" | "warning" | "failure";
  message: string;
  title?: string;
  raw_details?: string;
}

async function run(): Promise<void> {
  try {
    const GITHUB_TOKEN = core.getInput("github_token");

    const relpath = path.resolve(core.getInput("path"));
    const repopath = path.resolve(core.getInput("repo_path"));

    const octokit = github.getOctokit(GITHUB_TOKEN);

    if (!GITHUB_TOKEN) {
      throw new Error("GITHUB_TOKEN must be set");
    }

    const dir = path.resolve(relpath);

    const project = await parseProject(dir);

    const registries = getAllRegistries();

    const bigpromises: Promise<vfile.VFile | null>[] = [];

    for (const [fpath, deps] of Object.entries(project)) {
      const promises: Promise<Diagnostic[]>[] = [];
      for (const dep of deps) {
        for (const reg of registries) {
          if (reg.belongs(dep)) {
            promises.push(reg.analyze(dep));
            break;
          }
        }
      }
      bigpromises.push(
        (async (): Promise<vfile.VFile | null> => {
          const result = await Promise.all(promises);
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

    const result = await Promise.all(bigpromises);
    const files = result.filter((_) => _ !== null) as vfile.VFile[];

    const report = reporter(files);
    if (report) core.setFailed(report);

    const ctx = github.context;

    const annotations: Annotation[] = [];
    for (const file of files) {
      const abspath = file.path;
      if (!abspath) continue;
      const fpath = path.relative(repopath, abspath);
      for (const message of file.messages) {
        annotations.push({
          path: fpath,
          start_line: message.location.start.line,
          end_line: message.location.end.line,
          annotation_level: "failure",
          message: message.message,
        });
      }
    }

    if (ctx.payload.pull_request) {
      const pull = ctx.payload.pull_request;
      octokit.issues.createComment({
        ...ctx.repo,
        issue_number: pull.number,
        body: JSON.stringify(annotations),
      });
    }
  } catch (error) {
    core.error(JSON.stringify(error, null, 2));
    core.setFailed(error.message);
    throw error;
  }
}

run();
