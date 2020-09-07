"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Diagnostic = void 0;
class Diagnostic {
    constructor(code, registry, dep) {
        this.code = code;
        this.registry = registry;
        this.dep = dep;
        this.info = registry.info(dep);
    }
    position() {
        return {
            start: {
                line: this.dep.loc.start.line,
                column: this.dep.loc.start.column + 1,
            },
            end: {
                line: this.dep.loc.end.line,
                column: this.dep.loc.end.column + 1,
            },
        };
    }
}
exports.Diagnostic = Diagnostic;
