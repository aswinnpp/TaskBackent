import { Router } from "express";
import { container } from "../../infrastructure/container/inversify.config";
import { NotificationController } from "../controllers/NotificationController";
import { asyncHandler } from "../middlewares/asyncHandler";
import { authOptionalMiddleware } from "../middlewares/authOptionalMiddleware";

const router = Router();

if (!container.isBound(NotificationController)) {
  container.bind(NotificationController).toSelf();
}
const controller = container.get(NotificationController);

router.post("/register-token", asyncHandler(authOptionalMiddleware), asyncHandler(controller.registerToken));

export { router as notificationRoutes };

