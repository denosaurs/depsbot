"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const nest_1 = require("../src/registries/nest");
function d(url) {
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
    const mod = nest_1.nest.info(d("https://x.nest.land/hatcher@0.8.0/mod.ts"));
    expect(mod).toStrictEqual({
        name: "hatcher",
        version: "0.8.0",
    });
    const std = nest_1.nest.info(d("https://x.nest.land/std@0.61.0/path/mod.ts"));
    expect(std).toStrictEqual({
        name: "std",
        version: "0.61.0",
    });
});
test("diagnostics", async () => {
    const mod = await nest_1.nest.analyze(d("https://x.nest.land/hatcher@0.8.0/mod.ts"));
    console.log(mod);
});
