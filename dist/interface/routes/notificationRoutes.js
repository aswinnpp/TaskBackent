"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationRoutes = void 0;
const express_1 = require("express");
const inversify_config_1 = require("../../infrastructure/container/inversify.config");
const NotificationController_1 = require("../controllers/NotificationController");
const asyncHandler_1 = require("../middlewares/asyncHandler");
const authOptionalMiddleware_1 = require("../middlewares/authOptionalMiddleware");
const router = (0, express_1.Router)();
exports.notificationRoutes = router;
if (!inversify_config_1.container.isBound(NotificationController_1.NotificationController)) {
    inversify_config_1.container.bind(NotificationController_1.NotificationController).toSelf();
}
const controller = inversify_config_1.container.get(NotificationController_1.NotificationController);
router.post("/register-token", (0, asyncHandler_1.asyncHandler)(authOptionalMiddleware_1.authOptionalMiddleware), (0, asyncHandler_1.asyncHandler)(controller.registerToken));
