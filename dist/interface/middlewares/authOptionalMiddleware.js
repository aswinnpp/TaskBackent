"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authOptionalMiddleware = authOptionalMiddleware;
const supabaseAdminClient_1 = require("../../infrastructure/database/supabaseAdminClient");
async function authOptionalMiddleware(req, _res, next) {
    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer ")) {
        next();
        return;
    }
    const token = authHeader.replace("Bearer ", "").trim();
    if (!token) {
        next();
        return;
    }
    req.authToken = token;
    try {
        const { data, error } = await supabaseAdminClient_1.supabaseAdminClient.auth.getUser(token);
        if (!error && data?.user?.id) {
            req.userId = data.user.id;
        }
    }
    catch {
        // ignore auth resolution errors (optional auth)
    }
    next();
}
