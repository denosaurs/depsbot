"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoMalicious = void 0;
const types_1 = require("./types");
class NoMalicious extends types_1.Diagnostic {
    constructor(registry, dep) {
        super("no-malicious", registry, dep);
    }
    render(file) {
        const position = this.position();
        const registry = this.registry.name;
        file.message(`Reported as malicious in the ${registry} registry.`, position, "nmalicious");
    }
}
exports.NoMalicious = NoMalicious;
