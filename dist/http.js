"use strict";
//type Method = "get" | "post" | "put" | "delete" | "patch" | "any";
Object.defineProperty(exports, "__esModule", { value: true });
function isHttpEvent(config) {
    return config['http'] !== undefined;
}
exports.isHttpEvent = isHttpEvent;
function translateMethod(method) {
    var lowercased = method.toLowerCase();
    return 'any' === lowercased ? 'all' : lowercased;
}
exports.translateMethod = translateMethod;
function translatePath(apiGatewayPath) {
    return apiGatewayPath.replace(/{proxy\+}/g, '*').replace(/{([^}]+)}/g, ':$1');
}
exports.translatePath = translatePath;
//# sourceMappingURL=http.js.map