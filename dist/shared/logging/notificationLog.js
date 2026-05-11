"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationLog = notificationLog;
function notificationLog(scope, level, details) {
    const line = `[NOTIFICATION][${scope}][${level}]`;
    if (level === "ERROR") {
        console.error(line, details);
        return;
    }
    if (level === "WARN") {
        console.warn(line, details);
        return;
    }
    console.log(line, details);
}
