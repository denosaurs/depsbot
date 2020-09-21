import { relative } from "path";
import * as github from "@actions/github";

import { Report } from "./report";
import { NoOutdated } from "../diagnostics";

export function createMarkdownSummary(
  report: Report,
  repopath: string
): string[] {
  const ctx = github.context;
  const markdown: string[] = [];
  for (const file of report.keys()) {
    const abspath = file.path;
    if (!abspath) continue;
    const fpath = relative(repopath, abspath);
    markdown.push(
      `### [${fpath}](https://github.com/${ctx.repo.owner}/${ctx.repo.repo}/blob/${ctx.sha}/${fpath})`
    );
    const list: string[] = [];
    for (const raw of file.messages) {
      const message: string[] = [];

      // prettify message
      raw.message = raw.message.replace("~>", "→");

      message.push(`**${raw.ruleId}**: ${raw.message}`);
      message.push(
        `https://github.com/${ctx.repo.owner}/${ctx.repo.repo}/blob/${ctx.sha}/${fpath}#L${raw.location.start.line}-L${raw.location.end.line}`
      );
      list.push(`- ${message.join("\n")}`);
    }
    markdown.push(list.join("\n"));
  }
  return markdown;
}

interface Comment {
  path: string;
  position: number;
  body: string;
}

export function createComments(report: Report, repopath: string): Comment[] {
  const comments: Comment[] = [];
  for (const [file, diagnostics] of report.entries()) {
    const abspath = file.path;
    if (!abspath) continue;
    const path = relative(repopath, abspath);
    for (const diagnostic of diagnostics) {
      if (!(diagnostic instanceof NoOutdated)) continue;
      const correct = diagnostic.dep.url.href.replace(
        diagnostic.info.version,
        diagnostic.latest
      );
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
