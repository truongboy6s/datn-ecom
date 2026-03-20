import { env } from "./config/env";
import app from "./app";
import { logger } from "./utils/logger";

const port = Number(env.PORT || 4000);

app.listen(port, () => {
  logger.info(`Backend API running at http://localhost:${port}`);
});

