"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = errorMiddleware;
const DomainError_1 = require("../../domain/errors/DomainError");
const AppError_1 = require("../../application/services/AppError");
const ApiResponse_1 = require("../presenters/ApiResponse");
const authDebug_1 = require("../../shared/logging/authDebug");
function errorMiddleware(error, _req, res, _next) {
    if (error instanceof AppError_1.AppError) {
        (0, authDebug_1.authLog)("APP ERROR", "WARN", {
            statusCode: error.statusCode,
            message: error.message,
            details: error.details || null,
            at: new Date().toISOString(),
        });
        res.status(error.statusCode).json(ApiResponse_1.ApiResponse.error(error.message, error.details || {}));
        return;
    }
    if (error instanceof DomainError_1.DomainError) {
        (0, authDebug_1.authLog)("DOMAIN ERROR", "WARN", {
            name: error.name,
            message: error.message,
            at: new Date().toISOString(),
        });
        res.status(400).json(ApiResponse_1.ApiResponse.error(error.message, { code: error.name }));
        return;
    }
    (0, authDebug_1.authLog)("UNHANDLED ERROR", "ERROR", {
        message: error?.message || "Unknown error",
        stack: error?.stack || null,
        at: new Date().toISOString(),
    });
    res.status(500).json(ApiResponse_1.ApiResponse.error("Internal server error", { code: "INTERNAL_SERVER_ERROR" }));
}
