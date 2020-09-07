"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoMalicious = void 0;
const types_1 = require("./types");
class NoMalicious extends types_1.Diagnostic {
    constructor(registry, dep) {
        super("no-malicious", registry, dep);
    }
    render(file) {
        file.message("no-malicious", this.position(), "no-malicious");
    }
}
exports.NoMalicious = NoMalicious;
