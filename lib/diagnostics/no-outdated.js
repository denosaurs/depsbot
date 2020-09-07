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
        const i = this.info;
        const latest = this.latest;
        const position = this.position();
        file.message(`${i.name}@${i.version} ~> ${i.name}@${latest}`, position, "outdated");
    }
}
exports.NoOutdated = NoOutdated;
