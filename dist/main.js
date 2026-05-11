"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const createServer_1 = require("./infrastructure/http/createServer");
const env_1 = require("./infrastructure/config/env");
const app = (0, createServer_1.createServer)();
app.listen(env_1.env.port, () => {
    console.log(`Auth API server is running on port ${env_1.env.port}`);
});
