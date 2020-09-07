"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const x_1 = require("../src/registries/x");
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
    expect(x_1.x.info(d("https://deno.land/x/branch@0.0.1/mod.ts"))).toStrictEqual({
        name: "branch",
        version: "0.0.1",
    });
    expect(x_1.x.info(d("https://deno.land/std@0.67.0/path/mod.ts"))).toStrictEqual({
        name: "std",
        version: "0.67.0",
    });
});
test("diagnostics", async () => {
    const mod = await x_1.x.analyze(d("https://deno.land/x/branch@0.0.1/mod.ts"));
    console.log(mod);
});
