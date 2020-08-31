import { Registry, DependencyInfo } from "./types";
import { Dependency } from "../deps";
import { Diagnostic, NoNotFound, NoOutdated } from "../diagnostics";
import axios from "axios";

const HOSTNAME = "deno.land";
export const reModule = /^\/(?:x\/)?(\w+)@([\w.]+)\/.*$/;

export interface VersionInfo {
  latest: string;
  versions: string[];
  isLegacy: true;
}

async function fetchVersionInfo(info: DependencyInfo): Promise<VersionInfo> {
  const url = `https://cdn.deno.land/${info.name}/meta/versions.json`;
  const response = await axios.get(url);
  return response.data;
}

export const x: Registry = {
  name: "X",
  belongs(dep: Dependency): boolean {
    if (dep.url.hostname !== HOSTNAME) return false;
    return reModule.test(dep.url.pathname);
  },
  info(dep: Dependency): DependencyInfo {
    const match = reModule.exec(dep.url.pathname);
    if (!match) throw new Error(`"${dep.url.href}" is not supported by x`);
    return {
      name: match[1],
      version: match[2],
    };
  },
  async analyze(dep: Dependency): Promise<Diagnostic[]> {
    const info = x.info(dep);
    let mod: VersionInfo;
    try {
      mod = await fetchVersionInfo(info);
    } catch (e) {
      return [new NoNotFound(x, dep)];
    }
    const diagnostics = [];
    const { latest } = mod;
    if (latest !== info.version) {
      diagnostics.push(new NoOutdated(x, dep, latest));
    }
    return diagnostics;
  },
};
