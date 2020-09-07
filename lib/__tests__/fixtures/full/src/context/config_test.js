"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_deps_ts_1 = require("../../test_deps.ts");
const config_ts_1 = require("./config.ts");
Deno.test({
    name: "internal | config | file matching",
    fn() {
        test_deps_ts_1.assertEquals(config_ts_1.configFormat("eggs.yml"), config_ts_1.ConfigFormat.YAML);
        test_deps_ts_1.assertEquals(config_ts_1.configFormat("eggs.yaml"), config_ts_1.ConfigFormat.YAML);
        test_deps_ts_1.assertEquals(config_ts_1.configFormat("eggs.json"), config_ts_1.ConfigFormat.JSON);
        test_deps_ts_1.assertEquals(config_ts_1.configFormat("eggs.js"), config_ts_1.ConfigFormat.JSON); // because of fallback
    },
});
