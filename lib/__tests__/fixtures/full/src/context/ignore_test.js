"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_deps_ts_1 = require("../../test_deps.ts");
const ignore_ts_1 = require("./ignore.ts");
Deno.test({
    name: "internal | ignore | parsing",
    fn() {
        let matched = ignore_ts_1.parseIgnore(`
.git/*
test/*
!test/should_keep_this.ts
# this is a comment
    # this is a comment, just a bit indented
    `);
        if (Deno.build.os === "windows") {
            test_deps_ts_1.assertEquals(matched.denies, [
                /^\.git(?:\\|\/)(?:[^\\/]*)$/,
                /^test(?:\\|\/)(?:[^\\/]*)$/,
            ]);
            test_deps_ts_1.assertEquals(matched.accepts, [/^test(?:\\|\/)should_keep_this\.ts$/]);
        }
        else {
            test_deps_ts_1.assertEquals(matched.denies, [
                /^\.git\/(?:[^//]*)$/,
                /^test\/(?:[^//]*)$/,
            ]);
            test_deps_ts_1.assertEquals(matched.accepts, [/^test\/should_keep_this\.ts$/]);
        }
    },
});
