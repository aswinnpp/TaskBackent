import { NextFunction, Request, Response } from "express";
import { ApiResponse } from "../presenters/ApiResponse";

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) {
    res
      .status(401)
      .json(ApiResponse.error("Authorization token missing or invalid", { code: "UNAUTHORIZED" }));
    return;
  }

  const token = authHeader.replace("Bearer ", "").trim();
  if (!token) {
    res
      .status(401)
      .json(ApiResponse.error("Authorization token missing or invalid", { code: "UNAUTHORIZED" }));
    return;
  }

  (req as Request & { authToken?: string }).authToken = token;
  next();
}

