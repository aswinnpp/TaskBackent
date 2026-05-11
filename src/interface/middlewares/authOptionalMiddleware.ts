import { NextFunction, Request, Response } from "express";
import { supabaseAdminClient } from "../../infrastructure/database/supabaseAdminClient";

export async function authOptionalMiddleware(req: Request, _res: Response, next: NextFunction): Promise<void> {
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

  (req as Request & { authToken?: string }).authToken = token;

  try {
    const { data, error } = await supabaseAdminClient.auth.getUser(token);
    if (!error && data?.user?.id) {
      (req as Request & { userId?: string }).userId = data.user.id;
    }
  } catch {
    // ignore auth resolution errors (optional auth)
  }

  next();
}

