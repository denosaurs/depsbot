#!/usr/bin/env node
"use strict";
/* eslint-disable no-console */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vfile_reporter_1 = __importDefault(require("vfile-reporter"));
const deps_1 = require("../deps");
const registries_1 = require("../registries");
const report_1 = require("../runtime/report");
(async () => {
    const registries = registries_1.allRegistries();
    const project = await deps_1.parseProject(process.cwd());
    const report = await report_1.compileReport(project, registries);
    const string = vfile_reporter_1.default(Array.from(report.keys()));
    if (string)
        console.error(string);
})();
