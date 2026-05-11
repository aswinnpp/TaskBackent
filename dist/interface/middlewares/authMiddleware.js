"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const ApiResponse_1 = require("../presenters/ApiResponse");
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer ")) {
        res
            .status(401)
            .json(ApiResponse_1.ApiResponse.error("Authorization token missing or invalid", { code: "UNAUTHORIZED" }));
        return;
    }
    const token = authHeader.replace("Bearer ", "").trim();
    if (!token) {
        res
            .status(401)
            .json(ApiResponse_1.ApiResponse.error("Authorization token missing or invalid", { code: "UNAUTHORIZED" }));
        return;
    }
    req.authToken = token;
    next();
}
