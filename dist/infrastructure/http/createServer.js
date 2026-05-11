"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServer = createServer;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const authRoutes_1 = require("../../interface/routes/authRoutes");
const notificationRoutes_1 = require("../../interface/routes/notificationRoutes");
const deepLinkRoutes_1 = require("../../interface/routes/deepLinkRoutes");
const errorMiddleware_1 = require("../../interface/middlewares/errorMiddleware");
function createServer() {
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    app.use((0, cors_1.default)({ origin: "*" }));
    app.get("/", (_req, res) => {
        res.send("Auth API is running");
    });
    app.use("/", deepLinkRoutes_1.deepLinkRoutes);
    app.use("/api/auth", authRoutes_1.authRoutes);
    app.use("/api/notifications", notificationRoutes_1.notificationRoutes);
    app.use(errorMiddleware_1.errorMiddleware);
    return app;
}
