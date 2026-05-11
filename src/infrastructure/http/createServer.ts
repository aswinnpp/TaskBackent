import express from "express";
import cors from "cors";
import { authRoutes } from "../../interface/routes/authRoutes";
import { notificationRoutes } from "../../interface/routes/notificationRoutes";
import { deepLinkRoutes } from "../../interface/routes/deepLinkRoutes";
import { errorMiddleware } from "../../interface/middlewares/errorMiddleware";

export function createServer() {
  const app = express();
  app.use(express.json());
  app.use(cors({ origin: "*" }));

  app.get("/", (_req, res) => {
    res.send("Auth API is running");
  });

  app.use("/", deepLinkRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/notifications", notificationRoutes);
  app.use(errorMiddleware);
  return app;
}

