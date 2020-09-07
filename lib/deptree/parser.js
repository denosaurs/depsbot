"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseModule = void 0;
const typescript_estree_1 = require("@typescript-eslint/typescript-estree");
function parseModule(path, source) {
    const options = {
        comment: false,
        jsx: true,
    };
    const imports = [];
    const program = typescript_estree_1.parse(source, options);
    typescript_estree_1.simpleTraverse(program, {
        enter(node) {
            switch (node.type) {
                case typescript_estree_1.AST_NODE_TYPES.ImportDeclaration:
                    imports.push(String(node.source.value));
                    break;
                case typescript_estree_1.AST_NODE_TYPES.ExportAllDeclaration:
                    if (node.source && node.source.type === "Literal") {
                        imports.push(String(node.source.value));
                    }
                    break;
                case typescript_estree_1.AST_NODE_TYPES.ExportNamedDeclaration:
                    if (node.source && node.source.type === "Literal") {
                        imports.push(String(node.source.value));
                    }
                    break;
            }
        },
    });
    return {
        path,
        imports,
    };
}
exports.parseModule = parseModule;
