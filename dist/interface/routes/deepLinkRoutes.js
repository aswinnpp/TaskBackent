"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deepLinkRoutes = void 0;
const express_1 = require("express");
const env_1 = require("../../infrastructure/config/env");
const router = (0, express_1.Router)();
exports.deepLinkRoutes = router;
function buildRedirect(targetPath, query) {
    const baseRaw = env_1.env.mobileDeepLinkBase.trim();
    const base = baseRaw.endsWith("://") ? baseRaw : baseRaw.replace(/\/+$/, "");
    const path = targetPath.replace(/^\/+/, "");
    const joined = base.endsWith("://") ? `${base}${path}` : `${base}/${path}`;
    const u = new URL(joined);
    for (const [k, v] of Object.entries(query || {})) {
        if (v === undefined || v === null)
            continue;
        u.searchParams.set(k, String(v));
    }
    return u.toString();
}
router.get("/auth/callback", (req, res) => {
    const url = buildRedirect("auth/callback", req.query);
    return res.redirect(302, url);
});
router.get("/password-reset", (req, res) => {
    const url = buildRedirect("password-reset", req.query);
    return res.redirect(302, url);
});
router.get("/email-verification", (req, res) => {
    const url = buildRedirect("email-verification", req.query);
    return res.redirect(302, url);
});
