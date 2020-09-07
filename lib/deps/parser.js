"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseModule = exports.parseSource = void 0;
const typescript_estree_1 = require("@typescript-eslint/typescript-estree");
function parseSource(path, source) {
    const value = String(source.value);
    try {
        const url = new URL(value);
        return {
            url,
            path,
            loc: source.loc,
        };
    }
    catch {
        return null;
    }
}
exports.parseSource = parseSource;
function parseModule(path, source) {
    const options = {
        comment: true,
        loc: true,
        jsx: true,
    };
    const imports = [];
    const program = typescript_estree_1.parse(source, options);
    const ignored = [];
    if (program.comments) {
        for (const comment of program.comments) {
            if (comment.value.trim() === "depsbot-ignore-file") {
                return [];
            }
            else if (comment.value.trim() === "depsbot-ignore") {
                ignored.push(comment.loc.end.line + 1);
            }
        }
    }
    typescript_estree_1.simpleTraverse(program, {
        enter(node) {
            switch (node.type) {
                case typescript_estree_1.AST_NODE_TYPES.ImportDeclaration: {
                    if (ignored.includes(node.loc.start.line))
                        return;
                    const dep = parseSource(path, node.source);
                    if (dep)
                        imports.push(dep);
                    break;
                }
                case typescript_estree_1.AST_NODE_TYPES.ExportNamedDeclaration:
                case typescript_estree_1.AST_NODE_TYPES.ExportAllDeclaration: {
                    if (ignored.includes(node.loc.start.line))
                        return;
                    if (node.source && node.source.type === "Literal") {
                        const dep = parseSource(path, node.source);
                        if (dep)
                            imports.push(dep);
                    }
                    break;
                }
            }
        },
    });
    return imports;
}
exports.parseModule = parseModule;
