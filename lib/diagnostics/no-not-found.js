"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoNotFound = void 0;
const types_1 = require("./types");
class NoNotFound extends types_1.Diagnostic {
    constructor(registry, dep) {
        super("no-not-found", registry, dep);
    }
    render(file) {
        const position = this.position();
        const registry = this.registry.name;
        file.message(`Not found in the ${registry} registry.`, position, "not-found");
    }
}
exports.NoNotFound = NoNotFound;
