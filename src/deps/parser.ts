import {
  parse,
  TSESTreeOptions,
  TSESTree,
  AST_NODE_TYPES,
  simpleTraverse,
} from "@typescript-eslint/typescript-estree";

export interface LineAndColumnData {
  line: number;
  column: number;
}
export interface SourceLocation {
  start: LineAndColumnData;
  end: LineAndColumnData;
}

export interface Dependency {
  url: URL;
  path: string;
  loc: SourceLocation;
}

export function parseSource(
  path: string,
  source: TSESTree.Literal
): Dependency | null {
  const value = String(source.value);
  try {
    const url = new URL(value);
    return {
      url,
      path,
      loc: source.loc,
    };
  } catch {
    return null;
  }
}

export function parseModule(path: string, source: string): Dependency[] {
  const options: TSESTreeOptions = {
    comment: true,
    loc: true,
    jsx: true,
  };

  const imports: Dependency[] = [];

  const program = parse(source, options);

  const ignored: number[] = [];
  if (program.comments) {
    for (const comment of program.comments) {
      if (comment.value.trim() === "depsbot-ignore-file") {
        return [];
      } else if (comment.value.trim() === "depsbot-ignore") {
        ignored.push(comment.loc.end.line + 1);
      }
    }
  }

  simpleTraverse(program, {
    enter(node: TSESTree.Node) {
      switch (node.type) {
        case AST_NODE_TYPES.ImportDeclaration: {
          if (ignored.includes(node.loc.start.line)) return;
          const dep = parseSource(path, node.source);
          if (dep) imports.push(dep);
          break;
        }
        case AST_NODE_TYPES.ExportNamedDeclaration:
        case AST_NODE_TYPES.ExportAllDeclaration: {
          if (ignored.includes(node.loc.start.line)) return;
          if (node.source && node.source.type === "Literal") {
            const dep = parseSource(path, node.source);
            if (dep) imports.push(dep);
          }
          break;
        }
      }
    },
  });

  return imports;
}
