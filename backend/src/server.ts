import { env } from "./config/env";
import app from "./app";
import { logger } from "./utils/logger";
import { OrderService } from "./services/order.service";

const port = Number(env.PORT || 4000);

app.listen(port, () => {
  logger.info(`Backend API running at http://localhost:${port}`);

  if (process.env.NODE_ENV !== "test") {
    setInterval(async () => {
      try {
        await OrderService.autoCancelExpiredOrders();
      } catch (err) {
        logger.error("Auto cancel worker error: " + err);
      }
    }, 60000);
  }
});

