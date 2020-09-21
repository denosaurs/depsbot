#!/usr/bin/env node
/* eslint-disable no-console */

import reporter from "vfile-reporter";

import { parseProject } from "../deps";

import { allRegistries } from "../registries";
import { compileReport } from "../runtime/report";

(async () => {
  const registries = allRegistries();
  const project = await parseProject(process.cwd());

  const report = await compileReport(project, registries);
  const string = reporter(Array.from(report.keys()));
  if (string) console.error(string);
})();
