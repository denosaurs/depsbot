import { nest } from "../src/registries/nest";
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
  const mod = nest.info(d("https://x.nest.land/hatcher@0.8.0/mod.ts"));
  expect(mod).toStrictEqual({
    name: "hatcher",
    version: "0.8.0",
  });
  const std = nest.info(d("https://x.nest.land/std@0.61.0/path/mod.ts"));
  expect(std).toStrictEqual({
    name: "std",
    version: "0.61.0",
  });
});

// test("diagnostics", async () => {
//   const mod = await nest.analyze(d("https://x.nest.land/hatcher@0.8.0/mod.ts"));
//   console.log(mod);
// });
