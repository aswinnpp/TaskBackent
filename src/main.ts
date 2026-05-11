import "reflect-metadata";
import { createServer } from "./infrastructure/http/createServer";
import { env } from "./infrastructure/config/env";

const app = createServer();

app.listen(env.port, () => {
  console.log(`Auth API server is running on port ${env.port}`);
});

