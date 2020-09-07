"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_deps_ts_1 = require("../test_deps.ts");
const module_ts_1 = require("./module.ts");
Deno.test({
    name: "internal | module | versioning",
    fn() {
        const eggs = new module_ts_1.Module({
            name: "eggs",
            owner: "nest-land",
            description: "The CLI used to publish and update packages in nest.land.",
            latestVersion: undefined,
            latestStableVersion: "eggs@0.1.8",
            packageUploadNames: ["eggs@0.1.7", "eggs@0.1.8", "eggs@0.1.9-rc1"],
        });
        const maze_generator = new module_ts_1.Module({
            name: "maze_generator",
            owner: "TheWizardBear",
            description: "A module for generating mazes",
            latestVersion: "maze_generator@0.1.0-alpha.0",
            latestStableVersion: undefined,
            packageUploadNames: [
                "maze_generator@0.0.8",
                "maze_generator@0.1.0-alpha.0",
            ],
        });
        test_deps_ts_1.assertEquals(eggs.getLatestVersion(), "0.1.9-rc1");
        test_deps_ts_1.assertEquals(maze_generator.getLatestVersion(), "0.1.0-alpha.0");
    },
});
