"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const deps_ts_1 = require("./deps.ts");
deps_ts_1.bench(async function updateCommand(b) {
    b.start();
    const p = await Deno.run({
        cmd: [
            "deno",
            "run",
            "--allow-net",
            "--allow-read",
            "--allow-write",
            "../../../src/main.ts",
            "update",
        ],
        stdout: "null",
    });
    await p.status();
    b.stop();
});
deps_ts_1.runBenchmarks();
