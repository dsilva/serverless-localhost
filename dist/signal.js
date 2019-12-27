"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function trap(sig) {
    return new Promise(function (resolve) {
        process.on(sig, function () { return resolve(sig); });
    });
}
function trapAll() {
    return Promise.race([trap('SIGINT'), trap('SIGTERM')]);
}
exports.trapAll = trapAll;
//# sourceMappingURL=signal.js.map