"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiFetch = exports.enableMockApi = exports.ENDPOINT = void 0;
const environment_ts_1 = require("../environment.ts");
exports.ENDPOINT = environment_ts_1.envENDPOINT();
// TODO(@qu4k): develop mock api
let MOCK = false;
function enableMockApi() {
    MOCK = true;
}
exports.enableMockApi = enableMockApi;
async function apiFetch(input, init) {
    return await fetch(input, init);
}
exports.apiFetch = apiFetch;
