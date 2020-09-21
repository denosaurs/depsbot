import { x } from "../src/registries/x";
import { Dependency } from "../src/deps";

function d(url: string): Dependency {
  return {
    path: "",
    loc: {
      start: { column: 0, line: 0 },
      end: { column: 0, line: 0 },
    },
    url: new URL(url),
  };
}

test("regex", async () => {
  expect(x.info(d("https://deno.land/x/branch@0.0.1/mod.ts"))).toStrictEqual({
    name: "branch",
    version: "0.0.1",
  });
  expect(x.info(d("https://deno.land/std@0.67.0/path/mod.ts"))).toStrictEqual({
    name: "std",
    version: "0.67.0",
  });
});

// test("diagnostics", async () => {
//   const mod = await x.analyze(d("https://deno.land/x/branch@0.0.1/mod.ts"));
//   console.log(mod);
// });
