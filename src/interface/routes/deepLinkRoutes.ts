import { Router } from "express";
import { env } from "../../infrastructure/config/env";

const router = Router();

function buildRedirect(targetPath: string, query: Record<string, unknown>): string {
  const baseRaw = env.mobileDeepLinkBase.trim();
  const base = baseRaw.endsWith("://") ? baseRaw : baseRaw.replace(/\/+$/, "");
  const path = targetPath.replace(/^\/+/, "");
  const joined = base.endsWith("://") ? `${base}${path}` : `${base}/${path}`;
  const u = new URL(joined);
  for (const [k, v] of Object.entries(query || {})) {
    if (v === undefined || v === null) continue;
    u.searchParams.set(k, String(v));
  }
  return u.toString();
}

router.get("/auth/callback", (req, res) => {
  const url = buildRedirect("auth/callback", req.query as Record<string, unknown>);
  return res.redirect(302, url);
});

router.get("/password-reset", (req, res) => {
  const url = buildRedirect("password-reset", req.query as Record<string, unknown>);
  return res.redirect(302, url);
});

router.get("/email-verification", (req, res) => {
  const url = buildRedirect("email-verification", req.query as Record<string, unknown>);
  return res.redirect(302, url);
});

export { router as deepLinkRoutes };

