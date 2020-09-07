"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoOutdated = void 0;
const types_1 = require("./types");
class NoOutdated extends types_1.Diagnostic {
    constructor(registry, dep, latest) {
        super("no-outdated", registry, dep);
        this.latest = latest;
    }
    render(file) {
        file.message("no-outdated", this.position(), "no-outdated");
    }
}
exports.NoOutdated = NoOutdated;
