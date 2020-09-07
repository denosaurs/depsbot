"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Module = void 0;
const deps_ts_1 = require("../deps.ts");
class Module {
    constructor(module) {
        this.name = module.name;
        this.owner = module.owner;
        this.description = module.description;
        this.latestVersion = module.latestVersion;
        this.latestStableVersion = module.latestStableVersion;
        this.packageUploadNames = module.packageUploadNames;
    }
    getLatestVersion() {
        function vn(n) {
            return n.split("@")[1];
        }
        let latest;
        if (this.packageUploadNames.length > 0) {
            function cmp(a, b) {
                return -deps_ts_1.semver.compare(vn(a), vn(b));
            }
            const sorted = this.packageUploadNames.sort(cmp);
            latest = vn(sorted[0]);
        }
        if (!latest && this.latestVersion) {
            latest = vn(this.latestVersion);
        }
        else if (!latest && this.latestStableVersion) {
            latest = vn(this.latestStableVersion);
        }
        return latest !== null && latest !== void 0 ? latest : "0.0.0";
    }
}
exports.Module = Module;
