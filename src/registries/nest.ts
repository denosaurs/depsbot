import axios from "axios";
import semver from "semver";

import { Registry, DependencyInfo } from "./types";
import { Dependency } from "../deps";
import {
  Diagnostic,
  NoOutdated,
  NoMalicious,
  NoNotFound,
} from "../diagnostics";

const HOSTNAME = "x.nest.land";
export const reModule = /^\/(\w+)@([\w.]+)\/.*$/;

export interface NestModule {
  name: string;
  owner: string;
  description: string;
  latestVersion?: string;
  latestStableVersion?: string;
  packageUploadNames: string[];
  locked: boolean;
  malicious: boolean;
  unlisted: boolean;
}

async function fetchModule(info: DependencyInfo): Promise<NestModule> {
  const url = `https://x.nest.land/api/package/${info.name}`;
  const response = await axios.get<NestModule>(url);
  return response.data;
}

function computeLatest(mod: NestModule): string {
  function vn(n: string): string {
    return n.split("@")[1];
  }

  let latest: string | undefined;

  if (mod.packageUploadNames.length > 0) {
    const sorted = mod.packageUploadNames.sort((a: string, b: string) => {
      return -semver.compare(vn(a), vn(b));
    });
    latest = vn(sorted[0]);
  }

  if (!latest && mod.latestVersion) {
    latest = vn(mod.latestVersion);
  } else if (!latest && mod.latestStableVersion) {
    latest = vn(mod.latestStableVersion);
  }

  return latest ?? "0.0.0";
}

export const nest: Registry = {
  name: "NEST",
  belongs(dep: Dependency): boolean {
    if (dep.url.hostname !== HOSTNAME) return false;
    return reModule.test(dep.url.pathname);
  },
  info(dep: Dependency): DependencyInfo {
    const match = reModule.exec(dep.url.pathname);
    if (!match) throw new Error(`"${dep.url.href}" is not supported by nest`);
    return {
      name: match[1],
      version: match[2],
    };
  },
  async analyze(dep: Dependency): Promise<Diagnostic[]> {
    const info = nest.info(dep);
    let mod: NestModule;
    try {
      mod = await fetchModule(info);
    } catch (e) {
      return [new NoNotFound(nest, dep)];
    }
    const diagnostics = [];
    const latest = computeLatest(mod);
    if (latest !== info.version) {
      diagnostics.push(new NoOutdated(nest, dep, latest));
    }
    if (mod.malicious) {
      diagnostics.push(new NoMalicious(nest, dep));
    }
    return diagnostics;
  },
};
