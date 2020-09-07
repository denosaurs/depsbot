"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.envENDPOINT = exports.envHOMEDIR = void 0;
function envHOMEDIR() {
    var _a, _b, _c;
    return ((_c = (_b = (_a = Deno.env.get("HOME")) !== null && _a !== void 0 ? _a : Deno.env.get("HOMEPATH")) !== null && _b !== void 0 ? _b : Deno.env.get("USERPROFILE")) !== null && _c !== void 0 ? _c : "/");
}
exports.envHOMEDIR = envHOMEDIR;
function envENDPOINT() {
    var _a;
    return (_a = Deno.env.get("EGGS_ENDPOINT")) !== null && _a !== void 0 ? _a : "https://x.nest.land";
}
exports.envENDPOINT = envENDPOINT;
