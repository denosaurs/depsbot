"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postPieces = exports.postPublishModule = exports.postResource = void 0;
const common_ts_1 = require("./common.ts");
async function postResource(query, headers, data) {
    // TODO(@qu4k): add test resource
    try {
        const response = await common_ts_1.apiFetch(`${common_ts_1.ENDPOINT}${query}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...headers,
            },
            body: JSON.stringify(data),
        });
        if (!response || !response.ok)
            return undefined;
        const value = await response.json();
        return value;
    }
    catch {
        return undefined;
    }
}
exports.postResource = postResource;
async function postPublishModule(key, module) {
    let response = await postResource("/api/publish", { Authorization: key }, module);
    return response;
}
exports.postPublishModule = postPublishModule;
async function postPieces(uploadToken, pieces) {
    let response = await postResource("/api/piece", { "X-UploadToken": uploadToken }, {
        pieces,
        end: true,
    });
    return response;
}
exports.postPieces = postPieces;
