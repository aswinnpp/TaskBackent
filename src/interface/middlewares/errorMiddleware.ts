import { NextFunction, Request, Response } from "express";
import { DomainError } from "../../domain/errors/DomainError";
import { AppError } from "../../application/services/AppError";
import { ApiResponse } from "../presenters/ApiResponse";
import { authLog } from "../../shared/logging/authDebug";

export function errorMiddleware(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (error instanceof AppError) {
    authLog("APP ERROR", "WARN", {
      statusCode: error.statusCode,
      message: error.message,
      details: error.details || null,
      at: new Date().toISOString(),
    });
    res.status(error.statusCode).json(ApiResponse.error(error.message, error.details || {}));
    return;
  }

  if (error instanceof DomainError) {
    authLog("DOMAIN ERROR", "WARN", {
      name: error.name,
      message: error.message,
      at: new Date().toISOString(),
    });
    res.status(400).json(ApiResponse.error(error.message, { code: error.name }));
    return;
  }

  authLog("UNHANDLED ERROR", "ERROR", {
    message: (error as Error)?.message || "Unknown error",
    stack: (error as Error)?.stack || null,
    at: new Date().toISOString(),
  });
  res.status(500).json(ApiResponse.error("Internal server error", { code: "INTERNAL_SERVER_ERROR" }));
}

